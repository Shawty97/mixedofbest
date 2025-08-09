"""
Access Service: API key management and rate limiting for Universal Agent Platform
- Creates and verifies API keys
- Enforces per-key rate limits (token bucket in-memory)
- Stores keys and usage in MongoDB (UUID string IDs, no ObjectID)
"""
import os
import time
import uuid
import hashlib
import secrets
from typing import Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

class AccessService:
    def __init__(self):
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "aiimpact_platform")
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.keys = self.db["api_keys"]
        self.usage = self.db["api_usage"]
        # in-memory rate limiting state: key_id -> [timestamps]
        self._rate_window: Dict[str, list[float]] = {}

    @staticmethod
    def _hash_key(key: str) -> str:
        return hashlib.sha256(key.encode("utf-8")).hexdigest()

    @staticmethod
    def _now_iso() -> str:
        return datetime.utcnow().isoformat()

    def _new_plain_key(self) -> str:
        return f"uap_{secrets.token_urlsafe(24)}"

    async def create_api_key(self, name: str, rate_limit_per_minute: int = 60) -> Dict[str, Any]:
        key_id = str(uuid.uuid4())
        plain = self._new_plain_key()
        key_hash = self._hash_key(plain)
        doc = {
            "_id": key_id,
            "name": name,
            "key_hash": key_hash,
            "created_at": self._now_iso(),
            "active": True,
            "rate_limit_per_minute": int(rate_limit_per_minute),
            "usage_total": 0,
            "last_used_at": None,
        }
        await self.keys.insert_one(doc)
        # return plaintext once
        masked = plain[:8] + "..." + plain[-4:]
        return {"api_key": plain, "masked": masked, "key_id": key_id, "rate_limit_per_minute": rate_limit_per_minute}

    async def list_api_keys(self) -> list[Dict[str, Any]]:
        cursor = self.keys.find({})
        out = []
        async for doc in cursor:
            out.append({
                "key_id": doc["_id"],
                "name": doc.get("name"),
                "active": doc.get("active", True),
                "created_at": doc.get("created_at"),
                "rate_limit_per_minute": doc.get("rate_limit_per_minute", 60),
                "usage_total": doc.get("usage_total", 0),
                "last_used_at": doc.get("last_used_at")
            })
        return out

    async def delete_api_key(self, key_id: str) -> bool:
        res = await self.keys.delete_one({"_id": key_id})
        self._rate_window.pop(key_id, None)
        return res.deleted_count == 1

    async def _get_key_doc(self, key_id: str) -> Optional[Dict[str, Any]]:
        return await self.keys.find_one({"_id": key_id})

    async def verify_api_key(self, provided: Optional[str]) -> Optional[Dict[str, Any]]:
        if not provided:
            return None
        key_hash = self._hash_key(provided)
        doc = await self.keys.find_one({"key_hash": key_hash, "active": True})
        return doc

    async def is_enforced(self) -> bool:
        # If any key exists, enforce API key requirement
        count = await self.keys.estimated_document_count()
        return count > 0

    async def rate_limit_check(self, key_id: str, limit_per_minute: int) -> bool:
        now = time.time()
        window = self._rate_window.setdefault(key_id, [])
        cutoff = now - 60.0
        # drop old timestamps
        i = 0
        for ts in window:
            if ts > cutoff:
                break
            i += 1
        if i:
            del window[:i]
        if len(window) >= limit_per_minute:
            return False
        window.append(now)
        return True

    async def record_usage(self, key_doc: Dict[str, Any], endpoint: str):
        key_id = key_doc["_id"]
        await self.keys.update_one({"_id": key_id}, {"$inc": {"usage_total": 1}, "$set": {"last_used_at": self._now_iso()}})
        # usage by day
        day = datetime.utcnow().strftime("%Y-%m-%d")
        await self.usage.update_one(
            {"_id": f"{key_id}:{day}", "key_id": key_id, "day": day},
            {"$inc": {"count": 1}, "$setOnInsert": {"created_at": self._now_iso()}, "$set": {"last_endpoint": endpoint}},
            upsert=True
        )

access_service = AccessService()