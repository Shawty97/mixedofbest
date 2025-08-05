"""
Room API endpoints for Universal Agent Platform
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

from services.livekit_service import livekit_service

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

class CreateRoomRequest(BaseModel):
    name: str
    room_type: str = "voice_agent"
    max_participants: Optional[int] = None

class TokenRequest(BaseModel):
    room_name: str
    participant_name: str
    permissions: Optional[Dict[str, bool]] = None

@router.post("/token")
async def generate_token(request: TokenRequest):
    """Generate access token for room"""
    try:
        token = await livekit_service.generate_token(
            room_name=request.room_name,
            participant_name=request.participant_name,
            permissions=request.permissions
        )
        
        return {
            "success": True,
            "token": token,
            "room_name": request.room_name,
            "participant_name": request.participant_name,
            "livekit_url": livekit_service.livekit_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_room(request: CreateRoomRequest):
    """Create a new room"""
    try:
        room = await livekit_service.create_room(
            room_name=request.name,
            room_type=request.room_type,
            max_participants=request.max_participants
        )
        
        return {
            "success": True,
            "room": room,
            "message": f"Room '{request.name}' created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_rooms():
    """List all active rooms"""
    try:
        rooms = await livekit_service.list_rooms()
        return {
            "success": True,
            "rooms": rooms,
            "count": len(rooms)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_name}")
async def get_room_details(room_name: str):
    """Get room details and participants"""
    try:
        participants = await livekit_service.list_participants(room_name)
        return {
            "success": True,
            "room_name": room_name,
            "participants": participants,
            "participant_count": len(participants)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{room_name}")
async def delete_room(room_name: str):
    """Delete a room"""
    try:
        success = await livekit_service.delete_room(room_name)
        if success:
            return {
                "success": True,
                "message": f"Room '{room_name}' deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Room not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_name}/participants")
async def list_participants(room_name: str):
    """List participants in a room"""
    try:
        participants = await livekit_service.list_participants(room_name)
        return {
            "success": True,
            "room_name": room_name,
            "participants": participants,
            "count": len(participants)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{room_name}/participants/{participant_identity}")
async def remove_participant(room_name: str, participant_identity: str):
    """Remove participant from room"""
    try:
        success = await livekit_service.remove_participant(room_name, participant_identity)
        if success:
            return {
                "success": True,
                "message": f"Participant '{participant_identity}' removed from room '{room_name}'"
            }
        else:
            raise HTTPException(status_code=404, detail="Participant not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/configs/available")
async def get_room_configs():
    """Get available room configurations"""
    configs = livekit_service.get_room_configs()
    return {
        "success": True,
        "configs": configs,
        "message": "Room configurations retrieved successfully"
    }