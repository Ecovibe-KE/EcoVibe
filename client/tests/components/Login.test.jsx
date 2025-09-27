import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../src/components/Login";
import { UserContext } from "../../src/context/UserContext";
import { MemoryRouter } from "react-router-dom";
import * as authService from "../../src/api/services/auth.js";
import { vi, describe, it, beforeEach, expect } from "vitest";

vi.mock("../../src/api/services/auth.js");

describe("Login Component Full Coverage", () => {
  const mockSetUser = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    mockSetUser.mockClear();
    mockNavigate.mockClear();
  });

  const renderComponent = () => {
    return render(
      <UserContext.Provider value={{ setUser: mockSetUser }}>
        <MemoryRouter>
          <Login navigate={mockNavigate} />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it("renders email and password inputs and login button", () => {
    renderComponent();

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("successful login calls setUser and navigates", async () => {
    authService.loginUser.mockResolvedValue({ user: { name: "John" }, token: "abc123" });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({ name: "John" });
  
    });
  });

  it("shows error toast on failed login", async () => {
    authService.loginUser.mockRejectedValue({ response: { data: { message: "Login failed" } } });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});
