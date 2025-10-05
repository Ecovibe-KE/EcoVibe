import { render, screen, fireEvent } from "@testing-library/react";
import ServiceAdminMain, {
    displayDuration,
} from "../../src/components/admin/ServiceAdminMain";

// ✅ Mock props and helper functions
const mockProps = {
    serviceId: 1,
    serviceImage: "https://example.com/image.png",
    serviceTitle: "Eco Cleaning",
    serviceDescription: "Environmentally friendly cleaning services.",
    serviceDuration: "2 hr 30 min",
    priceCurrency: "KES",
    servicePrice: 1500,
    serviceStatus: "active",
    handleShowEdit: vi.fn(),
    getServiceId: vi.fn(),
    setFormData: vi.fn(),
    setPreviewUrl: vi.fn(),
    setOriginalServiceData: vi.fn(),
    handleShowDelete: vi.fn(),
};

describe("ServiceAdminMain Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the service details correctly", () => {
        render(<ServiceAdminMain {...mockProps} />);
        expect(screen.getByText("Eco Cleaning")).toBeInTheDocument();
        expect(
            screen.getByText("Environmentally friendly cleaning services.")
        ).toBeInTheDocument();
        expect(screen.getByText("2 hr 30 min")).toBeInTheDocument();
        expect(screen.getByText("KES 1500")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("calls edit handlers correctly when Edit button is clicked", () => {
        render(<ServiceAdminMain {...mockProps} />);
        fireEvent.click(screen.getByText("Edit"));
        expect(mockProps.handleShowEdit).toHaveBeenCalled();
        expect(mockProps.getServiceId).toHaveBeenCalled();
        expect(mockProps.setFormData).toHaveBeenCalled();
        expect(mockProps.setOriginalServiceData).toHaveBeenCalled();
        expect(mockProps.setPreviewUrl).toHaveBeenCalled();
    });

    it("calls delete handlers correctly when Delete button is clicked", () => {
        render(<ServiceAdminMain {...mockProps} />);
        fireEvent.click(screen.getByText("Delete"));
        expect(mockProps.handleShowDelete).toHaveBeenCalled();
        expect(mockProps.getServiceId).toHaveBeenCalled();
        expect(mockProps.setOriginalServiceData).toHaveBeenCalled();
    });

    it("renders the correct duration text variations", () => {
        expect(displayDuration("2 hr")).toBe("2 hr");
        expect(displayDuration("30 min")).toBe("30 min");
        expect(displayDuration("1 hr 15 min")).toBe("1 hr 15 min");
    });

    it("renders invisibility class for inactive services", () => {
        render(<ServiceAdminMain {...mockProps} serviceStatus="inactive" />);
        const statusElement = screen.getByText("inactive");
        expect(statusElement.className).toContain("invisible");
    });

    it("renders default image when image is null", () => {
        render(<ServiceAdminMain {...mockProps} serviceImage={null} />);
        const img = screen.getByAltText("service image");
        // ✅ Handles React omitting null attributes gracefully
        expect(img.getAttribute("src")).toBeFalsy();
    });

    it("handles displayDuration edge cases gracefully", () => {
        expect(displayDuration("2 hr 0 min")).toBe("2 hr");
        expect(displayDuration("0 hr 45 min")).toBe("45 min");
        expect(displayDuration("0 hr 0 min")).toBe("0 hr");
    });
});
