
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class WorkflowNodeData(BaseModel):
    """Schema for workflow node data"""
    content: Optional[str] = None
    model: Optional[str] = None
    prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    format: Optional[str] = None
    outputType: Optional[str] = None


class WorkflowNode(BaseModel):
    """Schema for workflow node"""
    id: str
    type: str
    position: Dict[str, float]
    data: WorkflowNodeData


class WorkflowEdge(BaseModel):
    """Schema for workflow edge"""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class WorkflowDefinition(BaseModel):
    """Schema for workflow definition"""
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    id: str
    definition: WorkflowDefinition


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    definition: Optional[WorkflowDefinition] = None


class WorkflowRunCreate(BaseModel):
    pass  # No additional data needed for now


class WorkflowRunResult(BaseModel):
    node_id: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None


class WorkflowRun(BaseModel):
    id: str
    workflow_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    results: Optional[List[WorkflowRunResult]] = None
    logs: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class Workflow(WorkflowBase):
    id: str
    user_id: int
    definition: WorkflowDefinition
    created_at: datetime
    updated_at: Optional[datetime] = None
    version: int

    class Config:
        from_attributes = True
