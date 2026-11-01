// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useMatchmaking } from "@web/features/matchmaking/index.js";

const wire = vi.hoisted(() => ({ handlers: new Map<string, (value?: unknown) => void>(), commands: [] as Array<{ payload: { type: string }; ack: (value: unknown) => void }>, options: null as { path: string; auth: (done: (proof: unknown) => void) => void } | null, url: "" }));
vi.mock("socket.io-client", () => ({ io: (url: string, options: { path: string; auth: (done: (proof: unknown) => void) => void }) => {
  wire.url = url; wire.options = options;
  return { connected: true, on: (name: string, fn: (value?: unknown) => void) => wire.handlers.set(name, fn), connect: () => {}, disconnect: () => {}, removeAllListeners: () => {}, emit: (_name: string, payload: { type: string }, ack: (value: unknown) => void) => wire.commands.push({ payload, ack }) };
} }));
const proof = vi.fn(async () => ({ kind: "guest" as const, guestCapability: "a".repeat(43) }));
const state = { bootId: "boot-1", serverNow: "2026-01-01T00:00:00Z", queueId: null, mode: null, status: "IDLE", startedAt: null, deadline: null, offerId: null, confirmed: false, roomId: null };
const searching = { ...state, queueId: "queue-1", mode: "CASUAL", status: "SEARCHING", deadline: "2026-01-01T00:02:00Z" };
function setup() { return renderHook(() => useMatchmaking({ userId: "user-1", getProof: proof, onMatched: vi.fn() })); }
function connect() { act(() => wire.handlers.get("connect")?.()); }
function ack(value: unknown, index = wire.commands.length - 1) { act(() => wire.commands[index]!.ack({ status: "ok", state: value })); }
afterEach(() => { wire.handlers.clear(); wire.commands.length = 0; sessionStorage.clear(); vi.clearAllMocks(); });

test("connect syncs without joining and only one join can be pending", () => {
  const hook = setup(); connect();
  expect(wire.commands[0]!.payload.type).toBe("sync"); ack(state);
  act(() => { hook.result.current.join("CASUAL"); hook.result.current.join("CASUAL"); });
  expect(wire.commands.filter((c) => c.payload.type === "join")).toHaveLength(1);
  ack(searching);
  expect(hook.result.current.state?.status).toBe("SEARCHING");
  hook.unmount();
});

test("reload sync carries queue intent and old ack cannot replace newer event", () => {
  const first = setup(); connect(); ack(state); act(() => first.result.current.join("CASUAL")); ack(searching); first.unmount();
  wire.commands.length = 0;
  const second = setup(); connect();
  expect(wire.commands[0]!.payload).toMatchObject({ type: "sync", queueId: "queue-1", bootId: "boot-1" });
  ack(searching);
  act(() => second.result.current.cancel());
  act(() => wire.handlers.get("matchmaking.state")?.({ ...searching, status: "CANCELLED", serverNow: "2026-01-01T00:00:02Z" }));
  ack(searching);
  expect(second.result.current.state?.status).toBe("CANCELLED");
  second.unmount();
});

test("a server restart reports cancelled instead of rejoining", () => {
  sessionStorage.setItem("xiangqi.matchmaking.user-1", JSON.stringify({ queueId: "queue-1", bootId: "boot-1" }));
  const hook = setup(); connect(); ack({ ...state, bootId: "boot-2", status: "CANCELLED", reason: "Hàng đợi đã bị huỷ, hãy tìm lại" });
  expect(hook.result.current.state?.status).toBe("CANCELLED");
  expect(wire.commands.map((c) => c.payload.type)).toEqual(["sync"]);
  hook.unmount();
});

test("confirmation carries the current offer and server clock drives its deadline", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
  const hook = setup(); connect(); ack(state);
  act(() => hook.result.current.join("CASUAL")); ack(searching);
  act(() => wire.handlers.get("matchmaking.state")?.({ ...searching, status: "CONFIRMING", offerId: "offer-1", serverNow: "2026-01-01T00:00:10Z", deadline: "2026-01-01T00:00:40Z" }));
  expect(hook.result.current.seconds).toBe(30);
  act(() => hook.result.current.confirm());
  expect(wire.commands.at(-1)?.payload).toMatchObject({ type: "confirm", queueId: "queue-1", bootId: "boot-1", offerId: "offer-1" });
  hook.unmount(); vi.useRealTimers();
});

test("matched navigation happens once, and an idle room id never navigates", () => {
  const onMatched = vi.fn();
  const hook = renderHook(() => useMatchmaking({ userId: "user-1", getProof: proof, onMatched }));
  connect(); ack({ ...state, roomId: "room-1" });
  expect(onMatched).not.toHaveBeenCalled();
  act(() => wire.handlers.get("matchmaking.state")?.({ ...state, status: "MATCHED", roomId: "room-1" }));
  act(() => wire.handlers.get("matchmaking.state")?.({ ...state, status: "MATCHED", roomId: "room-1" }));
  act(() => hook.result.current.sync());
  ack({ ...state, status: "MATCHED", roomId: "room-1" });
  expect(hook.result.current.open).toBe(false);
  expect(onMatched).toHaveBeenCalledOnce();
  expect(onMatched).toHaveBeenCalledWith("room-1");
  hook.unmount();
});

test("route sync requested during a command runs after its acknowledgement", async () => {
  const hook = setup(); connect(); ack(state);
  act(() => { hook.result.current.join("CASUAL"); hook.result.current.sync(); });
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync", "join"]);
  ack(searching);
  await act(async () => { await Promise.resolve(); });
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync", "join", "sync"]);
  hook.unmount();
});

test("a join clicked while the connect sync is in flight opens feedback and joins after the sync", () => {
  const hook = setup(); connect();
  act(() => hook.result.current.join("CASUAL"));
  expect(hook.result.current.open).toBe(true);
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync"]);
  ack(state);
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync", "join"]);
  hook.unmount();
});

test("an explicit retry while disconnected syncs before joining exactly once", () => {
  const hook = setup();
  act(() => hook.result.current.join("CASUAL"));
  expect(hook.result.current.error).toBeTruthy();
  expect(wire.commands).toHaveLength(0);
  act(() => hook.result.current.retry());
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync"]);
  ack(state);
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync", "join"]);
  hook.unmount();
});
test("a dismissed terminal queue state stays closed across sync and reload, but a newer one opens", () => {
  const timedOut = { ...state, bootId: "boot-1", queueId: "queue-9", mode: "CASUAL", status: "TIMED_OUT", startedAt: "2026-01-01T00:00:00Z", deadline: "2026-01-01T00:02:00Z" };
  const first = setup(); connect(); ack(timedOut);
  expect(first.result.current.open).toBe(true);
  act(() => first.result.current.dismiss());
  expect(first.result.current.open).toBe(false);
  act(() => first.result.current.sync());
  ack({ ...timedOut, serverNow: "2026-01-01T00:03:00Z" });
  expect(first.result.current.open).toBe(false);
  first.unmount(); wire.commands.length = 0;
  const second = setup(); connect(); ack({ ...timedOut, serverNow: "2026-01-01T00:04:00Z" });
  expect(second.result.current.open).toBe(false);
  act(() => wire.handlers.get("matchmaking.state")?.({ ...timedOut, queueId: "queue-10", serverNow: "2026-01-01T00:05:00Z" }));
  expect(second.result.current.open).toBe(true);
  second.unmount();
});

test("unsolicited matchmaking errors do not open an idle user's modal", () => {
  const hook = setup(); connect(); ack(state);
  act(() => wire.handlers.get("matchmaking.error")?.({ status: "error", error: { code: "AUTH_REQUIRED", message: "Phiên đã hết hạn" } }));
  expect(hook.result.current.open).toBe(false);
  hook.unmount();
});

test("server matchmaking errors are shown during an active search", () => {
  const hook = setup(); connect(); ack(state);
  act(() => hook.result.current.join("CASUAL")); ack(searching);
  act(() => wire.handlers.get("matchmaking.error")?.({ status: "error", error: { code: "AUTH_REQUIRED", message: "Phiên đã hết hạn" } }));
  expect(hook.result.current.open).toBe(true);
  expect(hook.result.current.error).toBe("Phiên đã hết hạn");
  hook.unmount();
});

test("a failed handshake does not open an idle user's modal", async () => {
  proof.mockRejectedValueOnce(new Error("offline"));
  const hook = setup();
  await act(async () => { wire.options!.auth(() => {}); await Promise.resolve(); });
  expect(hook.result.current.open).toBe(false);
  hook.unmount();
});

test("a failed handshake is shown after the user requests a search", async () => {
  proof.mockRejectedValueOnce(new Error("offline"));
  const hook = setup();
  act(() => hook.result.current.join("CASUAL"));
  await act(async () => { wire.options!.auth(() => {}); await Promise.resolve(); });
  expect(hook.result.current.open).toBe(true);
  expect(hook.result.current.error).toBeTruthy();
  hook.unmount();
});

test.each(["SEARCHING", "CONFIRMING"])("offline %s can be dismissed without losing intent and reopens on sync", (status) => {
  const hook = setup(); connect(); ack(state);
  act(() => hook.result.current.join("CASUAL")); ack({ ...searching, status, offerId: status === "CONFIRMING" ? "offer-1" : null });
  act(() => wire.handlers.get("disconnect")?.());
  act(() => hook.result.current.dismiss());
  expect(hook.result.current.open).toBe(false);
  expect(JSON.parse(sessionStorage.getItem("xiangqi.matchmaking.user-1")!)).toEqual({ queueId: "queue-1", bootId: "boot-1" });
  expect(wire.commands.map((command) => command.payload.type)).toEqual(["sync", "join"]);
  connect();
  expect(wire.commands.at(-1)?.payload).toMatchObject({ type: "sync", queueId: "queue-1", bootId: "boot-1" });
  ack({ ...searching, status, offerId: status === "CONFIRMING" ? "offer-1" : null });
  expect(hook.result.current.open).toBe(true);
  expect(hook.result.current.state?.status).toBe(status);
  hook.unmount();
});
