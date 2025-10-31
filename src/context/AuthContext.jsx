import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth check

  // Function to check if a user is already logged in (e.g., on page refresh)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // We use the '/api/auth/profile' route which is protected.
        // If the cookie is valid, it will return user data.
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        // If it fails, it means no valid cookie, so no user is logged in.
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
      // We will create this backend route next
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
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

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};