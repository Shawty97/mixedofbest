"""
Agent Service for Universal Agent Platform
Manages voice agents, their lifecycle, and configurations
"""
import asyncio
import uuid
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from .ai_service import ai_service
from .voice_service import voice_service
from .livekit_service import livekit_service
from .session_service import session_service
from repositories.mongodb_repository import mongodb_repository

logger = logging.getLogger(__name__)

class VoiceAgent:
    """Voice Agent class representing an AI voice agent"""
    
    def __init__(
        self, 
        agent_id: str,
        agent_type: str,
        name: str,
        config: Dict[str, Any]
    ):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.name = name
        self.config = config
        self.created_at = datetime.utcnow()
        self.status = "created"
        self.current_room = None
        self.ai_session_id = None
        self.conversation_count = 0
        self.last_activity = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert agent to dictionary"""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "name": self.name,
            "config": self.config,
            "created_at": self.created_at.isoformat(),
            "status": self.status,
            "current_room": self.current_room,
            "conversation_count": self.conversation_count,
            "last_activity": self.last_activity.isoformat()
        }

class AgentService:
    """Service for managing voice agents"""
    
    def __init__(self):
        self.active_agents: Dict[str, VoiceAgent] = {}
        self.agent_templates = {
            "customer_service": {
                "name": "Customer Service Agent",
                "description": "Handles customer inquiries and support requests",
                "voice_profile": "customer_service",
                "llm_model": "gpt-4o",
                "personality": "professional, helpful, empathetic",
                "capabilities": ["chat", "voice", "knowledge_base"],
                "response_style": "concise and actionable"
            },
            "sales_assistant": {
                "name": "Sales Assistant",
                "description": "Engages prospects and qualifies leads",
                "voice_profile": "professional_female",
                "llm_model": "gpt-4o",
                "personality": "enthusiastic, persuasive, knowledgeable",
                "capabilities": ["chat", "voice", "lead_qualification"],
                "response_style": "engaging and solution-focused"
            },
            "interview_assistant": {
                "name": "Interview Assistant",
                "description": "Conducts professional interviews and assessments",
                "voice_profile": "friendly_female",
                "llm_model": "gpt-4o",
                "personality": "warm, encouraging, professional",
                "capabilities": ["chat", "voice", "interview_flow"],
                "response_style": "conversational and supportive"
            },
            "technical_expert": {
                "name": "Technical Expert",
                "description": "Provides technical guidance and troubleshooting",
                "voice_profile": "technical_expert",
                "llm_model": "gpt-4o",
                "personality": "knowledgeable, patient, detail-oriented",
                "capabilities": ["chat", "voice", "code_analysis", "troubleshooting"],
                "response_style": "detailed and instructional"
            }
        }
    
    async def create_agent(
        self, 
        agent_type: str,
        name: Optional[str] = None,
        custom_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new voice agent"""
        
        if agent_type not in self.agent_templates:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        agent_id = f"agent_{agent_type}_{uuid.uuid4().hex[:8]}"
        template = self.agent_templates[agent_type].copy()
        if custom_config:
            template.update(custom_config)
        if not name:
            name = f"{template['name']} {agent_id[-8:]}"
        try:
            ai_session_id = await ai_service.create_agent_chat(
                agent_id=agent_id,
                agent_type=agent_type,
                model=template.get("llm_model", "gpt-4o")
            )
            agent = VoiceAgent(
                agent_id=agent_id,
                agent_type=agent_type,
                name=name,
                config=template
            )
            agent.ai_session_id = ai_session_id
            agent.status = "ready"
            self.active_agents[agent_id] = agent
            
            # Save to MongoDB
            await mongodb_repository.create_agent({
                "agent_id": agent_id,
                "agent_type": agent_type,
                "name": name,
                "config": template,
                "ai_session_id": ai_session_id,
                "status": "ready",
                "created_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "conversation_count": 0
            })
            
            logger.info(f"Created voice agent: {agent_id} ({agent_type})")
            return agent_id
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise
    
    async def deploy_agent_to_room(self, agent_id: str, room_name: str) -> bool:
        """Deploy an agent to a LiveKit room"""
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        agent = self.active_agents[agent_id]
        try:
            _ = await livekit_service.generate_token(
                room_name=room_name,
                participant_name=f"agent_{agent.name}",
                permissions={"can_publish": True, "can_subscribe": True}
            )
            agent.current_room = room_name
            agent.status = "deployed"
            agent.last_activity = datetime.utcnow()
            logger.info(f"Deployed agent {agent_id} to room {room_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to deploy agent {agent_id}: {e}")
            return False
    
    async def process_user_message(self, agent_id: str, message: str, user_id: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Process user message through the agent with resilient audio fallback and transcript logging"""
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        agent = self.active_agents[agent_id]
        try:
            # Ensure a session exists and log the user message
            sess_id = await session_service.ensure_session(session_id=session_id, agent_id=agent_id, user_id=user_id)
            await session_service.add_message(sess_id, role="user", content={"text": message})

            # AI response
            ai_response = await ai_service.send_message(session_id=agent.ai_session_id, message=message)

            # TTS generation (may result in None)
            voice_profile = agent.config.get("voice_profile", "professional_female")
            audio_base64: Optional[str] = None
            audio_generated = False
            provider_used: Optional[str] = None
            try:
                audio_base64 = await voice_service.text_to_speech(text=ai_response, voice_profile=voice_profile)
                audio_generated = audio_base64 is not None
                provider_used = voice_service.last_provider if audio_generated else None
            except Exception as tts_err:
                logger.warning(f"TTS failed for agent {agent_id}, continuing with text-only: {tts_err}")
                audio_base64 = None
                audio_generated = False
                provider_used = None

            # Log agent message
            await session_service.add_message(sess_id, role="agent", content={
                "text_response": ai_response,
                "audio_generated": audio_generated,
                "provider_used": provider_used,
            })

            # Update agent activity
            agent.conversation_count += 1
            agent.last_activity = datetime.utcnow()

            return {
                "text_response": ai_response,
                "audio_response": audio_base64,
                "audio_generated": audio_generated,
                "provider_used": provider_used,
                "agent_id": agent_id,
                "agent_name": agent.name,
                "session_id": sess_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to process message for agent {agent_id}: {e}")
            raise
    
    async def process_voice_message(self, agent_id: str, audio_data: bytes, language: str = "en-US", user_id: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Process voice message through the agent"""
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        try:
            stt_result = await voice_service.speech_to_text(audio_data=audio_data, language=language)
            if not stt_result.get("success", False):
                return {"error": "Speech recognition failed", "details": stt_result.get("error", "Unknown error")}
            response = await self.process_user_message(agent_id=agent_id, message=stt_result["text"], user_id=user_id, session_id=session_id)
            response["transcription"] = stt_result["text"]
            response["transcription_confidence"] = stt_result.get("confidence", 0.0)
            return response
        except Exception as e:
            logger.error(f"Failed to process voice message for agent {agent_id}: {e}")
            raise
    
    async def remove_agent(self, agent_id: str) -> bool:
        if agent_id not in self.active_agents:
            return False
        agent = self.active_agents[agent_id]
        try:
            if agent.ai_session_id:
                await ai_service.end_session(agent.ai_session_id)
            del self.active_agents[agent_id]
            logger.info(f"Removed agent: {agent_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove agent {agent_id}: {e}")
            return False
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        if agent_id in self.active_agents:
            return self.active_agents[agent_id].to_dict()
        return None
    
    def get_all_agents(self) -> List[Dict[str, Any]]:
        return [agent.to_dict() for agent in self.active_agents.values()]
    
    def get_agent_templates(self) -> Dict[str, Any]:
        return self.agent_templates.copy()
    
    def get_agents_by_room(self, room_name: str) -> List[Dict[str, Any]]:
        return [agent.to_dict() for agent in self.active_agents.values() if agent.current_room == room_name]

# Global agent service instance
agent_service = AgentService()