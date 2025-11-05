import React, { createContext, useState, useContext, useEffect } from 'react';
// ❌ Remove: import axios from 'axios';
import apiClient from '../api/axios'; // ✅ 1. Import our central api client

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // ✅ 2. Use apiClient and a relative path
        const { data } = await apiClient.get('/auth/profile', {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // ✅ 3. Use apiClient and a relative path
      await apiClient.post('/auth/logout', {}, {
        withCredentials: true,
      });
      setUser(null);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};