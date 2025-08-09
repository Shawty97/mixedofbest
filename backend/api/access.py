"""
Access API: Manage API keys and view usage
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.access_service import access_service

router = APIRouter(prefix="/api/access", tags=["access"])

class CreateKeyRequest(BaseModel):
    name: str
    rate_limit_per_minute: Optional[int] = 60

@router.post("/keys")
async def create_key(req: CreateKeyRequest):
    try:
        res = await access_service.create_api_key(req.name, req.rate_limit_per_minute or 60)
        return {"success": True, **res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/keys")
async def list_keys():
    keys = await access_service.list_api_keys()
    return {"success": True, "keys": keys}

@router.delete("/keys/{key_id}")
async def delete_key(key_id: str):
    ok = await access_service.delete_api_key(key_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Key not found")
    return {"success": True, "deleted": key_id}