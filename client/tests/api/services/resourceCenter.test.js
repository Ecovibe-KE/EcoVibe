import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from "../../../src/api/services/resourceCenter.js";
import api from "../../../src/api/axiosConfig.js";
import { ENDPOINTS } from "../../../src/api/endpoints.js";

vi.mock("../../../src/api/axiosConfig.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("documentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL.createObjectURL to prevent errors in Node environment
    global.URL.createObjectURL = vi.fn((blob) => "mocked-url");
  });

  it("should fetch paginated documents", async () => {
    const mockResponse = { data: [{ id: 1, title: "Doc1", fileType: "pdf" }] };
    api.get.mockResolvedValue(mockResponse);

    const result = await getDocuments(2, 20);

    expect(api.get).toHaveBeenCalledWith(ENDPOINTS.documents, {
      params: { page: 2, limit: 20 },
    });
    expect(result).toBe(mockResponse);
  });

  it("should fetch a document by ID", async () => {
    const mockResponse = { data: { id: 123, name: "Doc123" } };
    api.get.mockResolvedValue(mockResponse);

    const result = await getDocumentById(123);

    expect(api.get).toHaveBeenCalledWith(`${ENDPOINTS.documents}/123`);
    expect(result).toBe(mockResponse);
  });

  it("should delete a document by ID", async () => {
    const mockResponse = { data: { deleted: true } };
    api.delete.mockResolvedValue(mockResponse);

    const result = await deleteDocument(55);

    expect(api.delete).toHaveBeenCalledWith(`${ENDPOINTS.documents}/55`);
    expect(result).toBe(mockResponse);
  });

  it("should trigger file download", async () => {
    // Mock URL functions
    global.URL.createObjectURL = vi.fn(() => "blob:http://example.com/blob");
    global.URL.revokeObjectURL = vi.fn();

    const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => { });
    const removeSpy = vi.fn();
    const clickSpy = vi.fn();
    const mockLink = { click: clickSpy, remove: removeSpy, setAttribute: vi.fn() };

    vi.spyOn(document, "createElement").mockReturnValue(mockLink);

    await downloadDocument("http://example.com/file.pdf", "test.pdf");

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "test.pdf");
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    appendSpy.mockRestore();
  });

});
