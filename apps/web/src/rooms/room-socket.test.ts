import { afterEach, expect, it, vi } from "vitest";
import { connectRoom } from "./room-client.js";
it("does not pass a late credential result to a socket that has been closed", async () => {
  let finish!: (value: { accessToken: string; appSession: string }) => void;
  const peer = connectRoom({
    roomId: "room",
    getProof: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  peer.close();
  finish({ accessToken: "late", appSession: "cap" });
  await Promise.resolve();
  expect(done).not.toHaveBeenCalled();
});
const fixture = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => void>(),
  options: null as null | { auth: (done: (proof: unknown) => void) => void },
  emit: vi.fn(),
  socket: {
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));
vi.mock("socket.io-client", () => ({
  io: vi.fn((_base, options) => {
    fixture.options = options;
    return {
      ...fixture.socket,
      on: (event: string, callback: (...args: unknown[]) => void) =>
        fixture.handlers.set(event, callback),
      timeout: () => ({ emit: fixture.emit }),
    };
  }),
}));
afterEach(() => {
  vi.clearAllMocks();
  fixture.handlers.clear();
});
it("accepts room closure only for this room with the fixed public notice", () => {
  const onClosed = vi.fn();
  const peer = connectRoom({
    roomId: "room",
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
    onClosed,
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "other",
    message: "Phòng đã đóng",
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "private error",
  });
  expect(onClosed).not.toHaveBeenCalled();
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "Phòng đã đóng",
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "Phòng đã đóng",
  });
  expect(onClosed).toHaveBeenCalledExactlyOnceWith("Phòng đã đóng");
  peer.close();
});
it("obtains fresh in-memory proof on every handshake and reuses the same tab identity", async () => {
  const proof = vi
    .fn()
    .mockResolvedValueOnce({ accessToken: "first", appSession: "cap" })
    .mockResolvedValueOnce({ accessToken: "renewed", appSession: "cap" });
  const peer = connectRoom({
    roomId: "room",
    getProof: proof,
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  await Promise.resolve();
  fixture.options!.auth(done);
  await Promise.resolve();
  expect(done.mock.calls[0]![0]).toMatchObject({
    accessToken: "first",
    roomId: "room",
    appSession: "cap",
    tabId: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(done.mock.calls[1]![0]).toMatchObject({
    accessToken: "renewed",
    tabId: done.mock.calls[0]![0].tabId,
  });
  peer.close();
  expect(fixture.socket.disconnect).toHaveBeenCalledOnce();
});
it("sends Ready only through versioned command and rejects ambiguous acknowledgements without retry", async () => {
  const peer = connectRoom({
    roomId: "room",
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  fixture.emit.mockImplementation((_event, _command, callback) =>
    callback(new Error("timeout")),
  );
  await expect(
    peer.command({ type: "room.ready", payload: { ready: true } }, 7),
  ).rejects.toThrow("Chưa nhận được xác nhận");
  expect(fixture.emit).toHaveBeenCalledTimes(1);
  expect(fixture.emit.mock.calls[0]![1]).toEqual({
    commandId: expect.any(String),
    roomId: "room",
    expectedVersion: 7,
    action: { type: "room.ready", payload: { ready: true } },
  });
  peer.close();
});
