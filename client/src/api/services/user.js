import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Create a client
export const createUser = async (clientData) => {
  const response = await api.post(ENDPOINTS.register, clientData);
  return response.data;
};

