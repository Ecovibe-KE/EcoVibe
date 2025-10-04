import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// Fetch dashboard data
export const getDashboard = async (token) => {
  try {
    const response = await api.get(ENDPOINTS.dashboard,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
    )
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error.response?.data || error;
  }
};