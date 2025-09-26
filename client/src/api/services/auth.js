import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Verify account
export const verifyAccount = async (token) => {
  const response = await api.post(
    ENDPOINTS.verify,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      skipAuth: true,
    },
  );
  return response.data;
};
