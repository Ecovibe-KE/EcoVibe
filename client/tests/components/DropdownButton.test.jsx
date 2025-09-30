import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropdownButton } from "../../src/utils/DropdownButton";
import { describe, it, expect, vi } from "vitest";

// Mock the CategoryIcon
vi.mock("@mui/icons-material/Category", () => ({
  default: vi.fn(() => <div data-testid="category-icon">CategoryIcon</div>),
}));

describe("DropdownButton Component", () => {
  const options = ["Option 1", "Option 2", "Option 3"];
  const selected = "Option 1";
  const onSelect = vi.fn();

  it("renders the selected value", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("renders the CategoryIcon", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    expect(screen.getByTestId("category-icon")).toBeInTheDocument();
  });

  it("opens the dropdown when the button is clicked", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("calls onSelect when an option is clicked", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    const option2 = screen.getByText("Option 2");
    fireEvent.click(option2);

    expect(onSelect).toHaveBeenCalledWith("Option 2");
  });

  it("closes the dropdown after an option is selected", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    const option2 = screen.getByText("Option 2");
    fireEvent.click(option2);

    expect(screen.queryByText("Option 2")).toBeNull();
    expect(screen.queryByText("Option 3")).toBeNull();
  });

  it("does not render options when the dropdown is closed", () => {
    render(<DropdownButton options={options} selected={selected} onSelect={onSelect} />);
    expect(screen.queryByText("Option 2")).toBeNull();
    expect(screen.queryByText("Option 3")).toBeNull();
  });
});