from fastapi import APIRouter

from app.api.v1 import auth, users, status, workflows, agents, voice_agents, store, engine, deploy, monitor, access

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(status.router, prefix="/status", tags=["status"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])

# 6-Layer Architecture APIs
api_router.include_router(agents.router, prefix="/agents", tags=["studio"])
api_router.include_router(voice_agents.router, prefix="/voice", tags=["voice-agents"])  # Add this line
api_router.include_router(store.router, prefix="/store", tags=["store"])
api_router.include_router(engine.router, prefix="/engine", tags=["engine"])
api_router.include_router(deploy.router, prefix="/deploy", tags=["deploy"])
api_router.include_router(monitor.router, prefix="/monitor", tags=["monitor"])
api_router.include_router(access.router, prefix="/access", tags=["access"])