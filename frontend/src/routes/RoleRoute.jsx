import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useRights } from "../context/RightsContext";

const RoleRoute = ({ requiredRight, allowedRoles }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { hasRight, loading: rightsLoading } = useRights();

  // 1. Wait until authentication and rights contexts are fully synced
  if (authLoading || rightsLoading) {
    return (
      <div 
        className="portal-container" 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "100vh",
          color: "#fff",
          background: "#0b0f19"
        }}
      >
        Verifying Workspace Access Permissions...
      </div>
    );
  }

  // 2. If not authenticated at all, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Optional role check (if specific allowedRoles are passed)
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Optional right check (if a specific requiredRight string is passed)
  if (requiredRight && !hasRight(requiredRight)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. Access granted, render the matching child route component
  return <Outlet />;
};

export default RoleRoute;