// BookingDetails.jsx
import BookingModal from "./BookingModal";
import Button from "../utils/Button";

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <BookingModal title="Booking Details" onClose={onClose}>
      <div className="booking-details">
        <div className="row mb-3">
          <div className="col-6">
            <strong>Client:</strong>
          </div>
          <div className="col-6">
            {booking.client_name || "—"}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Service:</strong>
          </div>
          <div className="col-6">
            {booking.service_name || "—"}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Booking Date:</strong>
          </div>
          <div className="col-6">
            {formatDate(booking.booking_date)}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Appointment Start:</strong>
          </div>
          <div className="col-6">
            {formatDateTime(booking.start_time)}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Appointment End:</strong>
          </div>
          <div className="col-6">
            {formatDateTime(booking.end_time)}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Duration:</strong>
          </div>
          <div className="col-6">
            {booking.service_duration || "—"}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Status:</strong>
          </div>
          <div className="col-6">
            <span className={`badge ${
              booking.status === "confirmed"
                ? "bg-success"
                : booking.status === "pending"
                ? "bg-warning"
                : booking.status === "completed"
                ? "bg-info"
                : booking.status === "cancelled"
                ? "bg-danger"
                : "bg-secondary"
            }`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-6">
            <strong>Created:</strong>
          </div>
          <div className="col-6">
            {formatDateTime(booking.created_at)}
          </div>
        </div>

        {booking.updated_at && (
          <div className="row mb-3">
            <div className="col-6">
              <strong>Last Updated:</strong>
            </div>
            <div className="col-6">
              {formatDateTime(booking.updated_at)}
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <Button action="cancel" label="Close" onClick={onClose} />
      </div>
    </BookingModal>
  );
};

export default BookingDetails;