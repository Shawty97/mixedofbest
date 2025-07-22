
from fastapi import APIRouter

from app.api.v1 import auth, users, status, workflows, voice_agents

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(status.router, prefix="/status", tags=["status"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(voice_agents.router, tags=["voice-agents"])
