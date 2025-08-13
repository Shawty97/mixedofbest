import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceChatInterfaceProps {
  agentId?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

interface CallState {
  isActive: boolean;
  isRecording: boolean;
  isMuted: boolean;
  duration: number;
}

export const VoiceChatInterface: React.FC<VoiceChatInterfaceProps> = ({
  agentId,
  onCallStart,
  onCallEnd,
  onError
}) => {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isRecording: false,
    isMuted: false,
    duration: 0
  });
  
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Here you would send the audio data to your backend
          console.log('Audio data available:', event.data);
        }
      };
      
      mediaRecorderRef.current.start(1000); // Record in 1-second chunks
      
      setCallState(prev => ({ ...prev, isActive: true, isRecording: true }));
      
      // Start audio level monitoring
      startAudioLevelMonitoring();
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      onCallStart?.();
    } catch (error) {
      console.error('Error starting call:', error);
      onError?.('Failed to start voice call. Please check microphone permissions.');
    }
  };

  const endCall = () => {
    if (mediaRecorderRef.current && callState.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    setCallState({
      isActive: false,
      isRecording: false,
      isMuted: false,
      duration: 0
    });
    
    setAudioLevel(0);
    onCallEnd?.();
  };

  const toggleMute = () => {
    if (mediaRecorderRef.current) {
      const tracks = mediaRecorderRef.current.stream.getAudioTracks();
      tracks.forEach(track => {
        track.enabled = callState.isMuted;
      });
      setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
    };
    
    intervalRef.current = setInterval(updateAudioLevel, 100);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Call Status */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {callState.isActive ? 'Voice Call Active' : 'Voice Chat'}
        </h3>
        {callState.isActive && (
          <p className="text-sm text-gray-600 mt-1">
            Duration: {formatDuration(callState.duration)}
          </p>
        )}
      </div>

      {/* Audio Visualization */}
      {callState.isActive && (
        <div className="flex items-center justify-center">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 bg-blue-500 rounded-full transition-all duration-150 ${
                  audioLevel * 5 > i ? 'h-8' : 'h-2'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!callState.isActive ? (
          <button
            onClick={startCall}
            className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 shadow-lg"
          >
            <Phone className="w-6 h-6" />
          </button>
        ) : (
          <>
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 shadow-md ${
                callState.isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Status Indicators */}
      {callState.isActive && (
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              callState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span>{callState.isRecording ? 'Recording' : 'Paused'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {callState.isMuted ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-green-500" />
            )}
            <span>{callState.isMuted ? 'Muted' : 'Active'}</span>
          </div>
        </div>
      )}

      {/* Agent Info */}
      {agentId && (
        <div className="text-center text-sm text-gray-500">
          Connected to Agent: {agentId}
        </div>
      )}
    </div>
  );
};

export default VoiceChatInterface;