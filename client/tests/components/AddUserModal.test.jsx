// AddUserModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AddUserModal from '../../src/components/admin/AddUserModal.jsx';

// Mock the custom Input component
vi.mock('../../utils/Input.jsx', () => ({
  default: function MockInput({ type, label, name, value, onChange, error }) {
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

// Mock the custom Button component
vi.mock('react-bootstrap/Button', () => ({
  default: function MockButton({ children, onClick, className, type = 'button' }) {
    const testId = className && className.includes('btn-success') ? 'save-button' : 'cancel-button';

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

describe('AddUserModal', () => {
  const defaultProps = {
    visible: true,
    addForm: {
      name: 'Test Name',
      email: 'test@example.com',
      phone: '123-456-7890',
      role: 'Client'
    },
    addFieldErrors: {},
    currentUserRole: 'Client',
    addError: '',
    onChange: vi.fn(),
    onCancel: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not render when visible is false', () => {
    const props = { ...defaultProps, visible: false };
    const { container } = render(<AddUserModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  test('should display general error when addError is provided', () => {
    const props = {
      ...defaultProps,
      addError: 'Failed to create user. Please try again.'
    };

    render(<AddUserModal {...props} />);

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toHaveTextContent('Failed to create user. Please try again.');
    expect(errorAlert).toHaveClass('alert-warning');
  });


  test('should call onCancel when close button is clicked', () => {
    render(<AddUserModal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onCancel when Cancel button is clicked', () => {
    render(<AddUserModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onSave when Add User button is clicked', () => {
    render(<AddUserModal {...defaultProps} />);

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  test('should have correct accessibility attributes', () => {
    render(<AddUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');

    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  test('should apply correct styling to modal backdrop', () => {
    render(<AddUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('position-fixed', 'top-0', 'start-0', 'w-100', 'h-100');
    expect(modal).toHaveStyle('background: rgba(0,0,0,0.45)');
  });

  test('should not display general error when addError is empty', () => {
    render(<AddUserModal {...defaultProps} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});