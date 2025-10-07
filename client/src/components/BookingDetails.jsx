import BookingModal from "./BookingModal";
import Button from "../utils/Button";

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <BookingModal title="Booking Details" onClose={onClose}>
      <p>
        <strong>Client:</strong> {booking.client_name}
      </p>
      <p>
        <strong>Service:</strong> {booking.service_name}
      </p>
      <p>
        <strong>Booking Date:</strong>{" "}
        {booking.created_at
          ? new Date(booking.created_at).toLocaleDateString()
          : "—"}
      </p>
      <p>
        <strong>Appointment Date and Time:</strong>{" "}
        {booking.start_time
          ? new Date(booking.start_time).toLocaleString()
          : "—"}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        <span className="badge bg-primary">{booking.status}</span>
      </p>

      <div className="d-flex justify-content-end">
        <Button action="cancel" label="Close" onClick={onClose} />
      </div>
    </BookingModal>
  );
};

export default BookingDetails;