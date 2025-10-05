// import { render, screen, fireEvent } from "@testing-library/react";
// import { describe, it, expect, vi, beforeEach } from "vitest";
// import BookingDetails from "../../src/components/BookingDetails";

// // Mock BookingModal and Button
// vi.mock("../../src/components/BookingModal", () => ({
//   default: ({ title, children, onClose }) => (
//     <div data-testid="booking-modal">
//       <h3>{title}</h3>
//       <div>{children}</div>
//       <button onClick={onClose}>Close Modal</button>
//     </div>
//   ),
// }));

// vi.mock("../../src/utils/Button", () => ({
//   default: ({ action, label, onClick }) => (
//     <button onClick={onClick} data-testid={`button-${action}`}>
//       {label}
//     </button>
//   ),
// }));

// describe("BookingDetails Component", () => {
//   const mockOnClose = vi.fn();

//   const mockBooking = {
//     id: 1,
//     client_name: "John Doe",
//     service_name: "Consultation",
//     booking_date: "2024-01-01",
//     start_time: "2024-01-01T10:00:00Z",
//     end_time: "2024-01-01T11:00:00Z",
//     status: "confirmed"
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it("renders booking details correctly", () => {
//     render(
//       <BookingDetails booking={mockBooking} onClose={mockOnClose} />
//     );

//     expect(screen.getByText("Booking Details")).toBeInTheDocument();
//     expect(screen.getByText("John Doe")).toBeInTheDocument();
//     expect(screen.getByText("Consultation")).toBeInTheDocument();
//     expect(screen.getByText("confirmed")).toBeInTheDocument();
//   });

//   it("calls onClose when close button is clicked", () => {
//     render(
//       <BookingDetails booking={mockBooking} onClose={mockOnClose} />
//     );

//     const closeButton = screen.getByTestId("button-cancel");
//     fireEvent.click(closeButton);

//     expect(mockOnClose).toHaveBeenCalled();
//   });

//   it("returns null when no booking is provided", () => {
//     const { container } = render(
//       <BookingDetails booking={null} onClose={mockOnClose} />
//     );

//     expect(container.firstChild).toBeNull();
//   });

//   it("handles missing time values gracefully", () => {
//     const bookingWithMissingTimes = {
//       ...mockBooking,
//       start_time: null,
//       end_time: null
//     };

//     render(
//       <BookingDetails booking={bookingWithMissingTimes} onClose={mockOnClose} />
//     );

//     expect(screen.getAllByText("—")).toHaveLength(2);
//   });

//   it("formats dates correctly", () => {
//     render(
//       <BookingDetails booking={mockBooking} onClose={mockOnClose} />
//     );

//     // Check that the date is displayed (format might vary by locale)
//     const dateElement = screen.getByText(/2024-01-01|1\/1\/2024/);
//     expect(dateElement).toBeInTheDocument();
//   });
// });