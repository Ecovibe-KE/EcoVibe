import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PartnershipStatusModal from "../../../src/components/admin/PartnershipStatusModal.jsx";

vi.mock("react-bootstrap", () => ({
  Modal: Object.assign(
    ({ show, children }) =>
      show ? <div data-testid="bs-modal">{children}</div> : null,
    {
      Header: ({ children }) => <div>{children}</div>,
      Title: ({ children }) => <h5>{children}</h5>,
      Body: ({ children }) => <div>{children}</div>,
      Footer: ({ children }) => <div>{children}</div>,
    },
  ),
}));

describe("PartnershipStatusModal", () => {
  const onClose = vi.fn();
  const onUpdate = vi.fn();

  const opportunity = {
    id: 1,
    title: "Green Innovation Fund",
    status: "Draft",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when not shown", () => {
    const { container } = render(
      <PartnershipStatusModal show={false} opportunity={opportunity} onClose={onClose} onUpdate={onUpdate} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the modal title and current status", () => {
    render(
      <PartnershipStatusModal show opportunity={opportunity} onClose={onClose} onUpdate={onUpdate} />,
    );

    expect(screen.getByText("Change Status")).toBeInTheDocument();
    expect(screen.getByText("Green Innovation Fund")).toBeInTheDocument();
    expect(screen.getByText(/current status is/)).toBeInTheDocument();
    expect(screen.getByLabelText("Select new status")).toHaveValue("Draft");
  });

  it("calls onUpdate with the newly selected status", async () => {
    onUpdate.mockResolvedValue({});

    render(
      <PartnershipStatusModal show opportunity={opportunity} onClose={onClose} onUpdate={onUpdate} />,
    );

    fireEvent.change(screen.getByLabelText("Select new status"), {
      target: { value: "Published" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Status/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(1, "Published");
    });
  });

  it("calls onClose when the Cancel button is clicked", () => {
    render(
      <PartnershipStatusModal show opportunity={opportunity} onClose={onClose} onUpdate={onUpdate} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows Updating while the status update is pending", async () => {
    let resolveUpdate;
    const pending = new Promise((resolve) => {
      resolveUpdate = resolve;
    });
    onUpdate.mockReturnValue(pending);

    render(
      <PartnershipStatusModal show opportunity={opportunity} onClose={onClose} onUpdate={onUpdate} />,
    );

    fireEvent.change(screen.getByLabelText("Select new status"), {
      target: { value: "Published" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Status/i }));

    expect(screen.getByText("Updating...")).toBeInTheDocument();

    resolveUpdate();

    await waitFor(() => {
      expect(screen.queryByText("Updating...")).not.toBeInTheDocument();
    });
  });
});