// Services.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Services from '../../src/components/Services';

// Only mock what's absolutely necessary
vi.mock('../../src/api/services/servicemanagement', () => ({
    getServices: vi.fn(),
}));

// Mock CSS
vi.mock('../../src/css/Services.css', () => ({}));

// Import after mocks
import { getServices } from '../../src/api/services/servicemanagement';

describe('Services Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        // Mock useNavigate
        vi.mock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useNavigate: () => mockNavigate,
            };
        });

        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <Services />
            </BrowserRouter>
        );
    };

    // Test 1: Loading state
    it('shows loading spinner initially', () => {
        getServices.mockImplementation(() => new Promise(() => { }));

        renderComponent();

        expect(screen.getByText('Loading service...')).toBeInTheDocument();
    });

    // Test 2: Successful data load
    it('displays active services when API call succeeds', async () => {
        const mockServices = [
            {
                id: 1,
                title: 'ESG Consulting',
                description: 'Comprehensive ESG consulting services',
                status: 'active',
                image: 'test-image-1.jpg',
            },
            {
                id: 2,
                title: 'Sustainability Reporting',
                description: 'Help with sustainability reporting',
                status: 'active',
                image: 'test-image-2.jpg',
            },
        ];

        getServices.mockResolvedValue({
            status: 'success',
            data: mockServices,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('ESG Consulting')).toBeInTheDocument();
        });

        expect(screen.getByText('Sustainability Reporting')).toBeInTheDocument();
        expect(screen.getByText('Comprehensive ESG consulting services')).toBeInTheDocument();
    });

    // Test 3: Empty state
    it('shows empty state when no active services', async () => {
        getServices.mockResolvedValue({
            status: 'success',
            data: [],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No Services Available')).toBeInTheDocument();
        });

        expect(screen.getByText('Contact Our Team')).toBeInTheDocument();
    });

    // Test 4: API error with failed status
    it('shows error toast when API returns failed status', async () => {
        // Mock toast
        const toastError = vi.fn();
        vi.mock('react-toastify', () => ({
            toast: {
                error: toastError,
                success: vi.fn(),
            },
            ToastContainer: () => <div>Toast Container</div>,
        }));

        getServices.mockResolvedValue({
            status: 'failed',
            message: 'Database error',
        });

        renderComponent();

        await waitFor(() => {
            expect(toastError).toHaveBeenCalledWith('Failed to fetch services: Database error.');
        });
    });

    // Test 5: Network error
    it('shows server error toast when network fails', async () => {
        const toastError = vi.fn();
        vi.mock('react-toastify', () => ({
            toast: {
                error: toastError,
                success: vi.fn(),
            },
            ToastContainer: () => <div>Toast Container</div>,
        }));

        getServices.mockRejectedValue(new Error('Network error'));

        renderComponent();

        await waitFor(() => {
            expect(toastError).toHaveBeenCalledWith('Server unavailable. Please try again later');
        });
    });

    // Test 6: Navigation to service details
    it('navigates to service details on Learn More click', async () => {
        getServices.mockResolvedValue({
            status: 'success',
            data: [{
                id: 1,
                title: 'Test Service',
                description: 'Test Description',
                status: 'active',
                image: 'test.jpg',
            }],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Learn More')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Learn More'));
        expect(mockNavigate).toHaveBeenCalledWith('/services/1');
    });

    // Test 7: Navigation to contact page from empty state
    it('navigates to contact page from empty state', async () => {
        getServices.mockResolvedValue({
            status: 'success',
            data: [],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Contact Our Team')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Contact Our Team'));
        expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    // Test 8: Hero section content
    it('renders hero section content', async () => {
        getServices.mockResolvedValue({
            status: 'success',
            data: [{
                id: 1,
                title: 'Test Service',
                description: 'Test Description',
                status: 'active',
                image: 'test.jpg',
            }],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Our Sustainable Services')).toBeInTheDocument();
        });
    });

    // Test 9: Approach steps
    it('renders approach steps', async () => {
        getServices.mockResolvedValue({
            status: 'success',
            data: [{
                id: 1,
                title: 'Test Service',
                description: 'Test Description',
                status: 'active',
                image: 'test.jpg',
            }],
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Our Approach')).toBeInTheDocument();
        });

        expect(screen.getByText('Assessment & Analysis')).toBeInTheDocument();
        expect(screen.getByText('Strategy Development')).toBeInTheDocument();
        expect(screen.getByText('Implementation Support')).toBeInTheDocument();
    });

    // Test 10: Filtering inactive services
    it('filters out inactive services', async () => {
        const mockServices = [
            {
                id: 1,
                title: 'Active Service',
                description: 'Active description',
                status: 'active',
                image: 'test.jpg',
            },
            {
                id: 2,
                title: 'Inactive Service',
                description: 'Inactive description',
                status: 'inactive',
                image: 'test.jpg',
            },
        ];

        getServices.mockResolvedValue({
            status: 'success',
            data: mockServices,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Active Service')).toBeInTheDocument();
        });

        expect(screen.queryByText('Inactive Service')).not.toBeInTheDocument();
    });

    // Test 11: Case insensitive status filtering
    it('handles different case status values', async () => {
        const mockServices = [
            {
                id: 1,
                title: 'Service 1',
                description: 'Desc 1',
                status: 'ACTIVE',
                image: 'test.jpg',
            },
            {
                id: 2,
                title: 'Service 2',
                description: 'Desc 2',
                status: 'Active',
                image: 'test.jpg',
            },
        ];

        getServices.mockResolvedValue({
            status: 'success',
            data: mockServices,
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Service 1')).toBeInTheDocument();
        });

        expect(screen.getByText('Service 2')).toBeInTheDocument();
    });
});