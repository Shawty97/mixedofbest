
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info, Wifi, WifiOff } from "lucide-react";

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check backend status
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/status');
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
    
    // Check periodically
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getStatusInfo = () => {
    switch (backendStatus) {
      case 'checking':
        return { icon: Info, text: 'Backend-Status wird überprüft...', color: 'text-yellow-600' };
      case 'online':
        return { icon: Wifi, text: 'Backend verbunden', color: 'text-green-600' };
      case 'offline':
        return { icon: WifiOff, text: 'Backend offline - Demo-Modus aktiv', color: 'text-red-600' };
    }
  };

  const { icon: StatusIcon, text, color } = getStatusInfo();

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            🚀 <strong>AImpact Demo-Plattform</strong> - Entdecken Sie die Zukunft der KI-Orchestrierung!
          </span>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${color}`} />
            <span className={`text-sm ${color}`}>{text}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
