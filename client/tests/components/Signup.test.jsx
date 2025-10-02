import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "../../src/components/Signup";
import { createUser } from "../../src/api/services/auth";
import { toast } from "react-toastify";

// Mock modules
vi.mock("../../src/api/services/auth", () => ({
  createUser: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

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

// Utility to render with router
const renderSignup = () =>
  render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>
  );

// Utility to fill required fields except password
const fillBaseFields = () => {
  fireEvent.change(screen.getByLabelText("Name", { selector: "input" }), {
    target: { value: "Test User" },
  });
  fireEvent.change(screen.getByLabelText(/Industry/i), {
    target: { value: "technology" },
  });
  fireEvent.change(screen.getByLabelText(/Email address/i), {
    target: { value: "testuser@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText(/Phone number/i), {
    target: { value: "+254700000000" },
  });
};

describe("SignUpForm", () => {
  it("renders inputs and button", () => {
    renderSignup();
    expect(screen.getByLabelText("Name", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    renderSignup();
    const toggle = screen.getByText(/Show/i);
    fireEvent.click(toggle);
    expect(screen.getByText(/Hide/i)).toBeInTheDocument();
  });

  it("shows error for mismatched passwords", async () => {
    renderSignup();
    fillBaseFields();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Mismatch123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    );
  });

  it("requires privacy policy checkbox", async () => {
    renderSignup();
    fillBaseFields();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText(/You must agree to the terms/i)).toBeInTheDocument()
    );
  });

  it("submits successfully and shows success message", async () => {
    createUser.mockResolvedValueOnce({ status: "success", message: "Account created!" });

    renderSignup();
    fillBaseFields();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText(/Account created!/i)).toBeInTheDocument()
    );
  });

  it("shows error toast if API fails", async () => {
    createUser.mockRejectedValueOnce(new Error("Something went wrong"));

    renderSignup();
    fillBaseFields();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
