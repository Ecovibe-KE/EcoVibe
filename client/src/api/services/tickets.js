// api/services/tickets.js
import api from "../axiosConfig";
import { ENDPOINTS } from "../endpoints";

// Helper to build query strings safely
const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  return query.toString();
};

// -------------------- Ticket Services -------------------- //

// Fetch tickets with optional filters and pagination
export const getTickets = async (params = {}) => {
  try {
    const queryString = buildQuery(params);
    const url = queryString ? `${ENDPOINTS.tickets}?${queryString}` : ENDPOINTS.tickets;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tickets:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch single ticket by ID
export const getTicketById = async (id) => {
  if (!id) throw new Error("Ticket ID is required");
  try {
    const response = await api.get(ENDPOINTS.ticketById(id));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ticket ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Create a new ticket
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post(ENDPOINTS.tickets, ticketData);
    return response.data;
  } catch (error) {
    console.error("Failed to create ticket:", error.response?.data || error.message);
    throw error;
  }
};

// Update a ticket
export const updateTicket = async (id, updateData) => {
  if (!id) throw new Error("Ticket ID is required for update");
  try {
    const response = await api.put(ENDPOINTS.ticketById(id), updateData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update ticket ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a ticket
export const deleteTicket = async (id) => {
  if (!id) throw new Error("Ticket ID is required for deletion");
  try {
    const response = await api.delete(ENDPOINTS.ticketById(id));
    return response.data;
  } catch (error) {
    console.error(`Failed to delete ticket ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Get ticket statistics
export const getTicketStats = async () => {
  try {
    const response = await api.get(ENDPOINTS.ticketStats);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch ticket stats:", error.response?.data || error.message);
    throw error;
  }
};

// Add a message to a ticket
export const addTicketMessage = async (id, messageData) => {
  if (!id) throw new Error("Ticket ID is required to add message");
  try {
    const response = await api.post(ENDPOINTS.ticketMessages(id), messageData);
    return response.data;
  } catch (error) {
    console.error(`Failed to add message to ticket ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
