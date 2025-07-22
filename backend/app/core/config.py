
from typing import Any, Dict, Optional
from pydantic import BaseSettings, validator
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
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        if isinstance(v, str):
            return v
        # Default to SQLite for demo
        db_path = Path("./data/aimpact.db")
        db_path.parent.mkdir(exist_ok=True)
        return f"sqlite:///{db_path}"
    
    @validator("DEMO_MODE", pre=True)
    def check_demo_mode(cls, v: Optional[bool], values: Dict[str, Any]) -> bool:
        if v is not None:
            return v
        # Auto-detect demo mode based on SQLite usage
        database_url = values.get("DATABASE_URL", "")
        return "sqlite" in database_url.lower()
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
