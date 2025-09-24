import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

// Mock react-google-recaptcha BEFORE importing Login
vi.mock("react-google-recaptcha", () => ({
  default: React.forwardRef((props, ref) => (
    <div data-testid="recaptcha-mock" ref={ref}></div>
  )),
}));

import Login from "../../src/components/Login.jsx";

describe("Login Component", () => {
  test("renders main branding text", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/ecovibe/i)).toBeInTheDocument();
    expect(screen.getByText(/empowering sustainable solutions/i)).toBeInTheDocument();
  });

  test("renders login button", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("renders mocked recaptcha component", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByTestId("recaptcha-mock")).toBeInTheDocument();
  });

  test("allows user to type in email and password fields", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("renders forgot password link", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const forgotLink = screen.getByText(/forgot your password\?/i);
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });
});
