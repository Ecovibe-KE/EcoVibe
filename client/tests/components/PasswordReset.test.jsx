import { render, screen, fireEvent } from "@testing-library/react";
import PasswordReset from "../../src/pages/PasswordReset";

describe("PasswordReset Component", () => {
  test("renders email input and reset button", () => {
    render(<PasswordReset onReset={vi.fn()} />);
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  test("allows user to type email and submit", () => {
    const mockReset = vi.fn();
    render(<PasswordReset onReset={mockReset} />);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const resetButton = screen.getByRole("button", { name: /reset password/i });
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalledWith("test@example.com");
  });
});
