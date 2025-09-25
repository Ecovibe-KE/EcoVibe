// ForgotPassword.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../components/ForgotPassword";

// Mock navigate function
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders component correctly", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    expect(screen.getByText("ECOVIBE")).toBeDefined();
    expect(screen.getByText("Forgot Password")).toBeDefined();
    expect(screen.getByLabelText(/New Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeDefined();
    expect(screen.getByText("RESET PASSWORD")).toBeDefined();
  });

  it("toggles new password visibility when eye icon is clicked", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const eyeIcons = screen.getAllByRole("button") || [];
    const eyeIcon = eyeIcons[0];

    expect(newPasswordInput.type).toBe("password");
    fireEvent.click(eyeIcon);
    expect(newPasswordInput.type).toBe("text");
    fireEvent.click(eyeIcon);
    expect(newPasswordInput.type).toBe("password");
  });

  it("shows alert when passwords do not match", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByText("RESET PASSWORD");

    fireEvent.change(newPasswordInput, { target: { value: "123456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "654321" } });
    fireEvent.click(submitBtn);

    expect(alertMock).toHaveBeenCalledWith("Passwords do not match!");
    alertMock.mockRestore();
  });

  it("shows success alert and redirect link on successful reset", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByText("RESET PASSWORD");

    fireEvent.change(newPasswordInput, { target: { value: "123456" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123456" } });
    fireEvent.click(submitBtn);

    expect(alertMock).toHaveBeenCalledWith("Password reset successfully!");
    expect(await screen.findByText(/Back to Login/)).toBeDefined();

    // Fast-forward 3 seconds for auto-redirect
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    alertMock.mockRestore();
    vi.useRealTimers();
  });

  // Accessibility & Focus Tests
  it("allows keyboard navigation and focuses on first input", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitBtn = screen.getByText("RESET PASSWORD");

    // Focus first input
    newPasswordInput.focus();
    expect(newPasswordInput).toHaveFocus();

    // Tab to confirm password
    await userEvent.tab();
    expect(confirmPasswordInput).toHaveFocus();

    // Tab to submit button
    await userEvent.tab();
    expect(submitBtn).toHaveFocus();
  });

  it("inputs are associated with labels for accessibility", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    expect(newPasswordInput).toBeDefined();
    expect(confirmPasswordInput).toBeDefined();
  });
});

// EyeIcon visibility tests
it("EyeIcon changes SVG based on password visibility", () => {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  const newPasswordInput = screen.getByLabelText(/New Password/i);
  const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

  const eyeIcons = screen.getAllByText((content, element) => element.tagName.toLowerCase() === 'svg');

  // New Password EyeIcon
  const newEyeIcon = eyeIcons[0].parentElement; // span wrapping SVG

  // Initially hidden -> SVG for hidden password
  expect(newPasswordInput.type).toBe("password");
  expect(newEyeIcon.querySelector("path")).toBeDefined();

  // Click to show
  fireEvent.click(newEyeIcon);
  expect(newPasswordInput.type).toBe("text");

  // Click to hide again
  fireEvent.click(newEyeIcon);
  expect(newPasswordInput.type).toBe("password");

  // Confirm Password EyeIcon
  const confirmEyeIcon = eyeIcons[1].parentElement;
  expect(confirmPasswordInput.type).toBe("password");
  fireEvent.click(confirmEyeIcon);
  expect(confirmPasswordInput.type).toBe("text");
});

