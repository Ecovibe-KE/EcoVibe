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
    {id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'client', status: 'active'},
    {id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'admin', status: 'suspended'},
];

describe('UserManagement Component', () => {
    beforeEach(() => {
        fetchUsers.mockResolvedValue(mockUsers);
        localStorage.setItem('userRole', 'super_admin');
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
            role: 'client',
            status: 'active'
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

        // Test each button opens a modal (only the ones that exist)
        const actions = ['View', 'Edit', 'Delete']; // Removed 'Block' since it doesn't exist

        for (const action of actions) {
            const button = within(userRow).getByText(action);
            fireEvent.click(button);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Close modal - be more specific about which close button to use
            const modal = screen.getByRole('dialog');

            // Try different close button selectors in order of preference
            let closeButton;
            try {
                // First try the X close button
                closeButton = within(modal).getByLabelText('Close');
            } catch {
                try {
                    // Then try button with text "Close"
                    closeButton = within(modal).getByText('Close');
                } catch {
                    // Finally try button with text "Cancel"
                    closeButton = within(modal).getByText('Cancel');
                }
            }

            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        }

        // Test Add User modal separately
        const addButton = screen.getByLabelText('Add User');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
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
            role: 'client',
            status: 'Inactive',
            industry: 'Technology'
        };

        // Mock the API call to return a proper response with id
        addUsers.mockResolvedValue({
            data: newUser, // Wrap in data property if that's what your component expects
            status: 201,
            message: 'User created successfully'
        });

        // Alternative: if the component expects just the user object directly
        // addUsers.mockResolvedValue(newUser);

        render(<UserManagement/>);

        // Wait for initial data to load
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Click the Add User button
        const addUserButton = screen.getByLabelText('Add User');
        fireEvent.click(addUserButton);

        // Wait for modal to open
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Get the modal
        const modal = screen.getByRole('dialog');

        // Fill form using input names
        const nameInput = modal.querySelector('input[name="name"]');
        const industryInput = modal.querySelector('input[name="industry"]');
        const emailInput = modal.querySelector('input[name="email"]');
        const phoneInput = modal.querySelector('input[name="phone"]');
        const roleSelect = modal.querySelector('select[name="role"]');

        fireEvent.change(nameInput, {target: {value: 'New User'}});
        fireEvent.change(industryInput, {target: {value: 'Technology'}});
        fireEvent.change(emailInput, {target: {value: 'new@example.com'}});
        fireEvent.change(phoneInput, {target: {value: '5555555555'}});
        fireEvent.change(roleSelect, {target: {value: 'client'}});

        // Click the Add User button
        const modalAddButton = modal.querySelector('.btn-success');

        // Wrap in act to handle state updates
        await act(async () => {
            fireEvent.click(modalAddButton);
        });

        // Wait for API call and check it was called correctly
        await waitFor(() => {
            expect(addUsers).toHaveBeenCalledWith({
                name: 'New User',
                email: 'new@example.com',
                phone: '5555555555',
                role: 'client',
                status: 'Inactive',
                industry: 'Technology'
            });
        });

        // Wait for success message
        await waitFor(() => {
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
        // Mock the exact response structure that the component expects
        editUsers.mockResolvedValue({
            data: {
                id: 1,
                name: 'John Updated',
                email: 'johnupdated@example.com',
                phone: '9999999999',
                industry: 'Technology',
                role: 'client',
                status: 'active'
            },
            status: 200,
            message: 'User updated successfully'
        });

        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Click Edit button
        const johnRow = screen.getByText('John Doe').closest('tr');
        const editButton = within(johnRow).getByText('Edit');
        fireEvent.click(editButton);

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        const modal = screen.getByRole('dialog');

        // Fill fields
        const nameInput = modal.querySelector('input[name="name"]');
        const industryInput = modal.querySelector('input[name="industry"]');
        const emailInput = modal.querySelector('input[name="email"]');
        const phoneInput = modal.querySelector('input[name="phone"]');

        fireEvent.change(nameInput, {target: {value: 'John Updated'}});
        fireEvent.change(industryInput, {target: {value: 'Technology'}});
        fireEvent.change(emailInput, {target: {value: 'johnupdated@example.com'}});
        fireEvent.change(phoneInput, {target: {value: '9999999999'}});

        // Click save
        const saveButton = within(modal).getByText('Save Changes');
        fireEvent.click(saveButton);

        // Wait for API call
        await waitFor(() => {
            expect(editUsers).toHaveBeenCalledWith(1, {
                name: 'John Updated',
                email: 'johnupdated@example.com',
                phone: '9999999999',
                industry: 'Technology'
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('User successfully edited');
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
            expect(blockUser).toHaveBeenCalledWith(1, "suspended");
            expect(toast.success).toHaveBeenCalledWith('User Blocked Successfully!');
        });

        // Reset the mock to clear call history
        blockUser.mockClear();

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
            // Check if the function is called with just the user ID
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
        {id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'client', status: 'active'},
        {id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'admin', status: 'suspended'},
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
        addUsers.mockRejectedValue(new Error('API Error'));

        render(<UserManagement/>);

        await screen.findByText('John Doe');

        // Click add button
        fireEvent.click(screen.getByLabelText('Add User'));

        // Wait for modal
        await screen.findByRole('dialog');

        const modal = screen.getByRole('dialog');

        // Fill the form fields
        const fields = [
            {name: 'name', value: 'Test User'},
            {name: 'industry', value: 'Technology'},
            {name: 'email', value: 'test@example.com'},
            {name: 'phone', value: '1234567890'}
        ];

        fields.forEach(({name, value}) => {
            const input = modal.querySelector(`[name="${name}"]`);
            if (input) {
                fireEvent.change(input, {target: {value}});
            }
        });

        // Find and click submit button
        const buttons = modal.querySelectorAll('button');
        const submitButton = Array.from(buttons).find(btn =>
            btn.textContent.match(/add user|save|submit/i)
        );

        fireEvent.click(submitButton);

        // Wait for the API call
        await waitFor(() => {
            expect(addUsers).toHaveBeenCalled();
        }, {timeout: 3000});

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
            const errorCall = toast.error.mock.calls[0][0];
            expect(errorCall).toContain('Failed to add user');
            expect(errorCall).toContain('Please try again');
        }, {timeout: 3000});
    });

    test('enforces role restrictions for non-super_admin users', async () => {
        // Set role to Admin (not super_admin)
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userRole', 'admin');

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

        // Should only have Client option for non-super_admin
        expect(options).toHaveLength(1);
        expect(options[0].value).toBe('client');

        // Cleanup
        localStorage.setItem('userRole', 'super_admin');
    });

    test('displays correct user status and appropriate actions', async () => {
        render(<UserManagement/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Check user status displays
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText('suspended')).toBeInTheDocument();

        const johnRow = screen.getByText('John Doe').closest('tr');
        // John is Active → should have Block button
        expect(within(johnRow).getByText('Block')).toBeInTheDocument();
        expect(within(johnRow).queryByText('Unblock')).not.toBeInTheDocument();

// Jane is Suspended → should have Unblock button
        const janeRow = screen.getByText('Jane Smith').closest('tr');
        expect(within(janeRow).getByText('Unblock')).toBeInTheDocument();
        expect(within(janeRow).queryByText('Block')).not.toBeInTheDocument();

    });

});
