"""
Voice Service Integration for Universal Agent Platform
Handles Text-to-Speech using Azure (primary) with ElevenLabs fallback, and Speech-to-Text using Azure
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
        self.last_provider: Optional[str] = None
        
        # Initialize ElevenLabs client
        if self.elevenlabs_api_key:
            self.elevenlabs_client = ElevenLabs(api_key=self.elevenlabs_api_key)
        else:
            self.elevenlabs_client = None
            logger.warning("ElevenLabs API key not found. TTS fallback to Azure only.")
        
        # Initialize Azure Speech config (for STT and TTS)
        if self.azure_speech_key:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.azure_speech_key,
                region=self.azure_region
            )
            try:
                # Prefer MP3 output for browser compatibility
                self.speech_config.set_speech_synthesis_output_format(
                    speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
                )
            except Exception:
                pass
        else:
            self.speech_config = None
            logger.warning("Azure Speech key not found. STT/TTS will be limited.")
        
        # Voice configurations - ElevenLabs IDs
        self.voice_profiles = {
            "professional_male": "JBFqnCBsd6RMkjVDRZzb",    # George
            "professional_female": "EXAVITQu4vr4xnSDxMaL",  # Sarah
            "friendly_male": "IKne3meq5aSn9XLyUdCD",        # Charlie
            "friendly_female": "9BWtsMINqrJLrRacOk9x",      # Aria
            "customer_service": "EXAVITQu4vr4xnSDxMaL",     # Sarah
            "technical_expert": "JBFqnCBsd6RMkjVDRZzb"      # George
        }
        
        # Azure neural voice mapping aligned with our profiles
        self.azure_voices = {
            "professional_female": "en-US-JennyNeural",
            "professional_male": "en-US-GuyNeural",
            "friendly_female": "en-US-AriaNeural",
            "friendly_male": "en-US-DavisNeural",
            "customer_service": "en-US-JennyNeural",
            "technical_expert": "en-US-GuyNeural",
        }
    
    async def text_to_speech(
        self, 
        text: str,
        voice_id: Optional[str] = None,
        voice_profile: str = "professional_female"
    ) -> Optional[str]:
        """Convert text to speech and return base64 encoded MP3.
        Priority: Azure → ElevenLabs → None (text-only).
        Sets self.last_provider accordingly.
        """
        self.last_provider = None
        
        # 1) Azure (primary)
        if self.speech_config:
            try:
                azure_voice = self.azure_voices.get(voice_profile, "en-US-JennyNeural")
                self.speech_config.speech_synthesis_voice_name = azure_voice
                audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config, audio_config=audio_config)
                result = await asyncio.get_event_loop().run_in_executor(None, lambda: synthesizer.speak_text_async(text).get())
                if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                    audio_bytes = getattr(result, "audio_data", None)
                    if not audio_bytes:
                        try:
                            stream = speechsdk.AudioDataStream(result)
                            chunks = []
                            buff = bytearray(4096)
                            while True:
                                read = stream.read_data(buff)
                                if read == 0:
                                    break
                                chunks.append(bytes(buff[:read]))
                            audio_bytes = b"".join(chunks)
                        except Exception:
                            audio_bytes = b""
                    if audio_bytes:
                        self.last_provider = "azure"
                        return base64.b64encode(audio_bytes).decode()
                    else:
                        logger.error("Azure TTS produced empty audio bytes")
                else:
                    logger.error(f"Azure TTS failed with reason: {result.reason}")
            except Exception as e:
                logger.warning(f"Azure TTS error, will try ElevenLabs: {e}")
        else:
            logger.info("Azure not configured; skipping Azure TTS")
        
        # 2) ElevenLabs fallback
        if self.elevenlabs_client:
            try:
                if not voice_id:
                    voice_id = self.voice_profiles.get(voice_profile, self.voice_profiles["professional_female"])
                audio = self.elevenlabs_client.text_to_speech.convert(
                    text=text,
                    voice_id=voice_id,
                    model_id="eleven_monolingual_v1"
                )
                audio_bytes = b"".join(audio)
                self.last_provider = "elevenlabs"
                return base64.b64encode(audio_bytes).decode()
            except Exception as e:
                logger.warning(f"ElevenLabs TTS failed, will return text-only: {e}")
        else:
            logger.info("ElevenLabs not configured; cannot use fallback")
        
        # 3) None available → text-only mode
        logger.warning("All TTS providers unavailable; returning None for text-only fallback")
        return None
    
    async def speech_to_text(
        self, 
        audio_data: bytes,
        language: str = "en-US"
    ) -> Dict[str, Any]:
        """Convert speech to text using Azure Speech Services"""
        
        if not self.speech_config:
            raise ValueError("Azure Speech config not initialized")
        
        try:
            self.speech_config.speech_recognition_language = language
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                audio_config = speechsdk.audio.AudioConfig(filename=temp_file.name)
                recognizer = speechsdk.SpeechRecognizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
                result = recognizer.recognize_once()
                if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    return {
                        "success": True,
                        "text": result.text,
                        "confidence": self._extract_confidence(result),
                        "language": language
                    }
                elif result.reason == speechsdk.ResultReason.NoMatch:
                    return {"success": False, "error": "No speech could be recognized", "text": "", "confidence": 0.0}
                else:
                    return {"success": False, "error": f"Recognition failed: {result.reason}", "text": "", "confidence": 0.0}
        except Exception as e:
            logger.error(f"STT recognition failed: {e}")
            return {"success": False, "error": str(e), "text": "", "confidence": 0.0}
    
    async def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available ElevenLabs voices"""
        if not self.elevenlabs_client:
            return []
        try:
            voices = self.elevenlabs_client.voices.get_all()
            return [{"voice_id": v.voice_id, "name": v.name, "category": v.category, "description": v.description} for v in voices.voices]
        except Exception as e:
            logger.error(f"Failed to get voices: {e}")
            return []
    
    async def clone_voice(self, voice_name: str, audio_files: List[bytes], description: str = "") -> Dict[str, Any]:
        """Clone a voice using ElevenLabs voice cloning"""
        if not self.elevenlabs_client:
            raise ValueError("ElevenLabs client not initialized")
        try:
            files = []
            for i, audio_bytes in enumerate(audio_files):
                files.append((f"sample_{i}.mp3", BytesIO(audio_bytes)))
            voice = self.elevenlabs_client.clone(name=voice_name, files=files, description=description)
            return {"success": True, "voice_id": voice.voice_id, "name": voice.name, "message": "Voice cloned successfully"}
        except Exception as e:
            logger.error(f"Voice cloning failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_confidence(self, result: speechsdk.SpeechRecognitionResult) -> float:
        try:
            import json
            json_result = result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult)
            if json_result:
                parsed_result = json.loads(json_result)
                return parsed_result.get("Confidence", 0.0)
        except Exception:
            pass
        return 0.0
    
    def get_voice_profiles(self) -> Dict[str, str]:
        return self.voice_profiles.copy()

# Global voice service instance
voice_service = VoiceService()