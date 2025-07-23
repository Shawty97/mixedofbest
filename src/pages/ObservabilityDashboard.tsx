import React, { useState } from 'react';
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ObservabilityDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState('all');
  
  const mockMetrics = [
    { time: '00:00', calls: 12, success: 11, errors: 1 },
    { time: '04:00', calls: 8, success: 8, errors: 0 },
    { time: '08:00', calls: 24, success: 22, errors: 2 },
    { time: '12:00', calls: 35, success: 33, errors: 2 },
    { time: '16:00', calls: 28, success: 26, errors: 2 },
    { time: '20:00', calls: 18, success: 17, errors: 1 },
  ];

  const mockLogs = [
    {
      timestamp: '2024-01-15T14:30:25Z',
      agent: 'Customer Support',
      level: 'INFO',
      message: 'Call initiated from +1234567890',
      duration: '2.3s'
    },
    {
      timestamp: '2024-01-15T14:29:45Z',
      agent: 'Sales Assistant',
      level: 'ERROR',
      message: 'Failed to connect to CRM webhook',
      duration: '0.5s'
    },
    {
      timestamp: '2024-01-15T14:28:12Z',
      agent: 'Customer Support',
      level: 'INFO',
      message: 'Knowledge base query: "refund policy"',
      duration: '1.8s'
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Observability Dashboard</h1>
            <p className="text-muted-foreground">Monitor agent performance, logs, and system health</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4s</div>
              <p className="text-xs text-muted-foreground">-0.3s from last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">1 critical, 1 warning</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="logs">Live Logs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="traces">Traces</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Call Volume & Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="calls" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="success" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" stroke="#ff7c7c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Live Agent Logs</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search logs..." 
                      className="w-64"
                    />
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={log.level === 'ERROR' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {log.level}
                        </Badge>
                        <span className="text-muted-foreground">{log.timestamp}</span>
                        <span className="font-medium">{log.agent}</span>
                        <span>{log.message}</span>
                      </div>
                      <span className="text-muted-foreground">{log.duration}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ObservabilityDashboard;