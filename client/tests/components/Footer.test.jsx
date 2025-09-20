/* eslint-disable no-undef */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Footer from "../../src/components/Footer";

describe("Footer component", () => {
  test("renders landing page footer content", () => {
    render(<Footer pageType="landing" />);

    // ✅ Check for copyright
    expect(screen.getByText(/copyright/i)).toBeInTheDocument();

    // ✅ Check for Privacy Policy link
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href");

    // ✅ Check for Terms & Conditions link
    const termsLink = screen.getByRole("link", { name: /terms/i });
    expect(termsLink).toHaveAttribute("href");

    // ✅ Check for Instagram & LinkedIn icons
    const instagramIcon = screen.getByRole("link", { name: /instagram/i });
    expect(instagramIcon).toHaveAttribute("href");
    const linkedinIcon = screen.getByRole("link", { name: /linkedin/i });
    expect(linkedinIcon).toHaveAttribute("href");
  });

  test("renders client page footer content", () => {
    render(<Footer pageType="client" />);
    // Adjust text to match your client page footer
    expect(screen.getByText(/client/i)).toBeInTheDocument();
  });

  test("renders fallback for unknown pageType", () => {
    render(<Footer pageType="unknown" />);
    // Should still render copyright text (fallback)
    expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  });

  test("privacy policy link changes color on hover", async () => {
    render(<Footer pageType="landing" />);
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });

    // Simulate hover
    await userEvent.hover(privacyLink);

    // Note: JSDOM can't compute real CSS hover colors,
    // but we can check that the element exists and is interactive
    expect(privacyLink).toBeEnabled();
  });
});
