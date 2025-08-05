"""
LiveKit Service Integration for Universal Agent Platform
Handles real-time voice communication and room management
"""
import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from livekit import api
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class LiveKitService:
    """LiveKit service for real-time communication"""
    
    def __init__(self):
        self.api_key = os.getenv("LIVEKIT_API_KEY")
        self.api_secret = os.getenv("LIVEKIT_API_SECRET")
        self.livekit_url = os.getenv("LIVEKIT_URL")
        
        if not all([self.api_key, self.api_secret, self.livekit_url]):
            logger.warning("LiveKit credentials not complete. Real-time features will be limited.")
            self.livekit_api = None
        else:
            try:
                self.livekit_api = api.LiveKitAPI(
                    url=self.livekit_url,
                    api_key=self.api_key,
                    api_secret=self.api_secret
                )
            except Exception as e:
                logger.error(f"Failed to initialize LiveKit API: {e}")
                self.livekit_api = None
        
        # Room configurations
        self.room_configs = {
            "voice_agent": {
                "max_participants": 5,
                "empty_timeout": 600,  # 10 minutes
                "metadata": {"type": "voice_agent", "agent_enabled": True}
            },
            "interview": {
                "max_participants": 3,
                "empty_timeout": 1800,  # 30 minutes
                "metadata": {"type": "interview", "recording_enabled": True}
            },
            "group_call": {
                "max_participants": 20,
                "empty_timeout": 300,  # 5 minutes
                "metadata": {"type": "group_call", "agent_enabled": False}
            }
        }
    
    async def generate_token(
        self, 
        room_name: str, 
        participant_name: str,
        permissions: Optional[Dict[str, bool]] = None
    ) -> str:
        """Generate access token for participant"""
        
        if not all([self.api_key, self.api_secret]):
            raise ValueError("LiveKit credentials not configured")
        
        # Set default permissions
        if permissions is None:
            permissions = {"can_publish": True, "can_subscribe": True}
        
        try:
            grants = api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=permissions.get("can_publish", True),
                can_subscribe=permissions.get("can_subscribe", True)
            )
            
            token = api.AccessToken(self.api_key, self.api_secret) \
                .with_identity(participant_name) \
                .with_name(participant_name) \
                .with_grants(grants)
            
            jwt_token = token.to_jwt()
            logger.info(f"Generated token for {participant_name} in room {room_name}")
            return jwt_token
            
        except Exception as e:
            logger.error(f"Failed to generate token: {e}")
            raise
    
    async def create_room(
        self, 
        room_name: str,
        room_type: str = "voice_agent",
        max_participants: Optional[int] = None
    ) -> Dict[str, Any]:
        """Create a new LiveKit room"""
        
        if not self.livekit_api:
            raise ValueError("LiveKit API not initialized")
        
        config = self.room_configs.get(room_type, self.room_configs["voice_agent"])
        
        if max_participants:
            config = config.copy()
            config["max_participants"] = max_participants
        
        try:
            room_request = api.CreateRoomRequest(
                name=room_name,
                max_participants=config["max_participants"],
                empty_timeout=config["empty_timeout"],
                metadata=str(config["metadata"])
            )
            
            room = await self.livekit_api.room.create_room(room_request)
            
            logger.info(f"Created {room_type} room: {room_name}")
            return {
                "name": room.name,
                "creation_time": room.creation_time,
                "max_participants": room.max_participants,
                "metadata": config["metadata"],
                "room_type": room_type
            }
            
        except Exception as e:
            logger.error(f"Failed to create room {room_name}: {e}")
            raise
    
    async def list_rooms(self) -> List[Dict[str, Any]]:
        """List all active rooms"""
        
        if not self.livekit_api:
            return []
        
        try:
            response = await self.livekit_api.room.list_rooms(
                api.ListRoomsRequest()
            )
            
            rooms = []
            for room in response.rooms:
                rooms.append({
                    "name": room.name,
                    "creation_time": room.creation_time,
                    "num_participants": room.num_participants,
                    "max_participants": room.max_participants,
                    "metadata": room.metadata
                })
            
            return rooms
            
        except Exception as e:
            logger.error(f"Failed to list rooms: {e}")
            return []
    
    async def delete_room(self, room_name: str) -> bool:
        """Delete a room"""
        
        if not self.livekit_api:
            raise ValueError("LiveKit API not initialized")
        
        try:
            await self.livekit_api.room.delete_room(
                api.DeleteRoomRequest(room=room_name)
            )
            
            logger.info(f"Deleted room: {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete room {room_name}: {e}")
            return False
    
    async def list_participants(self, room_name: str) -> List[Dict[str, Any]]:
        """List participants in a room"""
        
        if not self.livekit_api:
            return []
        
        try:
            response = await self.livekit_api.room.list_participants(
                api.ListParticipantsRequest(room=room_name)
            )
            
            participants = []
            for participant in response.participants:
                participants.append({
                    "identity": participant.identity,
                    "name": participant.name,
                    "joined_at": participant.joined_at,
                    "tracks": len(participant.tracks),
                    "metadata": participant.metadata
                })
            
            return participants
            
        except Exception as e:
            logger.error(f"Failed to list participants for room {room_name}: {e}")
            return []
    
    async def remove_participant(self, room_name: str, participant_identity: str) -> bool:
        """Remove participant from room"""
        
        if not self.livekit_api:
            raise ValueError("LiveKit API not initialized")
        
        try:
            await self.livekit_api.room.remove_participant(
                api.RemoveParticipantRequest(
                    room=room_name,
                    identity=participant_identity
                )
            )
            
            logger.info(f"Removed participant {participant_identity} from room {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove participant {participant_identity}: {e}")
            return False
    
    def get_room_configs(self) -> Dict[str, Any]:
        """Get available room configurations"""
        return self.room_configs.copy()
    
    def is_configured(self) -> bool:
        """Check if LiveKit is properly configured"""
        return self.livekit_api is not None

# Global LiveKit service instance
livekit_service = LiveKitService()