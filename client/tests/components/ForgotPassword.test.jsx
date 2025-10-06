import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

import ForgotPassword from "../../src/components/ForgotPassword";
import * as authService from "../../src/api/services/auth.js";
import { toast } from "react-toastify";

// 🔹 Mock toastify and authService
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div />,
}));
vi.mock("../../src/api/services/auth.js");

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

  it("renders email input and submit button", () => {
    renderComponent();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Reset Link/i })
    ).toBeInTheDocument();
  });

  it("shows error when email is invalid", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("successful request shows success toast", async () => {
    authService.forgotPassword.mockResolvedValue({
      status: "success",
      message: "Reset link sent!",
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Reset link sent!");
    });
  });

  it("failed request shows error toast", async () => {
    authService.forgotPassword.mockResolvedValue({
      status: "error",
      message: "No user found",
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No user found");
    });
  });

  it("handles API error gracefully", async () => {
    authService.forgotPassword.mockRejectedValue(new Error("Server error"));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });
});