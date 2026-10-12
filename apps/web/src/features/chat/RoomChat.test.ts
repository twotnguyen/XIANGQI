// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RoomChat,
  type RoomChatProps,
  type RoomChatMessage,
} from "./RoomChat.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mobile(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches, addEventListener() {}, removeEventListener() {} })),
  );
}
function message(
  content: string,
  role: "red" | "black" | "spectator" = "red",
  sequence = 1,
): RoomChatMessage {
  return {
    messageId: "message-" + sequence,
    roomId: "room",
    sequence,
    channel: "PLAYERS_PRIVATE",
    content,
    createdAt: "2026-10-11T12:00:00Z",
    sender: { displayName: "Kỳ hữu", isGuest: false, role },
  };
}
function props(): RoomChatProps {
  return {
    viewerRole: "red",
    connected: true,
    channels: {
      PLAYERS_PRIVATE: {
        scopeToken: "pair-ab",
        canSend: true,
        messages: [message("Tin riêng")],
        hasMore: false,
        loading: false,
        error: null,
      },
      ROOM_PUBLIC: {
        scopeToken: "room-member",
        canSend: true,
        messages: [
          { ...message("Tin chung", "spectator"), channel: "ROOM_PUBLIC" },
        ],
        hasMore: false,
        loading: false,
        error: null,
      },
    },
    onSend: async () => {},
    onLoadMore: () => {},
  };
}
it("opens private only on desktop and permits independently showing and hiding both panes", async () => {
  mobile(false);
  render(createElement(RoomChat, props()));
  const user = userEvent.setup();
  expect(screen.getByText("Tin riêng")).toBeTruthy();
  expect(screen.queryByText("Tin chung")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Hiện Kênh chung" }));
  expect(screen.getByText("Tin riêng")).toBeTruthy();
  expect(screen.getByText("Tin chung")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Ẩn Kênh riêng" }));
  expect(screen.queryByText("Tin riêng")).toBeNull();
  expect(screen.getByText("Tin chung")).toBeTruthy();
});
it("mobile switches one pane through tabs starting private", async () => {
  mobile(true);
  render(createElement(RoomChat, props()));
  expect(
    screen
      .getByRole("tab", { name: "Kênh riêng" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  await userEvent
    .setup()
    .click(screen.getByRole("tab", { name: "Kênh chung" }));
  expect(screen.queryByText("Tin riêng")).toBeNull();
  expect(screen.getByText("Tin chung")).toBeTruthy();
});
it("spectators cannot render private content even if an erroneous parent supplies it", () => {
  mobile(false);
  render(createElement(RoomChat, { ...props(), viewerRole: "spectator" }));
  expect(screen.queryByText("Tin riêng")).toBeNull();
  expect(screen.queryByRole("button", { name: /Kênh riêng/ })).toBeNull();
  expect(screen.getByText("Tin chung")).toBeTruthy();
});
it("renders markup as plain text and retains historical sender side after viewer changes side", () => {
  mobile(false);
  const p = props();
  p.channels.PLAYERS_PRIVATE!.messages = [
    message("<img src=x onerror=alert(1)>"),
  ];
  const view = render(createElement(RoomChat, p));
  expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeTruthy();
  expect(view.container.querySelector("img")).toBeNull();
  view.rerender(createElement(RoomChat, { ...p, viewerRole: "black" }));
  expect(screen.getByText("Người chơi · Đỏ")).toBeTruthy();
});
it("preserves a failed raw draft, previews masking and retries without optimistic messages", async () => {
  mobile(false);
  let attempts = 0;
  const sent: string[] = [];
  const p = props();
  p.onSend = async (_channel, content) => {
    sent.push(content);
    if (++attempts === 1) throw new Error("Bạn gửi quá nhanh");
  };
  render(createElement(RoomChat, p));
  const user = userEvent.setup();
  const input = screen.getByRole("textbox", { name: "Tin nhắn Kênh riêng" });
  await user.type(input, "fuck thử lại");
  expect(screen.getByText("*** thử lại")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  expect(screen.getByRole("alert").textContent).toContain("Bạn gửi quá nhanh");
  expect((input as HTMLTextAreaElement).value).toBe("fuck thử lại");
  await user.click(screen.getByRole("button", { name: "Thử lại Kênh riêng" }));
  expect(screen.getByText("Đã gửi")).toBeTruthy();
  expect((input as HTMLTextAreaElement).value).toBe("");
  expect(sent).toEqual(["fuck thử lại", "fuck thử lại"]);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});
it("counts Unicode code points and rejects 201 while accepting exactly 200 emoji", async () => {
  mobile(false);
  const values: string[] = [];
  const p = props();
  p.onSend = async (_, value) => {
    values.push(value);
  };
  render(createElement(RoomChat, p));
  const input = screen.getByRole("textbox", { name: "Tin nhắn Kênh riêng" });
  fireEvent.change(input, { target: { value: "😀".repeat(201) } });
  expect(screen.getByRole("alert").textContent).toContain("200");
  expect(
    (
      screen.getByRole("button", {
        name: "Gửi Kênh riêng",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.submit(input.closest("form")!);
  expect(values).toEqual([]);
  fireEvent.change(input, { target: { value: "😀".repeat(200) } });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  expect(values).toEqual(["😀".repeat(200)]);
  expect(screen.getByText("Đã gửi")).toBeTruthy();
});
it("offline and read-only players cannot send, while spectators retain authorized public sending", async () => {
  mobile(false);
  const p = props();
  p.channels.PLAYERS_PRIVATE!.canSend = false;
  const view = render(createElement(RoomChat, p));
  expect(
    (
      screen.getByRole("textbox", {
        name: "Tin nhắn Kênh riêng",
      }) as HTMLTextAreaElement
    ).disabled,
  ).toBe(true);
  expect(screen.getByText("Bạn chỉ có quyền đọc ở kênh này.")).toBeTruthy();
  view.rerender(createElement(RoomChat, { ...p, viewerRole: "spectator" }));
  const input = screen.getByRole("textbox", { name: "Tin nhắn Kênh chung" });
  expect((input as HTMLTextAreaElement).disabled).toBe(false);
  view.rerender(
    createElement(RoomChat, {
      ...p,
      viewerRole: "spectator",
      connected: false,
    }),
  );
  expect((input as HTMLTextAreaElement).disabled).toBe(true);
  expect(screen.getByText(/Mất kết nối/)).toBeTruthy();
});
it("does not submit twice while awaiting ACK and never appends a provisional message", async () => {
  mobile(false);
  let release!: () => void;
  let requests = 0;
  const p = props();
  p.onSend = () => {
    requests++;
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  render(createElement(RoomChat, p));
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "Chờ máy chủ");
  await user.dblClick(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  expect(requests).toBe(1);
  expect(screen.getByText("Đang gửi…")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  await import("@testing-library/react").then(({ act }) =>
    act(async () => release()),
  );
  expect(screen.getByText("Đã gửi")).toBeTruthy();
});
it("changing pair scope clears drafts and old messages and ignores old ACK", async () => {
  mobile(false);
  let release!: () => void;
  const p = props();
  p.onSend = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  const view = render(createElement(RoomChat, p));
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "Cặp trước");
  await user.click(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  const next = {
    ...p,
    channels: {
      ...p.channels,
      PLAYERS_PRIVATE: {
        ...p.channels.PLAYERS_PRIVATE!,
        scopeToken: "pair-ac",
        messages: [message("Cặp mới")],
      },
    },
  };
  view.rerender(createElement(RoomChat, next));
  expect(screen.queryByText("Tin riêng")).toBeNull();
  expect(screen.getByText("Cặp mới")).toBeTruthy();
  await user.type(screen.getByRole("textbox"), "Bản nháp mới");
  await import("@testing-library/react").then(({ act }) =>
    act(async () => release()),
  );
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Bản nháp mới",
  );
  expect(screen.queryByText("Đã gửi")).toBeNull();
});
it("a lost channel scope removes supplied stale messages and sending", () => {
  mobile(false);
  const p = props();
  p.channels.PLAYERS_PRIVATE!.scopeToken = null;
  p.channels.PLAYERS_PRIVATE!.hasMore = true;
  render(createElement(RoomChat, p));
  expect(screen.queryByText("Tin riêng")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Tải thêm tin Kênh riêng",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).disabled).toBe(
    true,
  );
});
it("hidden desktop panes retain drafts without granting extra rights", async () => {
  mobile(false);
  render(createElement(RoomChat, props()));
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "Giữ bản nháp");
  await user.click(screen.getByRole("button", { name: "Ẩn Kênh riêng" }));
  await user.click(screen.getByRole("button", { name: "Hiện Kênh riêng" }));
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Giữ bản nháp",
  );
});
it("mobile tabs support arrow keys and move keyboard focus to the selected channel", async () => {
  mobile(true);
  render(createElement(RoomChat, props()));
  const user = userEvent.setup();
  screen.getByRole("tab", { name: "Kênh riêng" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Kênh chung" }),
  );
  expect(screen.getByText("Tin chung")).toBeTruthy();
  expect(screen.queryByText("Tin riêng")).toBeNull();
});
it("loading and empty states expose pagination through authoritative channel state", async () => {
  mobile(false);
  const p = props();
  let loaded = false;
  p.channels.PLAYERS_PRIVATE = {
    ...p.channels.PLAYERS_PRIVATE!,
    messages: [],
    hasMore: true,
  };
  p.onLoadMore = () => {
    loaded = true;
  };
  const view = render(createElement(RoomChat, p));
  expect(screen.getByText("Chưa có tin nhắn.")).toBeTruthy();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Tải thêm tin Kênh riêng" }));
  expect(loaded).toBe(true);
  view.rerender(
    createElement(RoomChat, {
      ...p,
      channels: {
        ...p.channels,
        PLAYERS_PRIVATE: { ...p.channels.PLAYERS_PRIVATE!, loading: true },
      },
    }),
  );
  expect(screen.getByText("Đang tải tin nhắn…")).toBeTruthy();
  expect(
    (
      screen.getByRole("button", {
        name: "Tải thêm tin Kênh riêng",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
it("failed history loading is contained, sanitized and can be retried without sending", async () => {
  mobile(false);
  const p = props();
  p.channels.PLAYERS_PRIVATE = {
    ...p.channels.PLAYERS_PRIVATE!,
    hasMore: true,
  };
  p.onLoadMore = vi
    .fn()
    .mockRejectedValueOnce(new Error("private-provider-token"))
    .mockResolvedValue(undefined);
  p.onSend = vi.fn();
  render(createElement(RoomChat, p));
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: "Tải thêm tin Kênh riêng" }),
  );
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Không tải được tin nhắn. Vui lòng thử lại.",
  );
  expect(screen.queryByText("private-provider-token")).toBeNull();
  await user.click(
    screen.getByRole("button", { name: "Tải thêm tin Kênh riêng" }),
  );
  expect(p.onLoadMore).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(p.onSend).not.toHaveBeenCalled();
});
it("unrecognized provider errors show safe text and preserve the draft", async () => {
  mobile(false);
  const p = props();
  p.onSend = async () => {
    throw new Error("secret-capability-password");
  };
  render(createElement(RoomChat, p));
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "Tin cần giữ");
  await user.click(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  expect(screen.queryByText(/secret-capability/)).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain(
    "Không gửi được tin nhắn",
  );
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Tin cần giữ",
  );
});
it("new messages do not yank a reader away from older content and expose a return-to-bottom action", async () => {
  mobile(false);
  const p = props();
  const view = render(createElement(RoomChat, p));
  const region = screen.getByRole("log", { name: "Tin nhắn Kênh riêng" });
  Object.defineProperties(region, {
    scrollHeight: { configurable: true, value: 800 },
    clientHeight: { configurable: true, value: 200 },
  });
  region.scrollTop = 100;
  fireEvent.scroll(region);
  view.rerender(
    createElement(RoomChat, {
      ...p,
      channels: {
        ...p.channels,
        PLAYERS_PRIVATE: {
          ...p.channels.PLAYERS_PRIVATE!,
          messages: [
            ...p.channels.PLAYERS_PRIVATE!.messages,
            message("Tin mới nhận", "black", 2),
          ],
        },
      },
    }),
  );
  expect(region.scrollTop).toBe(100);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Tin mới Kênh riêng" }));
  expect(region.scrollTop).toBe(800);
  expect(
    screen.queryByRole("button", { name: "Tin mới Kênh riêng" }),
  ).toBeNull();
});
it("disables both channel composers while one send is pending and preserves the other draft", async () => {
  mobile(false);
  const p = props();
  const view = render(createElement(RoomChat, p));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Hiện Kênh chung" }));
  await user.type(
    screen.getByRole("textbox", { name: "Tin nhắn Kênh chung" }),
    "Bản nháp chung",
  );
  view.rerender(
    createElement(RoomChat, { ...p, pendingSend: "PLAYERS_PRIVATE" }),
  );
  for (const textbox of screen.getAllByRole("textbox"))
    expect((textbox as HTMLTextAreaElement).disabled).toBe(true);
  view.rerender(createElement(RoomChat, { ...p, pendingSend: null }));
  expect(
    (
      screen.getByRole("textbox", {
        name: "Tin nhắn Kênh chung",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Bản nháp chung");
  for (const textbox of screen.getAllByRole("textbox"))
    expect((textbox as HTMLTextAreaElement).disabled).toBe(false);
});
it("temporarily hidden history does not announce a new message when the same scope is restored", () => {
  mobile(false);
  const p = props();
  const view = render(createElement(RoomChat, p));
  const region = screen.getByRole("log", { name: "Tin nhắn Kênh riêng" });
  Object.defineProperties(region, {
    scrollHeight: { configurable: true, value: 800 },
    clientHeight: { configurable: true, value: 200 },
  });
  region.scrollTop = 100;
  fireEvent.scroll(region);
  view.rerender(
    createElement(RoomChat, {
      ...p,
      channels: {
        ...p.channels,
        PLAYERS_PRIVATE: {
          ...p.channels.PLAYERS_PRIVATE!,
          messages: [],
          canSend: false,
          loading: true,
        },
      },
    }),
  );
  expect(
    screen.queryByRole("button", { name: "Tin mới Kênh riêng" }),
  ).toBeNull();
  view.rerender(createElement(RoomChat, p));
  expect(
    screen.queryByRole("button", { name: "Tin mới Kênh riêng" }),
  ).toBeNull();
  expect(region.scrollTop).toBe(100);
});
