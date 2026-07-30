import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verifies session or stored token on load
  const verifySession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await API.get('/auth/me'); 
      if (response.data && response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
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
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-rights-updated'));
    };

    window.addEventListener('auth-session-expired', handleExpiry);
    return () => window.removeEventListener('auth-session-expired', handleExpiry);
  }, [verifySession]);

  const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    
    if (response.data && response.data.success) {
      const { token, user: loggedInUser } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth-rights-updated'));
    }
    
    return response.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('auth-rights-updated'));
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, verifySession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};