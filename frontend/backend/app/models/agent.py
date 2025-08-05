
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.core.database import Base


class AgentConfig(BaseModel):
    """Configuration class for agent runtime"""
    id: int
    name: str
    description: Optional[str] = None
    instructions: str = "You are a helpful assistant."
    capabilities: List[str] = []
    webhook_url: Optional[str] = None
    ending_message: Optional[str] = None
    voice_settings: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    configuration = Column(JSON)  # Profile, personality, capabilities, knowledge sources
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="agents")
    capabilities = relationship("AgentCapability", back_populates="agent")


class Capability(Base):
    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    parameters = Column(JSON)  # Configuration parameters schema
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    agent_capabilities = relationship("AgentCapability", back_populates="capability")


class AgentCapability(Base):
    __tablename__ = "agent_capabilities"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    capability_id = Column(Integer, ForeignKey("capabilities.id"), nullable=False)
    configuration = Column(JSON)  # Specific config for this capability in this agent
    
    # Relationships
    agent = relationship("Agent", back_populates="capabilities")
    capability = relationship("Capability", back_populates="agent_capabilities")


# Agent Store Models
class StoreAgent(Base):
    __tablename__ = "store_agents"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    developer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    price = Column(Float, default=0.0)
    is_public = Column(Boolean, default=False)
    average_rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    agent = relationship("Agent")
    developer = relationship("User")
    reviews = relationship("AgentReview", back_populates="store_agent")
    installations = relationship("InstalledAgent", back_populates="store_agent")


class AgentReview(Base):
    __tablename__ = "agent_reviews"

    id = Column(Integer, primary_key=True, index=True)
    store_agent_id = Column(Integer, ForeignKey("store_agents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    store_agent = relationship("StoreAgent", back_populates="reviews")
    user = relationship("User")


class InstalledAgent(Base):
    __tablename__ = "installed_agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_agent_id = Column(Integer, ForeignKey("store_agents.id"), nullable=False)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    store_agent = relationship("StoreAgent", back_populates="installations")
