import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function will now work because our axios.js interceptor
    // will automatically find the token in localStorage and send it.
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/profile'); // No longer need withCredentials
        
        // ✅ FIX: Ensure favorites is always an array
        const userData = { ...data, favorites: data.favorites || [] };
        setUser(userData);
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token'); // Also clear token if profile check fails
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = (userData) => {
    // ✅ --- THIS IS THE FIX ---
    // Save the token to localStorage.
    // The axios.js interceptor will now find and use this token.
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    // -------------------------

    // ✅ FIX: Ensure favorites is always an array on login
    const completeUserData = { ...userData, favorites: userData.favorites || [] };
    setUser(completeUserData);
  };

  const logout = async () => {
    try {
      // We still call the backend logout endpoint
      await apiClient.post('/auth/logout'); 
      
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      // ✅ --- THIS IS THE FIX ---
      // ALWAYS clear the user and remove the token from storage
      setUser(null);
      localStorage.removeItem('token');
      // -------------------------
    }
  };

  // --- NEW FUNCTIONS FOR FAVORITES ---
  // (These will now work because the interceptor will add the token)
  
  const addFavoriteContext = async (propertyId) => {
    if (!user) return;

    setUser(prevUser => ({
      ...prevUser,
      favorites: [...prevUser.favorites, propertyId], 
    }));

    try {
      // This request will now be authorized
      await apiClient.post(`/users/favorites/${propertyId}`);
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
      favorites: prevUser.favorites.filter(id => id !== propertyId),
    }));

    try {
      // This request will now be authorized
      await apiClient.delete(`/users/favorites/${propertyId}`);
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