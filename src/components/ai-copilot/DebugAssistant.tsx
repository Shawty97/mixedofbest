
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, AlertCircle, CheckCircle, Clock, Search, Zap } from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';
import { toast } from '@/hooks/use-toast';

interface DebugSession {
  id: string;
  error_type: string;
  description: string;
  context: any;
  status: 'analyzing' | 'diagnosed' | 'resolved' | 'escalated';
  diagnosis?: string;
  solutions?: string[];
  created_at: Date;
}

export function DebugAssistant() {
  const [currentError, setCurrentError] = useState('');
  const [errorDescription, setErrorDescription] = useState('');
  const [debugSessions, setDebugSessions] = useState<DebugSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DebugSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { sendCommand, workflowContext } = useEnhancedCopilotStore();

  useEffect(() => {
    // Load recent debug sessions from local storage
    const savedSessions = localStorage.getItem('debug_sessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        created_at: new Date(s.created_at)
      }));
      setDebugSessions(sessions);
    }
  }, []);

  const saveDebugSessions = (sessions: DebugSession[]) => {
    localStorage.setItem('debug_sessions', JSON.stringify(sessions));
    setDebugSessions(sessions);
  };

  const analyzeError = async () => {
    if (!currentError.trim()) {
      toast({
        title: "Fehler erforderlich",
        description: "Bitte geben Sie eine Fehlerbeschreibung ein.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    const newSession: DebugSession = {
      id: `debug_${Date.now()}`,
      error_type: currentError,
      description: errorDescription,
      context: workflowContext,
      status: 'analyzing',
      created_at: new Date()
    };

    const updatedSessions = [newSession, ...debugSessions];
    saveDebugSessions(updatedSessions);
    setSelectedSession(newSession);

    try {
      // Create comprehensive debugging prompt
      const debugPrompt = `
DEBUGGING REQUEST:
Error: ${currentError}
Description: ${errorDescription}

Current Workflow Context:
${JSON.stringify(workflowContext, null, 2)}

Please provide:
1. Likely root cause analysis
2. Step-by-step debugging approach
3. Specific solutions ranked by probability of success
4. Prevention strategies for future

Format your response with clear sections for each point.
      `.trim();

      await sendCommand(debugPrompt);

      // Simulate AI analysis with realistic diagnosis
      setTimeout(() => {
        const diagnosis = generateDiagnosis(currentError, errorDescription);
        const solutions = generateSolutions(currentError);

        const updatedSession: DebugSession = {
          ...newSession,
          status: 'diagnosed',
          diagnosis: diagnosis,
          solutions: solutions
        };

        const updatedSessions = [updatedSession, ...debugSessions.slice(1)];
        saveDebugSessions(updatedSessions);
        setSelectedSession(updatedSession);

        toast({
          title: "Analyse abgeschlossen",
          description: "Fehlerbehebungsvorschläge wurden generiert.",
        });
      }, 2000);

    } catch (error) {
      console.error('Debug analysis error:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: "Fehler bei der Fehleranalyse. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });

      const updatedSession: DebugSession = {
        ...newSession,
        status: 'escalated'
      };

      const updatedSessions = [updatedSession, ...debugSessions.slice(1)];
      saveDebugSessions(updatedSessions);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDiagnosis = (errorType: string, description: string): string => {
    const lowerError = errorType.toLowerCase();
    const lowerDesc = description.toLowerCase();

    if (lowerError.includes('connection') || lowerError.includes('network')) {
      return `Netzwerkverbindungsproblem erkannt. Ursachen können sein: API-Endpunkt nicht erreichbar, Authentifizierungsfehler, oder temporäre Netzwerkprobleme. Die Workflow-Ausführung wurde unterbrochen, da externe Services nicht verfügbar sind.`;
    }

    if (lowerError.includes('timeout') || lowerDesc.includes('timeout')) {
      return `Zeitüberschreitung erkannt. Der Workflow-Knoten überschreitet die konfigurierten Timeout-Limits. Dies kann durch hohe API-Latenz, große Datenmengen oder unoptimierte Verarbeitungsschritte verursacht werden.`;
    }

    if (lowerError.includes('authentication') || lowerError.includes('auth')) {
      return `Authentifizierungsfehler identifiziert. API-Schlüssel sind möglicherweise ungültig, abgelaufen oder haben unzureichende Berechtigungen für die angeforderte Operation.`;
    }

    if (lowerError.includes('rate limit') || lowerError.includes('quota')) {
      return `Rate-Limiting erkannt. Die API-Nutzungsgrenze wurde überschritten. Der Service blockiert weitere Anfragen bis zur Zurücksetzung des Limits.`;
    }

    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return `Datenvalidierungsfehler festgestellt. Eingabedaten entsprechen nicht dem erwarteten Format oder Schema der API. Überprüfung der Datentypen und -struktur erforderlich.`;
    }

    return `Allgemeiner Fehler erkannt. Basierend auf der Beschreibung "${description}" sind weitere Untersuchungen der Workflow-Konfiguration und Datenflüsse erforderlich.`;
  };

  const generateSolutions = (errorType: string): string[] => {
    const lowerError = errorType.toLowerCase();

    if (lowerError.includes('connection') || lowerError.includes('network')) {
      return [
        'API-Endpunkt URL und Konfiguration überprüfen',
        'Internetverbindung und Firewall-Einstellungen testen',
        'Retry-Mechanismus mit exponential backoff implementieren',
        'Alternative API-Endpunkte oder Fallback-Services konfigurieren',
        'Netzwerk-Monitoring für externe Dependencies einrichten'
      ];
    }

    if (lowerError.includes('timeout')) {
      return [
        'Timeout-Limits in Workflow-Knoten erhöhen',
        'Eingabedaten chunking für große Datensätze implementieren',
        'Asynchrone Verarbeitung mit Status-Polling einrichten',
        'API-Performance und Response-Zeiten analysieren',
        'Workflow in kleinere, parallelisierbare Schritte aufteilen'
      ];
    }

    if (lowerError.includes('authentication') || lowerError.includes('auth')) {
      return [
        'API-Schlüssel aktualisieren und Gültigkeit prüfen',
        'OAuth2-Flow überprüfen und Token erneuern',
        'Berechtigungen und Scopes der API-Credentials verifizieren',
        'Sichere Schlüsselverwaltung in Umgebungsvariablen implementieren',
        'API-Provider Dokumentation für Authentifizierung konsultieren'
      ];
    }

    if (lowerError.includes('rate limit') || lowerError.includes('quota')) {
      return [
        'Request-Rate reduzieren und Delays zwischen Aufrufen einführen',
        'Request-Batching zur Effizienzsteigerung implementieren',
        'Premium API-Plan für höhere Limits erwägen',
        'Caching-Strategien zur Reduzierung redundanter Aufrufe',
        'Load-Balancing zwischen mehreren API-Schlüsseln'
      ];
    }

    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return [
        'Input-Datenvalidierung vor API-Aufrufen implementieren',
        'API-Schema und erwartete Datenformate dokumentieren',
        'Datentyp-Konvertierung und -Normalisierung hinzufügen',
        'Error-Handling für ungültige Eingaben verbessern',
        'Unit-Tests für Datenvalidierung erstellen'
      ];
    }

    return [
      'Workflow-Logs und Error-Details detailliert analysieren',
      'Systematisches Debugging durch schrittweise Deaktivierung von Knoten',
      'Datenfluss und Variablen-Zuweisungen überprüfen',
      'API-Dokumentation und Best-Practices konsultieren',
      'Community-Support oder technischen Support kontaktieren'
    ];
  };

  const markAsResolved = (sessionId: string) => {
    const updatedSessions = debugSessions.map(session =>
      session.id === sessionId
        ? { ...session, status: 'resolved' as const }
        : session
    );
    saveDebugSessions(updatedSessions);
    
    if (selectedSession?.id === sessionId) {
      setSelectedSession({ ...selectedSession, status: 'resolved' });
    }

    toast({
      title: "Als gelöst markiert",
      description: "Debug-Session wurde erfolgreich abgeschlossen.",
    });
  };

  const getStatusIcon = (status: DebugSession['status']) => {
    switch (status) {
      case 'analyzing': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'diagnosed': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'escalated': return <Bug className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: DebugSession['status']) => {
    switch (status) {
      case 'analyzing': return 'bg-yellow-50 border-yellow-200';
      case 'diagnosed': return 'bg-blue-50 border-blue-200';
      case 'resolved': return 'bg-green-50 border-green-200';
      case 'escalated': return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Debug-Assistent</h3>
        <p className="text-sm text-gray-600">
          KI-gestützte Fehleranalyse und Lösungsvorschläge
        </p>
      </div>

      {/* New debug session form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Neuen Fehler analysieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Fehlertyp</label>
            <Input
              value={currentError}
              onChange={(e) => setCurrentError(e.target.value)}
              placeholder="z.B. Connection Timeout, Authentication Error..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Beschreibung (optional)</label>
            <Textarea
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              placeholder="Detaillierte Beschreibung des Problems..."
              rows={3}
            />
          </div>
          <Button 
            onClick={analyzeError}
            disabled={isAnalyzing || !currentError.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analysiere...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Fehler analysieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Debug sessions */}
      <div className="flex-1 flex gap-4">
        {/* Sessions list */}
        <div className="w-1/2">
          <h4 className="font-medium mb-3">Debug-Verlauf</h4>
          {debugSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Debug-Sessions verfügbar</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {debugSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      selectedSession?.id === session.id ? 'ring-2 ring-neural-500' : ''
                    } ${getStatusColor(session.status)}`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(session.status)}
                          <span className="font-medium text-sm">{session.error_type}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {session.description || 'Keine Beschreibung'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.created_at.toLocaleString('de-DE')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Session details */}
        <div className="w-1/2">
          {selectedSession ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedSession.status)}
                  {selectedSession.error_type}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSession.description && (
                  <div>
                    <h4 className="font-medium mb-1">Beschreibung</h4>
                    <p className="text-sm text-gray-700">{selectedSession.description}</p>
                  </div>
                )}

                {selectedSession.diagnosis && (
                  <div>
                    <h4 className="font-medium mb-2">Diagnose</h4>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {selectedSession.diagnosis}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {selectedSession.solutions && selectedSession.solutions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Lösungsvorschläge</h4>
                    <div className="space-y-2">
                      {selectedSession.solutions.map((solution, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="flex-shrink-0 w-5 h-5 bg-neural-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{solution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSession.status === 'diagnosed' && (
                  <Button
                    onClick={() => markAsResolved(selectedSession.id)}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als gelöst markieren
                  </Button>
                )}

                {selectedSession.status === 'analyzing' && (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500 animate-spin" />
                    <p className="text-sm text-gray-600">Analysiere Fehler...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Wählen Sie eine Debug-Session aus</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

