/**
 * @fileoverview Vitest tests for src/api/services/servicemanagement.js
 * Fully compatible with Vite/Vitest setup — no Jest globals used.
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import api from "../../../src/api/axiosConfig";
import {
    addService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
} from "../../../src/api/services/servicemanagement";

// ✅ mock the axiosConfig module
vi.mock("../../../src/api/axiosConfig", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("servicemanagement API service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockData = { status: "success", message: "ok" };

    // --- CREATE ---
    it("addService should POST and return data on success", async () => {
        api.post.mockResolvedValueOnce({ data: mockData });
        const result = await addService({ title: "test" });
        expect(api.post).toHaveBeenCalledWith(expect.stringContaining("/services"), { title: "test" });
        expect(result).toEqual(mockData);
    });

    it("addService should throw on failure", async () => {
        api.post.mockRejectedValueOnce(new Error("Network error"));
        await expect(addService({})).rejects.toThrow("Network error");
    });

    // --- READ (ALL) ---
    it("getServices should GET and return data", async () => {
        api.get.mockResolvedValueOnce({ data: mockData });
        const result = await getServices();
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/services"));
        expect(result).toEqual(mockData);
    });

    it("getServices should handle errors gracefully", async () => {
        api.get.mockRejectedValueOnce(new Error("Server down"));
        await expect(getServices()).rejects.toThrow("Server down");
    });

    // --- READ (BY ID) ---
    it("getServiceById should GET by id and return data", async () => {
        api.get.mockResolvedValueOnce({ data: mockData });
        const result = await getServiceById(5);
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/services/5"));
        expect(result).toEqual(mockData);
    });

    it("getServiceById should throw on rejection", async () => {
        api.get.mockRejectedValueOnce(new Error("404 not found"));
        await expect(getServiceById(999)).rejects.toThrow("404 not found");
    });

    // --- UPDATE ---
    it("updateService should PUT and return data", async () => {
        api.put.mockResolvedValueOnce({ data: mockData });
        const result = await updateService(1, { price: 500 });
        expect(api.put).toHaveBeenCalledWith(expect.stringContaining("/services/1"), { price: 500 });
        expect(result).toEqual(mockData);
    });

    it("updateService should handle network error (rejected promise)", async () => {
        api.put.mockRejectedValueOnce(new Error("Network error"));
        await expect(updateService(1, { title: "Fail test" })).rejects.toThrow("Network error");
    });

    // --- DELETE ---
    it("deleteService should DELETE and return data", async () => {
        api.delete.mockResolvedValueOnce({ data: mockData });
        const result = await deleteService(2);
        expect(api.delete).toHaveBeenCalledWith(expect.stringContaining("/services/2"));
        expect(result).toEqual(mockData);
    });

    it("deleteService should handle error rejection", async () => {
        api.delete.mockRejectedValueOnce(new Error("Delete failed"));
        await expect(deleteService(99)).rejects.toThrow("Delete failed");
    });
});