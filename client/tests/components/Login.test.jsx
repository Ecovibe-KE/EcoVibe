// tests/components/Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../src/components/Login.jsx";
import { UserContext } from "../../src/context/UserContext.jsx";
import { loginUser } from "../../src/api/services/auth.js";
import { vi } from "vitest";

// ------------------ Mock dependencies ------------------
vi.mock("../../src/api/services/auth.js", () => ({
  loginUser: vi.fn(),
}));

vi.mock("../../src/utils/Input.jsx", () => ({
  default: ({ label, name, ...props }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...props} />
    </div>
  ),
}));

vi.mock("react-google-recaptcha", () => ({
  default: ({ sitekey, size }) => <div data-testid={`recaptcha-${size}`}>reCAPTCHA Mock</div>,
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  ToastContainer: () => <div />,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// ------------------ Master Test Suite ------------------
describe("Login Component Full Coverage", () => {
  let setUser;

  beforeEach(() => {
    setUser = vi.fn();
    vi.clearAllMocks();
    global.innerWidth = 1024; // reset width for ReCAPTCHA
  });

  it("renders all UI elements", () => {
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    expect(screen.getByText(/ECOVIBE/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering Sustainable Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument();
  });

  it("handles missing reCAPTCHA key", async () => {
    import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = "";
    const { toast } = await import("react-toastify");

    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    expect(toast.error).toHaveBeenCalledWith(
      "reCAPTCHA site key is missing. Please contact Site Owner."
    );
    expect(screen.getByText(/reCAPTCHA not configured/i)).toBeInTheDocument();
  });

  it("handleChange updates formData", () => {
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    expect(emailInput.value).toBe("new@example.com");

    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: "pass123" } });
    expect(passwordInput.value).toBe("pass123");
  });

  it("toggles password visibility", () => {
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    const toggle = screen.getByLabelText(/Password/i).querySelector("span");
    fireEvent.click(toggle);
    fireEvent.click(toggle);
  });

  it("renders compact ReCAPTCHA for small screens", () => {
    global.innerWidth = 500;
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );
    expect(screen.getByTestId("recaptcha-compact")).toBeInTheDocument();
  });

  it("renders normal ReCAPTCHA for desktop screens", () => {
    global.innerWidth = 1024;
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );
    expect(screen.getByTestId("recaptcha-normal")).toBeInTheDocument();
  });

  it("submit with empty email and password triggers toast error", async () => {
    const { toast } = await import("react-toastify");
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByText(/Login/i));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter email and password.");
    });
  });

  it("submit with only email triggers toast error", async () => {
    const { toast } = await import("react-toastify");
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter email and password.");
    });
  });

  it("submit with only password triggers toast error", async () => {
    const { toast } = await import("react-toastify");
    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter email and password.");
    });
  });

  it("successful login calls setUser and navigates", async () => {
    loginUser.mockResolvedValue({ token: "abc123", user: { name: "John" } });
    const { toast } = await import("react-toastify");

    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(setUser).toHaveBeenCalledWith({ name: "John" });
      expect(localStorage.getItem("authToken")).toBe("abc123");
      expect(localStorage.getItem("userData")).toBe(JSON.stringify({ name: "John" }));
      expect(toast.success).toHaveBeenCalledWith("Login successful! Redirecting...");
    });
  });

  it("login failure triggers toast error", async () => {
    loginUser.mockRejectedValue(new Error("Login failed"));
    const { toast } = await import("react-toastify");

    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Login failed");
    });
  });

  it("invalid login response triggers toast error", async () => {
    loginUser.mockResolvedValue({});
    const { toast } = await import("react-toastify");

    render(
      <UserContext.Provider value={{ setUser }}>
        <Login />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid login response. Please try again.");
    });
  });
});
