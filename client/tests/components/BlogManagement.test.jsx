import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BlogManagementUi from "../../src/components/admin/BlogManagment";
import * as blogServices from "../../src/api/services/blog";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the modules
vi.mock("../../src/utils/Input", () => ({
  default: vi.fn(() => <input data-testid="input" />),
}));
vi.mock("../../src/utils/Button", () => ({
  default: vi.fn(({ onClick, label }) => (
    <button data-testid="button" onClick={onClick}>
      {label}
    </button>
  )),
}));
vi.mock("../../src/components/admin/BlogModal.jsx", () => ({
  default: vi.fn(({ isOpen, onClose, post }) => (
    isOpen ? (
      <div data-testid="post-creation-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  )),
}));
vi.mock("@mui/icons-material/LibraryBooks", () => ({ default: vi.fn(() => <div>LibraryBooksIcon</div>) }));
vi.mock("@mui/icons-material/CardMembership", () => ({ default: vi.fn(() => <div>CardMembershipIcon</div>) }));
vi.mock("@mui/icons-material/EditNote", () => ({ default: vi.fn(() => <div>EditNoteIcon</div>) }));
vi.mock("@mui/icons-material/Newspaper", () => ({ default: vi.fn(() => <div>NewspaperIcon</div>) }));
vi.mock("@mui/icons-material/FilterList", () => ({ default: vi.fn(() => <div>FilterListIcon</div>) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../../src/api/services/blog.js", () => ({
  fetchAdminBlogs: vi.fn(),
  deleteBlog: vi.fn(),
}));

const mockBlogs = [
  {
    id: "1",
    title: "Test Blog 1",
    category: "Technology",
    status: "published",
    type: "article",
    reading_duration: "5 min",
    excerpt: "Test excerpt 1",
    author_name: "Test Author 1",
    date_created: "2024-01-01",
  },
  {
    id: "2",
    title: "Test Blog 2",
    category: "Design",
    status: "draft",
    type: "newsletter",
    reading_duration: "3 min",
    excerpt: "Test excerpt 2",
    author_name: "Test Author 2",
    date_created: "2024-01-02",
  },
];

describe("BlogManagementUi Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blogServices.fetchAdminBlogs.mockResolvedValue({ data: mockBlogs });
  });

  it("renders loading state", () => {
    blogServices.fetchAdminBlogs.mockResolvedValue(new Promise(() => { })); // Never resolve
    render(<BlogManagementUi />);
    expect(screen.getByText("Loading posts...")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    blogServices.fetchAdminBlogs.mockRejectedValue(new Error("Failed to fetch"));
    render(<BlogManagementUi />);
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch blogs. Please try again later.")).toBeInTheDocument();
    });
  });

  it("renders 'No posts found.' when no blogs are fetched", async () => {
    blogServices.fetchAdminBlogs.mockResolvedValue({ data: [] });
    render(<BlogManagementUi />);
    await waitFor(() => {
      expect(screen.getByText("No posts found.")).toBeInTheDocument();
    });
  });

  it("renders blog posts when blogs are successfully fetched", async () => {
    render(<BlogManagementUi />);
    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
      expect(screen.getByText("Test Blog 2")).toBeInTheDocument();
    });
  });

  it("opens the modal when 'Create Post' button is clicked", async () => {
    render(<BlogManagementUi />);
    await waitFor(() => {
      const createPostButton = screen.getByText("Create Post");
      fireEvent.click(createPostButton);
      expect(screen.getByTestId("post-creation-modal")).toBeInTheDocument();
    });
  });

  it("opens the modal with the selected post when 'Edit Post' button is clicked", async () => {
    render(<BlogManagementUi />);

    await waitFor(() => {
      const editButton = screen.getAllByText("Edit Post")[0];
      fireEvent.click(editButton);
      expect(screen.getByTestId("post-creation-modal")).toBeInTheDocument();
    });
  });

  it("closes the modal when the close button is clicked", async () => {
    render(<BlogManagementUi />);

    await waitFor(() => {
      const createPostButton = screen.getByText("Create Post");
      fireEvent.click(createPostButton);
      const closeModalButton = screen.getByText("Close Modal");
      fireEvent.click(closeModalButton);
      expect(screen.queryByTestId("post-creation-modal")).toBeNull();
    });
  });

  it("calls deleteBlog when the delete button is clicked and confirms deletion", async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<BlogManagementUi />);

    await waitFor(() => {
      const deleteButton = screen.getAllByText("Delete Post")[0];
      fireEvent.click(deleteButton);
      expect(confirmSpy).toHaveBeenCalled();
      expect(blogServices.deleteBlog).toHaveBeenCalledWith("1");
      confirmSpy.mockRestore();
    });
  });

  it("does not call deleteBlog when the delete button is clicked and deletion is cancelled", async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);

    render(<BlogManagementUi />);

    await waitFor(() => {
      const deleteButton = screen.getAllByText("Delete Post")[0];
      fireEvent.click(deleteButton);
      expect(confirmSpy).toHaveBeenCalled();
      expect(blogServices.deleteBlog).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

//   it("filters blogs by category", async () => {
//     render(<BlogManagementUi />);

//     await waitFor(() => {
//       const categoryDropdownButton = screen.getByText("All Categories");
//       fireEvent.click(categoryDropdownButton);

//       const technologyCategory = screen.getByText("Technology");
//       fireEvent.click(technologyCategory);

//       expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
//       expect(screen.queryByText("Test Blog 2")).toBeNull();
//     });
//   });

//   it("filters blogs by status", async () => {
//     render(<BlogManagementUi />);

//     await waitFor(() => {
//       const statusDropdownButton = screen.getByText("All Status");
//       fireEvent.click(statusDropdownButton);

//       const draftsStatus = screen.getByText("Drafts");
//       fireEvent.click(draftsStatus);

//       expect(screen.queryByText("Test Blog 1")).toBeNull();
//       expect(screen.getByText("Test Blog 2")).toBeInTheDocument();
//     });
//   });
});