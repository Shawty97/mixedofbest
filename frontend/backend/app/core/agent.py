# ... existing code ...
# Your working agent logic from /old/agent.py
# Enhanced with config-driven approach

from __future__ import annotations
import asyncio
import logging
import json
import os
from typing import Any, Dict
from datetime import datetime

from livekit import rtc, api
from livekit.agents import Agent, AgentSession, JobContext, JobRequest
from livekit.plugins import azure, silero, openai

from ..models.agent import Agent as AgentModel
from ..services.observability import ObservabilityService

class ConfigurableVoiceAgent(Agent):
    """Enhanced agent that uses database configuration"""
    
    def __init__(self, config: AgentModel, dial_info: Dict[str, Any]):
        # Get instructions from configuration JSON
        agent_config = config.configuration or {}
        instructions = agent_config.get("instructions", "You are a helpful assistant.")
        
        super().__init__(
            instructions=instructions,
            tools=self._load_agent_tools(config)
        )
        self.config = config
        self.dial_info = dial_info
        self.observability = ObservabilityService()
        self.conversation_transcript = []
        self.call_start_time = datetime.now()
    
    def _load_agent_tools(self, config: AgentModel):
        """Load tools based on agent configuration"""
        tools = []
        
        # Get configuration from JSON field
        agent_config = config.configuration or {}
        capabilities = agent_config.get("capabilities", [])
        
        # Add tools based on capabilities
        if "webhook" in capabilities:
            webhook_url = agent_config.get("webhook_url")
            if webhook_url:
                tools.append(self._create_webhook_tool(webhook_url))
        
        if "calendar" in capabilities:
            tools.append(self._create_calendar_tool())
            
        return tools
    
    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
        """Enhanced with observability"""
        await self.observability.log_interaction(
            agent_id=self.config.id,
            user_message=new_message.text_content,
            timestamp=datetime.now()
        )
        
        self.add_to_transcript("User", new_message.text_content)
        await super().on_user_turn_completed(turn_ctx, new_message)