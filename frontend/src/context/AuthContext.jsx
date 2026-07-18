import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  

  const verifySession = useCallback(async () => {
    try {
      const response = await API.get('/auth/me'); 
     if (response.data.success) {
  setUser(response.data.user);
  setIsAuthenticated(true);
}
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    const handleExpiry = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-session-expired', handleExpiry);
    return () => window.removeEventListener('auth-session-expired', handleExpiry);
  }, [verifySession]);

  const login = async (credentials, role) => {
    debugger;
    const response = await API.post('/auth/login', { ...credentials, role });
    if (response.data.success) {
      setUser(response.data);
      setIsAuthenticated(true);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      // 1. Notify the backend to clear cookies if applicable
      await API.post('/auth/logout');
    } catch (err) {
      console.error("Token clearance broadcast note:", err);
    } finally {
      // 2. CRITICAL: Evict all credentials from local configurations
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);

      // 3. FORCE REDIRECTION: Smash the history stack and drop them at the home selector
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, verifySession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};