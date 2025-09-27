import axios from "axios";
import { ENDPOINTS } from "../endpoints";

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data; // backend should return { message: "Check your email" }
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to reset password",
      );
    }
    throw new Error("Network error. Please try again.");
  }
};
