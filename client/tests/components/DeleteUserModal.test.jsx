import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import DeleteUserModal from '../../src/components/admin/DeleteUserModal.jsx';

// Mock the Button component
vi.mock('react-bootstrap/Button', () => ({
  default: function MockButton({ children, onClick, className, type = 'button' }) {
    const testId = className.includes('btn-danger') ? 'delete-button' : 'cancel-button';

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

describe('DeleteUserModal', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    role: 'Client'
  };

  const defaultProps = {
    visible: true,
    user: defaultUser,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not render when visible is false', () => {
    const props = { ...defaultProps, visible: false };
    const { container } = render(<DeleteUserModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  test('should not render when user is null', () => {
    const props = { ...defaultProps, user: null };
    const { container } = render(<DeleteUserModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  test('should render delete modal with correct content', () => {
    render(<DeleteUserModal {...defaultProps} />);

    // Check modal title
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();

    // Check action description
    expect(screen.getByText(/You are about to delete this user:/)).toBeInTheDocument();

    // Check user details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();

    // Check warning text
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel');
    expect(screen.getByTestId('delete-button')).toHaveTextContent('Delete');
    expect(screen.getByTestId('delete-button')).toHaveClass('btn-danger');
  });

  test('should display all user information correctly', () => {
    const user = {
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '987-654-3210',
      role: 'Admin'
    };

    const props = { ...defaultProps, user };
    render(<DeleteUserModal {...props} />);

    // Check all user details are displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    expect(screen.getByText('987-654-3210')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('should call onCancel when close button is clicked', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onCancel when Cancel button is clicked', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onConfirm when Delete button is clicked', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('should have correct accessibility attributes', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  test('should apply correct styling to modal backdrop', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('position-fixed', 'top-0', 'start-0', 'w-100', 'h-100');
    expect(modal).toHaveStyle('background: rgba(0,0,0,0.45)');
  });

  test('should apply correct styling to modal content', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const modalContent = screen.getByText('Confirm Deletion').closest('.bg-white');
    expect(modalContent).toBeInTheDocument();

    const userInfoBox = screen.getByText('John Doe').closest('.border');
    expect(userInfoBox).toHaveStyle('background: #f8fafc');
  });

  test('should render user details in correct format', () => {
    render(<DeleteUserModal {...defaultProps} />);

    // Check that labels and values are properly paired
    const nameLabel = screen.getByText('Name');
    const nameValue = screen.getByText('John Doe');
    expect(nameLabel.closest('div')).toContainElement(nameValue);

    const emailLabel = screen.getByText('Email');
    const emailValue = screen.getByText('john@example.com');
    expect(emailLabel.closest('div')).toContainElement(emailValue);

    const phoneLabel = screen.getByText('Phone');
    const phoneValue = screen.getByText('123-456-7890');
    expect(phoneLabel.closest('div')).toContainElement(phoneValue);

    const roleLabel = screen.getByText('Role');
    const roleValue = screen.getByText('Client');
    expect(roleLabel.closest('div')).toContainElement(roleValue);
  });

  test('should handle user with missing optional fields', () => {
    const userWithMinimalData = {
      name: 'Minimal User',
      email: 'minimal@example.com',
      phone: '', // Empty phone
      role: 'Client'
    };

    const props = { ...defaultProps, user: userWithMinimalData };
    render(<DeleteUserModal {...props} />);

    expect(screen.getByText('Minimal User')).toBeInTheDocument();
    expect(screen.getByText('minimal@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  test('should display warning message correctly', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const warningMessage = screen.getByText(/This action cannot be undone/);
    expect(warningMessage).toBeInTheDocument();
    expect(warningMessage).toHaveClass('mb-0');
  });

  test('should have correct modal dimensions', () => {
    render(<DeleteUserModal {...defaultProps} />);

    const modalContent = screen.getByText('Confirm Deletion').closest('.bg-white');
    expect(modalContent).toHaveStyle('borderRadius: 12px');
    expect(modalContent).toHaveStyle('width: 520px');
    expect(modalContent).toHaveStyle('max-width: 90%');
  });

  test('should render modal structure correctly', () => {
    render(<DeleteUserModal {...defaultProps} />);

    // Check header section
    const header = screen.getByText('Confirm Deletion').closest('.p-3.border-bottom');
    expect(header).toBeInTheDocument();

    // Check content section
    const content = screen.getByText(/You are about to delete this user/).closest('.p-3');
    expect(content).toBeInTheDocument();

    // Check footer section
    const footer = screen.getByText('Cancel').closest('.p-3.border-top');
    expect(footer).toBeInTheDocument();
  });
});