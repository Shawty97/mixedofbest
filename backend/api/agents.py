"""
Agent API endpoints for Universal Agent Platform
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import base64

from services.agent_service import agent_service
from repositories.mongodb_repository import mongodb_repository

router = APIRouter(prefix="/api/agents", tags=["agents"])

class CreateAgentRequest(BaseModel):
    agent_type: str
    name: Optional[str] = None
    custom_config: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class DeployAgentRequest(BaseModel):
    room_name: str

@router.get("/templates")
async def get_agent_templates():
    """Get available agent templates"""
    return {
        "templates": agent_service.get_agent_templates(),
        "message": "Agent templates retrieved successfully"
    }

@router.post("", response_model=Dict[str, Any])
async def create_agent(request: CreateAgentRequest):
    """Create a new voice agent"""
    try:
        agent_id = await agent_service.create_agent(
            agent_type=request.agent_type,
            name=request.name,
            custom_config=request.custom_config
        )
        agent = agent_service.get_agent(agent_id)
        return {
            "success": True,
            "agent_id": agent_id,
            "agent": agent,
            "message": f"Agent created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[Dict[str, Any]])
async def list_agents():
    """Get all agents from database"""
    agents = await mongodb_repository.list_agents()
    return agents

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent details"""
    agent = agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": agent, "message": "Agent retrieved successfully"}

@router.post("/{agent_id}/deploy")
async def deploy_agent(agent_id: str, request: DeployAgentRequest):
    """Deploy agent to a LiveKit room"""
    try:
        success = await agent_service.deploy_agent_to_room(
            agent_id=agent_id,
            room_name=request.room_name
        )
        if success:
            return {"success": True, "message": f"Agent deployed to room {request.room_name}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to deploy agent")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/chat")
async def chat_with_agent(agent_id: str, request: ChatRequest):
    """Send text message to agent"""
    try:
        response = await agent_service.process_user_message(
            agent_id=agent_id,
            message=request.message,
            user_id=request.user_id,
            session_id=request.session_id
        )
        return {"success": True, "response": response, "message": "Chat processed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/voice")
async def voice_chat_with_agent(
    agent_id: str,
    audio_file: UploadFile = File(...),
    language: str = "en-US",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
):
    """Send voice message to agent"""
    try:
        audio_data = await audio_file.read()
        response = await agent_service.process_voice_message(
            agent_id=agent_id,
            audio_data=audio_data,
            language=language,
            user_id=user_id,
            session_id=session_id,
        )
        return {"success": True, "response": response, "message": "Voice chat processed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{agent_id}")
async def remove_agent(agent_id: str):
    """Remove an agent"""
    success = await agent_service.remove_agent(agent_id)
    if success:
        return {"success": True, "message": "Agent removed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Agent not found")

@router.get("/room/{room_name}")
async def get_agents_in_room(room_name: str):
    """Get agents deployed to a specific room"""
    agents = agent_service.get_agents_by_room(room_name)
    return {"room_name": room_name, "agents": agents, "count": len(agents)}