// import { render, screen } from '@testing-library/react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import BookingForm from '../../src/components/BookingForm';
// import { useAuth } from '../../src/context/AuthContext';

// // Mock dependencies
// vi.mock('../../src/context/AuthContext');

// describe('BookingForm', () => {
//   const mockOnSubmit = vi.fn();
//   const mockOnClose = vi.fn();
//   const mockClients = [
//     { id: 1, full_name: 'John Doe', email: 'john@example.com' },
//     { id: 2, full_name: 'Jane Smith', email: 'jane@example.com' },
//   ];
//   const mockServices = [
//     { id: 1, title: 'Service 1', price: 100, currency: 'KES', duration: '1 hour' },
//     { id: 2, title: 'Service 2', price: 200, currency: 'KES', duration: '2 hours' },
//   ];

//   beforeEach(() => {
//     vi.clearAllMocks();
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false });
//   });

//   it('renders the form with initial data for editing', () => {
//     const initialData = {
//       id: 1,
//       booking_date: '2023-10-10',
//       start_time: '2023-10-10T10:00',
//       end_time: '2023-10-10T11:00',
//       status: 'confirmed',
//       service_id: 1,
//       client_id: 1,
//     };

//     render(
//       <BookingForm
//         initialData={initialData}
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//       />
//     );

//     expect(screen.getByLabelText(/booking date/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
//   });

//   it('renders the form without initial data for creating', () => {
//     render(
//       <BookingForm
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//       />
//     );

//     expect(screen.getByLabelText(/booking date/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/service/i)).toBeInTheDocument();
//   });

//   it('shows client dropdown for admin', () => {
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: true });

//     render(
//       <BookingForm
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//         isAdmin={true}
//       />
//     );

//     expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
//   });

//   it('does not show client dropdown for non-admin', () => {
//     useAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false });

//     render(
//       <BookingForm
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//         isAdmin={false}
//       />
//     );

//     expect(screen.queryByLabelText(/client/i)).not.toBeInTheDocument();
//   });

//   it('renders all status options', () => {
//     render(
//       <BookingForm
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//       />
//     );

//     expect(screen.getByText('Pending')).toBeInTheDocument();
//     expect(screen.getByText('Confirmed')).toBeInTheDocument();
//     expect(screen.getByText('Completed')).toBeInTheDocument();
//     expect(screen.getByText('Cancelled')).toBeInTheDocument();
//   });

//   it('renders service dropdown', () => {
//     render(
//       <BookingForm
//         onSubmit={mockOnSubmit}
//         onClose={mockOnClose}
//         clients={mockClients}
//         services={mockServices}
//       />
//     );

//     const serviceSelect = screen.getByLabelText(/service/i);
//     expect(serviceSelect).toBeInTheDocument();
//     // Just test that the dropdown exists, don't test specific values
//   });
// });