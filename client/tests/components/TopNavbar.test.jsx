import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TopNavbar from "../../src/components/TopNavbar";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeAll, expect } from "vitest";

// Mock window.matchMedia for Offcanvas / responsive behavior
beforeAll(() => {
  window.matchMedia = window.matchMedia || function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  };
});

describe("TopNavbar Component", () => {
  const renderComponent = (props = {}) =>
    render(
      <MemoryRouter>
        <TopNavbar {...props} />
      </MemoryRouter>
    );

  it("renders main logo", () => {
    renderComponent();
    expect(screen.getByAltText(/ecovibe logo/i)).toBeInTheDocument();
  });

  it("renders sidebar links with correct images and text", () => {
    renderComponent();

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(within(dashboardLink).getByAltText(/home/i)).toBeInTheDocument();

    const bookingsLink = screen.getByRole("link", { name: /bookings/i });
    expect(bookingsLink).toBeInTheDocument();
    expect(within(bookingsLink).getByAltText(/bookings/i)).toBeInTheDocument();

    const ticketsLink = screen.getByRole("link", { name: /tickets/i });
    expect(ticketsLink).toBeInTheDocument();
    expect(within(ticketsLink).getByAltText(/tickets/i)).toBeInTheDocument();
  });

  it("renders top navbar title", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("renders user avatar and dropdown", () => {
    renderComponent({ user: { name: "Sharon Maina", role: "Admin" } });

    const userButton = screen.getByRole("button", { name: /sharon maina/i });
    expect(userButton).toBeInTheDocument();
    expect(within(userButton).getByAltText(/user avatar/i)).toBeInTheDocument();
  });
});
