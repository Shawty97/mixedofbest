"""
Monitor API - Observability and analytics
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.observability import ObservabilityService
from app.services.analytics import AnalyticsService

router = APIRouter()
observability = ObservabilityService()
analytics = AnalyticsService()

@router.get("/metrics")
async def get_metrics(
    timeframe: str = "24h",
    current_user: User = Depends(get_current_user)
):
    """Get performance metrics"""
    metrics = await analytics.get_metrics(current_user.id, timeframe)
    return metrics

@router.get("/calls")
async def get_call_logs(
    limit: int = 100,
    status_filter: Optional[str] = None,
    agent_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get call logs"""
    logs = await observability.get_call_logs(
        user_id=current_user.id,
        limit=limit,
        status_filter=status_filter,
        agent_id=agent_id
    )
    return logs

@router.get("/calls/{call_id}/transcript")
async def get_call_transcript(
    call_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get call transcript"""
    transcript = await observability.get_call_transcript(call_id, current_user.id)
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found"
        )
    return transcript

@router.get("/performance")
async def get_performance_data(
    timeframe: str = "24h",
    current_user: User = Depends(get_current_user)
):
    """Get performance analytics"""
    performance = await analytics.get_performance_data(current_user.id, timeframe)
    return performance

@router.get("/alerts")
async def get_alerts(
    resolved: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get system alerts"""
    alerts = await observability.get_alerts(
        user_id=current_user.id,
        resolved=resolved
    )
    return alerts

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user)
):
    """Resolve an alert"""
    await observability.resolve_alert(alert_id, current_user.id)
    return {"status": "resolved"}

@router.get("/health")
async def get_system_health(
    current_user: User = Depends(get_current_user)
):
    """Get system health status"""
    health = await observability.get_system_health(current_user.id)
    return health

@router.get("/charts/call-volume")
async def get_call_volume_chart(
    timeframe: str = "24h",
    current_user: User = Depends(get_current_user)
):
    """Get call volume chart data"""
    data = await analytics.get_call_volume_chart(current_user.id, timeframe)
    return data

@router.get("/charts/success-rate")
async def get_success_rate_chart(
    timeframe: str = "24h",
    current_user: User = Depends(get_current_user)
):
    """Get success rate chart data"""
    data = await analytics.get_success_rate_chart(current_user.id, timeframe)
    return data