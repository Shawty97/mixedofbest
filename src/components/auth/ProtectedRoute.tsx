import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // For now, just render children without authentication check
  // This will be replaced with actual authentication logic
  return <>{children}</>;
};