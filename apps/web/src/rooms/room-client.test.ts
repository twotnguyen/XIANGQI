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
it("changes visibility with only CAS version and mode and accepts the server rotated invite code", async () => {
  const request = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        ...roomView,
        version: 3,
        room: {
          ...roomView.room,
          visibility: "PUBLIC",
          inviteCode: "P8M2XQP4",
        },
      }),
    ),
  );
  const value = await createRoomClient(request).changeVisibility(
    id,
    2,
    "PUBLIC",
  );
  expect(request.mock.calls[0]![0]).toBe(`/rooms/${id}/visibility`);
  expect(request.mock.calls[0]![1].method).toBe("POST");
  expect(JSON.parse(request.mock.calls[0]![1].body)).toEqual({
    expectedVersion: 2,
    visibility: "PUBLIC",
  });
  expect(value.room.inviteCode).toBe("P8M2XQP4");
  expect(value.version).toBe(3);
});
it.each([
  ["ROOM_LOCK_REQUIRES_PLAYERS", 409, "Chỉ khoá được khi đã đủ 2 người chơi"],
  ["ROOM_FORBIDDEN", 403, "Chỉ chủ phòng được đổi chế độ"],
])(
  "maps the actual visibility error %s without upstream messages",
  async (code, status, message) => {
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code, message: "secret upstream" }), {
        status: status as number,
      }),
    );
    await expect(
      createRoomClient(request).changeVisibility(id, 2, "LOCKED"),
    ).rejects.toThrow(message as string);
    expect(request).toHaveBeenCalledTimes(1);
  },
);
it.each([
  { ...roomView, roomId: "22222222-2222-4222-8222-222222222222" },
  { ...roomView, room: { ...roomView.room, visibility: "PRIVATE" } },
])(
  "rejects invalid visibility projections before replacing canonical state",
  async (body) => {
    const request = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body)));
    await expect(
      createRoomClient(request).changeVisibility(id, 2, "PUBLIC"),
    ).rejects.toThrow("Phản hồi phòng không hợp lệ");
  },
);
it("keeps host-specific forbidden messaging scoped to visibility rather than other room actions", async () => {
  const request = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ code: "ROOM_FORBIDDEN", message: "secret" }),
          { status: 403 },
        ),
      ),
    );
  await expect(createRoomClient(request).snapshot(id)).rejects.toThrow(
    "Thao tác chưa thực hiện được",
  );
  await expect(
    createRoomClient(request).changeVisibility(id, 2, "PUBLIC"),
  ).rejects.toThrow("Chỉ chủ phòng được đổi chế độ");
});
it("does not retry visibility CAS errors or expose unknown upstream payloads", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ code: "VERSION_STALE", message: "secret upstream" }),
        { status: 409 },
      ),
    );
  await expect(
    createRoomClient(request).changeVisibility(id, 2, "PUBLIC"),
  ).rejects.toMatchObject({
    code: "VERSION_STALE",
    message: "Phòng đã thay đổi. Kiểm tra trạng thái mới rồi thử lại.",
  });
  expect(request).toHaveBeenCalledTimes(1);
});
