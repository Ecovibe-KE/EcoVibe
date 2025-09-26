import React, {useMemo, useState} from 'react';
import {vi, describe, test, expect, beforeEach, afterEach, it} from 'vitest';
import {render, screen, fireEvent, waitFor, renderHook, act, within} from '@testing-library/react';
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

    test('handles page size change and pagination correctly', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Test page size change from 10 to 20
        const pageSizeSelect = screen.getByDisplayValue('10');
        fireEvent.change(pageSizeSelect, {target: {value: '20'}});

        expect(pageSizeSelect.value).toBe('20');

        // Test "View All" functionality
        const viewAllButton = screen.getByText('View All');
        fireEvent.click(viewAllButton);

        await waitFor(() => {
            expect(pageSizeSelect.value).toBe('All');
        });

        // Test pagination navigation
        const pageSizeSelectAgain = screen.getByDisplayValue('All');
        fireEvent.change(pageSizeSelectAgain, {target: {value: '10'}});

        // Wait for pagination to appear
        await waitFor(() => {
            expect(screen.getByText('Next')).toBeInTheDocument();
        });

        // Click next page
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
    });

    test('displays correct pagination info and handles page navigation', async () => {
        const manyUsers = Array.from({length: 15}, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            phone: `123456789${i}`,
            role: 'Client',
            status: 'Active'
        }));

        fetchUsers.mockResolvedValue(manyUsers);

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('User 1')).toBeInTheDocument();
        });

        // Should show correct pagination info
        expect(screen.getByText(/Showing 1 to 10 of 15 entries/)).toBeInTheDocument();

        // Go to page 2
        const page2Button = screen.getByText('2');
        fireEvent.click(page2Button);

        // Should update showing info
        await waitFor(() => {
            expect(screen.getByText(/Showing 11 to 15 of 15 entries/)).toBeInTheDocument();
        });
    });
    test('modals open when corresponding buttons are clicked', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const userRow = screen.getByText('John Doe').closest('tr');
        const buttons = within(userRow).getAllByRole('button');

        // Test each button opens a modal
        const actions = ['View', 'Edit', 'Block', 'Delete'];

        for (const action of actions) {
            const button = buttons.find(btn => btn.textContent === action);
            fireEvent.click(button);

            await waitFor(() => {
                expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
            });

            // Close modal before next test
            const modal = document.querySelector('[role="dialog"]');
            const closeButton = modal.querySelector('.btn-close') || within(modal).getByText(/Cancel|Close/);
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
            });
        }

        // Test Add User modal separately
        const addButton = screen.getByLabelText('Add User');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });
    });
    test('shows correct block/unblock buttons based on user status', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // John Doe is Active - should show Block button
        const johnRow = screen.getByText('John Doe').closest('tr');
        const johnButtons = within(johnRow).getAllByRole('button');
        expect(johnButtons.some(btn => btn.textContent === 'Block')).toBe(true);
        expect(johnButtons.some(btn => btn.textContent === 'Unblock')).toBe(false);

        // Jane Smith is Suspended - should show Unblock button
        const janeRow = screen.getByText('Jane Smith').closest('tr');
        const janeButtons = within(janeRow).getAllByRole('button');
        expect(janeButtons.some(btn => btn.textContent === 'Unblock')).toBe(true);
        expect(janeButtons.some(btn => btn.textContent === 'Block')).toBe(false);
    });

    test('opens add user modal when Add User button is clicked', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find and click the main Add User button
        const addUserButtons = screen.getAllByText('Add User');
        const mainAddButton = addUserButtons.find(button =>
            button.closest('button')?.getAttribute('aria-label') === 'Add User'
        );

        fireEvent.click(mainAddButton);

        // Verify modal opens by checking for modal-specific content
        await waitFor(() => {
            // Look for the modal title specifically
            const modalTitles = screen.getAllByText('Add User');
            const modalTitle = modalTitles.find(title =>
                title.tagName.toLowerCase() === 'h6'
            );
            expect(modalTitle).toBeInTheDocument();

            // Look for form labels that are specifically in the modal context
            const allEmailLabels = screen.getAllByText('Email');
            const modalEmailLabel = allEmailLabels.find(label =>
                label.className.includes('form-label')
            );
            expect(modalEmailLabel).toBeInTheDocument();
        });
    });

    test('successfully opens and interacts with add user modal', async () => {
        const newUser = {
            id: 3,
            name: 'New User',
            email: 'new@example.com',
            phone: '5555555555',
            role: 'Client',
            status: 'Inactive'
        };

        addUsers.mockResolvedValue(newUser);

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Click the Add User button
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        // Wait for modal to be in the DOM
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        // Now we can interact with the modal content
        const modalDialog = document.querySelector('[role="dialog"]');
        const modalContent = within(modalDialog);

        // Check modal title (h6 element)
        const modalTitles = modalContent.getAllByText('Add User');
        const modalTitle = modalTitles.find(element => element.tagName.toLowerCase() === 'h6');
        expect(modalTitle).toBeInTheDocument();

        // Find inputs within the modal
        const nameInput = modalContent.getByLabelText('Full name');
        const emailInput = modalContent.getByLabelText('Email');
        const phoneInput = modalContent.getByLabelText('Phone');

        // Fill out the form
        fireEvent.change(nameInput, {target: {value: 'New User'}});
        fireEvent.change(emailInput, {target: {value: 'new@example.com'}});
        fireEvent.change(phoneInput, {target: {value: '5555555555'}});

        // Click the Add User button in the modal (the button, not the title)
        const modalButtons = modalContent.getAllByText('Add User');
        const modalAddButton = modalButtons.find(button =>
            button.closest('button')?.className.includes('btn-success')
        );
        fireEvent.click(modalAddButton);

        await waitFor(() => {
            expect(addUsers).toHaveBeenCalledWith({
                name: 'New User',
                email: 'new@example.com',
                phone: '5555555555',
                role: 'Client',
                status: 'Inactive'
            });
            expect(toast.success).toHaveBeenCalledWith('User added successfully.');
        });
    });

    test('closes add user modal when cancel button is clicked', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Open the modal
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        // Wait for modal to appear
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        // Find and click the cancel button
        const modalDialog = document.querySelector('[role="dialog"]');
        const modalContent = within(modalDialog);
        const cancelButton = modalContent.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Modal should be closed
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
        });
    });

    test('successfully edits an existing user', async () => {
        const updatedUser = {
            id: 1,
            name: 'John Updated',
            email: 'johnupdated@example.com',
            phone: '9999999999',
            role: 'Client',
            status: 'Active'
        };

        editUsers.mockResolvedValue(updatedUser);

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find John Doe's row and click Edit button
        const johnRow = screen.getByText('John Doe').closest('tr');
        const editButton = within(johnRow).getByText('Edit');
        fireEvent.click(editButton);

        // Wait for edit modal to appear
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        // Edit the user information
        const modalDialog = document.querySelector('[role="dialog"]');
        const modalContent = within(modalDialog);

        // The edit form should be pre-filled with John Doe's data
        const nameInput = modalDialog.querySelector('input[name="name"]');
        expect(nameInput.value).toBe('John Doe');

        // Change the name
        fireEvent.change(nameInput, {target: {value: 'John Updated'}});

        // Find and click the save button
        const saveButton = modalContent.getByText('Save Changes');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Updated',
                email: 'john@example.com',
                phone: '1234567890'
            });
            expect(toast.success).toHaveBeenCalledWith('User Successfully edited');
        });
    });

    test('successfully deletes a user', async () => {
        deleteUsers.mockResolvedValue({});

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find John Doe's row and click Delete button
        const johnRow = screen.getByText('John Doe').closest('tr');
        const deleteButton = within(johnRow).getByText('Delete');
        fireEvent.click(deleteButton);

        // Wait for delete confirmation modal to appear
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        // Confirm deletion
        const modalDialog = document.querySelector('[role="dialog"]');
        const modalContent = within(modalDialog);

        const confirmButton = modalContent.getByText(/^(Confirm|Delete|Yes|OK)$/);
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(deleteUsers).toHaveBeenCalledWith(1);
            expect(toast.success).toHaveBeenCalledWith('User deleted Successfully!');
        });
    });

    test('successfully blocks and unblocks users', async () => {
        blockUser.mockResolvedValue({});
        activateUser.mockResolvedValue({});

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Block John Doe (who is Active)
        const johnRow = screen.getByText('John Doe').closest('tr');
        const blockButton = within(johnRow).getByText('Block');
        fireEvent.click(blockButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        const blockModal = document.querySelector('[role="dialog"]');
        const blockModalContent = within(blockModal);

        const confirmBlockButton = blockModalContent.getByText(/^(Confirm|Block|Yes|OK)$/);
        fireEvent.click(confirmBlockButton);

        await waitFor(() => {
            expect(blockUser).toHaveBeenCalledWith(1, "Suspended");
            expect(toast.success).toHaveBeenCalledWith('User Blocked Successfully!');
        });

        // Unblock Jane Smith (who is Suspended)
        const janeRow = screen.getByText('Jane Smith').closest('tr');
        const unblockButton = within(janeRow).getByText('Unblock');
        fireEvent.click(unblockButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        const unblockModal = document.querySelector('[role="dialog"]');
        const unblockModalContent = within(unblockModal);

        const confirmUnblockButton = unblockModalContent.getByText(/^(Confirm|Unblock|Yes|OK)$/);
        fireEvent.click(confirmUnblockButton);

        await waitFor(() => {
            expect(activateUser).toHaveBeenCalledWith(2);
            expect(toast.success).toHaveBeenCalledWith('User Unblocked Successfully!');
        });
    });

    test('successfully views user details', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Find John Doe's row and click View button
        const johnRow = screen.getByText('John Doe').closest('tr');
        const viewButton = within(johnRow).getByText('View');
        fireEvent.click(viewButton);

        // Wait for view modal to appear
        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        // Check that view modal contains user details
        const viewModal = document.querySelector('[role="dialog"]');
        const viewModalContent = within(viewModal);

        // The view modal should display user information
        const closeButton = viewModalContent.getByText(/^(Close|Cancel|OK)$/) ||
            viewModal.querySelector('.btn-close');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
        });
    });

    test('shows validation errors for invalid form data', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Open add user modal
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        const modalDialog = document.querySelector('[role="dialog"]');
        const modalContent = within(modalDialog);

        // Try to save with invalid data (empty fields)
        const addUserButtons = modalContent.getAllByText('Add User');
        const modalSaveButton = addUserButtons.find(button =>
            button.closest('button')?.className.includes('btn-success')
        );
        fireEvent.click(modalSaveButton);

        // Should show validation errors instead of making API call
        await waitFor(() => {
            expect(addUsers).not.toHaveBeenCalled();
        });
    });

    const mockUsers = [
        {id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'Client', status: 'Active'},
        {id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'Admin', status: 'Suspended'},
    ];

    test('handles empty users list correctly', async () => {
        fetchUsers.mockResolvedValue([]);

        render(<UserManagement/>);

        // Should show loading initially
        expect(screen.getByRole('status')).toBeInTheDocument();

        // After loading, should show "No users"
        await waitFor(() => {
            expect(screen.getByText('No users')).toBeInTheDocument();
        });
    });

    test('handles API errors gracefully', async () => {
        // Test add user error
        addUsers.mockRejectedValue(new Error('API Error'));

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Try to add a user
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        const modalDialog = document.querySelector('[role="dialog"]');

        // Fill out ALL required fields properly to pass validation
        const nameInput = modalDialog.querySelector('input[name="name"]');
        const emailInput = modalDialog.querySelector('input[name="email"]');
        const phoneInput = modalDialog.querySelector('input[name="phone"]');

        fireEvent.change(nameInput, {target: {value: 'Test User'}});
        fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
        fireEvent.change(phoneInput, {target: {value: '1234567890'}});

        // Now save - this should trigger the API call
        const addUserButtons = within(modalDialog).getAllByText('Add User');
        const modalSaveButton = addUserButtons.find(button =>
            button.closest('button')?.className.includes('btn-success')
        );

        fireEvent.click(modalSaveButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to add user. Please try again.');
        }, {timeout: 3000});
    });

    test('enforces role restrictions for non-SuperAdmin users', async () => {
        // Set role to Admin (not SuperAdmin)
        localStorage.setItem('userRole', 'Admin');

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Open add user modal
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        await waitFor(() => {
            expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
        });

        const modalDialog = document.querySelector('[role="dialog"]');

        // Check that Admin option is not available
        const roleSelect = modalDialog.querySelector('select[name="role"]');
        const options = Array.from(roleSelect.querySelectorAll('option'));

        // Should only have Client option for non-SuperAdmin
        expect(options).toHaveLength(1);
        expect(options[0].value).toBe('Client');

        // Cleanup
        localStorage.setItem('userRole', 'SuperAdmin');
    });

    test('displays correct user status and appropriate actions', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Check user status displays
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Suspended')).toBeInTheDocument();

        // Check that buttons are present using more specific selectors
        const johnRow = screen.getByText('John Doe').closest('tr');
        expect(within(johnRow).getByText('View')).toBeInTheDocument();
        expect(within(johnRow).getByText('Edit')).toBeInTheDocument();
        expect(within(johnRow).getByText('Block')).toBeInTheDocument();
        expect(within(johnRow).getByText('Delete')).toBeInTheDocument();

        const janeRow = screen.getByText('Jane Smith').closest('tr');
        expect(within(janeRow).getByText('View')).toBeInTheDocument();
        expect(within(janeRow).getByText('Edit')).toBeInTheDocument();
        expect(within(janeRow).getByText('Unblock')).toBeInTheDocument();
        expect(within(janeRow).getByText('Delete')).toBeInTheDocument();
    });

});
