import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Shield, 
  Key, 
  Settings, 
  UserPlus, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RotateCcw
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
}

export default function Access() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2024-01-01'
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'developer',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      createdAt: '2024-01-05'
    },
    {
      id: 'user-3',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'viewer',
      status: 'pending',
      lastLogin: 'Never',
      createdAt: '2024-01-14'
    }
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-1',
      name: 'Production API',
      key: 'sk-prod-abc123...xyz789',
      permissions: ['agents:read', 'agents:write', 'calls:read'],
      lastUsed: '2024-01-15 14:25',
      createdAt: '2024-01-01',
      expiresAt: '2024-12-31'
    },
    {
      id: 'key-2',
      name: 'Development API',
      key: 'sk-dev-def456...uvw012',
      permissions: ['agents:read', 'calls:read'],
      lastUsed: '2024-01-14 16:45',
      createdAt: '2024-01-10'
    }
  ]);

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as const
  });

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[],
    expiresAt: ''
  });

  const roles = [
    { id: 'admin', name: 'Admin', description: 'Full access to all features' },
    { id: 'developer', name: 'Developer', description: 'Can create and manage agents' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ];

  const permissions = [
    { id: 'agents:read', name: 'Read Agents' },
    { id: 'agents:write', name: 'Write Agents' },
    { id: 'calls:read', name: 'Read Calls' },
    { id: 'calls:write', name: 'Write Calls' },
    { id: 'deploy:read', name: 'Read Deployments' },
    { id: 'deploy:write', name: 'Write Deployments' }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskApiKey = (key: string) => {
    const parts = key.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-${parts[1]}-${parts[2].substring(0, 6)}...${parts[2].slice(-6)}`;
    }
    return key.substring(0, 12) + '...' + key.slice(-6);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access & Identity</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and API access for your voice agents
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Login</p>
                      <p className="font-medium">{user.lastLogin}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium">{user.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">User ID</p>
                      <p className="font-medium font-mono text-xs">{user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Generate Key
            </Button>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                      <CardDescription>
                        Created {apiKey.createdAt}
                        {apiKey.expiresAt && ` • Expires ${apiKey.expiresAt}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                    >
                      {showApiKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <code className="flex-1 text-sm font-mono">
                        {showApiKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Used</p>
                        <p className="font-medium">{apiKey.lastUsed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Permissions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {role.name}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          id={`${role.id}-${permission.id}`}
                          checked={role.id === 'admin' || (role.id === 'developer' && !permission.id.includes('deploy'))}
                          disabled
                        />
                        <Label htmlFor={`${role.id}-${permission.id}`} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure security policies for your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Single Sign-On (SSO)</Label>
                    <p className="text-sm text-muted-foreground">Enable SAML/OAuth integration</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Security</CardTitle>
                <CardDescription>Configure API access and rate limiting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                  </div>
                  <Input type="number" defaultValue="1000" className="w-24" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">Restrict API access by IP</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Key Rotation</Label>
                    <p className="text-sm text-muted-foreground">Automatic key rotation period</p>
                  </div>
                  <Select defaultValue="90d">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="365d">1 year</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}