// Booking.jsx
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
import BookingDetails from "./BookingDetails";

const Booking = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [clients, setClients] = useState([]);

  const { user, isAtLeastAdmin } = useAuth();

  useEffect(() => {
    const loadClients = async () => {
      if (!isAtLeastAdmin) return;

      try {
        const allUsers = await fetchUsers();
        const activeClients = allUsers.filter(
          (u) => u.role.toUpperCase() === "CLIENT" && !u.is_deleted,
        );
        setClients(activeClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      }
    };

    loadClients();
  }, [isAtLeastAdmin]);

  // Fetch all services for the form
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getServices();
        console.log("Services data:", data.data);
        setServices(data.data || []);
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
        console.log("Bookings API response:", response);

        let filtered = response.data || response;

        if (!isAtLeastAdmin) {
          filtered = filtered.filter((b) => b.client_id === user.id);
        }

        setBookings(filtered);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAtLeastAdmin, user?.id]);

  // CREATE booking
  const handleAdd = async (formData) => {
    try {
      console.log("Creating booking with data:", formData);
      const res = await createBooking(formData);
      console.log("Booking creation response:", res);

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
      console.error("Error details:", err.response?.data);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unexpected error while creating booking",
      );
    }
  };

  // UPDATE booking
  const handleUpdate = async (id, formData) => {
    try {
      console.log("Updating booking:", id, formData);
      const response = await updateBooking(id, formData);
      setBookings((prev) => prev.map((b) => (b.id === id ? response.data : b)));
      setEditingBooking(null);
      toast.success("Booking updated successfully");
    } catch (error) {
      console.error("Update booking error:", error);
      toast.error(error?.response?.data?.message || "Failed to update booking");
    }
  };

  // DELETE booking
  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setBookingToDelete(null);
      toast.success("Booking deleted successfully");
    } catch (error) {
      console.error("Delete booking error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete booking");
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
              service_name: b.service_name || "Unknown Service",
              start_time: b.start_time,
            })
          }
          isAdmin={isAtLeastAdmin}
        />
      )}

      {/* CREATE FORM */}
      {showForm && (
        <BookingForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
          clients={clients}
          services={services}
          disableService={false}
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
        />
      )}

      {/* VIEW MODAL */}
      {selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {bookingToDelete && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBookingToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the booking for{" "}
                  <strong>{bookingToDelete.client_name}</strong> -{" "}
                  <strong>{bookingToDelete.service_name}</strong> on{" "}
                  <strong>
                    {bookingToDelete.start_time
                      ? new Date(bookingToDelete.start_time).toLocaleString()
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
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
