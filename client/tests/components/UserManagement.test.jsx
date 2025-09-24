import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import UserManagement from '../../src/components/admin/UserManagement';

// Mock the dependencies using vi.hoisted to handle the hoisting issue
const {
  mockFetchUsers,
  mockAddUsers,
  mockEditUsers,
  mockBlockUser,
  mockActivateUser,
  mockDeleteUsers,
  mockToastSuccess,
  mockToastError,
  mockValidateEmail,
  mockValidateName,
  mockValidatePhone
} = vi.hoisted(() => ({
  mockFetchUsers: vi.fn(),
  mockAddUsers: vi.fn(),
  mockEditUsers: vi.fn(),
  mockBlockUser: vi.fn(),
  mockActivateUser: vi.fn(),
  mockDeleteUsers: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockValidateEmail: vi.fn(),
  mockValidateName: vi.fn(),
  mockValidatePhone: vi.fn()
}));

vi.mock('../../src/api/services/usermanagement', () => ({
  fetchUsers: mockFetchUsers,
  addUsers: mockAddUsers,
  editUsers: mockEditUsers,
  blockUser: mockBlockUser,
  activateUser: mockActivateUser,
  deleteUsers: mockDeleteUsers,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock('../../src/utils/Validations', () => ({
  validateEmail: mockValidateEmail,
  validateName: mockValidateName,
  validatePhone: mockValidatePhone,
}));

vi.mock('../../src/components/admin/user_management/AddUserModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="add-user-modal">Add User Modal</div> : null,
}));

vi.mock('../../src/components/admin/user_management/EditUserModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="edit-user-modal">Edit User Modal</div> : null,
}));

vi.mock('../../src/components/admin/user_management/DeleteUserModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="delete-user-modal">Delete User Modal</div> : null,
}));

vi.mock('../../src/components/admin/user_management/ViewUserModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="view-user-modal">View User Modal</div> : null,
}));

vi.mock('../../src/components/admin/user_management/BlockUserModal', () => ({
  default: ({ visible }) => visible ? <div data-testid="block-user-modal">Block User Modal</div> : null,
}));

vi.mock('../../src/components/admin/user_management/StatusInfo', () => ({
  default: ({ status }) => <span data-testid="status-info">{status}</span>,
}));

// Fixed Button mock - simpler approach
vi.mock('../../src/utils/Button', () => ({
  default: vi.fn(({ label, onClick, action, disabled }) => (
    <button
      data-testid={`button-${action || label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )),
}));

describe('UserManagement Component', () => {
  let localStorageMock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
    localStorageMock.getItem.mockReturnValue('Admin'); // Default role
  });

  test('renders component with loading state initially', async () => {
    // Mock fetchUsers to delay resolution to test loading state
    mockFetchUsers.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve([]), 100);
    }));

    render(<UserManagement />);

    // Check if main title is rendered
    expect(screen.getByText('User Management')).toBeInTheDocument();

    // Check if loading spinner is shown initially
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for loading to complete and check loading spinner disappears
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  test('renders component with users after loading', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        role: 'Client',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        role: 'Admin',
        status: 'Suspended'
      }
    ];

    mockFetchUsers.mockResolvedValue(mockUsers);

    render(<UserManagement />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if all user data is rendered correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('098-765-4321')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    // Debug: Log what buttons are actually rendered
    console.log('All buttons:', screen.getAllByRole('button').map(btn => btn.textContent));

    // Check if action buttons are rendered - use text content instead of testid
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  test('displays empty state when no users are available', async () => {
    mockFetchUsers.mockResolvedValue([]);

    render(<UserManagement />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('No users')).toBeInTheDocument();
    });

    expect(screen.getByText('No users')).toBeInTheDocument();
  });
});