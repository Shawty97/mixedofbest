"""
AI Service Integration for Universal Agent Platform
Handles LLM interactions using emergentintegrations
"""
import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid

logger = logging.getLogger(__name__)

class AIService:
    """Core AI service for managing LLM interactions"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.active_chats: Dict[str, LlmChat] = {}
        
        if not self.openai_api_key:
            logger.warning("OpenAI API key not found. AI features will be limited.")
    
    async def create_agent_chat(
        self, 
        agent_id: str,
        agent_type: str = "customer_service",
        model: str = "gpt-4o",
        system_message: str = None
    ) -> str:
        """Create a new chat session for an agent"""
        
        if not system_message:
            system_message = self._get_system_message(agent_type)
        
        session_id = f"{agent_id}_{uuid.uuid4().hex[:8]}"
        
        try:
            chat = LlmChat(
                api_key=self.openai_api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", model).with_max_tokens(4096)
            
            self.active_chats[session_id] = chat
            logger.info(f"Created AI chat session: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create AI chat session: {e}")
            raise
    
    async def send_message(
        self, 
        session_id: str, 
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Send message to AI agent and get response"""
        
        if session_id not in self.active_chats:
            raise ValueError(f"Chat session {session_id} not found")
        
        chat = self.active_chats[session_id]
        
        try:
            # Create user message with context if provided
            user_message = UserMessage(text=message)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            logger.info(f"AI response received for session {session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Failed to get AI response: {e}")
            raise
    
    async def end_session(self, session_id: str) -> None:
        """End an AI chat session and clean up resources"""
        if session_id in self.active_chats:
            del self.active_chats[session_id]
            logger.info(f"Ended AI chat session: {session_id}")
    
    def _get_system_message(self, agent_type: str) -> str:
        """Get system message based on agent type"""
        system_messages = {
            "customer_service": """You are an expert customer service agent for AImpact Platform, a Universal Agent Platform that democratizes AI voice agent development. 
            
You help users with:
- Creating and deploying AI voice agents
- Understanding platform features
- Troubleshooting technical issues
- Best practices for agent design
- Integration guidance

Keep responses concise, helpful, and professional. Always aim to provide actionable solutions.""",
            
            "sales_assistant": """You are a sales assistant for AImpact Platform - the Universal Agent Platform that outperforms Parloa, Artisan.co, and Cognity.

Key features to highlight:
- 6-Layer Enterprise Architecture
- Universal Agent Templates
- Real-time Voice + Text + Multimodal agents
- Visual Agent Builder with drag-drop simplicity
- Enterprise-grade monitoring and analytics
- Open marketplace model

Focus on understanding customer needs and positioning our platform as the superior solution.""",
            
            "interview_assistant": """You are an intelligent interview assistant designed to conduct professional, engaging interviews.

Your approach:
- Ask thoughtful, open-ended questions
- Listen actively and follow up appropriately
- Maintain a warm, encouraging tone
- Adapt questions based on responses
- Provide constructive feedback when appropriate

Create a conversational flow that feels natural and helps candidates showcase their best qualities.""",
            
            "technical_expert": """You are a technical expert for AImpact Platform with deep knowledge of:
- Voice agent architecture and design
- Real-time audio processing
- AI/LLM integration
- WebRTC and LiveKit implementation
- Speech recognition and synthesis
- Enterprise deployment strategies

Provide detailed, technical guidance while remaining accessible to users with varying technical backgrounds."""
        }
        
        return system_messages.get(agent_type, system_messages["customer_service"])
    
    def get_active_sessions(self) -> List[str]:
        """Get list of active chat sessions"""
        return list(self.active_chats.keys())
    
    def get_session_count(self) -> int:
        """Get count of active sessions"""
        return len(self.active_chats)

# Global AI service instance
ai_service = AIService()