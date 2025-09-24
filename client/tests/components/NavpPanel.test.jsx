import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavPanel from "../components/NavPanel";

// Mock the useBreakpoint hook
vi.mock("../hooks/useBreakpoint", () => ({
  default: vi.fn(),
}));

import useBreakpoint from "../hooks/useBreakpoint";

describe("NavPanel", () => {
  it("renders sidebar directly on desktop", () => {
    useBreakpoint.mockReturnValue(true); // simulate desktop
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    // Desktop should render Dashboard link immediately
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

    // Hamburger menu button exists
    const hamburger = screen.getByRole("button");
    expect(hamburger).toBeInTheDocument();
  });

  it("opens Offcanvas when hamburger is clicked", () => {
    useBreakpoint.mockReturnValue(false); // simulate mobile
    render(
      <MemoryRouter>
        <NavPanel />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole("button");
    fireEvent.click(hamburger);

    // Offcanvas should show Dashboard link
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
    expect(bookingsLink).toBeInTheDocument();

    fireEvent.click(bookingsLink);

    // After clicking, the Offcanvas should close → hamburger reappears
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
