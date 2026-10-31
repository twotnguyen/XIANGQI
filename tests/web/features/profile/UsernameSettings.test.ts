// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi, type Mock } from "vitest";
import { createProfileClient } from "@web/features/profile/profile-client.js";
import { UsernameSettings } from "@web/features/profile/UsernameSettings.js";

const past = () => new Date(Date.now() - 1_000).toISOString();
const future = () => new Date(Date.now() + 600_000).toISOString();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: Mock;
beforeEach(() => {
  fetchMock = vi.fn();
  for (const name of ["showModal", "close"])
    Object.defineProperty(HTMLDialogElement.prototype, name, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (name === "showModal") this.setAttribute("open", "");
        else this.removeAttribute("open");
      },
    });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("shows the server cooldown days without displaying an upstream message", async () => {
  fetchMock.mockResolvedValue(
    json(
      {
        code: "USERNAME_CHANGE_LIMITED",
        retryAfterDays: 6,
        message: "private-upstream",
      },
      429,
    ),
  );
  const user = userEvent.setup();
  render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged: vi.fn(),
    }),
  );
  await user.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await user.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  expect((await screen.findByRole("alert")).textContent).toContain("6 ngày");
  expect(screen.queryByText("private-upstream")).toBeNull();
});

it("explains the shared hourly OTP limit separately from the resend cooldown", async () => {
  fetchMock.mockResolvedValue(json({ code: "USERNAME_OTP_LIMITED" }, 429));
  const user = userEvent.setup();
  render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged: vi.fn(),
    }),
  );
  await user.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await user.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "yêu cầu quá nhiều mã",
  );
});

it("asks for the OTP first and keeps the name step on a taken name without a new code", async () => {
  const user = userEvent.setup();
  const onChanged = vi.fn();
  fetchMock
    .mockResolvedValueOnce(
      json({
        requestId: "r".repeat(43),
        expiresAt: future(),
        resendAt: past(),
        maskedEmail: "k***@x.invalid",
      }),
    )
    .mockResolvedValueOnce(
      json({ changeToken: "t".repeat(43), expiresAt: future() }),
    )
    .mockResolvedValueOnce(
      json({ code: "USERNAME_TAKEN", message: "taken" }, 409),
    )
    .mockResolvedValueOnce(json({ username: "fresh_name" }));
  render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged,
    }),
  );

  await user.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("button", { name: "Gửi mã xác minh" }));
  await user.type(await dialog.findByLabelText("Mã xác minh"), "123456");
  await user.click(dialog.getByRole("button", { name: "Xác nhận mã" }));

  await user.type(
    await dialog.findByLabelText("Tên đăng nhập mới"),
    "taken_name",
  );
  await user.click(dialog.getByRole("button", { name: "Đổi tên đăng nhập" }));
  const alert = await dialog.findByRole("alert");
  expect(alert.textContent).toContain("Tên đăng nhập đã có người dùng");
  expect(dialog.getByLabelText("Tên đăng nhập mới")).toBeTruthy();

  await user.clear(dialog.getByLabelText("Tên đăng nhập mới"));
  await user.type(dialog.getByLabelText("Tên đăng nhập mới"), "fresh_name");
  await user.click(dialog.getByRole("button", { name: "Đổi tên đăng nhập" }));

  expect(onChanged).toHaveBeenCalledWith("fresh_name");
  const paths = fetchMock.mock.calls.map(([path]) => path);
  expect(
    paths.filter((path) => path === "/account/username/change/request"),
  ).toHaveLength(1);
  expect(paths.at(-1)).toBe("/account/username/change/finalize");
});

it("offers email verification instead of continuing when no verified email exists", async () => {
  const user = userEvent.setup();
  const onVerifyEmail = vi.fn();
  fetchMock.mockResolvedValue(json({ code: "USERNAME_EMAIL_REQUIRED" }, 409));
  render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged: vi.fn(),
      onVerifyEmail,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await user.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  await user.click(
    await screen.findByRole("button", { name: "Thêm hoặc xác minh email" }),
  );
  expect(onVerifyEmail).toHaveBeenCalledOnce();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByLabelText("Tên đăng nhập mới")).toBeNull();
});

it("keeps the server deadline through rerenders and blocks an expired code until resend", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-31T00:00:00Z"));
  const started = Date.now();
  fetchMock
    .mockResolvedValueOnce(
      json({
        requestId: "r".repeat(43),
        expiresAt: new Date(started + 180_000).toISOString(),
        resendAt: new Date(started + 60_000).toISOString(),
      }),
    )
    .mockResolvedValueOnce(
      json({
        requestId: "r".repeat(43),
        expiresAt: new Date(started + 360_000).toISOString(),
        resendAt: new Date(started + 240_000).toISOString(),
      }),
    );
  const props = {
    client: createProfileClient(fetchMock),
    username: "kythu",
    onChanged: vi.fn(),
  };
  const view = render(createElement(UsernameSettings, props));
  fireEvent.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  });
  expect(screen.getByText("Mã còn hiệu lực 3:00.")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Gửi lại mã" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  act(() => vi.advanceTimersByTime(60_000));
  view.rerender(createElement(UsernameSettings, props));
  expect(screen.getByText("Mã còn hiệu lực 2:00.")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Gửi lại mã" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
  fireEvent.change(screen.getByLabelText("Mã xác minh"), {
    target: { value: "123456" },
  });
  act(() => vi.advanceTimersByTime(120_000));
  expect(
    screen
      .getByRole("button", { name: "Xác nhận mã" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  fireEvent.submit(
    screen.getByRole("form", { name: "Xác minh đổi tên đăng nhập" }),
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alert").textContent).toContain("Mã đã hết hạn");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Gửi lại mã" }));
  });
  expect(screen.getByText("Mã còn hiệu lực 3:00.")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Xác nhận mã" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});

it("drops a verification grant that arrives after closing and reopening the dialog", async () => {
  let finish!: (response: Response) => void;
  fetchMock
    .mockResolvedValueOnce(
      json({
        requestId: "r".repeat(43),
        expiresAt: future(),
        resendAt: past(),
      }),
    )
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
  render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged: vi.fn(),
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  });
  fireEvent.change(screen.getByLabelText("Mã xác minh"), {
    target: { value: "123456" },
  });
  fireEvent.submit(
    screen.getByRole("form", { name: "Xác minh đổi tên đăng nhập" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
  fireEvent.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await act(async () => {
    finish(json({ changeToken: "t".repeat(43), expiresAt: future() }));
  });
  expect(screen.queryByLabelText("Tên đăng nhập mới")).toBeNull();
  expect(screen.getByRole("button", { name: "Gửi mã xác minh" })).toBeTruthy();
});

it("does not announce a stale rename after leaving the settings page", async () => {
  let finish!: (response: Response) => void;
  const onChanged = vi.fn();
  fetchMock
    .mockResolvedValueOnce(
      json({
        requestId: "r".repeat(43),
        expiresAt: future(),
        resendAt: past(),
      }),
    )
    .mockResolvedValueOnce(
      json({ changeToken: "t".repeat(43), expiresAt: future() }),
    )
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
  const view = render(
    createElement(UsernameSettings, {
      client: createProfileClient(fetchMock),
      username: "kythu",
      onChanged,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Đổi tên đăng nhập" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
  });
  fireEvent.change(screen.getByLabelText("Mã xác minh"), {
    target: { value: "123456" },
  });
  await act(async () => {
    fireEvent.submit(
      screen.getByRole("form", { name: "Xác minh đổi tên đăng nhập" }),
    );
  });
  fireEvent.change(screen.getByLabelText("Tên đăng nhập mới"), {
    target: { value: "fresh_name" },
  });
  fireEvent.submit(
    screen.getByRole("form", { name: "Nhập tên đăng nhập mới" }),
  );
  view.unmount();
  await act(async () => {
    finish(json({ username: "fresh_name" }));
  });
  expect(onChanged).not.toHaveBeenCalled();
});
