import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

export const subscribeNewsletter = async (email) => {
  const response = await api.post(ENDPOINTS.newsletter_subscribers, {
    email: email,
  });
  return response.data;
};
