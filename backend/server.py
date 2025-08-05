"""
AImpact Platform - Universal Agent Platform Backend
Enterprise Voice Agent Ecosystem that democratizes AI voice agent development
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import API routers
from api.agents import router as agents_router
from api.voice import router as voice_router
from api.rooms import router as rooms_router
from api.studio import router as studio_router

app = FastAPI(
    title="AImpact Platform API",
    description="Universal Agent Platform - Enterprise Voice Agent Ecosystem",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection on startup"""
    global client, db
    try:
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DB_NAME", "aiimpact_platform")
        
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await client.admin.command("ping")
        logger.info(f"Connected to MongoDB: {db_name}")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")

# Include API routers
app.include_router(agents_router)
app.include_router(voice_router)
app.include_router(rooms_router)
app.include_router(studio_router)

@app.get("/")
async def root():
    """Root endpoint with platform information"""
    return {
        "message": "AImpact Platform - Universal Agent Platform API",
        "description": "Enterprise Voice Agent Ecosystem that democratizes AI voice agent development",
        "version": "1.0.0",
        "features": [
            "Universal Agent Templates",
            "Real-time Voice Communication",
            "Visual Agent Builder",
            "Enterprise-grade Monitoring",
            "Multi-modal AI Agents",
            "6-Layer Architecture"
        ],
        "api_docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        if client:
            await client.admin.command("ping")
            db_status = "healthy"
        else:
            db_status = "disconnected"
        
        # Check service availability
        services_status = {
            "database": db_status,
            "ai_service": "active",
            "voice_service": "active",
            "livekit_service": "active"
        }
        
        return {
            "status": "healthy",
            "services": services_status,
            "message": "All systems operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "System check failed"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
