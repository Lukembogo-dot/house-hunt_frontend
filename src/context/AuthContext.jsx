import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

// --- 1. Create mock user objects for preview ---
// We create these outside so they are stable
const PREVIEW_USER_OBJECT = {
  name: 'Preview User',
  email: 'user@preview.com',
  role: 'user',
  isVerified: true,
  favorites: [],
};

const PREVIEW_AGENT_OBJECT = {
  name: 'Preview Agent',
  email: 'agent@preview.com',
  role: 'agent',
  isVerified: true,
  favorites: [],
};

export const AuthProvider = ({ children }) => {
  // --- 2. Rename 'user' to 'realUser' ---
  const [realUser, setRealUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- 3. Add new state for Preview Mode ---
  const [previewRole, setPreviewRole] = useState(null); // e.g., 'guest', 'user', 'agent'

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    // No notifications in preview mode
    if (previewRole) return; 
    
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications on load", error);
    }
  }, [previewRole]); 

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/profile');
        const userData = { ...data, favorites: data.favorites || [] };
        setRealUser(userData);
        await fetchNotifications(); 
      } catch (error) {
        setRealUser(null);
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
    const completeUserData = { ...userData, favorites: userData.favorites || [] };
    setRealUser(completeUserData);
    fetchNotifications(); 
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setRealUser(null);
      setPreviewRole(null); 
      localStorage.removeItem('token');
      setNotifications([]); 
      setUnreadCount(0);
    }
  };
  
  const startPreview = (role) => {
    if (realUser && realUser.role === 'admin') {
      setPreviewRole(role);
    }
  };

  const stopPreview = () => {
    setPreviewRole(null);
  };
  
  let effectiveUser = realUser;
  if (realUser && realUser.role === 'admin' && previewRole) {
    switch (previewRole) {
      case 'guest': effectiveUser = null; break;
      case 'user': effectiveUser = PREVIEW_USER_OBJECT; break;
      case 'agent': effectiveUser = PREVIEW_AGENT_OBJECT; break;
      default: effectiveUser = realUser;
    }
  }

  const addNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
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

  // ✅ --- UPDATED: Optimistic Add Favorite ---
  const addFavoriteContext = async (propertyId) => {
    if (!effectiveUser) { 
      alert("Please log in to save properties.");
      return;
    }

    // 1. Immediate Visual Update (Optimistic)
    setRealUser(prevUser => ({
      ...prevUser,
      favorites: [...(prevUser.favorites || []), propertyId]
    }));

    // 2. Optional: Visual Alert
    // alert("Added to favorites!"); 

    try {
      // 3. Background API Call
      const { data } = await apiClient.post(`/users/favorites/${propertyId}`, {}, { withCredentials: true });
      
      // 4. Sync with Server (just in case)
      if (data.favorites) {
        setRealUser(prevUser => ({
          ...prevUser,
          favorites: data.favorites,
        }));
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      // 5. Revert on Failure
      setRealUser(prevUser => ({
        ...prevUser,
        favorites: prevUser.favorites.filter(id => id !== propertyId)
      }));
      alert("Failed to save favorite. Please try again.");
    }
  };
  
  // ✅ --- UPDATED: Optimistic Remove Favorite ---
  const removeFavoriteContext = async (propertyId) => {
    if (!effectiveUser) return;

    // 1. Immediate Visual Update (Optimistic)
    setRealUser(prevUser => ({
      ...prevUser,
      favorites: prevUser.favorites.filter(id => id !== propertyId)
    }));

    try {
      // 2. Background API Call
      const { data } = await apiClient.delete(`/users/favorites/${propertyId}`, { withCredentials: true });
      
      // 3. Sync with Server
      if (data.favorites) {
        setRealUser(prevUser => ({
          ...prevUser,
          favorites: data.favorites,
        }));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      // 4. Revert on Failure
      setRealUser(prevUser => ({
        ...prevUser,
        favorites: [...prevUser.favorites, propertyId]
      }));
      alert("Failed to remove favorite.");
    }
  };
  
  const updateUserVerification = (isVerified) => {
    setRealUser(prev => prev ? { ...prev, isVerified } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user: effectiveUser, 
      realUser: realUser,    
      previewRole,        
      startPreview,       
      stopPreview,        
      login, 
      logout, 
      loading, 
      addFavoriteContext,
      removeFavoriteContext,
      notifications,
      unreadCount,
      addNotification,
      markNotificationsAsRead,
      updateUserVerification 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};