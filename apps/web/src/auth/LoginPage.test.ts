// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage.js";

const session = {
  access_token: "test-access",
  refresh_token: "test-refresh",
  expires_in: 3600,
  userId: "test-user",
  username: "KyThu",
  appSession: "test-capability",
  expiresAt: "2030-01-01T00:00:00.000Z",
};
function reply(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
async function fill(
  user: ReturnType<typeof userEvent.setup>,
  username = "KYTHU",
) {
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "password123",
  );
}
it("sends username case intact and the checked default, with cookies; delegates the response without storing it", async () => {
  vi.stubEnv("VITE_API_URL", "");
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  const local = vi.spyOn(Storage.prototype, "setItem");
  const onLoggedIn = vi.fn();
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn }));
  expect(
    (screen.getByLabelText("Ghi nhớ đăng nhập") as HTMLInputElement).checked,
  ).toBe(true);
  await fill(user);
  await user.keyboard("{Enter}");
  await vi.waitFor(() =>
    expect(onLoggedIn).toHaveBeenCalledWith({ ...session, remember: true }),
  );
  expect(request).toHaveBeenCalledWith(
    "http://localhost:3000/auth/login",
    expect.objectContaining({
      credentials: "include",
      redirect: "error",
      method: "POST",
      body: JSON.stringify({
        username: "KYTHU",
        password: "password123",
        remember: true,
      }),
    }),
  );
  expect(local).not.toHaveBeenCalled();
});
it("sends the unchecked choice to a configured backend with trailing slash", async () => {
  vi.stubEnv("VITE_API_URL", "https://api.example.test/");
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  const onLoggedIn = vi.fn();
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn }));
  await fill(user);
  await user.click(screen.getByLabelText("Ghi nhớ đăng nhập"));
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  await vi.waitFor(() =>
    expect(onLoggedIn).toHaveBeenCalledWith({ ...session, remember: false }),
  );
  expect(request.mock.calls[0]![0]).toBe("https://api.example.test/auth/login");
  expect(JSON.parse(request.mock.calls[0]![1].body).remember).toBe(false);
});
it("reveals and hides the password without submitting", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn: vi.fn() }));
  await fill(user);
  const password = screen.getByLabelText("Mật khẩu", { exact: true });
  expect(password.getAttribute("type")).toBe("password");
  await user.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
  expect(password.getAttribute("type")).toBe("text");
  await user.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }));
  expect(password.getAttribute("type")).toBe("password");
  expect(request).not.toHaveBeenCalled();
});
it.each(["LOGIN_INVALID", "UNKNOWN_USER"])(
  "never exposes server details for invalid credentials (%s)",
  async (code) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          reply({ code, message: "private@example.test exists" }, 401),
        ),
    );
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();
    render(createElement(LoginPage, { onLoggedIn }));
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Sai tên đăng nhập hoặc mật khẩu",
    );
    expect(screen.queryByText(/private@example/)).toBeNull();
    expect(onLoggedIn).not.toHaveBeenCalled();
  },
);
it("does not accept email as a username or send an empty form", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn: vi.fn() }));
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  await fill(user, "player@example.test");
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  expect(screen.getByRole("alert").textContent).toContain(
    "Sai tên đăng nhập hoặc mật khẩu",
  );
  expect(request).not.toHaveBeenCalled();
});
it("shows the exact blocked message and never grants a blocked login", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(reply({ code: "LOGIN_LOCKED" }, 429)),
  );
  const onLoggedIn = vi.fn();
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn }));
  await fill(user);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút",
  );
  expect(onLoggedIn).not.toHaveBeenCalled();
});
it.each(["network", "503", "malformed", "missing-capability"])(
  "reports %s and permits retry without false success",
  async (kind) => {
    const request = vi.fn();
    if (kind === "network")
      request.mockRejectedValueOnce(new TypeError("offline"));
    else if (kind === "503")
      request.mockResolvedValueOnce(reply({ code: "LOGIN_UNAVAILABLE" }, 503));
    else if (kind === "malformed")
      request.mockResolvedValueOnce(new Response("not JSON"));
    else request.mockResolvedValueOnce(reply({ access_token: "test-access" }));
    request.mockResolvedValueOnce(reply(session));
    vi.stubGlobal("fetch", request);
    const onLoggedIn = vi.fn();
    const user = userEvent.setup();
    render(createElement(LoginPage, { onLoggedIn }));
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onLoggedIn).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    await vi.waitFor(() => expect(onLoggedIn).toHaveBeenCalledTimes(1));
  },
);
it("blocks double submissions while pending and preserves the posted remember choice", async () => {
  let resolve!: (response: Response) => void;
  const request = vi.fn(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  vi.stubGlobal("fetch", request);
  const onLoggedIn = vi.fn();
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn }));
  await fill(user);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  expect(
    screen
      .getByRole("button", { name: "Đang xử lý…" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await user.keyboard("{Enter}{Enter}");
  expect(request).toHaveBeenCalledTimes(1);
  resolve(reply(session));
  await vi.waitFor(() =>
    expect(onLoggedIn).toHaveBeenCalledWith({ ...session, remember: true }),
  );
});
it("does not pretend navigation succeeded if the parent callback fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(session)));
  const user = userEvent.setup();
  render(
    createElement(LoginPage, {
      onLoggedIn: vi.fn().mockRejectedValue(new Error("session rejected")),
    }),
  );
  await fill(user);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Đăng nhập thành công")).toBeNull();
});
it("keeps unavailable recovery and providers inert with readable reasons", async () => {
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn: vi.fn() }));
  for (const name of [
    "Đăng nhập bằng Google",
    "Chơi với tư cách Khách",
    "Quên mật khẩu?",
  ]) {
    expect(
      screen.getByRole("button", { name }).getAttribute("aria-disabled"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name }));
  }
  expect(
    screen
      .getByRole("link", { name: "Đăng ký tài khoản mới" })
      .getAttribute("href"),
  ).toBe("/register");
  expect(screen.getAllByText("Sắp ra mắt").length).toBeGreaterThan(0);
});
it("calls only supplied real provider hooks", async () => {
  const onGoogle = vi.fn(),
    onGuest = vi.fn();
  const user = userEvent.setup();
  render(createElement(LoginPage, { onLoggedIn: vi.fn(), onGoogle, onGuest }));
  await user.click(
    screen.getByRole("button", { name: "Đăng nhập bằng Google" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Chơi với tư cách Khách" }),
  );
  expect(onGoogle).toHaveBeenCalledTimes(1);
  expect(onGuest).toHaveBeenCalledTimes(1);
});
it("does not hand a late response to the caller after leaving the page", async () => {
  let resolve!: (response: Response) => void;
  const request = vi.fn(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  vi.stubGlobal("fetch", request);
  const onLoggedIn = vi.fn();
  const user = userEvent.setup();
  const view = render(createElement(LoginPage, { onLoggedIn }));
  await fill(user);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
  view.unmount();
  resolve(reply(session));
  await new Promise((done) => setTimeout(done, 0));
  expect(onLoggedIn).not.toHaveBeenCalled();
});
