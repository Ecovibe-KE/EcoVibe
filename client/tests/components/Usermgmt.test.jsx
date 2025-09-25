
import React from 'react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from '../../src/components/admin/UserManagement';
import { fetchUsers, addUsers, editUsers, deleteUsers, blockUser, activateUser } from '../../src/api/services/usermanagement';
import { toast } from 'react-toastify';

// Mock API services
vi.mock('../../src/api/services/usermanagement', () => ({
  fetchUsers: vi.fn(),
  addUsers: vi.fn(),
  editUsers: vi.fn(),
  deleteUsers: vi.fn(),
  blockUser: vi.fn(),
  activateUser: vi.fn(),
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'Client', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'Admin', status: 'Suspended' },
];

describe('UserManagement Component', () => {
  beforeEach(() => {
    fetchUsers.mockResolvedValue(mockUsers);
    localStorage.setItem('userRole', 'SuperAdmin');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders loading state initially and then displays users', async () => {
    render(<UserManagement />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('handles error when fetching users', async () => {
    fetchUsers.mockRejectedValue(new Error('Failed to fetch'));
    render(<UserManagement />);
    await waitFor(() => {
      expect(screen.getByText('No users')).toBeInTheDocument();
    });
  });

  test('opens Add User modal and adds a new user', async () => {
    addUsers.mockResolvedValue({ id: 3, name: 'New User', email: 'new@example.com', phone: '1122334455', role: 'Client', status: 'Inactive' });
    render(<UserManagement />);
    fireEvent.click(screen.getByText('Add User'));

    // Wait for modal to appear
    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: '1122334455' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(addUsers).toHaveBeenCalledWith({ name: 'New User', email: 'new@example.com', phone: '1122334455', role: 'Client', status: 'Inactive' });
      expect(toast.success).toHaveBeenCalledWith('User added successfully.');
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
  });

  test('opens Edit User modal and updates a user', async () => {
    const updatedUser = { ...mockUsers[0], name: 'John Updated' };
    editUsers.mockResolvedValue(updatedUser);
    render(<UserManagement />);
    await waitFor(() => screen.getByText('John Doe'));

    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue('John Doe'), { target: { value: 'John Updated' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(editUsers).toHaveBeenCalledWith(1, { name: 'John Updated', email: 'john@example.com', phone: '1234567890' });
      expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
      expect(screen.getByText('John Updated')).toBeInTheDocument();
    });
  });

  test('opens Delete User modal and deletes a user', async () => {
    deleteUsers.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('John Doe'));

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(deleteUsers).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('User deleted Successfully!');
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  test('blocks an active user', async () => {
    blockUser.mockResolvedValue({});
    render(<UserManagement />);
    await waitFor(() => screen.getByText('John Doe'));

    fireEvent.click(screen.getAllByText('Block')[0]);

    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Block'));

    await waitFor(() => {
      expect(blockUser).toHaveBeenCalledWith(1, 'Suspended');
      expect(toast.success).toHaveBeenCalledWith('User Blocked Successfully!');
    });
  });

  test('unblocks a suspended user', async () => {
    activateUser.mockResolvedValue({
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      role: 'Admin',
      status: 'Suspended',
    });
     fetchUsers.mockResolvedValue(mockUsers);
    render(<UserManagement />);
    await waitFor(() => screen.getByText('Jane Smith'));

    fireEvent.click(screen.getByText('Unblock'));

    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Unblock'));

    await waitFor(() => {
      expect(activateUser).toHaveBeenCalledWith(2);
      expect(toast.success).toHaveBeenCalledWith('User Unblocked Successfully!');
    });
  });

  test('pagination works correctly', async () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: '1234567890',
      role: 'Client',
      status: 'Active',
    }));
    fetchUsers.mockResolvedValue(manyUsers);
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.queryByText('User 11')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.queryByText('User 1')).not.toBeInTheDocument();
      expect(screen.getByText('User 11')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 15')).toBeInTheDocument();
    });
  });
});
