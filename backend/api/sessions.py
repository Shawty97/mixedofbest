"""
Sessions API: List and export conversation transcripts
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from services.session_service import session_service

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.get("")
async def list_sessions(agent_id: Optional[str] = None, user_id: Optional[str] = None, limit: int = 50):
    try:
        sessions = await session_service.list_sessions(agent_id=agent_id, user_id=user_id, limit=limit)
        return {"success": True, "sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}")
async def get_session(session_id: str):
    sess = await session_service.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True, "session": sess}

@router.get("/{session_id}/export")
async def export_session(session_id: str):
    data = await session_service.export_session(session_id)
    if data.get("error"):
        raise HTTPException(status_code=404, detail=data["error"])
    return {"success": True, **data}