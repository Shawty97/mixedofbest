"""Workflows API endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
from repositories.mongodb_repository import mongodb_repository
from middleware.auth import require_api_key

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

@router.get("/")
async def list_workflows(
    owner_id: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """List all workflows with optional filters"""
    try:
        workflows = await mongodb_repository.list_workflows(
            owner_id=owner_id,
            status=status
        )
        return workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str) -> Dict[str, Any]:
    """Get a specific workflow by ID"""
    try:
        workflow = await mongodb_repository.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_workflow(workflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new workflow"""
    try:
        workflow = await mongodb_repository.create_workflow(workflow_data)
        return workflow
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    workflow_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Update an existing workflow"""
    try:
        workflow = await mongodb_repository.update_workflow(workflow_id, workflow_data)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    """Delete a workflow"""
    try:
        success = await mongodb_repository.delete_workflow(workflow_id)
        if not success:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return {"message": "Workflow deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))