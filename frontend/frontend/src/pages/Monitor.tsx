import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Phone, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

interface Metric {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

interface CallLog {
  id: string;
  agentName: string;
  phoneNumber: string;
  startTime: string;
  duration: string;
  status: 'completed' | 'failed' | 'abandoned';
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function Monitor() {
  const [timeRange, setTimeRange] = useState('24h');
  
  const [metrics] = useState<Metric[]>([
    { name: 'Total Calls', value: '1,247', change: '+12%', trend: 'up' },
    { name: 'Success Rate', value: '94.2%', change: '+2.1%', trend: 'up' },
    { name: 'Avg Duration', value: '4m 32s', change: '-8s', trend: 'down' },
    { name: 'Response Time', value: '1.2s', change: '+0.1s', trend: 'up' },
  ]);

  const [recentCalls] = useState<CallLog[]>([
    {
      id: 'call-1',
      agentName: 'Customer Support',
      phoneNumber: '+1 (555) 123-4567',
      startTime: '14:32',
      duration: '5m 23s',
      status: 'completed',
      sentiment: 'positive',
      summary: 'Customer inquiry about billing resolved successfully'
    },
    {
      id: 'call-2',
      agentName: 'Sales Assistant',
      phoneNumber: '+1 (555) 987-6543',
      startTime: '14:28',
      duration: '3m 45s',
      status: 'completed',
      sentiment: 'neutral',
      summary: 'Product demo scheduled for next week'
    },
    {
      id: 'call-3',
      agentName: 'Customer Support',
      phoneNumber: '+1 (555) 456-7890',
      startTime: '14:25',
      duration: '1m 12s',
      status: 'failed',
      sentiment: 'negative',
      summary: 'Technical issue - call dropped during transfer'
    }
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      type: 'warning',
      message: 'High call volume detected - consider scaling up',
      timestamp: '14:30',
      resolved: false
    },
    {
      id: 'alert-2',
      type: 'error',
      message: 'Agent "Sales Assistant" failed to start',
      timestamp: '14:15',
      resolved: true
    },
    {
      id: 'alert-3',
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '13:45',
      resolved: true
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'abandoned': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitor</h1>
          <p className="text-muted-foreground">
            Real-time observability and analytics for your voice agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calls">Call Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.change} from last period
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Call Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Call volume chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Call Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Call outcomes chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <Card key={call.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(call.status)}
                    <div>
                      <CardTitle className="text-lg">{call.agentName}</CardTitle>
                      <CardDescription>{call.phoneNumber}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSentimentColor(call.sentiment)}>
                      {call.sentiment}
                    </Badge>
                    <Badge variant="outline">{call.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Start Time</p>
                      <p className="font-medium">{call.startTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{call.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Call ID</p>
                      <p className="font-medium font-mono text-xs">{call.id}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{call.summary}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Response time chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network I/O</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <CardTitle className="text-lg">{alert.message}</CardTitle>
                      <CardDescription>{alert.timestamp}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}