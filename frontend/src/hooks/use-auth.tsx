import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_demo_user?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, full_name?: string) => Promise<void>;
  logout: () => void;
  getDemoToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // For demo purposes, allow demo login
      if (email === 'demo@aimpact.dev' && password === 'demo') {
        const demoUser = {
          id: 'demo_user',
          email: 'demo@aimpact.dev',
          full_name: 'Demo User',
          is_demo_user: true
        };
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('user_data', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      // Mock API call - in real app this would call the backend
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = {
        id: data.user_id,
        email: email,
        full_name: email.split('@')[0],
        is_demo_user: data.demo_mode
      };

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, full_name?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, full_name })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const userData = {
        id: data.user_id,
        email: email,
        full_name: full_name || username,
        is_demo_user: false
      };

      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const getDemoToken = async () => {
    const demoUser = {
      id: 'demo_user',
      email: 'demo@aimpact.dev',
      full_name: 'Demo User',
      is_demo_user: true
    };
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('user_data', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      getDemoToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};