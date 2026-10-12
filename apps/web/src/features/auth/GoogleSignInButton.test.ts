// @vitest-environment jsdom
import { createElement, StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "./GoogleSignInButton.js";
import type { GoogleIdentity } from "./google-gis.js";
const sdk = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("./google-gis.js", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  loadGoogleIdentity: sdk.load,
}));
let config: Parameters<GoogleIdentity["initialize"]>[0];
let buttonOptions: Parameters<GoogleIdentity["renderButton"]>[1];
const nonce = "a".repeat(64);
const deadline = () => new Date(Date.now() + 300000).toISOString();
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
beforeEach(() => {
  sdk.load.mockResolvedValue({
    initialize(c: typeof config) {
      config = c;
    },
    renderButton(
      el: HTMLElement,
      options: Parameters<GoogleIdentity["renderButton"]>[1],
    ) {
      buttonOptions = options;
      const button = document.createElement("button");
      button.textContent = "Official Google";
      button.onclick = () => options.click_listener();
      el.append(button);
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
});
function requests(enabled = true) {
  return vi.fn((url: string) =>
    Promise.resolve(
      url.endsWith("/auth/providers")
        ? reply({ google: enabled, guest: false })
        : url.endsWith("/challenge")
          ? reply({
              nonce,
              clientId: "fixture.apps.googleusercontent.com",
              expiresAt: deadline(),
            })
          : reply({ kind: "pending", expiresAt: deadline() }),
    ),
  );
}
it("does not load GIS or challenge when the server has disabled Google", async () => {
  const request = requests(false);
  vi.stubGlobal("fetch", request);
  render(
    createElement(GoogleSignInButton, { remember: true, onResult: vi.fn() }),
  );
  await vi.waitFor(() =>
    expect(screen.getByText(/chưa sẵn sàng/i)).toBeTruthy(),
  );
  expect(sdk.load).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledTimes(1);
});
it("uses configured audience and nonce with the official popup button and snapshots remember at click", async () => {
  const request = requests();
  vi.stubGlobal("fetch", request);
  const result = vi.fn();
  const storage = vi.spyOn(Storage.prototype, "setItem");
  const view = render(
    createElement(GoogleSignInButton, { remember: true, onResult: result }),
  );
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
  expect(config).toMatchObject({
    client_id: "fixture.apps.googleusercontent.com",
    nonce,
    ux_mode: "popup",
    auto_select: false,
  });
  expect(buttonOptions.width).toBe("260");
  fireEvent.click(screen.getByText("Official Google"));
  view.rerender(
    createElement(GoogleSignInButton, { remember: false, onResult: result }),
  );
  await act(async () => {
    config.callback({ credential: "opaque-signed-fixture" });
  });
  await vi.waitFor(() => expect(result).toHaveBeenCalledOnce());
  const authentication = request.mock.calls.find(([url]) =>
    url.endsWith("/authenticate"),
  );
  expect(authentication).toBeTruthy();
  expect(storage).not.toHaveBeenCalled();
  // Inspect the HTTP boundary, not the Google SDK fixture.
  const fetchInit = (
    request.mock.calls as unknown as [string, RequestInit][]
  ).find(([url]) => url.endsWith("/authenticate"))![1];
  expect(JSON.parse(fetchInit.body as string)).toEqual({
    credential: "opaque-signed-fixture",
    remember: true,
  });
});
it("keeps canceled StrictMode setup from dispatching a second challenge and ignores unmounted callbacks", async () => {
  const request = requests();
  vi.stubGlobal("fetch", request);
  const result = vi.fn();
  const view = render(
    createElement(
      StrictMode,
      null,
      createElement(GoogleSignInButton, { remember: true, onResult: result }),
    ),
  );
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
  expect(
    request.mock.calls.filter(([url]) => url.endsWith("/challenge")),
  ).toHaveLength(1);
  const old = config.callback;
  view.unmount();
  await act(async () => old({ credential: "opaque-signed-fixture" }));
  expect(result).not.toHaveBeenCalled();
  expect(
    request.mock.calls.filter(([url]) => url.endsWith("/authenticate")),
  ).toHaveLength(0);
});
it("sanitizes readiness outages and retries without using browser feature flags", async () => {
  const request = requests();
  request.mockImplementationOnce(() =>
    Promise.resolve(reply({ message: "private-token" }, 503)),
  );
  vi.stubGlobal("fetch", request);
  render(
    createElement(GoogleSignInButton, { remember: true, onResult: vi.fn() }),
  );
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  expect(screen.queryByText("private-token")).toBeNull();
  expect(sdk.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại Google" }));
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
});
it("invalidates old callbacks when a fresh challenge is requested", async () => {
  const request = requests();
  vi.stubGlobal("fetch", request);
  const result = vi.fn();
  render(
    createElement(GoogleSignInButton, { remember: true, onResult: result }),
  );
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
  const old = config.callback;
  fireEvent.click(screen.getByRole("button", { name: "Xác thực Google lại" }));
  await vi.waitFor(() =>
    expect(
      request.mock.calls.filter(([url]) => url.endsWith("/challenge")),
    ).toHaveLength(2),
  );
  await act(async () => old({ credential: "old-signed-fixture" }));
  expect(
    request.mock.calls.filter(([url]) => url.endsWith("/authenticate")),
  ).toHaveLength(0);
});
it("reports authentication busy to its form owner and releases it on unmount", async () => {
  const request = requests();
  request.mockImplementation((url: string) =>
    url.endsWith("/authenticate")
      ? new Promise<Response>(() => {})
      : Promise.resolve(
          url.endsWith("/auth/providers")
            ? reply({ google: true, guest: false })
            : reply({
                nonce,
                clientId: "fixture.apps.googleusercontent.com",
                expiresAt: deadline(),
              }),
        ),
  );
  vi.stubGlobal("fetch", request);
  const busy = vi.fn();
  const view = render(
    createElement(GoogleSignInButton, {
      remember: true,
      onResult: vi.fn(),
      onBusyChange: busy,
    }),
  );
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
  await act(async () =>
    config.callback({ credential: "opaque-signed-fixture" }),
  );
  expect(busy).toHaveBeenCalledWith(true);
  view.unmount();
  expect(busy).toHaveBeenLastCalledWith(false);
});
it("does not send a signed credential after the challenge deadline", async () => {
  const request = requests();
  vi.stubGlobal("fetch", request);
  render(
    createElement(GoogleSignInButton, { remember: true, onResult: vi.fn() }),
  );
  await vi.waitFor(() =>
    expect(screen.getByText("Official Google")).toBeTruthy(),
  );
  const instant = Date.now();
  vi.spyOn(Date, "now").mockReturnValue(instant + 300001);
  await act(async () =>
    config.callback({ credential: "expired-signed-fixture" }),
  );
  expect(screen.getByRole("alert").textContent).toContain("hết hạn");
  expect(
    request.mock.calls.filter(([url]) => url.endsWith("/authenticate")),
  ).toHaveLength(0);
});
