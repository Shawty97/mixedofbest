
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { useNavigate } from "react-router-dom";

export function EnhancedAuthForm() {
  const navigate = useNavigate();
  const { login, register, isDemoMode, isLoading } = useEnhancedAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const validateForm = () => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return false;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage("Das Passwort muss mindestens 6 Zeichen lang sein");
      return false;
    }
    
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setErrorMessage("Vollständiger Name ist erforderlich");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Die Passwörter stimmen nicht überein");
        return false;
      }
    }
    
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const success = await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        });
        
        if (success) {
          setIsSignUp(false);
          setFormData({...formData, confirmPassword: "", fullName: ""});
        }
      } else {
        const success = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (success) {
          navigate("/core-platform");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrorMessage("Ein unerwarteter Fehler ist aufgetreten");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          {isSignUp ? <UserPlus className="h-8 w-8 text-quantum-600" /> : <Lock className="h-8 w-8 text-quantum-600" />}
        </div>
        <CardTitle className="text-2xl">
          {isSignUp ? "Konto erstellen" : "Willkommen zurück"}
        </CardTitle>
        <CardDescription>
          {isDemoMode && (
            <span className="text-quantum-600 font-medium">
              Demo-Modus: Verwenden Sie demo@aimpact.com / demo123
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                placeholder="Max Mustermann"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder={isDemoMode ? "demo@aimpact.com" : "you@example.com"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isDemoMode ? "demo123" : "••••••••"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Passwort bestätigen"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? "Verarbeitung..."
              : isSignUp
              ? "Konto erstellen"
              : "Anmelden"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
              setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
            }}
            className="text-quantum-600 hover:text-quantum-700 dark:text-quantum-400 dark:hover:text-quantum-300"
            disabled={isLoading}
          >
            {isSignUp
              ? "Haben Sie bereits ein Konto? Anmelden"
              : "Benötigen Sie ein Konto? Registrieren"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
