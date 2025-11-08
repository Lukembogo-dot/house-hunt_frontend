import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications on load", error);
    }
  }, []); 

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/profile');
        // ✅ 1. Store the complete user object, including 'isVerified'
        const userData = { ...data, favorites: data.favorites || [] };
        setUser(userData);
        
        await fetchNotifications(); 
        
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, [fetchNotifications]); 

  const login = (userData) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    // ✅ 2. Store the complete user object, including 'isVerified'
    const completeUserData = { ...userData, favorites: userData.favorites || [] };
    setUser(completeUserData);
    
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
      
      setNotifications([]); 
      setUnreadCount(0);
    }
  };

  const addNotification = (newNotification) => {
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    setUnreadCount((prevCount) => prevCount + 1);
  };

  const markNotificationsAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await apiClient.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // --- (Favorite functions are unchanged) ---
  const addFavoriteContext = async (propertyId) => {
    if (!user) {
      alert("Please log in to save properties.");
      return;
    }
    // (rest of the function is unchanged)
    try {
      const { data } = await apiClient.post(`/users/profile/favorites`, { propertyId }, { withCredentials: true });
      setUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites,
      }));
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };
  
  const removeFavoriteContext = async (propertyId) => {
    if (!user) return;
    // (rest of the function is unchanged)
    try {
      const { data } = await apiClient.delete(`/users/profile/favorites/${propertyId}`, { withCredentials: true });
      setUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites,
      }));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      addFavoriteContext,
      removeFavoriteContext,
      
      notifications,
      unreadCount,
      addNotification,
      markNotificationsAsRead,
      setUser // ✅ 3. Expose setUser so VerifyEmail can update it
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};