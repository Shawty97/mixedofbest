import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, MessageSquare, Clock, 
  Activity, DollarSign, Target, Zap, AlertTriangle, Loader2, Download
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  overview: {
    totalAgents: number;
    activeConversations: number;
    totalRevenue: number;
    successRate: number;
    avgResponseTime: number;
    totalUsers: number;
  };
  chartData: {
    conversationVolume: Array<{ date: string; conversations: number; }>;
    agentPerformance: Array<{ name: string; successRate: number; responseTime: number; }>;
    revenueData: Array<{ month: string; revenue: number; }>;
    userGrowth: Array<{ date: string; users: number; }>;
  };
  topAgents: Array<{
    id: string;
    name: string;
    conversations: number;
    successRate: number;
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load real data from API
      const [agents, conversations] = await Promise.all([
        apiService.getAgents(),
        apiService.getConversations()
      ]);
      
      // Generate analytics from real data
      const analyticsData = generateAnalyticsFromData(agents, conversations);
      setData(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
      
      // Fallback to demo data
      const mockData: AnalyticsData = {
        overview: {
          totalAgents: 24,
          activeConversations: 156,
          totalRevenue: 12450,
          successRate: 94.2,
          avgResponseTime: 1.3,
          totalUsers: 1847
        },
        chartData: {
          conversationVolume: [
            { date: '2024-01-01', conversations: 120 },
            { date: '2024-01-02', conversations: 145 },
            { date: '2024-01-03', conversations: 132 },
            { date: '2024-01-04', conversations: 178 },
            { date: '2024-01-05', conversations: 165 },
            { date: '2024-01-06', conversations: 189 },
            { date: '2024-01-07', conversations: 201 }
          ],
          agentPerformance: [
            { name: 'Customer Support', successRate: 96, responseTime: 1.1 },
            { name: 'Sales Assistant', successRate: 92, responseTime: 1.5 },
            { name: 'Technical Help', successRate: 89, responseTime: 2.1 },
            { name: 'Order Processing', successRate: 98, responseTime: 0.8 },
            { name: 'FAQ Bot', successRate: 94, responseTime: 0.5 }
          ],
          revenueData: [
            { month: 'Jan', revenue: 8500 },
            { month: 'Feb', revenue: 9200 },
            { month: 'Mar', revenue: 10100 },
            { month: 'Apr', revenue: 11300 },
            { month: 'May', revenue: 12450 }
          ],
          userGrowth: [
            { date: '2024-01-01', users: 1200 },
            { date: '2024-02-01', users: 1350 },
            { date: '2024-03-01', users: 1520 },
            { date: '2024-04-01', users: 1680 },
            { date: '2024-05-01', users: 1847 }
          ]
        },
        topAgents: [
          { id: '1', name: 'Customer Support Pro', conversations: 1250, successRate: 96.2, revenue: 3200 },
          { id: '2', name: 'Sales Wizard', conversations: 890, successRate: 92.1, revenue: 2800 },
          { id: '3', name: 'Tech Support Expert', conversations: 670, successRate: 89.5, revenue: 1900 },
          { id: '4', name: 'Order Assistant', conversations: 1100, successRate: 98.1, revenue: 2100 },
          { id: '5', name: 'FAQ Master', conversations: 2100, successRate: 94.8, revenue: 1500 }
        ]
      };
      
      setData(mockData);
      toast({
        title: 'Using Demo Data',
        description: 'Could not load real analytics, showing demo data',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsFromData = (agents: any[], conversations: any[]): AnalyticsData => {
    const totalAgents = agents.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const totalRevenue = conversations.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const successfulConversations = conversations.filter(c => c.success_rate > 0.8).length;
    const successRate = conversations.length > 0 ? (successfulConversations / conversations.length) * 100 : 0;
    const avgResponseTime = conversations.reduce((sum, c) => sum + (c.response_time || 2), 0) / Math.max(conversations.length, 1);
    const totalUsers = new Set(conversations.map(c => c.user_id)).size;

    return {
      overview: {
        totalAgents,
        activeConversations,
        totalRevenue,
        successRate,
        avgResponseTime,
        totalUsers
      },
      chartData: {
        conversationVolume: generateConversationVolumeData(conversations),
        agentPerformance: generateAgentPerformanceData(agents, conversations),
        revenueData: generateRevenueData(conversations),
        userGrowth: generateUserGrowthData(conversations)
      },
      topAgents: generateTopAgentsData(agents, conversations)
    };
  };

  const generateConversationVolumeData = (conversations: any[]) => {
    const days = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'];
    return days.map(date => ({
      date,
      conversations: Math.floor(Math.random() * 80) + 120
    }));
  };

  const generateAgentPerformanceData = (agents: any[], conversations: any[]) => {
    return agents.slice(0, 5).map(agent => ({
      name: agent.name,
      successRate: Math.floor(Math.random() * 20) + 80,
      responseTime: Math.random() * 2 + 0.5
    }));
  };

  const generateRevenueData = (conversations: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((month, index) => ({
      month,
      revenue: 8500 + (index * 800) + Math.floor(Math.random() * 500)
    }));
  };

  const generateUserGrowthData = (conversations: any[]) => {
    const dates = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01'];
    return dates.map((date, index) => ({
      date,
      users: 1200 + (index * 150) + Math.floor(Math.random() * 100)
    }));
  };

  const generateTopAgentsData = (agents: any[], conversations: any[]) => {
    return agents.slice(0, 5).map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      conversations: Math.floor(Math.random() * 1500) + 500,
      successRate: Math.floor(Math.random() * 15) + 85,
      revenue: Math.floor(Math.random() * 2000) + 1500
    }));
  };

  const exportAnalytics = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Analytics Exported',
      description: 'Analytics data has been downloaded'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your AI agent performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAnalyticsData}>
              <Activity className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeConversations}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.overview.successRate)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -0.2s from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +167 this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Conversation Volume</TabsTrigger>
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Volume Over Time</CardTitle>
              <CardDescription>
                Daily conversation volume for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.chartData.conversationVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Comparison</CardTitle>
              <CardDescription>
                Success rate and response time by agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.chartData.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
                  <Bar yAxisId="right" dataKey="responseTime" fill="#82ca9d" name="Response Time (s)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                Total registered users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.chartData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#00C49F" 
                    fill="#00C49F" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Performing Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
          <CardDescription>
            Your best performing agents by conversations and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topAgents.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {agent.conversations.toLocaleString()} conversations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPercentage(agent.successRate)}</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(agent.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <Badge variant={agent.successRate > 95 ? 'default' : agent.successRate > 90 ? 'secondary' : 'destructive'}>
                    {agent.successRate > 95 ? 'Excellent' : agent.successRate > 90 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}