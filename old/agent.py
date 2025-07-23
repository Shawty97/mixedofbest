from __future__ import annotations

import asyncio
import logging
import json
import os
import psutil
import time
from datetime import datetime
from typing import Any
import importlib

from dotenv import load_dotenv

from livekit import rtc, api
from livekit.agents import (
    AgentSession,
    Agent,
    JobContext,
    JobProcess,
    JobRequest,
    RunContext,
    get_job_context,
    function_tool,
    cli,
    Worker,
    WorkerOptions,
)
from livekit.plugins import azure, silero, openai

# --- Setup ---
load_dotenv()
outbound_trunk_id = os.getenv("SIP_OUTBOUND_TRUNK_ID")

def prewarm(proc: JobProcess):
    """Prewarm models in the process"""
    start_time = time.time()
    logger.info("Starting prewarm process...")
    
    proc.userdata['vad_model'] = silero.VAD.load()
    proc.userdata['stt_client'] = azure.STT(language='de-DE', sample_rate=16000)
    proc.userdata['tts_client'] = azure.TTS(language='de-DE', voice='de-DE-KatjaNeural')
    proc.userdata['llm_model'] = openai.LLM.with_azure(
        azure_deployment=os.environ['AZURE_OPENAI_DEPLOYMENT_NAME'],
        azure_endpoint=os.environ['AZURE_OPENAI_ENDPOINT'],
        api_key=os.environ['AZURE_OPENAI_API_KEY'],
        api_version=os.environ['AZURE_OPENAI_API_VERSION'],
        model='gpt-4.1-mini',
        temperature=0.7,
    )
    
    prewarm_time = time.time() - start_time
    logger.info(f"Prewarm completed in {prewarm_time:.2f}s")

def optimized_load_fnc():
    """Non-blocking load function that monitors both CPU and memory"""
    cpu_load = psutil.cpu_percent(interval=None) / 100.0
    memory_load = psutil.virtual_memory().percent / 100.0
    return max(cpu_load, memory_load)

async def handle_job_request(req: JobRequest):
    """Handle incoming job requests with validation"""
    try:
        dial_info = json.loads(req.job.metadata)
        agent_name = dial_info.get("agent_name")
        
        if not agent_name or agent_name not in ALL_AGENT_CONFIGS:
            logger.warning(f"Rejecting job - Invalid agent_name: {agent_name}")
            await req.reject()
            return
            
        logger.info(f"Job accepted: {dial_info['phone_number']} for agent: {agent_name}")
        await req.accept(
            name=f"agent-{agent_name}",
            identity=f"outbound-{dial_info['phone_number']}",
        )
    except Exception as e:
        logger.error(f"Request handler error: {e}")
        await req.reject()

# Logging setup
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

# Silence noisy libraries
for noisy_logger in ["httpcore", "httpx", "openai", "urllib3", "aiohttp", "livekit.agents", "livekit"]:
    logging.getLogger(noisy_logger).setLevel(logging.CRITICAL)

logger = logging.getLogger("outbound-caller")

# Create logs directory
os.makedirs("logs/calls", exist_ok=True)
os.makedirs("logs/transcripts", exist_ok=True)

class OutboundCaller(Agent):
    def __init__(self, *, agent_config: dict, dial_info: dict[str, Any], tools: list = None):
        super().__init__(instructions=agent_config.get("instructions", ""), tools=tools)
        self.participant: rtc.RemoteParticipant | None = None
        self.dial_info = dial_info
        self.agent_config = agent_config
        self.conversation_transcript = []
        self.call_start_time = datetime.now()
        self._call_ended = False

    def set_participant(self, participant: rtc.RemoteParticipant):
        self.participant = participant

    def add_to_transcript(self, speaker: str, message: str):
        if message is None:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        if self.conversation_transcript:
            last_entry = self.conversation_transcript[-1]
            if (last_entry["speaker"] == speaker and 
                last_entry["message"] == message):
                return
        entry = {
            "time": timestamp,
            "speaker": speaker,
            "message": message
        }
        self.conversation_transcript.append(entry)
        logger.info(f"{speaker}: {message}")

    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
        logger.info(f"User said: {new_message.text_content}")
        self.add_to_transcript("Benutzer", new_message.text_content)
        await super().on_user_turn_completed(turn_ctx, new_message)

    def generate_call_summary(self):
        """Generate basic call summary - can be enhanced by agent-specific tools"""
        if not self.conversation_transcript:
            return "Kein Gespräch aufgezeichnet"
        
        user_messages = [t["message"] for t in self.conversation_transcript if t["speaker"] == "Benutzer"]
        agent_messages = [t["message"] for t in self.conversation_transcript if t["speaker"] == "Agent"]
        
        # Basic keyword detection - agent tools can do more sophisticated analysis
        appointment_mentioned = any("termin" in msg.lower() for msg in user_messages + agent_messages)
        time_mentioned = any(any(time_word in msg.lower() for time_word in ["morgen", "10:00", "zeit", "uhr"]) for msg in user_messages + agent_messages)
        
        if appointment_mentioned and time_mentioned:
            return "Terminvereinbarung - Kunde hat Beratungstermin vereinbart"
        elif appointment_mentioned:
            return "Terminvereinbarung - Beratungstermin-Optionen besprochen"
        else:
            return self.agent_config.get("ending", "Allgemeine Anfrage abgeschlossen.")

    async def send_completion_webhook(self):
        """Send call completion data using agent-specific webhook tool"""
        try:
            # Prepare standardized call data
            call_data = {
                "call_id": f"call_{self.call_start_time.strftime('%Y%m%d_%H%M%S')}",
                "phone_number": self.dial_info["phone_number"],
                "call_duration": str(datetime.now() - self.call_start_time),
                "call_start": self.call_start_time.isoformat(),
                "call_end": datetime.now().isoformat(),
                "status": "completed",
                "transcript": self.conversation_transcript,
                "summary": self.generate_call_summary(),
                "agent_name": self.agent_config.get("name", ""),
                "agent_config": self.agent_config,
                "metadata": self.dial_info
            }
            
            # Find and call agent-specific webhook tool
            agent_name = self.agent_config.get("name", "")
            webhook_tool_name = f"send_{agent_name}_webhook"
            
            # Get the loaded tools from session context
            # This will be called by the agent-specific webhook tool
            logger.info(f"Preparing webhook data for agent: {agent_name}")
            
            # For now, just log the data - the actual webhook call will be handled
            # by agent-specific tools loaded in the session
            return call_data
            
        except Exception as e:
            logger.error(f"Webhook preparation error: {e}")
            return None

    async def hangup(self):
        """Clean call termination"""
        if self._call_ended:
            return
        try:
            self._call_ended = True
            
            # Prepare webhook data
            call_data = await self.send_completion_webhook()
            
            # Try to send via agent-specific tool if available
            if call_data:
                logger.info("Call completion data prepared for webhook")
            
            # Clean shutdown
            job_ctx = get_job_context()
            if job_ctx and job_ctx.room:
                await job_ctx.api.room.delete_room(
                    api.DeleteRoomRequest(room=job_ctx.room.name)
                )
                logger.info("Call ended successfully")
        except Exception as e:
            logger.error(f"Hangup error: {e}")

def load_all_agent_configs():
    with open("agents_config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
    return config.get("agents", {})

ALL_AGENT_CONFIGS = load_all_agent_configs()

# Map agent names to tool modules
AGENT_TOOL_MODULES = {
    "sophia_de": ["tools.common_tools", "tools.real_estate_tools"],
    "sophia_en": ["tools.common_tools", "tools.real_estate_tools"],
    "emma_de": ["tools.common_tools"],
    "emma_en": ["tools.common_tools"],
    "emma_energy_de": ["tools.common_tools", "tools.energy_tools"],
    "emma_energy_en": ["tools.common_tools", "tools.energy_tools"]
}

def load_tools_for_agent(agent_name):
    """Load all function tools for specific agent"""
    modules = AGENT_TOOL_MODULES.get(agent_name, ["tools.common_tools"])
    tools = []
    for mod_name in modules:
        try:
            mod = importlib.import_module(mod_name)
            for attr in dir(mod):
                fn = getattr(mod, attr)
                if getattr(fn, "_is_function_tool", False):
                    tools.append(fn)
        except ImportError as e:
            logger.warning(f"Could not import {mod_name}: {e}")
    
    logger.info(f"Loaded {len(tools)} tools for agent: {agent_name}")
    return tools

async def entrypoint(ctx: JobContext):
    logger.info("Starting entrypoint")
    session_start_time = time.time()
    
    try:
        await ctx.connect()
        logger.info("Connected to LiveKit")
        
        # Parse call metadata
        dial_info = json.loads(ctx.job.metadata)
        agent_name = dial_info.get("agent_name")
        agent_config = ALL_AGENT_CONFIGS.get(agent_name)
        
        if not agent_config:
            logger.error(f"No config found for agent_name: {agent_name}")
            ctx.shutdown()
            return
            
        logger.info(f"Agent: {agent_name}, Phone: {dial_info['phone_number']}")
        
        # Load agent-specific tools
        agent_tools = load_tools_for_agent(agent_name)
        
        # Create agent instance
        agent = OutboundCaller(agent_config=agent_config, dial_info=dial_info, tools=agent_tools)
        
        # Create session with prewarmed models (tools are loaded via agent)
        session = AgentSession(
            stt=ctx.proc.userdata['stt_client'],
            vad=ctx.proc.userdata['vad_model'],
            tts=ctx.proc.userdata['tts_client'],
            llm=ctx.proc.userdata['llm_model'],
        )
        
        
        session_creation_time = time.time() - session_start_time
        logger.info(f"Session created in {session_creation_time:.2f}s")
        
        # Track agent responses for watchdog
        last_agent_response = [datetime.now()]
        
        # Event handlers
        @session.on("user_speech_committed")
        def on_user_speech(msg):
            logger.info(f"User: {msg.text}")
            agent.add_to_transcript("Benutzer", msg.text)
            
        @session.on("agent_speech_committed") 
        def on_agent_speech(msg):
            logger.info(f"Agent: {msg.text}")
            agent.add_to_transcript("Agent", msg.text)
            last_agent_response[0] = datetime.now()
        
        # Start session
        session_task = asyncio.create_task(
            session.start(agent=agent, room=ctx.room)
        )
        
        # Create SIP call
        logger.info("Creating SIP participant...")
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=outbound_trunk_id,
                sip_call_to=dial_info["phone_number"],
                participant_identity=dial_info["phone_number"],
                wait_until_answered=True,
            )
        )
        
        # Wait for participant connection
        participant = await ctx.wait_for_participant(identity=dial_info["phone_number"])
        agent.set_participant(participant)
        logger.info(f"Participant connected: {participant.identity}")
        
        # Send greeting
        greeting = agent_config.get("greeting", "Hallo, willkommen beim Sprachagenten.")
        logger.info(f"Sending greeting: '{greeting}'")
        greeting_speech = await session.say(greeting)
        agent.add_to_transcript("Agent", greeting)
        
        if greeting_speech:
            await greeting_speech.wait_for_playout()
        
        last_agent_response[0] = datetime.now()
        
        # Monitor call session
        try:
            while not agent._call_ended:
                await asyncio.sleep(0.5)
                
                # Watchdog timer
                time_since_response = datetime.now() - last_agent_response[0]
                if time_since_response.seconds > 15:
                    logger.warning(f"Agent silent for {time_since_response.seconds}s")
                    last_agent_response[0] = datetime.now()
                
                # Check participant connection
                if hasattr(participant, 'connection_state'):
                    if participant.connection_state != rtc.ConnectionState.CONNECTED:
                        break
                elif hasattr(participant, 'connected'):
                    if not participant.connected:
                        break
        except Exception as e:
            logger.info(f"Call ended: {e}")
        
        # Cleanup session
        try:
            await asyncio.wait_for(session_task, timeout=3)
        except asyncio.TimeoutError:
            logger.info("Session cleanup timeout")
        except Exception as e:
            logger.info(f"Session completed: {e}")
            
    except api.TwirpError as e:
        logger.error(f"SIP Error: {e.message}")
        ctx.shutdown()
    except Exception as e:
        logger.error(f"Agent Error: {e}")
        ctx.shutdown()

    # Save transcript to file
    async def save_transcript():
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"logs/transcripts/call_{dial_info['phone_number']}_{timestamp}.json"
            
            transcript_data = {
                "call_id": f"call_{timestamp}",
                "phone_number": dial_info["phone_number"],
                "agent_name": agent_name,
                "call_start": agent.call_start_time.isoformat(),
                "call_end": datetime.now().isoformat(),
                "duration": str(datetime.now() - agent.call_start_time),
                "status": "completed",
                "conversation": agent.conversation_transcript
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(transcript_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Transcript saved: {filename}")
        except Exception as e:
            logger.error(f"Transcript save error: {e}")

    ctx.add_shutdown_callback(save_transcript)

if __name__ == "__main__":
    print("Clean Agent Worker Started")
    options = WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="dynamic-agent",
        prewarm_fnc=prewarm,
        request_fnc=handle_job_request,
        num_idle_processes=8,
        load_fnc=optimized_load_fnc,
        load_threshold=0.60,
        drain_timeout=30,
    )
    cli.run_app(options)