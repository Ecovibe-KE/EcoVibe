// tests/components/App.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/components/App";
import { AuthProvider } from "../../src/context/AuthContext";

// Mock analytics hook so we don’t depend on Firebase in tests
vi.mock("../../src/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    logEvent: vi.fn(),
  }),
}));

describe("App component", () => {
  test("logs screen_view event on mount", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Basic smoke test: homepage renders
    expect(
  screen.getByText(/leading the way in offering cutting-edge solutions for sustainable development/i)
).toBeInTheDocument();
  });
});
