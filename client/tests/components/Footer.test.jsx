// client/tests/components/Footer.test.jsx
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../src/components/Footer.jsx";

describe("Footer component", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders landing page footer content", () => {
    render(
      <MemoryRouter>
        <Footer pageType="landing" />
      </MemoryRouter>
    );

    // Logo
    const logo = screen.getByAltText(/EcoVibe Logo/i);
    expect(logo).toBeInTheDocument();

    // Nav links
    expect(screen.getByText(/Quick Links/i)).toBeInTheDocument();
    expect(screen.getByText(/Blogs/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();

    // Social icons links
    const instaLink = screen.getByRole("link", {
      name: /instagram/i,
    });

    expect(instaLink).toHaveAttribute("target", "_blank");
    expect(instaLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(instaLink).toHaveAttribute("rel", expect.stringContaining("noreferrer"));

    const linkedinLink = screen.getByRole("link", {
      name: /linkedin/i,
    });
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(linkedinLink).toHaveAttribute("rel", expect.stringContaining("noreferrer"));

    expect(instaLink).toHaveAttribute(
      "href",
      "https://www.instagram.com/ecovibekenya/"
    );
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/ecovibe-kenya/"
    );

    // Legal links
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms and Conditions/i)).toBeInTheDocument();

    // Copyright
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} EcoVibe Kenya. All rights reserved.`)
    ).toBeInTheDocument();
  });

  test("does not render footer for non-landing page types", () => {
    render(
      <MemoryRouter>
        <Footer pageType="dashboard" />
      </MemoryRouter>
    );

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  //  Renders for all supported pageTypes
  test("renders footer for all allowed page types", () => {
    const pageTypes = ["landing", "blog", "services", "about", "contact"];

    pageTypes.forEach((type) => {
      render(
        <MemoryRouter>
          <Footer pageType={type} />
        </MemoryRouter>
      );

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      cleanup(); // reset DOM between renders
    });
  });

  //  Checks all navigation link hrefs
  test("renders nav links with correct href attributes", () => {
    render(
      <MemoryRouter>
        <Footer pageType="landing" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /Quick Links/i })).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getByRole("link", { name: /Blogs/i })).toHaveAttribute(
      "href",
      "/blog"
    );
    expect(screen.getByRole("link", { name: /Login/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute(
      "href",
      "/privacy-policy"
    );
    expect(
      screen.getByRole("link", { name: /Terms and Conditions/i })
    ).toHaveAttribute("href", "/terms");
  });
});
