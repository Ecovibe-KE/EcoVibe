import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "../../../src/api/services/auth";
import api from "../../../src/api/axiosConfig";
import { toast } from "react-toastify";

// Mock dependencies
vi.mock("../../../src/api/axiosConfig", () => ({
  default: { post: vi.fn(), put: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("auth.js service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loginUser returns parsed tokens and user on success", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          access_token: "abc",
          refresh_token: "def",
          user: { id: 1, name: "Caroline" },
        },
        message: "ok",
      },
    });

    const result = await auth.loginUser({ email: "a", password: "b" });
    expect(result).toEqual({
      token: "abc",
      refreshToken: "def",
      user: { id: 1, name: "Caroline" },
    });
  });

  it("loginUser throws error for invalid response", async () => {
    api.post.mockResolvedValueOnce({
      data: { status: "fail", data: {}, message: "bad login" },
    });

    await expect(auth.loginUser({})).rejects.toThrow("bad login");
  });

  it("resendVerification rejects invalid email and calls toast.error", async () => {
    const result = await auth.resendVerification("not-an-email");
    expect(result).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(
      "Please enter a valid email address."
    );
  });

  it("resendVerification shows success toast on success", async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    const result = await auth.resendVerification("test@test.com");
    expect(result).toEqual({ ok: true });
    expect(toast.success).toHaveBeenCalled();
  });

  it("resendVerification shows error toast when API returns error message", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Email already verified" } },
    });

    await expect(auth.resendVerification("test@test.com")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith("Email already verified");
  });

  it("changePassword calls api.put and returns data", async () => {
    api.put.mockResolvedValueOnce({ data: { changed: true } });
    const result = await auth.changePassword({
      current_password: "old",
      new_password: "new",
    });
    expect(result).toEqual({ changed: true });
  });
});
