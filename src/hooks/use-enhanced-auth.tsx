
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, AuthUser, LoginCredentials, RegisterData } from "@/services/auth/authService";
import { toast } from "@/hooks/use-toast";

interface EnhancedAuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isDemoMode: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

export function EnhancedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check demo mode status
      const demoStatus = await authService.getDemoStatus();
      setIsDemoMode(demoStatus.isDemoMode);

      // Get current user if token exists
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = await authService.login(credentials);
      
      if (token) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        toast({
          title: "Anmeldung erfolgreich",
          description: `Willkommen ${isDemoMode ? 'im Demo-Modus' : 'zurück'}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Bitte überprüfen Sie Ihre Anmeldedaten.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await authService.register(data);
      
      if (success) {
        toast({
          title: "Registrierung erfolgreich",
          description: "Sie können sich jetzt anmelden.",
        });
        return true;
      } else {
        toast({
          title: "Registrierung fehlgeschlagen",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <EnhancedAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDemoMode,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </EnhancedAuthContext.Provider>
  );
}

export const useEnhancedAuth = () => useContext(EnhancedAuthContext);
