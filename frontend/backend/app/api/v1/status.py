
from typing import Any
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/demo")
def get_demo_status() -> Any:
    """Get demo mode status"""
    return {
        "is_demo_mode": settings.DEMO_MODE,
        "message": "AImpact Platform läuft im Demo-Modus. Alle Funktionen sind zur Demonstration verfügbar." if settings.DEMO_MODE else "Production mode active."
    }


@router.get("/health")
def health_check() -> Any:
    """Health check endpoint"""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
