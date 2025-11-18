import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

// --- 1. Create mock user objects for preview ---
// We create these outside so they are stable
const PREVIEW_USER_OBJECT = {
  // This can be a generic object representing a basic user
  name: 'Preview User',
  email: 'user@preview.com',
  role: 'user',
  isVerified: true,
  favorites: [],
  // Add any other fields your app expects
};

const PREVIEW_AGENT_OBJECT = {
  // This can be a generic object representing a basic agent
  name: 'Preview Agent',
  email: 'agent@preview.com',
  role: 'agent',
  isVerified: true,
  favorites: [],
  // Add any other fields your app expects
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
  }, [previewRole]); // Add previewRole as dependency

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/profile');
        const userData = { ...data, favorites: data.favorites || [] };
        // --- 4. Update 'realUser' ---
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
    // --- 5. Update 'realUser' ---
    setRealUser(completeUserData);
    
    fetchNotifications(); 
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      // --- 6. Clear 'realUser' AND 'previewRole' ---
      setRealUser(null);
      setPreviewRole(null); // Exit preview on logout
      localStorage.removeItem('token');
      
      setNotifications([]); 
      setUnreadCount(0);
    }
  };
  
  // --- 7. Add new functions to control preview mode ---
  const startPreview = (role) => {
    if (realUser && realUser.role === 'admin') {
      setPreviewRole(role);
    }
  };

  const stopPreview = () => {
    setPreviewRole(null);
  };
  
  // --- 8. Create the "effectiveUser" for the app ---
  // This is the magic!
  let effectiveUser = realUser;
  
  if (realUser && realUser.role === 'admin' && previewRole) {
    switch (previewRole) {
      case 'guest':
        effectiveUser = null; // Simulate being logged out
        break;
      case 'user':
        effectiveUser = PREVIEW_USER_OBJECT; // Simulate a basic user
        break;
      case 'agent':
        effectiveUser = PREVIEW_AGENT_OBJECT; // Simulate a basic agent
        break;
      default:
        effectiveUser = realUser;
    }
  }

  // (Notification functions are unchanged)
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

  // --- (Favorite functions updated) ---
  const addFavoriteContext = async (propertyId) => {
    if (!effectiveUser) { 
      alert("Please log in to save properties.");
      return;
    }
    try {
      // ✅ FIX: Correct URL structure. ID goes in URL, empty body.
      // Was: /users/profile/favorites (404)
      // Now: /users/favorites/:propertyId
      const { data } = await apiClient.post(`/users/favorites/${propertyId}`, {}, { withCredentials: true });
      
      setRealUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites,
      }));
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };
  
  const removeFavoriteContext = async (propertyId) => {
    if (!effectiveUser) return;
    try {
      // ✅ FIX: Correct URL structure
      // Was: /users/profile/favorites/:id (404)
      // Now: /users/favorites/:id
      const { data } = await apiClient.delete(`/users/favorites/${propertyId}`, { withCredentials: true });
      
      setRealUser(prevUser => ({
        ...prevUser,
        favorites: data.favorites,
      }));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };
  
  // --- 9. Create a clean way to update user verification ---
  const updateUserVerification = (isVerified) => {
    setRealUser(prev => prev ? { ...prev, isVerified } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      // --- 10. Update the provided value ---
      user: effectiveUser, // 👈 The "fake" user for the app
      realUser: realUser,    // 👈 The "real" admin user
      previewRole,         // 👈 The current preview role
      startPreview,        // 👈 Function to start preview
      stopPreview,         // 👈 Function to stop preview
      
      login, 
      logout, 
      loading, 
      addFavoriteContext,
      removeFavoriteContext,
      
      notifications,
      unreadCount,
      addNotification,
      markNotificationsAsRead,
      updateUserVerification // 👈 Replaces the old 'setUser'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};