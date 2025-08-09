"""
Analytics API: High-level platform analytics
"""
from fastapi import APIRouter
from services.agent_service import agent_service
from services.session_service import session_service
from services.access_service import access_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
async def overview():
    # Active agents and sessions
    agents = agent_service.get_all_agents()
    sessions = await session_service.list_sessions(limit=100)
    total_agents = len(agents)
    total_sessions = len(sessions)

    # Audio success rate (last 100 messages sampled from sessions)
    # For simplicity, approximate by counting agent messages with audio_generated flag present in content
    audio_success = 0
    audio_attempts = 0
    # Fetch latest 100 agent messages across sessions
    # We read directly from session_service.messages collection
    cursor = session_service.messages.find({"role": "agent"}).sort("timestamp", -1).limit(100)
    async for m in cursor:
        content = m.get("content", {})
        if "audio_generated" in content:
            audio_attempts += 1
            if content.get("audio_generated"):
                audio_success += 1
    audio_rate = (audio_success / audio_attempts) * 100 if audio_attempts else None

    # API key enforcement state
    enforced = await access_service.is_enforced()

    return {
        "success": True,
        "metrics": {
            "total_agents": total_agents,
            "total_sessions": total_sessions,
            "audio_success_rate_pct": audio_rate,
            "api_key_enforced": enforced,
        }
    }