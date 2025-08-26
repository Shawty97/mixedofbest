const API_BASE_URL = 'http://localhost:8000/api';

export interface Agent {
  _id?: string;
  agent_id: string;
  name: string;
  description?: string;
  agent_type: string;
  capabilities: string[];
  voice_config: {
    provider: string;
    voice_id: string;
    language: string;
  };
  personality: {
    tone: string;
    style: string;
    expertise_level: string;
  };
  performance_metrics: {
    total_conversations: number;
    avg_response_time: number;
    satisfaction_score: number;
    success_rate: number;
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  _id?: string;
  workflow_id: string;
  name: string;
  description?: string;
  type: string;
  steps: any[];
  estimated_duration: number;
  success_criteria: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  _id?: string;
  task_id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  assigned_agent_id?: string;
  workflow_id?: string;
  input_data: any;
  output_data?: any;
  metrics: any;
  created_at: string;
  completed_at?: string;
}

export interface Session {
  _id?: string;
  session_id: string;
  agent_id: string;
  user_id?: string;
  status: string;
  conversation_history: any[];
  metadata: any;
  created_at: string;
  ended_at?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('/agents');
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`);
  }

  async createAgent(agent: Omit<Agent, '_id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    return this.request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  }

  async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agent),
    });
  }

  async deleteAgent(id: string): Promise<void> {
    return this.request<void>(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow methods
  async getWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>('/workflows');
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>(`/workflows/${id}`);
  }

  async createWorkflow(workflow: Omit<Workflow, '_id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    return this.request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request<void>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, '_id' | 'created_at'>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Session methods
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions');
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(session: Omit<Session, '_id' | 'created_at'>): Promise<Session> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateSession(id: string, session: Partial<Session>): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getDashboardStats(): Promise<{
    totalAgents: number;
    totalWorkflows: number;
    totalTasks: number;
    totalSessions: number;
    activeAgents: number;
    activeWorkflows: number;
    completedTasks: number;
    activeSessions: number;
  }> {
    return this.request<any>('/analytics/dashboard');
  }
}

export const apiService = new ApiService();
export default apiService;