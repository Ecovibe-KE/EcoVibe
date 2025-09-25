import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Blog from "../../src/components/Blog";
import * as blogService from "../../src/api/services/blog";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn() },
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("Blog component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading initially", async () => {
    vi.spyOn(blogService, "getBlogs").mockResolvedValue({ status: "success", data: [] });

    render(
      <BrowserRouter>
        <Blog />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading blogs.../i)).toBeInTheDocument();
  });

  it("displays blogs after fetch", async () => {
    const mockBlogs = [
      {
        id: 1,
        title: "Test Blog",
        author_name: "Author",
        date_created: new Date().toISOString(),
        image: "https://example.com/image.jpg",
        category: "Tech",
        reading_duration: "5 min",
        content: "Full content here",
        preview: "This is a test blog preview...",
      },
    ];

    vi.spyOn(blogService, "getBlogs").mockResolvedValue({ status: "success", data: mockBlogs });

    render(
      <BrowserRouter>
        <Blog />
      </BrowserRouter>
    );

    // Wait for BlogCard to render
    const blogCard = await screen.findByText("Test Blog");
    expect(blogCard).toBeInTheDocument();
  });

  it("filters blogs by search term", async () => {
    const mockBlogs = [
      {
        id: 1,
        title: "React Testing",
        author_name: "Alice",
        date_created: new Date().toISOString(),
        content: "React content",
        preview: "React content",
        image: "https://example.com/react.jpg",
        category: "Tech",
      },
      {
        id: 2,
        title: "Vue Testing",
        author_name: "Bob",
        date_created: new Date().toISOString(),
        content: "Vue content",
        preview: "Vue content",
        image: "https://example.com/vue.jpg",
        category: "Tech",
      },
    ];

    vi.spyOn(blogService, "getBlogs").mockResolvedValue({ status: "success", data: mockBlogs });

    render(
      <BrowserRouter>
        <Blog />
      </BrowserRouter>
    );

    const searchInput = screen.getAllByPlaceholderText(/Search articles/i)[0];
    fireEvent.change(searchInput, { target: { value: "React" } });

    await waitFor(() => {
      expect(screen.getByText(/React Testing/i)).toBeInTheDocument();
      expect(screen.queryByText(/Vue Testing/i)).toBeNull();
    });
  });
});
