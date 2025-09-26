import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5555/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

// Request interceptor (e.g., add auth token)
api.interceptors.request.use(
  (config) => {
    // If skipAuth flag is set, don't touch Authorization
    if (!config.skipAuth) {
      const token =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(AUTH_TOKEN_KEY)
          : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor (e.g., handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — redirecting to login...");
      // Optionally: logout user or redirect
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
