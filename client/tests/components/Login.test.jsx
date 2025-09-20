import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../../pages/Login";

describe("Login Component", () => {
  test("renders login form correctly", () => {
    render(<Login onLogin={jest.fn()} />);

    // Inputs
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
  });

  test("allows user to type in inputs", () => {
    render(<Login onLogin={jest.fn()} />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Test@1234" } });

    expect(emailInput.value).toBe("testuser@example.com");
    expect(passwordInput.value).toBe("Test@1234");
  });
});
