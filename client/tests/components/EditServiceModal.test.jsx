import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditServiceModal from '../../src/components/admin/EditServiceModal';

// Run test
// npm run test -- ./tests/components/EditServiceModal.test.jsx

// Only mock ServiceForm, not react-bootstrap
vi.mock('../../src/components/admin/ServiceForm', () => ({
    default: ({
        formTitle,
        formData,
        handleSubmit,
        handleChange,
        handleFileChange,
        fileInputRef,
        resetForm,
        previewUrl
    }) => (
        <div data-testid="service-form">
            <h3 data-testid="form-title">{formTitle}</h3>
            <div data-testid="form-data">{JSON.stringify(formData)}</div>
            <div data-testid="preview-url">{previewUrl}</div>
            <button
                data-testid="form-submit"
                onClick={handleSubmit}
            >
                Submit Form
            </button>
            <button
                data-testid="form-reset"
                onClick={resetForm}
            >
                Reset Form
            </button>
            <input
                data-testid="file-input"
                type="file"  // Add type="file" for upload testing
                onChange={handleFileChange}
                ref={fileInputRef}
            />
        </div>
    )
}));

describe('EditServiceModal', () => {
    const defaultProps = {
        showEditServiceModal: true,
        handleCloseEdit: vi.fn(),
        formData: {
            serviceTitle: 'Test Service',
            serviceDescription: 'Test Description',
            priceCurrency: 'KES',
            servicePrice: 1500,
            serviceDuration: { hours: 2, minutes: 30 },
            serviceImage: null,
            serviceStatus: 'active'
        },
        handleSubmit: vi.fn((e) => e.preventDefault()),
        handleChange: vi.fn(),
        handleFileChange: vi.fn(),
        fileInputRef: { current: null },
        previewUrl: 'test-preview.jpg',
        resetForm: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal when showEditServiceModal is true', () => {
        render(<EditServiceModal {...defaultProps} />);

        // The modal should be in the document
        expect(screen.getByTestId('service-form')).toBeInTheDocument();
        expect(screen.getByTestId('form-title')).toHaveTextContent('Edit Service');
    });

    it('does not render modal content when showEditServiceModal is false', () => {
        const props = {
            ...defaultProps,
            showEditServiceModal: false
        };

        render(<EditServiceModal {...props} />);

        // The ServiceForm should not be rendered
        expect(screen.queryByTestId('service-form')).not.toBeInTheDocument();
    });

    it('passes correct props to ServiceForm', () => {
        render(<EditServiceModal {...defaultProps} />);

        expect(screen.getByTestId('form-title')).toHaveTextContent('Edit Service');
        expect(screen.getByTestId('preview-url')).toHaveTextContent('test-preview.jpg');

        const formDataElement = screen.getByTestId('form-data');
        expect(formDataElement).toHaveTextContent('Test Service');
    });

    it('calls resetAfterClose which calls both handleCloseEdit and resetForm', async () => {
        const user = userEvent.setup();
        render(<EditServiceModal {...defaultProps} />);

        // Click the reset button in the ServiceForm (which uses resetAfterClose)
        const resetButton = screen.getByTestId('form-reset');
        await user.click(resetButton);

        // Both functions should be called
        expect(defaultProps.handleCloseEdit).toHaveBeenCalledTimes(1);
        expect(defaultProps.resetForm).toHaveBeenCalledTimes(1);
    });

    it('passes handleSubmit to ServiceForm correctly', async () => {
        const user = userEvent.setup();
        render(<EditServiceModal {...defaultProps} />);

        // Click the submit button in the ServiceForm
        const submitButton = screen.getByTestId('form-submit');
        await user.click(submitButton);

        expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('passes handleFileChange to ServiceForm correctly', async () => {
        const user = userEvent.setup();
        render(<EditServiceModal {...defaultProps} />);

        // Simulate file change
        const fileInput = screen.getByTestId('file-input');
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        expect(defaultProps.handleFileChange).toHaveBeenCalledTimes(1);
    });

    // Alternative test for handleFileChange using fireEvent if userEvent still has issues
    it('passes handleFileChange to ServiceForm correctly using fireEvent', () => {
        render(<EditServiceModal {...defaultProps} />);

        // Simulate file change using fireEvent
        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput);

        expect(defaultProps.handleFileChange).toHaveBeenCalledTimes(1);
    });
});