// @vitest-environment jsdom
import { act, fireEvent, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { RoomSnapshot } from "@xiangqi/shared";
import { snapshot, setup, useRoomPageHooks } from "./RoomPage.test-helper.js";
useRoomPageHooks();

const OFFER = "33333333-3333-4333-8333-333333333333";
// Server deadline relative to the fixed serverNow, so clock skew is zero.
const ahead = (ms: number) =>
  new Date(Date.parse(snapshot.serverNow) + ms).toISOString();
const fake = () => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(snapshot.serverNow));
};
const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
// Responder is "a" (the logged-in user) unless the test says otherwise.
function offer(
  proposerId: string,
  responderId: string,
  extra: Partial<RoomSnapshot["room"]> = {},
): RoomSnapshot {
  return {
    ...snapshot,
    version: 4,
    room: {
      ...snapshot.room,
      swapOffer: {
        id: OFFER,
        proposerId,
        responderId,
        expiresAt: ahead(30_000),
      },
      ...extra,
    },
  };
}
// Synchronous equivalent of setup().ready(): findBy* would hang under fake timers.
function open(state: RoomSnapshot) {
  const f = setup(state);
  act(() => {
    f.reconnect();
    f.publish(state);
  });
  return f;
}

it("the responder prompt starts at 30 seconds and ticks down on the same deadline", () => {
  fake();
  open(offer("b", "a"));
  expect(screen.getByRole("dialog").textContent).toContain("Còn 30 giây");
  tick(1000);
  expect(screen.getByRole("dialog").textContent).toContain("Còn 29 giây");
});

it("the prompt closes at the deadline and never sends a decline", () => {
  fake();
  const f = open(offer("b", "a"));
  tick(29_000);
  expect(screen.getByRole("dialog").textContent).toContain("Còn 1 giây");
  tick(1000);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(f.client.respondSwap).not.toHaveBeenCalled();
});

it("Esc collapses without declining, and the banner reopens the same deadline", () => {
  fake();
  const f = open(offer("b", "a"));
  tick(10_000);
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { bubbles: true, cancelable: true }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(f.client.respondSwap).not.toHaveBeenCalled();
  tick(5000);
  fireEvent.click(
    screen.getByRole("button", { name: "Xem đề nghị đổi bên (15 giây)" }),
  );
  expect(screen.getByRole("dialog").textContent).toContain("Còn 15 giây");
  tick(15_000);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(f.client.respondSwap).not.toHaveBeenCalled();
});

it("a countdown starting closes the prompt at once", () => {
  fake();
  open(
    offer("b", "a", { countdown: { token: "count-1", dueAt: ahead(3000) } }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("a seat change that clears the offer closes the prompt at once", () => {
  fake();
  const f = open(offer("b", "a"));
  expect(screen.getByRole("dialog")).toBeTruthy();
  act(() => {
    f.publish({
      ...snapshot,
      version: 5,
      room: {
        ...snapshot.room,
        seats: { red: "b", black: "a" },
        swapOffer: null,
        rematchOffer: null,
      },
    });
  });
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("the proposer gets no prompt, only the waiting note with withdraw", () => {
  fake();
  open(offer("a", "b"));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByText("Đang chờ đối thủ trả lời đề nghị đổi bên…"),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Rút đề nghị" })).toBeTruthy();
});

it("a solo seat shows Đổi ghế and never Xin đổi bên", () => {
  fake();
  open({
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  });
  expect(screen.getByRole("button", { name: "Đổi ghế" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Xin đổi bên" })).toBeNull();
});

it("cooldown disables Xin đổi bên with a ticking tooltip, never dispatches, then re-enables at zero", async () => {
  fake();
  const f = open({
    ...snapshot,
    room: { ...snapshot.room, swapCooldownUntil: ahead(60_000) },
  });
  const button = screen.getByRole("button", { name: "Xin đổi bên" });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(
    document.getElementById(button.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toBe("Có thể xin đổi bên lại sau 60 giây.");
  fireEvent.click(button);
  expect(f.client.proposeSwap).not.toHaveBeenCalled();
  tick(1000);
  expect(
    document.getElementById(
      screen
        .getByRole("button", { name: "Xin đổi bên" })
        .getAttribute("aria-describedby")!,
    )?.textContent,
  ).toBe("Có thể xin đổi bên lại sau 59 giây.");
  tick(59_000);
  const enabled = screen.getByRole("button", { name: "Xin đổi bên" });
  expect(enabled.getAttribute("aria-disabled")).toBe("false");
  await act(async () => {
    fireEvent.click(enabled);
  });
  expect(f.client.proposeSwap).toHaveBeenCalledExactlyOnceWith(
    "room",
    3,
    f.control,
  );
});

it("withdrawing the proposal starts no cooldown", async () => {
  fake();
  const f = open(offer("a", "b"));
  const withdrawn = {
    ...snapshot,
    version: 5,
    room: { ...snapshot.room, swapOffer: null },
  };
  f.client.withdrawSwap.mockResolvedValue(withdrawn);
  fireEvent.click(screen.getByRole("button", { name: "Rút đề nghị" }));
  await act(async () => {});
  expect(f.client.withdrawSwap).toHaveBeenCalledWith("room", 4, f.control);
  // The action clears the snapshot until the authoritative realtime state arrives.
  act(() => {
    f.publish(withdrawn);
  });
  expect(
    screen
      .getByRole("button", { name: "Xin đổi bên" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
