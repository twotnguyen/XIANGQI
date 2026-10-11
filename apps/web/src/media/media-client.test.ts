import { describe, expect, it, vi } from "vitest";
import { MediaRequestError, createMediaClient } from "./media-client.js";
function ok(body: unknown) {
  return { ok: true, json: async () => body } as Response;
}
function fail(code: string, status = 409) {
  return {
    ok: false,
    status,
    json: async () => ({ code, message: "denied" }),
  } as Response;
}
describe("media client", () => {
  it("requests a role scoped token and validates the payload", async () => {
    const fetch = vi.fn().mockResolvedValue(
      ok({
        url: "wss://media.example.invalid",
        token: "token-a",
        roomName: "xiangqi-room",
        expiresAt: "2026-10-11T00:10:00Z",
        stage: null,
      }),
    );
    const client = createMediaClient(fetch);
    const ticket = await client.token("room", true, false);
    expect(ticket).toMatchObject({ roomName: "xiangqi-room", stage: null });
    expect(fetch).toHaveBeenCalledWith(
      "/media/token",
      expect.objectContaining({ method: "POST" }),
    );
  });
  it("reads and writes the share level", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(ok({ level: "ALL" }))
      .mockResolvedValueOnce(ok({ level: "NONE" }));
    const client = createMediaClient(fetch);
    expect(await client.getShare("room")).toEqual({ level: "ALL" });
    expect(fetch).toHaveBeenCalledWith(
      "/media/share?roomId=room",
      expect.anything(),
    );
    expect(await client.setShare("room", "NONE")).toEqual({ level: "NONE" });
  });
  it("maps server codes and rejects malformed payloads", async () => {
    const denied = createMediaClient(
      vi.fn().mockResolvedValue(fail("MEDIA_PLAYER_REQUIRED", 403)),
    );
    const error = await denied
      .setShare("room", "ALL")
      .catch((value: unknown) => value);
    expect(error).toBeInstanceOf(MediaRequestError);
    expect((error as MediaRequestError).code).toBe("MEDIA_PLAYER_REQUIRED");
    const broken = createMediaClient(vi.fn().mockResolvedValue(ok({ url: 1 })));
    await expect(broken.token("room", false, false)).rejects.toBeInstanceOf(
      MediaRequestError,
    );
  });
});
