// tests/components/App.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/components/App";
import { AuthProvider } from "../../src/context/AuthContext";
import { vi } from "vitest";

// --- mock analytics hook with a shared spy ---
const logEventMock = vi.fn();
vi.mock("../../src/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    logEvent: logEventMock,
  }),
}));

describe("App component", () => {
  beforeEach(() => {
    logEventMock.mockClear();
  });

  test("logs screen_view event on mount", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Assert analytics logEvent was called with correct data
    expect(logEventMock).toHaveBeenCalled();
    expect(logEventMock).toHaveBeenCalledWith("screen_view", {
      firebase_screen: "/",
      firebase_screen_class: "App",
    });

    // Basic smoke test: homepage renders
    expect(
      screen.getByText(
        /leading the way in offering cutting-edge solutions for sustainable development/i
      )
    ).toBeInTheDocument();
  });
});
