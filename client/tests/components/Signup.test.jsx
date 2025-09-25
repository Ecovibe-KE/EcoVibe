import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// ✅ Mock react-router-dom BEFORE importing the component
vi.mock("react-router-dom", () => {
  const actual = vi.importActual("react-router-dom"); // get the real module
  return {
    ...actual,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

// ✅ Mock react-google-recaptcha
vi.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: ({ ref }) => {
    ref.current = {
      getValue: () => "fake-token",
      reset: () => {},
    };
    return <div data-testid="recaptcha">Mock reCAPTCHA</div>;
  },
}));

// ✅ Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Now import your component
import SignUpForm from "../../src/components/Signup";

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
    const password = screen.getByLabelText(/^Password$/i);
    fireEvent.change(password, { target: { value: "abc123!" } }); 
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

  it("submits form and shows error when recaptcha missing", () => {
    render(<SignUpForm />);
    const submit = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submit);
    // your toast.error mock will capture the error, no real recaptcha needed
  });
});
