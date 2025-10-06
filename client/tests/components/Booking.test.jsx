// client/tests/components/Booking.test.jsx
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import Booking from '../../src/components/Booking';

// Use vi.hoisted to create mocks that are hoisted properly
const {
    mockUseAuth,
    mockGetBookings,
    mockCreateBooking,
    mockUpdateBooking,
    mockDeleteBooking,
    mockFetchUsers,
    mockGetServices,
    mockBookingTable,
    mockBookingForm,
    mockBookingModal
} = vi.hoisted(() => ({
    mockUseAuth: vi.fn(),
    mockGetBookings: vi.fn(),
    mockCreateBooking: vi.fn(),
    mockUpdateBooking: vi.fn(),
    mockDeleteBooking: vi.fn(),
    mockFetchUsers: vi.fn(),
    mockGetServices: vi.fn(),
    mockBookingTable: vi.fn(({ bookings, onView, onUpdate, onDelete }) => (
        <div data-testid="booking-table">
            {bookings.map(booking => (
                <div key={booking.id} data-testid={`booking-${booking.id}`}>
                    <span data-testid={`booking-client-${booking.id}`}>{booking.client_name}</span>
                    <button onClick={() => onView(booking)} data-testid={`view-booking-${booking.id}`}>
                        View
                    </button>
                    <button onClick={() => onUpdate(booking)} data-testid={`edit-booking-${booking.id}`}>
                        Edit
                    </button>
                    <button onClick={() => onDelete(booking)} data-testid={`delete-booking-${booking.id}`}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )),
    mockBookingForm: vi.fn(({ onSubmit, onClose, initialData }) => (
        <div data-testid="booking-form">
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit(initialData || { service_id: 1 });
            }}>
                <button type="submit" data-testid="submit-booking-form">Submit</button>
                <button type="button" onClick={onClose} data-testid="close-booking-form">Close</button>
            </form>
        </div>
    )),
    mockBookingModal: vi.fn(({ title, children, onClose }) => (
        <div data-testid="booking-modal">
            <h3 data-testid="modal-title">{title}</h3>
            <div data-testid="modal-content">{children}</div>
            <button onClick={onClose} data-testid="close-modal">Close</button>
        </div>
    ))
}));

// Mock dependencies using the hoisted mocks
vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn()
    }
}));

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: mockUseAuth
}));

vi.mock('../../src/api/services/booking', () => ({
    getBookings: mockGetBookings,
    createBooking: mockCreateBooking,
    updateBooking: mockUpdateBooking,
    deleteBooking: mockDeleteBooking
}));

vi.mock('../../src/api/services/usermanagement', () => ({
    fetchUsers: mockFetchUsers
}));

vi.mock('../../src/api/services/servicemanagement', () => ({
    getServices: mockGetServices
}));

vi.mock('../../src/components/BookingTable', () => ({
    default: mockBookingTable
}));

vi.mock('../../src/components/BookingForm', () => ({
    default: mockBookingForm
}));

vi.mock('../../src/components/BookingModal', () => ({
    default: mockBookingModal
}));

describe('Booking Component', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
    };

    const mockServices = [
        { id: 1, title: 'Haircut', price: 30, currency: 'USD' },
        { id: 2, title: 'Massage', price: 50, currency: 'USD' }
    ];

    const mockBookings = [
        {
            id: 1,
            client_id: 1,
            client_name: 'Test User',
            service_id: 1,
            service_name: 'Haircut',
            booking_date: '2024-01-15',
            start_time: '2024-01-15T10:00:00Z',
            end_time: '2024-01-15T11:00:00Z',
            status: 'pending'
        },
        {
            id: 2,
            client_id: 2,
            client_name: 'Other User',
            service_id: 2,
            service_name: 'Massage',
            booking_date: '2024-01-16',
            start_time: '2024-01-16T14:00:00Z',
            end_time: '2024-01-16T15:00:00Z',
            status: 'confirmed'
        }
    ];

    const mockClients = [
        { id: 1, name: 'Test User', email: 'test@example.com', role: 'CLIENT' },
        { id: 2, name: 'Other Client', email: 'client@example.com', role: 'CLIENT' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseAuth.mockReturnValue({
            user: mockUser,
            isAdmin: false
        });

        mockGetServices.mockResolvedValue({ data: mockServices });
        mockGetBookings.mockResolvedValue({ data: mockBookings });
        mockFetchUsers.mockResolvedValue(mockClients);
    });

    describe('Initial Rendering and Data Fetching', () => {
        it('should render loading state initially', async () => {
            mockGetBookings.mockImplementation(() => new Promise(() => { })); // Never resolves

            render(<Booking />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should fetch and display bookings for non-admin user', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(mockGetBookings).toHaveBeenCalledTimes(1);
            });

            expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            expect(screen.getByTestId('booking-1')).toBeInTheDocument();
        });

        it('should fetch and display all bookings for admin user', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isAdmin: true
            });

            render(<Booking />);

            await waitFor(() => {
                expect(mockGetBookings).toHaveBeenCalledTimes(1);
                expect(mockFetchUsers).toHaveBeenCalledTimes(1);
            });

            expect(screen.getByTestId('booking-table')).toBeInTheDocument();
        });

        it('should handle booking fetch error', async () => {
            mockGetBookings.mockRejectedValue(new Error('Failed to fetch'));

            render(<Booking />);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to fetch bookings');
            });
        });

        it('should handle services fetch error', async () => {
            mockGetServices.mockRejectedValue(new Error('Failed to fetch'));

            render(<Booking />);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to fetch services');
            });
        });

        it('should handle clients fetch error for admin', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isAdmin: true
            });
            mockFetchUsers.mockRejectedValue(new Error('Failed to fetch'));

            render(<Booking />);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to load clients');
            });
        });
    });

    describe('Booking Creation', () => {
        it('should open booking form when "New Booking" button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            const newBookingButton = screen.getByText('+ New Booking');
            fireEvent.click(newBookingButton);

            expect(screen.getByTestId('booking-form')).toBeInTheDocument();
        });

        it('should create a new booking successfully', async () => {
            const newBookingData = {
                id: 3,
                client_name: 'Test User',
                service_name: 'Haircut'
            };

            mockCreateBooking.mockResolvedValue({
                status: 'success',
                data: newBookingData,
                message: 'Booking created successfully'
            });

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open form
            fireEvent.click(screen.getByText('+ New Booking'));

            // Submit form
            fireEvent.click(screen.getByTestId('submit-booking-form'));

            await waitFor(() => {
                expect(mockCreateBooking).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalledWith('Booking created successfully');
            });
        });

        it('should handle booking creation error', async () => {
            mockCreateBooking.mockRejectedValue({
                response: { data: { message: 'Creation failed' } }
            });

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open form and submit
            fireEvent.click(screen.getByText('+ New Booking'));
            fireEvent.click(screen.getByTestId('submit-booking-form'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Creation failed');
            });
        });
    });

    describe('Booking Updates', () => {
        it('should open edit form when edit button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            const editButton = screen.getByTestId('edit-booking-1');
            fireEvent.click(editButton);

            expect(screen.getByTestId('booking-form')).toBeInTheDocument();
        });

        it('should update booking successfully', async () => {
            const updatedBooking = {
                ...mockBookings[0],
                status: 'confirmed'
            };

            mockUpdateBooking.mockResolvedValue({
                data: updatedBooking
            });

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open edit form
            fireEvent.click(screen.getByTestId('edit-booking-1'));

            // Submit form
            fireEvent.click(screen.getByTestId('submit-booking-form'));

            await waitFor(() => {
                expect(mockUpdateBooking).toHaveBeenCalledWith(1, expect.any(Object));
                expect(toast.success).toHaveBeenCalledWith('Booking updated successfully');
            });
        });

        it('should handle booking update error', async () => {
            mockUpdateBooking.mockRejectedValue({
                response: { data: { message: 'Update failed' } }
            });

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open edit form and submit
            fireEvent.click(screen.getByTestId('edit-booking-1'));
            fireEvent.click(screen.getByTestId('submit-booking-form'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Update failed');
            });
        });
    });

    describe('Booking Deletion', () => {
        it('should open delete confirmation modal when delete button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            const deleteButton = screen.getByTestId('delete-booking-1');
            fireEvent.click(deleteButton);

            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent('Confirm Deletion');
        });

        it('should delete booking successfully', async () => {
            mockDeleteBooking.mockResolvedValue({});

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open delete confirmation
            fireEvent.click(screen.getByTestId('delete-booking-1'));

            // Find and click delete button in modal
            const modal = screen.getByTestId('booking-modal');
            const deleteButton = within(modal).getByText('Delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockDeleteBooking).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Booking deleted successfully');
            });
        });

        it('should handle booking deletion error', async () => {
            mockDeleteBooking.mockRejectedValue({
                response: { data: { message: 'Deletion failed' } }
            });

            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open delete confirmation and confirm
            fireEvent.click(screen.getByTestId('delete-booking-1'));
            const modal = screen.getByTestId('booking-modal');
            const deleteButton = within(modal).getByText('Delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Deletion failed');
            });
        });

        it('should cancel deletion when cancel button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open delete confirmation
            fireEvent.click(screen.getByTestId('delete-booking-1'));
            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();

            // Click cancel
            const modal = screen.getByTestId('booking-modal');
            const cancelButton = within(modal).getByText('Cancel');
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument();
            expect(mockDeleteBooking).not.toHaveBeenCalled();
        });
    });

    describe('Booking Viewing', () => {
        it('should open view modal when view button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            const viewButton = screen.getByTestId('view-booking-1');
            fireEvent.click(viewButton);

            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent('Booking Details');
        });
    });

    describe('User Role-based Behavior', () => {
        it('should filter bookings for non-admin users', async () => {
            mockUseAuth.mockReturnValue({
                user: { id: 1, name: 'Test User' },
                isAdmin: false
            });

            render(<Booking />);

            await waitFor(() => {
                expect(mockGetBookings).toHaveBeenCalledTimes(1);
            });

            // Should only show bookings for current user (id: 1)
            expect(screen.getByTestId('booking-1')).toBeInTheDocument();
        });

        it('should show all bookings for admin users', async () => {
            mockUseAuth.mockReturnValue({
                user: mockUser,
                isAdmin: true
            });

            render(<Booking />);

            await waitFor(() => {
                expect(mockGetBookings).toHaveBeenCalledTimes(1);
            });

            // Should show all bookings
            expect(screen.getByTestId('booking-1')).toBeInTheDocument();
            expect(screen.getByTestId('booking-2')).toBeInTheDocument();
        });
    });

    describe('Form Management', () => {
        it('should close create form when close button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open form
            fireEvent.click(screen.getByText('+ New Booking'));
            expect(screen.getByTestId('booking-form')).toBeInTheDocument();

            // Close form
            fireEvent.click(screen.getByTestId('close-booking-form'));
            expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument();
        });

        it('should close edit form when close button is clicked', async () => {
            render(<Booking />);

            await waitFor(() => {
                expect(screen.getByTestId('booking-table')).toBeInTheDocument();
            });

            // Open edit form
            fireEvent.click(screen.getByTestId('edit-booking-1'));
            expect(screen.getByTestId('booking-form')).toBeInTheDocument();

            // Close form
            fireEvent.click(screen.getByTestId('close-booking-form'));
            expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument();
        });
    });
});