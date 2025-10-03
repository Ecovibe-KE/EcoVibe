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

    test("renders How We Use Your Information section with list items", () => {
        const useHeading = screen.getByRole('heading', {name: /How We Use Your Information/i, level: 2});
        expect(useHeading).toBeInTheDocument();

        const useSection = useHeading.closest('section');
        const listItems = useSection.querySelectorAll('li');
        expect(listItems).toHaveLength(4);

        expect(screen.getByText(/Provide and improve our consultancy services/i)).toBeInTheDocument();
    });

    test("renders How We Share Your Information section with list items", () => {
        const shareHeading = screen.getByRole('heading', {name: /How We Share Your Information/i, level: 2});
        expect(shareHeading).toBeInTheDocument();

        const shareSection = shareHeading.closest('section');
        const listItems = shareSection.querySelectorAll('li');
        expect(listItems).toHaveLength(2);

        expect(screen.getByText(/Service providers who assist us/i)).toBeInTheDocument();
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

    test("renders Your Rights section with list items and email link", () => {
        const rightsHeading = screen.getByRole('heading', {name: /Your Rights/i, level: 2});
        expect(rightsHeading).toBeInTheDocument();

        const rightsSection = rightsHeading.closest('section');
        const listItems = rightsSection.querySelectorAll('li');
        expect(listItems).toHaveLength(3);

        expect(screen.getByText(/Access, correct, or delete/i)).toBeInTheDocument();

        // Get the first email link (the one in Your Rights section)
        const emailLinks = screen.getAllByText(/info@ecovibe.co.ke/i);
        expect(emailLinks[0]).toHaveAttribute("href", "mailto:info@ecovibe.co.ke");
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

    test("matches snapshot", () => {
        const {asFragment} = render(
            <BrowserRouter>
                <PrivacyPolicy/>
            </BrowserRouter>
        );
        expect(asFragment()).toMatchSnapshot();
    });
});