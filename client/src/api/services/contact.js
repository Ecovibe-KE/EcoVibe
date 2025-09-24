import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

/**
 * Sends a contact message to the server.
 * @param {object} contactData - The contact form data.
 * @param {string} contactData.name - The user's name.
 * @param {string} contactData.industry - The user's industry.
 * @param {string} contactData.email - The user's email.
 * @param {string} contactData.phone - The user's phone number.
 * @param {string} contactData.message - The message content.
 * @returns {Promise<any>} The response data from the server.
 */
export const sendContactMessage = async (contactData) => {
  const response = await api.post(ENDPOINTS.contact, contactData);
  return response.data;
};
