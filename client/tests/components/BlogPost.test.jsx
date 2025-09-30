import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBlogById } from "../../src/api/services/blog";
import BlogPost from "../../src/components/BlogPost";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("../../src/api/services/blog", () => ({
  getBlogById: vi.fn(),
}));

describe("BlogPost Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders loading state", () => {
    useParams.mockReturnValue({ id: "1" });
    getBlogById.mockResolvedValue(Promise.resolve({ data: null }));

    render(<BlogPost />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders blog not found state", async () => {
    useParams.mockReturnValue({ id: "1" });
    getBlogById.mockResolvedValue(Promise.resolve({ data: null }));

    render(<BlogPost />);

    await waitFor(() => {
      expect(screen.getByText("Blog not found.")).toBeInTheDocument();
    });
  });

  it("renders blog data correctly", async () => {
    useParams.mockReturnValue({ id: "1" });
    const mockBlogData = {
      id: "1",
      title: "Test Blog",
      category: "Test Category",
      author_name: "Test Author",
      date_created: "2024-01-01T00:00:00.000Z",
      excerpt: "Test Excerpt",
      image: "test-image.jpg",
      content: JSON.stringify([{ type: "paragraph", children: [{ text: "Test Content" }] }]),
    };
    getBlogById.mockResolvedValue({ data: mockBlogData });

    render(<BlogPost />);

    await waitFor(() => {
      expect(screen.getByText("Test Blog")).toBeInTheDocument();
      expect(screen.getByText("Test Category")).toBeInTheDocument();
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      expect(screen.getByText("Test Excerpt")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
      const imageElement = screen.getByAltText("Test Blog");
      expect(imageElement).toBeInTheDocument();
      expect(imageElement.src).toContain("test-image.jpg");
    });
  });

  it("navigates back when the back button is clicked", async () => {
    useParams.mockReturnValue({ id: "1" });
    const mockBlogData = {
      id: "1",
      title: "Test Blog",
      category: "Test Category",
      author_name: "Test Author",
      date_created: "2024-01-01T00:00:00.000Z",
      excerpt: "Test Excerpt",
      image: "test-image.jpg",
      content: JSON.stringify([{ type: "paragraph", children: [{ text: "Test Content" }] }]),
    };
    getBlogById.mockResolvedValue({ data: mockBlogData });

    render(<BlogPost />);

    await waitFor(() => {
      const backButton = screen.getByText("← Back");
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it("displays an error message when fetching blog fails", async () => {
    useParams.mockReturnValue({ id: "1" });
    getBlogById.mockRejectedValue(new Error("Failed to fetch"));

    render(<BlogPost />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load blog");
      expect(mockNavigate).toHaveBeenCalledWith("/blog");
    });
  });
});