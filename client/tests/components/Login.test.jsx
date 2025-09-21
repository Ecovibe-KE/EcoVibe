import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../../src/pages/Login";

describe("Login Component", () => {
  test("renders login form correctly", () => {
    render(<Login onLogin={vi.fn()} />);

    // Inputs
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Login button
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("allows user to type in inputs", () => {
    render(<Login onLogin={vi.fn()} />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });
});
