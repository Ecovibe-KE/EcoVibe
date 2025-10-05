/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "../api/services/auth";
import api from "../api/axiosConfig"; // so we can call /me after hydration

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ----------------------------
  // State
  // ----------------------------
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // ----------------------------
  // On mount → hydrate from localStorage
  // ----------------------------
  useEffect(() => {
    const hydrate = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("authToken");
        const savedRefresh = localStorage.getItem("refreshToken");

        if (savedToken && savedRefresh) {
          setToken(savedToken);
          setRefreshToken(savedRefresh);

          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // No cached user → fetch from /me
            try {
              const res = await api.get("/me");
              if (res.data?.status === "success") {
                setUser(res.data.data);
                localStorage.setItem("user", JSON.stringify(res.data.data));
              }
            } catch (err) {
              console.error("Hydration failed, clearing auth:", err);
              localStorage.removeItem("user");
              localStorage.removeItem("authToken");
              localStorage.removeItem("refreshToken");
              setUser(null);
              setToken(null);
              setRefreshToken(null);
            }
          }
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  // ----------------------------
  // 🟢 NEW: Sync token with localStorage (refresh-safe)
  // ----------------------------
  useEffect(() => {
    const syncToken = () => {
      const updatedToken = localStorage.getItem("authToken");
      if (updatedToken && updatedToken !== token) {
        setToken(updatedToken); // update state if interceptor refreshed it
      }
    };

    // listen for changes from other tabs
    window.addEventListener("storage", syncToken);

    // optional: also check every 2s in case interceptor updated silently
    const interval = setInterval(syncToken, 2000);

    return () => {
      window.removeEventListener("storage", syncToken);
      clearInterval(interval);
    };
  }, [token]);

  // ----------------------------
  // Login
  // ----------------------------
  const login = async (credentials) => {
    const {
      token: accessToken,
      refreshToken: newRefreshToken,
      user: loggedInUser,
    } = await loginUser(credentials);

    // Save in state
    setUser(loggedInUser);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);

    // Persist in localStorage
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    // Redirect based on account status
    if (loggedInUser.account_status === "inactive") {
      navigate("/verify");
    } else if (loggedInUser.account_status === "suspended") {
      navigate("/unauthorized");
    } else if (loggedInUser.account_status === "active") {
      navigate("/dashboard");
    } else {
      console.error("Unknown account_status:", loggedInUser.account_status);
      navigate("/unauthorized");
    }
  };

  // ----------------------------
  // Logout
  // ----------------------------
  const logout = async () => {
    try {
      if (refreshToken) {
        await logoutUser(refreshToken); // invalidate backend refresh token
      }
    } catch (err) {
      console.warn("Logout API failed:", err);
    }

    // Clear state + storage
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    navigate("/login");
  };

  // ----------------------------
  // Role helpers
  // ----------------------------
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isAtLeastAdmin = isAdmin || isSuperAdmin;

  // ----------------------------
  // Status helpers
  // ----------------------------
  const isActive = user?.account_status === "active";
  const isInactive = user?.account_status === "inactive";
  const isSuspended = user?.account_status === "suspended";

  // ----------------------------
  // Context value
  // ----------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isHydrating,
        login,
        logout,
        isClient,
        isAdmin,
        isSuperAdmin,
        isAtLeastAdmin,
        isActive,
        isInactive,
        isSuspended,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
