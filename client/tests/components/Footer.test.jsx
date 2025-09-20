// client/tests/components/Footer.test.jsx

import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../../src/components/Footer.jsx"; // ✅ fixed path

describe("Footer component", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders landing page footer content", () => {
    render(<Footer pageType="landing" />);
    expect(screen.getByText(/EcoVibe Kenya/i)).toBeInTheDocument();
  });

  test("does not render footer for unknown pageType", () => {
    render(<Footer pageType="client" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });

  test('does not render footer for pageType="unknown"', () => {
    render(<Footer pageType="unknown" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });
});
