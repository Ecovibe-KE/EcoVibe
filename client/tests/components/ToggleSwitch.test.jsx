import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleSwitch } from "../../src/utils/ToggleSwitch";
import { describe, it, expect, vi } from "vitest";

describe("ToggleSwitch Component", () => {
  it("renders the label correctly", () => {
    render(<ToggleSwitch label="Test Label" checked={false} onChange={() => { }} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders the checkbox with the correct checked state", () => {
    render(<ToggleSwitch label="Test Label" checked={true} onChange={() => { }} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  it("calls onChange when the checkbox is clicked", () => {
    const onChange = vi.fn();
    render(<ToggleSwitch label="Test Label" checked={false} onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("toggles the checked state when clicked", () => {
    const onChange = vi.fn();
    const { rerender } = render(<ToggleSwitch label="Test Label" checked={false} onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(<ToggleSwitch label="Test Label" checked={true} onChange={onChange} />);
    const checkbox2 = screen.getByRole("checkbox");
    expect(checkbox2.checked).toBe(true);
  });
});