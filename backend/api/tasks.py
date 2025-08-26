"""Tasks API endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
from repositories.mongodb_repository import mongodb_repository
from middleware.auth import require_api_key

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/")
async def list_tasks(
    owner_id: Optional[str] = None,
    status: Optional[str] = None,
    workflow_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """List all tasks with optional filters"""
    try:
        tasks = await mongodb_repository.list_tasks(
            owner_id=owner_id,
            status=status,
            workflow_id=workflow_id
        )
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}")
async def get_task(task_id: str) -> Dict[str, Any]:
    """Get a specific task by ID"""
    try:
        task = await mongodb_repository.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_task(task_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new task"""
    try:
        task = await mongodb_repository.create_task(task_data)
        return task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Update an existing task"""
    try:
        task = await mongodb_repository.update_task(task_id, task_data)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
async def delete_task(task_id: str) -> Dict[str, str]:
    """Delete a task"""
    try:
        success = await mongodb_repository.delete_task(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))