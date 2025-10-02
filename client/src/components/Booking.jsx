// src/components/Booking.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    getBookings,
    createBooking,
    updateBooking,
    deleteBooking,
} from "../api/services/booking";
import BookingTable from "./BookingTable";
import BookingForm from "./BookingForm";
import BookingModal from "./BookingModal";

const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedBooking, setSelectedBooking] = useState(null); // for viewing details
    const [showForm, setShowForm] = useState(false); // for creating
    const [editingBooking, setEditingBooking] = useState(null); // for editing
    const [bookingToDelete, setBookingToDelete] = useState(null); // for deletion confirmation

    // Fetch all bookings
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getBookings();
                setBookings(response.data);
            } catch {
                toast.error("Failed to fetch bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // CREATE booking
    const handleAdd = async (formData) => {
        try {
            const res = await createBooking(formData);

            if (res.status === "success" && res.data) {
                setBookings((prev) => [...prev, res.data]);

                setShowForm(false);
                toast.success(res.message || "Booking created successfully");
            } else {
                toast.error(res.message || "Failed to create booking");
            }
        } catch (err) {
            console.error("Create booking error:", err);
            toast.error(
                err?.message || "Unexpected error while creating booking"
            );
        }
    };

    // UPDATE booking
    const handleUpdate = async (id, formData) => {
        try {
            const response = await updateBooking(id, formData);
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? response.data : b))
            );
            setEditingBooking(null);
            toast.success("Booking updated successfully");
        } catch {
            toast.error("Failed to update booking");
        }
    };

    // DELETE booking
    const handleDelete = async (id) => {
        try {
            await deleteBooking(id);
            setBookings((prev) => prev.filter((b) => b.id !== id));
            toast.success("Booking deleted successfully");
        } catch {
            toast.error("Failed to delete booking");
        }
    };

    return (
        <div>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <h2>Bookings</h2>
                <button
                    className='btn btn-primary'
                    onClick={() => setShowForm(true)}
                >
                    + New Booking
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <BookingTable
                    bookings={bookings}
                    onView={(b) => setSelectedBooking(b)}
                    onUpdate={(b) => setEditingBooking(b)}
                    onDelete={(b) =>
                        setBookingToDelete({
                            id: b.id,
                            client_name: b.client_name || "Unknown Client",
                            booking_date: b.booking_date,
                        })
                    }
                />
            )}

            {/* CREATE FORM */}
            {showForm && (
                <BookingForm
                    onSubmit={handleAdd}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* EDIT FORM */}
            {editingBooking && (
                <BookingForm
                    initialData={editingBooking}
                    onSubmit={(data) => handleUpdate(editingBooking.id, data)}
                    onClose={() => setEditingBooking(null)}
                />
            )}

            {/* VIEW MODAL */}
            {selectedBooking && (
                <BookingModal
                    title='Booking Details'
                    onClose={() => setSelectedBooking(null)}
                >
                    <p>
                        <strong>Date:</strong> {selectedBooking.booking_date}
                    </p>
                    <p>
                        <strong>Start:</strong> {selectedBooking.start_time}
                    </p>
                    <p>
                        <strong>End:</strong> {selectedBooking.end_time}
                    </p>
                    <p>
                        <strong>Status:</strong> {selectedBooking.status}
                    </p>
                    <p>
                        <strong>Service ID:</strong>{" "}
                        {selectedBooking.service_id}
                    </p>
                </BookingModal>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {bookingToDelete && (
                <BookingModal
                    title='Confirm Deletion'
                    onClose={() => setBookingToDelete(null)}
                >
                    <p>
                        Are you sure you want to delete the booking for{" "}
                        <strong>{bookingToDelete.client_name}</strong> on{" "}
                        <strong>
                            {bookingToDelete.booking_date
                                ? new Date(
                                      bookingToDelete.booking_date
                                  ).toLocaleDateString()
                                : "Unknown Date"}
                        </strong>
                        ?
                    </p>
                    <div className='d-flex justify-content-end'>
                        <button
                            className='btn btn-secondary me-2'
                            onClick={() => setBookingToDelete(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className='btn btn-danger'
                            onClick={() => {
                                handleDelete(bookingToDelete.id);
                                setBookingToDelete(null);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </BookingModal>
            )}
        </div>
    );
};

export default Booking;
