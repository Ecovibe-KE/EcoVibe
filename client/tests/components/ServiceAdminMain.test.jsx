import { render, screen, fireEvent } from "@testing-library/react";
import ServiceAdminMain, { displayDuration } from "../../src/components/admin/ServiceAdminMain";
import "@testing-library/jest-dom";

describe("ServiceAdminMain Component", () => {
    const mockProps = {
        serviceId: 1,
        serviceImage: "test-image.png",
        serviceTitle: "Eco Consulting",
        serviceDescription: "Helping companies become greener",
        serviceDuration: "2 hr 30 min",
        priceCurrency: "KES",
        servicePrice: 5000,
        serviceStatus: "active",
        handleShowEdit: vi.fn(),
        getServiceId: vi.fn(),
        setFormData: vi.fn(),
        setPreviewUrl: vi.fn(),
        setOriginalServiceData: vi.fn(),
        handleShowDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders service details correctly", () => {
        render(<ServiceAdminMain {...mockProps} />);
        expect(screen.getByText("Eco Consulting")).toBeInTheDocument();
        expect(screen.getByText("Helping companies become greener")).toBeInTheDocument();
        expect(screen.getByText(/KES 5000/)).toBeInTheDocument();
        expect(screen.getByText(/active/i)).toBeInTheDocument();
    });

    it("renders duration correctly using displayDuration()", () => {
        expect(displayDuration("2 hr 30 min")).toBe("2 hr 30 min");
        expect(displayDuration("2 hr 0 min")).toBe("2 hr");
        expect(displayDuration("0 hr 45 min")).toBe("45 min");
        expect(displayDuration("0 hr 0 min")).toBe("0 hr");
    });

    it("calls handleShowEdit and updates props correctly on Edit click", () => {
        render(<ServiceAdminMain {...mockProps} />);
        fireEvent.click(screen.getByText("Edit"));
        expect(mockProps.handleShowEdit).toHaveBeenCalled();
        expect(mockProps.getServiceId).toHaveBeenCalled();
        expect(mockProps.setFormData).toHaveBeenCalledWith(
            expect.objectContaining({
                serviceTitle: "Eco Consulting",
                serviceDescription: "Helping companies become greener",
                priceCurrency: "KES",
                servicePrice: 5000,
            })
        );
        expect(mockProps.setOriginalServiceData).toHaveBeenCalled();
        expect(mockProps.setPreviewUrl).toHaveBeenCalled();
    });

    it("calls handleShowDelete and updates props correctly on Delete click", () => {
        render(<ServiceAdminMain {...mockProps} />);
        fireEvent.click(screen.getByText("Delete"));
        expect(mockProps.handleShowDelete).toHaveBeenCalled();
        expect(mockProps.getServiceId).toHaveBeenCalled();
        expect(mockProps.setOriginalServiceData).toHaveBeenCalledWith({
            title: "Eco Consulting",
        });
    });

    it("renders invisible class when serviceStatus is inactive", () => {
        render(<ServiceAdminMain {...mockProps} serviceStatus="inactive" />);
        const statusEl = screen.getByText(/inactive/i);
        expect(statusEl).toHaveClass("invisible");
    });

    it("handles missing image gracefully", () => {
        render(<ServiceAdminMain {...mockProps} serviceImage={null} />);
        const img = screen.getByAltText("service image");
        expect(img).toBeInTheDocument();
        expect(img.getAttribute("src")).toBeNull(); // React omits src attribute when null
    });

    it("renders proper HTML structure", () => {
        render(<ServiceAdminMain {...mockProps} />);
        const img = screen.getByAltText("service image");
        expect(img).toHaveClass("img-fluid", "rounded-top-2");
        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    // Edge case: duration regex weird formats
    it("handles irregular duration strings gracefully", () => {
        expect(displayDuration("3 hrs")).toBe("3 hr");
        expect(displayDuration("15 min")).toBe("15 min");
        expect(displayDuration("")).toBe("0 hr");
    });
});
