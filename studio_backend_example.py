
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field

router = APIRouter(prefix="/agents", tags=["Studio"])

# --- Datenmodelle (Simulation im Speicher) ---
class AgentProfile(BaseModel):
    name: str
    description: Optional[str]
    avatar: str
    personality: str

class Capability(BaseModel):
    id: str
    name: str
    description: Optional[str]
    parameters: Optional[dict] = None

class Agent(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    configuration: dict  # Enthält Profil, personality, aktive Fähigk., Wissenquellen-IDs

# "Fake-DB"
AGENTS = []
CAPABILITIES = [
    Capability(id="1", name="Textanalyse", description="Texte analysieren"),
    Capability(id="2", name="Datenextraktion", description="Daten extrahieren"),
    Capability(id="3", name="Web-Suche", description="Web durchsuchen (simuliert)"),
    Capability(id="4", name="Kalenderzugriff", description="Kalenderzugriff simulieren"),
]

# --- Pydantic Schemas ---
class AgentCreate(BaseModel):
    name: str
    description: Optional[str]
    avatar: Optional[str] = None
    personality: str
    capabilities: List[str]
    knowledge_sources: List[str] = []

class AgentOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    avatar: str
    personality: str
    capabilities: List[str]
    knowledge_sources: List[str]

# --- Endpunkte ---
@router.post("/", response_model=AgentOut)
def create_agent(payload: AgentCreate, user_id: str = "demo-user"):
    aid = str(uuid4())
    conf = {
        "name": payload.name,
        "description": payload.description,
        "avatar": payload.avatar or "/agent-avatar-1.svg",
        "personality": payload.personality,
        "capabilities": payload.capabilities,
        "knowledge_sources": payload.knowledge_sources
    }
    a = Agent(id=aid, user_id=user_id, created_at=datetime.now(),
              updated_at=datetime.now(), configuration=conf)
    AGENTS.append(a)
    return AgentOut(id=a.id, **conf)

@router.get("/", response_model=List[AgentOut])
def list_agents(user_id: str = "demo-user"):
    return [AgentOut(
        id=a.id,
        name=a.configuration["name"],
        description=a.configuration.get("description"),
        avatar=a.configuration["avatar"],
        personality=a.configuration["personality"],
        capabilities=a.configuration["capabilities"],
        knowledge_sources=a.configuration["knowledge_sources"]
    ) for a in AGENTS if a.user_id == user_id]

@router.get("/{agent_id}", response_model=AgentOut)
def get_agent(agent_id: str, user_id: str = "demo-user"):
    for a in AGENTS:
        if a.id == agent_id and a.user_id == user_id:
            conf = a.configuration
            return AgentOut(id=a.id, **conf)
    raise HTTPException(status_code=404, detail="Agent nicht gefunden")

@router.put("/{agent_id}", response_model=AgentOut)
def update_agent(agent_id: str, payload: AgentCreate, user_id: str = "demo-user"):
    for a in AGENTS:
        if a.id == agent_id and a.user_id == user_id:
            a.configuration.update({
                "name": payload.name,
                "description": payload.description,
                "avatar": payload.avatar or a.configuration["avatar"],
                "personality": payload.personality,
                "capabilities": payload.capabilities,
                "knowledge_sources": payload.knowledge_sources
            })
            a.updated_at = datetime.now()
            return AgentOut(id=a.id, **a.configuration)
    raise HTTPException(status_code=404, detail="Nicht gefunden")

@router.delete("/{agent_id}")
def delete_agent(agent_id: str, user_id: str = "demo-user"):
    global AGENTS
    AGENTS = [a for a in AGENTS if not (a.id == agent_id and a.user_id == user_id)]
    return {"ok": True}

@router.get("/capabilities", response_model=List[Capability])
def list_capabilities():
    return CAPABILITIES

@router.post("/{agent_id}/test")
def test_agent(agent_id: str, prompt: str, user_id: str = "demo-user"):
    for a in AGENTS:
        if a.id == agent_id and a.user_id == user_id:
            caps = a.configuration["capabilities"]
            pers = a.configuration["personality"]
            if "3" in caps and "suche" in prompt.lower():
                return {"response": f"Ich habe simuliert nach '{prompt}' gesucht: Hier kommt dein Demo-Ergebnis..."}
            elif "1" in caps and "stimmung" in prompt.lower():
                return {"response": f"Der Text wurde simuliert analysiert. Die Stimmung ist positiv."}
            else:
                return {"response": "Das ist eine allgemeine Demo-Antwort."}
    raise HTTPException(404, detail="Agent nicht gefunden")
