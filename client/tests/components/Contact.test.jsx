import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {vi, describe, test, expect, beforeEach, beforeAll, afterAll} from 'vitest';
import Contact from '../../src/components/Contact';

// Mock the dependencies
vi.mock('react-toastify', () => ({
    ToastContainer: () => <div data-testid="toast-container"/>,
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

vi.mock('react-google-recaptcha', () => {
    return {
        default: ({sitekey, ref}) => (
            <div data-testid="recaptcha" data-sitekey={sitekey}>
                reCAPTCHA Mock
            </div>
        )
    };
});

vi.mock('../utils/Button', () => {
    return ({children, ...props}) => (
        <button {...props}>{children}</button>
    );
});

vi.mock('../utils/Input', () => {
    return ({label, ...props}) => (
        <div>
            <label>{label}</label>
            <input {...props} />
        </div>
    );
});

// Mock environment variables
const originalEnv = import.meta.env;

beforeAll(() => {
    import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = 'test-site-key';
});

afterAll(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
});

describe('Contact Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders contact component with main heading', () => {
        render(<Contact/>);
        expect(screen.getByText(/Ready to Transform Your way with ECK?/i)).toBeInTheDocument();
    });

    test('renders contact component with sub title heading', () => {
        render(<Contact/>);
        expect(screen.getByText(/Let's discuss how our cutting-edge solutions can help your organization stay ahead in the evolving ESG landscape. Get in touch with our expert team today./i)).toBeInTheDocument();
    });

    test('renders all form fields', () => {
        render(<Contact/>);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Industry/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/How can we help you?/i)).toBeInTheDocument();
        expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Send Message/i})).toBeInTheDocument();
    });

    // test('renders contact information Heading', () => {
    //     render(<Contact/>);
    //     expect(screen.getByText(/Get in touch/i)).toBeInTheDocument();
    //     expect(screen.getByText(/Multiple ways you can connect with us/i)).toBeInTheDocument();
    // });

    test('renders contact information', () => {
        render(<Contact/>);

        expect(screen.getByText(/info@ecovibe.co.ke/i)).toBeInTheDocument();
        expect(screen.getByText(/The Mint Hub Offices/i)).toBeInTheDocument();
        expect(screen.getByText(/Mon - Fri: 8:00 AM - 6:00 PM/i)).toBeInTheDocument();
    });

    test('handles form input changes', async () => {
        render(<Contact/>);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const messageInput = screen.getByLabelText(/How can we help you?/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(messageInput, 'Test message');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(messageInput).toHaveValue('Test message');
    });

    test('handles industry selection change', async () => {
        render(<Contact/>);
        const user = userEvent.setup();

        const industrySelect = screen.getByLabelText(/Industry/i);
        await user.selectOptions(industrySelect, 'technology');

        expect(industrySelect).toHaveValue('technology');
    });
    test('shows validation errors for required fields', async () => {
        render(<Contact/>);
        const user = userEvent.setup();

        const submitButton = screen.getByRole('button', {name: /Send Message/i});
        await user.click(submitButton);

        // Check that form validation prevents submission
        expect(screen.getByLabelText(/Name/i)).toBeInvalid();
        expect(screen.getByLabelText(/Industry/i)).toBeInvalid();
        expect(screen.getByLabelText(/Email/i)).toBeInvalid();
        expect(screen.getByLabelText(/How can we help you?/i)).toBeInvalid();
    });

    test('displays warning when reCAPTCHA key is missing', async () => {
        // Temporarily remove the environment variable
        const originalKey = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;
        import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = '';

        render(<Contact/>);

        expect(screen.getByText(/reCAPTCHA is not configured/i)).toBeInTheDocument();

        // Restore the environment variable
        import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = originalKey;
    });
    test('renders Google Maps iframe', () => {
        render(<Contact/>);

        const iframe = screen.getByTitle('EcoVibe Kenya Location');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src');
        expect(iframe).toHaveAttribute('width', '100%');
        expect(iframe).toHaveAttribute('height', '400');
    });

});