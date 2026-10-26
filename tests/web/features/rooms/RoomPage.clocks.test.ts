// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { screen, act } from "@testing-library/react";
import type { RoomSnapshot } from "@xiangqi/shared";
import {
  setup,
  clockState,
  visibility,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("shows both server clocks and readonly visibility refresh rebases a spectator without issuing a command", async () => {
  const state = { ...clockState(), role: "spectator" as const };
  const f = setup(state);
  await f.ready();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "05:00",
  );
  await visibility("hidden");
  expect(f.refresh).not.toHaveBeenCalled();
  f.refresh.mockResolvedValue({
    ...state,
    serverNow: "2026-10-11T00:01:00Z",
    clocks: { ...state.clocks!, redMs: 240000, asOf: "2026-10-11T00:01:00Z" },
  });
  await visibility("visible");
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:00",
  );
  expect(f.command).not.toHaveBeenCalled();
});
it("keeps the running clock during physical disconnection and does not refresh while disconnected", async () => {
  let now = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  const f = setup(clockState());
  await f.ready();
  f.disconnect();
  act(() => {
    now += 2000;
    vi.advanceTimersByTime(2000);
  });
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:58",
  );
  await visibility("visible");
  expect(f.refresh).not.toHaveBeenCalled();
  expect(f.command).not.toHaveBeenCalled();
});
it.each(["reconnect", "new-match", "unmount"] as const)(
  "fences a visibility response after %s",
  async (change) => {
    const state = clockState(),
      f = setup(state);
    await f.ready();
    let finish!: (value: RoomSnapshot) => void;
    f.refresh.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await visibility("visible");
    if (change === "reconnect") {
      f.disconnect();
      f.reconnect();
      f.publish({
        ...state,
        serverNow: "2026-10-11T00:00:20Z",
        clocks: {
          ...state.clocks!,
          redMs: 280000,
          asOf: "2026-10-11T00:00:20Z",
        },
      });
    } else if (change === "new-match") {
      f.publish({
        ...state,
        version: 5,
        match: { ...state.match!, id: "87654321-1234-4234-8234-123456789abc" },
        clocks: { ...state.clocks!, redMs: 600000 },
      });
    } else f.unmount();
    await act(async () =>
      finish({
        ...state,
        version: 100,
        serverNow: "2026-10-11T00:02:00Z",
        clocks: { ...state.clocks!, redMs: 180000 },
      }),
    );
    if (change !== "unmount")
      expect(
        screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent,
      ).toBe(change === "reconnect" ? "04:40" : "10:00");
    else expect(screen.queryByRole("timer")).toBeNull();
    expect(f.command).not.toHaveBeenCalled();
  },
);
it("retains the fresher clock when a same-version snapshot has an older server timestamp", async () => {
  const state = clockState(),
    f = setup(state);
  await f.ready();
  const fresh = {
    ...state,
    serverNow: "2026-10-11T00:00:30Z",
    clocks: { ...state.clocks!, redMs: 270000, asOf: "2026-10-11T00:00:30Z" },
  };
  f.publish(fresh);
  f.refresh.mockResolvedValue(state);
  await visibility("visible");
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:30",
  );
  f.publish(state);
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:30",
  );
});
it("sanitizes a refresh failure and permits another readonly refresh", async () => {
  const f = setup(clockState());
  await f.ready();
  f.refresh.mockRejectedValueOnce(new Error("PRIVATE_PROVIDER_PAYLOAD"));
  await visibility("visible");
  expect(
    screen.getByText("Chưa thể đồng bộ đồng hồ. Kiểm tra kết nối rồi thử lại."),
  ).toBeTruthy();
  expect(screen.queryByText("PRIVATE_PROVIDER_PAYLOAD")).toBeNull();
  await visibility("hidden");
  await visibility("visible");
  expect(f.refresh).toHaveBeenCalledTimes(2);
  expect(
    screen.queryByText(
      "Chưa thể đồng bộ đồng hồ. Kiểm tra kết nối rồi thử lại.",
    ),
  ).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});
