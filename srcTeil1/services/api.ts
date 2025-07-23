
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new ApiError(error.detail || `HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred');
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new ApiError(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return this.request('/users/me');
  }

  // Knowledge methods
  async getKnowledgeSources() {
    return this.request('/knowledge/sources');
  }

  async createKnowledgeSource(data: any) {
    return this.request('/knowledge/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeSource(id: string) {
    return this.request(`/knowledge/sources/${id}`, {
      method: 'DELETE',
    });
  }

  async searchKnowledge(query: string, sourceIds: string[] = []) {
    return this.request('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query, source_ids: sourceIds }),
    });
  }

  // Workflows methods
  async getWorkflows() {
    return this.request('/workflows');
  }

  async createWorkflow(data: any) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkflow(id: string) {
    return this.request(`/workflows/${id}`);
  }

  async updateWorkflow(id: string, data: any) {
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async runWorkflow(id: string) {
    return this.request(`/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Agents methods
  async getAgents() {
    return this.request('/agents');
  }

  async createAgent(data: any) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgent(id: string) {
    return this.request(`/agents/${id}`);
  }

  async updateAgent(id: string, data: any) {
    return this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string) {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async testAgent(id: string, prompt: string) {
    return this.request(`/agents/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}

export const apiClient = new ApiClient();
export { ApiError };
