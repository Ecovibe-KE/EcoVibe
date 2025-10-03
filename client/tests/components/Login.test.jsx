import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Login from "../../src/components/Login";
import { useAuth } from "../../src/context/AuthContext";

// Mock toastify
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock AuthContext
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock reCAPTCHA (pretend it’s always solved)
vi.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: vi.fn(({ ref }) => {
    if (ref) {
      ref.current = {
        getValue: () => "fake-captcha-token",
        reset: vi.fn(),
      };
    }
    return <div data-testid="recaptcha">Mock reCAPTCHA</div>;
  }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

// ✅ Fix: set a fake site key so component doesn't throw toast.error on mount
beforeAll(() => {
  import.meta.env = {
    ...import.meta.env,
    VITE_REACT_APP_RECAPTCHA_SITE_KEY: "test-site-key",
  };
});

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and button", () => {
    useAuth.mockReturnValue({ login: vi.fn() });

    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows success toast when login succeeds", async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce({});
    useAuth.mockReturnValue({ login: mockLogin });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Login successful! Redirecting..."
      )
    );
  });

  it("shows fallback error toast when login fails", async () => {
    const mockLogin = vi.fn().mockRejectedValueOnce(new Error("Network error"));
    useAuth.mockReturnValue({ login: mockLogin });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Login failed. Please try again.")
    );
  });
});
