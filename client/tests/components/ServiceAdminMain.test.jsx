// ServiceAdminMain.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceAdminMain, { displayDuration } from "../../src/components/admin/ServiceAdminMain";

// Mock react-bootstrap
vi.mock("react-bootstrap", () => ({
  Col: ({ children, ...props }) => <div data-testid="col" {...props}>{children}</div>
}));

// --- Unit tests for displayDuration function ---
describe("displayDuration", () => {
  it("returns formatted duration for hours only", () => {
    expect(displayDuration("2 hr")).toBe("2 hr");
    expect(displayDuration("1 hrs")).toBe("1 hr");
  });

  it("returns formatted duration for minutes only", () => {
    expect(displayDuration("45 min")).toBe("45 min");
  });

  it("returns formatted duration for hours and minutes", () => {
    expect(displayDuration("1 hr 30 min")).toBe("1 hr 30 min");
    expect(displayDuration("2 hrs 15 min")).toBe("2 hr 15 min");
  });

  it("handles edge cases", () => {
    expect(displayDuration("")).toBe("0 hr");
    expect(displayDuration("0 hr 0 min")).toBe("0 hr");
    expect(displayDuration("0 hr 30 min")).toBe("30 min");
    expect(displayDuration("1 hr 0 min")).toBe("1 hr");
  });

  it("handles the specific regex pattern correctly", () => {
    // Test the exact pattern used in separateDuration
    expect(displayDuration("2hrs")).toBe("2 hr");
    expect(displayDuration("2hrs30min")).toBe("2 hr 30 min");
    expect(displayDuration("1 hr 45 min")).toBe("1 hr 45 min");
  });
});

// --- Component tests for ServiceAdminMain ---
describe("ServiceAdminMain", () => {
  const baseProps = {
    serviceId: 1,
    serviceImage: "test-image.jpg",
    serviceTitle: "Test Service",
    serviceDescription: "A great service for testing",
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

  it("renders service title and description", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    expect(screen.getByText("Test Service")).toBeInTheDocument();
    expect(screen.getByText("A great service for testing")).toBeInTheDocument();
  });

  it("renders service image with correct attributes", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    const image = screen.getByAltText("service image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");
    expect(image).toHaveClass("img-fluid rounded-top-2");
  });

  it("renders service details correctly", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    expect(screen.getByText("1 hr 30 min")).toBeInTheDocument();
    expect(screen.getByText("KES 2000")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("calls edit handlers with correct data when Edit button is clicked", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(baseProps.handleShowEdit).toHaveBeenCalledTimes(1);
    expect(baseProps.getServiceId).toHaveBeenCalledWith(expect.any(Function));
    expect(baseProps.setFormData).toHaveBeenCalledWith({
      serviceTitle: "Test Service",
      serviceDescription: "A great service for testing",
      priceCurrency: "KES",
      servicePrice: 2000,
      serviceDuration: { hours: 1, minutes: 30 },
      serviceImage: "test-image.jpg",
      serviceStatus: "active"
    });
    expect(baseProps.setOriginalServiceData).toHaveBeenCalledWith({
      title: "Test Service",
      description: "A great service for testing",
      currency: "KES",
      price: 2000,
      duration: "1 hr 30 min",
      image: "test-image.jpg",
      status: "active"
    });
    expect(baseProps.setPreviewUrl).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls delete handlers with correct data when Delete button is clicked", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(baseProps.handleShowDelete).toHaveBeenCalledTimes(1);
    expect(baseProps.getServiceId).toHaveBeenCalledWith(expect.any(Function));
    expect(baseProps.setOriginalServiceData).toHaveBeenCalledWith({
      title: "Test Service"
    });
  });

  it("applies invisible class when service status is inactive", () => {
    const inactiveProps = { ...baseProps, serviceStatus: "inactive" };
    render(<ServiceAdminMain {...inactiveProps} />);
    
    const statusElement = screen.getByText("inactive");
    expect(statusElement).toHaveClass("invisible");
  });

  it("does not apply invisible class when service status is active", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    const statusElement = screen.getByText("active");
    expect(statusElement).not.toHaveClass("invisible");
  });

  it("handles different duration formats in the component", () => {
    const testCases = [
      { duration: "2 hr", expected: "2 hr" },
      { duration: "45 min", expected: "45 min" },
      { duration: "1 hr 30 min", expected: "1 hr 30 min" },
      { duration: "3 hrs", expected: "3 hr" },
      { duration: "", expected: "0 hr" }
    ];

    testCases.forEach(({ duration, expected }) => {
      const props = { ...baseProps, serviceDuration: duration };
      const { unmount } = render(<ServiceAdminMain {...props} />);
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it("renders within a Col component", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    expect(screen.getByTestId("col")).toBeInTheDocument();
    expect(screen.getByTestId("col")).toHaveAttribute("md", "4");
  });

  it("has proper CSS classes for styling", () => {
    render(<ServiceAdminMain {...baseProps} />);
    
    const card = screen.getByText("Test Service").closest('.card');
    expect(card).toHaveClass("rounded-2", "shadow", "h-100");
    
    const statusElement = screen.getByText("active");
    expect(statusElement).toHaveClass("status-color", "fw-bold", "border", "rounded-pill", "p-2", "m-0");
  });
});