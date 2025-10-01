// tests/components/AuthContext.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";

// --- mocks ---
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../src/api/services/auth", () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

import { loginUser, logoutUser } from "../../src/api/services/auth";

// --- test helper ---
const TestComponent = () => {
  const { user, login, logout, isClient, isAdmin, isSuperAdmin } = useAuth();

  return (
    <div>
      <p data-testid="user-role">{user?.role || "no-user"}</p>
      <button
        onClick={() =>
          login({ email: "a@b.com", password: "pass123" })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
      <p data-testid="isClient">{isClient ? "yes" : "no"}</p>
      <p data-testid="isAdmin">{isAdmin ? "yes" : "no"}</p>
      <p data-testid="isSuperAdmin">{isSuperAdmin ? "yes" : "no"}</p>
    </div>
  );
};

// --- tests ---
describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("hydrates from localStorage on mount", () => {
    const fakeUser = { role: "client", account_status: "active" };
    localStorage.setItem("user", JSON.stringify(fakeUser));
    localStorage.setItem("authToken", "abc");
    localStorage.setItem("refreshToken", "xyz");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-role").textContent).toBe("client");
  });

  it("logs in an active user and redirects to dashboard", async () => {
    loginUser.mockResolvedValueOnce({
      token: "abc",
      refreshToken: "xyz",
      user: { role: "client", account_status: "active" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(screen.getByTestId("user-role").textContent).toBe("client");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("logs in an inactive user and redirects to verify", async () => {
    loginUser.mockResolvedValueOnce({
      token: "abc",
      refreshToken: "xyz",
      user: { role: "client", account_status: "inactive" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/verify");
    });
  });

  it("logs in a suspended user and redirects to unauthorized", async () => {
    loginUser.mockResolvedValueOnce({
      token: "abc",
      refreshToken: "xyz",
      user: { role: "client", account_status: "suspended" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/unauthorized");
    });
  });

  it("logs out clears storage and redirects to login", async () => {
    logoutUser.mockResolvedValueOnce({});
    const fakeUser = { role: "admin", account_status: "active" };

    localStorage.setItem("user", JSON.stringify(fakeUser));
    localStorage.setItem("authToken", "abc");
    localStorage.setItem("refreshToken", "xyz");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Logout").click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("role helpers reflect user role correctly", async () => {
    loginUser.mockResolvedValueOnce({
      token: "abc",
      refreshToken: "xyz",
      user: { role: "super_admin", account_status: "active" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText("Login").click();

    await waitFor(() => {
      expect(screen.getByTestId("isClient").textContent).toBe("no");
      expect(screen.getByTestId("isAdmin").textContent).toBe("no");
      expect(screen.getByTestId("isSuperAdmin").textContent).toBe("yes");
    });
  });
});
