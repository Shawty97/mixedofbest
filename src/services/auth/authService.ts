
import { toast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';

export interface AuthUser {
  id: string;
  email: string;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

class AuthService {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    this.token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
  }

  // Demo mode authentication
  async login(credentials: LoginCredentials): Promise<AuthToken | null> {
    try {
      // Demo mode simulation
      if (credentials.email === 'demo@aimpact.com' && credentials.password === 'demo123') {
        const mockToken = {
          accessToken: 'demo-jwt-token-' + Date.now(),
          tokenType: 'bearer',
          expiresIn: 3600
        };
        
        this.token = mockToken.accessToken;
        
        // Store in both localStorage and secure cookie
        localStorage.setItem('auth_token', mockToken.accessToken);
        Cookies.set('auth_token', mockToken.accessToken, { 
          expires: 1, // 1 day
          secure: true,
          sameSite: 'strict'
        });
        
        localStorage.setItem('auth_user', JSON.stringify({
          id: 'demo-user-1',
          email: 'demo@aimpact.com',
          isActive: true,
          isSuperuser: false,
          createdAt: new Date().toISOString()
        }));

        return mockToken;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async register(data: RegisterData): Promise<boolean> {
    try {
      // Demo mode simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration
      console.log('Demo registration for:', data.email);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userJson = localStorage.getItem('auth_user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    Cookies.remove('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Demo mode check
  async getDemoStatus(): Promise<{ isDemoMode: boolean; message: string }> {
    return {
      isDemoMode: true,
      message: 'AImpact Platform läuft im Demo-Modus. Alle Funktionen sind zur Demonstration verfügbar.'
    };
  }
}

export const authService = new AuthService();
