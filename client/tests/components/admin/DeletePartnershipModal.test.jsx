import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeletePartnershipModal from "../../../src/components/admin/DeletePartnershipModal.jsx";

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

describe("DeletePartnershipModal", () => {
  const onClose = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when not shown", () => {
    const { container } = render(
      <DeletePartnershipModal
        show={false}
        onClose={onClose}
        onDelete={onDelete}
        opportunityTitle="Green Innovation Fund"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the opportunity title and a warning message", () => {
    render(
      <DeletePartnershipModal
        show
        onClose={onClose}
        onDelete={onDelete}
        opportunityTitle="Green Innovation Fund"
      />,
    );

    expect(screen.getByText("Delete Green Innovation Fund")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this opportunity/i),
    ).toBeInTheDocument();
  });

  it("calls onClose when the Close button is clicked", () => {
    render(
      <DeletePartnershipModal
        show
        onClose={onClose}
        onDelete={onDelete}
        opportunityTitle="Green Innovation Fund"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onDelete when the Delete button is clicked", () => {
    render(
      <DeletePartnershipModal
        show
        onClose={onClose}
        onDelete={onDelete}
        opportunityTitle="Green Innovation Fund"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});