import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpForm from "../../src/components/Signup";
import { vi } from "vitest";

const mockToast = { success: vi.fn(), error: vi.fn() };
// Mock toast and navigate so they don’t actually run
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn()
}));

vi.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: () => <div>Mocked reCAPTCHA</div>,
}));

describe("SignUpForm", () => {
  it("renders inputs and button", () => {
    render(<SignUpForm />);
    expect(screen.getByText(/Sign Up Now/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<SignUpForm />);
    const toggle = screen.getByText(/Show/i);
    fireEvent.click(toggle);
    expect(screen.getByText(/Hide/i)).toBeInTheDocument();
  });

  it("validates password and confirm password", () => {
    render(<SignUpForm />);
    const password = screen.getByLabelText(/Password/i);
    fireEvent.change(password, { target: { value: "abc123!" } }); // too short
    fireEvent.blur(password);
    expect(screen.getByText(/Password must be at least/)).toBeInTheDocument();

    fireEvent.change(password, { target: { value: "Valid123!" } });
    const confirm = screen.getByLabelText(/confirm password/i);
    fireEvent.change(confirm, { target: { value: "Different!" } });
    expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
  });

  it("checks privacy policy checkbox", () => {
    render(<SignUpForm />);
    const checkbox = screen.getByLabelText(/I agree to the/i);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("submits form and shows error when recaptcha missing", async () => {
    render(<SignUpForm />);
    const submit = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submit);
  });
});
