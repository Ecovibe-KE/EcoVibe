// tests/components/AddResource.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AddResource from "../../src/components/admin/Addresource";

describe("AddResource", () => {
    const mockProps = {
        visible: true,
        form: { title: "", description: "" },
        errors: {},
        onChange: vi.fn(),
        onCancel: vi.fn(),
        onSave: vi.fn(),
    };

    it("renders the modal when visible is true", () => {
        render(<AddResource {...mockProps} />);
        expect(screen.getByText("Add Resource")).toBeInTheDocument();
    });

    it("does not render when visible is false", () => {
        render(<AddResource {...mockProps} visible={false} />);
        expect(screen.queryByText("Add Resource")).not.toBeInTheDocument();
    });

    it("calls onCancel when Cancel button is clicked", () => {
        render(<AddResource {...mockProps} />);
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
        expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it("calls onSave when Save Resource button is clicked", () => {
        render(<AddResource {...mockProps} />);
        const saveButton = screen.getByText("Save Resource");
        fireEvent.click(saveButton);
        expect(mockProps.onSave).toHaveBeenCalled();
    });

    it("calls onChange when typing in Resource Title", () => {
        render(<AddResource {...mockProps} />);
        const titleInput = screen.getByLabelText("Resource Title");
        fireEvent.change(titleInput, { target: { value: "New Resource" } });
        expect(mockProps.onChange).toHaveBeenCalled();
    });
});
