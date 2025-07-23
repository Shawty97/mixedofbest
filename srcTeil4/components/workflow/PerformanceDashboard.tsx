
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Clock, DollarSign, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { ExecutionMetrics, performanceMonitor } from '@/services/dag-engine/PerformanceMonitor';

interface PerformanceDashboardProps {
  executionId: string;
  className?: string;
}

export function PerformanceDashboard({ executionId, className }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<ExecutionMetrics | null>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(executionId, (newMetrics) => {
      setMetrics(newMetrics);
      
      // Update real-time chart data
      setRealTimeData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          throughput: newMetrics.aggregatedMetrics.throughputPerSecond,
          completedNodes: newMetrics.aggregatedMetrics.completedNodes,
          activeNodes: newMetrics.realTimeUpdates.currentlyRunning.length,
          cost: newMetrics.aggregatedMetrics.totalCost
        };
        return [...prev.slice(-20), newPoint]; // Keep last 20 points
      });
    });

    return unsubscribe;
  }, [executionId]);

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Waiting for performance data...</div>
        </CardContent>
      </Card>
    );
  }

  const { aggregatedMetrics, realTimeUpdates } = metrics;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{aggregatedMetrics.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={aggregatedMetrics.successRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-blue-600">{aggregatedMetrics.cacheHitRate.toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={aggregatedMetrics.cacheHitRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-orange-600">{aggregatedMetrics.averageNodeDuration.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">${aggregatedMetrics.totalCost.toFixed(4)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Currently Running</p>
              <div className="flex flex-wrap gap-1">
                {realTimeUpdates.currentlyRunning.map(nodeId => (
                  <Badge key={nodeId} variant="default" className="text-xs">
                    {nodeId.slice(0, 8)}...
                  </Badge>
                ))}
                {realTimeUpdates.currentlyRunning.length === 0 && (
                  <span className="text-gray-400 text-sm">No nodes running</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Queued ({realTimeUpdates.queuedNodes.length})</p>
              <div className="text-sm text-gray-500">
                {realTimeUpdates.queuedNodes.length} nodes waiting
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Bottlenecks</p>
              <div className="flex flex-wrap gap-1">
                {realTimeUpdates.bottlenecks.map(nodeId => (
                  <Badge key={nodeId} variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {nodeId.slice(0, 8)}...
                  </Badge>
                ))}
                {realTimeUpdates.bottlenecks.length === 0 && (
                  <span className="text-green-600 text-sm">No bottlenecks detected</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <Tabs defaultValue="throughput">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="nodes">Node Progress</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="throughput">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Nodes/sec"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodes">
          <Card>
            <CardHeader>
              <CardTitle>Node Execution Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="completedNodes" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      name="Completed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeNodes" 
                      stackId="1"
                      stroke="#ffc658" 
                      fill="#ffc658"
                      name="Active"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost">
          <Card>
            <CardHeader>
              <CardTitle>Cost Accumulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Cost']} />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      name="Total Cost ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Nodes:</span>
              <span className="ml-2 font-semibold">{aggregatedMetrics.totalNodes}</span>
            </div>
            <div>
              <span className="text-gray-600">Completed:</span>
              <span className="ml-2 font-semibold text-green-600">{aggregatedMetrics.completedNodes}</span>
            </div>
            <div>
              <span className="text-gray-600">Failed:</span>
              <span className="ml-2 font-semibold text-red-600">{aggregatedMetrics.failedNodes}</span>
            </div>
            <div>
              <span className="text-gray-600">Cached:</span>
              <span className="ml-2 font-semibold text-blue-600">{aggregatedMetrics.cachedNodes}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Tokens:</span>
              <span className="ml-2 font-semibold">{aggregatedMetrics.totalTokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Throughput:</span>
              <span className="ml-2 font-semibold">{aggregatedMetrics.throughputPerSecond.toFixed(2)} nodes/sec</span>
            </div>
            <div>
              <span className="text-gray-600">Runtime:</span>
              <span className="ml-2 font-semibold">
                {metrics.totalDuration ? `${(metrics.totalDuration / 1000).toFixed(1)}s` : 'Running...'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Estimated ETA:</span>
              <span className="ml-2 font-semibold">
                {realTimeUpdates.estimatedCompletion > Date.now() 
                  ? `${Math.ceil((realTimeUpdates.estimatedCompletion - Date.now()) / 1000)}s`
                  : 'Complete'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
