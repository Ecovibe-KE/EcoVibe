// Services.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Services from '../../src/components/Services';

// Mock react-bootstrap with proper component structure
vi.mock('react-bootstrap', () => {
  const MockContainer = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  const MockRow = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  const MockCol = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  const MockCard = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  MockCard.Img = ({ src, alt, className, ...props }) => (
    <img src={src} alt={alt} className={className} {...props} />
  );

  MockCard.Body = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  MockCard.Title = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  MockCard.Text = ({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  );

  const MockButton = ({ children, onClick, className, style, ...props }) => (
    <button
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </button>
  );

  const MockSpinner = ({ animation, role, variant, children }) => (
    <div
      data-testid="spinner"
      data-animation={animation}
      data-role={role}
      data-variant={variant}
    >
      {children}
    </div>
  );

  return {
    Container: MockContainer,
    Row: MockRow,
    Col: MockCol,
    Card: MockCard,
    Button: MockButton,
    Spinner: MockSpinner,
  };
});

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: vi.fn(() => <div data-testid="toast-container">Toast Container</div>),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock API
vi.mock('../../src/api/services/servicemanagement', () => ({
  getServices: vi.fn(),
}));

// Mock CSS
vi.mock('../../src/css/Services.css', () => ({}));

// Import after mocks
import { useNavigate } from 'react-router-dom';
import { getServices } from '../../src/api/services/servicemanagement';
import { toast } from 'react-toastify';

describe('Services Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  const mockServicesData = [
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
    {
      id: 3,
      title: 'Inactive Service',
      description: 'This service is inactive',
      status: 'inactive',
      image: 'test-image-3.jpg',
    },
  ];

  describe('Initial Loading State', () => {
    it('should show loading spinner when services are being fetched', () => {
      getServices.mockImplementation(() => new Promise(() => { }));

      renderWithRouter(<Services />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading service...')).toBeInTheDocument();
    });
  });

  describe('Successful API Calls', () => {
    it('should display services when API call is successful and there are active services', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('ESG Consulting')).toBeInTheDocument();
      });

      expect(screen.getByText('Sustainability Reporting')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Service')).not.toBeInTheDocument();

      // Check descriptions
      expect(screen.getByText('Comprehensive ESG consulting services')).toBeInTheDocument();
      expect(screen.getByText('Help with sustainability reporting')).toBeInTheDocument();

      // Check Learn More buttons
      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons).toHaveLength(2);
    });

    it('should filter and display only active services', async () => {
      const mixedServices = [
        { id: 1, title: 'Active Service 1', description: 'Desc 1', status: 'active', image: 'img1.jpg' },
        { id: 2, title: 'Inactive Service', description: 'Desc 2', status: 'inactive', image: 'img2.jpg' },
        { id: 3, title: 'Active Service 2', description: 'Desc 3', status: 'active', image: 'img3.jpg' },
      ];

      getServices.mockResolvedValue({
        status: 'success',
        data: mixedServices,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Active Service 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Active Service 2')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Service')).not.toBeInTheDocument();

      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons).toHaveLength(2);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no active services are available', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: [
          { id: 1, title: 'Service', description: 'Desc', status: 'inactive', image: 'img.jpg' },
        ],
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });

      expect(screen.getByText(/We're currently updating our service offerings/)).toBeInTheDocument();
      expect(screen.getByText('Contact Our Team')).toBeInTheDocument();
    });

    it('should show empty state when API returns empty array', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: [],
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });
    });
  });

  describe('API Error Handling', () => {
    it('should show error toast when API returns error status', async () => {
      getServices.mockResolvedValue({
        status: 'failed',
        message: 'Database connection error',
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch services: Database connection error.'
        );
      });

      // Should show empty state after error
      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });
    });

    it('should show server unavailable toast when API call throws an error', async () => {
      getServices.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Server unavailable. Please try again later'
        );
      });

      // Should show empty state after error
      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });
    });

    it('should handle case insensitive status filtering', async () => {
      const servicesWithDifferentCases = [
        { id: 1, title: 'Service 1', description: 'Desc 1', status: 'ACTIVE', image: 'img1.jpg' },
        { id: 2, title: 'Service 2', description: 'Desc 2', status: 'Active', image: 'img2.jpg' },
        { id: 3, title: 'Service 3', description: 'Desc 3', status: 'active', image: 'img3.jpg' },
      ];

      getServices.mockResolvedValue({
        status: 'success',
        data: servicesWithDifferentCases,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Service 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Service 2')).toBeInTheDocument();
      expect(screen.getByText('Service 3')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to service details when Learn More button is clicked', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: [mockServicesData[0]],
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Learn More')).toBeInTheDocument();
      });

      const learnMoreButton = screen.getByText('Learn More');
      fireEvent.click(learnMoreButton);

      expect(mockNavigate).toHaveBeenCalledWith('/services/1');
    });

    it('should navigate to contact page when Contact Our Team button is clicked in empty state', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: [],
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Contact Our Team')).toBeInTheDocument();
      });

      const contactButton = screen.getByText('Contact Our Team');
      fireEvent.click(contactButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });

    it('should navigate to contact page when Contact Our Team button is clicked in approach section', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('ESG Consulting')).toBeInTheDocument();
      });

      // Find all Contact Our Team buttons and click the second one (approach section)
      const contactButtons = screen.getAllByText('Contact Our Team');
      expect(contactButtons).toHaveLength(1); // Only one when services exist

      fireEvent.click(contactButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });
  });

  describe('UI Rendering', () => {
    it('should render hero section with correct content', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Our Sustainable Services')).toBeInTheDocument();
      });

      expect(screen.getByText(/At Ecovibe Kenya, we provide comprehensive ESG/)).toBeInTheDocument();
    });

    it('should render approach section with all steps', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Our Approach')).toBeInTheDocument();
      });

      expect(screen.getByText('Tailored Sustainable Solutions')).toBeInTheDocument();
      expect(screen.getByText('Assessment & Analysis')).toBeInTheDocument();
      expect(screen.getByText('Strategy Development')).toBeInTheDocument();
      expect(screen.getByText('Implementation Support')).toBeInTheDocument();
    });

    it('should render ToastContainer', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null services data gracefully', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: null,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });
    });

    it('should handle undefined services data gracefully', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: undefined,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('No Services Available')).toBeInTheDocument();
      });
    });

    it('should handle services with missing properties', async () => {
      const incompleteServices = [
        { id: 1, title: 'Service 1' }, // missing status, description, image
        { id: 2, title: 'Service 2', status: 'active' }, // missing description, image
      ];

      getServices.mockResolvedValue({
        status: 'success',
        data: incompleteServices,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        // Should handle missing properties and display Service 2 (active)
        expect(screen.getByText('Service 2')).toBeInTheDocument();
      });
    });
  });

  describe('Approach Steps', () => {
    it('should render all three approach steps with correct numbers and content', async () => {
      getServices.mockResolvedValue({
        status: 'success',
        data: mockServicesData,
      });

      renderWithRouter(<Services />);

      await waitFor(() => {
        expect(screen.getByText('Assessment & Analysis')).toBeInTheDocument();
      });

      expect(screen.getByText('Strategy Development')).toBeInTheDocument();
      expect(screen.getByText('Implementation Support')).toBeInTheDocument();

      // Check step descriptions
      expect(screen.getByText(/We begin with a comprehensive analysis/)).toBeInTheDocument();
      expect(screen.getByText(/We co-create a tailored ESG strategy/)).toBeInTheDocument();
      expect(screen.getByText(/We provide hands-on support/)).toBeInTheDocument();
    });
  });
});