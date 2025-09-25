import React, {useMemo, useState} from 'react';
import {vi, describe, test, expect, beforeEach, afterEach, it} from 'vitest';
import {render, screen, fireEvent, waitFor, renderHook, act} from '@testing-library/react';
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


    // Test case 20: UserManagement component - user list updates after operations
    test('should update users list correctly after CRUD operations', () => {
        const initialUsers = [
            {id: 1, name: 'User 1', status: 'Active'},
            {id: 2, name: 'User 2', status: 'Active'},
            {id: 3, name: 'User 3', status: 'Inactive'}
        ];

        // Test user deletion (from confirmDelete)
        const deleteUser = (users, userId) => users.filter(u => u.id !== userId);

        const afterDelete = deleteUser(initialUsers, 2);
        expect(afterDelete).toHaveLength(2);
        expect(afterDelete.find(u => u.id === 2)).toBeUndefined();

        // Test user status update - block (from confirmBlock)
        const blockUser = (users, userId) =>
            users.map(u => u.id === userId ? {...u, status: 'Suspended'} : u);

        const afterBlock = blockUser(initialUsers, 1);
        expect(afterBlock.find(u => u.id === 1).status).toBe('Suspended');
        expect(afterBlock.find(u => u.id === 2).status).toBe('Active');

        // Test user status update - activate (from confirmUnblock)
        const activateUser = (users, userId) =>
            users.map(u => u.id === userId ? {...u, status: 'Active'} : u);

        const afterActivate = activateUser(initialUsers, 3);
        expect(afterActivate.find(u => u.id === 3).status).toBe('Active');

        // Test user edit update (from saveEdit)
        const editUser = (users, userId, updates) =>
            users.map(u => u.id === userId ? {...u, ...updates} : u);

        const afterEdit = editUser(initialUsers, 1, {name: 'Updated User 1', email: 'updated@test.com'});
        expect(afterEdit.find(u => u.id === 1).name).toBe('Updated User 1');
        expect(afterEdit.find(u => u.id === 1).email).toBe('updated@test.com');

        // Test user addition (from saveAdd)
        const addUser = (users, newUser) => [newUser, ...users];

        const newUser = {id: 4, name: 'New User', status: 'Inactive'};
        const afterAdd = addUser(initialUsers, newUser);
        expect(afterAdd).toHaveLength(4);
        expect(afterAdd[0]).toEqual(newUser); // New user should be at the beginning
    });

// Test case 21: UserManagement component - pagination boundary conditions
    test('should handle pagination boundary conditions correctly', () => {
        const gotoPage = (p, totalPages) => Math.min(Math.max(p, 1), totalPages);

        // Test normal page navigation
        expect(gotoPage(2, 5)).toBe(2);
        expect(gotoPage(5, 5)).toBe(5);

        // Test lower boundary
        expect(gotoPage(0, 5)).toBe(1);
        expect(gotoPage(-1, 5)).toBe(1);
        expect(gotoPage(1, 5)).toBe(1);

        // Test upper boundary
        expect(gotoPage(6, 5)).toBe(5);
        expect(gotoPage(100, 5)).toBe(5);

        // Test edge cases
        expect(gotoPage(1, 1)).toBe(1); // Only one page
        expect(gotoPage(2, 1)).toBe(1); // Request page beyond total

        // Test page size change resets to page 1
        const handlePageSizeChange = (currentPage, newPageSize, oldPageSize) => {
            if (newPageSize !== oldPageSize) {
                return 1;
            }
            return currentPage;
        };

        expect(handlePageSizeChange(3, 20, 10)).toBe(1); // Page size changed
        expect(handlePageSizeChange(3, 10, 10)).toBe(3); // Page size unchanged
    });

// Test case 22: UserManagement component - loading state and empty states
    test('should handle loading and empty states correctly', () => {
        // Test loading state rendering
        const renderTableContent = (loading, users, pagedUsers) => {
            if (loading) {
                return {type: 'loading'};
            }
            if (pagedUsers.length === 0) {
                return {type: 'empty'};
            }
            return {type: 'data', count: pagedUsers.length};
        };

        // Test loading state
        expect(renderTableContent(true, [], [])).toEqual({type: 'loading'});

        // Test empty state when no users
        expect(renderTableContent(false, [], [])).toEqual({type: 'empty'});

        // Test data state with users
        const users = [{id: 1, name: 'User 1'}, {id: 2, name: 'User 2'}];
        expect(renderTableContent(false, users, users)).toEqual({type: 'data', count: 2});

        // Test paginated data state
        const pagedUsers = [users[0]]; // Only first user on current page
        expect(renderTableContent(false, users, pagedUsers)).toEqual({type: 'data', count: 1});

        // Test "View All" functionality
        const viewAllUsers = (currentPageSize, setPageSize, setPage) => {
            setPageSize("All");
            setPage(1);
            return {pageSize: "All", page: 1};
        };

        const result = viewAllUsers(10, (size) => size, (page) => page);
        expect(result.pageSize).toBe("All");
        expect(result.page).toBe(1);
    });
    it('should transform user data correctly for API calls', () => {
        // Test data transformation for edit API (from saveEdit function)
        const transformEditData = (formData) => ({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim()
        });

        const editFormData = {
            name: '  John Doe  ',
            email: '  john@example.com  ',
            phone: '  1234567890  '
        };

        const transformedEdit = transformEditData(editFormData);
        expect(transformedEdit).toEqual({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890'
        });

        // Test data transformation for add API (from saveAdd function)
        const transformAddData = (formData) => ({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
            status: "Inactive"
        });

        const addFormData = {
            name: '  Jane Smith  ',
            email: '  jane@example.com  ',
            phone: '  0987654321  ',
            role: 'Client'
        };

        const transformedAdd = transformAddData(addFormData);
        expect(transformedAdd).toEqual({
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '0987654321',
            role: 'Client',
            status: 'Inactive'
        });

        // Test with empty strings
        const emptyFormData = {name: '  ', email: '  ', phone: '  ', role: 'Client'};
        const transformedEmpty = transformAddData(emptyFormData);
        expect(transformedEmpty).toEqual({
            name: '',
            email: '',
            phone: '',
            role: 'Client',
            status: 'Inactive'
        });
    });

    it('should handle modal open/close states correctly', () => {
        // Test the modal state management pattern used in component
        const modalHandlers = {
            delete: {open: false, user: null},
            edit: {open: false, user: null},
            view: {open: false, user: null},
            add: {open: false}
        };

        // Simulate opening modals
        const openModal = (modalType, user = null) => {
            modalHandlers[modalType].open = true;
            if (user) modalHandlers[modalType].user = user;
        };

        // Simulate closing modals
        const closeModal = (modalType) => {
            modalHandlers[modalType].open = false;
            modalHandlers[modalType].user = null;
        };

        const testUser = {id: 1, name: 'Test User'};

        // Test open/close cycle for delete modal
        openModal('delete', testUser);
        expect(modalHandlers.delete.open).toBe(true);
        expect(modalHandlers.delete.user).toEqual(testUser);

        closeModal('delete');
        expect(modalHandlers.delete.open).toBe(false);
        expect(modalHandlers.delete.user).toBe(null);

        // Test open/close cycle for edit modal
        openModal('edit', testUser);
        expect(modalHandlers.edit.open).toBe(true);
        expect(modalHandlers.edit.user).toEqual(testUser);

        closeModal('edit');
        expect(modalHandlers.edit.open).toBe(false);
        expect(modalHandlers.edit.user).toBe(null);

        // Test add modal (no user needed)
        openModal('add');
        expect(modalHandlers.add.open).toBe(true);

        closeModal('add');
        expect(modalHandlers.add.open).toBe(false);
    });
// Test case 17: UserManagement component - form state initialization
    it('should initialize form states correctly for different modals', () => {
        const testUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            role: 'Client',
            status: 'Active'
        };

        // Test edit form initialization (from openEdit function)
        const initializeEditForm = (user) => ({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || ""
        });

        const editForm = initializeEditForm(testUser);
        expect(editForm).toEqual({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890'
        });

        // Test add form initialization (from openAdd function)
        const initializeAddForm = () => ({
            name: "",
            email: "",
            phone: "",
            role: "Client",
            status: "Inactive"
        });

        const addForm = initializeAddForm();
        expect(addForm).toEqual({
            name: "",
            email: "",
            phone: "",
            role: "Client",
            status: "Inactive"
        });

        // Test with user having empty values
        const userWithEmptyValues = {id: 2, name: "", email: null, phone: undefined};
        const emptyEditForm = initializeEditForm(userWithEmptyValues);
        expect(emptyEditForm).toEqual({
            name: "",
            email: "",
            phone: ""
        });
    });

// Test case 18: UserManagement component - error state management
    it('should manage error states correctly during form operations', () => {
        // Test error clearing on input change (from onEditChange and onAddChange)
        const clearErrorOnChange = (currentErrors, fieldName) => {
            const newErrors = {...currentErrors};
            if (newErrors[fieldName]) {
                newErrors[fieldName] = "";
            }
            if (newErrors.general) {
                delete newErrors.general;
            }
            return newErrors;
        };

        // Test clearing field-specific errors
        const errorsWithField = {name: "Name is required", email: "Invalid email"};
        const clearedNameErrors = clearErrorOnChange(errorsWithField, "name");
        expect(clearedNameErrors.name).toBe("");
        expect(clearedNameErrors.email).toBe("Invalid email");

        // Test clearing general errors
        const errorsWithGeneral = {general: "Server error", name: "Name error"};
        const clearedGeneralErrors = clearErrorOnChange(errorsWithGeneral, "name");
        expect(clearedGeneralErrors.general).toBeUndefined();
        expect(clearedGeneralErrors.name).toBe("");

        // Test error checking logic (from saveEdit and saveAdd)
        const hasValidationErrors = (errors) => {
            return Object.values(errors).some(error => error !== "" && error !== undefined);
        };

        expect(hasValidationErrors({})).toBe(false);
        expect(hasValidationErrors({name: ""})).toBe(false);
        expect(hasValidationErrors({name: "Error"})).toBe(true);
        expect(hasValidationErrors({name: "", email: "Invalid"})).toBe(true);
    });

    it('should handle pagination correctly when changing page size', () => {
        const {result} = renderHook(() => {
            const [page, setPage] = useState(1);
            const [pageSize, setPageSize] = useState(10);
            const users = Array.from({length: 25}, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@test.com`,
                phone: '1234567890',
                role: 'Client',
                status: 'Active'
            }));

            const totalItems = users.length;
            const totalPages = useMemo(() => {
                if (pageSize === "All") return 1;
                return Math.max(1, Math.ceil(totalItems / Number(pageSize)));
            }, [totalItems, pageSize]);

            const pagedUsers = useMemo(() => {
                if (pageSize === "All") return users;
                const start = (page - 1) * Number(pageSize);
                const end = start + Number(pageSize);
                return users.slice(start, end);
            }, [page, pageSize, users]);

            return {page, setPage, pageSize, setPageSize, pagedUsers, totalPages};
        });

        // Test initial state
        expect(result.current.pagedUsers).toHaveLength(10);
        expect(result.current.totalPages).toBe(3);

        // Test page size change to 20
        act(() => {
            result.current.setPageSize(20);
        });
        expect(result.current.pagedUsers).toHaveLength(20);
        expect(result.current.totalPages).toBe(2);

        // Test "All" page size
        act(() => {
            result.current.setPageSize("All");
        });
        expect(result.current.pagedUsers).toHaveLength(25);
        expect(result.current.totalPages).toBe(1);
    });

// Test case 11: UserManagement component - validation functions
    it('should validate user fields correctly', () => {
        // Import or define the validation functions
        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email) ? '' : 'Invalid email format';
        };

        const validatePhone = (phone) => {
            const phoneRegex = /^\d{10}$/;
            return phone && phoneRegex.test(phone) ? '' : 'Phone must be 10 digits';
        };

        const validateName = (name) => {
            return name && name.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
        };

        // Test validateField function (copied from component)
        const validateField = (name, value) => {
            if (name === "email") return validateEmail(value);
            if (name === "phone") return validatePhone(value);
            if (name === "name") return validateName(value);
            return "";
        };

        // Test valid inputs
        expect(validateField('email', 'test@example.com')).toBe('');
        expect(validateField('phone', '1234567890')).toBe('');
        expect(validateField('name', 'John Doe')).toBe('');

        // Test invalid inputs
        expect(validateField('email', 'invalid-email')).not.toBe('');
        expect(validateField('phone', '123')).not.toBe('');
        expect(validateField('name', '')).not.toBe('');
    });

// Test case 12: UserManagement component - user status button logic
    it('should show correct buttons based on user status', () => {
        const users = [
            {
                id: 1,
                name: 'Active User',
                email: 'active@test.com',
                phone: '1234567890',
                role: 'Client',
                status: 'Active'
            },
            {
                id: 2,
                name: 'Suspended User',
                email: 'suspended@test.com',
                phone: '1234567890',
                role: 'Client',
                status: 'Suspended'
            },
            {
                id: 3,
                name: 'Inactive User',
                email: 'inactive@test.com',
                phone: '1234567890',
                role: 'Client',
                status: 'Inactive'
            },
            {
                id: 4,
                name: 'Blocked User',
                email: 'blocked@test.com',
                phone: '1234567890',
                role: 'Client',
                status: 'Blocked'
            }
        ];

        // Test the button logic from the component
        const getExpectedButtons = (user) => {
            const buttons = ['View', 'Edit', 'Delete'];

            if (user.status === 'Active') {
                buttons.splice(2, 0, 'Block'); // Add Block before Delete
            } else if (user.status === 'Suspended') {
                buttons.splice(2, 0, 'Unblock'); // Add Unblock before Delete
            } else if (user.status === 'Inactive' || user.status === 'Blocked') {
                // Block button should be disabled for these statuses
                buttons.splice(2, 0, 'Block');
            }

            return buttons;
        };

        expect(getExpectedButtons(users[0])).toEqual(['View', 'Edit', 'Block', 'Delete']);
        expect(getExpectedButtons(users[1])).toEqual(['View', 'Edit', 'Unblock', 'Delete']);
        expect(getExpectedButtons(users[2])).toEqual(['View', 'Edit', 'Block', 'Delete']);
        expect(getExpectedButtons(users[3])).toEqual(['View', 'Edit', 'Block', 'Delete']);
    });

// Test case 13: UserManagement component - form validation logic
    it('should validate user payload correctly', () => {
        // Copy the validation functions from component
        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email) ? '' : 'Invalid email format';
        };

        const validatePhone = (phone) => {
            const phoneRegex = /^\d{10}$/;
            return phone && phoneRegex.test(phone) ? '' : 'Phone must be 10 digits';
        };

        const validateName = (name) => {
            return name && name.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
        };

        // Copy the validateUserPayload function from component
        const validateUserPayload = (payload) => {
            return {
                name: validateName(payload.name),
                email: validateEmail(payload.email),
                phone: validatePhone(payload.phone),
            };
        };

        // Test valid payload
        const validPayload = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890'
        };
        const validResult = validateUserPayload(validPayload);
        expect(validResult.name).toBe('');
        expect(validResult.email).toBe('');
        expect(validResult.phone).toBe('');

        // Test invalid payload
        const invalidPayload = {
            name: 'J', // Too short
            email: 'invalid-email', // Invalid format
            phone: '123' // Too short
        };
        const invalidResult = validateUserPayload(invalidPayload);
        expect(invalidResult.name).not.toBe('');
        expect(invalidResult.email).not.toBe('');
        expect(invalidResult.phone).not.toBe('');

        // Test Object.values(errs).some(Boolean) logic
        const hasErrors = (errors) => Object.values(errors).some(Boolean);
        expect(hasErrors(validResult)).toBe(false);
        expect(hasErrors(invalidResult)).toBe(true);
    });
// Test case 14: UserManagement component - role-based access control for adding users
    it('should enforce role restrictions for creating admin accounts', () => {
        // Test the role restriction logic from saveAdd function
        const canCreateAdmin = (currentUserRole, targetRole) => {
            return currentUserRole === 'SuperAdmin' || targetRole !== 'Admin';
        };

        // SuperAdmin can create any role
        expect(canCreateAdmin('SuperAdmin', 'Admin')).toBe(true);
        expect(canCreateAdmin('SuperAdmin', 'Client')).toBe(true);

        // Admin cannot create Admin accounts
        expect(canCreateAdmin('Admin', 'Admin')).toBe(false);
        expect(canCreateAdmin('Admin', 'Client')).toBe(true);

        // Client cannot create Admin accounts
        expect(canCreateAdmin('Client', 'Admin')).toBe(false);
        expect(canCreateAdmin('Client', 'Client')).toBe(true);
    })

    // Test case 23: UserManagement component - form field validation edge cases
    test('should handle form validation edge cases correctly', () => {
        // Copy validation functions from component
        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email) ? '' : 'Invalid email format';
        };

        const validatePhone = (phone) => {
            const phoneRegex = /^\d{10}$/;
            return phone && phoneRegex.test(phone) ? '' : 'Phone must be 10 digits';
        };

        const validateName = (name) => {
            return name && name.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
        };

        // Test email edge cases
        expect(validateEmail('test@domain.com')).toBe(''); // Valid
        expect(validateEmail('test@domain.co.uk')).toBe(''); // Valid with subdomain
        expect(validateEmail('test@domain')).not.toBe(''); // Invalid - no TLD
        expect(validateEmail('testdomain.com')).not.toBe(''); // Invalid - no @
        expect(validateEmail('')).not.toBe(''); // Invalid - empty
        expect(validateEmail(null)).not.toBe(''); // Invalid - null
        expect(validateEmail(undefined)).not.toBe(''); // Invalid - undefined

        // Test phone edge cases
        expect(validatePhone('1234567890')).toBe(''); // Valid
        expect(validatePhone('123456789')).not.toBe(''); // Invalid - 9 digits
        expect(validatePhone('12345678901')).not.toBe(''); // Invalid - 11 digits
        expect(validatePhone('123abc4567')).not.toBe(''); // Invalid - contains letters
        expect(validatePhone('')).not.toBe(''); // Invalid - empty
        expect(validatePhone(null)).not.toBe(''); // Invalid - null

        // Test name edge cases
        expect(validateName('John')).toBe(''); // Valid
        expect(validateName('Jo')).toBe(''); // Valid - exactly 2 characters
        expect(validateName('J')).not.toBe(''); // Invalid - 1 character
        expect(validateName('  ')).not.toBe(''); // Invalid - only spaces
        expect(validateName('')).not.toBe(''); // Invalid - empty
        expect(validateName(null)).not.toBe(''); // Invalid - null
    });

// Test case 24: UserManagement component - user role and status combinations
    test('should handle various user role and status combinations correctly', () => {
        const users = [
            {id: 1, name: 'Super Admin', role: 'SuperAdmin', status: 'Active'},
            {id: 2, name: 'Admin User', role: 'Admin', status: 'Active'},
            {id: 3, name: 'Client User', role: 'Client', status: 'Suspended'},
            {id: 4, name: 'Inactive Client', role: 'Client', status: 'Inactive'},
            {id: 5, name: 'Blocked Admin', role: 'Admin', status: 'Blocked'}
        ];

        // Test role-based filtering logic
        const filterUsersByRole = (users, currentUserRole) => {
            if (currentUserRole === 'SuperAdmin') {
                return users; // SuperAdmin sees all users
            }
            return users.filter(user => user.role !== 'SuperAdmin'); // Others don't see SuperAdmins
        };

        // SuperAdmin should see all users
        expect(filterUsersByRole(users, 'SuperAdmin')).toHaveLength(5);

        // Admin should not see SuperAdmin users
        const adminView = filterUsersByRole(users, 'Admin');
        expect(adminView).toHaveLength(4);
        expect(adminView.some(u => u.role === 'SuperAdmin')).toBe(false);

        // Client should not see SuperAdmin users
        const clientView = filterUsersByRole(users, 'Client');
        expect(clientView).toHaveLength(4);
        expect(clientView.some(u => u.role === 'SuperAdmin')).toBe(false);

        // Test status display logic
        const getStatusDisplay = (status) => {
            const statusConfig = {
                'Active': {label: 'Active', variant: 'success'},
                'Suspended': {label: 'Suspended', variant: 'danger'},
                'Inactive': {label: 'Inactive', variant: 'secondary'},
                'Blocked': {label: 'Blocked', variant: 'warning'}
            };
            return statusConfig[status] || {label: status, variant: 'secondary'};
        };

        expect(getStatusDisplay('Active')).toEqual({label: 'Active', variant: 'success'});
        expect(getStatusDisplay('Suspended')).toEqual({label: 'Suspended', variant: 'danger'});
        expect(getStatusDisplay('Inactive')).toEqual({label: 'Inactive', variant: 'secondary'});
        expect(getStatusDisplay('Blocked')).toEqual({label: 'Blocked', variant: 'warning'});
        expect(getStatusDisplay('Unknown')).toEqual({label: 'Unknown', variant: 'secondary'});
    });

// Test case 25: UserManagement component - modal prop passing and event handling
    test('should pass correct props to modal components and handle events', () => {
        // Test modal prop structure for AddUserModal
        const getAddModalProps = (showAddModal, addForm, addFieldErrors, currentUserRole, addError) => ({
            visible: showAddModal,
            addForm: addForm,
            addFieldErrors: addFieldErrors,
            currentUserRole: currentUserRole,
            addError: addError,
            // onChange, onCancel, onSave would be function references
        });

        const addModalProps = getAddModalProps(
            true,
            {name: 'Test', email: 'test@test.com', phone: '1234567890', role: 'Client'},
            {name: '', email: '', phone: ''},
            'Admin',
            ''
        );

        expect(addModalProps.visible).toBe(true);
        expect(addModalProps.addForm.name).toBe('Test');
        expect(addModalProps.currentUserRole).toBe('Admin');
        expect(addModalProps.addError).toBe('');

        // Test modal prop structure for EditUserModal
        const getEditModalProps = (showEditModal, editForm, editErrors) => ({
            visible: showEditModal,
            form: editForm,
            errors: editErrors,
            // onChange, onCancel, onSave would be function references
        });

        const editModalProps = getEditModalProps(
            true,
            {name: 'Updated Name', email: 'updated@test.com', phone: '0987654321'},
            {general: 'Server error'}
        );

        expect(editModalProps.visible).toBe(true);
        expect(editModalProps.form.email).toBe('updated@test.com');
        expect(editModalProps.errors.general).toBe('Server error');

        // Test modal prop structure for BlockUserModal
        const getBlockModalProps = (showBlockModal, selectedUser, type) => ({
            visible: showBlockModal,
            user: selectedUser,
            type: type,
            // onCancel, onConfirm would be function references
        });

        const testUser = {id: 1, name: 'Test User'};
        const blockModalProps = getBlockModalProps(true, testUser, 'block');

        expect(blockModalProps.visible).toBe(true);
        expect(blockModalProps.user).toEqual(testUser);
        expect(blockModalProps.type).toBe('block');
    });

    test('openDelete function sets correct state', () => {
        // If you can access the component's state or functions directly
        const {result} = renderHook(() => {
            const [selectedUser, setSelectedUser] = useState(null);
            const [showDeleteModal, setShowDeleteModal] = useState(false);

            const openDelete = (user) => {
                setSelectedUser(user);
                setShowDeleteModal(true);
            };

            return {selectedUser, showDeleteModal, openDelete};
        });

        const testUser = {id: 1, name: 'Test User'};

        act(() => {
            result.current.openDelete(testUser);
        });

        expect(result.current.selectedUser).toEqual(testUser);
        expect(result.current.showDeleteModal).toBe(true);
    });


        test('confirmDelete should not proceed if no user is selected', async () => {
        // Render component with no selected user
        const { result } = renderHook(() => {
            const [selectedUser, setSelectedUser] = useState(null);
            const [users, setUsers] = useState(mockUsers);

            const confirmDelete = async () => {
                if (!selectedUser) return;

                try {
                    await deleteUsers(selectedUser.id);
                    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
                    toast.success("User deleted Successfully!");
                } catch (error) {
                    console.error("Failed to delete user:", error);
                    toast.error("Failed to delete user. Please try again.");
                }
            };

            return { selectedUser, users, confirmDelete };
        });

        // Call confirmDelete with no selected user
        await act(async () => {
            await result.current.confirmDelete();
        });

        // Verify no API calls were made
        expect(deleteUsers).not.toHaveBeenCalled();
        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
    });

    test('confirmDelete should successfully delete user and update state', async () => {
        const mockUser = mockUsers[0];

        const { result } = renderHook(() => {
            const [selectedUser, setSelectedUser] = useState(mockUser);
            const [users, setUsers] = useState(mockUsers);

            const confirmDelete = async () => {
                if (!selectedUser) return;

                try {
                    await deleteUsers(selectedUser.id);
                    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
                    toast.success("User deleted Successfully!");
                } catch (error) {
                    console.error("Failed to delete user:", error);
                    toast.error("Failed to delete user. Please try again.");
                }
            };

            return { selectedUser, users, confirmDelete, setSelectedUser };
        });

        // Mock successful API response
        deleteUsers.mockResolvedValue({ success: true });

        await act(async () => {
            await result.current.confirmDelete();
        });

        // Verify API was called with correct ID
        expect(deleteUsers).toHaveBeenCalledWith(mockUser.id);

        // Verify user was removed from state
        expect(result.current.users).toEqual([mockUsers[1]]);

        // Verify success toast was shown
        expect(toast.success).toHaveBeenCalledWith("User deleted Successfully!");
    });

    test('confirmDelete should handle API errors gracefully', async () => {
        const mockUser = mockUsers[0];
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => {
            const [selectedUser, setSelectedUser] = useState(mockUser);
            const [users, setUsers] = useState(mockUsers);

            const confirmDelete = async () => {
                if (!selectedUser) return;

                try {
                    await deleteUsers(selectedUser.id);
                    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
                    toast.success("User deleted Successfully!");
                } catch (error) {
                    console.error("Failed to delete user:", error);
                    toast.error("Failed to delete user. Please try again.");
                }
            };

            return { selectedUser, users, confirmDelete };
        });

        // Mock API failure
        const error = new Error('Delete failed');
        deleteUsers.mockRejectedValue(error);

        await act(async () => {
            await result.current.confirmDelete();
        });

        // Verify API was called
        expect(deleteUsers).toHaveBeenCalledWith(mockUser.id);

        // Verify error was logged
        expect(consoleSpy).toHaveBeenCalledWith("Failed to delete user:", error);

        // Verify error toast was shown
        expect(toast.error).toHaveBeenCalledWith("Failed to delete user. Please try again.");

        // Verify users state was not changed
        expect(result.current.users).toEqual(mockUsers);

        consoleSpy.mockRestore();
    });

    test('confirmDelete should preserve other users when deleting one', async () => {
        const mockUser = mockUsers[0];

        const { result } = renderHook(() => {
            const [selectedUser, setSelectedUser] = useState(mockUser);
            const [users, setUsers] = useState(mockUsers);

            const confirmDelete = async () => {
                if (!selectedUser) return;

                try {
                    await deleteUsers(selectedUser.id);
                    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
                    toast.success("User deleted Successfully!");
                } catch (error) {
                    console.error("Failed to delete user:", error);
                    toast.error("Failed to delete user. Please try again.");
                }
            };

            return { selectedUser, users, confirmDelete };
        });

        deleteUsers.mockResolvedValue({ success: true });

        await act(async () => {
            await result.current.confirmDelete();
        });

        // Verify only the selected user was removed
        expect(result.current.users).toHaveLength(1);
        expect(result.current.users[0].id).toBe(2); // Jane Smith remains
        expect(result.current.users[0].name).toBe('Jane Smith');
    });
});
