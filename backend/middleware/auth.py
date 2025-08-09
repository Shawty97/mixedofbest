"""
Auth middleware/dependency for API key enforcement with soft-enable behavior.
If at least one API key exists in DB, enforcement is ON. Otherwise, endpoints allow open access.
"""
from fastapi import Depends, Header, HTTPException, Request
from typing import Optional
from services.access_service import access_service

async def require_api_key(
    request: Request,
    x_api_key: Optional[str] = Header(default=None, alias="x-api-key"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
):
    enforced = await access_service.is_enforced()

    provided = None
    if x_api_key:
        provided = x_api_key.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        provided = authorization.split(" ", 1)[1].strip()

    if not enforced:
        # Pass-through in open mode
        return None

    doc = await access_service.verify_api_key(provided)
    if not doc:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

    # basic per-minute rate limit
    limit = int(doc.get("rate_limit_per_minute", 60))
    allowed = await access_service.rate_limit_check(doc["_id"], limit)
    if not allowed:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # record usage (endpoint path is in request.url.path)
    await access_service.record_usage(doc, request.url.path)
    # attach to request state for downstream
    request.state.api_key = doc
    return doc