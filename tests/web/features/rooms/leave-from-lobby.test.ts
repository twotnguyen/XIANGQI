// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import type { RoomSnapshot } from "@xiangqi/shared";
import {
  prepareLeaveFromLobby,
  type RoomClient,
  type RoomConnectionInput,
} from "@web/features/rooms/room-client.js";
import { snapshot } from "./RoomPage.test-helper.js";

const control = { tabId: "t", connectionId: "c", generation: 1 };
const withMode = (mode: "writable" | "readonly"): RoomSnapshot => ({
  ...snapshot,
  version: 4,
  control: { ...snapshot.control, mode },
});

const plan = (h: ReturnType<typeof harness>) =>
  prepareLeaveFromLobby(
    h.client,
    async () => ({}) as never,
    "r1",
    h.connect as never,
  );

function harness(first: RoomSnapshot) {
  const leave = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn();
  const takeover = vi.fn();
  let input!: RoomConnectionInput;
  const connect = vi.fn((value: RoomConnectionInput) => {
    input = value;
    queueMicrotask(() => value.onSnapshot(first));
    return {
      tabId: "t",
      getControl: async () => control,
      takeover: async () => {
        takeover();
        input.onSnapshot(withMode("writable"));
      },
      close,
    } as never;
  });
  return {
    leave,
    close,
    takeover,
    connect,
    client: { leave } as unknown as RoomClient,
  };
}

it("leaves with the snapshot version and closes the temporary connection", async () => {
  const h = harness(withMode("writable"));
  await plan(h).leave();
  expect(h.leave).toHaveBeenCalledWith("r1", 4, control);
  expect(h.takeover).not.toHaveBeenCalled();
  expect(h.close).toHaveBeenCalledOnce();
});

it("takes control from another tab before leaving", async () => {
  const h = harness(withMode("readonly"));
  await plan(h).leave();
  expect(h.takeover).toHaveBeenCalledOnce();
  expect(h.leave).toHaveBeenCalledOnce();
});

it("closes the connection and rejects when the server refuses", async () => {
  const h = harness(withMode("writable"));
  h.leave.mockRejectedValue(new Error("no"));
  await expect(plan(h).leave()).rejects.toThrow("no");
  expect(h.close).toHaveBeenCalledOnce();
});

it("opens the connection before leave() and sends a double confirm once", async () => {
  const h = harness(withMode("writable"));
  const p = plan(h);
  expect(h.connect).toHaveBeenCalledOnce();
  expect(h.leave).not.toHaveBeenCalled();
  await Promise.all([p.leave(), p.leave()]);
  expect(h.leave).toHaveBeenCalledOnce();
});

it("cancel closes a prepared connection without leaving", () => {
  const h = harness(withMode("writable"));
  plan(h).cancel();
  expect(h.close).toHaveBeenCalledOnce();
  expect(h.leave).not.toHaveBeenCalled();
});

it("uses a recovered snapshot after a temporary connection error", async () => {
  const h = harness(withMode("writable"));
  const connect = vi.fn((input: RoomConnectionInput) => {
    queueMicrotask(() => {
      input.onError("Kết nối gián đoạn");
      queueMicrotask(() => input.onSnapshot(withMode("writable")));
    });
    return { getControl: async () => control, takeover: vi.fn(), close: h.close } as never;
  });
  const prepared = prepareLeaveFromLobby(h.client, async () => ({}) as never, "r1", connect as never);
  await prepared.leave();
  expect(h.leave).toHaveBeenCalledWith("r1", 4, control);
});
