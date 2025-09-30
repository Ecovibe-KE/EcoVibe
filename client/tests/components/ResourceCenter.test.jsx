import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ResourceCenter from "../../src/components/admin/ResourceCenter.jsx";
import * as documentService from "../../src/api/services/resourceCenter.js";

vi.mock("../../src/api/services/resourceCenter.js", () => ({
  getDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  downloadDocument: vi.fn(),
}));
const mockResources = [
    {
      id: 1,
      title: "Sustainability Report 2024",
      category: "esgReports",
      fileType: "pdf",
      uploadedAt: "2024-12-12",
      downloads: 34,
      status: "active",
      fileUrl: "https://example.com/report.pdf",
    },
    {
      id: 2,
      title: "Company Policy Template",
      category: "templates",
      fileType: "docx",
      uploadedAt: "2024-11-01",
      downloads: 12,
      status: "pending",
      fileUrl: "https://example.com/template.docx",
    },
    {
      id: 3,
      title: "Quarterly ESG Policy",
      category: "Policies",
      fileType: "pdf",
      uploadedAt: "2024-10-20",
      downloads: 7,
      status: "archived",
      fileUrl: "https://example.com/policy.pdf",
    },
  ];
describe("ResourceCenter component", () => {
  const mockDocs = [{ id: 1, name: "Doc1" }, { id: 2, name: "Doc2" }];

  beforeEach(() => {
    vi.clearAllMocks();
    documentService.getDocuments.mockResolvedValue({ data: mockDocs });
  });


  it("calls getDocuments service on render", async () => {
    render(<ResourceCenter />);
    await waitFor(() => {
      expect(documentService.getDocuments).toHaveBeenCalled();
    });
  });
});
