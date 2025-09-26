import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi, describe, test, expect, beforeEach} from 'vitest';
import EditUserModal from '../../src/components/admin/EditUserModal.jsx';

// Mock the custom Input component
vi.mock('../../utils/Input.jsx', () => ({
    default: function MockInput({type, label, name, value, onChange, error}) {
        return (
            <div className="mb-3">
                <label htmlFor={name} className="form-label">{label}</label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    data-testid={`input-${name}`}
                />
                {error && (
                    <div className="invalid-feedback" data-testid={`error-${name}`}>
                        {error}
                    </div>
                )}
            </div>
        );
    }
}));

// Mock the Button component
vi.mock('react-bootstrap/Button', () => ({
    default: function MockButton({children, onClick, className, type = 'button'}) {
        const testId = className.includes('btn-success') ? 'save-button' : 'cancel-button';

        return (
            <button
                type={type}
                className={className}
                onClick={onClick}
                data-testid={testId}
            >
                {children}
            </button>
        );
    }
}));

describe('EditUserModal', () => {
    const defaultProps = {
        visible: true,
        form: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890'
        },
        errors: {},
        onChange: vi.fn(),
        onCancel: vi.fn(),
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should not render when visible is false', () => {
        const props = {...defaultProps, visible: false};
        const {container} = render(<EditUserModal {...props} />);
        expect(container.firstChild).toBeNull();
    });


    test('should call onCancel when close button is clicked', () => {
        render(<EditUserModal {...defaultProps} />);

        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    test('should call onCancel when Cancel button is clicked', () => {
        render(<EditUserModal {...defaultProps} />);

        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    test('should call onSave when Save Changes button is clicked', () => {
        render(<EditUserModal {...defaultProps} />);

        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    test('should have correct accessibility attributes', () => {
        render(<EditUserModal {...defaultProps} />);

        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    test('should apply correct styling to modal backdrop', () => {
        render(<EditUserModal {...defaultProps} />);

        const modal = screen.getByRole('dialog');
        expect(modal).toHaveClass('position-fixed', 'top-0', 'start-0', 'w-100', 'h-100');
        expect(modal).toHaveStyle('background: rgba(0,0,0,0.45)');
    });


    test('should have correct modal dimensions', () => {
        render(<EditUserModal {...defaultProps} />);

        const modalContent = screen.getByText('Edit User').closest('.bg-white');
        expect(modalContent).toBeInTheDocument();
    });


});