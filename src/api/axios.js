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
  return Promise.reject(error);
});

// ✅ --- RESPONSE INTERCEPTOR (Refresh Token Logic) ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 1. Attempt using the httpOnly Refresh Cookie
        const { data } = await apiClient.post('/auth/refresh');

        // 2. If success, we get a new Access Token
        const newAccessToken = data.token;
        localStorage.setItem('token', newAccessToken);

        // 3. Update header and retry
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 4. If refresh fails, clear everything (Log out)
        console.error("Session expired, logging out...", refreshError);
        localStorage.removeItem('token');
        // Ideally redirect to login or let AuthContext handle it
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
// -----------------------------------------------------------------

export default apiClient;