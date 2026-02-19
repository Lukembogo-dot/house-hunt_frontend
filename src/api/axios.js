// src/api/axios.js
import axios from "axios";

/**
 * Determine the base URL for the API.
 * - We must use import.meta.env.VITE_API_URL for Vite projects.
 * - It falls back to http://localhost:5000 for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://house-hunt-api-kemz.onrender.com";

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
// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops: If the error comes FROM the refresh endpoint OR login endpoint, don't try to refresh.
    if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
      // Don't log out if it's just a failed login attempt, just return the error
      if (originalRequest.url.includes('/auth/refresh')) {
        console.error("Refresh token failed. Logging out.");
        const hadToken = !!localStorage.getItem('token');
        localStorage.removeItem('token');
        isRefreshing = false;
        processQueue(error, null);

        // Only redirect to login if the user was actually logged in before
        // (had a token that expired), not for public users browsing
        if (hadToken) {
          setTimeout(() => {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              window.location.href = '/login?session=expired';
            }
          }, 1000);
        }
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if user has a token - if not, they're not logged in, so just reject
      const token = localStorage.getItem('token');
      if (!token) {
        // User is not logged in, just return the error without redirecting
        return Promise.reject(error);
      }
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 1. Attempt using the httpOnly Refresh Cookie
        const { data } = await apiClient.post('/auth/refresh');

        // 2. If success, we get a new Access Token
        const newAccessToken = data.token;
        localStorage.setItem('token', newAccessToken);

        // 3. Update header and retry
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Process any queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 4. If refresh fails, clear everything (Log out)
        console.error("Session expired, logging out...", refreshError);
        localStorage.removeItem('token');
        processQueue(refreshError, null);
        isRefreshing = false;

        // Redirect to login page
        setTimeout(() => {
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login?session=expired';
          }
        }, 1000);

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
// -----------------------------------------------------------------

export default apiClient;