// api/services/partnershipService.js
import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// -------------------- Partnership Service -------------------- //

// Fetch all published partnerships/funding opportunities
export const fetchAllPartnerships = async () => {
  try {
    const response = await api.get(ENDPOINTS.partnerships);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch partnerships:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Fetch a single partnership/funding opportunity by ID
export const fetchPartnershipById = async (id) => {
  if (!id) throw new Error("Partnership ID is required");
  try {
    const response = await api.get(ENDPOINTS.partnershipById(id));
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch partnership ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create a new partnership/funding opportunity
export const createPartnership = async (data) => {
  try {
    const response = await api.post(ENDPOINTS.partnerships, data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create partnership:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Update a partnership/funding opportunity
export const updatePartnership = async (id, data) => {
  if (!id) throw new Error("Partnership ID is required for update");
  try {
    const response = await api.put(ENDPOINTS.partnershipById(id), data);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update partnership ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Delete a partnership/funding opportunity
export const deletePartnership = async (id) => {
  if (!id) throw new Error("Partnership ID is required for deletion");
  try {
    const response = await api.delete(ENDPOINTS.partnershipById(id));
    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete partnership ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Update the status of a partnership/funding opportunity
export const updatePartnershipStatus = async (id, status) => {
  if (!id) throw new Error("Partnership ID is required for status update");
  try {
    const response = await api.patch(ENDPOINTS.partnershipStatus(id), {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Failed to update status for partnership ${id}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};