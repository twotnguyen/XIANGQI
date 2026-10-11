import { expect, it, vi } from "vitest";
import { createRoomClient } from "./room-client.js";
const id = "11111111-1111-4111-8111-111111111111";
const roomView = {
  roomId: id,
  version: 2,
  serverNow: "2026-10-11T00:00:00Z",
  role: "red",
  room: {
    name: "Kỳ hữu",
    status: "WAITING",
    hostId: id,
    visibility: "CODE_ONLY",
    inviteCode: "K7M2XQP4",
    timeMinutes: 10,
    viewerLimit: 5,
    seats: { red: id, black: null },
    ready: { red: false, black: false },
    connected: { red: true, black: false },
    graceUntil: { red: null, black: null },
    countdown: null,
  },
};
it("accepts the actual waiting projection including nullable seat/countdown fields", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(roomView)));
  const value = await createRoomClient(request).snapshot(id);
  expect(value.room.seats.black).toBeNull();
  expect(value.room.inviteCode).toBe("K7M2XQP4");
  expect(value.role).toBe("red");
});
it.each([
  { ...roomView, room: { ...roomView.room, inviteCode: undefined } },
  {
    ...roomView,
    room: { ...roomView.room, ready: { red: "true", black: false } },
  },
  { ...roomView, roomId: "22222222-2222-4222-8222-222222222222" },
])(
  "rejects missing invite projection, invalid seat state or cross-room response",
  async (body) => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body)));
    await expect(createRoomClient(request).snapshot(id)).rejects.toThrow(
      "Phản hồi phòng không hợp lệ",
    );
  },
);
it("sends strict create defaults with an idempotency UUID through authorizedFetch", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        roomId: "11111111-1111-4111-8111-111111111111",
        version: 0,
        role: "red",
        inviteCode: "K7M2XQP4",
      }),
    ),
  );
  await createRoomClient(request).create({
    name: "Kỳ hữu",
    timeMinutes: 10,
    viewerLimit: 5,
  });
  const [path, init] = request.mock.calls[0]!;
  expect(path).toBe("/rooms");
  expect(init.redirect).toBe("error");
  expect(JSON.parse(init.body)).toEqual({
    commandId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    name: "Kỳ hữu",
    timeMinutes: 10,
    viewerLimit: 5,
  });
});
it.each([
  { rooms: [] },
  { roomId: "not-a-uuid", version: 0, role: "red" },
  { roomId: "11111111-1111-4111-8111-111111111111", version: -1, role: "red" },
])("rejects malformed HTTP 200 entries before navigation", async (body) => {
  const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
  await expect(
    createRoomClient(request).create({
      name: "Kỳ hữu",
      timeMinutes: 10,
      viewerLimit: 5,
    }),
  ).rejects.toThrow("Phản hồi phòng không hợp lệ");
});
it("rejects a malformed room shape before rendering", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        roomId: "11111111-1111-4111-8111-111111111111",
        version: 0,
        role: "red",
        room: { seats: null },
      }),
    ),
  );
  await expect(
    createRoomClient(request).snapshot("11111111-1111-4111-8111-111111111111"),
  ).rejects.toThrow("Phản hồi phòng không hợp lệ");
});
it("does not automatically repeat stale seat switches", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        code: "VERSION_STALE",
        message: "private backend trace",
      }),
      { status: 409 },
    ),
  );
  await expect(
    createRoomClient(request).switchSeat("room", 4),
  ).rejects.toMatchObject({ code: "VERSION_STALE" });
  expect(request).toHaveBeenCalledTimes(1);
  expect(JSON.parse(request.mock.calls[0]![1].body)).toEqual({
    expectedVersion: 4,
  });
});
it("sanitizes unknown server messages and keeps authorization headers owned by session", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(new Response("upstream token secret", { status: 503 }));
  await expect(createRoomClient(request).snapshot("room")).rejects.toThrow(
    "Chức năng phòng chưa sẵn sàng",
  );
  expect(request.mock.calls[0]![1].headers).toBeUndefined();
});
