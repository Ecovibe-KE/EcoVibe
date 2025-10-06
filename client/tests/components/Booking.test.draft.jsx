// client/tests/components/Booking.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import Booking from '../../src/components/Booking';
import { useAuth } from '../../src/context/AuthContext';
import { getBookings, createBooking, updateBooking, deleteBooking } from '../../src/api/services/booking';
import { fetchUsers } from '../../src/api/services/usermanagement';
import { getServices } from '../../src/api/services/servicemanagement';

// Mock dependencies
vi.mock('react-toastify');
vi.mock('../../src/context/AuthContext');
vi.mock('../../src/api/services/booking');
vi.mock('../../src/api/services/usermanagement');
vi.mock('../../src/api/services/servicemanagement');

// Mock child components with proper form data simulation
vi.mock('../../src/components/BookingTable', () => ({
    default: function MockBookingTable({ bookings, onView, onUpdate, onDelete }) {
        return (
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
        );
    }
}));

vi.mock('../../src/components/BookingForm', () => ({
    default: function MockBookingForm({ onSubmit, onClose, initialData }) {
        const { user, isAdmin } = useAuth();
        const isEditMode = Boolean(initialData && initialData.id);

        const [formData, setFormData] = React.useState(() => {
            if (isEditMode) {
                // In edit mode, only use the fields that can be edited
                return {
                    booking_date: initialData.booking_date || '',
                    start_time: initialData.start_time || '',
                    end_time: initialData.end_time || '',
                    status: initialData.status || 'pending',
                    service_id: initialData.service_id?.toString() || '',
                    client_id: initialData.client_id?.toString() || ''
                };
            } else {
                // In create mode, start with empty form but auto-set client_id for non-admin users
                const initialForm = {
                    booking_date: '',
                    start_time: '',
                    end_time: '',
                    status: 'pending',
                    service_id: '',
                    client_id: ''
                };

                // Auto-set client_id for non-admin users (like the actual component does)
                if (!isAdmin && user) {
                    initialForm.client_id = user.id.toString();
                }

                return initialForm;
            }
        });

        const handleSubmit = (e) => {
            e.preventDefault();

            // Prepare data for submission
            const submissionData = { ...formData };

            // Convert IDs to numbers if they exist
            if (submissionData.service_id) {
                submissionData.service_id = parseInt(submissionData.service_id, 10);
            }
            if (submissionData.client_id) {
                submissionData.client_id = parseInt(submissionData.client_id, 10);
            }

            // Remove empty fields
            Object.keys(submissionData).forEach(key => {
                if (submissionData[key] === '' || submissionData[key] === undefined) {
                    delete submissionData[key];
                }
            });

            onSubmit(submissionData);
        };

        return (
            <div data-testid="booking-form">
                <form onSubmit={handleSubmit}>
                    <input
                        data-testid="booking-date-input"
                        value={formData.booking_date}
                        onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                        placeholder="Booking Date"
                    />
                    <input
                        data-testid="start-time-input"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        placeholder="Start Time"
                    />
                    <input
                        data-testid="end-time-input"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        placeholder="End Time"
                    />
                    <input
                        data-testid="service-id-input"
                        value={formData.service_id}
                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                        placeholder="Service ID"
                    />
                    <input
                        data-testid="status-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        placeholder="Status"
                    />
                    {/* Only show client_id input for admin users */}
                    {isAdmin && (
                        <input
                            data-testid="client-id-input"
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            placeholder="Client ID"
                        />
                    )}
                    <button type="submit" data-testid="submit-booking-form">Submit</button>
                    <button type="button" onClick={onClose} data-testid="close-booking-form">Close</button>
                </form>
            </div>
        );
    }
}));

vi.mock('../../src/components/BookingModal', () => ({
    default: function MockBookingModal({ title, children, onClose }) {
        return (
            <div data-testid="booking-modal">
                <h3 data-testid="modal-title">{title}</h3>
                <div data-testid="modal-content">{children}</div>
                <button onClick={onClose} data-testid="close-modal">Close</button>
            </div>
        );
    }
}));

// ... rest of your test code remains exactly the same ...