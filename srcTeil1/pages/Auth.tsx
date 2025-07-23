
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("User is authenticated, redirecting to core-platform");
      navigate("/core-platform");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-quantum-50 to-neural-50 dark:from-gray-900 dark:to-gray-900">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}
