import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetch current user
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.me);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (data) => {
  const response = await api.put(ENDPOINTS.me, data);
  return response.data;
};