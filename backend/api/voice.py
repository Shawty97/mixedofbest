"""
Voice API endpoints for Universal Agent Platform
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

from services.voice_service import voice_service

router = APIRouter(prefix="/api/voice", tags=["voice"])

class TTSRequest(BaseModel):
    text: str
    voice_profile: str = "professional_female"
    voice_id: Optional[str] = None

class CloneVoiceRequest(BaseModel):
    voice_name: str
    description: str = ""

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech"""
    try:
        audio_base64 = await voice_service.text_to_speech(
            text=request.text,
            voice_id=request.voice_id,
            voice_profile=request.voice_profile
        )
        return {
            "success": audio_base64 is not None,
            "audio_base64": audio_base64,
            "voice_profile": request.voice_profile,
            "provider_used": voice_service.last_provider,
            "text_length": len(request.text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stt")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: str = "en-US"
):
    """Convert speech to text"""
    try:
        audio_data = await audio_file.read()
        result = await voice_service.speech_to_text(
            audio_data=audio_data,
            language=language
        )
        return {
            "success": result.get("success", False),
            "text": result.get("text", ""),
            "confidence": result.get("confidence", 0.0),
            "language": language,
            "error": result.get("error")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_available_voices():
    """Get list of available voices"""
    try:
        voices = await voice_service.get_available_voices()
        profiles = voice_service.get_voice_profiles()
        return {
            "success": True,
            "voices": voices,
            "voice_profiles": profiles,
            "message": "Voices retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clone")
async def clone_voice(
    request: CloneVoiceRequest,
    audio_files: List[UploadFile] = File(...)
):
    """Clone a voice using audio samples"""
    try:
        audio_data_list = []
        for audio_file in audio_files:
            audio_data = await audio_file.read()
            audio_data_list.append(audio_data)
        result = await voice_service.clone_voice(
            voice_name=request.voice_name,
            audio_files=audio_data_list,
            description=request.description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles")
async def get_voice_profiles():
    """Get available voice profiles"""
    profiles = voice_service.get_voice_profiles()
    return {
        "success": True,
        "profiles": profiles,
        "message": "Voice profiles retrieved successfully"
    }