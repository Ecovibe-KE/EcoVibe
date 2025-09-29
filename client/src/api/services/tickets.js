// services/ticketService.js
import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Ticket service functions
export const getTickets = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);
  
  const url = queryParams.toString() ? `${ENDPOINTS.tickets}?${queryParams}` : ENDPOINTS.tickets;
  const response = await api.get(url);
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(ENDPOINTS.ticketById(id));
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post(ENDPOINTS.tickets, ticketData);
  return response.data;
};

export const updateTicket = async (id, updateData) => {
  const response = await api.put(ENDPOINTS.ticketById(id), updateData);
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await api.delete(ENDPOINTS.ticketById(id));
  return response.data;
};

export const getTicketStats = async () => {
  const response = await api.get(ENDPOINTS.ticketStats);
  return response.data;
};

export const addTicketMessage = async (id, messageData) => {
  const response = await api.post(ENDPOINTS.ticketMessages(id), messageData);
  return response.data;
};