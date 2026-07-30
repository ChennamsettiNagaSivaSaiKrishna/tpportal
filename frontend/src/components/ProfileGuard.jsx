import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../context/RightsContext';

export const ProfileGuard = ({ requireComplete = true, requiredRight }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRight, loadingRights } = useRights();

  // 1. Wait for session authentication and rights context to finish syncing
  if (authLoading || loadingRights) {
    return null; 
  }

  // 2. If no user session is present, bounce straight back to the login gateway panel
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  // 3. Check optional database-driven right requirements if passed to the guard
  if (requiredRight && !hasRight(requiredRight)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Safely evaluate student onboarding fields
  const isProfileComplete = Boolean(user.branch && user.cgpa && user.phone_number);

  if (requireComplete && !isProfileComplete) {
    return <Navigate to="/student/complete-profile" replace />;
  }

  if (!requireComplete && isProfileComplete) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProfileGuard;