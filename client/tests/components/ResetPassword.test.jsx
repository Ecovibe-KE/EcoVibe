import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../../src/components/ResetPassword.jsx";
import * as authService from "../../src/api/services/auth.js";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";

// --- Declare mockNavigate FIRST
const mockNavigate = vi.fn();

// --- Mock resetPassword service
vi.mock("../../src/api/services/auth.js", () => ({
  resetPassword: vi.fn(),
}));

// --- Mock toastify (preserve ToastContainer, fake methods)
vi.mock("react-toastify", async () => {
  const actual = await vi.importActual("react-toastify");
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// --- Mock react-router-dom globally
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams({ token: "fakeToken" })],
  };
});

describe("ResetPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

  it("renders new and confirm password inputs and button", () => {
    renderComponent();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i })
    ).toBeInTheDocument();
  });

  // ... keep the rest of your tests unchanged
});
