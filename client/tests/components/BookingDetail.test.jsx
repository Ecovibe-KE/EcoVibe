// client/tests/components/BookingDetails.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingDetails from '../../src/components/BookingDetails';

// Mock dependencies
vi.mock('../../src/components/BookingModal', () => ({
    default: vi.fn(({ title, children, onClose }) => (
        <div data-testid="booking-modal">
            <h3 data-testid="modal-title">{title}</h3>
            <div data-testid="modal-content">{children}</div>
            <button onClick={onClose} data-testid="close-modal">
                Close
            </button>
        </div>
    ))
}));

vi.mock('../../src/utils/Button', () => ({
    default: vi.fn(({ action, label, onClick }) => (
        <button
            onClick={onClick}
            data-testid={`button-${action}`}
            data-action={action}
        >
            {label}
        </button>
    ))
}));

describe('BookingDetails Component', () => {
    const mockBooking = {
        id: 1,
        client_name: 'John Doe',
        service_name: 'Haircut',
        booking_date: '2024-01-15',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        status: 'confirmed'
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should return null when no booking is provided', () => {
            const { container } = render(<BookingDetails booking={null} onClose={mockOnClose} />);
            expect(container.firstChild).toBeNull();
        });

        it('should render booking modal with correct title when booking is provided', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent('Booking Details');
        });

        it('should display all booking details correctly', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            expect(screen.getByText('Client:')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();

            expect(screen.getByText('Service:')).toBeInTheDocument();
            expect(screen.getByText('Haircut')).toBeInTheDocument();

            expect(screen.getByText('Date:')).toBeInTheDocument();
            expect(screen.getByText('1/15/2024')).toBeInTheDocument(); // Default locale format

            expect(screen.getByText('Start:')).toBeInTheDocument();
            expect(screen.getByText('End:')).toBeInTheDocument();

            expect(screen.getByText('Status:')).toBeInTheDocument();
            expect(screen.getByText('confirmed')).toBeInTheDocument();
            expect(screen.getByText('confirmed')).toHaveClass('badge', 'bg-primary');
        });

        it('should format date and time correctly', () => {
            const bookingWithTimes = {
                ...mockBooking,
                booking_date: '2024-12-25',
                start_time: '2024-12-25T14:30:00Z',
                end_time: '2024-12-25T15:45:00Z'
            };

            render(<BookingDetails booking={bookingWithTimes} onClose={mockOnClose} />);

            // Check that date formatting works
            expect(screen.getByText('12/25/2024')).toBeInTheDocument();
        });

        it('should handle missing time values gracefully', () => {
            const bookingWithoutTimes = {
                ...mockBooking,
                start_time: null,
                end_time: null
            };

            render(<BookingDetails booking={bookingWithoutTimes} onClose={mockOnClose} />);

            expect(screen.getAllByText('—')).toHaveLength(2); // Both start and end times show em dash
        });

        it('should render close button', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            const closeButton = screen.getByTestId('button-cancel');
            expect(closeButton).toBeInTheDocument();
            expect(closeButton).toHaveTextContent('Close');
        });
    });

    describe('Interactions', () => {
        it('should call onClose when close button is clicked', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            const closeButton = screen.getByTestId('button-cancel');
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when modal close button is clicked', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            const modalCloseButton = screen.getByTestId('close-modal');
            fireEvent.click(modalCloseButton);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle booking with undefined properties', () => {
            const incompleteBooking = {
                id: 1,
                client_name: undefined,
                service_name: undefined,
                booking_date: undefined,
                start_time: undefined,
                end_time: undefined,
                status: undefined
            };

            render(<BookingDetails booking={incompleteBooking} onClose={mockOnClose} />);

            // Should still render without crashing
            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
            expect(screen.getByText('Client:')).toBeInTheDocument();
            expect(screen.getByText('Service:')).toBeInTheDocument();
            expect(screen.getByText('Date:')).toBeInTheDocument();
            expect(screen.getByText('Start:')).toBeInTheDocument();
            expect(screen.getByText('End:')).toBeInTheDocument();
            expect(screen.getByText('Status:')).toBeInTheDocument();
        });

        it('should handle invalid date strings gracefully', () => {
            const bookingWithInvalidDate = {
                ...mockBooking,
                booking_date: 'invalid-date',
                start_time: 'invalid-time'
            };

            render(<BookingDetails booking={bookingWithInvalidDate} onClose={mockOnClose} />);

            // Should not crash and should handle invalid dates
            expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
        });

        it('should render with different status values', () => {
            const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

            statuses.forEach(status => {
                const bookingWithStatus = { ...mockBooking, status };
                const { unmount } = render(
                    <BookingDetails booking={bookingWithStatus} onClose={mockOnClose} />
                );

                expect(screen.getByText(status)).toBeInTheDocument();
                expect(screen.getByText(status)).toHaveClass('badge', 'bg-primary');

                unmount();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper button labels and actions', () => {
            render(<BookingDetails booking={mockBooking} onClose={mockOnClose} />);

            const closeButton = screen.getByTestId('button-cancel');
            expect(closeButton).toHaveAttribute('data-action', 'cancel');
            expect(closeButton).toHaveTextContent('Close');
        });
    });
});