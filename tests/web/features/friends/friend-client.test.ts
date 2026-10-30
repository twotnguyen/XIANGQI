import { expect, it, vi } from "vitest";
import {
  FriendRequestError,
  createFriendClient,
} from "@web/features/friends/friend-client.js";
const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
it("accepts search results without inventing a presence status", async () => {
  const people = [{ userId: "u", username: "a", displayName: "A" }];
  const client = createFriendClient(vi.fn().mockResolvedValue(ok(people)));
  expect(await client.search("a")).toEqual(people);
});
it("never leaks upstream response text through errors", async () => {
  const client = createFriendClient(
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "FRIEND_LIMIT",
            message: "private provider details",
          }),
          { status: 403 },
        ),
      ),
  );
  const error = await client.send("a").catch((error: unknown) => error);
  expect(error).toBeInstanceOf(FriendRequestError);
  expect(error).toMatchObject({ code: "FRIEND_LIMIT", status: 403 });
  expect((error as Error).message).not.toContain("private provider details");
});
it.each([
  { accepted: true, roomId: "B", role: "viewer", version: 1 },
  { accepted: true, roomId: "B", role: "black" },
  { accepted: true, roomId: "B", role: "black", version: -1 },
])(
  "rejects a malformed joined result rather than navigating with it: %j",
  async (body) => {
    const client = createFriendClient(vi.fn().mockResolvedValue(ok(body)));
    await expect(client.respondInvite("i", true, "cmd")).rejects.toMatchObject({
      code: "FRIEND_BAD_RESPONSE",
    });
  },
);
it("rejects a malformed peer rather than silently treating it as online", async () => {
  const client = createFriendClient(
    vi
      .fn()
      .mockResolvedValue(
        ok([{ userId: "u", username: "a", displayName: "A", status: "busy" }]),
      ),
  );
  await expect(client.list()).rejects.toMatchObject({
    code: "FRIEND_BAD_RESPONSE",
  });
});
