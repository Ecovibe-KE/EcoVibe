import React from 'react';
import {vi, describe, test, expect, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import UserManagement from '../../src/components/admin/UserManagement';
import {
    fetchUsers,
    addUsers,
    editUsers,
    deleteUsers,
    blockUser,
    activateUser
} from '../../src/api/services/usermanagement';
import {toast} from 'react-toastify';

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
    {id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'Client', status: 'Active'},
    {id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'Admin', status: 'Suspended'},
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
        render(<UserManagement/>);
        expect(screen.getByRole('status')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('handles error when fetching users', async () => {
        fetchUsers.mockRejectedValue(new Error('Failed to fetch'));
        render(<UserManagement/>);
        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });

    test('handles network error when fetching users', async () => {
        fetchUsers.mockRejectedValue(new Error('Network error'));
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });

    test('handles server error when fetching users', async () => {
        fetchUsers.mockRejectedValue(new Error('500 Internal Server Error'));
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });

    test('handles empty users list', async () => {
        fetchUsers.mockResolvedValue([]); // Empty array instead of error
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });

    test('handles unauthorized access error', async () => {
        fetchUsers.mockRejectedValue(new Error('401 Unauthorized'));
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });
    test('handles unauthorized access error', async () => {
        fetchUsers.mockRejectedValue(new Error('401 Unauthorized'));
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });
    test('handles timeout when fetching users', async () => {
        fetchUsers.mockRejectedValue(new Error('Request timeout'));
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });


    test('opens Edit User modal and updates a user', async () => {
        const updatedUser = {...mockUsers[0], name: 'John Updated'};
        editUsers.mockResolvedValue(updatedUser);
        render(<UserManagement/>);
        await waitFor(() => screen.getByText('John Doe'));

        fireEvent.click(screen.getAllByText('Edit')[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue('John Doe'), {target: {value: 'John Updated'}});
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Updated',
                email: 'john@example.com',
                phone: '1234567890'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
            expect(screen.getByText('John Updated')).toBeInTheDocument();
        });
    });

    test('opens Edit User modal and updates user email', async () => {
        const updatedUser = {...mockUsers[0], email: 'john.updated@example.com'};
        editUsers.mockResolvedValue(updatedUser);
        render(<UserManagement/>);

        await waitFor(() => screen.getByText('John Doe'));
        fireEvent.click(screen.getAllByText('Edit')[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue('john@example.com'), {
            target: {value: 'john.updated@example.com'}
        });
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Doe',
                email: 'john.updated@example.com',
                phone: '1234567890'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
            expect(screen.getByText('john.updated@example.com')).toBeInTheDocument();
        });
    });
    test('opens Edit User modal and updates user phone number', async () => {
        const updatedUser = {...mockUsers[0], phone: '9998887777'};
        editUsers.mockResolvedValue(updatedUser);
        render(<UserManagement/>);

        await waitFor(() => screen.getByText('John Doe'));
        fireEvent.click(screen.getAllByText('Edit')[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue('1234567890'), {
            target: {value: '9998887777'}
        });
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '9998887777'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
            expect(screen.getByText('9998887777')).toBeInTheDocument();
        });
    });
    test('opens Edit User modal and updates multiple fields', async () => {
        const updatedUser = {
            ...mockUsers[0],
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '5556667777'
        };
        editUsers.mockResolvedValue(updatedUser);
        render(<UserManagement/>);

        await waitFor(() => screen.getByText('John Doe'));
        fireEvent.click(screen.getAllByText('Edit')[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue('John Doe'), {
            target: {value: 'John Smith'}
        });
        fireEvent.change(screen.getByDisplayValue('john@example.com'), {
            target: {value: 'john.smith@example.com'}
        });
        fireEvent.change(screen.getByDisplayValue('1234567890'), {
            target: {value: '5556667777'}
        });

        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Smith',
                email: 'john.smith@example.com',
                phone: '5556667777'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
            expect(screen.getByText('John Smith')).toBeInTheDocument();
            expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
        });
    });
    test('opens Edit User modal for different user and updates', async () => {
        const updatedUser = {...mockUsers[1], name: 'Jane Updated'};
        editUsers.mockResolvedValue(updatedUser);
        render(<UserManagement/>);

        await waitFor(() => screen.getByText('Jane Smith'));
        fireEvent.click(screen.getAllByText('Edit')[1]); // Second Edit button for Jane

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue('Jane Smith'), {
            target: {value: 'Jane Updated'}
        });
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(2, {
                name: 'Jane Updated',
                email: 'jane@example.com',
                phone: '0987654321'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
            expect(screen.getByText('Jane Updated')).toBeInTheDocument();
        });
    });
    test('handles edit user with empty name field', async () => {
        editUsers.mockResolvedValue(mockUsers[0]); // Return original user if validation fails
        render(<UserManagement/>);

        await waitFor(() => screen.getByText('John Doe'));
        fireEvent.click(screen.getAllByText('Edit')[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Clear the name field
        fireEvent.change(screen.getByDisplayValue('John Doe'), {
            target: {value: ''}
        });
        fireEvent.click(screen.getByText('Save Changes'));

        // Should show validation error or not call API
        await waitFor(() => {
            // Either expect validation error message or no API call
            expect(editUsers).not.toHaveBeenCalled();
            // OR expect error message if your component shows validation errors
            // expect(screen.getByText('Name is required')).toBeInTheDocument();
        });
    });


    test('pagination works correctly', async () => {
        const manyUsers = Array.from({length: 15}, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            phone: '1234567890',
            role: 'Client',
            status: 'Active',
        }));
        fetchUsers.mockResolvedValue(manyUsers);
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
            expect(screen.queryByText('User 11')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Next'));

        await waitFor(() => {
            expect(screen.queryByText('User 1')).not.toBeInTheDocument();
            expect(screen.getByText('User 11')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByRole('combobox'), {target: {value: '20'}});

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
            expect(screen.getByText('User 15')).toBeInTheDocument();
        });
    });
});
