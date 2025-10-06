// client/tests/components/ServiceAdminMain.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceAdminMain, { displayDuration } from "../../src/components/admin/ServiceAdminMain";

// --- Unit tests for displayDuration function ---
describe("displayDuration", () => {
    it("returns only hours if minutes < 1", () => {
        expect(displayDuration("2 hr")).toBe("2 hr");
        expect(displayDuration("2hrs")).toBe("2 hr");
    });

    it("returns only minutes if hours < 1", () => {
        expect(displayDuration("45 min")).toBe("45 min");
    });

    it("returns both hours and minutes if both present", () => {
        expect(displayDuration("1 hr 30 min")).toBe("1 hr 30 min");
    });

    it("handles weird formats gracefully", () => {
        expect(displayDuration("3hrs30min")).toBe("3 hr 30 min");
        expect(displayDuration("0hr 15 min")).toBe("15 min");
        expect(displayDuration("2hrs")).toBe("2 hr");
        expect(displayDuration("0 hr 0 min")).toBe("0 hr");
        expect(displayDuration("")).toBe("0 hr");
    });
});

// --- Component tests for ServiceAdminMain ---
describe("ServiceAdminMain", () => {
    const baseProps = {
        serviceId: 1,
        serviceImage: "test-image.jpg",
        serviceTitle: "Test Service",
        serviceDescription: "A great service",
        serviceDuration: "1 hr 30 min",
        priceCurrency: "KES",
        servicePrice: 2000,
        serviceStatus: "active",
        handleShowEdit: vi.fn(),
        handleShowDelete: vi.fn(),
        getServiceId: vi.fn(),
        setFormData: vi.fn(),
        setPreviewUrl: vi.fn(),
        setOriginalServiceData: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all service data correctly", () => {
        render(<ServiceAdminMain {...baseProps} />);
        expect(screen.getByText("Test Service")).toBeInTheDocument();
        expect(screen.getByText("A great service")).toBeInTheDocument();
        expect(screen.getByText("KES 2000")).toBeInTheDocument();
        expect(screen.getByText("1 hr 30 min")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
        expect(screen.getByAltText("service image")).toHaveAttribute("src", "test-image.jpg");
    });

    it("calls edit handlers when Edit is clicked", () => {
        render(<ServiceAdminMain {...baseProps} />);
        const editBtn = screen.getByRole("button", { name: /edit/i });
        fireEvent.click(editBtn);

        expect(baseProps.handleShowEdit).toHaveBeenCalled();
        expect(baseProps.getServiceId).toHaveBeenCalled();
        expect(baseProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
            serviceTitle: baseProps.serviceTitle,
        }));
        expect(baseProps.setOriginalServiceData).toHaveBeenCalledWith(expect.objectContaining({
            title: baseProps.serviceTitle,
        }));
        expect(baseProps.setPreviewUrl).toHaveBeenCalledWith(expect.any(Function));
    });

    it("calls delete handlers when Delete is clicked", () => {
        render(<ServiceAdminMain {...baseProps} />);
        const deleteBtn = screen.getByRole("button", { name: /delete/i });
        fireEvent.click(deleteBtn);

        expect(baseProps.handleShowDelete).toHaveBeenCalled();
        expect(baseProps.getServiceId).toHaveBeenCalled();
        expect(baseProps.setOriginalServiceData).toHaveBeenCalledWith({ title: baseProps.serviceTitle });
    });

    it("hides status if service is inactive", () => {
        const inactiveProps = { ...baseProps, serviceStatus: "inactive" };
        render(<ServiceAdminMain {...inactiveProps} />);
        const statusText = screen.getByText("inactive");
        expect(statusText).toHaveClass("invisible");
    });

    it("does not hide status if service is active", () => {
        render(<ServiceAdminMain {...baseProps} />);
        const statusText = screen.getByText("active");
        expect(statusText).not.toHaveClass("invisible");
    });

    it("handles duration with only minutes", () => {
        const props = { ...baseProps, serviceDuration: "45 min" };
        render(<ServiceAdminMain {...props} />);
        expect(screen.getByText("45 min")).toBeInTheDocument();
    });

    it("handles duration with only hours", () => {
        const props = { ...baseProps, serviceDuration: "3 hrs" };
        render(<ServiceAdminMain {...props} />);
        expect(screen.getByText("3 hr")).toBeInTheDocument();
    });

    it("handles duration with neither", () => {
        const props = { ...baseProps, serviceDuration: "" };
        render(<ServiceAdminMain {...props} />);
        expect(screen.getByText("0 hr")).toBeInTheDocument();
    });
});
