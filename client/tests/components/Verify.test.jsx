import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, test, beforeEach, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import VerifyPage from "../../src/components/Verify";
import { verifyAccount } from "../../src/api/services/auth";

vi.mock("../../src/api/services/auth", () => ({
  verifyAccount: vi.fn(),
}));

vi.mock("../../src/utils/Button", () => {
  return {
    default: ({ children, ...props }) => (
      <button {...props}>{children}</button>
    ),
  };
});

const mockedNavigate = vi.fn();
let searchParamsValue = new URLSearchParams({ token: "test-token" });

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useSearchParams: () => [searchParamsValue],
  };
});

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsValue = new URLSearchParams({ token: "test-token" });
    // Safe default: always return a resolved promise unless overridden
    verifyAccount.mockResolvedValue({ message: "" });
  });

  test("renders loading state", () => {
    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Verifying/i)).toBeInTheDocument();
  });

  test("handles success", async () => {
    verifyAccount.mockResolvedValueOnce({
      message: "Account verified successfully!",
    });

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/✅ Account Verified!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Account verified successfully!/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Go to Login/i }));
    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  test("handles failure", async () => {
    verifyAccount.mockRejectedValueOnce({ message: "Verification failed." });

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/❌ Verification Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Verification failed./i)).toBeInTheDocument();
  });

  test("shows error with missing token", async () => {
    searchParamsValue = new URLSearchParams({});

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/❌ Verification Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/No token provided/i)).toBeInTheDocument();
  });
});