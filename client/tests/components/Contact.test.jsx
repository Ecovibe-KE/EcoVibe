// tests/components/Contact.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "../../src/components/Contact";
import { sendContactMessage } from "../../src/api/services/contact";
import { toast } from "react-toastify";

// Mock the API with the correct function name
vi.mock("../../src/api/services/contact", () => ({
    sendContactMessage: vi.fn(),
}));

// Mock toast
vi.mock("react-toastify", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock react-bootstrap components
vi.mock("react-bootstrap", () => ({
    Container: ({ children, ...props }) => <div {...props}>{children}</div>,
    Row: ({ children, ...props }) => <div {...props}>{children}</div>,
    Col: ({ children, ...props }) => <div {...props}>{children}</div>,
    Card: ({ children, ...props }) => <div {...props}>{children}</div>,
    Form: ({ children, ...props }) => <form {...props}>{children}</form>,
    Button: ({ children, onClick, ...props }) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

// Mock reCAPTCHA - FIXED: Properly mock the ref and siteKey behavior
vi.mock("react-google-recaptcha", () => ({
    default: vi.fn(({ sitekey, ref }) => {
        // Store the ref so we can reset it in tests
        if (ref && typeof ref === 'object') {
            ref.current = {
                reset: vi.fn(),
                execute: vi.fn(),
                getValue: vi.fn(() => "test-token"),
            };
        }
        return <div data-testid="recaptcha-mock">reCAPTCHA Mock</div>;
    }),
}));

// Mock environment variables
vi.mock("../utils/env", () => ({
    VITE_REACT_APP_RECAPTCHA_SITE_KEY: "test-site-key"
}));

describe("Contact Component", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the environment variable
        vi.stubEnv('VITE_REACT_APP_RECAPTCHA_SITE_KEY', 'test-site-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("renders contact form and information", () => {
        render(<Contact />);

        // Check main heading
        expect(screen.getByText(/Ready to Transform Your way with ECK?/i)).toBeInTheDocument();

        // Check form elements
        expect(screen.getByText(/Send Us a Message/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Industry/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/How can we help you?/i)).toBeInTheDocument();
        expect(screen.getByText(/Send Message/i)).toBeInTheDocument();

        // Check contact information - be more specific to avoid multiple matches
        expect(screen.getByRole('heading', { name: /Get in touch/i })).toBeInTheDocument();
        expect(screen.getByText(/Multiple ways you can connect with us/i)).toBeInTheDocument();
        expect(screen.getByText(/info@ecovibe.co.ke/i)).toBeInTheDocument();
        expect(screen.getByText(/Mon - Fri: 8:00 AM - 6:00 PM/i)).toBeInTheDocument();

        // Check Africa image
        const africaImage = screen.getByAltText(/Africa image/i);
        expect(africaImage).toBeInTheDocument();
        expect(africaImage).toHaveAttribute("src", "/src/assets/Africa.jpg");
    });

    it("handles form input changes", async () => {
        render(<Contact />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const phoneInput = screen.getByLabelText(/Phone Number/i);
        const messageInput = screen.getByLabelText(/How can we help you?/i);

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@example.com");
        await user.type(phoneInput, "+1234567890");
        await user.type(messageInput, "Test message");

        expect(nameInput).toHaveValue("John Doe");
        expect(emailInput).toHaveValue("john@example.com");
        expect(phoneInput).toHaveValue("+1234567890");
        expect(messageInput).toHaveValue("Test message");
    });

    it("handles industry selection", async () => {
        render(<Contact />);

        const industrySelect = screen.getByLabelText(/Industry/i);

        await user.selectOptions(industrySelect, "technology");

        expect(industrySelect).toHaveValue("technology");
    });

    it("submits form successfully when reCAPTCHA is configured", async () => {
        // Mock the API with the correct function name and response
        sendContactMessage.mockResolvedValueOnce({
            status: "success",
            message: "Thank you for your message! We will get back to you within 24 hours.",
        });

        render(<Contact />);

        // Wait for reCAPTCHA to load (component useEffect runs)
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        // Fill form
        await user.type(screen.getByLabelText(/Name/i), "John Doe");
        await user.type(screen.getByLabelText(/Email/i), "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(screen.getByLabelText(/Phone Number/i), "+1234567890");
        await user.type(screen.getByLabelText(/How can we help you?/i), "Test message");

        // Submit form
        await user.click(screen.getByText(/Send Message/i));

        await waitFor(() => {
            expect(sendContactMessage).toHaveBeenCalledWith({
                name: "John Doe",
                industry: "technology",
                email: "john@example.com",
                phone: "+1234567890",
                message: "Test message"
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Thank you for your message! We will get back to you within 24 hours.");
        });
    });

    it("prevents form submission when reCAPTCHA is not configured", async () => {
        // Remove the environment variable for this test
        vi.unstubAllEnvs();
        vi.stubEnv('VITE_REACT_APP_RECAPTCHA_SITE_KEY', '');

        render(<Contact />);

        // Wait for the warning message to appear
        await waitFor(() => {
            expect(screen.getByText(/reCAPTCHA is not configured/)).toBeInTheDocument();
        });

        // Fill form
        await user.type(screen.getByLabelText(/Name/i), "John Doe");
        await user.type(screen.getByLabelText(/Email/i), "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(screen.getByLabelText(/How can we help you?/i), "Test message");

        // Submit form
        await user.click(screen.getByText(/Send Message/i));

        // API should not be called because reCAPTCHA is not configured
        await waitFor(() => {
            expect(sendContactMessage).not.toHaveBeenCalled();
        });

        // Error toast should be shown
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("reCAPTCHA not loaded. Please refresh the page and try again.");
        });
    });

    it("handles form submission error", async () => {
        sendContactMessage.mockRejectedValueOnce(new Error("API Error"));

        render(<Contact />);

        // Wait for reCAPTCHA to load
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        // Fill required fields
        await user.type(screen.getByLabelText(/Name/i), "John Doe");
        await user.type(screen.getByLabelText(/Email/i), "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(screen.getByLabelText(/How can we help you?/i), "Test message");

        // Submit form
        await user.click(screen.getByText(/Send Message/i));

        await waitFor(() => {
            expect(sendContactMessage).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("API Error");
        });
    });

    it("handles API error response", async () => {
        sendContactMessage.mockRejectedValueOnce(new Error("Validation failed"));

        render(<Contact />);

        // Wait for reCAPTCHA to load
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        // Fill required fields
        await user.type(screen.getByLabelText(/Name/i), "John Doe");
        await user.type(screen.getByLabelText(/Email/i), "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(screen.getByLabelText(/How can we help you?/i), "Test message");

        // Submit form
        await user.click(screen.getByText(/Send Message/i));

        await waitFor(() => {
            expect(sendContactMessage).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Validation failed");
        });
    });

    it("validates required fields", async () => {
        render(<Contact />);

        // Wait for reCAPTCHA to load
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        // Try to submit without filling required fields
        await user.click(screen.getByText(/Send Message/i));

        // The form should prevent submission and show browser validation
        // We can check that the API was not called
        expect(sendContactMessage).not.toHaveBeenCalled();
    });
});

// Additional tests for the current component structure
describe("Contact Component Structure Tests", () => {
    beforeEach(() => {
        vi.stubEnv('VITE_REACT_APP_RECAPTCHA_SITE_KEY', 'test-site-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("renders all form fields with correct attributes", () => {
        render(<Contact />);

        // Check name field
        const nameInput = screen.getByLabelText(/Name/i);
        expect(nameInput).toHaveAttribute("type", "text");
        expect(nameInput).toHaveAttribute("required");

        // Check email field
        const emailInput = screen.getByLabelText(/Email/i);
        expect(emailInput).toHaveAttribute("type", "email");
        expect(emailInput).toHaveAttribute("required");

        // Check industry field
        const industrySelect = screen.getByLabelText(/Industry/i);
        expect(industrySelect).toHaveAttribute("required");

        // Check phone field (optional)
        const phoneInput = screen.getByLabelText(/Phone Number/i);
        expect(phoneInput).toHaveAttribute("type", "tel");
        expect(phoneInput).not.toHaveAttribute("required");

        // Check message field
        const messageInput = screen.getByLabelText(/How can we help you?/i);
        expect(messageInput).toHaveAttribute("required");
    });

    it("renders contact information with correct links", () => {
        render(<Contact />);

        // Check email link
        const emailLink = screen.getByText(/info@ecovibe.co.ke/i).closest("a");
        expect(emailLink).toHaveAttribute("href", "mailto:info@ecovibe.co.ke");

        // Check business hours
        expect(screen.getByText(/Mon - Fri: 8:00 AM - 6:00 PM/i)).toBeInTheDocument();
    });

    it("renders the Africa image with correct attributes", () => {
        render(<Contact />);

        const africaImage = screen.getByAltText("Africa image");
        expect(africaImage).toBeInTheDocument();
        expect(africaImage).toHaveAttribute("src", "/src/assets/Africa.jpg");
    });
});

// Test the actual Contact component behavior more accurately
describe("Contact Component Integration Tests", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('VITE_REACT_APP_RECAPTCHA_SITE_KEY', 'test-site-key');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("should reset form after successful submission", async () => {
        sendContactMessage.mockResolvedValueOnce({
            status: "success",
            message: "Thank you for your message! We will get back to you within 24 hours.",
        });

        render(<Contact />);

        // Wait for reCAPTCHA to load
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const messageInput = screen.getByLabelText(/How can we help you?/i);

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(messageInput, "Test message");

        await user.click(screen.getByText(/Send Message/i));

        await waitFor(() => {
            expect(sendContactMessage).toHaveBeenCalled();
        });

        // Check if form is reset after successful submission
        await waitFor(() => {
            expect(nameInput).toHaveValue("");
            expect(emailInput).toHaveValue("");
            expect(messageInput).toHaveValue("");
        });
    });

    it("should handle form submission with only required fields", async () => {
        sendContactMessage.mockResolvedValueOnce({
            status: "success",
            message: "Thank you for your message! We will get back to you within 24 hours.",
        });

        render(<Contact />);

        // Wait for reCAPTCHA to load
        await waitFor(() => {
            expect(screen.queryByText(/reCAPTCHA is not configured/)).not.toBeInTheDocument();
        });

        // Fill only required fields (no phone)
        await user.type(screen.getByLabelText(/Name/i), "John Doe");
        await user.type(screen.getByLabelText(/Email/i), "john@example.com");
        await user.selectOptions(screen.getByLabelText(/Industry/i), "technology");
        await user.type(screen.getByLabelText(/How can we help you?/i), "Test message");

        await user.click(screen.getByText(/Send Message/i));

        await waitFor(() => {
            expect(sendContactMessage).toHaveBeenCalledWith({
                name: "John Doe",
                industry: "technology",
                email: "john@example.com",
                phone: "",
                message: "Test message"
            });
        });
    });
});