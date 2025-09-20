/* eslint-disable no-undef */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Footer from "../../src/components/Footer";

describe("Footer component", () => {
  test("renders footer content on landing page", () => {
    render(<Footer pageType="landing" />);

    // ✅ Check for year and company name
    expect(
      screen.getByText(/ecoVibe kenya/i)
    ).toBeInTheDocument();

    // ✅ Check for Quick Links
    expect(screen.getByRole("link", { name: /quick links/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /blogs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();

    // ✅ Check for Privacy Policy & Terms links
    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms and conditions/i })).toBeInTheDocument();

    // ✅ Check social links
    expect(
      screen.getByRole("link", { name: /instagram/i, hidden: true })
    ).toHaveAttribute("href", expect.stringContaining("instagram"));
    expect(
      screen.getByRole("link", { name: /linkedin/i, hidden: true })
    ).toHaveAttribute("href", expect.stringContaining("linkedin"));
  });

  test("privacy policy link is interactive", async () => {
    render(<Footer pageType="landing" />);
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });

    // Simulate hover (just checks interactivity)
    await userEvent.hover(privacyLink);
    expect(privacyLink).toBeEnabled();
  });
});
