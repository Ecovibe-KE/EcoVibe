import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {BrowserRouter} from "react-router-dom";
import ServiceDetail from "../../src/components/ServiceDetail";
import * as serviceManagement from "../../src/api/services/servicemanagement";
import {toast} from "react-toastify";

// Mock react-toastify
vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn()
    },
    ToastContainer: () => <div>ToastContainer</div>,
}));

// Mock useNavigate and useParams
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: () => ({id: "1"}),
        useNavigate: () => mockedNavigate,
    };
});

// Mock RequestQuoteModal
vi.mock("../../src/components/RequestQuoteModal", () => ({
    default: ({show, onHide, service}) => (
        show && (
            <div data-testid="request-quote-modal">
                <span>Request Quote for {service?.title}</span>
                <button onClick={onHide}>Close</button>
            </div>
        )
    ),
}));

describe("ServiceDetail component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading initially", async () => {
        vi.spyOn(serviceManagement, "getServiceById").mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({
                status: "success",
                data: null,
            }), 100))
        );

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        expect(screen.getByText(/Loading service.../i)).toBeInTheDocument();
    });

    it("displays service details after fetch", async () => {
        const mockService = {
            id: 1,
            title: "Test Service",
            description: "This is a test service description.",
            image: "https://example.com/image.jpg",
        };

        vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
            status: "success",
            data: mockService,
        });

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Service")).toBeInTheDocument();
        });

        expect(screen.getByText("This is a test service description.")).toBeInTheDocument();
        expect(screen.getByAltText("Test Service")).toBeInTheDocument();
    });

    it("renders back to services button and navigates correctly", async () => {
        const mockService = {
            id: 1,
            title: "Test Service",
            description: "Test description",
            image: "https://example.com/image.jpg",
        };

        vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
            status: "success",
            data: mockService,
        });

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Service")).toBeInTheDocument();
        });

        const backButton = screen.getByText(/Back to Services/i);
        expect(backButton).toBeInTheDocument();

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
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Service Unavailable/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Please check back later/i)).toBeInTheDocument();
    });

    it("renders contact button in error state and triggers toast", async () => {
        vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
            status: "error",
            message: "Service not found",
            data: [],
        });

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Service Unavailable/i)).toBeInTheDocument();
        });

        const contactButton = screen.getByText(/Contact Our Team/i);
        expect(contactButton).toBeInTheDocument();

        fireEvent.click(contactButton);
        expect(toast.info).toHaveBeenCalledWith("Contact feature coming soon!");
    });

    it("renders request quote button and opens modal", async () => {
        const mockService = {
            id: 1,
            title: "Test Service",
            description: "Test description",
            image: "https://example.com/image.jpg",
        };

        vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
            status: "success",
            data: mockService,
        });

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Service")).toBeInTheDocument();
        });

        const requestQuoteButton = screen.getByText(/Request a Quote/i);
        expect(requestQuoteButton).toBeInTheDocument();

        fireEvent.click(requestQuoteButton);
        expect(screen.getByTestId("request-quote-modal")).toBeInTheDocument();
        expect(screen.getByText(`Request Quote for ${mockService.title}`)).toBeInTheDocument();
    });

    it("closes request quote modal", async () => {
        const mockService = {
            id: 1,
            title: "Test Service",
            description: "Test description",
            image: "https://example.com/image.jpg",
        };

        vi.spyOn(serviceManagement, "getServiceById").mockResolvedValue({
            status: "success",
            data: mockService,
        });

        render(
            <BrowserRouter>
                <ServiceDetail/>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Service")).toBeInTheDocument();
        });

        const requestQuoteButton = screen.getByText(/Request a Quote/i);
        fireEvent.click(requestQuoteButton);
        expect(screen.getByTestId("request-quote-modal")).toBeInTheDocument();

        const closeButton = screen.getByText(/Close/i);
        fireEvent.click(closeButton);
        await waitFor(() => {
            expect(screen.queryByTestId("request-quote-modal")).not.toBeInTheDocument();
        });
    });

});