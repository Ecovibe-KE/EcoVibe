import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PartnershipAdmin from "../../../src/components/admin/PartnershipAdmin.jsx";
import { toast } from "react-toastify";
import * as partnershipService from "../../../src/api/services/partnershipService";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../../src/api/services/partnershipService", () => ({
  fetchAllPartnerships: vi.fn(),
  deletePartnership: vi.fn(),
  updatePartnershipStatus: vi.fn(),
}));

vi.mock("../../../src/components/admin/PartnershipFormModal.jsx", () => ({
  default: function MockFormModal({ show, onClose, opportunity }) {
    if (!show) return null;
    return (
      <div
        data-testid="form-modal"
        data-opp={opportunity?.id ?? ""}
      >
        <button
          type="button"
          onClick={() =>
            onClose({ id: 99, title: "New Opportunity", type: "Funding" })
          }
        >
          form-save
        </button>
        <button type="button" onClick={() => onClose()}>
          form-cancel
        </button>
      </div>
    );
  },
}));

vi.mock("../../../src/components/admin/DeletePartnershipModal.jsx", () => ({
  default: function MockDeleteModal({ show, opportunityTitle, onDelete }) {
    if (!show) return null;
    return (
      <div data-testid="delete-modal" data-title={opportunityTitle ?? ""}>
        <button type="button" onClick={onDelete}>
          confirm-delete
        </button>
      </div>
    );
  },
}));

vi.mock("../../../src/components/admin/PartnershipStatusModal.jsx", () => ({
  default: function MockStatusModal({ show, opportunity, onUpdate }) {
    if (!show || !opportunity) return null;
    return (
      <div data-testid="status-modal" data-opp={opportunity.id}>
        <button
          type="button"
          onClick={() => onUpdate(opportunity.id, "Published")}
        >
          confirm-status
        </button>
      </div>
    );
  },
}));

const mockOpportunities = [
  {
    id: 1,
    title: "Green Innovation Fund",
    type: "Funding",
    description: "Funding for green projects",
    status: "Published",
    launch_date: "2026-01-10",
    deadline_date: "2026-02-10",
  },
  {
    id: 2,
    title: "Eco Alliance",
    type: "Partnership",
    description: "Partner with local NGOs",
    status: "Draft",
    launch_date: null,
    deadline_date: null,
  },
];

describe("PartnershipAdmin page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows the loading indicator while opportunities are being fetched", () => {
    partnershipService.fetchAllPartnerships.mockReturnValue(
      new Promise(() => {}),
    );

    render(<PartnershipAdmin />);

    expect(screen.getByText(/Loading opportunities/i)).toBeInTheDocument();
  });

  it("renders the header, stat cards and opportunity items", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });

    render(<PartnershipAdmin />);

    expect(
      await screen.findByRole("heading", { name: /Partnerships & Funding/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Partnerships")).toBeInTheDocument();

    expect(await screen.findByText("Green Innovation Fund")).toBeInTheDocument();
    expect(screen.getByText("Eco Alliance")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Funding").length).toBeGreaterThan(0);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("displays no opportunities message when the list is empty", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: [],
    });

    render(<PartnershipAdmin />);

    expect(await screen.findByText(/No opportunities found/i)).toBeInTheDocument();
  });

  it("shows an error message when fetching opportunities fails", async () => {
    partnershipService.fetchAllPartnerships.mockRejectedValue(
      new Error("Network error"),
    );

    render(<PartnershipAdmin />);

    expect(
      await screen.findByText(/Failed to fetch opportunities/i),
    ).toBeInTheDocument();
  });

  it("filters opportunities by search term", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });

    render(<PartnershipAdmin />);

    await screen.findByText("Green Innovation Fund");

    const searchInput = screen.getByPlaceholderText(
      /Search opportunities by title or description/i,
    );
    fireEvent.change(searchInput, { target: { value: "alliance" } });

    await waitFor(() => {
      expect(screen.getByText("Eco Alliance")).toBeInTheDocument();
      expect(screen.queryByText("Green Innovation Fund")).not.toBeInTheDocument();
    });
  });

  it("filters opportunities by type", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });

    render(<PartnershipAdmin />);

    await screen.findByText("Green Innovation Fund");

    fireEvent.click(screen.getByRole("button", { name: /All Types/i }));
    fireEvent.click(screen.getByRole("link", { name: "Funding" }));

    await waitFor(() => {
      expect(screen.getByText("Green Innovation Fund")).toBeInTheDocument();
      expect(screen.queryByText("Eco Alliance")).not.toBeInTheDocument();
    });
  });

  it("opens the create form when Create Opportunity is clicked and adds on save", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: [],
    });

    render(<PartnershipAdmin />);

    await screen.findByText(/No opportunities found/i);

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/i }),
    );

    expect(screen.getByTestId("form-modal")).toBeInTheDocument();
    expect(screen.getByTestId("form-modal")).toHaveAttribute("data-opp", "");

    fireEvent.click(screen.getByText("form-save"));

    await waitFor(() => {
      expect(screen.getByText("New Opportunity")).toBeInTheDocument();
    });
  });

  it("opens the edit form prefilled with the selected opportunity", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });

    render(<PartnershipAdmin />);

    await screen.findByText("Green Innovation Fund");

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    expect(screen.getByTestId("form-modal")).toBeInTheDocument();
    expect(screen.getByTestId("form-modal")).toHaveAttribute("data-opp", "1");
  });

  it("deletes an opportunity after confirmation", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });
    partnershipService.deletePartnership.mockResolvedValue({
      message: "Partnership deleted successfully",
    });

    render(<PartnershipAdmin />);

    await screen.findByText("Green Innovation Fund");

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
    expect(screen.getByTestId("delete-modal")).toHaveAttribute(
      "data-title",
      "Green Innovation Fund",
    );

    fireEvent.click(screen.getByText("confirm-delete"));

    await waitFor(() => {
      expect(partnershipService.deletePartnership).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith(
        "Opportunity deleted successfully.",
      );
    });
    expect(screen.queryByText("Green Innovation Fund")).not.toBeInTheDocument();
  });

  it("shows a toast when deleting an opportunity fails", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });
    partnershipService.deletePartnership.mockRejectedValue(
      new Error("Failed to delete"),
    );

    render(<PartnershipAdmin />);

    await screen.findByText("Green Innovation Fund");

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    fireEvent.click(screen.getByText("confirm-delete"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete opportunity. Please try again later.",
      );
    });
    expect(screen.getByText("Green Innovation Fund")).toBeInTheDocument();
  });

  it("updates the status of an opportunity", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });
    partnershipService.updatePartnershipStatus.mockResolvedValue({
      message: "success",
      data: { id: 2, title: "Eco Alliance", status: "Published" },
    });

    render(<PartnershipAdmin />);

    await screen.findByText("Eco Alliance");

    fireEvent.click(screen.getAllByRole("button", { name: "Status" })[1]);

    expect(screen.getByTestId("status-modal")).toBeInTheDocument();
    expect(screen.getByTestId("status-modal")).toHaveAttribute("data-opp", "2");

    fireEvent.click(screen.getByText("confirm-status"));

    await waitFor(() => {
      expect(partnershipService.updatePartnershipStatus).toHaveBeenCalledWith(
        2,
        "Published",
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Status updated successfully.",
      );
    });
  });

  it("shows a toast when updating a status fails", async () => {
    partnershipService.fetchAllPartnerships.mockResolvedValue({
      message: "success",
      data: mockOpportunities,
    });
    partnershipService.updatePartnershipStatus.mockRejectedValue(
      new Error("Failed to update"),
    );

    render(<PartnershipAdmin />);

    await screen.findByText("Eco Alliance");

    fireEvent.click(screen.getAllByRole("button", { name: "Status" })[1]);
    fireEvent.click(screen.getByText("confirm-status"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update status. Please try again later.",
      );
    });
  });
});