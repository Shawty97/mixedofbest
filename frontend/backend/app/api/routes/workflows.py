from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.core.database import get_db
from app.core.security import is_demo_mode
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun
from app.services.workflow_service import WorkflowService
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user

router = APIRouter()

class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    workspace_id: str
    created_by: str
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    config: Dict[str, Any] = {}
    is_active: bool = True
    is_published: bool = False
    version: str = "1.0.0"
    created_at: str
    updated_at: Optional[str] = None

class CreateWorkflowRequest(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_id: str
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    config: Dict[str, Any] = {}

class UpdateWorkflowRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    config: Optional[Dict[str, Any]] = None

class ExecuteWorkflowRequest(BaseModel):
    input_data: Dict[str, Any] = {}

class WorkflowRunResponse(BaseModel):
    id: str
    workflow_id: str
    status: str
    input_data: Dict[str, Any] = {}
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_time: Optional[int] = None
    nodes_executed: int = 0
    tokens_used: int = 0
    started_at: str
    completed_at: Optional[str] = None

@router.get("/workspace/{workspace_id}", response_model=List[WorkflowResponse])
async def get_workspace_workflows(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all workflows for a workspace"""
    
    if is_demo_mode():
        return [
            WorkflowResponse(
                id="demo_workflow_1",
                name="Demo Customer Support Workflow",
                description="A demo workflow for customer support automation",
                workspace_id="demo_workspace",
                created_by="demo_user",
                nodes=[
                    {
                        "id": "input_1",
                        "type": "input",
                        "position": {"x": 100, "y": 100},
                        "data": {"label": "Customer Input"}
                    },
                    {
                        "id": "ai_1",
                        "type": "aiModel",
                        "position": {"x": 300, "y": 100},
                        "data": {"label": "AI Response", "model": "gpt-4"}
                    },
                    {
                        "id": "output_1",
                        "type": "output",
                        "position": {"x": 500, "y": 100},
                        "data": {"label": "Response Output"}
                    }
                ],
                edges=[
                    {"id": "e1", "source": "input_1", "target": "ai_1"},
                    {"id": "e2", "source": "ai_1", "target": "output_1"}
                ],
                config={"timeout": 30, "retries": 3},
                created_at="2024-01-01T00:00:00Z"
            )
        ]
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    workflow_service = WorkflowService(db)
    workflows = await workflow_service.get_workspace_workflows(workspace_id)
    
    return [
        WorkflowResponse(
            id=str(wf.id),
            name=wf.name,
            description=wf.description,
            workspace_id=str(wf.workspace_id),
            created_by=str(wf.created_by),
            nodes=wf.nodes or [],
            edges=wf.edges or [],
            config=wf.config or {},
            is_active=wf.is_active,
            is_published=wf.is_published,
            version=wf.version,
            created_at=wf.created_at.isoformat(),
            updated_at=wf.updated_at.isoformat() if wf.updated_at else None
        )
        for wf in workflows
    ]

@router.post("/", response_model=WorkflowResponse)
async def create_workflow(
    request: CreateWorkflowRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new workflow"""
    
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Workflow creation disabled in demo mode"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(request.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.create_workflow(
        name=request.name,
        description=request.description,
        workspace_id=request.workspace_id,
        created_by=current_user.id,
        nodes=request.nodes,
        edges=request.edges,
        config=request.config
    )
    
    return WorkflowResponse(
        id=str(workflow.id),
        name=workflow.name,
        description=workflow.description,
        workspace_id=str(workflow.workspace_id),
        created_by=str(workflow.created_by),
        nodes=workflow.nodes or [],
        edges=workflow.edges or [],
        config=workflow.config or {},
        is_active=workflow.is_active,
        is_published=workflow.is_published,
        version=workflow.version,
        created_at=workflow.created_at.isoformat(),
        updated_at=workflow.updated_at.isoformat() if workflow.updated_at else None
    )

@router.post("/{workflow_id}/execute", response_model=WorkflowRunResponse)
async def execute_workflow(
    workflow_id: str,
    request: ExecuteWorkflowRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute workflow"""
    
    if is_demo_mode():
        return WorkflowRunResponse(
            id="demo_run_1",
            workflow_id=workflow_id,
            status="completed",
            input_data=request.input_data,
            output_data={
                "status": "completed",
                "result": "Demo workflow execution completed successfully",
                "processing_time": 1.5,
                "nodes_processed": 3
            },
            nodes_executed=3,
            tokens_used=150,
            started_at="2024-01-01T00:00:00Z",
            completed_at="2024-01-01T00:00:01Z"
        )
    
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_workflow_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(workflow.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace access denied"
        )
    
    # Execute workflow
    workflow_run = await workflow_service.execute_workflow(
        workflow=workflow,
        input_data=request.input_data,
        triggered_by=current_user.id,
        trigger_type="manual"
    )
    
    return WorkflowRunResponse(
        id=str(workflow_run.id),
        workflow_id=str(workflow_run.workflow_id),
        status=workflow_run.status,
        input_data=workflow_run.input_data or {},
        output_data=workflow_run.output_data,
        error_message=workflow_run.error_message,
        execution_time=workflow_run.execution_time,
        nodes_executed=workflow_run.nodes_executed,
        tokens_used=workflow_run.tokens_used,
        started_at=workflow_run.started_at.isoformat(),
        completed_at=workflow_run.completed_at.isoformat() if workflow_run.completed_at else None
    )