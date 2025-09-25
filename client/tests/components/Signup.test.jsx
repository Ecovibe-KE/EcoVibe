import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SignUpForm from "../../src/components/Signup";

// 🔹 Mock toast from react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 🔹 Mock react-router-dom useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});


describe("SignUpForm", () => {
  it("renders form fields and button", () => {
    render(<SignUpForm />);

    // Headings
    expect(screen.getByText(/Sign Up Now/i)).toBeInTheDocument();

    // Fields
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole("button", { name: /Sign up/i })).toBeInTheDocument();
  });
});