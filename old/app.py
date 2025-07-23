from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ValidationError
import os
import json
import logging
from livekit import api
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware
from fastapi import Depends

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("fastapi-app")

# --- FastAPI App ---
app = FastAPI(title="Voice Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware (secret from env/config)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "change_this_secret"),
    session_cookie="session",
)

# Create static directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    logger.info(f"Created static directory: {static_dir}")

# Serve static files (e.g., logo, CSS, JS)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def root_index():
    index_path = os.path.join(os.path.dirname(__file__), "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"error": "index.html not found"})

class DispatchRequest(BaseModel):
    room_name: str
    agent_name: str
    phone_number: str

@app.post("/dispatch")
async def create_agent_dispatch(data: DispatchRequest):
    try:
        # Load agent configuration
        config_path = os.path.join(os.path.dirname(__file__), "agents_config.json")
        if not os.path.exists(config_path):
            logger.error("agents_config.json not found")
            raise HTTPException(status_code=500, detail="Configuration file not found")
            
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
            
        agents = config.get("agents", {})
        agent_cfg = agents.get(data.agent_name)
        
        if not agent_cfg:
            logger.error(f"Agent config for '{data.agent_name}' not found")
            raise HTTPException(status_code=400, detail=f"Agent config for '{data.agent_name}' not found")
        
        greeting = agent_cfg.get("greeting", "Hallo, willkommen beim Sprachagenten.")
        instructions = agent_cfg.get("instructions", "Sie sind ein hilfsbereiter Agent.")
        
        # Check required environment variables
        required_env_vars = ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        if missing_vars:
            logger.error(f"Missing environment variables: {missing_vars}")
            raise HTTPException(status_code=500, detail="Missing required environment variables")
        
        # LiveKit API dispatch
        lkapi = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET")
        )
        
        await lkapi.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name="dynamic-agent",
                room=data.room_name,
                metadata=json.dumps({
                    "phone_number": data.phone_number,
                    "agent_name": data.agent_name,
                    "greeting": greeting,
                    "instructions": instructions,
                }),
            )
        )
        
        await lkapi.aclose()
        logger.info(f"Agent dispatch created successfully for {data.phone_number}")
        
        return {
            "status": "success",
            "message": "Agent dispatch created successfully",
            "dispatch_room": data.room_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dispatch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/call")
async def api_call_proxy(data: dict = Body(...)):
    try:
        # Transform data
        if "agent_type" in data:
            data["agent_name"] = data.pop("agent_type")
        
        # Filter valid fields
        data = {k: v for k, v in data.items() if k in {"room_name", "agent_name", "phone_number"}}
        
        # Add default room name if missing
        if "room_name" not in data:
            data["room_name"] = f"call-{data.get('phone_number', 'unknown')}"
        
        # Validate request
        req = DispatchRequest(**data)
        
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail={"message": "Invalid request", "errors": e.errors()})
    
    return await create_agent_dispatch(req)

# Helper: check if user is logged in

def require_login(request: Request):
    if not request.session.get("user_authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")

# POST /api/login
@app.post("/api/login")
def api_login(request: Request, data: dict = Body(...)):
    username = data.get("username")
    password = data.get("password")
    env_user = os.getenv("UI_USER_NAME")
    env_pass = os.getenv("UI_PASSWORD")
    if not env_user or not env_pass:
        return JSONResponse(status_code=500, content={"detail": "Auth not configured"})
    if username == env_user and password == env_pass:
        request.session["user_authenticated"] = True
        return {"detail": "Login successful"}
    return JSONResponse(status_code=401, content={"detail": "Invalid credentials"})

# POST /api/logout
@app.post("/api/logout")
def logout(request: Request):
    request.session.clear()
    return {"detail": "Logged out"}

# Protect /agents and /api/agents
@app.get("/agents")
async def get_agents(request: Request):
    require_login(request)
    try:
        config_path = os.path.join(os.path.dirname(__file__), "agents_config.json")
        if not os.path.exists(config_path):
            logger.error("agents_config.json not found")
            raise HTTPException(status_code=500, detail="Configuration file not found")
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        return JSONResponse(content=config["agents"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading agents: {e}")
        raise HTTPException(status_code=500, detail="Error loading agent configuration")

@app.get("/api/agents")
async def get_agents_api(request: Request):
    require_login(request)
    return await get_agents(request)

@app.get("/health")
async def health_check():
    try:
        # Check if config file exists
        config_path = os.path.join(os.path.dirname(__file__), "agents_config.json")
        config_exists = os.path.exists(config_path)
        
        # Check environment variables
        required_env_vars = ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
        env_vars_present = all(os.getenv(var) for var in required_env_vars)
        
        return {
            "status": "healthy" if config_exists and env_vars_present else "degraded",
            "service": "voice-agents-api",
            "config_file": config_exists,
            "environment": env_vars_present
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

# Add startup event
@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI application starting up...")
    
    # Check critical files
    critical_files = ["agents_config.json"]
    for file in critical_files:
        if not os.path.exists(file):
            logger.error(f"Critical file missing: {file}")
        else:
            logger.info(f"Found critical file: {file}")

# Add shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI application shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)