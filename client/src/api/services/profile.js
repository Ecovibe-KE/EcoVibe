import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetch current user
export const getCurrentUser = async () => {
  const response = await api.get(ENDPOINTS.me);
  return response.data;
};

// Update user profile (only allowed fields)
export const updateUserProfile = async (data) => {
  const payload = {
    full_name: data.full_name,
    phone_number: data.phone_number,
    industry: data.industry,
    profile_image_url: data.profile_image_url,
  };

  const response = await api.put(ENDPOINTS.me, payload);
  return response.data;
};

// Change user password
export const changePassword = async (data) => {
  const payload = {
    current_password: data.current_password,
    new_password: data.new_password,
  };

  const response = await api.post(ENDPOINTS.changePassword, payload);
  return response.data;
};
