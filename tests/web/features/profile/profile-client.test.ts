import { describe, expect, it, vi } from "vitest";
import {
  ProfileRequestError,
  createProfileClient,
} from "@web/features/profile/profile-client.js";
function ok(body: unknown) {
  return { ok: true, json: async () => body } as Response;
}
function fail(code: string, status = 400) {
  return {
    ok: false,
    status,
    json: async () => ({ code, message: "denied" }),
  } as Response;
}
describe("profile client", () => {
  it("only accepts bounded numeric cooldown days in an error", async () => {
    for (const days of [6, 0, 8, "6", "private-upstream"]) {
      const client = createProfileClient(
        vi
          .fn()
          .mockResolvedValue({
            ok: false,
            status: 429,
            json: async () => ({
              code: "USERNAME_CHANGE_LIMITED",
              retryAfterDays: days,
            }),
          } as Response),
      );
      await expect(client.changeUsernameRequest()).rejects.toMatchObject({
        retryAfterDays: days === 6 ? 6 : undefined,
      });
    }
  });
  it("reads username, email and display name", async () => {
    const fetch = vi.fn().mockResolvedValue(
      ok({
        userId: "u",
        username: "kythu",
        email: "kythu@example.invalid",
        displayName: "Kỳ Hữu",
      }),
    );
    const client = createProfileClient(fetch);
    expect(await client.read()).toMatchObject({
      username: "kythu",
      email: "kythu@example.invalid",
      displayName: "Kỳ Hữu",
    });
    expect(fetch).toHaveBeenCalledWith("/profile", expect.anything());
  });
  it("patches the display name", async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ displayName: "Tên Mới" }));
    const client = createProfileClient(fetch);
    expect(await client.updateDisplayName("Tên Mới")).toEqual({
      displayName: "Tên Mới",
    });
    const [, init] = fetch.mock.calls[0]!;
    expect((init as RequestInit).method).toBe("PATCH");
  });
  it("maps server codes and reads location", async () => {
    const denied = createProfileClient(
      vi.fn().mockResolvedValue(fail("PROFILE_NAME_FORBIDDEN")),
    );
    const error = await denied
      .updateDisplayName("x")
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(ProfileRequestError);
    expect((error as ProfileRequestError).code).toBe("PROFILE_NAME_FORBIDDEN");
    const located = createProfileClient(
      vi
        .fn()
        .mockResolvedValue(
          ok({ kind: "playing-online", roomId: "r", matchId: "m" }),
        ),
    );
    expect(await located.location()).toEqual({
      kind: "playing-online",
      roomId: "r",
      matchId: "m",
    });
  });
  it("asks the location endpoint and defaults absent ids to null", async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ kind: "none" }));
    expect(await createProfileClient(fetch).location()).toEqual({
      kind: "none",
      roomId: null,
      matchId: null,
    });
    const [path, init] = fetch.mock.calls[0]!;
    expect(path).toBe("/profile/location");
    expect((init as RequestInit | undefined)?.method ?? "GET").toBe("GET");
  });
  it("rejects a profile payload missing required fields", async () => {
    const client = createProfileClient(
      vi.fn().mockResolvedValue(ok({ userId: "u", username: "kythu" })),
    );
    await expect(client.read()).rejects.toMatchObject({
      code: "PROFILE_BAD_RESPONSE",
    });
  });
  it("rejects malformed payloads", async () => {
    const client = createProfileClient(
      vi.fn().mockResolvedValue(ok({ kind: "elsewhere" })),
    );
    await expect(client.location()).rejects.toBeInstanceOf(ProfileRequestError);
  });
  it("runs the OTP-first username change and returns the capability", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        ok({
          requestId: "r",
          expiresAt: "e",
          resendAt: "s",
          maskedEmail: "k***@x.invalid",
        }),
      )
      .mockResolvedValueOnce(ok({ changeToken: "t", expiresAt: "x" }))
      .mockResolvedValueOnce(ok({ username: "kythu_new" }));
    const client = createProfileClient(fetch);
    expect(await client.changeUsernameRequest()).toMatchObject({
      requestId: "r",
    });
    expect(await client.changeUsernameVerify("r", "123456")).toEqual({
      changeToken: "t",
      expiresAt: "x",
    });
    expect(await client.changeUsernameFinalize("t", "kythu_new")).toBe(
      "kythu_new",
    );
    expect(fetch.mock.calls.map(([path]) => path)).toEqual([
      "/account/username/change/request",
      "/account/username/change/verify",
      "/account/username/change/finalize",
    ]);
  });
  it("maps a taken name on finalize to a profile error", async () => {
    const client = createProfileClient(
      vi.fn().mockResolvedValue(fail("USERNAME_TAKEN", 409)),
    );
    await expect(
      client.changeUsernameFinalize("t", "taken_name"),
    ).rejects.toMatchObject({ code: "USERNAME_TAKEN", status: 409 });
  });
});
