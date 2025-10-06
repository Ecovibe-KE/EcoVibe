import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Services from "../../src/components/Services";
import * as serviceAPI from "../../src/api/services/servicemanagement";

// ---- Mock dependencies ----
vi.mock("react-toastify", () => ({
    toast: { error: vi.fn() },
    ToastContainer: () => <div />,
}));

vi.mock("../../src/api/services/servicemanagement", () => ({
    getServices: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// ---- Test Suite ----
describe("Services Component", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading spinner initially", async () => {
        serviceAPI.getServices.mockResolvedValueOnce({
            status: "success",
            data: [],
        });

        render(
            <MemoryRouter>
                <Services />
            </MemoryRouter>
        );

        // Spinner should be visible at first render
        expect(screen.getByText(/Loading service/i)).toBeInTheDocument();
    });

    it("renders 'No Services Available' when API returns empty list", async () => {
        serviceAPI.getServices.mockResolvedValueOnce({
            status: "success",
            data: [],
        });

        render(
            <MemoryRouter>
                <Services />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No Services Available/i)).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /Contact Our Team/i })
            ).toBeInTheDocument();
        });
    });

    it("renders active services correctly", async () => {
        serviceAPI.getServices.mockResolvedValueOnce({
            status: "success",
            data: [
                {
                    id: 1,
                    title: "ESG Strategy Development",
                    description: "We help businesses build sustainability strategies.",
                    image: "data:image/png;base64,abc",
                    status: "active",
                },
                {
                    id: 2,
                    title: "Inactive Service",
                    description: "This one should not appear",
                    image: "data:image/png;base64,xyz",
                    status: "inactive",
                },
            ],
        });

        render(
            <MemoryRouter>
                <Services />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/ESG Strategy Development/i)
            ).toBeInTheDocument();
            expect(screen.queryByText(/Inactive Service/i)).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Learn More/i })).toBeInTheDocument();
        });
    });

    it("shows toast error and renders 'No Services Available' when fetch fails", async () => {
        serviceAPI.getServices.mockRejectedValueOnce(new Error("Server unavailable"));

        render(
            <MemoryRouter>
                <Services />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Server unavailable. Please try again later"
            );
            expect(screen.getByText(/No Services Available/i)).toBeInTheDocument();
        });
    });

    it("shows toast error when API returns failed status", async () => {
        serviceAPI.getServices.mockResolvedValueOnce({
            status: "failed",
            message: "Something went wrong",
        });

        render(
            <MemoryRouter>
                <Services />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Failed to fetch services: Something went wrong."
            );
        });
    });
});