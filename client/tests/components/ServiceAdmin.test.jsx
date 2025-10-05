// client/tests/components/ServiceAdmin.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ServiceAdmin from "../../src/components/admin/ServiceAdmin";
import * as serviceApi from "../../src/api/services/servicemanagement";
import { toast } from "react-toastify";

// --- Mock child components to simplify rendering ---
vi.mock("../../src/components/admin/ServiceAdminTop", () => ({
    default: () => <div data-testid="mock-serviceadmin-top">Top</div>,
}));
vi.mock("../../src/components/admin/ServiceAdminMain", () => ({
    default: () => <div data-testid="mock-serviceadmin-main">Main</div>,
}));
vi.mock("../../src/components/admin/ServiceForm", () => ({
    default: () => <div data-testid="mock-serviceform">Form</div>,
}));
vi.mock("../../src/components/admin/EditServiceModal", () => ({
    default: () => <div data-testid="mock-editmodal">Edit Modal</div>,
}));
vi.mock("../../src/components/admin/DeleteServiceModal", () => ({
    default: () => <div data-testid="mock-deletemodal">Delete Modal</div>,
}));

// --- Mock toast so we can spy on error/success calls ---
vi.mock("react-toastify", async () => {
    const actual = await vi.importActual("react-toastify");
    return {
        ...actual,
        toast: {
            success: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
        },
    };
});

// --- Mock service API functions ---
vi.mock("../../src/api/services/servicemanagement", async () => {
    return {
        getServices: vi.fn(),
        addService: vi.fn(),
        updateService: vi.fn(),
        deleteService: vi.fn(),
    };
});

describe("ServiceAdmin Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders without crashing and fetches services on mount", async () => {
        serviceApi.getServices.mockResolvedValueOnce({
            status: "success",
            data: [],
        });

        render(<ServiceAdmin />);
        await waitFor(() => expect(serviceApi.getServices).toHaveBeenCalledTimes(1));
    });

    it("displays 'No Services added' when no services are returned", async () => {
        serviceApi.getServices.mockResolvedValueOnce({
            status: "success",
            data: [],
        });

        render(<ServiceAdmin />);
        await waitFor(() => {
            expect(screen.getByText(/No Services added/i)).toBeInTheDocument();
        });
    });

    it("shows toast error if fetching services fails", async () => {
        serviceApi.getServices.mockRejectedValueOnce(new Error("Network error"));

        render(<ServiceAdmin />);
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringMatching(/Failed to fetch service/i)
            );
        });
    });

    it("renders top service cards when services are returned", async () => {
        serviceApi.getServices.mockResolvedValueOnce({
            status: "success",
            data: [
                {
                    id: 1,
                    title: "Eco Cleanup",
                    description: "Test desc",
                    currency: "KES",
                    price: 1000,
                    duration: "1 hr 0 min",
                    status: "active",
                    image: "image-data",
                },
            ],
        });

        render(<ServiceAdmin />);
        await waitFor(() => {
            expect(screen.getAllByTestId("mock-serviceadmin-top").length).toBeGreaterThan(0);
            expect(screen.getByText(/All Services/i)).toBeInTheDocument();
        });
    });
});
