"""
Enhanced agent engine that merges your working logic with config-driven approach
"""
from __future__ import annotations

import asyncio
import logging
import json
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from livekit import rtc, api
from livekit.agents import (
    Agent, AgentSession, JobContext, JobRequest, 
    function_tool, cli, Worker, WorkerOptions
)
from livekit.plugins import azure, silero

from ..models.agent import Agent as AgentModel, AgentConfig
from ..services.observability import ObservabilityService
from ..services.deployment import DeploymentService

logger = logging.getLogger("agent-engine")

class ConfigurableVoiceAgent(Agent):
    """Production voice agent with database configuration"""
    
    def __init__(self, config: AgentConfig, dial_info: Dict[str, Any]):
        # Load tools based on configuration
        tools = self._load_agent_tools(config)
        
        # Get instructions from configuration
        instructions = config.instructions
        
        super().__init__(
            instructions=instructions,
            tools=tools
        )
        
        self.config = config
        self.dial_info = dial_info
        self.observability = ObservabilityService()
        self.conversation_transcript = []
        self.call_start_time = datetime.now()
        self._call_ended = False
    
    def _load_agent_tools(self, config: AgentConfig) -> List:
        """Load tools based on agent configuration"""
        tools = []
        
        # Webhook tool
        if config.webhook_url:
            @function_tool
            async def send_webhook(data: str):
                """Send data to configured webhook"""
                return await self._send_webhook(config.webhook_url, data)
            tools.append(send_webhook)
        
        # Calendar tool
        if "calendar" in config.capabilities:
            @function_tool
            async def schedule_appointment(date: str, time: str, details: str):
                """Schedule an appointment"""
                return await self._schedule_appointment(date, time, details)
            tools.append(schedule_appointment)
        
        # CRM tool
        if "crm" in config.capabilities:
            @function_tool
            async def update_customer_record(phone: str, notes: str):
                """Update customer record in CRM"""
                return await self._update_crm(phone, notes)
            tools.append(update_customer_record)
        
        return tools
    
    async def _send_webhook(self, url: str, data: str) -> str:
        """Send webhook with call data"""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json={"data": data})
                return f"Webhook sent successfully: {response.status_code}"
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return f"Webhook failed: {str(e)}"
    
    async def _schedule_appointment(self, date: str, time: str, details: str) -> str:
        """Schedule appointment logic"""
        # Implement your calendar integration
        appointment_data = {
            "date": date,
            "time": time,
            "details": details,
            "phone": self.dial_info.get("phone_number"),
            "agent": self.config.name
        }
        
        # Log to observability
        await self.observability.log_event(
            agent_id=self.config.id,
            event_type="appointment_scheduled",
            data=appointment_data
        )
        
        return f"Termin für {date} um {time} wurde vorgemerkt. Details: {details}"
    
    async def _update_crm(self, phone: str, notes: str) -> str:
        """Update CRM record"""
        # Implement your CRM integration
        crm_data = {
            "phone": phone,
            "notes": notes,
            "updated_by": self.config.name,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.observability.log_event(
            agent_id=self.config.id,
            event_type="crm_updated",
            data=crm_data
        )
        
        return f"Kundendaten für {phone} wurden aktualisiert."
    
    def add_to_transcript(self, speaker: str, message: str):
        """Add message to conversation transcript"""
        if not message:
            return
            
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Avoid duplicates
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
        """Enhanced with observability and transcript logging"""
        user_message = new_message.text_content
        logger.info(f"User said: {user_message}")
        
        # Add to transcript
        self.add_to_transcript("User", user_message)
        
        # Log to observability
        await self.observability.log_interaction(
            agent_id=self.config.id,
            user_message=user_message,
            timestamp=datetime.now()
        )
        
        await super().on_user_turn_completed(turn_ctx, new_message)
    
    async def on_agent_turn_completed(self, turn_ctx, new_message) -> None:
        """Log agent responses"""
        agent_message = new_message.text_content
        self.add_to_transcript("Agent", agent_message)
        
        await self.observability.log_interaction(
            agent_id=self.config.id,
            agent_message=agent_message,
            timestamp=datetime.now()
        )
        
        await super().on_agent_turn_completed(turn_ctx, new_message)
    
    def generate_call_summary(self) -> str:
        """Generate intelligent call summary"""
        if not self.conversation_transcript:
            return "Kein Gespräch aufgezeichnet"
        
        user_messages = [t["message"] for t in self.conversation_transcript if t["speaker"] == "User"]
        agent_messages = [t["message"] for t in self.conversation_transcript if t["speaker"] == "Agent"]
        
        # Enhanced keyword detection
        appointment_keywords = ["termin", "appointment", "meeting", "treffen"]
        time_keywords = ["morgen", "heute", "uhr", "zeit", "clock", "time"]
        
        appointment_mentioned = any(
            any(keyword in msg.lower() for keyword in appointment_keywords)
            for msg in user_messages + agent_messages
        )
        
        time_mentioned = any(
            any(keyword in msg.lower() for keyword in time_keywords)
            for msg in user_messages + agent_messages
        )
        
        if appointment_mentioned and time_mentioned:
            return "Terminvereinbarung - Kunde hat Beratungstermin vereinbart"
        elif appointment_mentioned:
            return "Terminvereinbarung - Beratungstermin-Optionen besprochen"
        else:
            return self.config.ending_message or "Allgemeine Anfrage abgeschlossen."
    
    async def hangup(self):
        """Clean call termination with full logging"""
        if self._call_ended:
            return
        
        try:
            self._call_ended = True
            
            # Generate call summary
            summary = self.generate_call_summary()
            
            # Prepare call completion data
            call_data = {
                "call_id": f"call_{self.call_start_time.strftime('%Y%m%d_%H%M%S')}",
                "phone_number": self.dial_info["phone_number"],
                "call_duration": str(datetime.now() - self.call_start_time),
                "call_start": self.call_start_time.isoformat(),
                "call_end": datetime.now().isoformat(),
                "status": "completed",
                "transcript": self.conversation_transcript,
                "summary": summary,
                "agent_name": self.config.name,
                "agent_config_id": self.config.id
            }
            
            # Log call completion
            await self.observability.log_call_completion(call_data)
            
            # Send webhook if configured
            if self.config.webhook_url:
                await self._send_webhook(self.config.webhook_url, call_data)
            
            logger.info(f"Call completed: {summary}")
            
        except Exception as e:
            logger.error(f"Hangup error: {e}")

class AgentEngine:
    """Main engine for managing voice agents"""
    
    def __init__(self):
        self.deployment_service = DeploymentService()
        self.observability = ObservabilityService()
        self.active_agents: Dict[str, ConfigurableVoiceAgent] = {}
    
    async def start_agent(self, agent_model: AgentModel, dial_info: Dict[str, Any]) -> str:
        """Start a new agent instance"""
        try:
            # Convert AgentModel to AgentConfig
            config_data = {
                "id": agent_model.id,
                "name": agent_model.name,
                "description": agent_model.description,
                "instructions": agent_model.configuration.get("instructions", "You are a helpful assistant.") if agent_model.configuration else "You are a helpful assistant.",
                "capabilities": agent_model.configuration.get("capabilities", []) if agent_model.configuration else [],
                "webhook_url": agent_model.configuration.get("webhook_url") if agent_model.configuration else None,
                "ending_message": agent_model.configuration.get("ending_message") if agent_model.configuration else None,
                "voice_settings": agent_model.configuration.get("voice_settings") if agent_model.configuration else None,
            }
            config = AgentConfig(**config_data)
            
            agent = ConfigurableVoiceAgent(config, dial_info)
            agent_id = f"{config.id}_{dial_info['phone_number']}_{int(time.time())}"
            
            self.active_agents[agent_id] = agent
            
            # Log agent start
            await self.observability.log_event(
                agent_id=config.id,
                event_type="agent_started",
                data={"agent_instance_id": agent_id, "dial_info": dial_info}
            )
            
            return agent_id
            
        except Exception as e:
            logger.error(f"Failed to start agent: {e}")
            raise
    
    async def stop_agent(self, agent_instance_id: str):
        """Stop an agent instance"""
        if agent_instance_id in self.active_agents:
            agent = self.active_agents[agent_instance_id]
            await agent.hangup()
            del self.active_agents[agent_instance_id]
            
            await self.observability.log_event(
                agent_id=agent.config.id,
                event_type="agent_stopped",
                data={"agent_instance_id": agent_instance_id}
            )
    
    def get_active_agents(self) -> Dict[str, Dict]:
        """Get list of active agent instances"""
        return {
            agent_id: {
                "config_id": agent.config.id,
                "config_name": agent.config.name,
                "phone_number": agent.dial_info.get("phone_number"),
                "start_time": agent.call_start_time.isoformat(),
                "duration": str(datetime.now() - agent.call_start_time)
            }
            for agent_id, agent in self.active_agents.items()
        }
    
    async def test_agent(self, agent_model: AgentModel, test_message: str) -> str:
        """Test an agent with a message"""
        try:
            # Convert AgentModel to AgentConfig for testing
            config_data = {
                "id": agent_model.id,
                "name": agent_model.name,
                "description": agent_model.description,
                "instructions": agent_model.configuration.get("instructions", "You are a helpful assistant.") if agent_model.configuration else "You are a helpful assistant.",
                "capabilities": agent_model.configuration.get("capabilities", []) if agent_model.configuration else [],
                "webhook_url": agent_model.configuration.get("webhook_url") if agent_model.configuration else None,
                "ending_message": agent_model.configuration.get("ending_message") if agent_model.configuration else None,
                "voice_settings": agent_model.configuration.get("voice_settings") if agent_model.configuration else None,
            }
            config = AgentConfig(**config_data)
            
            # For testing, we'll simulate a simple response based on instructions
            # In a real implementation, this would use the actual agent logic
            response = f"Agent '{config.name}' received: '{test_message}'. Response based on instructions: {config.instructions[:100]}..."
            
            # Log the test
            await self.observability.log_event(
                agent_id=config.id,
                event_type="agent_tested",
                data={"test_message": test_message, "response": response}
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to test agent: {e}")
            return f"Error testing agent: {str(e)}"
    
    async def deploy_agent(self, agent_model: AgentModel, environment: str = "development"):
        """Deploy an agent to an environment"""
        try:
            # Convert AgentModel to config dict for deployment
            config_data = {
                "id": agent_model.id,
                "name": agent_model.name,
                "description": agent_model.description,
                "configuration": agent_model.configuration or {}
            }
            
            deployment = await self.deployment_service.deploy_agent(config_data, environment)
            
            # Log the deployment
            await self.observability.log_event(
                agent_id=agent_model.id,
                event_type="agent_deployed",
                data={"environment": environment, "deployment_id": deployment["id"]}
            )
            
            return deployment
            
        except Exception as e:
            logger.error(f"Failed to deploy agent: {e}")
            raise