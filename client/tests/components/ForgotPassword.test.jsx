import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "../../src/components/ForgotPassword";
import { forgotPassword } from "../../src/api/services/auth";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock the API service
vi.mock("../../src/api/services/auth");

describe("ForgotPassword Component", () => {
  let mockedNavigate;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useNavigate from react-router-dom
    mockedNavigate = vi.fn();
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        useNavigate: () => mockedNavigate,
      };
    });
  });

  it("renders form inputs and button", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error if passwords do not match", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
  });

  it("redirects after successful password reset", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});

    forgotPassword.mockResolvedValue({
      message: "Password reset successfully! Redirecting to login...",
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Password reset successfully! Redirecting to login..."
      );
      expect(mockedNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("handles API error gracefully", async () => {
    forgotPassword.mockRejectedValue({ message: "Server error" });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
