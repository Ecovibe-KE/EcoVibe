import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// ----------------------------
// Get documents (with pagination + filtering)
// ----------------------------
export const getDocuments = async (page = 1, per_page = 10, search = "", type = "") => {
  try {
    const response = await api.get(ENDPOINTS.documents, {
      params: {
        page,
        per_page,
        search,
        type,
      },
    });
    return response.data; 
    // { status, message, data: [...], pagination: {...} }
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch documents" };
  }
};

// ----------------------------
// Upload a new document
// ----------------------------
export const uploadDocument = async (formData) => {
  try {
    const response = await api.post(ENDPOINTS.documents, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload document" };
  }
};

// ----------------------------
// Update an existing document
// ----------------------------
export const updateDocument = async (id, formData) => {
  try {
    const response = await api.put(`${ENDPOINTS.documents}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update document" };
  }
};

// ----------------------------
// Delete a document
// ----------------------------
export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`${ENDPOINTS.documents}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete document" };
  }
};

// ----------------------------
// Download a document
// ----------------------------
export const downloadDocument = async (id) => {
  try {
    const response = await api.get(`${ENDPOINTS.documents}/${id}/download`, {
      responseType: "blob", // ✅ prevents corrupted files
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to download document" };
  }
};
