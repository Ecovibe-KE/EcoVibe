import Button from "../utils/Button";
import styles from "../css/Booking.module.css";

const BookingTable = ({ bookings, onView, onUpdate, onDelete, isAdmin }) => {
  if (bookings.length === 0) {
    return <p className="text-muted">No bookings available.</p>;
  }

  // Dynamic column width calculation based on user type
  const getColumnWidths = () => {
    if (isAdmin) {
      return {
        user: "15%",
        service: "25%",
        date: "20%",
        status: "15%",
        actions: "25%",
      };
    } else {
      return {
        service: "40%",
        date: "20%",
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
            {isAdmin && <th style={{ width: columnWidths.user }}>User</th>}
            <th style={{ width: columnWidths.service }}>Service</th>
            <th style={{ width: columnWidths.date }}>Date</th>
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
              <td style={{ width: columnWidths.date }}>
                {new Date(booking.booking_date).toLocaleDateString()}{" "}
                {booking.start_time
                  ? new Date(booking.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </td>
              <td style={{ width: columnWidths.status }}>
                <span
                  className={`badge ${
                    booking.status === "confirmed"
                      ? "bg-success"
                      : booking.status === "pending"
                        ? "bg-warning"
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
