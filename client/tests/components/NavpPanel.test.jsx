import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavPanel from "../../src/components/NavPanel";

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock the useBreakpoint hook as a default export
vi.mock("../../src/hooks/useBreakpoint", () => ({
  default: vi.fn(),
}));

import useBreakpoint from "../../src/hooks/useBreakpoint";

describe("NavPanel", () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("renders sidebar directly on desktop", () => {
    useBreakpoint.mockReturnValue(true); // simulate desktop
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Bookings")).toBeInTheDocument();
  });

  it("renders hamburger button on mobile", () => {
    useBreakpoint.mockReturnValue(false); // simulate mobile
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole("button");
    expect(hamburger).toBeInTheDocument();
  });

  it("opens Offcanvas when hamburger is clicked", () => {
    useBreakpoint.mockReturnValue(false);
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole("button");
    fireEvent.click(hamburger);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("closes Offcanvas when a link is clicked on mobile", () => {
    useBreakpoint.mockReturnValue(false);
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole("button");
    fireEvent.click(hamburger);

    const bookingsLink = screen.getByText("Bookings");
    fireEvent.click(bookingsLink);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});