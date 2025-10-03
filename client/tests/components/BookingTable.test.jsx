import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BookingTable from "../../src/components/BookingTable";

// Mock Button component
vi.mock("../../src/utils/Button", () => ({
  default: ({ action, label, onClick }) => (
    <button onClick={onClick} data-testid={`button-${action}`}>
      {label}
    </button>
  ),
}));

describe("BookingTable Component", () => {
  const mockBookings = [
    {
      id: 1,
      client_name: "John Doe",
      service_name: "Consultation",
      booking_date: "2024-01-01",
      start_time: "2024-01-01T10:00:00Z",
      status: "pending"
    },
    {
      id: 2,
      client_name: "Jane Smith",
      service_name: "Training",
      booking_date: "2024-01-02",
      start_time: "2024-01-02T14:00:00Z",
      status: "confirmed"
    }
  ];

  const mockOnView = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders no bookings message when empty", () => {
    render(
      <BookingTable
        bookings={[]}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={false}
      />
    );

    expect(screen.getByText("No bookings available.")).toBeInTheDocument();
  });

  it("renders bookings table with correct data", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("shows client column for admin users", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("hides client column for non-admin users", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={false}
      />
    );

    expect(screen.queryByText("User")).not.toBeInTheDocument();
  });

  it("calls onView when view button is clicked", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    const viewButtons = screen.getAllByTestId("button-view");
    fireEvent.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("calls onUpdate when edit button is clicked", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    const editButtons = screen.getAllByTestId("button-edit");
    fireEvent.click(editButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    const deleteButtons = screen.getAllByTestId("button-delete");
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockBookings[0]);
  });

  it("displays correct status badges", () => {
    render(
      <BookingTable
        bookings={mockBookings}
        onView={mockOnView}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isAdmin={true}
      />
    );

    const pendingBadge = screen.getByText("pending");
    const confirmedBadge = screen.getByText("confirmed");

    expect(pendingBadge).toBeInTheDocument();
    expect(confirmedBadge).toBeInTheDocument();
  });
});