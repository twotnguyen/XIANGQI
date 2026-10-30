// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DirectChatDialog } from "@web/features/friends/DirectChatDialog.js";
import {
  FriendRequestError,
  type DirectMessage,
  type FriendClient,
} from "@web/features/friends/friend-client.js";

const ME = "11111111-1111-4111-8111-111111111111";
const FRIEND = "22222222-2222-4222-8222-222222222222";
const friend = { userId: FRIEND, username: "bạnA", displayName: "Bạn A" };

const originals = ["showModal", "close"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
    ] as const,
);
let observers: {
  callback: IntersectionObserverCallback;
  observed: Element[];
}[] = [];

beforeEach(() => {
  for (const name of ["showModal", "close"])
    Object.defineProperty(HTMLDialogElement.prototype, name, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (name === "showModal") this.setAttribute("open", "");
        else this.removeAttribute("open");
      },
    });
  observers = [];
  // Giả IntersectionObserver: test tự quyết tin nào đang nằm trong vùng cuộn.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observed: Element[] = [];
      constructor(public callback: IntersectionObserverCallback) {
        observers.push(this);
      }
      observe(el: Element) {
        this.observed.push(el);
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  });
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
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

function msg(seq: number, senderId: string, content: string): DirectMessage {
  return {
    id: `m${seq}`,
    seq,
    senderId,
    content,
    createdAt: "2026-11-02T10:00:00Z",
  };
}

/** Client giả chỉ cung cấp các method DM mà dialog dùng; kiểu đầy đủ được ép có chủ đích. */
function fakeClient(
  overrides: Partial<
    Pick<FriendClient, "messages" | "sendMessage" | "markRead">
  >,
) {
  return {
    messages: vi.fn(async () => ({ messages: [], readSeq: 0 })),
    sendMessage: vi.fn(async () => msg(99, ME, "x")),
    markRead: vi.fn(async (_id: string, upTo: number) => upTo),
    ...overrides,
  } as unknown as FriendClient;
}

function renderChat(client: FriendClient) {
  return render(
    createElement(DirectChatDialog, { client, friend, onClose: () => {} }),
  );
}

/** Báo IntersectionObserver rằng các seq cho trước đang nhìn thấy (≥50%). */
function reportVisible(container: HTMLElement, seqs: number[]) {
  const observer = observers.at(-1)!;
  const entries = seqs.map((seq) => ({
    target: container.querySelector(`[data-seq="${seq}"]`)!,
    isIntersecting: true,
    intersectionRatio: 1,
  })) as unknown as IntersectionObserverEntry[];
  act(() =>
    observer.callback(entries, observer as unknown as IntersectionObserver),
  );
}

it("shows the history with incoming and own messages and labels the log", async () => {
  const client = fakeClient({
    messages: vi.fn(async () => ({
      messages: [msg(1, FRIEND, "chào"), msg(2, ME, "hi")],
      readSeq: 0,
    })),
  });
  renderChat(client);
  expect(await screen.findByText("chào")).toBeTruthy();
  expect(screen.getByRole("log", { name: "Lịch sử với Bạn A" })).toBeTruthy();
  expect(screen.getByLabelText("Nội dung tin nhắn")).toBeTruthy();
});

it("rejects an empty draft and preserves the draft after delivery fails", async () => {
  const client = fakeClient({
    sendMessage: vi.fn(async () => {
      throw new FriendRequestError("DM_RATE_LIMITED", 429);
    }),
  });
  renderChat(client);
  const input = screen.getByLabelText(
    "Nội dung tin nhắn",
  ) as HTMLTextAreaElement;
  fireEvent.submit(input.closest("form")!);
  expect(client.sendMessage).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "xin chào" } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi" }));
  expect(
    await screen.findByText("Bạn nhắn quá nhanh. Thử lại sau vài giây."),
  ).toBeTruthy();
  expect(input.value).toBe("xin chào");
});

it("loads older history from the oldest loaded seq and hides the button when a page is short", async () => {
  const latest = Array.from({ length: 50 }, (_, i) =>
    msg(i + 10, FRIEND, `tin ${i + 10}`),
  );
  const client = fakeClient({
    messages: vi.fn(async (_id: string, before?: number) =>
      before === undefined
        ? { messages: latest, readSeq: 0 }
        : { messages: [msg(9, FRIEND, "tin cũ")], readSeq: 0 },
    ),
  });
  renderChat(client);
  await screen.findByText("tin 59");
  fireEvent.click(screen.getByRole("button", { name: "Tải tin cũ" }));
  expect(await screen.findByText("tin cũ")).toBeTruthy();
  expect(client.messages).toHaveBeenCalledWith(FRIEND, 10);
  expect(screen.queryByRole("button", { name: "Tải tin cũ" })).toBeNull();
});

it("marks the newest visible incoming message read only while the tab is focused", async () => {
  const client = fakeClient({
    messages: vi.fn(async () => ({
      messages: [
        msg(1, FRIEND, "một"),
        msg(2, FRIEND, "hai"),
        msg(3, ME, "mine"),
      ],
      readSeq: 0,
    })),
  });
  const { container } = renderChat(client);
  await screen.findByText("một");
  reportVisible(container, [1, 2]);
  expect(client.markRead).toHaveBeenCalledWith(FRIEND, 2);
});

it("does not mark read while the window has no focus", async () => {
  vi.mocked(document.hasFocus).mockReturnValue(false);
  const client = fakeClient({
    messages: vi.fn(async () => ({
      messages: [msg(1, FRIEND, "một")],
      readSeq: 0,
    })),
  });
  const { container } = renderChat(client);
  await screen.findByText("một");
  reportVisible(container, [1]);
  expect(client.markRead).not.toHaveBeenCalled();
});

it("clears the history and disables the composer as soon as the friendship is revoked", async () => {
  let revokedNow = false;
  const client = fakeClient({
    messages: vi.fn(async () => {
      if (revokedNow) throw new FriendRequestError("DM_NOT_FRIENDS", 403);
      return { messages: [msg(1, FRIEND, "bí mật")], readSeq: 0 };
    }),
  });
  renderChat(client);
  expect(await screen.findByText("bí mật")).toBeTruthy();
  revokedNow = true;
  // Lần poll kế tiếp (2s) nhận DM_NOT_FRIENDS; chờ đúng điều kiện DOM thay vì đoán thời gian.
  await waitFor(
    () =>
      expect(
        screen.getByText("Không còn là bạn bè, lịch sử trò chuyện đã bị ẩn."),
      ).toBeTruthy(),
    { timeout: 4000 },
  );
  expect(screen.queryByText("bí mật")).toBeNull();
  expect(
    (screen.getByLabelText("Nội dung tin nhắn") as HTMLInputElement).disabled,
  ).toBe(true);
});
