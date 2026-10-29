// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  GuestRequestError,
  SessionProvider,
  useSession,
} from "@web/features/auth/SessionProvider.js";

const capability = "guest-capability-synthetic-0123456789abcdefghijk";
const guestDto = (expiresAt: string, deferred = false) => ({
  kind: "guest",
  userId: "guest-user-1",
  displayName: "Lữ khách",
  expiresAt,
  deferred,
  capability,
});
const verifiedEmail = {
  email: "kythu@example.invalid",
  emailVerified: true,
  pendingEmail: null,
  expiresAt: null,
  resendAt: null,
};

let latest: { accept(result: unknown): void } | null = null;
let failures: unknown[] = [];
let proof: unknown = undefined;
let calls: { url: string; init: RequestInit }[] = [];
let responder: (url: string) => Response | Promise<Response>;

function capture(error: unknown) {
  failures.push(error);
}

function Probe() {
  const session = useSession();
  latest = session;
  const button = (label: string, onClick: () => void) =>
    createElement("button", { onClick }, label);
  return createElement(
    "div",
    null,
    createElement(
      "output",
      { "aria-label": "state" },
      JSON.stringify(session.state),
    ),
    button("refresh", () => void session.refresh()),
    button(
      "start-invalid",
      () => void session.startGuest("   ").catch(capture),
    ),
    button("start", () => void session.startGuest("Lữ khách").catch(capture)),
    button(
      "logout-plain",
      () => void session.logoutGuest(false).catch(capture),
    ),
    button(
      "logout-confirmed",
      () => void session.logoutGuest(true).catch(capture),
    ),
    button(
      "fetch-rooms",
      () => void session.sessionFetch("/rooms").catch(capture),
    ),
    button(
      "proof",
      () =>
        void session
          .getRealtimeProof()
          .then((value) => {
            proof = value;
          })
          .catch(capture),
    ),
  );
}

function state(): Record<string, unknown> {
  return JSON.parse(screen.getByLabelText("state").textContent ?? "{}");
}

function reply(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function click(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
  await act(async () => {});
}

// Routes by URL suffix; anything else is 401 AUTH_REQUIRED (no member, no guest cookie).
// /auth/providers is the real readiness document: Google off, guest on.
const providersDefault = {
  "/auth/providers": () => reply({ google: false, guest: true }),
};
function route(overrides: Record<string, () => Response | Promise<Response>>) {
  const routes = { ...providersDefault, ...overrides };
  responder = (url) => {
    for (const [suffix, make] of Object.entries(routes)) {
      if (url.endsWith(suffix)) return make();
    }
    return reply({ code: "AUTH_REQUIRED" }, 401);
  };
}

beforeEach(() => {
  latest = null;
  failures = [];
  calls = [];
  proof = undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input);
      calls.push({ url, init });
      return responder(url);
    }),
  );
  route({});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function mount() {
  render(createElement(SessionProvider, null, createElement(Probe)));
  await act(async () => {});
}

it("rejects an invalid guest name server-side without entering guest state", async () => {
  route({
    "/account/guest": () => reply({ code: "GUEST_NAME_INVALID" }, 400),
  });
  await mount();
  await click("start-invalid");
  const starts = calls.filter((c) => c.url.endsWith("/account/guest"));
  expect(starts).toHaveLength(1);
  expect(JSON.parse(String(starts[0]!.init.body))).toEqual({
    displayName: "   ",
  });
  expect(failures).toHaveLength(1);
  expect(failures[0]).toMatchObject({
    status: 400,
    code: "GUEST_NAME_INVALID",
  });
  expect(state().status).toBe("anonymous");
});

it("starts a guest with the name in the body, no Authorization header, and no capability in state", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
  });
  await mount();
  await click("start");
  const start = calls.find((c) => c.url.endsWith("/account/guest"))!;
  expect(start.init.method).toBe("POST");
  expect(JSON.parse(String(start.init.body))).toEqual({
    displayName: "Lữ khách",
  });
  expect(new Headers(start.init.headers).get("authorization")).toBeNull();
  expect(state()).toMatchObject({
    status: "guest",
    userId: "guest-user-1",
    displayName: "Lữ khách",
    deferred: false,
  });
  expect(JSON.stringify(state())).not.toContain(capability);
});

it("exposes only the guest capability through the realtime proof, never a member token", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
  });
  await mount();
  await click("start");
  await click("proof");
  expect(proof).toEqual({ kind: "guest", guestCapability: capability });
});

it("sends guest HTTP requests with Authorization: Guest and never a Bearer", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/rooms": () => reply([], 200),
  });
  await mount();
  await click("start");
  await click("fetch-rooms");
  const rooms = calls.find((c) => c.url.endsWith("/rooms"))!;
  expect(new Headers(rooms.init.headers).get("authorization")).toBe(
    `Guest ${capability}`,
  );
  expect(rooms.init.credentials).toBe("include");
});

it("restores a guest from the HttpOnly cookie on refresh with no Authorization header", async () => {
  route({
    "/account/guest/session": () =>
      reply(guestDto("2030-01-01T12:00:00Z"), 200),
  });
  await mount();
  await click("refresh");
  const restore = calls.find((c) => c.url.endsWith("/account/guest/session"))!;
  expect(restore.init.credentials).toBe("include");
  expect(new Headers(restore.init.headers).get("authorization")).toBeNull();
  expect(state()).toMatchObject({ status: "guest", userId: "guest-user-1" });
  expect(JSON.stringify(state())).not.toContain(capability);
});

async function flush() {
  await act(async () => {});
  await act(async () => {});
}

it("at the non-deferred deadline, a server 200 keeps the guest with the server's new expiry", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  let session = () => reply(guestDto("2030-01-01T00:00:30Z"), 200);
  route({ "/account/guest/session": () => session() });
  await mount();
  await click("refresh");
  session = () => reply(guestDto("2030-01-01T00:01:00Z"), 200);
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  await flush();
  expect(state()).toMatchObject({
    status: "guest",
    expiresAt: "2030-01-01T00:01:00Z",
  });
});

it("at the next deadline, a server 401 drops the guest to anonymous", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  let session = () => reply(guestDto("2030-01-01T00:00:30Z"), 200);
  route({ "/account/guest/session": () => session() });
  await mount();
  await click("refresh");
  session = () => reply({ code: "AUTH_REQUIRED" }, 401);
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  await flush();
  expect(state().status).toBe("anonymous");
});

it("a transient 503 at the deadline keeps the guest and retries after guestRetryMs", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  let session = () => reply(guestDto("2030-01-01T00:00:30Z"), 200);
  route({ "/account/guest/session": () => session() });
  await mount();
  await click("refresh");
  session = () => reply({ code: "UNAVAILABLE" }, 503);
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  await flush();
  expect(state()).toMatchObject({ status: "guest" });
  session = () => reply(guestDto("2030-01-01T00:02:00Z"), 200);
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  await flush();
  expect(state()).toMatchObject({
    status: "guest",
    expiresAt: "2030-01-01T00:02:00Z",
  });
});

it("a deferred guest (expired while seated) is rechecked by the server and dropped only when the server says so", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  let session = () => reply(guestDto("2030-01-01T00:00:30Z", true), 200);
  route({ "/account/guest/session": () => session() });
  const sessionCalls = () =>
    calls.filter((call) => call.url.endsWith("/account/guest/session")).length;
  await mount();
  await click("refresh");
  expect(state()).toMatchObject({ status: "guest", deferred: true });
  for (let step = 0; step < 4; step++) {
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    await flush();
  }
  expect(sessionCalls()).toBeGreaterThanOrEqual(4);
  expect(state()).toMatchObject({ status: "guest", deferred: true });
  session = () => reply({ code: "AUTH_REQUIRED" }, 401);
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  await flush();
  expect(state().status).toBe("anonymous");
});

it("ignores a late cookie restore that resolves after logout", async () => {
  const restore = deferred<Response>();
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/guest/session": () => restore.promise,
    "/account/guest/logout": () => reply(null, 204),
  });
  await mount();
  await click("refresh");
  await click("start");
  await click("logout-confirmed");
  expect(state().status).toBe("anonymous");
  await act(async () => {
    restore.resolve(reply(guestDto("2030-01-01T12:00:00Z"), 200));
  });
  await flush();
  expect(state().status).toBe("anonymous");
});

it("ignores a late cookie restore that resolves after a member accept", async () => {
  const restore = deferred<Response>();
  route({
    "/account/email": () => reply(verifiedEmail),
    "/account/guest/session": () => restore.promise,
  });
  await mount();
  await click("refresh");
  await act(async () => {
    latest!.accept({
      kind: "member",
      access_token: "synthetic-bearer",
      refresh_token: "synthetic-refresh",
      expires_in: 3600,
      appSession: "a".repeat(43),
      expiresAt: "2030-01-01T00:00:00Z",
      userId: "member-1",
      username: "KyThu",
      remember: true,
    });
  });
  await act(async () => {
    restore.resolve(reply(guestDto("2030-01-01T12:00:00Z"), 200));
  });
  await flush();
  expect(state().status).toBe("active-member");
});

it("a failed confirmed logout keeps the guest, and a retry clears it", async () => {
  let failNext = true;
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/guest/logout": () => {
      if (failNext) {
        failNext = false;
        return reply({ code: "UNAVAILABLE" }, 503);
      }
      return reply(null, 204);
    },
  });
  await mount();
  await click("start");
  await click("logout-confirmed");
  expect(state()).toMatchObject({ status: "guest" });
  expect(failures.at(-1)).toBeInstanceOf(Error);
  await click("logout-confirmed");
  expect(state().status).toBe("anonymous");
});

it("keeps the guest when logout needs resign confirmation (409), sending the capability", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/guest/logout": () =>
      reply({ code: "GUEST_RESIGN_CONFIRM_REQUIRED" }, 409),
  });
  await mount();
  await click("start");
  await click("logout-plain");
  const logout = calls.find((c) => c.url.endsWith("/account/guest/logout"))!;
  expect(new Headers(logout.init.headers).get("authorization")).toBe(
    `Guest ${capability}`,
  );
  expect(JSON.parse(String(logout.init.body))).toEqual({
    confirmedResign: false,
  });
  expect(failures[0]).toBeInstanceOf(GuestRequestError);
  expect(failures[0]).toMatchObject({
    status: 409,
    code: "GUEST_RESIGN_CONFIRM_REQUIRED",
  });
  expect(state().status).toBe("guest");
});

it("stays guest when logout fails with a server error, so the user can retry", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/guest/logout": () => reply({ code: "GUEST_UNAVAILABLE" }, 503),
  });
  await mount();
  await click("start");
  await click("logout-confirmed");
  expect(state().status).toBe("guest");
  expect(failures).toHaveLength(1);
});

it("goes anonymous after a confirmed guest logout, and a later refresh cannot restore the cookie", async () => {
  let cookieCleared = false;
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/guest/logout": () => {
      cookieCleared = true;
      return new Response(null, { status: 204 });
    },
    "/account/guest/session": () =>
      cookieCleared
        ? reply({ code: "GUEST_INVALID" }, 401)
        : reply(guestDto("2030-01-01T12:00:00Z"), 200),
  });
  await mount();
  await click("start");
  await click("logout-confirmed");
  expect(state().status).toBe("anonymous");
  const logout = calls.find((c) => c.url.endsWith("/account/guest/logout"))!;
  expect(JSON.parse(String(logout.init.body))).toEqual({
    confirmedResign: true,
  });
  await click("refresh");
  expect(state().status).toBe("anonymous");
  expect(JSON.stringify(state())).not.toContain(capability);
});

it("drops a guest to anonymous when a guest-authorized request is rejected as expired", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/rooms": () => reply({ code: "GUEST_EXPIRED" }, 401),
  });
  await mount();
  await click("start");
  await click("fetch-rooms");
  expect(state().status).toBe("anonymous");
});

it("drops guest proof when a member signs in, so a guest capability is never used with a member session", async () => {
  route({
    "/account/guest": () => reply(guestDto("2030-01-01T12:00:00Z"), 201),
    "/account/email": () => reply(verifiedEmail),
  });
  await mount();
  await click("start");
  expect(state().status).toBe("guest");
  await act(async () => {
    latest!.accept({
      kind: "member",
      access_token: "synthetic-bearer",
      refresh_token: "synthetic-refresh",
      expires_in: 3600,
      appSession: "a".repeat(43),
      expiresAt: "2030-01-01T00:00:00Z",
      userId: "member-1",
      username: "KyThu",
      remember: true,
    });
  });
  expect(state().status).toBe("active-member");
  await click("proof");
  expect(proof).toMatchObject({
    kind: "member",
    accessToken: "synthetic-bearer",
  });
  expect(proof).not.toHaveProperty("guestCapability");
});

it("a transient restore 503 does not log the guest out, and a later refresh restores it", async () => {
  let unavailable = true;
  route({
    "/account/guest/session": () =>
      unavailable
        ? reply({ code: "UNAVAILABLE" }, 503)
        : reply(guestDto("2030-01-01T12:00:00Z"), 200),
  });
  await mount();
  await click("refresh");
  expect(state().status).not.toBe("anonymous");
  unavailable = false;
  await click("refresh");
  expect(state().status).toBe("guest");
});
