import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies FIRST, before any imports
vi.mock('../../../src/api/endpoints', () => ({
  ENDPOINTS: {
    bookings: '/bookings',
    bookingById: (id) => `/bookings/${id}`,
  }
}));

vi.mock('../../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

// Now import the module under test and the mocked dependencies
import { 
  getBookings, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} from '../../../src/api/services/booking';
import api from '../../../src/api/axiosConfig';
import { ENDPOINTS } from '../../../src/api/endpoints';

describe('Booking API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch bookings', async () => {
    // Mock the API response
    const mockBookings = [{ id: 1, booking_date: '2023-10-10' }];
    api.get.mockResolvedValueOnce({ data: mockBookings });

    const result = await getBookings();

    expect(api.get).toHaveBeenCalledWith(ENDPOINTS.bookings);
    expect(result).toEqual(mockBookings);
  });

  it('should create a booking', async () => {
    const bookingData = { 
      booking_date: '2023-10-10', 
      start_time: '10:00', 
      end_time: '11:00' 
    };
    const mockResponse = { id: 1, ...bookingData };
    api.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await createBooking(bookingData);

    expect(api.post).toHaveBeenCalledWith(ENDPOINTS.bookings, bookingData);
    expect(result).toEqual(mockResponse);
  });

  it('should update a booking', async () => {
    const bookingId = 1;
    const updateData = { status: 'confirmed' };
    const mockResponse = { id: bookingId, ...updateData };
    api.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await updateBooking(bookingId, updateData);

    expect(api.patch).toHaveBeenCalledWith(
      ENDPOINTS.bookingById(bookingId), 
      updateData
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete a booking', async () => {
    const bookingId = 1;
    const mockResponse = { message: 'Booking deleted' };
    api.delete.mockResolvedValueOnce({ data: mockResponse });

    const result = await deleteBooking(bookingId);

    expect(api.delete).toHaveBeenCalledWith(ENDPOINTS.bookingById(bookingId));
    expect(result).toEqual(mockResponse);
  });
});