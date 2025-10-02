import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

/** Get all documents (optionally paginated) */
export const getDocuments = async (page = 1, limit = 10) => {
  const response = await api.get(ENDPOINTS.documents, { params: { page, limit } });
  return response; // return full axios response
};

/** Get a document by ID */
export const getDocumentById = async (id) => {
  const response = await api.get(`${ENDPOINTS.documents}/${id}`);
  return response;
};

/** Upload a new document */
export const uploadDocument = async (formData) => { 
  const response = await api.post(ENDPOINTS.documents, formData); 
  return response; 
};


/** Delete a document by ID */
export const deleteDocument = async (id) => {
  const response = await api.delete(`${ENDPOINTS.documents}/${id}`);
  return response;
};

/** Download a document (frontend utility) */
export const downloadDocument = async (fileUrl, filename) => {
  try {
    const response = await api.get(fileUrl, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "document");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download document:', error);
    throw error;
  }
};