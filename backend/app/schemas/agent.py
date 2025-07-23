"""
Agent schemas for API requests and responses
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None


class AgentResponse(AgentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CapabilityBase(BaseModel):
    name: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class CapabilityCreate(CapabilityBase):
    pass


class CapabilityResponse(CapabilityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AgentCapabilityBase(BaseModel):
    agent_id: int
    capability_id: int
    configuration: Optional[Dict[str, Any]] = None


class AgentCapabilityCreate(AgentCapabilityBase):
    pass


class AgentCapabilityResponse(AgentCapabilityBase):
    id: int

    class Config:
        from_attributes = True


class StoreAgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = 0.0
    is_public: bool = False


class StoreAgentCreate(StoreAgentBase):
    agent_id: int


class StoreAgentResponse(StoreAgentBase):
    id: int
    agent_id: int
    developer_id: int
    average_rating: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgentReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None


class AgentReviewCreate(AgentReviewBase):
    store_agent_id: int


class AgentReviewResponse(AgentReviewBase):
    id: int
    store_agent_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True