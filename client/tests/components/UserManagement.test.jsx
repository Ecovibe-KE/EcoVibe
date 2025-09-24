import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';

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

// Mock all the API services
vi.mock('../../src/api/services/usermanagement', () => ({
  fetchUsers: mockFetchUsers,
  addUsers: mockAddUsers,
  editUsers: mockEditUsers,
  blockUser: mockBlockUser,
  activateUser: mockActivateUser,
  deleteUsers: mockDeleteUsers,
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

// Mock validations
vi.mock('../../src/utils/Validations', () => ({
  validateEmail: mockValidateEmail,
  validateName: mockValidateName,
  validatePhone: mockValidatePhone,
}));

// Mock Bootstrap CSS
vi.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}));

// Mock the entire user_management directory using absolute paths
vi.mock('../../src/components/admin/user_management/AddUserModal.jsx', () => ({
  default: vi.fn(({ visible }) =>
    visible ? <div data-testid="add-user-modal">Add User Modal</div> : null
  ),
}));

vi.mock('../../src/components/admin/user_management/EditUserModal.jsx', () => ({
  default: vi.fn(({ visible }) =>
    visible ? <div data-testid="edit-user-modal">Edit User Modal</div> : null
  ),
}));

vi.mock('../../src/components/admin/user_management/DeleteUserModal.jsx', () => ({
  default: vi.fn(({ visible }) =>
    visible ? <div data-testid="delete-user-modal">Delete User Modal</div> : null
  ),
}));

vi.mock('../../src/components/admin/user_management/ViewUserModal.jsx', () => ({
  default: vi.fn(({ visible }) =>
    visible ? <div data-testid="view-user-modal">View User Modal</div> : null
  ),
}));

vi.mock('../../src/components/admin/user_management/BlockUserModal.jsx', () => ({
  default: vi.fn(({ visible }) =>
    visible ? <div data-testid="block-user-modal">Block User Modal</div> : null
  ),
}));

vi.mock('../../src/components/admin/user_management/StatusInfo.jsx', () => ({
  default: vi.fn(({ status }) => <span data-testid="status-info">{status}</span>),
}));

// Mock Button component
vi.mock('../../src/utils/Button.jsx', () => ({
  default: vi.fn(({ label, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {label}
    </button>
  )),
}));

// Now import the component AFTER all mocks are set up
const UserManagement = await import('../../src/components/admin/UserManagement.jsx').then(module => module.default);

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

    // Setup validation mocks to return empty strings (no errors)
    mockValidateEmail.mockReturnValue('');
    mockValidateName.mockReturnValue('');
    mockValidatePhone.mockReturnValue('');
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

    // Check if action buttons are rendered by their text content
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