import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RichTextEditor } from "../../src/components/RichTextEditor";

// Mock initial value for the editor
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

describe("RichTextEditor", () => {
  it("renders the label when provided", () => {
    render(
      <RichTextEditor
        value={initialValue}
        onChange={() => {}}
        label="Test Label"
      />,
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders an error message when error prop is provided", () => {
    render(
      <RichTextEditor
        value={initialValue}
        onChange={() => {}}
        error="Test Error"
      />,
    );
    expect(screen.getByText("Test Error")).toBeInTheDocument();
  });

  it("renders a success message when success prop is provided", () => {
    render(
      <RichTextEditor
        value={initialValue}
        onChange={() => {}}
        success="Test Success"
      />,
    );
    expect(screen.getByText("Test Success")).toBeInTheDocument();
  });

  it("is in read-only mode when readOnly prop is true", () => {
    render(
      <RichTextEditor
        value={initialValue}
        onChange={() => {}}
        readOnly={true}
      />,
    );
    const editable = screen.getByText("A line of text in a paragraph.");
    expect(editable.closest('[contenteditable="false"]')).toBeInTheDocument();
  });
});