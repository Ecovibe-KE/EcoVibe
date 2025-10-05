import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookingTable from '../../src/components/BookingTable';

describe('BookingTable', () => {
  const mockBookings = [
    {
      id: 1,
      booking_date: '2023-10-10',
      start_time: '2023-10-10T10:00:00',
      end_time: '2023-10-10T11:00:00',
      status: 'pending',
      client_name: 'Test Client',
      service_name: 'Test Service',
    },
  ];

  it('renders the booking table component with bookings for non-admin', () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        isAdmin={false}
      />
    );

    // Test for content that's actually visible for non-admin users
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Client name should NOT be visible for non-admin
    expect(screen.queryByText('Test Client')).not.toBeInTheDocument();
  });

  it('renders the booking table component with bookings for admin', () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        isAdmin={true}
      />
    );

    // For admin users, client name should be visible
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders empty state when no bookings', () => {
    render(
      <BookingTable
        bookings={[]}
        onView={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        isAdmin={false}
      />
    );

    // Should show the empty state message
    expect(screen.getByText(/no bookings available/i)).toBeInTheDocument();
  });

  it('formats date and time correctly', () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        isAdmin={false}
      />
    );

    // Check that the date is formatted (this will depend on your locale)
    // You might want to be more specific about the expected format
    const dateElement = screen.getByText(/10\/10\/2023/);
    expect(dateElement).toBeInTheDocument();
  });

  it('displays correct status badge with appropriate class', () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
        isAdmin={false}
      />
    );

    const statusBadge = screen.getByText('pending');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-warning');
  });
});