"""
Agent Repository: MongoDB persistence for agents (UUID/string IDs only)
"""
import os
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient

class AgentRepository:
    def __init__(self):
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "aiimpact_platform")
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.col = self.db["agents"]

    async def upsert_agent(self, agent_doc: Dict[str, Any]) -> None:
        _id = agent_doc.get("agent_id") or agent_doc.get("_id")
        if not _id:
            raise ValueError("agent_doc must include agent_id")
        agent_doc = {**agent_doc, "_id": _id}
        await self.col.update_one({"_id": _id}, {"$set": agent_doc}, upsert=True)

    async def update_fields(self, agent_id: str, fields: Dict[str, Any]) -> None:
        await self.col.update_one({"_id": agent_id}, {"$set": fields}, upsert=False)

    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return await self.col.find_one({"_id": agent_id})

    async def list_agents(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        cursor = self.col.find({})
        async for doc in cursor:
            out.append(doc)
        return out

    async def delete_agent(self, agent_id: str) -> bool:
        res = await self.col.delete_one({"_id": agent_id})
        return res.deleted_count == 1

agent_repository = AgentRepository()