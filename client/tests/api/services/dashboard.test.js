import { vi, describe, it, expect } from "vitest";
import api from "../../../src/api/axiosConfig";
import { getDashboard } from "../../../src/api/services/dashboard";

vi.mock("../../../src/api/axiosConfig");

describe("getDashboard service", () => {
  it("fetches dashboard data with token", async () => {
    const mockData = { status: "success", data: { name: "Test User" } };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await getDashboard("mock-token");

    expect(api.get).toHaveBeenCalledWith("/dashboard", {
      headers: { Authorization: "Bearer mock-token" },
    });
    expect(result).toEqual(mockData);
  });

  it("throws error when API fails", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { status: "error" } } });
    await expect(getDashboard("mock-token")).rejects.toEqual({
      status: "error",
    });
  });
});

