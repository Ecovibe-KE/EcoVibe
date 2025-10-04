import Button from "../utils/Button";
import styles from "../css/Booking.module.css";

const BookingTable = ({ bookings, onView, onUpdate, onDelete, isAdmin }) => {
  if (bookings.length === 0) {
    return <p className="text-muted">No bookings available.</p>;
  }

  return (
    <div className="table-responsive">
      <table className={styles.bookingTable}>
        <thead>
          <tr>
            {isAdmin && <th>User</th>}
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            <th className="text-end pe-5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              {isAdmin && <td>{booking.client_name || "—"}</td>}
              <td>{booking.service_name || "—"}</td>
              <td>
                {new Date(booking.booking_date).toLocaleDateString()}{" "}
                {booking.start_time
                  ? new Date(booking.start_time).toLocaleTimeString()
                  : ""}
              </td>
              <td>
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
              <td className="d-flex gap-2 justify-content-end text-nowrap">
                <Button
                  action="view"
                  label="View"
                  size="sm"
                  onClick={() => onView(booking)}
                />
                <Button
                  action="update"
                  label="Edit"
                  size="sm"
                  onClick={() => onUpdate(booking)}
                />
                <Button
                  action="delete"
                  label="Delete"
                  size="sm"
                  onClick={() => onDelete(booking)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
