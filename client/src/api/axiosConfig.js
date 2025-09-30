import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5555/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

// --------------------
// Request interceptor
// --------------------
api.interceptors.request.use(
  (config) => {
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

// --------------------
// Response interceptor
// --------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(
          `${api.defaults.baseURL}/refresh`,
          { refresh_token: refreshToken },
          { skipAuth: true },
        );

        const newAccessToken = res.data?.data?.access_token;
        if (!newAccessToken) throw new Error("Invalid refresh response");

        // Save token and retry request
        localStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Optional: clear tokens + redirect to login
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
      }
    }

    // Fallback global error handling
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
