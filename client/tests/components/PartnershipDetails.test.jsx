import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PartnershipDetails from "../../src/components/PartnershipDetails.jsx";
import { toast } from "react-toastify";
import * as partnershipService from "../../src/api/services/partnershipService";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ id: "42" }),
  };
});

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("PartnershipDetails page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows the loading spinner while the request is in flight", () => {
    vi.spyOn(partnershipService, "fetchPartnershipById").mockReturnValue(
      new Promise(() => {}),
    );

    render(<PartnershipDetails />);

    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("renders the opportunity details", async () => {
    const opportunity = {
      id: 42,
      title: "Green Innovation Fund",
      type: "Funding",
      description: "A grant for green projects.",
      launch_date: "2026-01-10",
      deadline_date: "2026-02-10",
      image: "data:image/png;base64,abc",
    };
    vi.spyOn(partnershipService, "fetchPartnershipById").mockResolvedValue({
      message: "success",
      data: opportunity,
    });

    render(<PartnershipDetails />);

    expect(await screen.findByText("Green Innovation Fund")).toBeInTheDocument();
    expect(screen.getByText("Funding")).toBeInTheDocument();
    expect(screen.getByText(/A grant for green projects/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `Launch:.*${new Date("2026-01-10").toLocaleDateString()}`,
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `Deadline:.*${new Date("2026-02-10").toLocaleDateString()}`,
        ),
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Opportunities/i })).toBeInTheDocument();
  });

  it("renders an em-dash when dates are missing", async () => {
    const opportunity = {
      id: 42,
      title: "No Dates",
      description: "desc",
    };
    vi.spyOn(partnershipService, "fetchPartnershipById").mockResolvedValue({
      message: "success",
      data: opportunity,
    });

    render(<PartnershipDetails />);

    expect(await screen.findByText("No Dates")).toBeInTheDocument();
    expect(screen.getByText(/Launch:.*—/)).toBeInTheDocument();
    expect(screen.getByText(/Deadline:.*—/)).toBeInTheDocument();
  });

  it("navigates back when the back button is clicked", async () => {
    vi.spyOn(partnershipService, "fetchPartnershipById").mockResolvedValue({
      message: "success",
      data: { id: 42, title: "Fund", description: "desc" },
    });

    render(<PartnershipDetails />);

    const backButton = await screen.findByRole("button", {
      name: /Back to Opportunities/i,
    });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/partnerships");
    });
  });

  it("shows the error state and toast when the fetch fails", async () => {
    vi.spyOn(partnershipService, "fetchPartnershipById").mockRejectedValue(
      new Error("Network error"),
    );

    render(<PartnershipDetails />);

    expect(
      await screen.findByText(/It may no longer be available/i),
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Failed to load opportunity");
    expect(
      screen.getByRole("button", { name: /View All Opportunities/i }),
    ).toBeInTheDocument();
  });

  it("shows opportunity not found when no data is returned", async () => {
    vi.spyOn(partnershipService, "fetchPartnershipById").mockResolvedValue({});

    render(<PartnershipDetails />);

    expect(await screen.findByText(/Opportunity not found/i)).toBeInTheDocument();
  });

  it("navigates back to the opportunities list from the error state", async () => {
    vi.spyOn(partnershipService, "fetchPartnershipById").mockRejectedValue(
      new Error("boom"),
    );

    render(<PartnershipDetails />);

    const button = await screen.findByRole("button", {
      name: /View All Opportunities/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/partnerships");
    });
  });
});