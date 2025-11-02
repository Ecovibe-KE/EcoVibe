// BookingTable.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BookingTable from "../../src/components/BookingTable";

// Mock the Button component as a simple button
vi.mock("../../src/utils/Button", () => ({
  default: ({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

// Mock CSS module using the suggested approach
vi.mock("../../src/css/Booking.module.css", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    bookingTable: "bookingTable",
    adminTable: "adminTable", 
    clientTable: "clientTable",
    uniformButton: "uniformButton",
  };
});

describe("BookingTable component", () => {
  const mockBookings = [
    {
      id: 1,
      client_name: "John Doe",
      service_name: "Web Development",
      booking_date: "2024-01-15",
      start_time: "2024-01-15T10:00:00Z",
      end_time: "2024-01-15T11:00:00Z",
      status: "pending",
    },
    {
      id: 2,
      client_name: "Jane Smith",
      service_name: "SEO Optimization",
      booking_date: "2024-01-16",
      start_time: "2024-01-16T14:00:00Z",
      end_time: "2024-01-16T15:30:00Z",
      status: "confirmed",
    },
  ];

  const mockHandlers = {
    onView: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders no bookings message when empty", () => {
    render(
      <BookingTable 
        bookings={[]} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/No bookings available./i)).toBeInTheDocument();
  });

  it("displays bookings for non-admin user", () => {
    render(
      <BookingTable 
        bookings={mockBookings} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    // Check service names are displayed
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.getByText("SEO Optimization")).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();

    // Check action buttons for non-admin (View and Delete only)
    expect(screen.getAllByText("View")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
    expect(screen.queryByText("Edit")).toBeNull();

    // Check client column is hidden for non-admin
    expect(screen.queryByText("John Doe")).toBeNull();
    expect(screen.queryByText("Jane Smith")).toBeNull();
  });

  it("displays bookings for admin user with client column", () => {
    render(
      <BookingTable 
        bookings={mockBookings} 
        isAdmin={true}
        {...mockHandlers}
      />
    );

    // Check client names are displayed for admin
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    // Check service names
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.getByText("SEO Optimization")).toBeInTheDocument();

    // Check action buttons for admin (View, Edit, Delete)
    expect(screen.getAllByText("View")).toHaveLength(2);
    expect(screen.getAllByText("Edit")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("calls onView when view button is clicked", () => {
    render(
      <BookingTable 
        bookings={[mockBookings[0]]} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    const viewButtons = screen.getAllByText("View");
    fireEvent.click(viewButtons[0]);

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("calls onUpdate when edit button is clicked (admin only)", () => {
    render(
      <BookingTable 
        bookings={[mockBookings[0]]} 
        isAdmin={true}
        {...mockHandlers}
      />
    );

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <BookingTable 
        bookings={[mockBookings[0]]} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("shows appointment time information", () => {
    render(
      <BookingTable 
        bookings={[mockBookings[0]]} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    // Check that start and end labels are present
    expect(screen.getByText(/Start:/)).toBeInTheDocument();
    expect(screen.getByText(/End:/)).toBeInTheDocument();
  });

  it("shows status badges", () => {
    render(
      <BookingTable 
        bookings={mockBookings} 
        isAdmin={false}
        {...mockHandlers}
      />
    );

    const pendingBadge = screen.getByText("pending");
    const confirmedBadge = screen.getByText("confirmed");

    // Check that badges exist and have text
    expect(pendingBadge).toBeInTheDocument();
    expect(confirmedBadge).toBeInTheDocument();
  });
});