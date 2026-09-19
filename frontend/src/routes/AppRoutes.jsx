import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages & Components
import Home from '../pages/Home/Home';
import IndustryLoginSelection from '../pages/Home/LoginSelection';
import Login from '../pages/Auth/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import StudentDashboard from '../pages/Student/Dashboard';
import AttendanceWorkspace from '../pages/Attendance/AttendanceWorkspace';

// RBAC Route Guard Component
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public Base Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login-select" element={<IndustryLoginSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 🔒 Secured Dashboard Route (Protected by NAV_METRICS Right) */}
      <Route element={<RoleRoute requiredRight="NAV_METRICS" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      {/* 🔒 Secured Attendance Workspace Route (Protected by NAV_MANAGE_ATTENDANCE Right) */}
      <Route element={<RoleRoute requiredRight="NAV_MANAGE_ATTENDANCE" />}>
        <Route path="/attendance/workspace" element={<AttendanceWorkspace isReadOnlyMode={false} />} />
      </Route>

      {/* 🛑 Access Restricted Fallback Route */}
      <Route 
        path="/unauthorized" 
        element={
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '5rem', background: '#0a0c10', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>🛑 Access Restricted</h1>
            <p style={{ color: '#94a3b8', maxWidth: '500px' }}>
              Your current user account does not possess the required database permissions to view or execute operations on this module.
            </p>
          </div>
        } 
      />

      {/* 🔄 Generic Redirect Handling Block */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;