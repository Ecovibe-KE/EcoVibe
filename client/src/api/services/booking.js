import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Booking service
export const getBookings = async () => {
  const response = await api.get(ENDPOINTS.bookings);
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(ENDPOINTS.bookingById(id));
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post(ENDPOINTS.bookings, bookingData);
  return response.data;
};

export const updateBooking = async (id, bookingData) => {
  const response = await api.patch(ENDPOINTS.bookingById(id), bookingData);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await api.delete(ENDPOINTS.bookingById(id));
  return response.data;
};
