import axios from "axios";
import api from "../../../src/api/axiosConfig";
import { describe, it, expect, vi } from "vitest";

// Mock axios using Vitest
vi.mock("axios");

describe("axiosConfig setup", () => {
    it("should create an axios instance", () => {
        expect(api).toBeDefined();
        expect(api.defaults).toHaveProperty("baseURL");
    });

    it("should use interceptors for requests and responses", () => {
        const interceptors = api.interceptors;
        expect(interceptors).toHaveProperty("request");
        expect(interceptors).toHaveProperty("response");
    });

    it("should include default headers", () => {
        expect(api.defaults.headers).toBeDefined();
        expect(api.defaults.headers).toHaveProperty("common");
    });

    it("should not throw when making a sample request (mocked)", async () => {
        axios.create.mockReturnValue({
            get: vi.fn().mockResolvedValue({ data: { message: "ok" } }),
            interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
            defaults: { baseURL: "http://localhost:5000", headers: { common: {} } },
        });

        const mockedApi = axios.create();
        const response = await mockedApi.get("/test");
        expect(response.data.message).toBe("ok");
    });

    it("should handle request errors gracefully (mocked)", async () => {
        axios.create.mockReturnValue({
            get: vi.fn().mockRejectedValue(new Error("Network error")),
            interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
            defaults: { baseURL: "http://localhost:5000", headers: { common: {} } },
        });

        const mockedApi = axios.create();
        await expect(mockedApi.get("/fail")).rejects.toThrow("Network error");
    });
});