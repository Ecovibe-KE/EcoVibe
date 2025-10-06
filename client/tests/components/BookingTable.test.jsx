import { render, screen, fireEvent } from "@testing-library/react";
import BookingTable from "../../src/components/BookingTable";
import { vi } from "vitest";

describe("BookingTable Component", () => {
    const baseBooking = {
        id: 1,
        client_name: "John Doe",
        service_name: "Massage Therapy",
        booking_date: "2023-10-10",
        start_time: "2023-10-10T14:30:00",
        status: "confirmed",
    };

    const mockHandlers = {
        onView: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders 'No bookings available' when bookings list is empty (branch)", () => {
        render(
            <BookingTable
                bookings={[]}
                isAdmin={false}
                {...mockHandlers}
            />
        );
        expect(screen.getByText("No bookings available.")).toBeInTheDocument();
    });

    it("renders table with user column for admin (branch + line)", () => {
        render(
            <BookingTable
                bookings={[baseBooking]}
                isAdmin={true}
                {...mockHandlers}
            />
        );

        // Headings
        expect(screen.getByText("User")).toBeInTheDocument();
        expect(screen.getByText("Service")).toBeInTheDocument();

        // Booking details
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Massage Therapy")).toBeInTheDocument();

        // Status badge
        expect(screen.getByText("confirmed")).toHaveClass("bg-success");

        // Buttons
        expect(screen.getByText("View")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("renders table without user column for non-admin (branch)", () => {
        render(
            <BookingTable
                bookings={[baseBooking]}
                isAdmin={false}
                {...mockHandlers}
            />
        );
        expect(screen.queryByText("User")).not.toBeInTheDocument();
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("calls onView when View button is clicked (function)", () => {
        render(
            <BookingTable
                bookings={[baseBooking]}
                isAdmin={false}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText("View"));
        expect(mockHandlers.onView).toHaveBeenCalledWith(baseBooking);
    });

    it("calls onDelete when Delete button is clicked (function)", () => {
        render(
            <BookingTable
                bookings={[baseBooking]}
                isAdmin={false}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText("Delete"));
        expect(mockHandlers.onDelete).toHaveBeenCalledWith(baseBooking);
    });

    it("calls onUpdate when Edit button is clicked (function)", () => {
        render(
            <BookingTable
                bookings={[baseBooking]}
                isAdmin={true}
                {...mockHandlers}
            />
        );

        fireEvent.click(screen.getByText("Edit"));
        expect(mockHandlers.onUpdate).toHaveBeenCalledWith(baseBooking);
    });

    it("renders fallback values when data fields are missing (branch)", () => {
        const incompleteBooking = {
            id: 2,
            client_name: null,
            service_name: null,
            booking_date: "2023-10-11",
            start_time: null,
            status: "unknown",
        };

        render(
            <BookingTable
                bookings={[incompleteBooking]}
                isAdmin={true}
                {...mockHandlers}
            />
        );

        const fallbackValues = screen.getAllByText("—");
        expect(fallbackValues.length).toBe(2); // One for client_name, one for service_name

        const statusBadge = screen.getByText("unknown");
        expect(statusBadge).toHaveClass("bg-secondary");
    });

});
