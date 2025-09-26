import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Login from '../../src/components/Login'
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UserContext } from "../../src/context/UserContext";

describe("Login Component", () => {
  const mockSetUser = vi.fn();

  const renderWithContext = () =>
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ setUser: mockSetUser }}>
          <Login />
        </UserContext.Provider>
      </BrowserRouter>
    );

  it("renders email and password inputs", () => {
    renderWithContext();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("can type in email and password fields", () => {
    renderWithContext();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("show password button toggles password visibility", () => {
    renderWithContext();
    const passwordInput = screen.getByLabelText(/password/i, { selector: "input" });
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });
});
