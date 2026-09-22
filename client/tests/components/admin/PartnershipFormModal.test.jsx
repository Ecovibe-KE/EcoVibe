import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PartnershipFormModal from "../../../src/components/admin/PartnershipFormModal.jsx";
import { toast } from "react-toastify";

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

vi.mock("@mui/icons-material/Cancel", () => ({
  default: () => <div>CancelIcon</div>,
}));
vi.mock("@mui/icons-material/SaveAs", () => ({
  default: () => <div>SaveAsIcon</div>,
}));
vi.mock("@mui/icons-material/NoteAdd", () => ({
  default: () => <div>NoteAddIcon</div>,
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../../src/api/services/partnershipService", () => ({
  createPartnership: vi.fn(),
  updatePartnership: vi.fn(),
}));

import {
  createPartnership,
  updatePartnership,
} from "../../../src/api/services/partnershipService";

vi.mock("../../../src/utils/Input", () => ({
  default: function MockInput({ type, value, onChange, error, id, label }) {
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}
        <input
          id={id}
          type={type === "textarea" ? "text" : type}
          value={value || ""}
          onChange={(e) => onChange && onChange(e)}
          data-testid={`${id}-input`}
        />
        {error && <small data-testid={`${id}-error`}>{error}</small>}
      </div>
    );
  },
  Select: function MockSelect({ id, label, value, onChange, children }) {
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange && onChange(e)}
          data-testid="type-select"
        >
          {children}
        </select>
      </div>
    );
  },
  FileInput: function MockFileInput({ id, label, onChange }) {
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}
        <input
          id={id}
          type="file"
          data-testid="file-input"
          onChange={(e) => onChange && onChange(e)}
        />
      </div>
    );
  },
}));

class MockFileReader {
  constructor() {
    this.result = "";
    this.onloadend = null;
  }
  readAsDataURL(file) {
    this.result = `data:${file.type};base64,${file.name}`;
    if (this.onloadend) this.onloadend();
  }
}

describe("PartnershipFormModal", () => {
  const onClose = vi.fn();

  const validFile = new File(["content"], "logo.png", { type: "image/png" });

  const fillRequiredFields = (
    overrides = {},
    files = [validFile],
    fileChange = true,
  ) => {
    fireEvent.change(screen.getByTestId("partnership-title-input"), {
      target: { value: overrides.title ?? "Green Innovation Fund" },
    });
    fireEvent.change(screen.getByTestId("partnership-description-input"), {
      target: { value: overrides.description ?? "Grant for green projects" },
    });
    fireEvent.change(screen.getByTestId("partnership-launch-date-input"), {
      target: { value: overrides.launch_date ?? "2026-01-10" },
    });
    fireEvent.change(screen.getByTestId("partnership-deadline-date-input"), {
      target: { value: overrides.deadline_date ?? "2026-02-10" },
    });
    if (fileChange) {
      fireEvent.change(screen.getByTestId("file-input"), { target: { files } });
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.FileReader = MockFileReader;
  });

  it("renders nothing when not open", () => {
    const { container } = render(
      <PartnershipFormModal show={false} onClose={onClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the create form", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    expect(screen.getAllByText(/Create Opportunity/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Title *")).toBeInTheDocument();
    expect(screen.getByLabelText("Type *")).toBeInTheDocument();
    expect(screen.getByLabelText("Description *")).toBeInTheDocument();
    expect(screen.getByLabelText("Launch Date *")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline Date *")).toBeInTheDocument();
  });

  it("renders the edit form prefilled with the opportunity values", () => {
    const opportunity = {
      id: 1,
      title: "Eco Alliance",
      type: "Partnership",
      description: "Partner with us",
      launch_date: "2026-01-10T00:00:00",
      deadline_date: "2026-02-10T00:00:00",
      image: "data:image/png;base64,old",
    };

    render(
      <PartnershipFormModal show onClose={onClose} opportunity={opportunity} />,
    );

    expect(screen.getByText(/Edit Opportunity/i)).toBeInTheDocument();
    expect(screen.getByTestId("partnership-title-input")).toHaveValue(
      "Eco Alliance",
    );
    expect(screen.getByTestId("partnership-description-input")).toHaveValue(
      "Partner with us",
    );
    expect(screen.getByTestId("partnership-launch-date-input")).toHaveValue(
      "2026-01-10",
    );
    expect(screen.getByTestId("partnership-deadline-date-input")).toHaveValue(
      "2026-02-10",
    );
  });

  it("shows the current image when editing without uploading a new one", () => {
    const opportunity = {
      id: 1,
      title: "Eco Alliance",
      type: "Partnership",
      description: "Partner with us",
      image: "data:image/png;base64,old",
    };

    render(
      <PartnershipFormModal show onClose={onClose} opportunity={opportunity} />,
    );

    expect(screen.getByText("Current image:")).toBeInTheDocument();
    expect(screen.getByAltText("Current program image")).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty create form", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/ }),
    );

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Program image is required")).toBeInTheDocument();
    expect(screen.getByText("Launch date is required")).toBeInTheDocument();
    expect(screen.getByText("Deadline date is required")).toBeInTheDocument();
    expect(createPartnership).not.toHaveBeenCalled();
  });

  it("validates that the launch date is not after the deadline date", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    fillRequiredFields({ launch_date: "2026-02-10", deadline_date: "2026-01-10" });

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/ }),
    );

    expect(
      screen.getByText("Launch date cannot be after deadline date"),
    ).toBeInTheDocument();
    expect(createPartnership).not.toHaveBeenCalled();
  });

  it("creates an opportunity and returns the result", async () => {
    createPartnership.mockResolvedValue({
      data: { id: 1, title: "Green Innovation Fund" },
    });

    render(<PartnershipFormModal show onClose={onClose} />);

    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/ }),
    );

    await waitFor(() => {
      expect(createPartnership).toHaveBeenCalledWith({
        title: "Green Innovation Fund",
        type: "Funding",
        description: "Grant for green projects",
        launch_date: "2026-01-10T00:00:00",
        deadline_date: "2026-02-10T00:00:00",
        image: "data:image/png;base64,logo.png",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Opportunity created successfully as Draft.",
      );
      expect(onClose).toHaveBeenCalledWith({
        id: 1,
        title: "Green Innovation Fund",
      });
    });
  });

  it("updates an opportunity without sending an image when none is chosen", async () => {
    updatePartnership.mockResolvedValue({
      data: { id: 1, title: "Eco Alliance" },
    });

    const opportunity = {
      id: 1,
      title: "Eco Alliance",
      type: "Partnership",
      description: "Partner with us",
      launch_date: "2026-01-10T00:00:00",
      deadline_date: "2026-02-10T00:00:00",
      image: "data:image/png;base64,old",
    };

    render(
      <PartnershipFormModal show onClose={onClose} opportunity={opportunity} />,
    );

    fireEvent.change(screen.getByTestId("partnership-title-input"), {
      target: { value: "Eco Alliance Updated" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Update Opportunity/ }),
    );

    await waitFor(() => {
      expect(updatePartnership).toHaveBeenCalledWith(1, {
        title: "Eco Alliance Updated",
        type: "Partnership",
        description: "Partner with us",
        launch_date: "2026-01-10T00:00:00",
        deadline_date: "2026-02-10T00:00:00",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Opportunity updated successfully!",
      );
      expect(onClose).toHaveBeenCalledWith({
        id: 1,
        title: "Eco Alliance",
      });
    });
  });

  it("shows the server error message when saving fails", async () => {
    createPartnership.mockRejectedValue({
      response: { data: { error: "Server rejected" } },
    });

    render(<PartnershipFormModal show onClose={onClose} />);

    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/ }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server rejected");
    });
  });

  it("shows a generic error message when saving fails without a server message", async () => {
    createPartnership.mockRejectedValue(new Error("boom"));

    render(<PartnershipFormModal show onClose={onClose} />);

    fillRequiredFields();

    fireEvent.click(
      screen.getByRole("button", { name: /Create Opportunity/ }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to save the opportunity. Please try again.",
      );
    });
  });

  it("rejects non-image files", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    const textFile = new File(["x"], "notes.txt", { type: "text/plain" });
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [textFile] },
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Please select a valid image file.",
    );
  });

  it("rejects image files larger than 5MB", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    const bigFile = new File(
      [new ArrayBuffer(5 * 1024 * 1024 + 1)],
      "big.png",
      { type: "image/png" },
    );
    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [bigFile] },
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/exceeds the 5MB limit/i),
    );
  });

  it("shows a preview when a valid image is selected", () => {
    render(<PartnershipFormModal show onClose={onClose} />);

    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [validFile] },
    });

    expect(screen.getByAltText("Program image preview")).toBeInTheDocument();
    expect(
      screen.getByAltText("Program image preview"),
    ).toHaveAttribute("src", "data:image/png;base64,logo.png");
  });
});