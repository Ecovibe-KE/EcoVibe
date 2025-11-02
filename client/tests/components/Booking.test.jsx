// Booking.test.jsx
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

// Mock child components - updated to remove unused variables
vi.mock("../../src/components/BookingTable", () => ({
  default: ({ bookings, onView, onUpdate, onDelete }) => (
    <div data-testid="booking-table">
      {bookings.map(booking => (
        <div key={booking.id} data-testid={`booking-${booking.id}`}>
          <span data-testid={`booking-name-${booking.id}`}>
            {booking.client_name} - {booking.service_name}
          </span>
          <button data-testid={`view-button-${booking.id}`} onClick={() => onView(booking)}>View</button>
          <button data-testid={`edit-button-${booking.id}`} onClick={() => onUpdate(booking)}>Edit</button>
          <button data-testid={`delete-button-${booking.id}`} onClick={() => onDelete(booking)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../src/components/BookingForm", () => ({
  default: ({ onSubmit, onClose }) => (
    <div data-testid="booking-form">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ client_id: 1, service_id: 1, start_time: new Date() });
      }}>
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  ),
}));

vi.mock("../../src/components/BookingDetails", () => ({
  default: ({ booking, onClose }) => (
    <div data-testid="booking-details">
      <h3 data-testid="booking-details-title">
        {booking.client_name} - {booking.service_name}
      </h3>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Booking component", () => {
  const mockUser = { id: 1, role: "client" };
  const mockAdminUser = { id: 1, role: "admin" };
  
  const mockBookings = [
    {
      id: 1,
      client_id: 1,
      client_name: "John Doe",
      service_name: "Web Development",
      start_time: "2024-01-15T10:00:00Z",
      status: "pending"
    },
    {
      id: 2,
      client_id: 2,
      client_name: "Jane Smith",
      service_name: "SEO Optimization",
      start_time: "2024-01-16T14:00:00Z",
      status: "confirmed"
    }
  ];

  const mockServices = [
    { id: 1, title: "Web Development", price: 1000, duration: "2 hr" },
    { id: 2, title: "SEO Optimization", price: 500, duration: "1 hr" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      isAtLeastAdmin: false 
    });

    // Mock API calls
    vi.spyOn(bookingService, "getBookings").mockResolvedValue({
      status: "success",
      data: mockBookings,
    });

    vi.spyOn(serviceService, "getServices").mockResolvedValue({
      status: "success",
      data: mockServices,
    });

    vi.spyOn(userService, "fetchUsers").mockResolvedValue([]);
  });

  it("renders loading initially", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays bookings after fetch for regular user", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    // Should only show user's own bookings
    expect(screen.getByTestId("booking-name-1")).toHaveTextContent("John Doe - Web Development");
  });

  it("displays all bookings for admin user", async () => {
    mockUseAuth.mockReturnValue({ 
      user: mockAdminUser, 
      isAtLeastAdmin: true 
    });

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    // Should show all bookings for admin
    expect(screen.getByTestId("booking-name-1")).toHaveTextContent("John Doe - Web Development");
    expect(screen.getByTestId("booking-name-2")).toHaveTextContent("Jane Smith - SEO Optimization");
  });

  it("opens booking form when New Booking button is clicked", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    const newBookingButton = screen.getByText("+ New Booking");
    fireEvent.click(newBookingButton);

    expect(screen.getByTestId("booking-form")).toBeInTheDocument();
  });

  it("opens booking details when view button is clicked", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    const viewButton = screen.getByTestId("view-button-1");
    fireEvent.click(viewButton);

    expect(screen.getByTestId("booking-details")).toBeInTheDocument();
    // Use the specific test ID for the details title to avoid duplicate text issues
    expect(screen.getByTestId("booking-details-title")).toHaveTextContent("John Doe - Web Development");
  });

  it("opens edit form when edit button is clicked", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    const editButton = screen.getByTestId("edit-button-1");
    fireEvent.click(editButton);

    expect(screen.getByTestId("booking-form")).toBeInTheDocument();
  });

  it("shows delete confirmation when delete button is clicked", async () => {
    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId("delete-button-1");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the booking for/)).toBeInTheDocument();
  });

  it("handles booking creation successfully", async () => {
    vi.spyOn(bookingService, "createBooking").mockResolvedValue({
      status: "success",
      data: { 
        id: 3, 
        client_name: "New Client", 
        service_name: "New Service",
        start_time: "2024-01-17T10:00:00Z"
      },
      message: "Booking created successfully"
    });

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    // Open form
    const newBookingButton = screen.getByText("+ New Booking");
    fireEvent.click(newBookingButton);

    // Submit form
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(bookingService.createBooking).toHaveBeenCalled();
    });
  });

  it("handles booking update successfully", async () => {
    vi.spyOn(bookingService, "updateBooking").mockResolvedValue({
      status: "success",
      data: { 
        id: 1, 
        client_name: "Updated Client", 
        service_name: "Updated Service",
        start_time: "2024-01-15T11:00:00Z"
      }
    });

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    // Open edit form
    const editButton = screen.getByTestId("edit-button-1");
    fireEvent.click(editButton);

    // Submit form
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(bookingService.updateBooking).toHaveBeenCalled();
    });
  });

  it("handles booking deletion successfully", async () => {
    vi.spyOn(bookingService, "deleteBooking").mockResolvedValue({});

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    // Open delete confirmation using specific test ID
    const deleteButton = screen.getByTestId("delete-button-1");
    fireEvent.click(deleteButton);

    // Confirm deletion - use the modal's delete button which has the class "btn-danger"
    const modalDeleteButtons = screen.getAllByText("Delete");
    const modalDeleteButton = modalDeleteButtons.find(button => 
      button.classList.contains("btn-danger")
    );
    
    expect(modalDeleteButton).toBeInTheDocument();
    fireEvent.click(modalDeleteButton);

    await waitFor(() => {
      expect(bookingService.deleteBooking).toHaveBeenCalled();
    });
  });

  it("handles API errors gracefully", async () => {
    vi.spyOn(bookingService, "getBookings").mockRejectedValue(new Error("API Error"));

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should not be loading anymore even with error
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("fetches clients only for admin users", async () => {
    mockUseAuth.mockReturnValue({ 
      user: mockAdminUser, 
      isAtLeastAdmin: true 
    });

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(userService.fetchUsers).toHaveBeenCalled();
    });
  });

  it("does not fetch clients for non-admin users", async () => {
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      isAtLeastAdmin: false 
    });

    render(
      <BrowserRouter>
        <Booking />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("booking-table")).toBeInTheDocument();
    });

    expect(userService.fetchUsers).not.toHaveBeenCalled();
  });
});