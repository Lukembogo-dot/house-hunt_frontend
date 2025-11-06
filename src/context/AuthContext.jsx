// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
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
      await apiClient.post('/auth/logout', {}, {
        withCredentials: true,
      });
      setUser(null);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // ✅ --- NEW FUNCTIONS FOR FAVORITES ---
  
  // This function adds a favorite
  const addFavoriteContext = async (propertyId) => {
    if (!user) return;

    // 1. Optimistic UI update: Add to state immediately
    setUser(prevUser => ({
      ...prevUser,
      favorites: [...prevUser.favorites, propertyId],
    }));

    // 2. Call the backend
    try {
      await apiClient.post(`/users/favorites/${propertyId}`, {}, {
        withCredentials: true,
      });
      // Backend confirmed, state is already correct
    } catch (error) {
      console.error("Failed to add favorite", error);
      // 3. Rollback on error
      setUser(prevUser => ({
        ...prevUser,
        favorites: prevUser.favorites.filter(id => id !== propertyId),
      }));
      alert("Failed to save property. Please try again.");
    }
  };

  // This function removes a favorite
  const removeFavoriteContext = async (propertyId) => {
    if (!user) return;

    // 1. Optimistic UI update: Remove from state immediately
    const oldFavorites = user.favorites; // Keep for rollback
    setUser(prevUser => ({
      ...prevUser,
      favorites: prevUser.favorites.filter(id => id !== propertyId),
    }));

    // 2. Call the backend
    try {
      await apiClient.delete(`/users/favorites/${propertyId}`, {
        withCredentials: true,
      });
      // Backend confirmed, state is correct
    } catch (error) {
      console.error("Failed to remove favorite", error);
      // 3. Rollback on error
      setUser(prevUser => ({
        ...prevUser,
        favorites: oldFavorites,
      }));
      alert("Failed to remove property. Please try again.");
    }
  };
  
  // ✅ --- END NEW FUNCTIONS ---


  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      addFavoriteContext,    // ✅ Pass new function
      removeFavoriteContext  // ✅ Pass new function
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};