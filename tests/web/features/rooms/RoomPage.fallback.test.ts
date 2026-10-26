// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomSnapshot } from "@xiangqi/shared";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  snapshot,
  setup,
  visibility,
  actionable,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("an HTTP PLAYING fallback cannot resign before a fresh socket snapshot", async () => {
  const f = setup(actionable());
  f.disconnect();
  await screen.findByRole("heading", { name: "Kỳ hữu" });
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.client.leave).not.toHaveBeenCalled();
});
it("defers HTTP room display until realtime is unavailable and never grants its controls", async () => {
  const f = setup();
  expect(f.client.snapshot).not.toHaveBeenCalled();
  f.disconnect();
  await screen.findByRole("heading", { name: "Kỳ hữu" });
  expect(f.client.snapshot).toHaveBeenCalledOnce();
  expect(
    screen
      .getByRole("button", { name: "Sẵn sàng" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  expect(f.command).not.toHaveBeenCalled();
});
it("does not starve an in-flight fallback on duplicate disconnect notifications", async () => {
  const f = setup();
  let reject!: (reason: unknown) => void;
  const promise = new Promise<RoomSnapshot>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  f.client.snapshot.mockReturnValue(promise);
  f.disconnect();
  f.disconnect();
  expect(f.client.snapshot).toHaveBeenCalledOnce();
  await act(async () => reject(new RoomRequestError("ROOM_FORBIDDEN", 403)));
  expect(f.onLeft).toHaveBeenCalledOnce();
});

it("does not treat an expired login as a closed room", async () => {
  const f = setup();
  f.client.snapshot.mockRejectedValue(
    new RoomRequestError("AUTH_REQUIRED", 401),
  );
  f.disconnect();
  await waitFor(() => expect(f.client.snapshot).toHaveBeenCalledOnce());
  expect(f.onLeft).not.toHaveBeenCalled();
});
it("ignores a forbidden fallback response after realtime has reconnected", async () => {
  const f = setup();
  let reject!: (reason: unknown) => void;
  const promise = new Promise<RoomSnapshot>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  f.client.snapshot.mockReturnValue(promise);
  f.disconnect();
  expect(f.client.snapshot).toHaveBeenCalledOnce();
  f.reconnect();
  f.publish(snapshot);
  await act(async () => reject(new RoomRequestError("ROOM_FORBIDDEN", 403)));
  expect(f.onLeft).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "Kỳ hữu" })).toBeTruthy();
});

it("does not refresh a waiting room clock on focus", async () => {
  const f = setup();
  await f.ready();
  await visibility("visible");
  expect(f.refresh).not.toHaveBeenCalled();
});
it("keeps a waiting-room leave failure when the page regains focus", async () => {
  const f = setup();
  await f.ready();
  f.client.leave.mockRejectedValue(new Error("private backend detail"));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Rời phòng" }));
  const error = screen.getByRole("alert").textContent;
  await visibility("visible");
  expect(f.refresh).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toBe(error);
  expect(error).toContain("Thao tác chưa thực hiện được");
});
