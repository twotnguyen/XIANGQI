// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { DirectChatHub } from "@web/features/friends/DirectChatHub.js";
import type { FriendClient } from "@web/features/friends/friend-client.js";

const ME = "11111111-1111-4111-8111-111111111111";
const FRIEND = "22222222-2222-4222-8222-222222222222";

const originals = ["showModal", "close"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
    ] as const,
);

beforeEach(() => {
  for (const name of ["showModal", "close"])
    Object.defineProperty(HTMLDialogElement.prototype, name, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (name === "showModal") this.setAttribute("open", "");
        else this.removeAttribute("open");
      },
    });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const [name, descriptor] of originals) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

/** Client giả chỉ cung cấp các method hub và dialog dùng; kiểu đầy đủ được ép có chủ đích. */
function fakeClient() {
  return {
    unread: vi.fn(async () => ({
      total: 3,
      peers: [{ peerId: FRIEND, unread: 3 }],
    })),
    list: vi.fn(async () => [
      {
        userId: FRIEND,
        username: "bạnA",
        displayName: "Bạn A",
        presence: "online",
      },
    ]),
    messages: vi.fn(async () => ({ messages: [], readSeq: 0 })),
    sendMessage: vi.fn(),
    markRead: vi.fn(async (_id: string, upTo: number) => upTo),
  } as unknown as FriendClient;
}

it("renders nothing for guests or logged-out users", () => {
  const client = fakeClient();
  const { container } = render(
    createElement(DirectChatHub, { client, userId: null }),
  );
  expect(container.innerHTML).toBe("");
  expect(client.unread).not.toHaveBeenCalled();
});

it("shows the global unread total in a button labelled with the count", async () => {
  const client = fakeClient();
  render(createElement(DirectChatHub, { client, userId: ME }));
  expect(
    await screen.findByRole("button", { name: "Tin nhắn, 3 tin chưa đọc" }),
  ).toBeTruthy();
});

it("opens the friend list and then the chat with the chosen friend", async () => {
  const client = fakeClient();
  render(createElement(DirectChatHub, { client, userId: ME }));
  fireEvent.click(await screen.findByRole("button", { name: /Tin nhắn/ }));
  const entry = await screen.findByRole("button", {
    name: /Nhắn tin với Bạn A/,
  });
  await act(async () => {
    fireEvent.click(entry);
  });
  expect(
    await screen.findByRole("log", { name: "Lịch sử với Bạn A" }),
  ).toBeTruthy();
  expect(client.messages).toHaveBeenCalledWith(FRIEND);
});
