import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Create a service
export const addService = async (serviceData) => {
    const response = await api.post(ENDPOINTS.services, serviceData);
    return response.data;
};

// Read/Fetch a service
export const getServices = async () => {
    const response = await api.get(ENDPOINTS.services);
    return response.data;
};

// Update a service by ID
export const updateService = async (serviceId, serviceData) => {
    const response = await api.patch(
        `${ENDPOINTS.services}/${serviceId}`,
        serviceData,
    );
    return response.data;
};

// Delete a service by ID
export const deleteService = async (serviceId) => {
    const response = await api.delete(`${ENDPOINTS.services}/${serviceId}`);
    return response.data;
};