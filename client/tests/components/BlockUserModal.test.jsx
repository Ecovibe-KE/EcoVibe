import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import BlockUserModal from '../../src/components/admin/BlockUserModal.jsx';

// Mock the Button component
vi.mock('react-bootstrap/Button', () => ({
  default: function MockButton({ children, onClick, className, type = 'button' }) {
    const testId = className.includes('btn-danger') ? 'confirm-button' :
                   className.includes('btn-success') ? 'confirm-button' : 'cancel-button';

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

describe('BlockUserModal', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    role: 'Client',
    status: 'Active'
  };

  const defaultProps = {
    visible: true,
    user: defaultUser,
    type: 'block',
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not render when visible is false', () => {
    const props = { ...defaultProps, visible: false };
    const { container } = render(<BlockUserModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  test('should not render when user is null', () => {
    const props = { ...defaultProps, user: null };
    const { container } = render(<BlockUserModal {...props} />);
    expect(container.firstChild).toBeNull();
  });

  test('should render block modal with correct content', () => {
    render(<BlockUserModal {...defaultProps} />);

    // Check modal title
    expect(screen.getByText('Confirm Blocking')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();

    // Check action description
    expect(screen.getByText(/You are about to block this user:/)).toBeInTheDocument();

    // Check user details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Check consequence text for block action
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel');
    expect(screen.getByTestId('confirm-button')).toHaveTextContent('Block');
    expect(screen.getByTestId('confirm-button')).toHaveClass('btn-danger');
  });

  test('should render unblock modal with correct content when type is unblock', () => {
    const props = { ...defaultProps, type: 'unblock' };
    render(<BlockUserModal {...props} />);

    // Check modal title
    expect(screen.getByText('Confirm Unblocking')).toBeInTheDocument();

    // Check action description
    expect(screen.getByText(/You are about to unblock this user:/)).toBeInTheDocument();

    // Check consequence text for unblock action
    expect(screen.getByText(/This will restore the user's access/)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByTestId('confirm-button')).toHaveTextContent('Unblock');
    expect(screen.getByTestId('confirm-button')).toHaveClass('btn-success');
  });

  test('should display all user information correctly', () => {
    const user = {
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '987-654-3210',
      role: 'Admin',
      status: 'Inactive'
    };

    const props = { ...defaultProps, user };
    render(<BlockUserModal {...props} />);

    // Check all user details are displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    expect(screen.getByText('987-654-3210')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('should call onCancel when close button is clicked', () => {
    render(<BlockUserModal {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onCancel when Cancel button is clicked', () => {
    render(<BlockUserModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('should call onConfirm when Block button is clicked', () => {
    render(<BlockUserModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('should call onConfirm when Unblock button is clicked', () => {
    const props = { ...defaultProps, type: 'unblock' };
    render(<BlockUserModal {...props} />);

    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('should have correct accessibility attributes', () => {
    render(<BlockUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  test('should apply correct styling to modal backdrop', () => {
    render(<BlockUserModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('position-fixed', 'top-0', 'start-0', 'w-100', 'h-100');
    expect(modal).toHaveStyle('background: rgba(0,0,0,0.45)');
  });

  test('should apply correct styling to modal content', () => {
    render(<BlockUserModal {...defaultProps} />);

    const modalContent = screen.getByText('Confirm Blocking').closest('.bg-white');
    expect(modalContent).toBeInTheDocument();

    const userInfoBox = screen.getByText('John Doe').closest('.border');
    expect(userInfoBox).toHaveStyle('background: #f8fafc');
  });

  test('should render user details in correct format', () => {
    render(<BlockUserModal {...defaultProps} />);

    // Check that labels and values are properly paired
    const nameLabel = screen.getByText('Name');
    const nameValue = screen.getByText('John Doe');
    expect(nameLabel.closest('div')).toContainElement(nameValue);

    const emailLabel = screen.getByText('Email');
    const emailValue = screen.getByText('john@example.com');
    expect(emailLabel.closest('div')).toContainElement(emailValue);
  });

  test('should handle different user statuses correctly', () => {
    const userWithDifferentStatus = {
      ...defaultUser,
      status: 'Suspended'
    };

    const props = { ...defaultProps, user: userWithDifferentStatus };
    render(<BlockUserModal {...props} />);

    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });
});