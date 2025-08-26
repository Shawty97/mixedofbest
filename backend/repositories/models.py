"""MongoDB Models for Universal Agent Platform"""
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional, List, Dict, Any, Union, Annotated
from datetime import datetime
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        field_schema.update(type="string")
        return field_schema

class AgentModel(BaseModel):
    """Agent model for MongoDB storage"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    agent_id: str = Field(..., description="Unique agent identifier")
    agent_type: str = Field(..., description="Type of agent (customer_service, sales_assistant, etc.)")
    name: str = Field(..., description="Display name of the agent")
    config: Dict[str, Any] = Field(default_factory=dict, description="Agent configuration")
    ai_session_id: Optional[str] = Field(None, description="AI service session ID")
    status: str = Field(default="inactive", description="Current agent status")
    current_room: Optional[str] = Field(None, description="Current LiveKit room")
    conversation_count: int = Field(default=0, description="Number of conversations handled")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = Field(None, description="Last activity timestamp")

class WorkflowModel(BaseModel):
    """Workflow model for MongoDB storage"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="Workflow name")
    description: Optional[str] = Field(None, description="Workflow description")
    type: str = Field(..., description="Workflow type (onboarding, interview, sales, etc.)")
    steps: List[Dict[str, Any]] = Field(default_factory=list, description="Workflow steps")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    success_criteria: List[str] = Field(default_factory=list, description="Success criteria")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = Field(None, description="User who created the workflow")
    is_active: bool = Field(default=True, description="Whether workflow is active")

class TaskModel(BaseModel):
    """Task model for MongoDB storage"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    type: str = Field(..., description="Task type (conversation, analysis, etc.)")
    status: str = Field(default="pending", description="Task status (pending, in_progress, completed, failed)")
    priority: str = Field(default="medium", description="Task priority (low, medium, high, urgent)")
    assigned_agent_id: Optional[str] = Field(None, description="Assigned agent ID")
    workflow_id: Optional[str] = Field(None, description="Associated workflow ID")
    session_id: Optional[str] = Field(None, description="Associated session ID")
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Task input data")
    output_data: Dict[str, Any] = Field(default_factory=dict, description="Task output data")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(None, description="Task start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Task completion timestamp")
    estimated_duration: Optional[int] = Field(None, description="Estimated duration in minutes")
    actual_duration: Optional[int] = Field(None, description="Actual duration in minutes")

class SessionModel(BaseModel):
    """Session model for MongoDB storage"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = Field(None, description="Associated user ID")
    agent_id: Optional[str] = Field(None, description="Associated agent ID")
    workflow_id: Optional[str] = Field(None, description="Associated workflow ID")
    session_type: str = Field(..., description="Session type (chat, voice, video, etc.)")
    status: str = Field(default="active", description="Session status (active, paused, completed, terminated)")
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = Field(None, description="Session end timestamp")
    duration: Optional[int] = Field(None, description="Session duration in seconds")
    messages: List[Dict[str, Any]] = Field(default_factory=list, description="Session messages")
    context: Dict[str, Any] = Field(default_factory=dict, description="Session context data")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional session metadata")
    quality_score: Optional[float] = Field(None, description="Session quality score (0-1)")
    satisfaction_rating: Optional[int] = Field(None, description="User satisfaction rating (1-5)")
    tags: List[str] = Field(default_factory=list, description="Session tags")