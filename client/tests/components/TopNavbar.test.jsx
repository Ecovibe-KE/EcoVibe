// tests/components/TopNavbar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TopNavbar from "../../src/components/TopNavbar";
import { vi, describe, it, beforeAll, beforeEach, afterEach, expect } from "vitest";

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    MemoryRouter: actual.MemoryRouter, // ensure MemoryRouter is available
  };
});

// Mock window.matchMedia for desktop view
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe("TopNavbar Desktop Tests", () => {
  beforeEach(() => {
    const { MemoryRouter } = require("react-router-dom");

    // Set fake localStorage for user session
    localStorage.setItem("token", "fakeToken");
    localStorage.setItem("user", JSON.stringify({ name: "Sharon Maina" }));

    // Render TopNavbar inside MemoryRouter
    render(
      <MemoryRouter>
        <TopNavbar />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    localStorage.clear();
    mockedNavigate.mockReset();
  });

  it("renders desktop sidebar elements", () => {
    // Sidebar links
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // User info
    expect(screen.getByText("Sharon Maina")).toBeInTheDocument();

    // Logout button
    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    expect(logoutBtn).toBeInTheDocument();
  });

  it("logs out and navigates to /login", () => {
    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });
});
