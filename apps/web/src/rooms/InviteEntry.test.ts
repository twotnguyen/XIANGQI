// @vitest-environment jsdom
import { createElement, StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InviteEntry } from "./InviteEntry.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomEntry,
} from "./room-client.js";
afterEach(cleanup);
const entry: RoomEntry = {
  roomId: "11111111-1111-4111-8111-111111111111",
  version: 2,
  role: "black",
};
function client(join: RoomClient["join"]): RoomClient {
  return {
    join,
    create: vi.fn(),
    snapshot: vi.fn(),
    switchSeat: vi.fn(),
    changeVisibility: vi.fn(),
    leave: vi.fn(),
  };
}
it("automatically joins after mount exactly once under StrictMode without a second click", async () => {
  const join = vi.fn().mockResolvedValue(entry),
    onEntered = vi.fn();
  render(
    createElement(
      StrictMode,
      null,
      createElement(InviteEntry, {
        client: client(join),
        code: "K7M2XQP4",
        onEntered,
      }),
    ),
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(join).toHaveBeenCalledExactlyOnceWith("K7M2XQP4");
  expect(onEntered).toHaveBeenCalledExactlyOnceWith(entry);
});
it("does not join when unmounted before the microtask starts", async () => {
  const join = vi.fn(),
    onEntered = vi.fn();
  const view = render(
    createElement(InviteEntry, {
      client: client(join),
      code: "K7M2XQP4",
      onEntered,
    }),
  );
  view.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(join).not.toHaveBeenCalled();
  expect(onEntered).not.toHaveBeenCalled();
});
it("ignores a late result after the route has been left", async () => {
  let finish!: (value: RoomEntry) => void;
  const join = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
    onEntered = vi.fn();
  const view = render(
    createElement(InviteEntry, {
      client: client(join),
      code: "K7M2XQP4",
      onEntered,
    }),
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.unmount();
  await act(async () => finish(entry));
  expect(onEntered).not.toHaveBeenCalled();
});
it("ignores the previous invite response after the route code changes", async () => {
  let finish!: (value: RoomEntry) => void;
  const join = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(entry),
    api = client(join),
    onEntered = vi.fn();
  const view = render(
    createElement(InviteEntry, { client: api, code: "K7M2XQP4", onEntered }),
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.rerender(
    createElement(InviteEntry, { client: api, code: "ABCD2345", onEntered }),
  );
  await act(async () => {
    await Promise.resolve();
    finish({ ...entry, roomId: "22222222-2222-4222-8222-222222222222" });
  });
  expect(join.mock.calls.map((call) => call[0])).toEqual([
    "K7M2XQP4",
    "ABCD2345",
  ]);
  expect(onEntered).toHaveBeenCalledExactlyOnceWith(entry);
});
it("callback rerender neither rejoins nor delivers the receipt to a stale callback", async () => {
  let finish!: (value: RoomEntry) => void;
  const join = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
    api = client(join),
    oldCallback = vi.fn(),
    newCallback = vi.fn();
  const view = render(
    createElement(InviteEntry, {
      client: api,
      code: "K7M2XQP4",
      onEntered: oldCallback,
    }),
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.rerender(
    createElement(InviteEntry, {
      client: api,
      code: "K7M2XQP4",
      onEntered: newCallback,
    }),
  );
  await act(async () => finish(entry));
  expect(join).toHaveBeenCalledTimes(1);
  expect(oldCallback).not.toHaveBeenCalled();
  expect(newCallback).toHaveBeenCalledExactlyOnceWith(entry);
});
it("rejects malformed invite codes without making an HTTP request", async () => {
  const join = vi.fn();
  render(
    createElement(InviteEntry, {
      client: client(join),
      code: "//outside.invalid/private",
      onEntered: vi.fn(),
    }),
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(join).not.toHaveBeenCalled();
});
it("sanitizes failures and only joins again after explicit Retry", async () => {
  const join = vi
      .fn()
      .mockRejectedValueOnce(new Error("upstream bearer secret"))
      .mockResolvedValue(entry),
    onEntered = vi.fn();
  render(
    createElement(InviteEntry, {
      client: client(join),
      code: "K7M2XQP4",
      onEntered,
    }),
  );
  await screen.findByRole("button", { name: "Thử lại" });
  expect(screen.queryByText(/bearer secret/)).toBeNull();
  expect(join).toHaveBeenCalledTimes(1);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(join).toHaveBeenCalledTimes(2);
  expect(onEntered).toHaveBeenCalledExactlyOnceWith(entry);
});
it.each(["ROOM_FORBIDDEN", "ROOM_LOCKED", "ROOM_FULL", "VERSION_STALE"])(
  "keeps rejected invitation (%s) on the error screen without automatic retry",
  async (code) => {
    const join = vi
        .fn()
        .mockRejectedValue(
          new RoomRequestError(
            code,
            code === "ROOM_FORBIDDEN" || code === "ROOM_LOCKED" ? 403 : 409,
          ),
        ),
      onEntered = vi.fn();
    render(
      createElement(InviteEntry, {
        client: client(join),
        code: "K7M2XQP4",
        onEntered,
      }),
    );
    await screen.findByRole("alert");
    expect(join).toHaveBeenCalledTimes(1);
    expect(onEntered).not.toHaveBeenCalled();
  },
);
