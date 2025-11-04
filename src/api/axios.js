// src/api/axios.js
import axios from "axios";

/**
 * Get the API URL from the environment variables.
 * We must use import.meta.env.VITE_API_URL for Vite projects.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export default api;