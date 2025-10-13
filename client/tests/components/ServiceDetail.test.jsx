// ServiceDetail.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ServiceDetail from "../../src/components/ServiceDetail";
import * as serviceManagement from "../../src/api/services/servicemanagement";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: { 
    error: vi.fn(), 
    success: vi.fn(),
    info: vi.fn() 
  },
  ToastContainer: () => <div>ToastContainer</div>,
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useNavigate: () => mockedNavigate,
  };
});

// Mock useAuth
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isActive: false,
    isAtLeastAdmin: false,
  }),
}));

// Mock BookingForm
vi.mock("../../src/components/BookingForm", () => ({
  default: ({ onClose, onSubmit }) => (
    <div data-testid="booking-form">
      <button onClick={onClose}>Close Booking</button>
      <button onClick={() => onSubmit({ start_time: "2024-01-01T10:00", service_id: 1 })}>Submit Booking</button>
    </div>
  ),
}));

// Mock displayDuration
vi.mock("../../src/components/admin/ServiceAdminMain", () => ({
  displayDuration: (duration) => duration,
}));

describe("ServiceDetail component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading initially", async () => {
    // Mock the service fetch to resolve after a delay so we can check loading
    vi.spyOn(serviceManagement, "getServiceById").mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        status: "success",
        data: null,
      }), 100))
    );

    render(
      <BrowserRouter>
        <ServiceDetail />
      </BrowserRouter>
    );

    // Check for loading spinner
    expect(screen.getByText(/Loading service.../i)).toBeInTheDocument();
  });

  it("displays service details after fetch", async () => {
    const mockService = {
      id: 1,
      title: "Test Service",
      description: "This is a test service description.",
      currency: "KES",
      price: 1000,
      duration: "1 hr 30 min",
      image: "https://example.com/image.jpg",
    };

    vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
      status: "success",
      data: mockService,
    });

    render(
      <BrowserRouter>
        <ServiceDetail />
      </BrowserRouter>
    );

    // Wait for the service details to appear
    await waitFor(() => {
      expect(screen.getByText("Test Service")).toBeInTheDocument();
    });

    expect(screen.getByText("This is a test service description.")).toBeInTheDocument();
    expect(screen.getByText("KES 1000")).toBeInTheDocument();
    expect(screen.getByText("1 hr 30 min")).toBeInTheDocument();
  });

  it("shows login message when not authenticated", async () => {
    const mockService = {
      id: 1,
      title: "Test Service",
      description: "Test description",
      currency: "KES",
      price: 1000,
      duration: "1 hr",
      image: "https://example.com/image.jpg",
    };

    vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
      status: "success",
      data: mockService,
    });

    render(
      <BrowserRouter>
        <ServiceDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Service")).toBeInTheDocument();
    });

    // Check for login message
    expect(screen.getByText(/Please log in to book this service/i)).toBeInTheDocument();
  });

  it("renders back to services button", async () => {
    const mockService = {
      id: 1,
      title: "Test Service",
      description: "Test description",
      currency: "KES",
      price: 1000,
      duration: "1 hr",
      image: "https://example.com/image.jpg",
    };

    vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
      status: "success",
      data: mockService,
    });

    render(
      <BrowserRouter>
        <ServiceDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Service")).toBeInTheDocument();
    });

    // Check for back button
    const backButton = screen.getByText(/Back to Services/i);
    expect(backButton).toBeInTheDocument();

    // Test back button navigation
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith("/services");
  });

  it("handles service not found", async () => {
    vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
      status: "error",
      message: "Service not found",
      data: [],
    });

    render(
      <BrowserRouter>
        <ServiceDetail />
      </BrowserRouter>
    );

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText(/Service Unavailable/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Please check back later/i)).toBeInTheDocument();
  });
});