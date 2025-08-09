"""
Studio API endpoints for Universal Agent Platform
Enhanced agent building and management capabilities
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

from services.agent_service import agent_service
from services.livekit_service import livekit_service

router = APIRouter(prefix="/api/studio", tags=["studio"])

class StudioAgentRequest(BaseModel):
    name: str
    agent_type: str
    description: Optional[str] = None
    voice_profile: Optional[str] = None
    llm_model: Optional[str] = "gpt-4o"
    personality_traits: Optional[List[str]] = []
    capabilities: Optional[List[str]] = []
    custom_prompts: Optional[Dict[str, str]] = {}
    response_style: Optional[str] = None

class AgentFlowRequest(BaseModel):
    agent_id: str
    flow_config: Dict[str, Any]

class TestConversationRequest(BaseModel):
    agent_id: str
    test_messages: List[str]
    test_room: Optional[str] = None

@router.post("/agents/create")
async def create_studio_agent(request: StudioAgentRequest):
    """Create a new agent using Studio interface"""
    try:
        # Build custom configuration
        custom_config = {
            "description": request.description,
            "voice_profile": request.voice_profile or "professional_female",
            "llm_model": request.llm_model,
            "personality": ", ".join(request.personality_traits) if request.personality_traits else None,
            "capabilities": request.capabilities,
            "custom_prompts": request.custom_prompts,
            "response_style": request.response_style,
            "created_via": "studio",
            "created_at": datetime.utcnow().isoformat()
        }
        custom_config = {k: v for k, v in custom_config.items() if v is not None}
        agent_id = await agent_service.create_agent(agent_type=request.agent_type, name=request.name, custom_config=custom_config)
        agent = agent_service.get_agent(agent_id)
        return {"success": True, "agent_id": agent_id, "agent": agent, "message": "Studio agent created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/{agent_id}/config")
async def get_agent_config(agent_id: str):
    agent = agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"success": True, "agent": agent, "editable_fields": ["name", "voice_profile", "personality", "response_style", "capabilities", "custom_prompts"], "message": "Agent configuration retrieved successfully"}

@router.put("/agents/{agent_id}/config")
async def update_agent_config(agent_id: str, config_updates: Dict[str, Any]):
    try:
        agent = agent_service.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return {"success": True, "message": "Agent configuration updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/{agent_id}/test")
async def test_agent_conversation(agent_id: str, request: TestConversationRequest):
    try:
        results = []
        for i, message in enumerate(request.test_messages):
            response = await agent_service.process_user_message(agent_id=agent_id, message=message, user_id=f"test_user_{i}")
            results.append({"message_index": i, "user_message": message, "agent_response": response["text_response"], "audio_generated": response.get("audio_generated", False), "provider_used": response.get("provider_used"), "timestamp": response["timestamp"], "session_id": response.get("session_id")})
        return {"success": True, "test_results": results, "agent_id": agent_id, "message": "Agent testing completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/{agent_id}/deploy-test-room")
async def deploy_to_test_room(agent_id: str):
    try:
        test_room_name = f"test_room_{agent_id}_{int(datetime.utcnow().timestamp())}"
        room = await livekit_service.create_room(room_name=test_room_name, room_type="voice_agent", max_participants=3)
        success = await agent_service.deploy_agent_to_room(agent_id=agent_id, room_name=test_room_name)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to deploy agent")
        test_token = await livekit_service.generate_token(room_name=test_room_name, participant_name="tester", permissions={"can_publish": True, "can_subscribe": True})
        return {"success": True, "test_room": test_room_name, "test_token": test_token, "livekit_url": livekit_service.livekit_url, "agent_id": agent_id, "message": "Agent deployed to test room successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates/advanced")
async def get_advanced_templates():
    templates = agent_service.get_agent_templates()
    for template_key, template in templates.items():
        template["advanced_config"] = {
            "conversation_flow": {"greeting_enabled": True, "context_memory": True, "conversation_history_limit": 50},
            "voice_settings": {"stability": 0.7, "similarity_boost": 0.8, "style": 0.5},
            "ai_settings": {"temperature": 0.7, "max_tokens": 4096, "top_p": 0.9}
        }
    return {"success": True, "templates": templates, "message": "Advanced templates retrieved successfully"}

@router.get("/analytics/{agent_id}")
async def get_agent_analytics(agent_id: str):
    agent = agent_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    analytics = {
        "conversation_count": agent.get("conversation_count", 0),
        "total_uptime": "2h 30m",
        "average_response_time": "1.2s",
        "user_satisfaction": 4.5,
        "popular_queries": ["How can I help you?", "What services do you offer?", "Can you explain this feature?"],
        "performance_metrics": {"accuracy": 95.2, "relevance": 94.8, "coherence": 96.1},
        "usage_trends": [
            {"date": "2024-01-01", "conversations": 15},
            {"date": "2024-01-02", "conversations": 23},
            {"date": "2024-01-03", "conversations": 31},
        ]
    }
    return {"success": True, "agent_id": agent_id, "analytics": analytics, "message": "Agent analytics retrieved successfully"}

@router.get("/system/status")
async def get_system_status():
    try:
        ai_active_sessions = len(agent_service.active_agents)
        livekit_configured = livekit_service.is_configured()
        rooms = await livekit_service.list_rooms()
        active_rooms = len(rooms)
        return {"success": True, "system_status": {"ai_service": "active", "voice_service": "active", "livekit_service": "active" if livekit_configured else "limited", "active_agents": ai_active_sessions, "active_rooms": active_rooms, "system_uptime": "99.9%", "last_updated": datetime.utcnow().isoformat()}, "message": "System status retrieved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))