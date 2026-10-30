import { expect, it } from "vitest";
import { fixture, observer, snapshot } from "./room-socket.test-helper.js";

it("exposes only the current physical controller and waits for a fresh snapshot after reconnect", async () => {
  const { peer } = observer();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  fixture.handlers.get("room.snapshot")?.(snapshot());
  await expect(peer.getControl()).resolves.toEqual({
    tabId: peer.tabId,
    connectionId: "test-connection",
    generation: 1,
  });
  fixture.handlers.get("session.read_only")?.();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    control: { mode: "readonly", reason: "superseded", generation: 2 },
  });
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    control: { mode: "writable", reason: null, generation: 3 },
  });
  await expect(peer.getControl()).resolves.toMatchObject({ generation: 3 });
  fixture.handlers.get("room.snapshot")?.(snapshot());
  await expect(peer.getControl()).resolves.toMatchObject({ generation: 3 });
  fixture.handlers.get("disconnect")?.();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  fixture.handlers.get("connect")?.();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    control: { mode: "writable", reason: null, generation: 4 },
  });
  await expect(peer.getControl()).resolves.toMatchObject({ generation: 4 });
  peer.close();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
});
it("allows a spectator's own physical control for leave and invitation responses, without player control", async () => {
  const { peer } = observer();
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    role: "spectator",
    control: { mode: "readonly", reason: "not_allowed", generation: 1 },
  });
  await expect(peer.getControl()).resolves.toMatchObject({
    connectionId: "test-connection",
    generation: 1,
  });
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    role: "spectator",
    control: { mode: "readonly", reason: "superseded", generation: 2 },
  });
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
  peer.close();
});
it("does not restore HTTP authority from a late sync acknowledged while disconnected", async () => {
  const { peer } = observer();
  fixture.handlers.get("room.snapshot")?.(snapshot());
  let acknowledge!: (error: null, value: unknown) => void;
  fixture.emit.mockImplementation(
    (_event: string, callback: typeof acknowledge) => {
      acknowledge = callback;
    },
  );
  const pending = peer.refresh();
  fixture.handlers.get("disconnect")?.();
  // The real socket flips connected synchronously before notifying consumers.
  // A reconnect still cannot reuse a proof without a new authority-bearing snapshot.
  fixture.handlers.get("connect")?.();
  peer.close();
  acknowledge(null, { status: "ok", snapshot: snapshot() });
  await expect(pending).rejects.toThrow();
  await expect(peer.getControl()).rejects.toMatchObject({
    code: "ROOM_TAB_READ_ONLY",
  });
});
