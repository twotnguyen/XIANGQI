// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FriendsPage } from "./FriendsPage.js";
import type { FriendClient } from "./friend-client.js";
afterEach(() => cleanup());
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
    invite: vi.fn(),
    invites: vi.fn().mockResolvedValue([]),
    respondInvite: vi.fn(),
    ...overrides,
  } as unknown as FriendClient;
}
describe("friends page", () => {
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
});
