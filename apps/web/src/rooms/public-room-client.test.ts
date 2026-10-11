import { afterEach, expect, test, vi } from "vitest";
import {
  makePublicRoomClient,
  parsePublicRooms,
} from "./public-room-client.js";
const id = "11111111-1111-4111-8111-111111111111";
const room = {
  roomId: id,
  name: "Kỳ hữu",
  host: { displayName: "Người chơi", isGuest: false },
  timeMinutes: 10,
  status: "waiting",
  spectators: 0,
  viewerLimit: 5,
  emptySeats: 1,
  canPlay: true,
  canWatch: true,
  publicOpenedAt: "2026-10-11T00:00:00Z",
};
afterEach(() => vi.unstubAllGlobals());
test("GET actual array preserves server order and strips private fields", async () => {
  const second = {
    ...room,
    roomId: "22222222-2222-4222-8222-222222222222",
    publicOpenedAt: null,
  };
  const fetch = vi.fn(
    async () =>
      new Response(
        JSON.stringify([
          second,
          {
            ...room,
            inviteCode: "PRIVATE",
            host: { ...room.host, userId: "PRIVATE" },
          },
        ]),
      ),
  );
  const result = await makePublicRoomClient(fetch).list();
  expect(fetch).toHaveBeenCalledWith("/public-rooms", { method: "GET" });
  expect(result.map((r) => r.roomId)).toEqual([second.roomId, id]);
  expect(JSON.stringify(result)).not.toContain("PRIVATE");
  expect(result[0]?.publicOpenedAt).toBeNull();
});
test.each([
  { rooms: [room] },
  Array.from({ length: 51 }, () => room),
  [room, room],
  [{ ...room, spectators: 6 }],
  [{ ...room, viewerLimit: 1.5 }],
  [{ ...room, timeMinutes: 7 }],
  [{ ...room, canPlay: "true" }],
  [{ ...room, status: "playing", canPlay: true }],
  [{ ...room, viewerLimit: 0, canWatch: true }],
  [{ ...room, emptySeats: 0, canPlay: true }],
  [{ ...room, publicOpenedAt: "2026-10-11T00:00:00" }],
  [{ ...room, publicOpenedAt: "2026-02-30T00:00:00Z" }],
  [{ ...room, roomId: "not-uuid" }],
])("rejects malformed or unsafe authoritative rooms", (value) =>
  expect(() => parsePublicRooms(value)).toThrow(
    "Phản hồi danh sách phòng không hợp lệ",
  ),
);
test("full50 and timezone-offset dates remain canonical", () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({
    ...room,
    roomId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    publicOpenedAt: "2026-10-11T07:00:00+07:00",
  }));
  expect(parsePublicRooms(rows)).toEqual(rows);
});
test("join sends new UUID and preference only; whitelists cross-room guarded response", async () => {
  vi.stubGlobal("crypto", {
    randomUUID: () => "33333333-3333-4333-8333-333333333333",
  });
  const fetch = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          roomId: id,
          version: 2,
          role: "spectator",
          notice: "Ghế vừa có người, bạn đang xem trận",
          inviteCode: "PRIVATE",
          accessToken: "PRIVATE",
        }),
      ),
  );
  expect(await makePublicRoomClient(fetch).join(id, "play")).toEqual({
    roomId: id,
    version: 2,
    role: "spectator",
    notice: "Ghế vừa có người, bạn đang xem trận",
  });
  expect(fetch).toHaveBeenCalledWith(`/public-rooms/${id}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commandId: "33333333-3333-4333-8333-333333333333",
      preference: "play",
    }),
  });
});
test.each([
  { roomId: id, version: -1, role: "red" },
  { roomId: id, version: 2, role: "host" },
  { roomId: "22222222-2222-4222-8222-222222222222", version: 2, role: "red" },
  { roomId: id, version: 2, role: "red", notice: "PRIVATE" },
])("rejects malformed join response", async (value) => {
  const client = makePublicRoomClient(
    async () => new Response(JSON.stringify(value)),
  );
  await expect(client.join(id, "watch")).rejects.toThrow(
    "Phản hồi danh sách phòng không hợp lệ",
  );
});
test("invalid join intent/UUID is rejected before request", async () => {
  const fetch = vi.fn();
  await expect(
    makePublicRoomClient(fetch).join("bad", "play"),
  ).rejects.toThrow();
  await expect(
    makePublicRoomClient(fetch).join(id, "auto" as "play"),
  ).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});
test("HTTP503/auth errors never surface raw message or bearer", async () => {
  for (const status of [401, 503]) {
    const client = makePublicRoomClient(
      async () =>
        new Response(
          JSON.stringify({ code: "PRIVATE", message: "PRIVATE-BEARER" }),
          { status },
        ),
    );
    await expect(client.list()).rejects.toThrow(
      status === 401
        ? "Phiên đăng nhập đã hết hạn"
        : "Chưa thể tải danh sách phòng",
    );
  }
});
