import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-brand-orange/40 shadow-orange-glow animate-pulse">
          <svg
            className="w-7 h-7 text-brand-orange animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </div>
        <div className="text-xs font-mono tracking-widest text-textMuted uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
          <span>AUTHENTICATING ATHLETE...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
