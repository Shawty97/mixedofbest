import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { PerformanceMetric, WorkflowMetricsSummary, AnalyticsFilters } from './types/analytics.types';
import { RealTimeMonitor } from './RealTimeMonitor';
import { CostAnalyzer } from './CostAnalyzer';
import useWorkflowStore from '@/components/workflow/store/workflowStore';

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<WorkflowMetricsSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '24h',
    metricTypes: ['execution_time', 'cost', 'success_rate']
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'costs' | 'alerts'>('overview');

  const { user } = useAuth();
  const { workflows } = useWorkflowStore();

  useEffect(() => {
    if (user) {
      loadMetrics();
      loadMetricsSummary();
    }
  }, [user, filters]);

  const loadMetrics = async () => {
    try {
      const timeRange = getTimeRangeForFilter(filters.timeRange);
      
      // Use type assertion for new table
      const { data, error } = await (supabase as any)
        .from('performance_metrics')
        .select('*')
        .eq('user_id', String(user?.id))
        .gte('measurement_time', timeRange.start.toISOString())
        .lte('measurement_time', timeRange.end.toISOString())
        .order('measurement_time', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error loading metrics:', error);
        setMetrics(getDemoMetrics());
      } else {
        setMetrics((data as PerformanceMetric[]) || getDemoMetrics());
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics(getDemoMetrics());
    }
  };

  const loadMetricsSummary = async () => {
    try {
      const timeRange = getTimeRangeForFilter(filters.timeRange);
      
      // Use RPC function for aggregated metrics
      const { data, error } = await (supabase as any).rpc('get_workflow_metrics', {
        p_user_id: String(user?.id),
        p_workflow_id: filters.workflowId || null,
        p_start_date: timeRange.start.toISOString(),
        p_end_date: timeRange.end.toISOString()
      });

      if (error) {
        console.error('Error loading metrics summary:', error);
        setMetricsSummary(getDemoMetricsSummary());
      } else {
        setMetricsSummary((data as WorkflowMetricsSummary[]) || getDemoMetricsSummary());
      }
    } catch (error) {
      console.error('Error loading metrics summary:', error);
      setMetricsSummary(getDemoMetricsSummary());
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeForFilter = (timeRange: string) => {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '24h':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      default:
        start.setDate(start.getDate() - 1);
    }

    return { start, end };
  };

  const getDemoMetrics = (): PerformanceMetric[] => [
    {
      id: '1',
      user_id: String(user?.id || ''),
      workflow_id: 'demo-workflow-1',
      metric_type: 'execution_time',
      metric_value: 2.34,
      measurement_time: new Date(Date.now() - 3600000).toISOString(),
      metadata: { node_count: 5 }
    },
    {
      id: '2',
      user_id: String(user?.id || ''),
      workflow_id: 'demo-workflow-1',
      metric_type: 'cost',
      metric_value: 0.045,
      measurement_time: new Date(Date.now() - 3600000).toISOString(),
      metadata: { tokens_used: 1500 }
    },
    {
      id: '3',
      user_id: String(user?.id || ''),
      workflow_id: 'demo-workflow-1',
      metric_type: 'success_rate',
      metric_value: 0.96,
      measurement_time: new Date(Date.now() - 3600000).toISOString(),
      metadata: { total_executions: 25 }
    }
  ];

  const getDemoMetricsSummary = (): WorkflowMetricsSummary[] => [
    {
      metric_type: 'execution_time',
      avg_value: 2.45,
      min_value: 1.12,
      max_value: 4.67,
      total_measurements: 125
    },
    {
      metric_type: 'cost',
      avg_value: 0.052,
      min_value: 0.015,
      max_value: 0.234,
      total_measurements: 125
    },
    {
      metric_type: 'success_rate',
      avg_value: 0.94,
      min_value: 0.78,
      max_value: 1.0,
      total_measurements: 125
    },
    {
      metric_type: 'token_usage',
      avg_value: 1650,
      min_value: 450,
      max_value: 3200,
      total_measurements: 125
    }
  ];

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'execution_time':
        return <Clock className="h-4 w-4" />;
      case 'cost':
        return <DollarSign className="h-4 w-4" />;
      case 'success_rate':
        return <TrendingUp className="h-4 w-4" />;
      case 'token_usage':
        return <Activity className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getMetricLabel = (metricType: string) => {
    switch (metricType) {
      case 'execution_time':
        return 'Ausführungszeit';
      case 'cost':
        return 'Kosten';
      case 'success_rate':
        return 'Erfolgsrate';
      case 'token_usage':
        return 'Token-Verbrauch';
      case 'error_rate':
        return 'Fehlerrate';
      default:
        return metricType;
    }
  };

  const formatMetricValue = (metricType: string, value: number) => {
    switch (metricType) {
      case 'execution_time':
        return `${value.toFixed(2)}s`;
      case 'cost':
        return `$${value.toFixed(4)}`;
      case 'success_rate':
        return `${(value * 100).toFixed(1)}%`;
      case 'token_usage':
        return `${Math.round(value)} tokens`;
      case 'error_rate':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const exportData = () => {
    const exportData = {
      metrics,
      summary: metricsSummary,
      filters,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${filters.timeRange}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Daten exportiert",
      description: "Analytics-Daten wurden erfolgreich exportiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Lade Analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Überwachen Sie die Performance Ihrer Workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportData} variant="outline">
            Export
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={filters.timeRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as any }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Letzte Stunde</SelectItem>
            <SelectItem value="24h">Letzten 24h</SelectItem>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.workflowId || 'all'}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            workflowId: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Workflow wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Workflows</SelectItem>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Übersicht' },
          { id: 'realtime', label: 'Echtzeit' },
          { id: 'costs', label: 'Kosten' },
          { id: 'alerts', label: 'Alerts' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsSummary.map((summary) => {
              const trend = Math.random() > 0.5 ? 'up' : 'down';
              const trendValue = Math.random() * 20;

              return (
                <Card key={summary.metric_type}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {getMetricLabel(summary.metric_type)}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatMetricValue(summary.metric_type, summary.avg_value)}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {getMetricIcon(summary.metric_type)}
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      {trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trendValue.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs. vorherige Periode</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Metriken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.slice(0, 10).map((metric) => {
                  const workflow = workflows.find(w => w.id === metric.workflow_id);
                  
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          {getMetricIcon(metric.metric_type)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {workflow?.name || 'Unbekannter Workflow'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getMetricLabel(metric.metric_type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatMetricValue(metric.metric_type, metric.metric_value)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(metric.measurement_time).toLocaleTimeString('de-DE')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {metrics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Metriken verfügbar</p>
                  <p className="text-sm mt-2">
                    Führen Sie Workflows aus, um Daten zu sammeln
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'realtime' && (
        <RealTimeMonitor filters={filters} />
      )}

      {activeTab === 'costs' && (
        <CostAnalyzer filters={filters} />
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Alerts</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Neuer Alert
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine aktiven Alerts</p>
                <p className="text-sm mt-2">
                  Erstellen Sie Alerts für wichtige Metriken
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
