import { describe, it, expect, vi } from "vitest";
import * as auth from "../../../src/api/services/auth";
import api from "../../../src/api/axiosConfig";

vi.mock("../../../src/api/axiosConfig");

describe("auth.js service", () => {
  it("resendVerification rejects invalid email", async () => {
    await expect(auth.resendVerification("not-an-email"))
      .rejects.toThrow("Please enter a valid email address.");
  });

  it("resendVerification resolves with response data on success", async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    const result = await auth.resendVerification("test@test.com");
    expect(result).toEqual({ ok: true });
  });

  it("resendVerification rejects with API error message", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Email already verified" } },
    });
    await expect(auth.resendVerification("test@test.com"))
      .rejects.toThrow("Email already verified");
  });
});
