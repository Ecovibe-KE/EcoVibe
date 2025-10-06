import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PasswordInput from "../../src/components/PasswordInput";

describe("PasswordInput Component", () => {
    const label = "Password";
    const id = "password-input";

    const setup = (show = false, value = "", onChange = vi.fn()) => {
        const setShow = vi.fn();
        render(
            <PasswordInput
                label={label}
                value={value}
                onChange={onChange}
                show={show}
                setShow={setShow}
                id={id}
            />
        );
        return { setShow, onChange };
    };

    it("renders label and input with type password when show is false", () => {
        setup(false);
        const input = screen.getByLabelText(label);

        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("type", "password");

        // Check that Visibility icon is rendered (branch 1)
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("aria-label", `Show ${label}`);
    });

    it("renders input with type text and VisibilityOff icon when show is true", () => {
        setup(true);
        const input = screen.getByLabelText(label);

        expect(input).toHaveAttribute("type", "text");

        // Check that VisibilityOff icon is rendered (branch 2)
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", `Hide ${label}`);
    });

    it("clicking toggle button calls setShow with negated value", () => {
        const { setShow } = setup(false);
        const button = screen.getByRole("button");

        fireEvent.click(button);
        expect(setShow).toHaveBeenCalledWith(true);
    });

    it("input onChange handler is called on input change", () => {
        const { onChange } = setup(false);

        const input = screen.getByLabelText(label);
        fireEvent.change(input, { target: { value: "newpassword" } });

        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
