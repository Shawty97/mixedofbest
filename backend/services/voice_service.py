"""
Voice Service Integration for Universal Agent Platform
Handles Text-to-Speech using ElevenLabs and Speech-to-Text using Azure
"""
import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
import azure.cognitiveservices.speech as speechsdk
from elevenlabs.client import ElevenLabs
import tempfile
import base64
from io import BytesIO

logger = logging.getLogger(__name__)

class VoiceService:
    """Voice service for TTS and STT operations"""
    
    def __init__(self):
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.azure_speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.azure_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
        
        # Initialize ElevenLabs client
        if self.elevenlabs_api_key:
            self.elevenlabs_client = ElevenLabs(api_key=self.elevenlabs_api_key)
        else:
            self.elevenlabs_client = None
            logger.warning("ElevenLabs API key not found. TTS will be limited.")
        
        # Initialize Azure Speech config
        if self.azure_speech_key:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.azure_speech_key,
                region=self.azure_region
            )
        else:
            self.speech_config = None
            logger.warning("Azure Speech key not found. STT will be limited.")
        
        # Voice configurations - Updated with current ElevenLabs voice IDs
        self.voice_profiles = {
            "professional_male": "JBFqnCBsd6RMkjVDRZzb",    # George
            "professional_female": "EXAVITQu4vr4xnSDxMaL",  # Sarah
            "friendly_male": "IKne3meq5aSn9XLyUdCD",        # Charlie
            "friendly_female": "9BWtsMINqrJLrRacOk9x",      # Aria
            "customer_service": "EXAVITQu4vr4xnSDxMaL",     # Sarah
            "technical_expert": "JBFqnCBsd6RMkjVDRZzb"      # George
        }
    
    async def text_to_speech(
        self, 
        text: str,
        voice_id: Optional[str] = None,
        voice_profile: str = "professional_female"
    ) -> str:
        """Convert text to speech and return base64 encoded audio"""
        
        if not self.elevenlabs_client:
            raise ValueError("ElevenLabs client not initialized")
        
        # Get voice ID from profile or use provided
        if not voice_id:
            voice_id = self.voice_profiles.get(voice_profile, self.voice_profiles["professional_female"])
        
        try:
            # Generate audio using the correct API
            audio = self.elevenlabs_client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id="eleven_monolingual_v1"
            )
            
            # Convert to base64 for frontend
            audio_bytes = b"".join(audio)
            audio_base64 = base64.b64encode(audio_bytes).decode()
            
            logger.info(f"Generated TTS audio for text length: {len(text)}")
            return audio_base64
            
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            raise
    
    async def speech_to_text(
        self, 
        audio_data: bytes,
        language: str = "en-US"
    ) -> Dict[str, Any]:
        """Convert speech to text using Azure Speech Services"""
        
        if not self.speech_config:
            raise ValueError("Azure Speech config not initialized")
        
        try:
            # Configure for the specified language
            self.speech_config.speech_recognition_language = language
            
            # Create audio config from bytes
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                audio_config = speechsdk.audio.AudioConfig(filename=temp_file.name)
                
                # Create recognizer
                recognizer = speechsdk.SpeechRecognizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
                
                # Perform recognition
                result = recognizer.recognize_once()
                
                # Process results
                if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    return {
                        "success": True,
                        "text": result.text,
                        "confidence": self._extract_confidence(result),
                        "language": language
                    }
                elif result.reason == speechsdk.ResultReason.NoMatch:
                    return {
                        "success": False,
                        "error": "No speech could be recognized",
                        "text": "",
                        "confidence": 0.0
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Recognition failed: {result.reason}",
                        "text": "",
                        "confidence": 0.0
                    }
                    
        except Exception as e:
            logger.error(f"STT recognition failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "confidence": 0.0
            }
    
    async def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available ElevenLabs voices"""
        
        if not self.elevenlabs_client:
            return []
        
        try:
            voices = self.elevenlabs_client.voices.get_all()
            return [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category,
                    "description": voice.description
                }
                for voice in voices.voices
            ]
        except Exception as e:
            logger.error(f"Failed to get voices: {e}")
            return []
    
    async def clone_voice(
        self, 
        voice_name: str,
        audio_files: List[bytes],
        description: str = ""
    ) -> Dict[str, Any]:
        """Clone a voice using ElevenLabs voice cloning"""
        
        if not self.elevenlabs_client:
            raise ValueError("ElevenLabs client not initialized")
        
        try:
            # Convert audio bytes to files for upload
            files = []
            for i, audio_bytes in enumerate(audio_files):
                files.append((f"sample_{i}.mp3", BytesIO(audio_bytes)))
            
            # Create voice clone
            voice = self.elevenlabs_client.clone(
                name=voice_name,
                files=files,
                description=description
            )
            
            return {
                "success": True,
                "voice_id": voice.voice_id,
                "name": voice.name,
                "message": "Voice cloned successfully"
            }
            
        except Exception as e:
            logger.error(f"Voice cloning failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _extract_confidence(self, result: speechsdk.SpeechRecognitionResult) -> float:
        """Extract confidence score from recognition result"""
        try:
            import json
            json_result = result.properties.get(
                speechsdk.PropertyId.SpeechServiceResponse_JsonResult
            )
            if json_result:
                parsed_result = json.loads(json_result)
                return parsed_result.get("Confidence", 0.0)
        except Exception:
            pass
        return 0.0
    
    def get_voice_profiles(self) -> Dict[str, str]:
        """Get available voice profiles"""
        return self.voice_profiles.copy()

# Global voice service instance
voice_service = VoiceService()