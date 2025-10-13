import api from "../axiosConfig.js";
import { ENDPOINTS } from "../endpoints.js";

export const sendQuoteRequest = async (contactData) => {
  const response = await api.post(ENDPOINTS.quote, contactData);
  return response.data;
};
