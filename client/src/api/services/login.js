import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";


export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(ENDPOINTS.LOGIN, credentials);
    return response.data; // backend should return { user, token }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Network error. Please try again.");
  }
};