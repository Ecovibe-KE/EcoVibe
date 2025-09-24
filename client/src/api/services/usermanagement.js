import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetches and returns a plain array of users
export const fetchUsers = async () => {
  const response = await api.get(ENDPOINTS.users);
  return Array.isArray(response.data) ? response.data : [];
};

// Creates a new user
export const addUsers = async (userData) => {
  const response = await api.post(ENDPOINTS.users, userData);
  return response.data;
};

// Deletes a user by ID
export const deleteUsers = async (userId) => {
  const response = await api.delete(`${ENDPOINTS.users}/${userId}`);
  return response.data;
};

// Updates a user by ID
export const editUsers = async (userId, userData) => {
  const response = await api.patch(`${ENDPOINTS.users}/${userId}`, userData);
  return response.data;
};

// block a user by ID
export const blockUser = async (userId) => {
  const response = await api.patch(`${ENDPOINTS.users}/${userId}`, { status: 'Suspended' });
  return response.data;
};

// Activate a user by ID
export const activateUser = async (userId) => {
  const response = await api.patch(`${ENDPOINTS.users}/${userId}`, { status: 'Active' });
  return response.data;
};
