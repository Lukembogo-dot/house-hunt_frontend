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
        // ✅ FIX: Ensure favorites is always an array
        const userData = { ...data, favorites: data.favorites || [] };
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = (userData) => {
    // ✅ FIX: Ensure favorites is always an array on login
    const completeUserData = { ...userData, favorites: userData.favorites || [] };
    setUser(completeUserData);
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

  // --- NEW FUNCTIONS FOR FAVORITES ---
  
  const addFavoriteContext = async (propertyId) => {
    if (!user) return;

    setUser(prevUser => ({
      ...prevUser,
      // This is now safe because we know favorites is an array
      favorites: [...prevUser.favorites, propertyId], 
    }));

    try {
      await apiClient.post(`/users/favorites/${propertyId}`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Failed to add favorite", error);
      setUser(prevUser => ({
        ...prevUser,
        favorites: prevUser.favorites.filter(id => id !== propertyId),
      }));
      alert("Failed to save property. Please try again.");
    }
  };

  const removeFavoriteContext = async (propertyId) => {
    if (!user) return;

    const oldFavorites = user.favorites;
    setUser(prevUser => ({
      ...prevUser,
      // This is now safe
      favorites: prevUser.favorites.filter(id => id !== propertyId),
    }));

    try {
      await apiClient.delete(`/users/favorites/${propertyId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Failed to remove favorite", error);
      setUser(prevUser => ({
        ...prevUser,
        favorites: oldFavorites,
      }));
      alert("Failed to remove property. Please try again.");
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      addFavoriteContext,
      removeFavoriteContext
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};