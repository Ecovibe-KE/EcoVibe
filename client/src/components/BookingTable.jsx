// BookingTable.jsx
import Button from "../utils/Button";
import styles from "../css/Booking.module.css";

const BookingTable = ({ bookings, onView, onUpdate, onDelete, isAdmin }) => {
  if (bookings.length === 0) {
    return <p className="text-muted">No bookings available.</p>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Dynamic column width calculation based on user type
  const getColumnWidths = () => {
    if (isAdmin) {
      return {
        user: "14%",
        service: "18%",
        bookingDate: "12%",
        appointment: "18%",
        status: "16%",
        actions: "22%", // Increased for 3 buttons
      };
    } else {
      return {
        service: "25%",
        bookingDate: "15%",
        appointment: "20%",
        status: "15%",
        actions: "25%",
      };
    }
  };

  const columnWidths = getColumnWidths();

  return (
    <div className="table-responsive w-100">
      <table
        className={`table ${styles.bookingTable} ${isAdmin ? styles.adminTable : styles.clientTable}`}
      >
        <thead>
          <tr>
            {isAdmin && <th style={{ width: columnWidths.user }}>Client</th>}
            <th style={{ width: columnWidths.service }}>Service</th>
            <th style={{ width: columnWidths.bookingDate }}>Booking Date</th>
            <th style={{ width: columnWidths.appointment }}>
              Appointment Time
            </th>
            <th style={{ width: columnWidths.status }}>Status</th>
            <th style={{ width: columnWidths.actions }} className="text-end">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              {isAdmin && (
                <td style={{ width: columnWidths.user }}>
                  {booking.client_name || "—"}
                </td>
              )}
              <td style={{ width: columnWidths.service }}>
                {booking.service_name || "—"}
              </td>
              <td style={{ width: columnWidths.bookingDate }}>
                {formatDate(booking.booking_date)}
              </td>
              <td style={{ width: columnWidths.appointment }}>
                <div>
                  <strong>Start:</strong> {formatTime(booking.start_time)}
                </div>
                <div>
                  <strong>End:</strong> {formatTime(booking.end_time)}
                </div>
              </td>
              <td style={{ width: columnWidths.status }}>
                <span
                  className={`badge ${
                    booking.status === "confirmed"
                      ? "bg-success"
                      : booking.status === "pending"
                        ? "bg-warning"
                        : booking.status === "completed"
                          ? "bg-info"
                          : booking.status === "cancelled"
                            ? "bg-danger"
                            : "bg-secondary"
                  }`}
                >
                  {booking.status}
                </span>
              </td>
              <td style={{ width: columnWidths.actions }}>
                <div className="d-flex gap-1 justify-content-end text-nowrap">
                  <Button
                    action="view"
                    label="View"
                    size="sm"
                    className={styles.uniformButton}
                    onClick={() => onView(booking)}
                  />
                  {isAdmin && (
                    <Button
                      action="update"
                      label="Edit"
                      size="sm"
                      className={styles.uniformButton}
                      onClick={() => onUpdate(booking)}
                    />
                  )}
                  <Button
                    action="delete"
                    label="Delete"
                    size="sm"
                    className={styles.uniformButton}
                    onClick={() => onDelete(booking)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
