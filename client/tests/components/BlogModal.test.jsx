import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostCreationModal from "../../src/components/admin/BlogModal";
import * as blogServices from "../../src/api/services/blog";
import { toast } from "react-toastify";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the modules
vi.mock("../../src/utils/Input", () => ({
  Input: vi.fn(() => <input data-testid="title-input" />), // More specific data-testid
  Select: vi.fn(() => <select data-testid="select"></select>),
  FileInput: vi.fn(() => <input data-testid="file-input" />),
  default: vi.fn(() => <input data-testid="title-input" />), // More specific data-testid
}));
vi.mock("../../src/utils/ToggleSwitch.jsx", () => ({
  ToggleSwitch: vi.fn(() => <div data-testid="toggle-switch"></div>),
  default: vi.fn(() => <div data-testid="toggle-switch-component"></div>),
}));
vi.mock("../../src/utils/DropdownButton.jsx", () => ({
  DropdownButton: vi.fn(() => <div data-testid="dropdown-button"></div>),
  default: vi.fn(() => <div data-testid="dropdown-button-component"></div>),
}));
vi.mock("../../src/components/RichTextEditor", () => ({
  RichTextEditor: vi.fn(() => <div data-testid="rich-text-editor"></div>),
  default: vi.fn(() => <div data-testid="rich-text-editor-component"></div>),
}));
vi.mock("@mui/icons-material/Cancel", () => ({ default: vi.fn(() => <div>CancelIcon</div>) }));
vi.mock("@mui/icons-material/SaveAs", () => ({ default: vi.fn(() => <div>SaveAsIcon</div>) }));
vi.mock("@mui/icons-material/NoteAdd", () => ({ default: vi.fn(() => <div>NoteAddIcon</div>) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../../src/api/services/blog", () => ({
  createBlog: vi.fn(),
  updateBlog: vi.fn(),
}));

describe("PostCreationModal Component", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when not open", () => {
    const { container } = render(<PostCreationModal isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the create modal title correctly", () => {
    render(<PostCreationModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Create New Blog Post")).toBeInTheDocument();
  });

  it("renders the edit modal title correctly", () => {
    const post = { id: "1", title: "Test Post" };
    render(<PostCreationModal isOpen={true} onClose={onClose} post={post} />);
    expect(screen.getByText("Edit Blog Post")).toBeInTheDocument();
  });

//   it("populates form fields when editing a post", () => {
//     const post = {
//       id: "1",
//       title: "Test Post",
//       category: "Technology",
//       excerpt: "Test excerpt",
//       content: '[{"type":"paragraph","children":[{"text":"Test content"}]}]',
//       type: "newsletter",
//       status: "Published",
//     };
//     render(<PostCreationModal isOpen={true} onClose={onClose} post={post} />);

//     // No direct access to the Input/Select values due to mocking, but we can check that the props are passed
//     expect(screen.getByTestId("title-input")).toBeInTheDocument();
//     expect(screen.getByTestId("select")).toBeInTheDocument();
//   });

//   it("calls createBlog with correct payload when creating a post", async () => {
//     blogServices.createBlog.mockResolvedValue({});
//     render(<PostCreationModal isOpen={true} onClose={onClose} />);

//     // Fill out the form
//     fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Test Title" } });

//     // Submit the form
//     const submitButton = screen.getByText("Create Post");
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(blogServices.createBlog).toHaveBeenCalled();
//     });
//   });

//   it("calls updateBlog with correct payload when editing a post", async () => {
//     const post = {
//       id: "1",
//       title: "Test Post",
//       category: "Technology",
//       excerpt: "Test excerpt",
//       content: '[{"type":"paragraph","children":[{"text":"Test content"}]}]',
//       type: "newsletter",
//       status: "Published",
//     };
//     blogServices.updateBlog.mockResolvedValue({});
//     render(<PostCreationModal isOpen={true} onClose={onClose} post={post} />);

//     // Fill out the form
//     fireEvent.change(screen.getByTestId("title-input"), { target: { value: "Updated Title" } });

//     // Submit the form
//     const submitButton = screen.getByText("Update Post");
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(blogServices.updateBlog).toHaveBeenCalled();
//     });
//   });

  it("displays an error message when title or content is missing", async () => {
    render(<PostCreationModal isOpen={true} onClose={onClose} />);

    // Submit the form without filling required fields
    const submitButton = await screen.getByText("Create Post");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Title and Content are required fields.");
    });
  });

  it("calls onClose when the close button is clicked", () => {
    render(<PostCreationModal isOpen={true} onClose={onClose} />);
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});