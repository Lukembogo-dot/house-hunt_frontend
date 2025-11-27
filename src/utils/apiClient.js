import axios from 'axios';

// 1. Robust URL Handling
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api`;

console.log("📡 Connecting to Backend at:", apiUrl);

// 2. Create the instance
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. REQUEST Interceptor: Attaches Token
apiClient.interceptors.request.use(
  (config) => {
    // FIX: Your AuthContext saves the raw token string as 'token'
    // We strictly look for that key.
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. RESPONSE Interceptor: Handles 401 (Bad Token) WITHOUT Looping
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 Auth Error
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Logging out...");

      // Clear the token so we don't keep sending bad requests
      localStorage.removeItem('token');

      // LOOP PREVENTION:
      // Only redirect if we are NOT already on the login page.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;