import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Target,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalConversations: number;
    activeUsers: number;
    avgResponseTime: number;
    successRate: number;
    totalRevenue: number;
    growthRate: number;
  };
  conversationTrends: Array<{
    date: string;
    conversations: number;
    users: number;
  }>;
  agentPerformance: Array<{
    name: string;
    conversations: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  userEngagement: Array<{
    hour: string;
    active: number;
  }>;
  revenueBreakdown: Array<{
    category: string;
    value: number;
    color: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalytics(timeRange);
      setData(response);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to demo data
      setData(generateDemoAnalytics());
      toast({
        title: 'Demo Mode',
        description: 'Using demo analytics data for presentation.',
        variant: 'default'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDemoAnalytics = (): AnalyticsData => {
    const now = new Date();
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    
    return {
      overview: {
        totalConversations: 12847,
        activeUsers: 3421,
        avgResponseTime: 1.2,
        successRate: 94.5,
        totalRevenue: 45670,
        growthRate: 23.5
      },
      conversationTrends: Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0],
          conversations: Math.floor(Math.random() * 500) + 200,
          users: Math.floor(Math.random() * 150) + 50
        };
      }),
      agentPerformance: [
        { name: 'Customer Support Bot', conversations: 3421, successRate: 96.2, avgResponseTime: 0.8 },
        { name: 'Sales Assistant', conversations: 2876, successRate: 94.1, avgResponseTime: 1.1 },
        { name: 'Technical Helper', conversations: 2234, successRate: 92.8, avgResponseTime: 1.5 },
        { name: 'Product Advisor', conversations: 1987, successRate: 95.3, avgResponseTime: 1.0 },
        { name: 'Booking Agent', conversations: 1654, successRate: 97.1, avgResponseTime: 0.9 }
      ],
      userEngagement: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        active: Math.floor(Math.random() * 200) + 50
      })),
      revenueBreakdown: [
        { category: 'Subscriptions', value: 25000, color: COLORS[0] },
        { category: 'API Usage', value: 12000, color: COLORS[1] },
        { category: 'Premium Features', value: 6000, color: COLORS[2] },
        { category: 'Consulting', value: 2670, color: COLORS[3] }
      ]
    };
  };

  const exportData = () => {
    if (!data) return;
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Analytics data has been exported successfully.'
    });
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground mb-4">Unable to load analytics data.</p>
        <Button onClick={loadAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your AI agent performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalConversations.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data.overview.growthRate}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgResponseTime}s</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -8.2% faster
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.successRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data.overview.growthRate}% growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.overview.growthRate}%</div>
            <Badge variant="secondary" className="text-xs">
              Excellent
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Conversation Trends</TabsTrigger>
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Trends</CardTitle>
              <CardDescription>
                Daily conversation volume and user activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.conversationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="conversations"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Conversations"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Comparison of agent performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversations" fill="#8884d8" name="Conversations" />
                  <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement by Hour</CardTitle>
              <CardDescription>
                Peak usage hours and user activity patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Revenue distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;