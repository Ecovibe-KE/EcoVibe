// src/api/services/auth.js
import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// Small helper to normalize errors
const handleError = (error) => {
  throw error.response?.data || { message: error.message || "Unknown error" };
};

// ----------------------------
// Register a new user
// ----------------------------
export const createUser = async (clientData) => {
  try {
    const response = await api.post(ENDPOINTS.register, clientData, {
      skipAuth: true, // no token when signing up
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Login user
// ----------------------------
export const loginUser = async (credentials) => {
  try {
    const response = await api.post(ENDPOINTS.login, credentials, {
      skipAuth: true, // don’t attach old tokens
    });

    const { status, data, message } = response.data;

    if (status !== "success" || !data?.access_token || !data?.user) {
      throw new Error(message || "Invalid login response");
    }

    return {
      token: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    };
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Logout user
// ----------------------------
export const logoutUser = async (refreshToken) => {
  try {
    const response = await api.post(
      ENDPOINTS.logout,
      { refresh_token: refreshToken },
      { skipAuth: true }, // logout doesn't require access token
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Forgot Password
// ----------------------------
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(
      ENDPOINTS.forgotPassword,
      { email },
      { skipAuth: true },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Reset Password
// ----------------------------
export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await api.post(
      ENDPOINTS.resetPassword,
      { new_password: newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
        skipAuth: true, // supply reset token manually
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Verify account
// ----------------------------
export const verifyAccount = async (token) => {
  try {
    const response = await api.post(
      ENDPOINTS.verify,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        skipAuth: true,
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ----------------------------
// Resend verification email
// ----------------------------
export const resendVerification = async (email) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    const response = await api.post(
      ENDPOINTS.resendVerification,
      { email },
      { skipAuth: true },
    );

    return response.data; // ✅ only return data, no toast here
  } catch (error) {
    // Normalize error through handleError
    handleError(error);
  }
};

// ----------------------------
// Change Password
// ----------------------------
export const changePassword = async ({ current_password, new_password }) => {
  try {
    const response = await api.put(ENDPOINTS.changePassword, {
      current_password,
      new_password,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
