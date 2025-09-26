import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TopNavbar from '../../src/components/TopNavbar.jsx';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock CSS imports
vi.mock('../../src/css/TopNavBar.css', () => ({}));

// Mock React Icons
vi.mock('react-icons/fi', () => ({
    FiMenu: () => <div data-testid="menu-icon">Menu</div>,
    FiX: () => <div data-testid="close-icon">Close</div>,
}));

// Mock useBreakpoint hook
vi.mock('../../src/hooks/useBreakpoint', () => ({
    default: vi.fn(() => false), // Default to mobile view
}));

// Mock asset imports
vi.mock('../../src/assets/home.png', () => ({ default: '/mock-home.png' }));
vi.mock('../../src/assets/bookings.png', () => ({ default: '/mock-bookings.png' }));
vi.mock('../../src/assets/resources.png', () => ({ default: '/mock-resources.png' }));
vi.mock('../../src/assets/profile.png', () => ({ default: '/mock-profile.png' }));
vi.mock('../../src/assets/payment.png', () => ({ default: '/mock-payment.png' }));
vi.mock('../../src/assets/blog.png', () => ({ default: '/mock-blog.png' }));
vi.mock('../../src/assets/services.png', () => ({ default: '/mock-services.png' }));
vi.mock('../../src/assets/about.png', () => ({ default: '/mock-about.png' }));
vi.mock('../../src/assets/users.png', () => ({ default: '/mock-users.png' }));
vi.mock('../../src/assets/tickets.png', () => ({ default: '/mock-tickets.png' }));

// Mock Bootstrap components
vi.mock('react-bootstrap', () => ({
    Offcanvas: ({ children, show, onHide, ...props }) => 
        show ? (
            <div data-testid="offcanvas" onClick={onHide}>
                {children}
            </div>
        ) : null,
    Container: ({ children, fluid, className, ...props }) => (
        <div className={`container ${fluid ? 'container-fluid' : ''} ${className || ''}`} {...props}>
            {children}
        </div>
    ),
}));

// Helper component to wrap with Router
const RouterWrapper = ({ children }) => (
    <BrowserRouter>
        {children}
    </BrowserRouter>
);

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
        
        // Reset useBreakpoint mock to mobile by default
        const useBreakpoint = await import('../../src/hooks/useBreakpoint');
        useBreakpoint.default.mockReturnValue(false);
    });

    describe('Rendering', () => {
        test('renders TopNavbar component with default content', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            // Check if main elements are rendered
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
        });

        test('renders with default user data when localStorage is empty', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            expect(screen.getByText('Sharon Maina')).toBeInTheDocument();
            expect(screen.getByText('Admin')).toBeInTheDocument();
        });

        test('renders with user data from localStorage', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData));

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            // Wait for useEffect to run and update state
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            expect(screen.getByText('Admin')).toBeInTheDocument();
            expect(screen.getByAltText('User Avatar')).toHaveAttribute('src', mockUserData.avatar);
        });

        test('renders user avatar with correct attributes', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            const avatar = screen.getByAltText('User Avatar');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveClass('user-avatar');
            expect(avatar).toHaveAttribute('src', defaultUserData.avatar);
        });

        test('renders mobile hamburger menu button on mobile', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
        });

        test('renders EcoVibe logo', () => {
            localStorageMock.getItem.mockReturnValue(null);

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            const logo = screen.getByAltText('EcoVibe Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('src', '/EcovibeLogo.png');
        });
    });

    describe('Mobile Functionality', () => {
        test('opens mobile sidebar when hamburger menu is clicked', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            const user = userEvent.setup();

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            const menuButton = screen.getByLabelText('Toggle sidebar');
            await user.click(menuButton);

            await waitFor(() => {
                expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
            });
        });

        test('closes mobile sidebar when close button is clicked', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            const user = userEvent.setup();

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            // Open sidebar
            const menuButton = screen.getByLabelText('Toggle sidebar');
            await user.click(menuButton);

            await waitFor(() => {
                expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
            });

            // Close sidebar
            const offcanvas = screen.getByTestId('offcanvas');
            await user.click(offcanvas);

            await waitFor(() => {
                expect(screen.queryByTestId('offcanvas')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('handles invalid localStorage data gracefully', () => {
            localStorageMock.getItem.mockReturnValue('invalid-json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            render(
                <RouterWrapper>
                    <TopNavbar />
                </RouterWrapper>
            );

            expect(consoleSpy).toHaveBeenCalledWith('Error parsing user data:', expect.any(Error));
            expect(screen.getByText('Sharon Maina')).toBeInTheDocument(); // Falls back to default

            consoleSpy.mockRestore();
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