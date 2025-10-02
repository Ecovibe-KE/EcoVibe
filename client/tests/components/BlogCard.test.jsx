import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBlogs } from "../../src/api/services/blog";
import Blog from "../../src/components/Blog";
import BlogCard from "../../src/components/BlogCard";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("../../src/api/services/blog", () => ({
  getBlogs: vi.fn(),
}));

vi.mock("../../src/components/BlogCard", () => {
  return {
    __esModule: true,
    default: vi.fn(() => <BlogCard/>),
  };
});

vi.mock("../../src/components/BlogSideBar", () => {
  return {
    __esModule: true,
    default: vi.fn(() => <div data-testid="blog-sidebar">BlogSideBar</div>),
  };
});

describe("Blog Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    getBlogs.mockReset();
    toast.error.mockReset();
  });

  it("renders loading state", () => {
    getBlogs.mockResolvedValue(Promise.resolve({ status: "success", data: [] }));
    render(<Blog />);
    expect(screen.getByText("Loading blogs...")).toBeInTheDocument();
  });

  it("renders 'No blogs match your search or selected category.' when no blogs are found", async () => {
    getBlogs.mockResolvedValue(Promise.resolve({ status: "success", data: [] }));
    render(<Blog />);
    await waitFor(() => {
      expect(screen.getByText("No blogs match your search or selected category.")).toBeInTheDocument();
    });
  });

//   it("renders blog cards when blogs are successfully fetched", async () => {
//     const mockBlogs = [
//       {
//         id: "1",
//         title: "Test Blog 1",
//         image: "test-image-1.jpg",
//         preview: "Test Preview 1",
//         date_created: "2024-01-01T00:00:00.000Z",
//         author_name: "Test Author 1",
//         excerpt: "Test Excerpt 1",
//         category: "Test Category 1",
//         content: "Test Content 1",
//       },
//       {
//         id: "2",
//         title: "Test Blog 2",
//         image: "test-image-2.jpg",
//         preview: "Test Preview 2",
//         date_created: "2024-01-02T00:00:00.000Z",
//         author_name: "Test Author 2",
//         excerpt: "Test Excerpt 2",
//         category: "Test Category 2",
//         content: "Test Content 2",
//       },
//     ];
//     getBlogs.mockResolvedValue(Promise.resolve({ status: "success", data: mockBlogs }));

//     render(<Blog />);

//     await waitFor(() => {
//       expect(screen.getAllByTestId("blog-card").length).toBe(2);
//     });
//   });

  it("displays an error message when fetching blogs fails", async () => {
    getBlogs.mockRejectedValue(new Error("Failed to fetch"));

    render(<Blog />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to fetch blogs. Please try again later.");
    });
  });

  it("displays an error message from the API when the status is not success", async () => {
    getBlogs.mockResolvedValue({ status: "error", message: "API Error" });

    render(<Blog />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error: API Error");
    });
  });
});