// import { render, screen, fireEvent } from "@testing-library/react";
// import { describe, it, expect, vi, beforeEach } from "vitest";
// import BookingModal from "../../src/components/BookingModal";

// describe("BookingModal Component", () => {
//   const mockOnClose = vi.fn();

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it("renders modal with title and children", () => {
//     render(
//       <BookingModal title="Test Modal" onClose={mockOnClose}>
//         <p>Modal content</p>
//       </BookingModal>
//     );

//     expect(screen.getByText("Test Modal")).toBeInTheDocument();
//     expect(screen.getByText("Modal content")).toBeInTheDocument();
//   });

//   it("calls onClose when close button is clicked", () => {
//     render(
//       <BookingModal title="Test Modal" onClose={mockOnClose}>
//         <p>Modal content</p>
//       </BookingModal>
//     );

//     const closeButton = screen.getByRole('button');
//     fireEvent.click(closeButton);

//     expect(mockOnClose).toHaveBeenCalled();
//   });

//   it("has correct modal styling", () => {
//     render(
//       <BookingModal title="Test Modal" onClose={mockOnClose}>
//         <p>Modal content</p>
//       </BookingModal>
//     );

//     const modal = screen.getByText("Test Modal").closest('.modal');
//     expect(modal).toHaveStyle({ display: 'block' });
//     expect(modal).toHaveStyle({ background: 'rgba(0,0,0,0.5)' });
//   });
// });