import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Booking from "../../src/components/Booking";
import * as bookingService from "../../src/api/services/booking";
import * as userService from "../../src/api/services/usermanagement";
import * as serviceService from "../../src/api/services/servicemanagement";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: { 
    error: vi.fn(),
    success: vi.fn()
  },
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock child components
vi.mock("../../src/components/BookingTable", () => ({
  default: ({ bookings, onView, onUpdate, onDelete }) => (
    <div data-testid="booking-table">
      {bookings.map(booking => (
        <div key={booking.id}>
          <span>{booking.client_name}</span>
          <button onClick={() => onView(booking)}>View</button>
          <button onClick={() => onUpdate(booking)}>Edit</button>
          <button onClick={() => onDelete(booking)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../src/components/BookingForm", () => ({
  default: ({ onSubmit, onClose, initialData }) => (
    <div data-testid="booking-form">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(initialData || {}); }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  ),
}));

vi.mock("../../src/components/BookingModal", () => ({
  default: ({ title, children, onClose }) => (
    <div data-testid="booking-modal">
      <h3>{title}</h3>
      <div>{children}</div>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("Booking Component", () => {
  const mockUser = {
    id: 1,
    full_name: "Test User",
    email: "test@example.com",
    role: "client"
  };

  const mockAdminUser = {
    id: 2,
    full_name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  };

  const mockServices = [
    { id: 1, name: "Consultation", description: "Test service" }
  ];

  const mockBookings = [
    {
      id: 1,
      client_id: 1,
      client_name: "Test User",
      service_id: 1,
      service_name: "Consultation",
      booking_date: "2024-01-01",
      start_time: "2024-01-01T10:00:00Z",
      end_time: "2024-01-01T11:00:00Z",
      status: "pending"
    }
  ];

  const mockClients = [
    { id: 1, name: "Client 1", role: "client" },
    { id: 2, name: "Client 2", role: "client" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAdmin: false
    });
  });

  it("renders loading initially", async () => {
    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: [],
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("displays bookings after successful fetch", async () => {
    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: mockBookings,
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue(mockServices);

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });
  });

  it("shows new booking form when button is clicked", async () => {
    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: mockBookings,
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue(mockServices);

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    const newBookingButton = screen.getByText("+ New Booking");
    fireEvent.click(newBookingButton);

    await waitFor(() => {
      expect(screen.getByTestId("booking-form")).toBeInTheDocument();
    });
  });

  it("fetches clients when user is admin", async () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      isAdmin: true
    });

    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: mockBookings,
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue(mockServices);
    vi.spyOn(userService, "fetchUsers").mockResolvedValue(mockClients);

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(userService.fetchUsers).toHaveBeenCalled();
    });
  });

  it("handles booking creation successfully", async () => {
    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: mockBookings,
    });

    vi.spyOn(bookingService, "createBooking").mockResolvedValue({
      status: "success",
      data: { id: 2, ...mockBookings[0] },
      message: "Booking created successfully"
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue(mockServices);

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    // Open form
    const newBookingButton = screen.getByText("+ New Booking");
    fireEvent.click(newBookingButton);

    // Submit form
    await waitFor(() => {
      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(bookingService.createBooking).toHaveBeenCalled();
    });
  });
});