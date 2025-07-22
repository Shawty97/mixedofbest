
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { AnalyticsFilters } from './types/analytics.types';

interface RealTimeMonitorProps {
  filters: AnalyticsFilters;
}

export function RealTimeMonitor({ filters }: RealTimeMonitorProps) {
  const [liveMetrics, setLiveMetrics] = useState({
    activeWorkflows: 3,
    avgExecutionTime: 2.4,
    successRate: 96.5,
    currentCost: 0.12
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeWorkflows: Math.max(0, prev.activeWorkflows + Math.floor(Math.random() * 3) - 1),
        avgExecutionTime: Math.max(0.5, prev.avgExecutionTime + (Math.random() - 0.5) * 0.5),
        successRate: Math.max(80, Math.min(100, prev.successRate + (Math.random() - 0.5) * 2)),
        currentCost: Math.max(0, prev.currentCost + (Math.random() - 0.5) * 0.02)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Workflows</p>
                <p className="text-2xl font-bold">{liveMetrics.activeWorkflows}</p>
              </div>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <Badge variant="outline" className="mt-2">Live</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Ausführungszeit</p>
                <p className="text-2xl font-bold">{liveMetrics.avgExecutionTime.toFixed(1)}s</p>
              </div>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <Badge variant="outline" className="mt-2">Live</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">{liveMetrics.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <Badge variant="outline" className="mt-2">Live</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktuelle Kosten</p>
                <p className="text-2xl font-bold">${liveMetrics.currentCost.toFixed(3)}</p>
              </div>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <Badge variant="outline" className="mt-2">Live</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live-Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Echtzeit-Monitoring aktiv</p>
            <p className="text-sm mt-2">Workflow-Updates werden live angezeigt</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
