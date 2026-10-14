import { describe, expect, it, vi } from "vitest";
import {
  FriendRequestError,
  createFriendClient,
} from "@web/features/friends/friend-client.js";
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
describe("friend client", () => {
  it("lists peers and parses presence", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        ok([
          { userId: "u", username: "a", displayName: "A", status: "online" },
        ]),
      );
    const client = createFriendClient(fetch);
    expect(await client.list()).toEqual([
      { userId: "u", username: "a", displayName: "A", status: "online" },
    ]);
    expect(fetch).toHaveBeenCalledWith("/friends", expect.anything());
  });
  it("maps server codes without leaking bodies", async () => {
    const fetch = vi.fn().mockResolvedValue(fail("FRIEND_LIMIT", 403));
    const client = createFriendClient(fetch);
    const failure = await client.send("a").catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(FriendRequestError);
    expect((failure as FriendRequestError).code).toBe("FRIEND_LIMIT");
  });
  it("sends room invites and answers with room code", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(ok({ id: "i" }))
      .mockResolvedValueOnce(
        ok({ accepted: true, roomId: "r", code: "ABCD1234" }),
      );
    const client = createFriendClient(fetch);
    await client.invite("r", "b");
    expect(fetch).toHaveBeenCalledWith(
      "/friends/invites",
      expect.objectContaining({ method: "POST" }),
    );
    const accepted = await client.respondInvite("i", true);
    expect(accepted).toMatchObject({ accepted: true, code: "ABCD1234" });
  });
  it("rejects malformed payloads", async () => {
    const fetch = vi.fn().mockResolvedValue(ok([{ userId: "u" }]));
    const client = createFriendClient(fetch);
    await expect(client.list()).rejects.toBeInstanceOf(FriendRequestError);
  });
});
