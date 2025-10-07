import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../../src/tests/wrappers/ProtectedRoute";
import { useAuth } from "../../src/context/AuthContext";

// Mock the AuthContext hook
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock Navigate to observe redirects
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">Redirected to {to}</div>,
  };
});

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("Redirected to /login");
  });

  it("renders children when user is authenticated", () => {
    useAuth.mockReturnValue({ user: { name: "Caroline" } });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected")).toHaveTextContent("Protected Content");
  });
});
