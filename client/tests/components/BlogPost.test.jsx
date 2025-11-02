import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBlogById } from "../../src/api/services/blog";
import BlogPost from "../../src/components/BlogPost";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// Mock window.scrollTo
beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
});

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

// Mock react-bootstrap components
vi.mock("react-bootstrap", () => ({
  Container: ({ children, ...props }) => <div {...props}>{children}</div>,
  Row: ({ children, ...props }) => <div {...props}>{children}</div>,
  Col: ({ children, ...props }) => <div {...props}>{children}</div>,
  Image: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
  Spinner: ({ animation, variant, ...props }) => (
    <div
      data-testid="spinner"
      className={`spinner-border ${variant ? `text-${variant}` : ''}`}
      {...props}
    />
  ),
}));

// Mock the Button component
vi.mock("../../src/utils/Button", () => ({
  default: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock the RichTextEditor component
vi.mock("../../src/components/RichTextEditor", () => ({
  RichTextEditor: ({ value, readOnly }) => (
    <div data-testid="rich-text-editor">
      {readOnly && <span>Read Only</span>}
      {value && Array.isArray(value) && value.map((item, index) => (
        <div key={index}>
          {item.children && item.children.map((child, childIndex) => (
            <span key={childIndex}>{child.text}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe("BlogPost Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    window.scrollTo.mockClear();
  });

  it("renders loading state", async () => {
    useParams.mockReturnValue({ id: "1" });
    // Don't resolve immediately to test loading state
    getBlogById.mockImplementation(() => new Promise(() => { }));

    render(<BlogPost />);

    // Check for spinner instead of "Loading..." text
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders blog not found state", async () => {
    useParams.mockReturnValue({ id: "1" });
    getBlogById.mockResolvedValue({ data: null });

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

      // Check for the image
      const imageElement = screen.getByAltText("Test Blog");
      expect(imageElement).toBeInTheDocument();
      expect(imageElement.src).toContain("test-image.jpg");

      // Check for date (formatted)
      expect(screen.getByText("1/1/2024")).toBeInTheDocument();
    });

    // Check that RichTextEditor is rendered with content
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
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

  it("calls window.scrollTo on component mount", async () => {
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
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });
  });

  it("handles blog without image correctly", async () => {
    useParams.mockReturnValue({ id: "1" });
    const mockBlogData = {
      id: "1",
      title: "Test Blog Without Image",
      category: "Test Category",
      author_name: "Test Author",
      date_created: "2024-01-01T00:00:00.000Z",
      excerpt: "Test Excerpt",
      image: null,
      content: JSON.stringify([{ type: "paragraph", children: [{ text: "Test Content" }] }]),
    };
    getBlogById.mockResolvedValue({ data: mockBlogData });

    render(<BlogPost />);

    await waitFor(() => {
      expect(screen.getByText("Test Blog Without Image")).toBeInTheDocument();
      // Should not have an image element when image is null
      expect(screen.queryByAltText("Test Blog Without Image")).not.toBeInTheDocument();
    });
  });

  it("handles empty content gracefully", async () => {
    useParams.mockReturnValue({ id: "1" });
    const mockBlogData = {
      id: "1",
      title: "Test Blog Empty Content",
      category: "Test Category",
      author_name: "Test Author",
      date_created: "2024-01-01T00:00:00.000Z",
      excerpt: "Test Excerpt",
      image: "test-image.jpg",
      content: JSON.stringify("{}"), // Empty content
    };
    getBlogById.mockResolvedValue({ data: mockBlogData });

    render(<BlogPost />);

    await waitFor(() => {
      expect(screen.getByText("Test Blog Empty Content")).toBeInTheDocument();
      // RichTextEditor should still be rendered
      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });
  });
});