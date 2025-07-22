import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Activity, Bot, Store, Database, Workflow, BarChart3 } from 'lucide-react'
import WorkflowCreator from './components/WorkflowCreator.jsx'
import WorkflowEditor from './components/WorkflowEditor.jsx'
import AgentCreator from './components/AgentCreator.jsx'
import AgentEditor from './components/AgentEditor.jsx'
import KnowledgeSourceCreator from './components/KnowledgeSourceCreator.jsx'
import KnowledgeSourceViewer from './components/KnowledgeSourceViewer.jsx'
import './App.css'

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard data
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch('/api/dashboard/recent-activity').then(res => res.json())
    ]).then(([statsData, activityData]) => {
      setStats(statsData)
      setRecentActivity(activityData)
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching dashboard data:', err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AImpact Platform Dashboard</h1>
        <p className="text-gray-600">Welcome to your AI orchestration platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.workflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_activity?.new_workflows || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.agents || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_activity?.new_agents || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totals?.knowledge_sources || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totals?.documents || 0} documents processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.performance?.execution_success_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats?.performance?.avg_execution_time || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/workflows">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Workflow className="h-6 w-6" />
                <span>Create Workflow</span>
              </Button>
            </Link>
            <Link to="/agents">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Bot className="h-6 w-6" />
                <span>Design Agent</span>
              </Button>
            </Link>
            <Link to="/agent-store">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Store className="h-6 w-6" />
                <span>Browse Store</span>
              </Button>
            </Link>
            <Link to="/knowledge-builder">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Database className="h-6 w-6" />
                <span>Add Knowledge</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.module}</p>
                </div>
                <Badge variant="secondary">{new Date(activity.timestamp).toLocaleDateString()}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Workflows Component
function Workflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = () => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(data.workflows || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching workflows:', err)
        setLoading(false)
      })
  }

  const executeWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_data: { message: 'Test execution from UI' }
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Workflow executed successfully! Execution ID: ${result.execution_id}`)
      } else {
        alert('Error executing workflow')
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
      alert('Error executing workflow')
    }
  }

  if (showCreator) {
    return <WorkflowCreator onBack={() => { setShowCreator(false); fetchWorkflows(); }} />
  }

  if (editingWorkflow) {
    return <WorkflowEditor 
      workflowId={editingWorkflow} 
      onBack={() => { setEditingWorkflow(null); fetchWorkflows(); }} 
    />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading workflows...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflows</h1>
        <Button onClick={() => setShowCreator(true)}>Create New Workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant={workflow.status === 'published' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
                <div className="text-sm text-gray-500">
                  {workflow.dag_structure?.nodes?.length || 0} nodes
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingWorkflow(workflow.id)}
                >
                  Edit
                </Button>
                <Button 
                  size="sm"
                  onClick={() => executeWorkflow(workflow.id)}
                >
                  Execute
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Agents Component
function Agents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = () => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching agents:', err)
        setLoading(false)
      })
  }

  const testAgent = async (agentId, agentName) => {
    const testMessage = prompt(`Enter a test message for ${agentName}:`);
    if (!testMessage) return;

    try {
      const response = await fetch(`/api/agents/${agentId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testMessage
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Agent Response: ${result.agent_response}\n\nCapabilities Used: ${result.capabilities_used?.join(', ') || 'None'}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`);
      } else {
        alert('Error testing agent');
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      alert('Error testing agent');
    }
  }

  if (showCreator) {
    return <AgentCreator onBack={() => { setShowCreator(false); fetchAgents(); }} />
  }

  if (editingAgent) {
    return <AgentEditor 
      agentId={editingAgent} 
      onBack={() => { setEditingAgent(null); fetchAgents(); }} 
    />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading agents...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <Button onClick={() => setShowCreator(true)}>Create New Agent</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.configuration?.capabilities?.slice(0, 3).map((cap, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingAgent(agent.id)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => testAgent(agent.id, agent.name)}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Agent Store Component
function AgentStore() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agent-store/listings')
      .then(res => res.json())
      .then(data => {
        setListings(data.listings || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching agent listings:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading agent store...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Store</h1>
        <p className="text-gray-600">Discover and install pre-built AI agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle className="text-lg">{listing.agent?.name}</CardTitle>
              <CardDescription>{listing.agent?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{listing.category}</Badge>
                  <span className="text-lg font-bold">${listing.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">⭐ {listing.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{listing.downloads} downloads</span>
                </div>
                <div className="space-x-2 mt-4">
                  <Button size="sm" variant="outline">Preview</Button>
                  <Button size="sm">Install</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Knowledge Builder Component
function KnowledgeBuilder() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [viewingSource, setViewingSource] = useState(null)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = () => {
    fetch('/api/knowledge-builder/sources')
      .then(res => res.json())
      .then(data => {
        setSources(data.sources || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching knowledge sources:', err)
        setLoading(false)
      })
  }

  const processSource = async (sourceId, sourceName) => {
    try {
      const response = await fetch(`/api/knowledge-builder/sources/${sourceId}/process`, {
        method: 'POST'
      });

      if (response.ok) {
        alert(`Processing started for "${sourceName}"! This may take a few minutes.`);
        // Update the source status in the local state
        setSources(prev => prev.map(source => 
          source.id === sourceId 
            ? { ...source, processing_status: 'processing' }
            : source
        ));
      } else {
        alert('Error starting processing');
      }
    } catch (error) {
      console.error('Error processing source:', error);
      alert('Error processing source');
    }
  }

  if (showCreator) {
    return <KnowledgeSourceCreator onBack={() => { setShowCreator(false); fetchSources(); }} />
  }

  if (viewingSource) {
    return <KnowledgeSourceViewer 
      sourceId={viewingSource} 
      onBack={() => { setViewingSource(null); fetchSources(); }} 
    />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading knowledge sources...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Knowledge Builder</h1>
        <Button onClick={() => setShowCreator(true)}>Add Knowledge Source</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <CardTitle className="text-lg">{source.name}</CardTitle>
              <CardDescription>Type: {source.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge 
                  variant={
                    source.processing_status === 'completed' ? 'default' :
                    source.processing_status === 'processing' ? 'secondary' :
                    source.processing_status === 'failed' ? 'destructive' : 'outline'
                  }
                >
                  {source.processing_status}
                </Badge>
                <div className="text-sm text-gray-600">
                  {source.type === 'text' ? 
                    `${source.path_or_url.substring(0, 100)}...` : 
                    source.path_or_url
                  }
                </div>
                <div className="space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setViewingSource(source.id)}
                  >
                    View
                  </Button>
                  {source.processing_status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => processSource(source.id, source.name)}
                    >
                      Process
                    </Button>
                  )}
                  {source.processing_status === 'failed' && (
                    <Button 
                      size="sm"
                      onClick={() => processSource(source.id, source.name)}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Navigation Component
function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              AImpact Platform
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/workflows" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Workflows
            </Link>
            <Link to="/agents" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Agents
            </Link>
            <Link to="/agent-store" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Agent Store
            </Link>
            <Link to="/knowledge-builder" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Knowledge Builder
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agent-store" element={<AgentStore />} />
              <Route path="/knowledge-builder" element={<KnowledgeBuilder />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App

