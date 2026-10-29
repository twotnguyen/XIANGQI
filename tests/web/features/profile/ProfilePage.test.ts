// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "@web/features/profile/ProfilePage.js";
import {
  ProfileRequestError,
  type ProfileClient,
} from "@web/features/profile/profile-client.js";

const originalShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  for (const [name, descriptor] of [
    ["showModal", originalShow],
    ["close", originalClose],
  ] as const) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

function client(overrides: Partial<ProfileClient> = {}): ProfileClient {
  return {
    read: vi.fn().mockResolvedValue({
      userId: "u",
      username: "kythu",
      email: "kythu@example.invalid",
      displayName: "Kỳ Hữu",
    }),
    updateDisplayName: vi.fn().mockResolvedValue({ displayName: "Tên Mới" }),
    location: vi
      .fn()
      .mockResolvedValue({ kind: "none", roomId: null, matchId: null }),
    ...overrides,
  } as unknown as ProfileClient;
}

describe("profile page", () => {
  it("shows avatar letter, username and read-only email and saves a name", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const c = client();
    render(
      createElement(ProfilePage, {
        client: c,
        guest: false,
        onSaved,
        onLogout: vi.fn(),
      }),
    );
    expect(await screen.findByText("kythu")).toBeTruthy();
    expect(screen.getByText("kythu@example.invalid")).toBeTruthy();
    const input = screen.getByLabelText("Tên hiển thị");
    await user.clear(input);
    await user.type(input, "Tên Mới");
    await user.click(screen.getByRole("button", { name: "Lưu tên hiển thị" }));
    await waitFor(() =>
      expect(c.updateDisplayName).toHaveBeenCalledWith("Tên Mới"),
    );
    expect(onSaved).toHaveBeenCalledWith("Tên Mới");
    expect(await screen.findByText("Đã lưu tên hiển thị.")).toBeTruthy();
  });
  it("renders the injected email section and hides the read-only fallback", async () => {
    render(
      createElement(ProfilePage, {
        client: client(),
        guest: false,
        onSaved: vi.fn(),
        onLogout: vi.fn(),
        emailSection: createElement("p", null, "SLOT-EMAIL-SECTION"),
      }),
    );
    expect(screen.getByText("SLOT-EMAIL-SECTION")).toBeTruthy();
    expect(await screen.findByText("kythu")).toBeTruthy();
    expect(screen.queryByText("kythu@example.invalid")).toBeNull();
  });
  it("keeps the server name and shows a field error when rejected", async () => {
    const user = userEvent.setup();
    const c = client({
      updateDisplayName: vi
        .fn()
        .mockRejectedValue(
          new ProfileRequestError("PROFILE_NAME_FORBIDDEN", 400),
        ),
    });
    const onSaved = vi.fn();
    render(
      createElement(ProfilePage, {
        client: c,
        guest: false,
        onSaved,
        onLogout: vi.fn(),
      }),
    );
    const input = (await screen.findByLabelText(
      "Tên hiển thị",
    )) as HTMLInputElement;
    expect(input.value).toBe("Kỳ Hữu");
    await user.clear(input);
    await user.type(input, "cấm");
    await user.click(screen.getByRole("button", { name: "Lưu tên hiển thị" }));
    expect(
      await screen.findByText("Tên hiển thị chứa từ không được phép."),
    ).toBeTruthy();
    expect(onSaved).not.toHaveBeenCalled();
  });
  it("requires confirmation before logging out during an online match", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    const c = client({
      location: vi.fn().mockResolvedValue({
        kind: "playing-online",
        roomId: "r",
        matchId: "m",
      }),
    });
    render(
      createElement(ProfilePage, {
        client: c,
        guest: false,
        onSaved: vi.fn(),
        onLogout,
      }),
    );
    await screen.findByText("kythu");
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    const dialog = screen.getByRole("dialog", {
      name: "Đăng xuất khi đang đấu",
    });
    expect(onLogout).not.toHaveBeenCalled();
    await user.click(
      within(dialog).getByRole("button", { name: "Đồng ý đăng xuất" }),
    );
    expect(onLogout).toHaveBeenCalledOnce();
  });
  it("logs out from the lobby without a confirmation dialog", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(
      createElement(ProfilePage, {
        client: client(),
        guest: false,
        onSaved: vi.fn(),
        onLogout,
      }),
    );
    await screen.findByText("kythu");
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });
  it("hides profile fields from guests but keeps logout", () => {
    render(
      createElement(ProfilePage, {
        client: client(),
        guest: true,
        onSaved: vi.fn(),
        onLogout: vi.fn(),
      }),
    );
    expect(screen.queryByLabelText("Tên hiển thị")).toBeNull();
    expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeTruthy();
  });
  it("keeps an unsaved name when switching settings sections", async () => {
    const user = userEvent.setup();
    const c = client();
    render(
      createElement(ProfilePage, {
        client: c,
        guest: false,
        onSaved: vi.fn(),
        onLogout: vi.fn(),
      }),
    );
    const input = await screen.findByLabelText("Tên hiển thị");
    await user.clear(input);
    await user.type(input, "Tên chưa lưu");
    await user.click(screen.getByRole("button", { name: "Giao diện" }));
    expect(screen.queryByRole("textbox", { name: "Tên hiển thị" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Phiên đăng nhập" }));
    await user.click(screen.getByRole("button", { name: "Hồ sơ cá nhân" }));
    expect(
      (screen.getByLabelText("Tên hiển thị") as HTMLInputElement).value,
    ).toBe("Tên chưa lưu");
    expect(c.updateDisplayName).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Lưu tên hiển thị" }));
    expect(c.updateDisplayName).toHaveBeenCalledWith("Tên chưa lưu");
  });
  it("offers the default theme, applies a chosen theme and hides the choice from guests", async () => {
    const user = userEvent.setup();
    const store = new Map<string, string>();
    const setItem = vi.fn((key: string, value: string) => {
      store.set(key, value);
    });
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: { getItem: (key: string) => store.get(key) ?? null, setItem },
    });
    delete document.documentElement.dataset.theme;
    const view = render(
      createElement(ProfilePage, {
        client: client(),
        guest: false,
        onSaved: vi.fn(),
        onLogout: vi.fn(),
      }),
    );
    await screen.findByText("kythu");
    await user.click(screen.getByRole("button", { name: "Giao diện" }));
    const classic = screen.getByRole("radio", {
      name: "Kỳ Đài Cổ Phong",
    }) as HTMLInputElement;
    expect(classic.checked).toBe(true);
    await user.click(screen.getByRole("radio", { name: "Giấy Sáng" }));
    expect(document.documentElement.dataset.theme).toBe("paper-light");
    expect(setItem).toHaveBeenCalledWith("xiangqi.theme", "paper-light");
    view.unmount();
    render(
      createElement(ProfilePage, {
        client: client(),
        guest: true,
        onSaved: vi.fn(),
        onLogout: vi.fn(),
      }),
    );
    expect(screen.queryByRole("radio", { name: "Giấy Sáng" })).toBeNull();
  });
});
