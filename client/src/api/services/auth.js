import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";


const USE_MOCK = true; // flip to false when backend is ready

//  Login user
export const loginUser = async (credentials) => {
  if (USE_MOCK) {
    console.log("[MOCK] loginUser called with:", credentials);

    // Simulate API delay
    await new Promise((res) => setTimeout(res, 800));

    // Return fake response
    return {
      token: "dummy_token_123",
      user: {
        name: "Mock User",
        role: "Admin",
        avatar: "/profile.jpg",
        email: credentials.email,
      },
    };
  }

  //  Real API call (when backend is ready)
  const response = await api.post(ENDPOINTS.login, credentials);
  return response.data;
};

// Forgot password (send email for new password)
export const forgotPassword = async (newPassword) => {
  if (USE_MOCK) {
    console.log("[MOCK] forgotPassword called with:", newPassword);

    await new Promise((res) => setTimeout(res, 800));

    return {
      message: "Password has been reset successfully! Please log in with your new password.",
    };
  }

  // Real API call
  const response = await api.post(ENDPOINTS.forgotPassword, { password: newPassword });
  return response.data;
};

// Verify account
export const verifyAccount = async (token) => {
  const response = await api.post(
    ENDPOINTS.verify,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
