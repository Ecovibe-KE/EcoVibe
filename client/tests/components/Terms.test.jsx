import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Terms from "../../src/components/Terms.jsx";

describe("Terms Component", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Terms />
      </BrowserRouter>
    );
  });

  test("renders Terms and Conditions title", () => {
    const title = screen.getByRole('heading', { name: /Terms and Conditions/i, level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("text-center", "mb-4", "fw-bold");
  });

  test("renders Last Updated subtitle", () => {
    const subtitle = screen.getByText(/Last Updated: October 3, 2025/i);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("text-muted", "text-center");
  });

  test("renders Introduction section", () => {
    const introHeading = screen.getByRole('heading', { name: /Introduction/i, level: 2 });
    expect(introHeading).toBeInTheDocument();
    expect(introHeading).toHaveClass("h4", "mb-3", "fw-semibold");

    const introText = screen.getByText(
      /Welcome to Ecovibe Kenya \("we," "us," or "our"\)/i
    );
    expect(introText).toBeInTheDocument();
  });

  test("renders Use of Our Services section with list items", () => {
    const servicesHeading = screen.getByRole('heading', { name: /Use of Our Services/i, level: 2 });
    expect(servicesHeading).toBeInTheDocument();

    const servicesSection = servicesHeading.closest('section');
    const listItems = servicesSection.querySelectorAll('li');
    expect(listItems).toHaveLength(4);

    expect(screen.getByText(/Use our services in a way that violates any applicable laws/i)).toBeInTheDocument();
    expect(screen.getByText(/Attempt to gain unauthorized access to our systems/i)).toBeInTheDocument();
    expect(screen.getByText(/Use our website or services to distribute harmful content/i)).toBeInTheDocument();
    expect(screen.getByText(/Misrepresent your identity or provide false information/i)).toBeInTheDocument();
  });

  test("renders Consulting Services section", () => {
    const consultingHeading = screen.getByRole('heading', { name: /Consulting Services/i, level: 2 });
    expect(consultingHeading).toBeInTheDocument();

    const consultingText = screen.getByText(
      /Ecovibe Kenya provides sustainability consulting, including ESG compliance/i
    );
    expect(consultingText).toBeInTheDocument();
  });

  test("renders Intellectual Property section", () => {
    const ipHeading = screen.getByRole('heading', { name: /Intellectual Property/i, level: 2 });
    expect(ipHeading).toBeInTheDocument();

    const ipText = screen.getByText(
      /All content on our website, including text, images, logos, and educational materials/i
    );
    expect(ipText).toBeInTheDocument();
  });

  test("renders Limitation of Liability section", () => {
    const liabilityHeading = screen.getByRole('heading', { name: /Limitation of Liability/i, level: 2 });
    expect(liabilityHeading).toBeInTheDocument();

    const liabilityText = screen.getByText(
      /To the fullest extent permitted by law, Ecovibe Kenya shall not be liable/i
    );
    expect(liabilityText).toBeInTheDocument();
  });

  test("renders Indemnification section", () => {
    const indemnificationHeading = screen.getByRole('heading', { name: /Indemnification/i, level: 2 });
    expect(indemnificationHeading).toBeInTheDocument();

    const indemnificationText = screen.getByText(
      /You agree to indemnify and hold Ecovibe Kenya, its affiliates, and employees harmless/i
    );
    expect(indemnificationText).toBeInTheDocument();
  });

  test("renders Termination section", () => {
    const terminationHeading = screen.getByRole('heading', { name: /Termination/i, level: 2 });
    expect(terminationHeading).toBeInTheDocument();

    const terminationText = screen.getByText(
      /We reserve the right to terminate or suspend your access to our services/i
    );
    expect(terminationText).toBeInTheDocument();
  });

  test("renders Governing Law section", () => {
    const governingLawHeading = screen.getByRole('heading', { name: /Governing Law/i, level: 2 });
    expect(governingLawHeading).toBeInTheDocument();

    const governingLawText = screen.getByText(
      /These Terms are governed by the laws of Kenya/i
    );
    expect(governingLawText).toBeInTheDocument();
  });

  test("renders Changes to These Terms section", () => {
    const changesHeading = screen.getByRole('heading', { name: /Changes to These Terms/i, level: 2 });
    expect(changesHeading).toBeInTheDocument();

    const changesText = screen.getByText(
      /We may update these Terms from time to time to reflect changes in our practices/i
    );
    expect(changesText).toBeInTheDocument();
  });


  test("matches snapshot", () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Terms />
      </BrowserRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});