
from typing import Any, Dict, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import os
from pathlib import Path


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: Optional[str] = None
    DEMO_MODE: bool = False
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    
    # LiveKit Configuration
    LIVEKIT_URL: Optional[str] = None
    LIVEKIT_API_KEY: Optional[str] = None
    LIVEKIT_API_SECRET: Optional[str] = None
    
    # Azure Speech Configuration
    AZURE_SPEECH_KEY: Optional[str] = None
    AZURE_SPEECH_REGION: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        if isinstance(v, str):
            return v
        # Default to SQLite for demo
        db_path = Path("./data/aimpact.db")
        db_path.parent.mkdir(exist_ok=True)
        return f"sqlite:///{db_path}"
    
    @field_validator("DEMO_MODE", mode="before")
    @classmethod
    def check_demo_mode(cls, v: Optional[bool], info) -> bool:
        if v is not None:
            return v
        # Auto-detect demo mode based on SQLite usage
        database_url = info.data.get("DATABASE_URL", "")
        return "sqlite" in str(database_url).lower()
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
