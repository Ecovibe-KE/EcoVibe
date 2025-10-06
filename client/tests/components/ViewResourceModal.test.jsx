import { render, screen, fireEvent } from "@testing-library/react";
import ViewResourceModal from "../../src/components/admin/ViewResourceModal";
import { vi } from "vitest";

describe("ViewResourceModal Component", () => {
    const mockOnCancel = vi.fn();
    const mockOnDownload = vi.fn();

    const pdfResource = {
        title: "Sample PDF",
        fileType: "pdf",
        fileUrl: "http://example.com/sample.pdf",
    };

    const otherResource = {
        title: "Sample Image",
        fileType: "jpg",
        fileUrl: "http://example.com/sample.jpg",
    };

    beforeEach(() => {
        mockOnCancel.mockClear();
        mockOnDownload.mockClear();
    });

    it("renders null if not visible or resource is missing", () => {
        const { container: c1 } = render(
            <ViewResourceModal visible={false} resource={pdfResource} onCancel={mockOnCancel} onDownload={mockOnDownload} />
        );
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(
            <ViewResourceModal visible={true} resource={null} onCancel={mockOnCancel} onDownload={mockOnDownload} />
        );
        expect(c2.firstChild).toBeNull();
    });

    it("renders correctly with PDF resource and triggers onCancel", () => {
        render(
            <ViewResourceModal visible={true} resource={pdfResource} onCancel={mockOnCancel} onDownload={mockOnDownload} />
        );

        // Statement & line coverage: checks modal renders with PDF iframe
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(`View Resource: ${pdfResource.title}`)).toBeInTheDocument();

        // PDF iframe rendered
        const iframe = screen.getByTitle(pdfResource.title);
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute("src", pdfResource.fileUrl);

        // Close button (top right) click triggers onCancel
        const closeButton = screen.getAllByRole("button").find(btn => btn.classList.contains("btn-close"));
        fireEvent.click(closeButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);

        // Close button (bottom) click triggers onCancel
        const closeBottom = screen.getByRole("button", { name: /close/i });
        fireEvent.click(closeBottom);
        expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });

    it("renders correctly with non-PDF resource, triggers download and cancel", () => {
        render(
            <ViewResourceModal visible={true} resource={otherResource} onCancel={mockOnCancel} onDownload={mockOnDownload} />
        );

        // Statement & line coverage: checks modal renders with message + download button
        expect(screen.getByText(`View Resource: ${otherResource.title}`)).toBeInTheDocument();

        const previewMsg = screen.getByText(/Preview not supported for/i);
        expect(previewMsg).toBeInTheDocument();
        expect(screen.getByText(otherResource.fileType, { selector: "strong" })).toBeInTheDocument();

        // Download button calls onDownload with correct params
        const downloadButton = screen.getByRole("button", { name: /download instead/i });
        fireEvent.click(downloadButton);
        expect(mockOnDownload).toHaveBeenCalledTimes(1);
        expect(mockOnDownload).toHaveBeenCalledWith(otherResource.fileUrl, otherResource.title);

        // Close button (bottom) click triggers onCancel
        const closeBottom = screen.getByRole("button", { name: /close/i });
        fireEvent.click(closeBottom);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
});
