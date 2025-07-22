from sqlalchemy import Column, String, Integer, Boolean, JSON, ForeignKey, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import User
from datetime import datetime
from typing import Optional, Dict, Any, List
import uuid

class VoiceAgent(Base):
    """Voice agent model for advanced voice-based AI interactions"""
    __tablename__ = "voice_agents"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    
    # Voice configuration
    voice_id = Column(String, nullable=True)  # ElevenLabs voice ID
    voice_provider = Column(String, default="elevenlabs")
    voice_settings = Column(JSON, default=lambda: {})
    
    # AI model configuration
    model = Column(String, default="gpt-4o")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    
    # System prompt and knowledge
    system_prompt = Column(String, nullable=True)
    knowledge_base_ids = Column(JSON, default=lambda: [])  # List of knowledge base IDs
    vector_collection = Column(String, nullable=True)  # Qdrant collection name
    
    # Performance metrics
    avg_response_time = Column(Float, default=0.0)
    total_interactions = Column(Integer, default=0)
    rating = Column(Float, default=5.0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="voice_agents")
    interactions = relationship("VoiceInteraction", back_populates="voice_agent", cascade="all, delete-orphan")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the model to a dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "avatar": self.avatar,
            "voice_id": self.voice_id,
            "voice_provider": self.voice_provider,
            "voice_settings": self.voice_settings,
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "system_prompt": self.system_prompt,
            "knowledge_base_ids": self.knowledge_base_ids,
            "vector_collection": self.vector_collection,
            "avg_response_time": self.avg_response_time,
            "total_interactions": self.total_interactions,
            "rating": self.rating,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class VoiceInteraction(Base):
    """Voice interaction model for tracking conversations with voice agents"""
    __tablename__ = "voice_interactions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    voice_agent_id = Column(String, ForeignKey("voice_agents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=False)
    
    # Content
    user_input = Column(String, nullable=False)
    agent_response = Column(String, nullable=False)
    
    # Audio data
    user_audio_url = Column(String, nullable=True)
    agent_audio_url = Column(String, nullable=True)
    
    # Metrics
    tokens_used = Column(Integer, default=0)
    response_time = Column(Float, default=0.0)  # in seconds
    user_rating = Column(Integer, nullable=True)  # 1-5 rating
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    voice_agent = relationship("VoiceAgent", back_populates="interactions")
    user = relationship("User")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the model to a dictionary"""
        return {
            "id": self.id,
            "voice_agent_id": self.voice_agent_id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "user_input": self.user_input,
            "agent_response": self.agent_response,
            "user_audio_url": self.user_audio_url,
            "agent_audio_url": self.agent_audio_url,
            "tokens_used": self.tokens_used,
            "response_time": self.response_time,
            "user_rating": self.user_rating,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }