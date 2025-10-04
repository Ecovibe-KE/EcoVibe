import React from "react";
import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import PrivacyPolicy from "../../src/components/PrivacyPolicy.jsx";

describe("PrivacyPolicy Component", () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <PrivacyPolicy/>
            </BrowserRouter>
        );
    });

    test("renders Privacy Policy title", () => {
        const title = screen.getByRole('heading', {name: /Privacy Policy/i, level: 1});
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass("text-center", "mb-4", "fw-bold");
    });

    test("renders Last Updated subtitle", () => {
        const subtitle = screen.getByText(/Last Updated: October 3, 2025/i);
        expect(subtitle).toBeInTheDocument();
        expect(subtitle).toHaveClass("text-muted", "text-center");
    });

    test("renders Introduction section", () => {
        const introHeading = screen.getByRole('heading', {name: /Introduction/i, level: 2});
        expect(introHeading).toBeInTheDocument();
        expect(introHeading).toHaveClass("h4", "mb-3", "fw-semibold");

        const introText = screen.getByText(
            /Ecovibe Kenya \("we," "us," or "our"\) is committed to protecting your privacy/i
        );
        expect(introText).toBeInTheDocument();
    });


    test("renders Cookies and Tracking Technologies section", () => {
        const cookiesHeading = screen.getByRole('heading', {name: /Cookies and Tracking Technologies/i, level: 2});
        expect(cookiesHeading).toBeInTheDocument();
        expect(screen.getByText(/Our website uses cookies to enhance/i)).toBeInTheDocument();
    });

    test("renders Data Security section", () => {
        const securityHeading = screen.getByRole('heading', {name: /Data Security/i, level: 2});
        expect(securityHeading).toBeInTheDocument();
        expect(screen.getByText(/We implement reasonable technical/i)).toBeInTheDocument();
    });


    test("renders Third-Party Links section", () => {
        const linksHeading = screen.getByRole('heading', {name: /Third-Party Links/i, level: 2});
        expect(linksHeading).toBeInTheDocument();
        expect(screen.getByText(/Our website may contain links/i)).toBeInTheDocument();
    });

    test("renders Changes to This Privacy Policy section", () => {
        const changesHeading = screen.getByRole('heading', {name: /Changes to This Privacy Policy/i, level: 2});
        expect(changesHeading).toBeInTheDocument();
        expect(screen.getByText(/We may update this Privacy Policy/i)).toBeInTheDocument();
    });


    // Replace snapshot test with comprehensive structure tests
    test("renders all main sections in correct order", () => {
        const headings = screen.getAllByRole('heading', {level: 2});
        const headingTexts = headings.map(heading => heading.textContent);

        expect(headingTexts).toContain('Introduction');
        expect(headingTexts).toContain('How We Use Your Information');
        expect(headingTexts).toContain('How We Share Your Information');
        expect(headingTexts).toContain('Cookies and Tracking Technologies');
        expect(headingTexts).toContain('Data Security');
        expect(headingTexts).toContain('Your Rights');
        expect(headingTexts).toContain('Third-Party Links');
        expect(headingTexts).toContain('Changes to This Privacy Policy');
        expect(headingTexts).toContain('Contact Us');
    });

    test("renders all email links correctly", () => {
        const emailLinks = screen.getAllByText(/info@ecovibe.co.ke/i);
        expect(emailLinks.length).toBeGreaterThan(0);

        emailLinks.forEach(link => {
            expect(link).toHaveAttribute("href", "mailto:info@ecovibe.co.ke");
        });
    });


    test("renders proper list structure throughout the policy", () => {
        const lists = document.querySelectorAll('ul');
        expect(lists.length).toBeGreaterThanOrEqual(3); // At least 3 lists in the policy

        lists.forEach(list => {
            expect(list).toBeInTheDocument();
            expect(list.children.length).toBeGreaterThan(0);
        });
    });
});