// src/api/axios.js
import axios from "axios";

/**
 * Determine the base URL for the API.
 * - We must use import.meta.env.VITE_API_URL for Vite projects.
 * - It falls back to http://localhost:5000 for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true 
});

// -----------------------------------------------------------------
// ✅ THIS IS THE FIX: ADD THIS INTERCEPTOR
// -----------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // If the token exists, add it to the Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  // Handle request errors
  return Promise.reject(error);
});
// -----------------------------------------------------------------

export default apiClient;