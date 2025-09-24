import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Verify account
export const verifyAccount = async () => {
  const response = await api.post(ENDPOINTS.verify);
  return response.data;
};
