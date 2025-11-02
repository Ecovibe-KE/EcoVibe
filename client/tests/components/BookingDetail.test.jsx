import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from 'vitest';
import BookingDetails from "../../src/components/BookingDetails";

// Mock child components
vi.mock("../../src/components/BookingModal", () => ({
  default: ({ title, onClose, children }) => (
    <div data-testid="booking-modal">
      <h2>{title}</h2>
      {children}
      <button onClick={onClose} data-testid="button-close">
        Close Modal
      </button>
    </div>
  )
}));

// Fixed Button mock - handle undefined label safely
vi.mock("../../src/utils/Button", () => ({
  default: ({ label, onClick, variant }) => (
    <button 
      onClick={onClick} 
      data-testid={`button-${(label || 'default').toLowerCase()}`}
      className={variant ? `btn-${variant}` : ''}
    >
      {label || 'Button'}
    </button>
  )
}));

describe("BookingDetails", () => {
  const mockOnClose = vi.fn();
  
  const baseBooking = {
    client_name: "John Doe",
    service_name: "Web Development",
    booking_date: "2024-01-15",
    start_time: "2024-01-15T10:00:00Z",
    end_time: "2024-01-15T12:00:00Z",
    service_duration: "2 hours",
    status: "confirmed",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-12T14:30:00Z"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when booking is not provided", () => {
    const { container } = render(<BookingDetails booking={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders booking modal with correct title", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    expect(screen.getByText("Booking Details")).toBeInTheDocument();
    expect(screen.getByTestId("booking-modal")).toBeInTheDocument();
  });

  it("renders all booking details correctly", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    // Check all static labels
    expect(screen.getByText("Client:")).toBeInTheDocument();
    expect(screen.getByText("Service:")).toBeInTheDocument();
    expect(screen.getByText("Booking Date:")).toBeInTheDocument();
    expect(screen.getByText("Appointment Start:")).toBeInTheDocument();
    expect(screen.getByText("Appointment End:")).toBeInTheDocument();
    expect(screen.getByText("Duration:")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Created:")).toBeInTheDocument();
    expect(screen.getByText("Last Updated:")).toBeInTheDocument();
    
    // Check all dynamic values
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.getByText("2 hours")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    // Get the specific date elements by their context
    const bookingDateElement = screen.getByText("Booking Date:").parentElement?.nextElementSibling;
    const startTimeElement = screen.getByText("Appointment Start:").parentElement?.nextElementSibling;
    const createdDateElement = screen.getByText("Created:").parentElement?.nextElementSibling;
    
    // Check that these elements contain formatted dates (not empty and not the fallback "—")
    expect(bookingDateElement?.textContent).not.toBe("—");
    expect(bookingDateElement?.textContent).toBeTruthy();
    
    expect(startTimeElement?.textContent).not.toBe("—");
    expect(startTimeElement?.textContent).toBeTruthy();
    
    expect(createdDateElement?.textContent).not.toBe("—");
    expect(createdDateElement?.textContent).toBeTruthy();
  });

  it("formats dates differently from raw input", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    // The formatted dates should not contain the raw ISO strings
    const allText = document.body.textContent || "";
    
    // Check that raw ISO dates are not displayed
    expect(allText).not.toContain("2024-01-15T10:00:00Z");
    expect(allText).not.toContain("2024-01-15T12:00:00Z");
    expect(allText).not.toContain("2024-01-10T09:00:00Z");
    
    // Check that human-readable date elements are present
    expect(screen.getByText("Booking Date:")).toBeInTheDocument();
    expect(screen.getByText("Appointment Start:")).toBeInTheDocument();
    expect(screen.getByText("Created:")).toBeInTheDocument();
  });

  it("applies correct badge class for confirmed status", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    const statusBadge = screen.getByText("confirmed");
    expect(statusBadge).toHaveClass("bg-success");
  });

  it("applies correct badge classes for different statuses", () => {
    const statusTestCases = [
      { status: "pending", expectedClass: "bg-warning" },
      { status: "completed", expectedClass: "bg-info" },
      { status: "cancelled", expectedClass: "bg-danger" },
      { status: "unknown", expectedClass: "bg-secondary" }
    ];

    statusTestCases.forEach(({ status, expectedClass }) => {
      const booking = { ...baseBooking, status };
      const { unmount } = render(<BookingDetails booking={booking} onClose={mockOnClose} />);
      
      const statusBadge = screen.getByText(status);
      expect(statusBadge).toHaveClass(expectedClass);
      unmount();
    });
  });

  it("handles missing optional fields gracefully", () => {
    const minimalBooking = {
      client_name: "Jane Smith",
      service_name: "SEO Service",
      booking_date: "2024-01-16",
      start_time: "2024-01-16T14:00:00Z",
      end_time: "2024-01-16T15:00:00Z",
      status: "pending",
      created_at: "2024-01-14T10:00:00Z"
      // Note: updated_at is missing
    };

    render(<BookingDetails booking={minimalBooking} onClose={mockOnClose} />);
    
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("SEO Service")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    
    // Should not show "Last Updated" section when updated_at is missing
    expect(screen.queryByText("Last Updated:")).not.toBeInTheDocument();
  });

  it("shows dash for missing values", () => {
    const incompleteBooking = {
      client_name: null,
      service_name: undefined,
      booking_date: "",
      start_time: null,
      status: "pending",
      created_at: "2024-01-14T10:00:00Z"
    };

    render(<BookingDetails booking={incompleteBooking} onClose={mockOnClose} />);
    
    // The component should render "—" for missing values
    // We can check that all expected labels are still present
    expect(screen.getByText("Client:")).toBeInTheDocument();
    expect(screen.getByText("Service:")).toBeInTheDocument();
    expect(screen.getByText("Booking Date:")).toBeInTheDocument();
    expect(screen.getByText("Appointment Start:")).toBeInTheDocument();
    
    // Check for the dash character in the values
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("renders close button", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId("button-close");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent("Close");
  });

  it("calls onClose when close button is clicked", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId("button-close");
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("uses correct layout structure with rows and columns", () => {
    render(<BookingDetails booking={baseBooking} onClose={mockOnClose} />);
    
    // Check that the details are structured with Bootstrap classes
    const rows = document.querySelectorAll('.row');
    expect(rows.length).toBeGreaterThan(0);
    
    const cols = document.querySelectorAll('.col-6');
    expect(cols.length).toBeGreaterThan(0);
  });
});