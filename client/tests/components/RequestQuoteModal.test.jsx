import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import RequestQuoteModal from "../../src/components/RequestQuoteModal";
import * as quoteApi from "../../src/api/services/quote";
import {toast} from "react-toastify";
import React from "react";

// Mock react-toastify
vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
    ToastContainer: () => <div>ToastContainer</div>,
}));

// Mock react-google-recaptcha - SIMPLE VERSION without React references
vi.mock("react-google-recaptcha", () => {
    return {
        default: vi.fn().mockImplementation(({ref}) => {
            // Assign the ref methods directly
            if (ref) {
                ref.current = {
                    getValue: () => 'test-token',
                    reset: vi.fn(),
                };
            }
            return <div data-testid="recaptcha">reCAPTCHA Widget</div>;
        })
    };
});

// Mock Input component
vi.mock("../../src/utils/Input", () => {
    return {
        default: vi.fn().mockImplementation(({type, name, label, value, onChange, required, error}) => (
            <div>
                <label>{label}</label>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    data-testid={`input-${name}`}
                />
                {error && <div data-testid={`error-${name}`}>{error}</div>}
            </div>
        ))
    };
});

describe("RequestQuoteModal component", () => {
    const mockService = {
        id: 1,
        title: "Test Service",
    };
    const mockOnHide = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock environment variable
        vi.stubEnv("VITE_REACT_APP_RECAPTCHA_SITE_KEY", "mock-site-key");
    });

    it("renders modal when show is true", () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        expect(screen.getByText("Request a Quote")).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent("Service: Test Service");
        expect(screen.getByTestId("input-name")).toBeInTheDocument();
        expect(screen.getByTestId("input-email")).toBeInTheDocument();
        expect(screen.getByTestId("input-phone")).toBeInTheDocument();
        expect(screen.getByTestId("input-company")).toBeInTheDocument();
        expect(screen.getByTestId("recaptcha")).toBeInTheDocument();
        expect(screen.getByText("Submit Quote Request")).toBeInTheDocument();
    });

    it("does not render modal when show is false", () => {
        render(
            <RequestQuoteModal show={false} onHide={mockOnHide} service={mockService}/>
        );

        expect(screen.queryByText("Request a Quote")).not.toBeInTheDocument();
    });

    it("shows warning when reCAPTCHA site key is missing", () => {
        vi.stubEnv("VITE_REACT_APP_RECAPTCHA_SITE_KEY", "");
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        expect(screen.getByText("reCAPTCHA is not configured. Please contact Site Owner.")).toBeInTheDocument();
        expect(toast.error).toHaveBeenCalledWith("reCAPTCHA site key is missing. Please contact Site Owner.");
    });

    it("updates form fields on input", () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        const nameInput = screen.getByTestId("input-name");
        fireEvent.change(nameInput, {target: {value: "John Doe"}});
        expect(nameInput).toHaveValue("John Doe");

        const emailInput = screen.getByTestId("input-email");
        fireEvent.change(emailInput, {target: {value: "john@example.com"}});
        expect(emailInput).toHaveValue("john@example.com");
    });

    it("shows validation errors for empty required fields", async () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        const submitButton = screen.getByText("Submit Quote Request");

        const form = submitButton.closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText("Name is required")).toBeInTheDocument();
            expect(screen.getByText("Email is required")).toBeInTheDocument();
            expect(screen.getByText("Phone number is required")).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid email", async () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        const emailInput = screen.getByTestId("input-email");
        fireEvent.change(emailInput, {target: {value: "invalid-email"}});

        // Get the form element directly (it's the <form> tag without role="form")
        const form = screen.getByTestId("input-email").closest('form');
        fireEvent.submit(form);

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText("Email is invalid")).toBeInTheDocument();
        });
    });

    it("clears validation errors when user types", async () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        // Submit form to show errors
        const form = screen.getByTestId("input-name").closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText("Name is required")).toBeInTheDocument();
        });

        // Type in the name field to clear the error
        const nameInput = screen.getByTestId("input-name");
        fireEvent.change(nameInput, {target: {value: "John Doe"}});

        await waitFor(() => {
            expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
        });
    });


    it("submits form successfully and resets", async () => {
        vi.spyOn(quoteApi, "sendQuoteRequest").mockResolvedValue({status: "success"});
        const mockOnHide = vi.fn();

        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        fireEvent.change(screen.getByTestId("input-name"), {target: {value: "John Doe"}});
        fireEvent.change(screen.getByTestId("input-email"), {target: {value: "john@example.com"}});
        fireEvent.change(screen.getByTestId("input-phone"), {target: {value: "1234567890"}});
        fireEvent.change(screen.getByTestId("input-company"), {target: {value: "Test Corp"}});
        fireEvent.change(
            screen.getByPlaceholderText(/please provide details about your project/i),
            {target: {value: "Project details"}}
        );

        fireEvent.click(screen.getByText("Submit Quote Request"));

        await waitFor(() => {
            expect(quoteApi.sendQuoteRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "1234567890",
                    company: "Test Corp",
                    projectDetails: "Project details",
                    service: "Test Service", // Expect string instead of object
                    timestamp: expect.any(String)
                })
            );
            expect(toast.success).toHaveBeenCalledWith(
                "Thank you for your quote request! We will get back to you within 24 hours."
            );
            expect(mockOnHide).toHaveBeenCalled();
        });

        expect(screen.getByTestId("input-name")).toHaveValue("");
        expect(screen.getByTestId("input-email")).toHaveValue("");
        expect(screen.getByTestId("input-phone")).toHaveValue("");
        expect(screen.getByTestId("input-company")).toHaveValue("");
    });
    it("handles submission error", async () => {
        vi.spyOn(quoteApi, "sendQuoteRequest").mockRejectedValue(new Error("Submission failed"));

        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        fireEvent.change(screen.getByTestId("input-name"), {target: {value: "John Doe"}});
        fireEvent.change(screen.getByTestId("input-email"), {target: {value: "john@example.com"}});
        fireEvent.change(screen.getByTestId("input-phone"), {target: {value: "1234567890"}});

        // Use form submission
        const form = screen.getByTestId("input-name").closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            // Use the actual error message from the rejected promise
            expect(toast.error).toHaveBeenCalledWith("Submission failed");
            expect(mockOnHide).not.toHaveBeenCalled();
            expect(screen.getByTestId("input-name")).toHaveValue("John Doe"); // Form not reset
        });
    });

    it("closes modal and resets form on cancel", () => {
        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        fireEvent.change(screen.getByTestId("input-name"), {target: {value: "John Doe"}});
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);

        expect(mockOnHide).toHaveBeenCalled();
        expect(screen.getByTestId("input-name")).toHaveValue("");
    });

    // ADD THE DISABLES BUTTONS TEST HERE
    it("disables buttons during submission", async () => {
        vi.spyOn(quoteApi, "sendQuoteRequest").mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(
            <RequestQuoteModal show={true} onHide={mockOnHide} service={mockService}/>
        );

        fireEvent.change(screen.getByTestId("input-name"), {target: {value: "John Doe"}});
        fireEvent.change(screen.getByTestId("input-email"), {target: {value: "john@example.com"}});
        fireEvent.change(screen.getByTestId("input-phone"), {target: {value: "1234567890"}});

        const submitButton = screen.getByText("Submit Quote Request");
        fireEvent.submit(submitButton.form);

        // Wait for the buttons to become disabled
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(screen.getByText("Cancel")).toBeDisabled();
        });

        // Verify the submitting text is shown
        expect(submitButton).toHaveTextContent(/submitting/i);
    });
});