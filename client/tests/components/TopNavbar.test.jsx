import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopNavbar from '../../src/components/TopNavbar';
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../../src/context/UserContext";

// Mock window.matchMedia for jsdom / Offcanvas
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
  const mockUser = { name: "John Doe", avatar: "avatar.png" };
  const mockSetUser = vi.fn();

  it("renders page title", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <TopNavbar />
        </UserContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it("renders user avatar and name", () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <TopNavbar />
        </UserContext.Provider>
      </MemoryRouter>
    );

    const avatar = screen.getByAltText(/john doe/i); // Alt text should match user's name
    const name = screen.getByText(/john doe/i);

    expect(avatar).toBeInTheDocument();
    expect(name).toBeInTheDocument();
  });
});
