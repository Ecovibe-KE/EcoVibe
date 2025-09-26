import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ForgotPassword from '../../src/components/ForgotPassword';
import React from "react";
import { MemoryRouter } from "react-router-dom";

describe("ForgotPassword Component", () => {
  it("show password buttons toggle password visibility", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByLabelText(/new password/i, { selector: "input" });
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i, { selector: "input" });

    const newPasswordToggle = screen.getByRole("button", { name: /show new password/i });
    const confirmPasswordToggle = screen.getByRole("button", { name: /show confirm password/i });

    // Initially type is password
    expect(newPasswordInput.type).toBe("password");
    expect(confirmPasswordInput.type).toBe("password");

    // Toggle visibility
    fireEvent.click(newPasswordToggle);
    expect(newPasswordInput.type).toBe("text");
    fireEvent.click(newPasswordToggle);
    expect(newPasswordInput.type).toBe("password");

    fireEvent.click(confirmPasswordToggle);
    expect(confirmPasswordInput.type).toBe("text");
    fireEvent.click(confirmPasswordToggle);
    expect(confirmPasswordInput.type).toBe("password");
  });
});
