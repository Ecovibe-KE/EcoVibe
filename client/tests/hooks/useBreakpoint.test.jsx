import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import useBreakpoint from "../../src/hooks/useBreakpoint";


describe("useBreakpoint hook", () => {
  const resizeWindow = (width) => {
    window.innerWidth = width;
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    // reset to default before each test
    resizeWindow(1024);
  });

  it("returns true when width >= breakpoint", () => {
    resizeWindow(1200); // bigger than lg (992)
    const { result } = renderHook(() => useBreakpoint("lg"));
    expect(result.current).toBe(true);
  });

  it("returns false when width < breakpoint", () => {
    resizeWindow(800); // smaller than lg
    const { result } = renderHook(() => useBreakpoint("lg"));
    expect(result.current).toBe(false);
  });

  it("updates value when window is resized", () => {
    const { result } = renderHook(() => useBreakpoint("lg"));

    // Start at default 1024 (>= 992) → true
    expect(result.current).toBe(true);

    // Resize smaller
    act(() => {
      resizeWindow(800);
    });
    expect(result.current).toBe(false);

    // Resize larger
    act(() => {
      resizeWindow(1200);
    });
    expect(result.current).toBe(true);
  });

  it("falls back to lg when invalid breakpoint is given", () => {
    resizeWindow(1000);
    const { result } = renderHook(() => useBreakpoint("notReal"));
    expect(result.current).toBe(true); // 1000 >= 992
  });
});
