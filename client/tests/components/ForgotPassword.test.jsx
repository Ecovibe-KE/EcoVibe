import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "../../src/components/ForgotPassword.jsx";
import { MemoryRouter } from "react-router-dom";
import * as authApi from "../../src/api/services/auth.js";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock navigate
const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div />,
}));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () =>
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

  it("renders the form correctly", () => {
    setup();
    expect(screen.getByLabelText("New Password", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("New Password", { selector: "input" }), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password", { selector: "input" }), {
      target: { value: "password2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("calls forgotPassword API and shows success toast on valid submit", async () => {
    const mockResponse = { message: "Success!" };
    vi.spyOn(authApi, "forgotPassword").mockResolvedValue(mockResponse);

    setup();

    fireEvent.change(screen.getByLabelText("New Password", { selector: "input" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password", { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => expect(authApi.forgotPassword).toHaveBeenCalledWith("password123"));
    await waitFor(() =>
      expect(require("react-toastify").toast.success).toHaveBeenCalledWith(
        "Success!",
        expect.any(Object)
      )
    );
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith("/login"));
  });

  it("shows error toast when API fails", async () => {
    vi.spyOn(authApi, "forgotPassword").mockRejectedValue(new Error("API Failed"));

    setup();

    fireEvent.change(screen.getByLabelText("New Password", { selector: "input" }), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password", { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() =>
      expect(require("react-toastify").toast.error).toHaveBeenCalledWith(
        "API Failed",
        expect.any(Object)
      )
    );
  });

  it("toggles password visibility when eye button clicked", () => {
    setup();

    const newPasswordToggle = screen.getByLabelText("Show New Password", { selector: "button" });
    const newPasswordInput = screen.getByLabelText("New Password", { selector: "input" });

    expect(newPasswordInput.type).toBe("password");

    fireEvent.click(newPasswordToggle);

    expect(newPasswordInput.type).toBe("text");
  });
});
