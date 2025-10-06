import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../../src/api/axiosConfig";
import {
    getDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
} from "../../../src/api/services/resourceCenter";

// 🧱 Mock the axios instance
vi.mock("../../../src/api/axiosConfig", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("Resource Center Service", () => {
    const mockData = { data: [{ id: 1, title: "Doc" }], pagination: { page: 1, pages: 2 } };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ---------------------------
    // getDocuments
    // ---------------------------
    it("fetches documents successfully", async () => {
        api.get.mockResolvedValueOnce({ data: mockData });
        const result = await getDocuments(1, 10, "", "");
        expect(api.get).toHaveBeenCalledWith("/documents", {
            params: { page: 1, per_page: 10, search: "", type: "" },
        });
        expect(result).toEqual(mockData);
    });

    it("throws error when fetching fails", async () => {
        api.get.mockRejectedValueOnce({ response: { data: { message: "Failed" } } });
        await expect(getDocuments()).rejects.toEqual({ message: "Failed" });
    });

    // ---------------------------
    // uploadDocument
    // ---------------------------
    it("uploads a document successfully", async () => {
        const formData = new FormData();
        formData.append("title", "New");
        api.post.mockResolvedValueOnce({ data: { message: "Uploaded" } });
        const result = await uploadDocument(formData);
        expect(api.post).toHaveBeenCalledWith("/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        expect(result).toEqual({ message: "Uploaded" });
    });

    it("throws error when upload fails", async () => {
        api.post.mockRejectedValueOnce({ response: { data: { message: "Upload failed" } } });
        await expect(uploadDocument(new FormData())).rejects.toEqual({ message: "Upload failed" });
    });

    // ---------------------------
    // updateDocument
    // ---------------------------
    it("updates document successfully", async () => {
        const formData = new FormData();
        formData.append("title", "Updated");
        api.put.mockResolvedValueOnce({ data: { message: "Updated" } });
        const result = await updateDocument(1, formData);
        expect(api.put).toHaveBeenCalledWith("/documents/1", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        expect(result).toEqual({ message: "Updated" });
    });

    it("throws error when update fails", async () => {
        api.put.mockRejectedValueOnce({ response: { data: { message: "Update failed" } } });
        await expect(updateDocument(1, new FormData())).rejects.toEqual({ message: "Update failed" });
    });

    // ---------------------------
    // deleteDocument
    // ---------------------------
    it("deletes document successfully", async () => {
        api.delete.mockResolvedValueOnce({ data: { message: "Deleted" } });
        const result = await deleteDocument(1);
        expect(api.delete).toHaveBeenCalledWith("/documents/1");
        expect(result).toEqual({ message: "Deleted" });
    });

    it("throws error when delete fails", async () => {
        api.delete.mockRejectedValueOnce({ response: { data: { message: "Delete failed" } } });
        await expect(deleteDocument(1)).rejects.toEqual({ message: "Delete failed" });
    });

    // ---------------------------
    // downloadDocument
    // ---------------------------
    it("downloads document successfully", async () => {
        const blob = new Blob(["file data"], { type: "application/pdf" });
        api.get.mockResolvedValueOnce({ data: blob });
        const result = await downloadDocument(5);
        expect(api.get).toHaveBeenCalledWith("/documents/5/download", { responseType: "blob" });
        expect(result.data).toBeInstanceOf(Blob);
    });

    it("throws error when download fails", async () => {
        api.get.mockRejectedValueOnce({ response: { data: { message: "Download failed" } } });
        await expect(downloadDocument(5)).rejects.toEqual({ message: "Download failed" });
    });
});
