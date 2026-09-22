import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../../../src/api/axiosConfig";
import {
  fetchAllPartnerships,
  fetchPartnershipById,
  createPartnership,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
} from "../../../src/api/services/partnershipService";
import { ENDPOINTS } from "../../../src/api/endpoints";

vi.mock("../../../src/api/axiosConfig");

describe("Partnership Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("fetchAllPartnerships", () => {
    it("fetches all partnerships successfully", async () => {
      const mockData = [{ id: 1, title: "Green Fund", status: "Published" }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await fetchAllPartnerships();

      expect(api.get).toHaveBeenCalledWith(ENDPOINTS.partnerships);
      expect(result).toEqual(mockData);
    });

    it("throws when fetching partnerships fails", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(fetchAllPartnerships()).rejects.toThrow("Network error");
    });
  });

  describe("fetchPartnershipById", () => {
    it("throws when the id is missing", async () => {
      await expect(fetchPartnershipById()).rejects.toThrow(
        "Partnership ID is required",
      );
    });

    it("fetches a partnership by id successfully", async () => {
      const mockData = { id: 3, title: "Green Fund" };
      api.get.mockResolvedValue({ data: mockData });

      const result = await fetchPartnershipById(3);

      expect(api.get).toHaveBeenCalledWith(ENDPOINTS.partnershipById(3));
      expect(result).toEqual(mockData);
    });

    it("throws when fetching a partnership by id fails", async () => {
      const error = new Error("Not found");
      api.get.mockRejectedValue(error);

      await expect(fetchPartnershipById(3)).rejects.toThrow("Not found");
    });
  });

  describe("createPartnership", () => {
    it("creates a partnership successfully", async () => {
      const payload = { title: "New Fund", type: "Funding" };
      const mockData = { id: 2, ...payload };
      api.post.mockResolvedValue({ data: mockData });

      const result = await createPartnership(payload);

      expect(api.post).toHaveBeenCalledWith(ENDPOINTS.partnerships, payload);
      expect(result).toEqual(mockData);
    });

    it("throws when creating a partnership fails", async () => {
      const error = new Error("Failed to create");
      api.post.mockRejectedValue(error);

      await expect(createPartnership({ title: "X" })).rejects.toThrow(
        "Failed to create",
      );
    });
  });

  describe("updatePartnership", () => {
    it("throws when the id is missing", async () => {
      await expect(updatePartnership()).rejects.toThrow(
        "Partnership ID is required for update",
      );
    });

    it("updates a partnership successfully", async () => {
      const payload = { title: "Updated Fund" };
      const mockData = { id: 1, ...payload };
      api.put.mockResolvedValue({ data: mockData });

      const result = await updatePartnership(1, payload);

      expect(api.put).toHaveBeenCalledWith(ENDPOINTS.partnershipById(1), payload);
      expect(result).toEqual(mockData);
    });

    it("throws when updating a partnership fails", async () => {
      const error = new Error("Failed to update");
      api.put.mockRejectedValue(error);

      await expect(updatePartnership(1, {})).rejects.toThrow(
        "Failed to update",
      );
    });
  });

  describe("deletePartnership", () => {
    it("throws when the id is missing", async () => {
      await expect(deletePartnership()).rejects.toThrow(
        "Partnership ID is required for deletion",
      );
    });

    it("deletes a partnership successfully", async () => {
      const mockData = { message: "Partnership deleted successfully" };
      api.delete.mockResolvedValue({ data: mockData });

      const result = await deletePartnership(1);

      expect(api.delete).toHaveBeenCalledWith(ENDPOINTS.partnershipById(1));
      expect(result).toEqual(mockData);
    });

    it("throws when deleting a partnership fails", async () => {
      const error = new Error("Failed to delete");
      api.delete.mockRejectedValue(error);

      await expect(deletePartnership(1)).rejects.toThrow("Failed to delete");
    });
  });

  describe("updatePartnershipStatus", () => {
    it("throws when the id is missing", async () => {
      await expect(updatePartnershipStatus()).rejects.toThrow(
        "Partnership ID is required for status update",
      );
    });

    it("updates a partnership status successfully", async () => {
      const mockData = { id: 1, status: "Published" };
      api.patch.mockResolvedValue({ data: mockData });

      const result = await updatePartnershipStatus(1, "Published");

      expect(api.patch).toHaveBeenCalledWith(ENDPOINTS.partnershipStatus(1), {
        status: "Published",
      });
      expect(result).toEqual(mockData);
    });

    it("throws when updating a partnership status fails", async () => {
      const error = new Error("Failed to update status");
      api.patch.mockRejectedValue(error);

      await expect(updatePartnershipStatus(1, "Published")).rejects.toThrow(
        "Failed to update status",
      );
    });
  });
});