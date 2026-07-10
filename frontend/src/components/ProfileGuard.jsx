import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProfileGuard = ({ requireComplete = true }) => {
  const { user, loading } = useAuth();

  // 1. Wait for session authentication tokens to finish syncing
  if (loading) {
    return null; 
  }

  // 2. If no user session is present, bounce straight back to the login gateway panel
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  // 3. Let Admins and Corporate accounts bypass these checks entirely
  if (user.role !== 'student') {
    return <Outlet />;
  }

  // 4. Safely evaluate student onboarding fields
  const isProfileComplete = user.branch && user.cgpa && user.phone_number;

  if (requireComplete && !isProfileComplete) {
    return <Navigate to="/student/complete-profile" replace />;
  }

  if (!requireComplete && isProfileComplete) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
};