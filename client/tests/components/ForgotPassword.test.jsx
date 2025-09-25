import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ForgotPassword from "../../src/components/ForgotPassword";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

beforeAll(() => {
  // Mock window.alert
  window.alert = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("ForgotPassword Component", () => {
  it("renders form elements correctly", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows alert if passwords do not match", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "abcdef" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match!");
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("redirects after successful password reset", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "mypassword" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "mypassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(window.alert).toHaveBeenCalledWith(
      "Password reset successfully! Redirecting to login..."
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });
});
