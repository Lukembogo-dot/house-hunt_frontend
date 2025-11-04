// src/api/axios.js
import axios from "axios";

/**
 * Determine the base URL for the API.
 * - We must use import.meta.env.VITE_API_URL for Vite projects.
 * - It falls back to http://localhost:5000 for local development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export default api;