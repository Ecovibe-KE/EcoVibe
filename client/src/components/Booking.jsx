import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../api/services/booking";
import { fetchUsers } from "../api/services/usermanagement";
import { getServices } from "../api/services/servicemanagement";
import BookingTable from "./BookingTable";
import BookingForm from "./BookingForm";
import BookingModal from "./BookingModal";

const Booking = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [clients, setClients] = useState([]);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const loadClients = async () => {
      if (!isAdmin) return;

      try {
        const allUsers = await fetchUsers();
        const activeClients = allUsers.filter((u) => u.role === "client");
        setClients(activeClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      }
    };

    loadClients();
  }, [isAdmin]);

  // Fetch all services for the form
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getServices();
        setServices(data || []);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        toast.error("Failed to fetch services");
      }
    };
    loadServices();
  }, []);

  // Fetch all bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getBookings();

        let filtered = response.data;

        if (!isAdmin) {
          filtered = response.data.filter((b) => b.client_id === user.id);
        }

        setBookings(filtered);
      } catch {
        toast.error("Failed to fetch bookings");
        console.error("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, user.id]);

  // CREATE booking
  const handleAdd = async (formData) => {
    try {
      const res = await createBooking(formData);
      console.log("Booking response:", res);

      if (res.status === "success" && res.data) {
        setBookings((prev) => [...prev, res.data]);

        setShowForm(false);
        toast.success(res.message || "Booking created successfully");
      } else {
        toast.error(res.message || "Failed to create booking");
        console.error("Create booking failed:", res);
      }
    } catch (err) {
      console.error("Create booking error:", err);
      toast.error(err?.message || "Unexpected error while creating booking");
    }
  };

  // UPDATE booking
  const handleUpdate = async (id, formData) => {
    try {
      const response = await updateBooking(id, formData);
      setBookings((prev) => prev.map((b) => (b.id === id ? response.data : b)));
      setEditingBooking(null);
      toast.success("Booking updated successfully");
    } catch {
      toast.error("Failed to update booking");
      console.error("Error updating booking");
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Bookings</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
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
          isAdmin={isAdmin}
        />
      )}

      {/* CREATE FORM */}
      {showForm && (
        <BookingForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
          clients={clients}
          services={services}
          isAdmin={isAdmin}
        />
      )}

      {/* EDIT FORM */}
      {editingBooking && (
        <BookingForm
          initialData={editingBooking}
          onSubmit={(data) => handleUpdate(editingBooking.id, data)}
          onClose={() => setEditingBooking(null)}
          clients={clients}
          services={services}
          isAdmin={isAdmin}
        />
      )}

      {/* VIEW MODAL */}
      {selectedBooking && (
        <BookingModal
          title="Booking Details"
          onClose={() => setSelectedBooking(null)}
        >
          <p>
            <strong>Client:</strong> {selectedBooking.client_name}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {selectedBooking.booking_date
              ? new Date(selectedBooking.booking_date).toLocaleDateString()
              : "Unknown Date"}
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
            <strong>Service:</strong>{" "}
            {services.find((s) => s.id === selectedBooking.service_id)?.name ||
              "Unknown Service"}
          </p>
        </BookingModal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {bookingToDelete && (
        <BookingModal
          title="Confirm Deletion"
          onClose={() => setBookingToDelete(null)}
        >
          <p>
            Are you sure you want to delete the booking for{" "}
            <strong>{bookingToDelete.client_name}</strong> on{" "}
            <strong>
              {bookingToDelete.booking_date
                ? new Date(bookingToDelete.booking_date).toLocaleDateString()
                : "Unknown Date"}
            </strong>
            ?
          </p>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-secondary me-2"
              onClick={() => setBookingToDelete(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
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
