// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nativeDialogStub } from "../rooms/RoomPage.test-helper.js";
import { FriendsPage } from "@web/features/friends/FriendsPage.js";
import type { FriendClient } from "@web/features/friends/friend-client.js";
beforeEach(nativeDialogStub);
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function client(overrides: Partial<FriendClient> = {}): FriendClient {
  return {
    search: vi.fn().mockResolvedValue([]),
    list: vi.fn().mockResolvedValue([
      {
        userId: "b",
        username: "banb",
        displayName: "Bạn B",
        status: "online",
      },
    ]),
    send: vi.fn().mockResolvedValue({ id: "r1" }),
    requests: vi.fn().mockResolvedValue([
      {
        id: "r1",
        direction: "incoming",
        peer: { userId: "c", username: "banc", displayName: "Bạn C" },
        createdAt: "2026-10-11T00:00:00Z",
        expiresAt: "2026-11-10T00:00:00Z",
      },
    ]),
    respond: vi.fn().mockResolvedValue({ accepted: true }),
    revoke: vi.fn().mockResolvedValue({ revoked: true }),
    unfriend: vi.fn().mockResolvedValue({ removed: true }),
    presence: vi.fn().mockResolvedValue(undefined),
    invite: vi.fn(),
    invites: vi.fn().mockResolvedValue([]),
    inviteState: vi
      .fn()
      .mockResolvedValue({ cooldownUntil: null, declines: [] }),
    ackInviteState: vi.fn().mockResolvedValue(undefined),
    respondInvite: vi.fn(),
    messages: vi.fn().mockResolvedValue({ messages: [], readSeq: 0 }),
    sendMessage: vi.fn(),
    markRead: vi.fn().mockResolvedValue(0),
    unread: vi.fn().mockResolvedValue({ total: 0, peers: [] }),
    ...overrides,
  };
}
describe("friends page", () => {
  it("opens a requested accepted friend's chat only once", async () => {
    vi.useFakeTimers();
    window.history.pushState({}, "", "/friends?message=b");
    render(createElement(FriendsPage, { client: client() }));
    await act(async () => {});
    expect(screen.getByRole("dialog", { name: /Bạn B/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
    expect(screen.queryByRole("dialog", { name: /Bạn B/ })).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(2100); });
    expect(screen.queryByRole("dialog", { name: /Bạn B/ })).toBeNull();
    window.history.pushState({}, "", "/");
  });
  it("does not open chat for a non-friend from the URL", async () => {
    window.history.pushState({}, "", "/friends?message=c");
    render(createElement(FriendsPage, { client: client() }));
    await screen.findByText("@banb", { exact: false });
    expect(screen.queryByRole("dialog", { name: /Bạn C/ })).toBeNull();
    window.history.pushState({}, "", "/");
  });
  it("shows friends with presence and handles accept", async () => {
    const c = client();
    render(createElement(FriendsPage, { client: c }));
    expect(await screen.findByText("@banb", { exact: false })).toBeTruthy();
    expect(screen.getByText("Trực tuyến", { exact: false })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nhắn tin" })).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("tab", { name: /Lời mời/ }));
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Chấp nhận" }));
    expect(c.respond).toHaveBeenCalledWith("r1", true);
  });
  it("searches and sends requests with server limit guidance", async () => {
    const c = client({
      search: vi.fn().mockResolvedValue([
        {
          userId: "d",
          username: "band",
          displayName: "Bạn D",
          status: "offline",
        },
      ]),
    });
    render(createElement(FriendsPage, { client: c }));
    await screen.findByText("@banb", { exact: false });
    await userEvent.setup().type(screen.getByLabelText("Tên đăng nhập"), "ban");
    await userEvent.setup().click(screen.getByRole("button", { name: "Tìm" }));
    await waitFor(() => expect(c.search).toHaveBeenCalledWith("ban"));
    expect(await screen.findByText("@band", { exact: false })).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Kết bạn" }));
    expect(c.send).toHaveBeenCalledWith("band");
  });
  it("does not query below 3 characters and shows guidance (AC-YC3-RV-02)", async () => {
    const c = client();
    render(createElement(FriendsPage, { client: c }));
    await screen.findByText("@banb", { exact: false });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Tên đăng nhập"), "ba");
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    expect(c.search).not.toHaveBeenCalled();
    // Gợi ý nhập thêm là thông tin, không phải lỗi.
    expect(screen.getByRole("status").textContent).toContain(
      "Nhập ít nhất 3 ký tự để tìm bạn",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("asks for confirmation before unfriending and cancels without a call (YC3 mục 17c)", async () => {
    const c = client();
    render(createElement(FriendsPage, { client: c }));
    await screen.findByText("@banb", { exact: false });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Hủy kết bạn" }));
    expect(c.unfriend).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Giữ bạn bè" }));
    expect(c.unfriend).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Hủy kết bạn" }));
    await user.click(
      screen.getByRole("button", { name: "Xác nhận hủy kết bạn" }),
    );
    await waitFor(() => expect(c.unfriend).toHaveBeenCalledOnce());
  });
  it("shows loading, empty and error states", async () => {
    const loading = client({
      list: vi.fn().mockImplementation(() => new Promise(() => {})),
      requests: vi.fn().mockImplementation(() => new Promise(() => {})),
    });
    const first = render(createElement(FriendsPage, { client: loading }));
    expect(screen.getByText("Đang tải danh sách bạn bè…")).toBeTruthy();
    first.unmount();
    const failing = client({
      list: vi.fn().mockRejectedValue(new Error("down")),
      requests: vi.fn().mockRejectedValue(new Error("down")),
    });
    render(createElement(FriendsPage, { client: failing }));
    await screen.findByRole("button", { name: "Thử lại" });
    await act(async () => {});
  });
  it("refreshes presence without reloading and keeps the last list on a transient failure", async () => {
    vi.useFakeTimers();
    const c = client();
    render(createElement(FriendsPage, { client: c }));
    await act(async () => {});
    expect(screen.getByText("Trực tuyến")).toBeTruthy();
    vi.mocked(c.list).mockResolvedValue([
      {
        userId: "b",
        username: "banb",
        displayName: "Bạn B",
        status: "offline",
      },
    ]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByText("Ngoại tuyến")).toBeTruthy();
    vi.mocked(c.list).mockRejectedValue(new Error("offline"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByText("@banb")).toBeTruthy();
    expect(screen.getByText(/Chưa cập nhật được danh sách/)).toBeTruthy();
  });
  it("does not display an old search result after the input has changed", async () => {
    let finish!: (peers: Awaited<ReturnType<FriendClient["search"]>>) => void;
    const c = client({
      search: vi.fn(
        () =>
          new Promise<Awaited<ReturnType<FriendClient["search"]>>>(
            (resolve) => {
              finish = resolve;
            },
          ),
      ),
    });
    render(createElement(FriendsPage, { client: c }));
    await screen.findByText("@banb");
    const input = screen.getByLabelText("Tên đăng nhập");
    fireEvent.change(input, { target: { value: "old" } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }));
    fireEvent.change(input, { target: { value: "new" } });
    await act(async () =>
      finish([{ userId: "old", username: "old", displayName: "Old result" }]),
    );
    expect(screen.queryByText("@old")).toBeNull();
  });
});
