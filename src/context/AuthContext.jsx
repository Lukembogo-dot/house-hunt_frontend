import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ 1. Add state for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ 2. Create a function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications on load", error);
    }
  }, []); // useCallback ensures this function doesn't change on re-renders

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/profile');
        const userData = { ...data, favorites: data.favorites || [] };
        setUser(userData);
        
        // ✅ 3. Fetch notifications *after* user is successfully loaded
        await fetchNotifications(); 
        
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, [fetchNotifications]); // Add fetchNotifications as a dependency

  const login = (userData) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    const completeUserData = { ...userData, favorites: userData.favorites || [] };
    setUser(completeUserData);
    
    // ✅ 4. Fetch notifications on login
    fetchNotifications(); 
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      
      // ✅ 5. Clear notifications on logout
      setNotifications([]); 
      setUnreadCount(0);
    }
  };

  // ✅ 6. Create function for the socket to add a new notification
  const addNotification = (newNotification) => {
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    setUnreadCount((prevCount) => prevCount + 1);
  };

  // ✅ 7. Create function for the bell to mark notifications as read
  const markNotificationsAsRead = async () => {
    if (unreadCount === 0) return; // Don't do anything if there's nothing to mark
    
    try {
      await apiClient.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // --- (Favorite functions are unchanged) ---
  const addFavoriteContext = async (propertyId) => { /* ...no change... */ };
  const removeFavoriteContext = async (propertyId) => { /* ...no change... */ };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      addFavoriteContext,
      removeFavoriteContext,
      
      // ✅ 8. Expose all the new notification states and functions
      notifications,
      unreadCount,
      addNotification,
      markNotificationsAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};