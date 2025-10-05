// import { render, screen, waitFor } from '@testing-library/react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import Booking from '../../src/components/Booking';
// import { useAuth } from '../../src/context/AuthContext';

// // Mock dependencies
// vi.mock('react-toastify');
// vi.mock('../../src/context/AuthContext');
// vi.mock('../../src/api/services/booking');
// vi.mock('../../src/api/services/usermanagement');
// vi.mock('../../src/api/services/servicemanagement');

// // Import mocked modules
// import * as bookingApi from '../../src/api/services/booking';
// import * as userApi from '../../src/api/services/usermanagement';
// import * as serviceApi from '../../src/api/services/servicemanagement';

// describe('Booking', () => {
//   const mockBookings = [
//     {
//       id: 1,
//       booking_date: '2023-10-10',
//       start_time: '2023-10-10T10:00:00',
//       end_time: '2023-10-10T11:00:00',
//       status: 'pending',
//       client_id: 1,
//       client_name: 'Test Client',
//       service_id: 1,
//       service_name: 'Test Service',
//     },
//   ];

//   const mockServices = [
//     { id: 1, title: 'Test Service', price: 100, currency: 'KES', duration: '1 hour' },
//   ];

//   const mockClients = [
//     { id: 1, full_name: 'Test Client', email: 'test@example.com' },
//   ];

//   beforeEach(() => {
//     vi.clearAllMocks();
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false });
//     bookingApi.getBookings.mockResolvedValue({ data: mockBookings });
//     serviceApi.getServices.mockResolvedValue(mockServices);
//     userApi.fetchUsers.mockResolvedValue(mockClients);
//   });

//   it('fetches and displays bookings for non-admin user', async () => {
//     render(<Booking />);

//     await waitFor(() => {
//       expect(bookingApi.getBookings).toHaveBeenCalled();
//     });

//     expect(screen.getByText('Bookings')).toBeInTheDocument();
//     expect(screen.getByText('+ New Booking')).toBeInTheDocument();
//   });

//   it('fetches and displays bookings for admin user', async () => {
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: true });
//     bookingApi.getBookings.mockResolvedValue({ data: mockBookings });

//     render(<Booking />);

//     await waitFor(() => {
//       expect(userApi.fetchUsers).toHaveBeenCalled();
//     });

//     expect(screen.getByText('Bookings')).toBeInTheDocument();
//   });

//   it('shows loading state initially', () => {
//     // Don't resolve the promise to keep loading state
//     bookingApi.getBookings.mockImplementation(() => new Promise(() => {}));

//     render(<Booking />);

//     expect(screen.getByText('Loading...')).toBeInTheDocument();
//   });

//   it('filters bookings for non-admin users', async () => {
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false });
    
//     render(<Booking />);

//     await waitFor(() => {
//       expect(bookingApi.getBookings).toHaveBeenCalled();
//     });

//     // Should show bookings section
//     expect(screen.getByText('Bookings')).toBeInTheDocument();
//   });

//   it('shows all bookings for admin users', async () => {
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: true });
    
//     render(<Booking />);

//     await waitFor(() => {
//       expect(bookingApi.getBookings).toHaveBeenCalled();
//     });

//     // Should show bookings section
//     expect(screen.getByText('Bookings')).toBeInTheDocument();
//   });

//   it('handles service fetch errors', async () => {
//     serviceApi.getServices.mockRejectedValue(new Error('Service fetch failed'));

//     render(<Booking />);

//     // Should still render the component even if services fail
//     await waitFor(() => {
//       expect(screen.getByText('Bookings')).toBeInTheDocument();
//     });
//   });
// });