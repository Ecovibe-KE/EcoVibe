// src/api/services/resourceCenter.js
import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// ----------------------------
// Get all documents
// ----------------------------
export const getDocuments = async (page = 1, pageSize = 10) => {
  try {
    const res = await api.get(ENDPOINTS.documents, {
      params: { page, page_size: pageSize },
    });
    return res.data.data; // unwrap {status, message, data}
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// ----------------------------
// Upload new document
// ----------------------------
export const uploadDocument = async (formData) => {
  try {
    const res = await api.post(ENDPOINTS.documents, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// ----------------------------
// Update existing document
// ----------------------------
export const updateDocument = async (id, formData) => {
  try {
    const res = await api.put(`${ENDPOINTS.documents}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }, // 👈 critical fix
    });
    return res.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// ----------------------------
// Delete document
// ----------------------------
export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`${ENDPOINTS.documents}/${id}`);
    return res.data; // returns {status, message, data: null}
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// ----------------------------
// Download document (blob)
// ----------------------------
export const downloadDocument = async (id) => {
  try {
    return await api.get(`${ENDPOINTS.documents}/${id}/download`, {
      responseType: "blob",
    });
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
