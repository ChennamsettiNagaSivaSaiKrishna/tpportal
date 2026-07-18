import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Home'; // Import our brand new global home screen component
import IndustryLoginSelection from '../pages/Home/LoginSelection'; // Retained intact
// import UnifiedStudentAuth from '../pages/Student/Login';
import StudentDashboard from '../pages/Student/Dashboard';
import Login from '../pages/Auth/Login';
import AttendanceWorkspace from '../pages/Attendance/AttendanceWorkspace'; // 🚀 Import new attendance module view

const AppRoutes = () => {
  return (
    <Routes>
      {/* 💡 The base landing page URL is now explicitly mapped to our unified Home screen */}
      <Route path="/" element={<Home />} />
      
      {/* Retained your original routing patterns completely intact */}
      <Route path="/login-select" element={<IndustryLoginSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />

      {/* 🚀 Dynamic Attendance Route Module Context */}
      <Route path="/attendance/workspace" element={<AttendanceWorkspace />} />

      {/* Generic redirect handling block */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;