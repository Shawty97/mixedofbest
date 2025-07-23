
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEnhancedCopilotStore } from './store/enhancedCopilotStore';
import { toast } from '@/hooks/use-toast';

interface PerformanceMetric {
  category: 'speed' | 'cost' | 'reliability' | 'efficiency';
  name: string;
  current_value: number;
  optimal_value: number;
  unit: string;
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
}

interface OptimizationSuggestion {
  id: string;
  category: 'speed' | 'cost' | 'reliability' | 'efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimated_savings: {
    cost_percent?: number;
    time_percent?: number;
    reliability_percent?: number;
  };
  implementation_steps: string[];
  priority_score: number;
}

export function PerformanceAdvisor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<OptimizationSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { workflowContext, sendCommand } = useEnhancedCopilotStore();

  useEffect(() => {
    loadPerformanceData();
  }, [workflowContext]);

  const loadPerformanceData = () => {
    // Simulate performance metrics based on workflow context
    const simulatedMetrics: PerformanceMetric[] = [
      {
        category: 'speed',
        name: 'Durchschnittliche Ausführungszeit',
        current_value: 4.2,
        optimal_value: 2.5,
        unit: 'Sekunden',
        score: 65,
        trend: 'declining'
      },
      {
        category: 'cost',
        name: 'Kosten pro Ausführung',
        current_value: 0.15,
        optimal_value: 0.08,
        unit: '€',
        score: 72,
        trend: 'stable'
      },
      {
        category: 'reliability',
        name: 'Erfolgsrate',
        current_value: 94.5,
        optimal_value: 99.0,
        unit: '%',
        score: 85,
        trend: 'improving'
      },
      {
        category: 'efficiency',
        name: 'Token-Effizienz',
        current_value: 78,
        optimal_value: 90,
        unit: '%',
        score: 75,
        trend: 'stable'
      }
    ];

    const simulatedSuggestions: OptimizationSuggestion[] = [
      {
        id: 'opt_1',
        category: 'cost',
        title: 'Modell-Optimierung für bessere Kosten-Effizienz',
        description: 'Wechsel zu kosteneffizienteren AI-Modellen für einfache Aufgaben ohne Qualitätsverlust.',
        impact: 'high',
        effort: 'low',
        estimated_savings: {
          cost_percent: 35,
          time_percent: 10
        },
        implementation_steps: [
          'Analysiere Aufgabenkomplexität pro Workflow-Knoten',
          'Identifiziere Knoten mit einfachen Aufgaben',
          'Teste GPT-3.5-turbo statt GPT-4 für einfache Aufgaben',
          'Implementiere dynamische Modellauswahl',
          'Monitoring der Qualitäts-Metriken'
        ],
        priority_score: 95
      },
      {
        id: 'opt_2',
        category: 'speed',
        title: 'Parallel-Verarbeitung implementieren',
        description: 'Aktivierung paralleler Ausführung für unabhängige Workflow-Knoten zur Geschwindigkeitssteigerung.',
        impact: 'high',
        effort: 'medium',
        estimated_savings: {
          time_percent: 60
        },
        implementation_steps: [
          'Dependency-Analyse der Workflow-Knoten',
          'Identifikation parallelisierbarer Pfade',
          'Implementierung async/await Pattern',
          'Load-Balancing für API-Aufrufe',
          'Performance-Tests und Optimierung'
        ],
        priority_score: 88
      },
      {
        id: 'opt_3',
        category: 'reliability',
        title: 'Retry-Mechanismus mit exponential backoff',
        description: 'Implementierung intelligenter Wiederholungslogik für fehlgeschlagene API-Aufrufe.',
        impact: 'medium',
        effort: 'low',
        estimated_savings: {
          reliability_percent: 15
        },
        implementation_steps: [
          'Fehlertyp-Klassifizierung implementieren',
          'Exponential backoff Algorithmus einrichten',
          'Maximale Retry-Anzahl konfigurieren',
          'Circuit-Breaker Pattern für kritische Services',
          'Monitoring und Alerting einrichten'
        ],
        priority_score: 82
      },
      {
        id: 'opt_4',
        category: 'efficiency',
        title: 'Token-Optimierung durch Prompt-Engineering',
        description: 'Optimierung der Prompts zur Reduzierung der Token-Anzahl bei gleicher Ausgabequalität.',
        impact: 'medium',
        effort: 'medium',
        estimated_savings: {
          cost_percent: 20,
          time_percent: 15
        },
        implementation_steps: [
          'Analyse aktueller Prompt-Patterns',
          'A/B-Testing verschiedener Prompt-Varianten',
          'Implementierung von Prompt-Templates',
          'Token-Counting und Optimierung',
          'Qualitäts-Metriken überwachen'
        ],
        priority_score: 75
      }
    ];

    setMetrics(simulatedMetrics);
    setSuggestions(simulatedSuggestions.sort((a, b) => b.priority_score - a.priority_score));
  };

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const analysisPrompt = `
PERFORMANCE ANALYSIS REQUEST:

Current Workflow Context:
${JSON.stringify(workflowContext, null, 2)}

Please analyze the workflow performance and provide:

1. **Speed Optimization Opportunities**
   - Identify bottlenecks in the workflow
   - Suggest parallelization strategies
   - Recommend caching opportunities

2. **Cost Optimization Strategies**
   - Model selection optimization
   - Token usage reduction techniques
   - Resource allocation improvements

3. **Reliability Enhancements**
   - Error handling improvements
   - Fallback strategies
   - Monitoring recommendations

4. **Efficiency Improvements**
   - Workflow structure optimization
   - Data flow improvements
   - Resource utilization optimization

Provide specific, actionable recommendations with estimated impact.
      `.trim();

      await sendCommand(analysisPrompt);

      toast({
        title: "Performance-Analyse gestartet",
        description: "KI analysiert Ihren Workflow für Optimierungsmöglichkeiten.",
      });

    } catch (error) {
      console.error('Performance analysis error:', error);
      toast({
        title: "Analyse fehlgeschlagen",
        description: "Fehler bei der Performance-Analyse.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'speed': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'reliability': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'efficiency': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'declining': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'stable': return <Clock className="h-3 w-3 text-gray-500" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const overallScore = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Performance-Berater</h3>
        <p className="text-sm text-gray-600">
          KI-gestützte Optimierungsempfehlungen für Ihre Workflows
        </p>
      </div>

      {/* Overall Performance Score */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gesamt-Performance Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="mb-4" />
          <Button 
            onClick={runPerformanceAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analysiere Performance...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Performance-Analyse starten
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4">
        {/* Metrics overview */}
        <div className="w-1/2 space-y-4">
          <h4 className="font-medium">Performance-Metriken</h4>
          <div className="space-y-3">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.category)}
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Aktuell: {metric.current_value} {metric.unit}
                  </span>
                  <span className="text-gray-500">
                    Optimal: {metric.optimal_value} {metric.unit}
                  </span>
                </div>
                <Progress value={metric.score} className="mt-2 h-2" />
              </Card>
            ))}
          </div>

          <h4 className="font-medium pt-4">Top-Optimierungen</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className={`cursor-pointer transition-all hover:shadow-sm p-3 ${
                    selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-neural-500' : ''
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{suggestion.title}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} Impact
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={getEffortColor(suggestion.effort)}>
                      {suggestion.effort} Aufwand
                    </Badge>
                    <span className="text-xs text-neural-600 font-medium">
                      Score: {suggestion.priority_score}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Suggestion details */}
        <div className="w-1/2">
          {selectedSuggestion ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{selectedSuggestion.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getImpactColor(selectedSuggestion.impact)}>
                    {selectedSuggestion.impact.toUpperCase()} Impact
                  </Badge>
                  <Badge className={getEffortColor(selectedSuggestion.effort)}>
                    {selectedSuggestion.effort.toUpperCase()} Aufwand
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Beschreibung</h4>
                  <p className="text-sm text-gray-700">{selectedSuggestion.description}</p>
                </div>

                {Object.keys(selectedSuggestion.estimated_savings).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Geschätzte Einsparungen</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSuggestion.estimated_savings.cost_percent && (
                        <div className="bg-green-50 p-2 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-600">
                            -{selectedSuggestion.estimated_savings.cost_percent}%
                          </div>
                          <div className="text-xs text-green-700">Kosten</div>
                        </div>
                      )}
                      {selectedSuggestion.estimated_savings.time_percent && (
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">
                            -{selectedSuggestion.estimated_savings.time_percent}%
                          </div>
                          <div className="text-xs text-blue-700">Zeit</div>
                        </div>
                      )}
                      {selectedSuggestion.estimated_savings.reliability_percent && (
                        <div className="bg-purple-50 p-2 rounded-lg text-center">
                          <div className="text-lg font-bold text-purple-600">
                            +{selectedSuggestion.estimated_savings.reliability_percent}%
                          </div>
                          <div className="text-xs text-purple-700">Zuverlässigkeit</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Implementierungsschritte</h4>
                  <div className="space-y-2">
                    {selectedSuggestion.implementation_steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-neural-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Prioritäts-Score</span>
                    <span className="font-bold text-neural-600">
                      {selectedSuggestion.priority_score}/100
                    </span>
                  </div>
                  <Progress value={selectedSuggestion.priority_score} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Wählen Sie eine Optimierung aus</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

