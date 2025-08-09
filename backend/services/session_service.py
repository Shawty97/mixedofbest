"""
Session Service: Manages conversation sessions and transcripts in MongoDB (UUID IDs)
"""
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient

class SessionService:
    def __init__(self):
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "aiimpact_platform")
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.sessions = self.db["agent_sessions"]
        self.messages = self.db["agent_messages"]

    async def create_session(self, agent_id: str, user_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> str:
        sid = str(uuid.uuid4())
        doc = {
            "_id": sid,
            "agent_id": agent_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {},
            "message_count": 0,
        }
        await self.sessions.insert_one(doc)
        return sid

    async def ensure_session(self, session_id: Optional[str], agent_id: str, user_id: Optional[str]) -> str:
        if session_id:
            found = await self.sessions.find_one({"_id": session_id, "agent_id": agent_id})
            if found:
                return session_id
        return await self.create_session(agent_id=agent_id, user_id=user_id)

    async def add_message(self, session_id: str, role: str, content: Dict[str, Any]):
        mid = str(uuid.uuid4())
        msg = {
            "_id": mid,
            "session_id": session_id,
            "role": role,  # "user" or "agent"
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        }
        await self.messages.insert_one(msg)
        await self.sessions.update_one({"_id": session_id}, {"$inc": {"message_count": 1}, "$set": {"updated_at": datetime.utcnow().isoformat()}})

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return await self.sessions.find_one({"_id": session_id})

    async def list_sessions(self, agent_id: Optional[str] = None, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        q: Dict[str, Any] = {}
        if agent_id:
            q["agent_id"] = agent_id
        if user_id:
            q["user_id"] = user_id
        cursor = self.sessions.find(q).sort("updated_at", -1).limit(limit)
        out: List[Dict[str, Any]] = []
        async for s in cursor:
            out.append(s)
        return out

    async def export_session(self, session_id: str) -> Dict[str, Any]:
        sess = await self.get_session(session_id)
        if not sess:
            return {"error": "Session not found"}
        cursor = self.messages.find({"session_id": session_id}).sort("timestamp", 1)
        msgs: List[Dict[str, Any]] = []
        async for m in cursor:
            msgs.append({
                "role": m.get("role"),
                "timestamp": m.get("timestamp"),
                "content": m.get("content", {}),
            })
        return {"session": sess, "messages": msgs}

session_service = SessionService()