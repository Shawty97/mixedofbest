"""
Engine API - Agent runtime management
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.agent import Agent
from app.core.agent_engine import AgentEngine
from app.services.observability import ObservabilityService

router = APIRouter()
agent_engine = AgentEngine()
observability = ObservabilityService()

@router.get("/instances")
async def get_agent_instances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get running agent instances"""
    instances = await agent_engine.get_user_instances(current_user.id)
    return instances

@router.post("/instances/{agent_id}/start")
async def start_agent_instance(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start an agent instance"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    instance = await agent_engine.start_instance(agent)
    return {"instance_id": instance.id, "status": "starting"}

@router.post("/instances/{instance_id}/stop")
async def stop_agent_instance(
    instance_id: str,
    current_user: User = Depends(get_current_user)
):
    """Stop an agent instance"""
    await agent_engine.stop_instance(instance_id, current_user.id)
    return {"status": "stopping"}

@router.post("/instances/{instance_id}/restart")
async def restart_agent_instance(
    instance_id: str,
    current_user: User = Depends(get_current_user)
):
    """Restart an agent instance"""
    await agent_engine.restart_instance(instance_id, current_user.id)
    return {"status": "restarting"}

@router.get("/calls/active")
async def get_active_calls(
    current_user: User = Depends(get_current_user)
):
    """Get active calls for user's agents"""
    calls = await agent_engine.get_active_calls(current_user.id)
    return calls

@router.get("/calls/{call_id}")
async def get_call_details(
    call_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific call"""
    call = await agent_engine.get_call_details(call_id, current_user.id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    return call

@router.get("/logs")
async def get_system_logs(
    limit: int = 100,
    level: str = "INFO",
    current_user: User = Depends(get_current_user)
):
    """Get system logs for user's agents"""
    logs = await observability.get_logs(
        user_id=current_user.id,
        limit=limit,
        level=level
    )
    return logs

@router.websocket("/logs/stream")
async def stream_logs(
    websocket: WebSocket,
    current_user: User = Depends(get_current_user)
):
    """Stream real-time logs"""
    await websocket.accept()
    
    try:
        async for log_entry in observability.stream_logs(current_user.id):
            await websocket.send_json(log_entry)
    except Exception as e:
        await websocket.close(code=1000)

@router.get("/metrics")
async def get_engine_metrics(
    timeframe: str = "24h",
    current_user: User = Depends(get_current_user)
):
    """Get engine performance metrics"""
    metrics = await observability.get_metrics(
        user_id=current_user.id,
        timeframe=timeframe
    )
    return metrics