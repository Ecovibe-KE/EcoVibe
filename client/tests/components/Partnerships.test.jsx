import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Partnerships from "../../src/components/Partnerships";
import * as partnershipService from "../../src/api/services/partnershipService";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderPage = () =>
  render(
    <BrowserRouter>
      <Partnerships />
    </BrowserRouter>
  );

describe("Partnerships page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows the loading state while the API request is in flight", () => {
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockReturnValue(
      new Promise(() => {}),
    );

    renderPage();

    expect(screen.getByText(/Loading opportunities/i)).toBeInTheDocument();
  });

  it("shows the empty-state card when there are no published opportunities", async () => {
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockResolvedValue({
      message: "success",
      data: [],
    });

    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: /Funding & Partnership Opportunities/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/There are currently no funding or partnership opportunities/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/New opportunities will appear here as they become available/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Check back soon for upcoming opportunities/i),
    ).toBeInTheDocument();
  });

  it("shows the empty-state card when the API request fails (no backend)", async () => {
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockRejectedValue(
      new Error("Network error"),
    );

    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: /Funding & Partnership Opportunities/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders published opportunities as cards", async () => {
    const opportunities = [
      {
        id: 1,
        title: "Green Innovation Fund",
        type: "Funding",
        description: "Funding for green projects",
        launch_date: "2026-01-10",
        deadline_date: "2026-02-10",
        image: "data:image/png;base64,abc",
      },
      {
        id: 2,
        title: "Eco Alliance",
        type: "Partnership",
        description: "Partner with us",
        launch_date: undefined,
        deadline_date: null,
        image: "",
      },
    ];
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockResolvedValue({
      message: "success",
      data: opportunities,
    });

    renderPage();

    expect(await screen.findByText("Green Innovation Fund")).toBeInTheDocument();
    expect(screen.getByText("Eco Alliance")).toBeInTheDocument();
    expect(screen.getByText("Funding")).toBeInTheDocument();
    expect(screen.getByText("Partnership")).toBeInTheDocument();
    expect(screen.getByText("Funding for green projects")).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: /Funding & Partnership Opportunities/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("formats and displays launch and deadline dates", async () => {
    const opportunity = {
      id: 1,
      title: "Green Innovation Fund",
      type: "Funding",
      description: "desc",
      launch_date: "2026-01-10",
      deadline_date: "2026-02-10",
    };
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockResolvedValue({
      message: "success",
      data: [opportunity],
    });

    renderPage();

    const launch = await screen.findByText(
      new Date("2026-01-10").toLocaleDateString(),
    );
    expect(launch).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2026-02-10").toLocaleDateString()),
    ).toBeInTheDocument();
  });

  it("renders an em-dash when dates are missing", async () => {
    const opportunity = {
      id: 1,
      title: "No Dates",
      type: "Funding",
      description: "desc",
    };
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockResolvedValue({
      message: "success",
      data: [opportunity],
    });

    renderPage();

    expect(await screen.findByText("No Dates")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("navigates to the details page when View Details is clicked", async () => {
    const opportunity = {
      id: 5,
      title: "Green Innovation Fund",
      type: "Funding",
      description: "desc",
    };
    vi.spyOn(partnershipService, "fetchAllPartnerships").mockResolvedValue({
      message: "success",
      data: [opportunity],
    });

    renderPage();

    const button = await screen.findByRole("button", { name: /View Details/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/partnerships/5");
    });
  });
});