import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "../../src/components/ForgotPassword";
import { forgotPassword } from "../../src/api/services/auth.js";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../src/api/services/auth.js", () => ({
  forgotPassword: vi.fn(),
}));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
  });

  it("renders form fields correctly", () => {
    expect(screen.getByLabelText(/New Password/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RESET PASSWORD/i })).toBeInTheDocument();
  });

  it("shows error message if passwords do not match", async () => {
    fireEvent.change(screen.getByLabelText(/New Password/i, { selector: "input" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "different123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
      expect(forgotPassword).not.toHaveBeenCalled();
    });
  });

  it("calls forgotPassword and redirects on successful reset", async () => {
    forgotPassword.mockResolvedValue({ message: "Password reset successfully!" });

    fireEvent.change(screen.getByLabelText(/New Password/i, { selector: "input" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith("password123");
    });
  });

  it("handles API failure gracefully", async () => {
    forgotPassword.mockRejectedValue(new Error("API Error"));

    fireEvent.change(screen.getByLabelText(/New Password/i, { selector: "input" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i, { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /RESET PASSWORD/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalled();
    });
  });
});
