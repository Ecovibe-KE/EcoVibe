import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Ping service
export const getPing = async () => {
  const response = await api.get(ENDPOINTS.PING);
  return response.data;
};
