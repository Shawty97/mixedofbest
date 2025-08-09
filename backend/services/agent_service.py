"""
Agent Service for Universal Agent Platform
Manages voice agents, their lifecycle, and configurations
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
from .ai_service import ai_service
from .voice_service import voice_service
from .livekit_service import livekit_service

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
        
        # Generate agent ID
        agent_id = f"agent_{agent_type}_{uuid.uuid4().hex[:8]}"
        
        # Get template and merge with custom config
        template = self.agent_templates[agent_type].copy()
        if custom_config:
            template.update(custom_config)
        
        # Set agent name
        if not name:
            name = f"{template['name']} {agent_id[-8:]}"
        
        try:
            # Create AI chat session
            ai_session_id = await ai_service.create_agent_chat(
                agent_id=agent_id,
                agent_type=agent_type,
                model=template.get("llm_model", "gpt-4o")
            )
            
            # Create agent instance
            agent = VoiceAgent(
                agent_id=agent_id,
                agent_type=agent_type,
                name=name,
                config=template
            )
            
            agent.ai_session_id = ai_session_id
            agent.status = "ready"
            
            # Store agent
            self.active_agents[agent_id] = agent
            
            logger.info(f"Created voice agent: {agent_id} ({agent_type})")
            return agent_id
            
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise
    
    async def deploy_agent_to_room(
        self, 
        agent_id: str, 
        room_name: str
    ) -> bool:
        """Deploy an agent to a LiveKit room"""
        
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        agent = self.active_agents[agent_id]
        
        try:
            # Generate LiveKit token for the agent
            token = await livekit_service.generate_token(
                room_name=room_name,
                participant_name=f"agent_{agent.name}",
                permissions={"can_publish": True, "can_subscribe": True}
            )
            
            # Update agent status
            agent.current_room = room_name
            agent.status = "deployed"
            agent.last_activity = datetime.utcnow()
            
            logger.info(f"Deployed agent {agent_id} to room {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to deploy agent {agent_id}: {e}")
            return False
    
    async def process_user_message(
        self, 
        agent_id: str,
        message: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process user message through the agent with resilient audio fallback"""
        
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        agent = self.active_agents[agent_id]
        
        try:
            # Get AI response
            ai_response = await ai_service.send_message(
                session_id=agent.ai_session_id,
                message=message
            )
            
            # Try to generate voice response (ElevenLabs -&gt; Azure -&gt; None)
            voice_profile = agent.config.get("voice_profile", "professional_female")
            audio_base64: Optional[str] = None
            audio_generated = False
            try:
                audio_base64 = await voice_service.text_to_speech(
                    text=ai_response,
                    voice_profile=voice_profile
                )
                audio_generated = audio_base64 is not None
            except Exception as tts_err:
                logger.warning(f"TTS failed for agent {agent_id}, continuing with text-only: {tts_err}")
                audio_base64 = None
                audio_generated = False
            
            # Update agent activity
            agent.conversation_count += 1
            agent.last_activity = datetime.utcnow()
            
            return {
                "text_response": ai_response,
                "audio_response": audio_base64,
                "audio_generated": audio_generated,
                "agent_id": agent_id,
                "agent_name": agent.name,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to process message for agent {agent_id}: {e}")
            raise
    
    async def process_voice_message(
        self, 
        agent_id: str,
        audio_data: bytes,
        language: str = "en-US"
    ) -> Dict[str, Any]:
        """Process voice message through the agent"""
        
        if agent_id not in self.active_agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        try:
            # Convert speech to text
            stt_result = await voice_service.speech_to_text(
                audio_data=audio_data,
                language=language
            )
            
            if not stt_result.get("success", False):
                return {
                    "error": "Speech recognition failed",
                    "details": stt_result.get("error", "Unknown error")
                }
            
            # Process the transcribed text
            response = await self.process_user_message(
                agent_id=agent_id,
                message=stt_result["text"]
            )
            
            # Add STT information
            response["transcription"] = stt_result["text"]
            response["transcription_confidence"] = stt_result.get("confidence", 0.0)
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to process voice message for agent {agent_id}: {e}")
            raise
    
    async def remove_agent(self, agent_id: str) -> bool:
        """Remove an agent and clean up resources"""
        
        if agent_id not in self.active_agents:
            return False
        
        agent = self.active_agents[agent_id]
        
        try:
            # End AI session
            if agent.ai_session_id:
                await ai_service.end_session(agent.ai_session_id)
            
            # Remove from active agents
            del self.active_agents[agent_id]
            
            logger.info(f"Removed agent: {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove agent {agent_id}: {e}")
            return False
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent information"""
        if agent_id in self.active_agents:
            return self.active_agents[agent_id].to_dict()
        return None
    
    def get_all_agents(self) -> List[Dict[str, Any]]:
        """Get all active agents"""
        return [agent.to_dict() for agent in self.active_agents.values()]
    
    def get_agent_templates(self) -> Dict[str, Any]:
        """Get available agent templates"""
        return self.agent_templates.copy()
    
    def get_agents_by_room(self, room_name: str) -> List[Dict[str, Any]]:
        """Get agents deployed to a specific room"""
        return [
            agent.to_dict() 
            for agent in self.active_agents.values() 
            if agent.current_room == room_name
        ]

# Global agent service instance
agent_service = AgentService()