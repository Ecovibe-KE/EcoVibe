// tests/api/services/resourceCenter.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDocuments, getDocumentById, uploadDocument, deleteDocument, downloadDocument } 
  from "../../../src/api/services/resourceCenter.js"; 
import api from "../../../src/api/axiosConfig.js"; 
import { ENDPOINTS } from "../../../src/api/endpoints.js";

// ✅ Mock the axios instance correctly
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
  });

  it("should fetch paginated documents", async () => {
    const mockResponse = { data: [{ id: 1, name: "Doc1" }] };
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

  it("should upload a document", async () => {
    const mockResponse = { data: { success: true } };
    api.post.mockResolvedValue(mockResponse);

    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const result = await uploadDocument(file, "admin123");

    expect(api.post).toHaveBeenCalledWith(
      ENDPOINTS.documents,
      expect.any(FormData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    expect(result).toBe(mockResponse);
  });

  it("should delete a document by ID", async () => {
    const mockResponse = { data: { deleted: true } };
    api.delete.mockResolvedValue(mockResponse);

    const result = await deleteDocument(55);

    expect(api.delete).toHaveBeenCalledWith(`${ENDPOINTS.documents}/55`);
    expect(result).toBe(mockResponse);
  });

  it("should trigger file download", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    const removeSpy = vi.fn();
    const clickSpy = vi.fn();
    const mockLink = { click: clickSpy, remove: removeSpy, setAttribute: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink);

    downloadDocument("http://example.com/file.pdf", "test.pdf");

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe("http://example.com/file.pdf");
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "test.pdf");
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    appendSpy.mockRestore();
  });
});
