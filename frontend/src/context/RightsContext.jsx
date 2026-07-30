import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import API from '../services/api';

const RightsContext = createContext(null);

export const RightsProvider = ({ children }) => {
  const authContextValue = useContext(AuthContext) || {};
  const user = authContextValue.user || authContextValue;
  const isAuthenticated = authContextValue.isAuthenticated ?? !!user;

  const [rights, setRights] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchUserRights = async () => {
      if (!isAuthenticated) {
        setRights([]);
        setLoading(false);
        fetchedRef.current = false;
        return;
      }

      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        setLoading(true);
        const res = await API.get('/users/rights').catch(() => null); 
        if (res && res.data && res.data.success && res.data.rights?.length > 0) {
          setRights(res.data.rights);
          return;
        }
      } catch (err) {
        console.error("Failed to load backend rights matrix:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRights();
  }, [isAuthenticated]);

  // Safely extract role properties from the user session
  const role = user?.role || user?.userType || user?.type || user?.data?.role || user?.user_type || "";
  const email = user?.email || user?.data?.email || "";
  const roleStr = String(role).toLowerCase();
  const emailStr = String(email).toLowerCase();

  // Explicit check for Staff / Placement / Admin
  const isPlacementStaff = 
    roleStr.includes("placement") || 
    roleStr.includes("admin") || 
    roleStr.includes("staff") || 
    roleStr.includes("coordinator") ||
    emailStr.includes("placement") || 
    emailStr.includes("admin") ||
    emailStr.includes("staff");

  // Explicitly true ONLY if it contains student or if it's explicitly not staff and handles student profile endpoints
  const isStudent = roleStr.includes("student") || (!isPlacementStaff && (emailStr.includes("student") || window.location.pathname.includes("student")));

  const hasRight = (rightName) => {
    if (rights && rights.length > 0) {
      return rights.includes(rightName);
    }
    
    if (isStudent) {
      const studentAllowedRights = [
        "NAV_METRICS", "NAV_PLACEMENTS", "NAV_DRIVES", "NAV_SKILLS", 
        "NAV_CALENDAR", "NAV_RESUME", "NAV_ATTENDANCE_HISTORY", 
        "NAV_NOTIFICATIONS", "NAV_PROFILE"
      ];
      return studentAllowedRights.includes(rightName);
    }

    return true; // Staff / Placement full access
  };

  return (
    <RightsContext.Provider value={{ rights, hasRight, isStudent, userRole: roleStr, loading, loadingRights: loading }}>
      {children}
    </RightsContext.Provider>
  );
};

export const useRights = () => {
  const context = useContext(RightsContext);
  if (!context) {
    return {
      rights: [],
      isStudent: true,
      userRole: "student",
      hasRight: () => true,
      loadingRights: false,
      loading: false
    };
  }
  return context;
};

export default RightsContext;