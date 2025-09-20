import { render, screen, fireEvent } from "@testing-library/react";
import PasswordReset from "../../pages/PasswordReset";

describe("PasswordReset Component", () => {
  test("renders email input and reset button", () => {
    render(<PasswordReset />);

    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  test("allows user to type email", () => {
    render(<PasswordReset />);
    const emailInput = screen.getByPlaceholderText(/email address/i);

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    expect(emailInput.value).toBe("testuser@example.com");
  });
});
