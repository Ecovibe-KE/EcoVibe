import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetch all resources (with optional pagination)
export const getResources = async (page = 1, limit = 10) => {
  const response = await api.get(ENDPOINTS.resources, {
    params: { page, limit },
  });
  return response.data;
};

// Fetch a single resource by ID
export const getResourceById = async (id) => {
  const response = await api.get(`${ENDPOINTS.resources}/${id}`);
  return response.data;
};

// Create a new resource
export const createResource = async (data) => {
  const response = await api.post(ENDPOINTS.resources, data);
  return response.data;
};

// Update an existing resource
export const updateResource = async (id, data) => {
  const response = await api.patch(`${ENDPOINTS.resources}/${id}`, data);
  return response.data;
};

// Delete a resource
export const deleteResource = async (id) => {
  try {
    const response = await api.delete(`${ENDPOINTS.resources}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete resource", error);
    throw error;
  }
};
//for downloading a resource
export const downloadResource = (fileUrl, filename) => {
  try {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", filename || "resource");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed", error);
    throw error;
  }
};
