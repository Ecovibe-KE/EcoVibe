import { render, screen, fireEvent } from "@testing-library/react";
import BookingModal from "../../src/components/BookingModal"; // adjust path
import { vi } from "vitest";

describe("BookingModal Component", () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it("renders modal with given title and children", () => {
        render(
            <BookingModal title="Modal Title" onClose={mockOnClose}>
                <div>Modal Content</div>
            </BookingModal>
        );

        // Statement & line coverage: render runs all JSX statements
        expect(screen.getByText("Modal Title")).toBeInTheDocument();
        expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("calls onClose function when close button is clicked", () => {
        render(
            <BookingModal title="Modal Title" onClose={mockOnClose}>
                <div>Modal Content</div>
            </BookingModal>
        );

        const closeButton = screen.getByRole("button");
        fireEvent.click(closeButton);

        // Function & branch coverage: verifies event handler executes
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
