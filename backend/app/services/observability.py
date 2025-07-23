"""
Observability service for monitoring agent performance and interactions
"""
import logging
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger("observability")


class ObservabilityService:
    """Service for tracking agent performance and interactions"""
    
    def __init__(self):
        self.logger = logger
    
    async def log_event(self, agent_id: int, event_type: str, data: Dict[str, Any]):
        """Log an agent event"""
        try:
            event_data = {
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent_id,
                "event_type": event_type,
                "data": data
            }
            self.logger.info(f"Agent Event: {event_data}")
            # TODO: Store in database or send to monitoring system
        except Exception as e:
            self.logger.error(f"Failed to log event: {e}")
    
    async def log_interaction(self, agent_id: int, user_message: Optional[str] = None, 
                            agent_message: Optional[str] = None, timestamp: Optional[datetime] = None):
        """Log a conversation interaction"""
        try:
            interaction_data = {
                "timestamp": (timestamp or datetime.now()).isoformat(),
                "agent_id": agent_id,
                "user_message": user_message,
                "agent_message": agent_message
            }
            self.logger.info(f"Interaction: {interaction_data}")
            # TODO: Store in database for analytics
        except Exception as e:
            self.logger.error(f"Failed to log interaction: {e}")
    
    async def log_call_completion(self, call_data: Dict[str, Any]):
        """Log call completion data"""
        try:
            self.logger.info(f"Call Completed: {call_data}")
            # TODO: Store in database and trigger analytics
        except Exception as e:
            self.logger.error(f"Failed to log call completion: {e}")