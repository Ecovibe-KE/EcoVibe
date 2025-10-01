// tests/api/services/tickets.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as ticketsAPI from "../../../src/api/services/tickets";
import api from "../../../src/api/axiosConfig";
import { ENDPOINTS } from "../../../src/api/endpoints";

// Mock axios
vi.mock("../../../src/api/axiosConfig", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock endpoints
vi.mock("../../../src/api/endpoints", () => ({
  ENDPOINTS: {
    tickets: "/api/tickets",
    ticketById: (id) => `/api/tickets/${id}`,
    ticketStats: "/api/tickets/stats",
    ticketMessages: (id) => `/api/tickets/${id}/messages`,
  },
}));

describe("Tickets API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTickets", () => {
    it("returns success response with params", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            tickets: [{ id: 1, subject: "Test Ticket" }],
            pagination: { page: 1, total: 1 }
          }
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, status: "open" };
      const result = await ticketsAPI.getTickets(params);

      expect(api.get).toHaveBeenCalledWith("/api/tickets?page=1&status=open");
      expect(result).toEqual(mockResponse.data);
    });

    it("returns success response without params", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: { tickets: [], pagination: {} }
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.getTickets();

      expect(api.get).toHaveBeenCalledWith("/api/tickets");
      expect(result).toEqual(mockResponse.data);
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Failed to fetch tickets" } },
        message: "Network Error"
      };
      api.get.mockRejectedValue(mockError);

      await expect(ticketsAPI.getTickets()).rejects.toThrow();

      expect(api.get).toHaveBeenCalledWith("/api/tickets");
    });

    it("filters out empty params", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: { tickets: [], pagination: {} }
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const params = { page: 1, status: "", search: null, category: undefined };
      await ticketsAPI.getTickets(params);

      expect(api.get).toHaveBeenCalledWith("/api/tickets?page=1");
    });
  });

  describe("getTicketById", () => {
    it("returns ticket by ID successfully", async () => {
      const mockTicket = { id: 1, subject: "Test Ticket", status: "open" };
      const mockResponse = { data: { status: "success", data: mockTicket } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.getTicketById(1);

      expect(api.get).toHaveBeenCalledWith("/api/tickets/1");
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when no ID provided", async () => {
      await expect(ticketsAPI.getTicketById()).rejects.toThrow("Ticket ID is required");
      expect(api.get).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Ticket not found" } }
      };
      api.get.mockRejectedValue(mockError);

      await expect(ticketsAPI.getTicketById(999)).rejects.toThrow();

      expect(api.get).toHaveBeenCalledWith("/api/tickets/999");
    });
  });

  describe("createTicket", () => {
    it("creates ticket successfully", async () => {
      const ticketData = {
        subject: "New Ticket",
        description: "Test description",
        category: "general",
        priority: "medium"
      };
      const mockResponse = {
        data: {
          status: "success",
          data: { id: 2, ...ticketData }
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.createTicket(ticketData);

      expect(api.post).toHaveBeenCalledWith("/api/tickets", ticketData);
      expect(result).toEqual(mockResponse.data);
    });

    it("handles API errors", async () => {
      const ticketData = { subject: "Test" };
      const mockError = {
        response: { data: { message: "Validation failed" } }
      };
      api.post.mockRejectedValue(mockError);

      await expect(ticketsAPI.createTicket(ticketData)).rejects.toThrow();

      expect(api.post).toHaveBeenCalledWith("/api/tickets", ticketData);
    });
  });

  describe("updateTicket", () => {
    it("updates ticket successfully", async () => {
      const updateData = { status: "closed", priority: "high" };
      const mockResponse = {
        data: {
          status: "success",
          data: { id: 1, ...updateData }
        }
      };
      api.put.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.updateTicket(1, updateData);

      expect(api.put).toHaveBeenCalledWith("/api/tickets/1", updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when no ID provided", async () => {
      await expect(ticketsAPI.updateTicket()).rejects.toThrow("Ticket ID is required for update");
      expect(api.put).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Ticket not found" } }
      };
      api.put.mockRejectedValue(mockError);

      await expect(ticketsAPI.updateTicket(999, { status: "closed" })).rejects.toThrow();

      expect(api.put).toHaveBeenCalledWith("/api/tickets/999", { status: "closed" });
    });
  });

  describe("deleteTicket", () => {
    it("deletes ticket successfully", async () => {
      const mockResponse = {
        data: {
          status: "success",
          message: "Ticket deleted"
        }
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.deleteTicket(1);

      expect(api.delete).toHaveBeenCalledWith("/api/tickets/1");
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when no ID provided", async () => {
      await expect(ticketsAPI.deleteTicket()).rejects.toThrow("Ticket ID is required for deletion");
      expect(api.delete).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Ticket not found" } }
      };
      api.delete.mockRejectedValue(mockError);

      await expect(ticketsAPI.deleteTicket(999)).rejects.toThrow();

      expect(api.delete).toHaveBeenCalledWith("/api/tickets/999");
    });
  });

  describe("getTicketStats", () => {
    it("returns ticket statistics successfully", async () => {
      const mockStats = {
        total: 10,
        open: 5,
        in_progress: 3,
        resolved: 2,
        closed: 0
      };
      const mockResponse = {
        data: {
          status: "success",
          data: mockStats
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.getTicketStats();

      expect(api.get).toHaveBeenCalledWith("/api/tickets/stats");
      expect(result).toEqual(mockResponse.data);
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Failed to fetch stats" } }
      };
      api.get.mockRejectedValue(mockError);

      await expect(ticketsAPI.getTicketStats()).rejects.toThrow();

      expect(api.get).toHaveBeenCalledWith("/api/tickets/stats");
    });
  });

  describe("addTicketMessage", () => {
    it("adds message to ticket successfully", async () => {
      const messageData = { body: "Test message", sender_role: "client" };
      const mockResponse = {
        data: {
          status: "success",
          data: { id: 1, ...messageData }
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await ticketsAPI.addTicketMessage(1, messageData);

      expect(api.post).toHaveBeenCalledWith("/api/tickets/1/messages", messageData);
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when no ID provided", async () => {
      await expect(ticketsAPI.addTicketMessage()).rejects.toThrow("Ticket ID is required to add message");
      expect(api.post).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      const mockError = {
        response: { data: { message: "Failed to add message" } }
      };
      api.post.mockRejectedValue(mockError);

      await expect(ticketsAPI.addTicketMessage(1, { body: "Test" })).rejects.toThrow();

      expect(api.post).toHaveBeenCalledWith("/api/tickets/1/messages", { body: "Test" });
    });
  });

  describe("buildQuery functionality", () => {
    it("handles various parameter types correctly", async () => {
      const mockResponse = { data: { status: "success", data: [] } };
      api.get.mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        status: "open",
        emptyString: "",
        nullValue: null,
        undefinedValue: undefined,
        zero: 0,
        falseValue: false
      };

      await ticketsAPI.getTickets(params);

      // Should only include non-null, non-undefined, non-empty-string values: page, status, zero, falseValue
      expect(api.get).toHaveBeenCalledWith("/api/tickets?page=1&status=open&zero=0&falseValue=false");
    });
  });
});