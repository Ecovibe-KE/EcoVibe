import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import UserManagement from '../../src/components/admin/userManagement/UserManagement';
import { fetchUsers, addUsers, editUsers, blockUsers, deleteUsers } from '../../src/api/services/usermanagement';
import { toast } from 'react-toastify';

// Mock the API functions
vi.mock('../../src/api/services/usermanagement', () => ({
  fetchUsers: vi.fn(),
  addUsers: vi.fn(),
  editUsers: vi.fn(),
  blockUsers: vi.fn(),
  deleteUsers: vi.fn(),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child components with proper interaction handling
vi.mock('../../src/components/admin/userManagement/AddUserModal', () => ({
  default: ({ visible, onSave, onCancel }) =>
    visible ? (
      <div data-testid="add-modal">
        <button onClick={onSave}>Save Add</button>
        <button onClick={onCancel}>Cancel Add</button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/admin/userManagement/EditUserModal', () => ({
  default: ({ visible, onSave, onCancel }) =>
    visible ? (
      <div data-testid="edit-modal">
        <button onClick={onSave}>Save Edit</button>
        <button onClick={onCancel}>Cancel Edit</button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/admin/userManagement/ViewUserModal', () => ({
  default: ({ visible, onClose }) =>
    visible ? (
      <div data-testid="view-modal">
        <button onClick={onClose}>Close View</button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/admin/userManagement/BlockUserModal', () => ({
  default: ({ visible, type, onConfirm, onCancel }) =>
    visible ? (
      <div data-testid={`${type}-modal`}>
        <button onClick={onConfirm}>Confirm {type}</button>
        <button onClick={onCancel}>Cancel {type}</button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/admin/userManagement/DeleteUserModal', () => ({
  default: ({ visible, onConfirm, onCancel }) =>
    visible ? (
      <div data-testid="delete-modal">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onCancel}>Cancel Delete</button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/admin/userManagement/StatusInfo', () => ({
  default: ({ status }) => <span data-testid={`status-${status}`}>{status}</span>,
}));

vi.mock('../../src/utils/Button', () => ({
  default: ({ label, onClick, disabled, action }) => (
    <button
      data-testid={`button-${action}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('UserManagement Component', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'Client',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      role: 'Admin',
      status: 'Suspended',
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '+1112223333',
      role: 'Client',
      status: 'Inactive',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('Admin');
  });

  test('renders loading spinner initially', () => {
    fetchUsers.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UserManagement />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays users after successful fetch', async () => {
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(fetchUsers).toHaveBeenCalledTimes(1);
  });

  test('shows correct buttons based on user status', async () => {
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await screen.findByText('John Doe');

    // Use getAllByTestId to handle multiple buttons with same testid
    const blockButtons = screen.getAllByTestId('button-block');
    const unblockButton = screen.getByTestId('button-unblock');

    // Active user should have enabled block button
    const activeUserBlockButton = blockButtons.find(button => !button.disabled);
    expect(activeUserBlockButton).toBeInTheDocument();
    expect(activeUserBlockButton).toHaveTextContent('Block');

    // Suspended user should have unblock button
    expect(unblockButton).toBeInTheDocument();
    expect(unblockButton).toHaveTextContent('Unblock');

    // Inactive user should have disabled block button
    const inactiveUserBlockButton = blockButtons.find(button => button.disabled);
    expect(inactiveUserBlockButton).toBeInTheDocument();
    expect(inactiveUserBlockButton).toBeDisabled();
  });

  test('opens block modal when block button is clicked', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);
    await screen.findByText('John Doe');

    // Get the enabled block button (for active user)
    const blockButtons = screen.getAllByTestId('button-block');
    const activeBlockButton = blockButtons.find(button => !button.disabled);

    await user.click(activeBlockButton);

    expect(screen.getByTestId('block-modal')).toBeInTheDocument();
  });

  test('opens unblock modal when unblock button is clicked', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);
    await screen.findByText('Jane Smith');

    const unblockButton = screen.getByTestId('button-unblock');
    await user.click(unblockButton);

    expect(screen.getByTestId('unblock-modal')).toBeInTheDocument();
  });

  test('successfully unblocks a user', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);
    // Mock the unblock functionality - you might need to adjust this based on your API
    blockUsers.mockResolvedValue({});

    render(<UserManagement />);
    await screen.findByText('Jane Smith');

    // Click unblock button
    const unblockButton = screen.getByTestId('button-unblock');
    await user.click(unblockButton);

    // Confirm unblock in modal
    const confirmButton = screen.getByText('Confirm unblock');
    await user.click(confirmButton);

    await waitFor(() => {
      // Since you're using blockUsers for both, it should be called
      expect(blockUsers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('User Unblocked Successfully!');
    });
  });

  test('handles block error', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);
    blockUsers.mockRejectedValue(new Error('Block failed'));

    render(<UserManagement />);
    await screen.findByText('John Doe');

    // Click block button for active user
    const blockButtons = screen.getAllByTestId('button-block');
    const activeBlockButton = blockButtons.find(button => !button.disabled);
    await user.click(activeBlockButton);

    const confirmButton = screen.getByText('Confirm block');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to block user. Please try again.');
    });
  });

  test('displays "No users" when there are no users', async () => {
    fetchUsers.mockResolvedValue([]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('No users')).toBeInTheDocument();
    });
  });

  test('opens other modals correctly', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);
    await screen.findByText('John Doe');

    // Test view modal - use the first view button (user action, not the "View All" button)
    const viewButtons = screen.getAllByTestId('button-view');
    const userViewButton = viewButtons[1]; // Skip the "View All" button
    await user.click(userViewButton);
    expect(screen.getByTestId('view-modal')).toBeInTheDocument();

    // Close view modal
    const closeViewButton = screen.getByText('Close View');
    await user.click(closeViewButton);

  });

  test('handles pagination correctly', async () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `+123456789${i}`,
      role: 'Client',
      status: 'Active',
    }));

    fetchUsers.mockResolvedValue(manyUsers);

    render(<UserManagement />);
    await screen.findByText('User 1');

    // Should show 10 users initially (default page size)
    // Note: getAllByText will find all instances, so we need to be more specific
    const userNames = screen.getAllByText(/User \d+/);
    expect(userNames.length).toBe(10);

    // Test pagination next button
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    // Should show remaining users on second page
    await waitFor(() => {
      expect(screen.getByText('User 11')).toBeInTheDocument();
    });
  });

  test('cancels block operation', async () => {
    const user = userEvent.setup();
    fetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);
    await screen.findByText('John Doe');

    // Click block button for active user
    const blockButtons = screen.getAllByTestId('button-block');
    const activeBlockButton = blockButtons.find(button => !button.disabled);
    await user.click(activeBlockButton);

    // Cancel block in modal
    const cancelButton = screen.getByText('Cancel block');
    await user.click(cancelButton);

    expect(screen.queryByTestId('block-modal')).not.toBeInTheDocument();
    expect(blockUsers).not.toHaveBeenCalled();
  });
});