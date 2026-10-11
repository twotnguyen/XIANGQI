// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GoogleOnboardingPage } from "./GoogleOnboardingPage.js";
const pending = {
  kind: "pending" as const,
  expiresAt: "2030-01-01T00:00:00Z",
  recovering: false,
  email: "verified@example.invalid",
  avatar: { kind: "initials" as const, text: "?" },
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function fill() {
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "KyThuGoogle" },
  });
  fireEvent.change(screen.getByLabelText("Mật khẩu dự phòng"), {
    target: { value: "Password123" },
  });
  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu"), {
    target: { value: "Password123" },
  });
}
it("renders verified readonly metadata without an exit button and completes with username/password only", async () => {
  const result = { kind: "member", fixture: "member" };
  const request = vi.fn().mockResolvedValue(reply(result));
  vi.stubGlobal("fetch", request);
  const complete = vi.fn();
  const storage = vi.spyOn(Storage.prototype, "setItem");
  render(createElement(GoogleOnboardingPage, { pending, onResult: complete }));
  expect(
    (screen.getByLabelText("Email Google") as HTMLInputElement).readOnly,
  ).toBe(true);
  expect(
    (screen.getByLabelText("Email Google") as HTMLInputElement).value,
  ).toBe(pending.email);
  expect(
    screen.queryByRole("button", { name: /hủy|đóng|quay lại/i }),
  ).toBeNull();
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  await vi.waitFor(() => expect(complete).toHaveBeenCalledWith(result));
  expect(JSON.parse(request.mock.calls[0]![1].body)).toEqual({
    username: "KyThuGoogle",
    password: "Password123",
  });
  expect(storage).not.toHaveBeenCalled();
});
it("rejects forbidden username immediately and keeps collided username focused without exposing provider text", async () => {
  const request = vi
    .fn()
    .mockResolvedValue(
      reply({ code: "USERNAME_TAKEN", message: "private-token" }, 409),
    );
  vi.stubGlobal("fetch", request);
  render(createElement(GoogleOnboardingPage, { pending, onResult: vi.fn() }));
  fill();
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "fuckname" },
  });
  expect(screen.getByRole("alert").textContent).toContain("không được phép");
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  expect(request).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "OtherName" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(screen.getByLabelText("Username")),
  );
  expect(screen.queryByText("private-token")).toBeNull();
});
it("loads metadata from the server after fresh pending authentication and retries an outage", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ message: "private" }, 503))
    .mockResolvedValueOnce(reply(pending));
  vi.stubGlobal("fetch", request);
  render(
    createElement(GoogleOnboardingPage, {
      pending: {
        kind: "pending",
        expiresAt: pending.expiresAt,
        recovering: false,
      },
      onResult: vi.fn(),
    }),
  );
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await vi.waitFor(() =>
    expect(screen.getByLabelText("Email Google")).toBeTruthy(),
  );
  expect(request.mock.calls[0]![0]).toContain("/auth/google/onboarding");
});
it("preserves entered credentials after a completion outage, and ignores a late response after unmount", async () => {
  let resolve!: (r: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ code: "GOOGLE_RECOVERING" }, 503))
    .mockImplementationOnce(
      () => new Promise<Response>((done) => (resolve = done)),
    );
  vi.stubGlobal("fetch", request);
  const complete = vi.fn();
  const view = render(
    createElement(GoogleOnboardingPage, { pending, onResult: complete }),
  );
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  expect(
    (screen.getByLabelText("Mật khẩu dự phòng") as HTMLInputElement).value,
  ).toBe("Password123");
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  view.unmount();
  await act(async () => resolve(reply({ kind: "member" })));
  expect(complete).not.toHaveBeenCalled();
});
it("rejects short or mismatched passwords before sending completion", () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  render(createElement(GoogleOnboardingPage, { pending, onResult: vi.fn() }));
  fill();
  fireEvent.change(screen.getByLabelText("Mật khẩu dự phòng"), {
    target: { value: "short" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  expect(screen.getByRole("alert").textContent).toContain("8 ký tự");
  fireEvent.change(screen.getByLabelText("Mật khẩu dự phòng"), {
    target: { value: "Different123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất thiết lập" }));
  expect(screen.getByRole("alert").textContent).toContain("chưa khớp");
  expect(request).not.toHaveBeenCalled();
});

it.each([false, true])(
  "uses explicit recovery Remember=%s instead of silently extending the session",
  async (remember) => {
    let config!: Parameters<
      import("./google-gis.js").GoogleIdentity["initialize"]
    >[0];
    vi.stubGlobal("google", {
      accounts: {
        id: {
          initialize(value: typeof config) {
            config = value;
          },
          renderButton(
            element: HTMLElement,
            options: Parameters<
              import("./google-gis.js").GoogleIdentity["renderButton"]
            >[1],
          ) {
            const button = document.createElement("button");
            button.textContent = "Official Google";
            button.onclick = () => options.click_listener();
            element.append(button);
          },
        },
      },
    });
    const request = vi.fn(async (url: string) => {
      if (url.endsWith("/auth/providers"))
        return reply({ google: true, guest: false });
      if (url.endsWith("/auth/google/challenge"))
        return reply({
          nonce: "a".repeat(64),
          clientId: "test.apps.googleusercontent.com",
          expiresAt: new Date(Date.now() + 300000).toISOString(),
        });
      return reply({ kind: "member" });
    });
    vi.stubGlobal("fetch", request);
    const complete = vi.fn();
    render(
      createElement(GoogleOnboardingPage, {
        pending: { ...pending, expiresAt: "2000-01-01T00:00:00Z" },
        onResult: complete,
      }),
    );
    const checkbox = screen.getByLabelText(
      "Ghi nhớ đăng nhập",
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    if (remember) fireEvent.click(checkbox);
    await vi.waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Official Google" }),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Official Google" }));
    await act(async () =>
      config.callback({ credential: "synthetic-credential" }),
    );
    await vi.waitFor(() => expect(complete).toHaveBeenCalledOnce());
    const authentication = request.mock.calls.find(([url]) =>
      url.endsWith("/auth/google/authenticate"),
    );
    expect(authentication).toBeTruthy();
    expect(
      JSON.parse(
        (authentication as unknown as [string, RequestInit])[1].body as string,
      ),
    ).toEqual({ credential: "synthetic-credential", remember });
  },
);
