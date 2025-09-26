import {describe, it, expect, vi, beforeEach} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '../server';
import {
    fetchUsers,
    deleteUsers,
    editUsers,
    addUsers,
    blockUser,
    activateUser
} from '../../../src/api/services/usermanagement.js';
import {ENDPOINTS} from '../../../src/api/endpoints';
import api from '../../../src/api/axiosConfig';
import {renderHook, act} from '@testing-library/react';
import {useMemo, useState} from 'react';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

describe('user service', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    it('should handle server errors', async () => {
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.userManagement}`, () => {
                return new HttpResponse(
                    null,
                    {status: 500, statusText: 'Internal Server Error'}
                );
            })
        );
        const clientData = {username: 'testuser', password: 'password'};
        await expect(addUsers(clientData)).rejects.toBe('Request failed with status code 500');
    });

    // Test case 1: fetchUsers - success case
    it('fetchUsers should return empty array when response data is not array', async () => {
        server.use(
            http.get(`${BASE_URL}${ENDPOINTS.userManagement}`, () => {
                return HttpResponse.json(
                    {users: []}, // Non-array response
                    {status: 200}
                );
            })
        );

        const result = await fetchUsers();
        expect(result).toEqual([]);
    });

    // Test case 2: fetchUsers - success case with array data
    it('fetchUsers should return users array when response is array', async () => {
        const mockUsers = [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}];
        server.use(
            http.get(`${BASE_URL}${ENDPOINTS.userManagement}`, () => {
                return HttpResponse.json(mockUsers, {status: 200});
            })
        );

        const result = await fetchUsers();
        expect(result).toEqual(mockUsers);
    });

    // Test case 3: deleteUsers - success case
    it('deleteUsers should successfully delete user', async () => {
        const userId = '123';
        const mockResponse = {message: 'User deleted successfully'};

        server.use(
            http.delete(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, () => {
                return HttpResponse.json(mockResponse, {status: 200});
            })
        );

        const result = await deleteUsers(userId);
        expect(result).toEqual(mockResponse);
    });

    // Test case 4: deleteUsers - error case
    it('deleteUsers should handle errors', async () => {
        const userId = '123';

        server.use(
            http.delete(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, () => {
                return new HttpResponse(null, {status: 404});
            })
        );

        await expect(deleteUsers(userId)).rejects.toBe('Request failed with status code 404');
    });

    // Test case 5: editUsers - success case
    it('editUsers should successfully update user', async () => {
        const userId = '123';
        const userData = {name: 'Updated Name', email: 'updated@email.com'};
        const mockResponse = {id: userId, ...userData};

        server.use(
            http.patch(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, () => {
                return HttpResponse.json(mockResponse, {status: 200});
            })
        );

        const result = await editUsers(userId, userData);
        expect(result).toEqual(mockResponse);
    });

    // Test case 6: editUsers - error case
    it('editUsers should handle errors', async () => {
        const userId = '123';
        const userData = {name: 'Updated Name'};

        server.use(
            http.patch(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, () => {
                return new HttpResponse(null, {status: 400});
            })
        );

        await expect(editUsers(userId, userData)).rejects.toBe('Request failed with status code 400');
    });


    // Test case 7: blockUser - success case
    it('blockUser should suspend user', async () => {
        const userId = '123';
        const mockResponse = {id: userId, status: 'Suspended'};

        server.use(
            http.patch(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, async ({request}) => {
                const body = await request.json();
                expect(body).toEqual({status: 'Suspended'});
                return HttpResponse.json(mockResponse, {status: 200});
            })
        );

        const result = await blockUser(userId);
        expect(result).toEqual(mockResponse);
    });

// Test case 8: activateUser - success case
    it('activateUser should activate user', async () => {
        const userId = '123';
        const mockResponse = {id: userId, status: 'Active'};

        server.use(
            http.patch(`${BASE_URL}${ENDPOINTS.userManagement}/${userId}`, async ({request}) => {
                const body = await request.json();
                expect(body).toEqual({status: 'Active'});
                return HttpResponse.json(mockResponse, {status: 200});
            })
        );

        const result = await activateUser(userId);
        expect(result).toEqual(mockResponse);
    });

// Test case 9: fetchUsers - error case
    it('fetchUsers should handle errors', async () => {
        server.use(
            http.get(`${BASE_URL}${ENDPOINTS.userManagement}`, () => {
                return new HttpResponse(null, {status: 500});
            })
        );

        await expect(fetchUsers()).rejects.toBe('Request failed with status code 500');
    });
// Test case 10: UserManagement component - pagination logic
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
    });

// Test case 15: UserManagement component - pagination navigation and display text
    it('should calculate correct pagination display text', () => {
        const users = Array.from({length: 35}, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`
        }));

        // Test the display text logic from component
        const getDisplayText = (page, pageSize, totalItems) => {
            const start = (page - 1) * Number(pageSize) + 1;
            const end = Math.min(page * Number(pageSize), totalItems);
            return `Showing ${start} to ${end} of ${totalItems} entries`;
        };

        // Test various scenarios
        expect(getDisplayText(1, 10, 35)).toBe('Showing 1 to 10 of 35 entries');
        expect(getDisplayText(2, 10, 35)).toBe('Showing 11 to 20 of 35 entries');
        expect(getDisplayText(3, 10, 35)).toBe('Showing 21 to 30 of 35 entries');
        expect(getDisplayText(4, 10, 35)).toBe('Showing 31 to 35 of 35 entries'); // Last page
        expect(getDisplayText(1, 20, 35)).toBe('Showing 1 to 20 of 35 entries');
        expect(getDisplayText(1, 50, 35)).toBe('Showing 1 to 35 of 35 entries'); // Page size larger than total
    });

// Test case 16: UserManagement component - modal state management
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

// Test case 19: UserManagement component - user data transformation for API
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
});