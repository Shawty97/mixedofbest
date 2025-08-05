
"""
Workflow API endpoints
"""
import logging
from typing import List
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun
from app.schemas.workflow import (
    Workflow as WorkflowSchema,
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowRunCreate,
    WorkflowRun as WorkflowRunSchema
)
from app.services.workflow_engine import workflow_engine

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=WorkflowSchema)
def create_workflow(
    workflow: WorkflowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new workflow"""
    try:
        db_workflow = Workflow(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            user_id=current_user.id,
            definition=workflow.definition.dict(),
            version=1
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        
        logger.info(f"Created workflow {workflow.id} for user {current_user.id}")
        return db_workflow
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workflow"
        )


@router.get("/", response_model=List[WorkflowSchema])
def list_workflows(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all workflows for the current user"""
    workflows = db.query(Workflow).filter(Workflow.user_id == current_user.id).all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowSchema)
def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowSchema)
def update_workflow(
    workflow_id: str,
    workflow_update: WorkflowUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    try:
        if workflow_update.name is not None:
            workflow.name = workflow_update.name
        if workflow_update.description is not None:
            workflow.description = workflow_update.description
        if workflow_update.definition is not None:
            workflow.definition = workflow_update.definition.dict()
            workflow.version += 1
        
        workflow.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(workflow)
        
        logger.info(f"Updated workflow {workflow_id}")
        return workflow
    except Exception as e:
        logger.error(f"Error updating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update workflow"
        )


@router.delete("/{workflow_id}")
def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    try:
        db.delete(workflow)
        db.commit()
        logger.info(f"Deleted workflow {workflow_id}")
        return {"message": "Workflow deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting workflow: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete workflow"
        )


@router.post("/{workflow_id}/run", response_model=WorkflowRunSchema)
async def run_workflow(
    workflow_id: str,
    run_request: WorkflowRunCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Execute a workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Create workflow run record
    run_id = str(uuid4())
    workflow_run = WorkflowRun(
        id=run_id,
        workflow_id=workflow_id,
        status="running",
        start_time=datetime.utcnow()
    )
    db.add(workflow_run)
    db.commit()
    
    try:
        logger.info(f"Starting execution of workflow {workflow_id}")
        
        # Parse workflow definition
        from app.schemas.workflow import WorkflowDefinition
        definition = WorkflowDefinition(**workflow.definition)
        
        # Execute workflow
        results = await workflow_engine.execute_workflow(definition)
        
        # Update workflow run with results
        workflow_run.status = "completed"
        workflow_run.end_time = datetime.utcnow()
        workflow_run.results = [result.dict() for result in results]
        workflow_run.logs = f"Executed {len(results)} nodes successfully"
        
        # Check if any nodes failed
        failed_nodes = [r for r in results if r.status == "failed"]
        if failed_nodes:
            workflow_run.status = "failed"
            workflow_run.error_message = f"{len(failed_nodes)} nodes failed"
        
        db.commit()
        db.refresh(workflow_run)
        
        logger.info(f"Workflow {workflow_id} execution completed with status: {workflow_run.status}")
        return workflow_run
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        workflow_run.status = "failed"
        workflow_run.end_time = datetime.utcnow()
        workflow_run.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/runs/{run_id}", response_model=WorkflowRunSchema)
def get_workflow_run(
    run_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workflow run details"""
    workflow_run = db.query(WorkflowRun).join(Workflow).filter(
        WorkflowRun.id == run_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow run not found"
        )
    
    return workflow_run


@router.get("/{workflow_id}/runs", response_model=List[WorkflowRunSchema])
def list_workflow_runs(
    workflow_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all runs for a specific workflow"""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    runs = db.query(WorkflowRun).filter(WorkflowRun.workflow_id == workflow_id).all()
    return runs
