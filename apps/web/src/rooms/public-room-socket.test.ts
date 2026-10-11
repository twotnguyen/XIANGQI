import { afterEach, expect, test, vi } from "vitest";
import { connectPublicRooms } from "./public-room-client.js";
const fixture = vi.hoisted(() => ({
  handlers: new Map<string, (value?: unknown) => void>(),
  options: null as null | {
    auth: (done: (value: unknown) => void) => void;
    path: string;
  },
  url: "",
  disconnect: vi.fn(),
  connect: vi.fn(),
  removeAllListeners: vi.fn(),
}));
vi.mock("socket.io-client", () => ({
  io: vi.fn((url, options) => {
    fixture.url = url;
    fixture.options = options;
    return {
      on: (name: string, callback: (value?: unknown) => void) =>
        fixture.handlers.set(name, callback),
      disconnect: fixture.disconnect,
      connect: fixture.connect,
      removeAllListeners: fixture.removeAllListeners,
    };
  }),
}));
afterEach(() => {
  fixture.handlers.clear();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
const member = {
  kind: "member" as const,
  accessToken: "synthetic",
  appSession: "a".repeat(43),
};
const room = {
  roomId: "11111111-1111-4111-8111-111111111111",
  name: "Kỳ hữu",
  host: { displayName: "Người chơi", isGuest: false },
  timeMinutes: 10,
  status: "waiting",
  spectators: 0,
  viewerLimit: 5,
  emptySeats: 1,
  canPlay: true,
  canWatch: true,
  publicOpenedAt: null,
};
function setup(getProof = vi.fn(async () => member)) {
  const onRooms = vi.fn(),
    onConnection = vi.fn(),
    onError = vi.fn();
  return {
    peer: connectPublicRooms({ getProof, onRooms, onConnection, onError }),
    onRooms,
    onConnection,
    onError,
    getProof,
  };
}
test("actual URL/path, private proof fresh each handshake and stale completion fenced", async () => {
  vi.stubEnv("VITE_API_URL", "http://localhost:3002/");
  let first!: (value: typeof member) => void;
  const getProof = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          first = r;
        }),
    )
    .mockResolvedValueOnce({ ...member, accessToken: "new" });
  const f = setup(getProof);
  expect(fixture.url).toBe("http://localhost:3002/public-rooms");
  expect(fixture.options?.path).toBe("/public-rooms/socket.io");
  const old = vi.fn(),
    newer = vi.fn();
  fixture.options!.auth(old);
  fixture.options!.auth(newer);
  await Promise.resolve();
  first(member);
  await Promise.resolve();
  expect(old).not.toHaveBeenCalled();
  expect(newer).toHaveBeenCalledWith({ ...member, accessToken: "new" });
  f.peer.close();
});
test("close fences pending proof and all queued callbacks", async () => {
  let finish!: (value: typeof member) => void;
  const f = setup(
    vi.fn(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    ),
  );
  const done = vi.fn();
  fixture.options!.auth(done);
  f.peer.close();
  finish(member);
  await Promise.resolve();
  fixture.handlers.get("public.rooms")?.({
    rooms: [room],
    serverNow: "2026-10-11T00:00:00Z",
  });
  expect(done).not.toHaveBeenCalled();
  expect(f.onRooms).not.toHaveBeenCalled();
  expect(fixture.removeAllListeners).toHaveBeenCalled();
});
test("physical connect grants no ready; authoritative packet enables then503 disables then fresh packet restores", () => {
  const f = setup();
  fixture.handlers.get("connect")?.();
  expect(f.onConnection).not.toHaveBeenCalledWith(true);
  const packet = {
    rooms: [{ ...room, inviteCode: "PRIVATE" }],
    serverNow: "2026-10-11T00:00:00Z",
  };
  fixture.handlers.get("public.rooms")?.(packet);
  expect(f.onConnection).toHaveBeenLastCalledWith(true);
  expect(JSON.stringify(f.onRooms.mock.calls)).not.toContain("PRIVATE");
  fixture.handlers.get("public.error")?.({
    code: "PUBLIC_ROOMS_UNAVAILABLE",
    message: "PRIVATE",
  });
  expect(f.onConnection).toHaveBeenLastCalledWith(false);
  expect(fixture.disconnect).not.toHaveBeenCalled();
  fixture.handlers.get("public.rooms")?.(packet);
  expect(f.onConnection).toHaveBeenLastCalledWith(true);
  fixture.handlers.get("disconnect")?.();
  expect(f.onConnection).toHaveBeenLastCalledWith(false);
  f.peer.close();
});
test("401 disconnects without reconnect loop; malformed/late snapshots grant no ready", () => {
  const f = setup();
  fixture.handlers.get("connect")?.();
  fixture.handlers.get("public.rooms")?.({
    rooms: [room],
    serverNow: "2026-10-11T00:00:00",
  });
  expect(f.onRooms).not.toHaveBeenCalled();
  fixture.handlers.get("public.error")?.({
    code: "AUTH_REQUIRED",
    message: "PRIVATE",
  });
  expect(fixture.disconnect).toHaveBeenCalledTimes(1);
  fixture.handlers.get("public.rooms")?.({
    rooms: [room],
    serverNow: "2026-10-11T00:00:00Z",
  });
  expect(f.onRooms).not.toHaveBeenCalled();
  expect(f.onError.mock.calls.flat().join(" ")).not.toContain("PRIVATE");
  f.peer.close();
});
test("guest proof is real capability shape; injected client authority is rejected", async () => {
  const getProof = vi
    .fn()
    .mockResolvedValueOnce({ kind: "guest", guestCapability: "g".repeat(43) })
    .mockResolvedValueOnce({ ...member, userId: "PRIVATE" });
  const f = setup(getProof);
  const done = vi.fn();
  fixture.options!.auth(done);
  await Promise.resolve();
  expect(done).toHaveBeenCalledWith({
    kind: "guest",
    guestCapability: "g".repeat(43),
  });
  const second = vi.fn();
  fixture.options!.auth(second);
  await Promise.resolve();
  expect(second).not.toHaveBeenCalled();
  expect(f.onConnection).toHaveBeenLastCalledWith(false);
  f.peer.close();
});

test("packet and credential completions after physical disconnect cannot grant stale actions", async () => {
  let finish!: (value: typeof member) => void;
  const f = setup(
    vi.fn(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    ),
  );
  const done = vi.fn();
  fixture.options!.auth(done);
  fixture.handlers.get("connect")?.();
  fixture.handlers.get("disconnect")?.();
  finish(member);
  await Promise.resolve();
  fixture.handlers.get("public.rooms")?.({
    rooms: [room],
    serverNow: "2026-10-11T00:00:00Z",
  });
  expect(done).not.toHaveBeenCalled();
  expect(f.onRooms).not.toHaveBeenCalled();
  expect(f.onConnection).not.toHaveBeenCalledWith(true);
  f.peer.close();
});
