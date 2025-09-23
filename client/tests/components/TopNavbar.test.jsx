import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {vi, describe, test, expect, beforeEach, beforeAll, afterAll} from 'vitest';
import TopNavbar from '../../src/components/TopNavbar.jsx';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock the CSS import if needed
vi.mock('../../src/css/TopNavbar.css', () => ({}));

describe('TopNavbar Component', () => {
    const mockUserData = {
        name: 'John Doe',
        role: 'Admin',
        avatar: 'https://example.com/avatar.jpg'
    };

    const defaultUserData = {
        name: 'Sharon Maina',
        role: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Sharon+Maina&background=4e73df&color=fff'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockClear();
    });

    describe('Rendering', () => {
        test('renders TopNavbar component with default content', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(<TopNavbar />);

            // Check if main elements are rendered
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
        });

        test('renders with default user data when localStorage is empty', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(<TopNavbar />);

            expect(screen.getByText('Sharon Maina')).toBeInTheDocument();
            expect(screen.getByText('Admin')).toBeInTheDocument();
        });

        test('renders with user data from localStorage', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData));

            render(<TopNavbar />);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Admin')).toBeInTheDocument();
            expect(screen.getByAltText('User Avatar')).toHaveAttribute('src', mockUserData.avatar);
        });

        test('renders menu toggle button', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(<TopNavbar />);

            const menuToggle = screen.getByRole('button');
            expect(menuToggle).toBeInTheDocument();
            expect(menuToggle).toHaveClass('menu-toggle');
        });

        test('renders user avatar with correct attributes', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(<TopNavbar />);

            const avatar = screen.getByAltText('User Avatar');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveClass('user-avatar');
            expect(avatar).toHaveAttribute('src', defaultUserData.avatar);
        });
    });


});

// Setup and teardown for all tests
beforeAll(() => {
    // Any global setup
});

afterAll(() => {
    vi.restoreAllMocks();
});