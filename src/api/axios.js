// src/api/axios.js
import axios from "axios";

/**
 * Determine the base URL for the API.
 * - In a production (live) environment, it uses the NEXT_PUBLIC_API_URL variable.
 * - In a local (development) environment, it falls back to http://localhost:5000.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Note: We add the /api path here
});

export default api;