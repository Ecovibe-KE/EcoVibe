/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "../api/services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ----------------------------
  // State
  // ----------------------------
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // ----------------------------
  // On mount → hydrate from localStorage
  // ----------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("authToken");
    const savedRefresh = localStorage.getItem("refreshToken");

    if (savedUser && savedToken && savedRefresh) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setRefreshToken(savedRefresh);
    }
  }, []);

  // ----------------------------
  // Login
  // ----------------------------
  const login = async (credentials) => {
    const {
      token: accessToken,
      refreshToken,
      user: loggedInUser,
    } = await loginUser(credentials);

    // Save in state
    setUser(loggedInUser);
    setToken(accessToken);
    setRefreshToken(refreshToken);

    // Persist in localStorage
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Redirect based on account status
    if (loggedInUser.account_status === "inactive") {
      navigate("/verify"); // needs verification
    } else if (loggedInUser.account_status === "suspended") {
      navigate("/unauthorized"); // blocked
    } else {
      navigate("/dashboard"); // active users only
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

    // Redirect to login
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
