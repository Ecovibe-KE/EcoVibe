import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock react-google-recaptcha BEFORE importing Login
vi.mock("react-google-recaptcha", () => ({
  default: React.forwardRef((props, ref) => (
    <div data-testid="recaptcha-mock" ref={ref}></div>
  )),
}));

import Login from "../../src/components/Login.jsx";
import { UserContext } from "../../src/context/UserContext.jsx"; // adjust path if needed

describe("Login Component", () => {
  const mockSetUser = vi.fn();

  // Helper to render Login with BrowserRouter + UserContext
  const renderWithProviders = (ui) =>
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: null, setUser: mockSetUser }}>
          {ui}
        </UserContext.Provider>
      </BrowserRouter>
    );

  test("renders main branding text", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/ecovibe/i)).toBeInTheDocument();
    expect(screen.getByText(/empowering sustainable solutions/i)).toBeInTheDocument();
  });

  test("renders login button", () => {
    renderWithProviders(<Login />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("renders mocked recaptcha component", () => {
    renderWithProviders(<Login />);
    expect(screen.getByTestId("recaptcha-mock")).toBeInTheDocument();
  });

  test("allows user to type in email and password fields", async () => {
    renderWithProviders(<Login />);
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("renders forgot password link", () => {
    renderWithProviders(<Login />);
    const forgotLink = screen.getByText(/forgot your password/i);
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest("a")).toHaveAttribute("href", "/forgot-password");
  });
});
