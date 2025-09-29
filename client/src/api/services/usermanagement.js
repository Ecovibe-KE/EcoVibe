import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetches users
export const fetchUsers = async () => {
  try {
    const response = await api.get(ENDPOINTS.userManagement);
    if (response.data && response.data.data && response.data.data.users) {
      console.log("Users found:", response.data.data.users);
      return response.data.data.users;
    } else {
      console.warn("Users array not found in expected location");
      return [];
    }
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// Creates a new user
export const addUsers = async (userData) => {
  const response = await api.post(ENDPOINTS.userManagement, userData);
  return response.data;
};

// Deletes a user by ID
export const deleteUsers = async (userId) => {
  const response = await api.delete(`${ENDPOINTS.userManagement}/${userId}`);
  return response.data;
};

// Updates a user by ID
export const editUsers = async (userId, userData) => {
  const response = await api.patch(
    `${ENDPOINTS.userManagement}/${userId}`,
    userData,
  );
  return response.data;
};

// block a user by ID
export const blockUser = async (userId) => {
  const response = await api.patch(
    `${ENDPOINTS.userManagement}/${userId}/status`,
    {
      status: "suspended",
    },
  );
  return response.data;
};

// Activate a user by ID
export const activateUser = async (userId) => {
  const response = await api.patch(
    `${ENDPOINTS.userManagement}/${userId}/status`,
    {
      status: "active",
    },
  );
  return response.data;
};
