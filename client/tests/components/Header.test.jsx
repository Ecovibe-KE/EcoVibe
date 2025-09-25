import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Header from "../../src/components/Header.jsx";
import { UserContext } from "../../src/context/UserContext.jsx";

// Create a mock navigate function
const navigateMock = vi.fn();

// Mock react-router-dom once at the top
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Utility wrapper for rendering with providers
const renderWithProviders = (ui, { user, setUser }) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUser }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks(); // reset mocks before each test
  });

  it("renders user details correctly", () => {
    const user = { name: "Alice", role: "Admin", avatar: "/alice.png" };
    const setUser = vi.fn();

    renderWithProviders(<Header />, { user, setUser });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByAltText("Profile Avatar")).toHaveAttribute(
      "src",
      "/alice.png"
    );
  });

  it("falls back to default avatar if user avatar is missing", () => {
    const user = { name: "Guest", role: "Client", avatar: "" };
    const setUser = vi.fn();

    renderWithProviders(<Header />, { user, setUser });

    expect(screen.getByAltText("Profile Avatar")).toHaveAttribute(
      "src",
      "/default-avatar.png"
    );
  });

  it("logs out user and navigates to /login", () => {
    const user = { name: "Alice", role: "Admin", avatar: "/alice.png" };
    const setUser = vi.fn();

    renderWithProviders(<Header />, { user, setUser });

    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutBtn);

    // Context reset
    expect(setUser).toHaveBeenCalledWith({
      name: "Guest",
      role: "Client",
      avatar: "/default-avatar.png",
    });

    // Local storage cleared
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("userData")).toBeNull();

    // Navigation called
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
