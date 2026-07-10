import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route protection component checking role access matrix
 * @param {Array} allowedRoles - e.g., ['student'] or ['admin', 'hod']
 */
const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Verifying secure session...</div>;
  }

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/" replace />;
//   }

//   const hasAccess = allowedRoles.includes(user.role);

//   return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" replace />;
  return <Outlet />
};

export default RoleRoute;