// DeleteConfirmModal.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteConfirmModal from "../../src/components/admin/DeleteConfirmModal";
import { vi } from "vitest";

describe("DeleteConfirmModal", () => {
    const defaultProps = {
        visible: true,
        resource: { title: "Test Resource" },
        onCancel: vi.fn(),
        onConfirm: vi.fn(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("does not render when visible is false (branch coverage)", () => {
        render(<DeleteConfirmModal {...defaultProps} visible={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders correctly when visible is true (statement + line coverage)", () => {
        render(<DeleteConfirmModal {...defaultProps} />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
        expect(screen.getByText("Test Resource")).toBeInTheDocument();
    });

    it("handles null resource safely (branch coverage)", () => {
        render(<DeleteConfirmModal {...defaultProps} resource={null} />);
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    it("calls onCancel when Cancel button is clicked (function + branch coverage)", () => {
        render(<DeleteConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when Delete button is clicked (function + branch coverage)", () => {
        render(<DeleteConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Delete"));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
});
