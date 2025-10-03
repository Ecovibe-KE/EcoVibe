import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getBookings, 
  getBookingById, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} from '../../src/api/services/booking';
import { ENDPOINTS } from '../../src/api/endpoints';

// Create a proper mock for axios
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  },
}));

describe('Booking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBookings', () => {
    it('should fetch bookings successfully', async () => {
      const mockData = { 
        status: 'success', 
        data: [{ id: 1, client_name: 'Test User' }] 
      };
      mockGet.mockResolvedValue({ data: mockData });

      const result = await getBookings();

      expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.bookings);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching bookings', async () => {
      const mockError = new Error('Failed to fetch bookings');
      mockGet.mockRejectedValue(mockError);

      await expect(getBookings()).rejects.toThrow('Failed to fetch bookings');
    });
  });

  describe('getBookingById', () => {
    it('should fetch a booking by ID successfully', async () => {
      const mockData = { 
        status: 'success', 
        data: { id: 1, client_name: 'Test User' } 
      };
      mockGet.mockResolvedValue({ data: mockData });

      const result = await getBookingById(1);

      expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.bookingById(1));
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching a booking by ID', async () => {
      const mockError = new Error('Failed to fetch booking');
      mockGet.mockRejectedValue(mockError);

      await expect(getBookingById(1)).rejects.toThrow('Failed to fetch booking');
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = { 
        booking_date: '2024-01-01',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        service_id: 1
      };
      const mockData = { 
        status: 'success', 
        data: { id: 2, ...bookingData } 
      };
      mockPost.mockResolvedValue({ data: mockData });

      const result = await createBooking(bookingData);

      expect(mockPost).toHaveBeenCalledWith(ENDPOINTS.bookings, bookingData);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when creating a booking', async () => {
      const bookingData = { 
        booking_date: '2024-01-01',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        service_id: 1
      };
      const mockError = new Error('Failed to create booking');
      mockPost.mockRejectedValue(mockError);

      await expect(createBooking(bookingData)).rejects.toThrow('Failed to create booking');
    });
  });

  describe('updateBooking', () => {
    it('should update a booking successfully', async () => {
      const bookingData = { status: 'confirmed' };
      const mockData = { 
        status: 'success', 
        data: { id: 1, ...bookingData } 
      };
      mockPatch.mockResolvedValue({ data: mockData });

      const result = await updateBooking(1, bookingData);

      expect(mockPatch).toHaveBeenCalledWith(ENDPOINTS.bookingById(1), bookingData);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when updating a booking', async () => {
      const bookingData = { status: 'confirmed' };
      const mockError = new Error('Failed to update booking');
      mockPatch.mockRejectedValue(mockError);

      await expect(updateBooking(1, bookingData)).rejects.toThrow('Failed to update booking');
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      const mockData = { 
        status: 'success', 
        message: 'Booking deleted successfully' 
      };
      mockDelete.mockResolvedValue({ data: mockData });

      const result = await deleteBooking(1);

      expect(mockDelete).toHaveBeenCalledWith(ENDPOINTS.bookingById(1));
      expect(result).toEqual(mockData);
    });

    it('should handle errors when deleting a booking', async () => {
      const mockError = new Error('Failed to delete booking');
      mockDelete.mockRejectedValue(mockError);

      await expect(deleteBooking(1)).rejects.toThrow('Failed to delete booking');
    });
  });
});