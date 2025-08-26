import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Bot, Users, MessageSquare, TrendingUp, Activity, Clock,
  CheckCircle, AlertCircle, Zap, DollarSign, Calendar,
  ArrowUp, ArrowDown, Play, Pause, Settings, Eye, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  todayConversations: number;
  avgResponseTime: number;
  successRate: number;
  revenue: number;
  activeUsers: number;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  conversations: number;
  successRate: number;
  avgResponseTime: number;
  lastActive: string;
}

interface Conversation {
  id: string;
  agentName: string;
  userName: string;
  status: string;
  duration: number;
  satisfaction: number;
  timestamp: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    todayConversations: 0,
    avgResponseTime: 0,
    successRate: 0,
    revenue: 0,
    activeUsers: 0
  });
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    conversationVolume: [],
    agentPerformance: [],
    userGrowth: [],
    revenueData: []
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from API
      const [agentsData, conversationsData] = await Promise.all([
        apiService.getAgents(),
        apiService.getConversations()
      ]);
      
      setAgents(agentsData);
      setConversations(conversationsData);
      
      // Calculate metrics
      const calculatedMetrics = calculateMetrics(agentsData, conversationsData);
      setMetrics(calculatedMetrics);
      
      // Generate chart data
      const charts = generateChartData(agentsData, conversationsData);
      setChartData(charts);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Use demo data if API fails
      const demoData = generateDemoData();
      setAgents(demoData.agents);
      setConversations(demoData.conversations);
      setMetrics(demoData.metrics);
      setChartData(demoData.chartData);
      
      toast({
        title: 'Using Demo Data',
        description: 'Could not load real data, showing demo dashboard',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (agentsData: Agent[], conversationsData: Conversation[]): DashboardMetrics => {
    const today = new Date().toDateString();
    const todayConversations = conversationsData.filter(
      conv => new Date(conv.timestamp).toDateString() === today
    ).length;
    
    const activeAgents = agentsData.filter(agent => agent.status === 'active').length;
    const avgResponseTime = agentsData.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / agentsData.length || 0;
    const successRate = agentsData.reduce((sum, agent) => sum + agent.successRate, 0) / agentsData.length || 0;
    
    return {
      totalAgents: agentsData.length,
      activeAgents,
      totalConversations: conversationsData.length,
      todayConversations,
      avgResponseTime,
      successRate,
      revenue: conversationsData.length * 2.5, // $2.5 per conversation
      activeUsers: new Set(conversationsData.map(conv => conv.userName)).size
    };
  };

  const generateChartData = (agentsData: Agent[], conversationsData: Conversation[]) => {
    // Conversation volume over last 7 days
    const conversationVolume = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayConversations = conversationsData.filter(
        conv => new Date(conv.timestamp).toDateString() === date.toDateString()
      ).length;
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        conversations: dayConversations || Math.floor(Math.random() * 50) + 10
      };
    });
    
    // Agent performance
    const agentPerformance = agentsData.slice(0, 5).map(agent => ({
      name: agent.name,
      conversations: agent.conversations,
      successRate: agent.successRate
    }));
    
    // User growth
    const userGrowth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        users: Math.floor(Math.random() * 1000) + 500
      };
    });
    
    // Revenue data
    const revenueData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.floor(Math.random() * 10000) + 5000
      };
    });
    
    return {
      conversationVolume,
      agentPerformance,
      userGrowth,
      revenueData
    };
  };

  const generateDemoData = () => {
    const demoAgents: Agent[] = [
      {
        id: '1',
        name: 'Customer Support Pro',
        type: 'customer_support',
        status: 'active',
        conversations: 1247,
        successRate: 94.5,
        avgResponseTime: 1.2,
        lastActive: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sales Assistant',
        type: 'sales_assistant',
        status: 'active',
        conversations: 892,
        successRate: 87.3,
        avgResponseTime: 2.1,
        lastActive: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Technical Helper',
        type: 'technical_support',
        status: 'active',
        conversations: 634,
        successRate: 91.8,
        avgResponseTime: 3.4,
        lastActive: new Date().toISOString()
      }
    ];
    
    const demoConversations: Conversation[] = Array.from({ length: 50 }, (_, i) => ({
      id: `conv_${i}`,
      agentName: demoAgents[i % demoAgents.length].name,
      userName: `User ${i + 1}`,
      status: Math.random() > 0.1 ? 'completed' : 'active',
      duration: Math.floor(Math.random() * 300) + 60,
      satisfaction: Math.floor(Math.random() * 2) + 4,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    return {
      agents: demoAgents,
      conversations: demoConversations,
      metrics: calculateMetrics(demoAgents, demoConversations),
      chartData: generateChartData(demoAgents, demoConversations)
    };
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await apiService.updateAgent(agentId, { status: newStatus });
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      ));
      
      toast({
        title: 'Agent Updated',
        description: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your AI agents and platform performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                {metrics.activeAgents} active
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">
                {metrics.todayConversations} today
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.conversationVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="conversations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversations" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium">{agent.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {agent.type.replace('_', ' ')} • {agent.conversations} conversations
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.successRate}% success</p>
                          <p className="text-xs text-muted-foreground">{agent.avgResponseTime}s avg response</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAgentStatus(agent.id, agent.status)}
                        >
                          {agent.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {conversations.slice(0, 20).map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                          {conversation.status}
                        </Badge>
                        <div>
                          <p className="font-medium">{conversation.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            with {conversation.agentName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{Math.floor(conversation.duration / 60)}m {conversation.duration % 60}s</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-xs ${
                              i < conversation.satisfaction ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}