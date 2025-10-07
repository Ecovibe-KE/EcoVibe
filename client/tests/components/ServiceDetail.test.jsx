import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceDetail from "../../src/components/ServiceDetail";
import * as serviceAPI from "../../src/api/services/servicemanagement";
import * as bookingAPI from "../../src/api/services/booking";

// ---- Mocks ----
vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
    ToastContainer: () => <div />,
}));

vi.mock("../../src/api/services/servicemanagement", () => ({
    getServiceById: vi.fn(),
}));

vi.mock("../../src/api/services/booking", () => ({
    createBooking: vi.fn(),
}));

// Mock AuthContext to properly handle authentication state
const mockNavigate = vi.fn();
vi.mock("../../src/context/AuthContext", () => ({
    useAuth: () => ({
        user: { id: 1, name: "Test User" },
        isActive: true
    }),
}));

// Improved BookingForm mock
vi.mock("../../src/components/BookingForm", () => ({
    __esModule: true,
    default: ({ onSubmit, onClose }) => (
        <div data-testid="booking-form" role="dialog" aria-modal="true">
            <h2>Booking Form</h2>
            <button onClick={() => onSubmit({ service_id: "1" })}>Submit Booking</button>
            <button onClick={onClose}>Close Modal</button>
        </div>
    ),
}));

vi.mock("../../src/components/admin/ServiceAdminMain", () => ({
    displayDuration: (duration) => duration,
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: () => ({ id: "1" }),
        useNavigate: () => mockNavigate,
    };
});

// ---- Tests ----
describe("ServiceDetail Component", () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        vi.clearAllMocks();
    });

    it("renders loading spinner initially", async () => {
        serviceAPI.getServiceById.mockResolvedValueOnce({
            status: "success",
            data: {},
        });

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        expect(screen.getByText(/Loading service/i)).toBeInTheDocument();
    });

    it("renders unavailable state when service array is empty", async () => {
        serviceAPI.getServiceById.mockRejectedValueOnce(new Error("Server unavailable"));

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Server unavailable. Failed to fetch service, please try again later"
            );
        });

        expect(screen.getByText(/Service Unavailable/i)).toBeInTheDocument();
    });

    it("renders service details correctly", async () => {
        serviceAPI.getServiceById.mockResolvedValueOnce({
            status: "success",
            data: {
                id: 1,
                title: "Sustainability Audit",
                description: "Comprehensive ESG audit service",
                currency: "KES",
                price: 4500,
                duration: "2 hr 30 min",
                image: "data:image/png;base64,xyz",
            },
        });

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Sustainability Audit/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Price: KES 4500/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Book Now/i })).toBeInTheDocument();
    });

    it("opens and closes booking modal", async () => {
        serviceAPI.getServiceById.mockResolvedValueOnce({
            status: "success",
            data: {
                id: 1,
                title: "Energy Audit",
                description: "Check your carbon footprint",
                currency: "KES",
                price: 3000,
                duration: "1 hr 0 min",
                image: "data:image/png;base64,abc",
            },
        });

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        // Wait for service to load
        await waitFor(() => {
            expect(screen.getByText(/Energy Audit/i)).toBeInTheDocument();
        });

        // Click Book Now button
        const bookBtn = screen.getByRole("button", { name: /Book Now/i });
        fireEvent.click(bookBtn);

        // Wait for modal to appear
        await waitFor(() => {
            expect(screen.getByTestId("booking-form")).toBeInTheDocument();
        });

        // Close modal
        const closeBtn = screen.getByText(/Close Modal/i);
        fireEvent.click(closeBtn);

        // Wait for modal to disappear
        await waitFor(() => {
            expect(screen.queryByTestId("booking-form")).not.toBeInTheDocument();
        });
    });

    it("submits booking successfully and shows success toast", async () => {
        serviceAPI.getServiceById.mockResolvedValueOnce({
            status: "success",
            data: {
                id: 1,
                title: "Sustainability Advisory",
                description: "Helping you achieve your ESG goals",
                currency: "KES",
                price: 8000,
                duration: "3 hr 15 min",
                image: "data:image/png;base64,abc",
            },
        });

        bookingAPI.createBooking.mockResolvedValueOnce({
            status: "success",
            message: "Booking created successfully!",
        });

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        // Wait for service to load
        await waitFor(() => {
            expect(screen.getByText(/Sustainability Advisory/i)).toBeInTheDocument();
        });

        // Open booking modal
        const bookBtn = screen.getByRole("button", { name: /Book Now/i });
        fireEvent.click(bookBtn);

        // Wait for modal and submit booking
        await waitFor(() => {
            expect(screen.getByTestId("booking-form")).toBeInTheDocument();
        });

        const submitBtn = screen.getByText(/Submit Booking/i);
        fireEvent.click(submitBtn);

        // Verify booking was created and success toast shown
        await waitFor(() => {
            expect(bookingAPI.createBooking).toHaveBeenCalledWith({ service_id: "1" });
            expect(toast.success).toHaveBeenCalledWith("Booking created successfully!");
        });
    });

    it("shows error toast when booking creation fails", async () => {
        serviceAPI.getServiceById.mockResolvedValueOnce({
            status: "success",
            data: {
                id: 1,
                title: "Impact Assessment",
                description: "Environmental impact evaluation",
                currency: "KES",
                price: 5000,
                duration: "2 hr 0 min",
                image: "data:image/png;base64,def",
            },
        });

        bookingAPI.createBooking.mockRejectedValueOnce(new Error("Network Error"));

        render(
            <MemoryRouter>
                <ServiceDetail />
            </MemoryRouter>
        );

        // Wait for service to load
        await waitFor(() => {
            expect(screen.getByText(/Impact Assessment/i)).toBeInTheDocument();
        });

        // Open booking modal
        const bookBtn = screen.getByRole("button", { name: /Book Now/i });
        fireEvent.click(bookBtn);

        // Wait for modal and submit booking
        await waitFor(() => {
            expect(screen.getByTestId("booking-form")).toBeInTheDocument();
        });

        const submitBtn = screen.getByText(/Submit Booking/i);
        fireEvent.click(submitBtn);

        // Verify error handling
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to create booking");
        });
    });
});