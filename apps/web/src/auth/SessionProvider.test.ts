// @vitest-environment jsdom
import { createElement, StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./SessionProvider.js";
const session = {
  access_token: "fixture-access",
  refresh_token: "fixture-refresh",
  appSession: "fixture-cap",
  userId: "fixture-user",
  username: "KyThu",
  expires_in: 3600,
  expiresAt: "2030-01-01T00:00:00.000Z",
  remember: true,
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
let current: ReturnType<typeof useSession>;
function Probe() {
  current = useSession();
  const { state, accept, refresh, logout, authorizedFetch } = useSession();
  return createElement(
    "div",
    null,
    createElement("output", { "aria-label": "state" }, JSON.stringify(state)),
    createElement("button", { onClick: () => accept(session) }, "accept"),
    createElement("button", { onClick: () => void refresh() }, "refresh"),
    createElement(
      "button",
      { onClick: () => void logout().catch(() => {}) },
      "logout",
    ),
    createElement(
      "button",
      { onClick: () => void authorizedFetch("/protected").catch(() => {}) },
      "protected",
    ),
  );
}
function mount(strict = false) {
  return render(
    createElement(
      strict ? StrictMode : "div",
      null,
      createElement(SessionProvider, null, createElement(Probe)),
    ),
  );
}
const state = () => JSON.parse(screen.getByLabelText("state").textContent!);
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it("bootstraps from HttpOnly cookies without storage or token fields in public state", async () => {
  const storage = vi.spyOn(Storage.prototype, "setItem");
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  expect(request).toHaveBeenCalledWith(
    "http://localhost:3000/auth/refresh",
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
  expect(request.mock.calls[0]![1].body).toBeUndefined();
  expect(state()).toEqual({
    status: "active-member",
    userId: session.userId,
    username: session.username,
    expiresAt: session.expiresAt,
    remember: true,
  });
  expect(storage).not.toHaveBeenCalled();
});
it("accepts login in memory and sends credentials only to relative backend paths", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockResolvedValueOnce(reply({ google: false, guest: false }))
    .mockResolvedValue(reply({ ok: true }));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
  fireEvent.click(screen.getByText("accept"));
  expect(state().status).toBe("active-member");
  fireEvent.click(screen.getByText("protected"));
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  const init = request.mock.calls[2]![1];
  expect(init.credentials).toBe("include");
  expect(new Headers(init.headers).get("authorization")).toBe(
    "Bearer fixture-access",
  );
  expect(new Headers(init.headers).get("x-xiangqi-session")).toBe(
    "fixture-cap",
  );
});
it("clears invalid sessions on 401 but preserves an active actor during a provider outage", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockResolvedValueOnce(reply({}, 503))
    .mockResolvedValueOnce(reply({}, 401));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  fireEvent.click(screen.getByText("refresh"));
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  await act(async () => {});
  expect(state().status).toBe("active-member");
  fireEvent.click(screen.getByText("refresh"));
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
});
it("shows a retryable bootstrap error for network failures without logging out on the server", async () => {
  const request = vi
    .fn()
    .mockRejectedValue(new Error("private upstream fixture"));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("error"));
  expect(JSON.stringify(state())).not.toContain("private upstream");
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0]![0]).toContain("/auth/refresh");
});
it("preserves the session when logout fails, then clears memory after successful logout", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockResolvedValueOnce(reply({}, 503))
    .mockResolvedValueOnce(reply({ ok: true }));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  fireEvent.click(screen.getByText("logout"));
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  await act(async () => {});
  expect(state().status).toBe("active-member");
  expect(request.mock.calls[1]![0]).toContain("/auth/logout");
  expect(request.mock.calls[1]![1].credentials).toBe("include");
  fireEvent.click(screen.getByText("logout"));
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
});
it("ignores an old bootstrap result after accepting a new login", async () => {
  let resolve!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    ),
  );
  mount();
  await act(async () => {});
  fireEvent.click(screen.getByText("accept"));
  await act(async () => {
    resolve(reply({}, 401));
  });
  expect(state().status).toBe("active-member");
});
it("sends exactly one StrictMode bootstrap refresh, then aborts it on real unmount", async () => {
  const request = vi.fn().mockImplementation(() => new Promise(() => {}));
  vi.stubGlobal("fetch", request);
  const view = mount(true);
  await act(async () => {});
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0]![1].signal.aborted).toBe(false);
  view.unmount();
  expect(request.mock.calls[0]![1].signal.aborted).toBe(true);
});
it("never dispatches bootstrap when its initial effect is canceled before the microtask", async () => {
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  const view = mount();
  view.unmount();
  await act(async () => {});
  expect(request).not.toHaveBeenCalled();
});
it("cannot install a late successful bootstrap after real unmount", async () => {
  let resolve!: (response: Response) => void;
  const request = vi.fn(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  vi.stubGlobal("fetch", request);
  const view = mount();
  await act(async () => {});
  expect(request).toHaveBeenCalledTimes(1);
  view.unmount();
  await act(async () => {
    resolve(reply(session));
  });
  await expect(current.authorizedFetch("/protected")).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(1);
});

it("refreshes bearer before expiry without changing the fixed application deadline, then expires locally", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  const issued = {
    ...session,
    expires_in: 2,
    expiresAt: "2026-10-11T00:00:03Z",
  };
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(issued))
    .mockResolvedValue(reply({ ...issued, access_token: "renewed-access" }));
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  expect(state().status).toBe("active-member");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  expect(request).toHaveBeenCalledTimes(2);
  expect(state().expiresAt).toBe(issued.expiresAt);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(state().status).toBe("anonymous");
});
it("rejects deadline extension and expired acceptance while keeping the original actor", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(reply(session))
      .mockResolvedValue(
        reply({ ...session, expiresAt: "2031-01-01T00:00:00Z" }),
      ),
  );
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  await act(async () => {
    await current.refresh();
  });
  expect(state().expiresAt).toBe(session.expiresAt);
  expect(() =>
    current.accept({ ...session, expiresAt: "2000-01-01T00:00:00Z" }),
  ).toThrow();
  expect(() => current.accept({ ...session, remember: undefined })).toThrow();
});
it("does not send bearer or capability to absolute URLs or follow redirects", async () => {
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  for (const path of [
    "https://foreign.example/",
    "//foreign.example/",
    "/\\foreign.example/",
  ])
    await expect(current.authorizedFetch(path)).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(1);
  await current.authorizedFetch("/protected", { redirect: "follow" });
  expect(request.mock.calls[1]![1].redirect).toBe("error");
});
it("does not let automatic renewal abort an in-flight logout", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  let resolve!: (value: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 2 }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    )
    .mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  let pending!: Promise<void>;
  act(() => {
    pending = current.logout();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(request).toHaveBeenCalledTimes(2);
  await act(async () => {
    resolve(reply({ ok: true }));
    await pending;
  });
  expect(state().status).toBe("anonymous");
});
it("ignores an old protected-request 401 and logout success after accepting a newer login", async () => {
  let resolve!: (value: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  let protectedRequest!: Promise<Response>;
  act(() => {
    protectedRequest = current.authorizedFetch("/protected");
    current.accept({ ...session, access_token: "new-access" });
  });
  await act(async () => {
    resolve(reply({}, 401));
    await protectedRequest;
  });
  expect(state().status).toBe("active-member");
  let logout!: Promise<void>;
  await act(async () => {
    logout = current.logout();
  });
  act(() => {
    current.accept({ ...session, access_token: "latest-access" });
  });
  await act(async () => {
    resolve(reply({ ok: true }));
    await logout;
  });
  expect(state().status).toBe("active-member");
});

it("shares one refresh between concurrent protected requests after bearer expiry", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  let resolve!: (value: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 1 }))
    .mockImplementation((url: string, init: RequestInit) =>
      url.endsWith("/auth/refresh")
        ? new Promise<Response>((done, reject) => {
            resolve = done;
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          })
        : Promise.resolve(reply({ ok: true })),
    );
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  vi.setSystemTime(new Date("2026-10-11T00:00:02Z"));
  let first!: Promise<Response | Error>;
  let second!: Promise<Response | Error>;
  act(() => {
    first = current.authorizedFetch("/first").catch((error) => error as Error);
    second = current
      .authorizedFetch("/second")
      .catch((error) => error as Error);
  });
  expect(
    request.mock.calls.filter(([url]) => url.endsWith("/auth/refresh")),
  ).toHaveLength(2);
  let results!: (Response | Error)[];
  await act(async () => {
    resolve(reply({ ...session, access_token: "renewed-access" }));
    results = await Promise.all([first, second]);
  });
  expect(
    results.every(
      (result) => result instanceof Response && result.status === 200,
    ),
  ).toBe(true);
  for (const [, init] of request.mock.calls.filter(
    ([url]) => !url.endsWith("/auth/refresh"),
  ))
    expect(new Headers(init.headers).get("authorization")).toBe(
      "Bearer renewed-access",
    );
});

it("keeps an in-flight logout in control when manual refresh is requested", async () => {
  let resolve!: (value: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    )
    .mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  let pending!: Promise<void>;
  await act(async () => {
    pending = current.logout();
  });
  await act(async () => {
    await current.refresh();
  });
  expect(request.mock.calls[1]![1].signal.aborted).toBe(false);
  await expect(current.authorizedFetch("/protected")).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(2);
  await act(async () => {
    resolve(reply({ ok: true }));
    await pending;
  });
  expect(state().status).toBe("anonymous");
});

it("refreshes an expired bearer before revoking the application session on logout", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 1 }))
    .mockImplementation((url: string, init: RequestInit) =>
      Promise.resolve(
        url.endsWith("/auth/refresh")
          ? reply({ ...session, access_token: "renewed-access" })
          : reply(
              {},
              new Headers(init.headers).get("authorization") ===
                "Bearer renewed-access"
                ? 200
                : 401,
            ),
      ),
    );
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  vi.setSystemTime(new Date("2026-10-11T00:00:02Z"));
  await act(async () => {
    await expect(current.logout()).resolves.toBeUndefined();
  });
  expect(state().status).toBe("anonymous");
  expect(request.mock.calls.map(([url]) => new URL(url).pathname)).toEqual([
    "/auth/refresh",
    "/auth/refresh",
    "/auth/logout",
  ]);
});

it("keeps an expired-bearer actor when logout renewal is unavailable without sending an invalid revoke", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 1 }))
    .mockResolvedValue(reply({}, 503));
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  vi.setSystemTime(new Date("2026-10-11T00:00:02Z"));
  await act(async () => {
    await expect(current.logout()).rejects.toThrow();
  });
  expect(state().status).toBe("active-member");
  expect(request.mock.calls.map(([url]) => new URL(url).pathname)).toEqual([
    "/auth/refresh",
    "/auth/refresh",
  ]);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(request).toHaveBeenCalledTimes(3);
  expect(state().expiresAt).toBe(session.expiresAt);
});

it("cancels logout-renewal retries when a newer login is accepted", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 1 }))
    .mockResolvedValue(reply({}, 503));
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  vi.setSystemTime(new Date("2026-10-11T00:00:02Z"));
  await act(async () => {
    await expect(current.logout()).rejects.toThrow();
  });
  act(() => {
    current.accept({ ...session, access_token: "new-login-access" });
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(request).toHaveBeenCalledTimes(2);
});
const googlePending = {
  kind: "pending",
  expiresAt: "2030-01-01T00:00:00Z",
  recovering: false,
  email: "verified@example.invalid",
  avatar: { kind: "initials", text: "?" },
};
it("bootstraps pending Google only after member401 and server readiness, with server-verified metadata and no tokens", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockResolvedValueOnce(reply({ google: true, guest: false }))
    .mockResolvedValueOnce(
      reply({ ...googlePending, access_token: "private-provider-token" }),
    );
  vi.stubGlobal("fetch", request);
  const storage = vi.spyOn(Storage.prototype, "setItem");
  mount(true);
  await vi.waitFor(() => expect(state().status).toBe("pending"));
  expect(state()).toEqual({
    status: "pending",
    method: "google",
    expiresAt: googlePending.expiresAt,
    recovering: false,
    email: googlePending.email,
    avatar: googlePending.avatar,
  });
  expect(request.mock.calls.map(([url]) => new URL(url).pathname)).toEqual([
    "/auth/refresh",
    "/auth/providers",
    "/auth/google/onboarding",
  ]);
  expect(storage).not.toHaveBeenCalled();
  await expect(current.authorizedFetch("/protected")).rejects.toThrow();
});
it("does not probe Google onboarding when server readiness is false", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockResolvedValueOnce(reply({ google: false, guest: false }));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
  expect(request).toHaveBeenCalledTimes(2);
});
it("keeps readiness and Google bootstrap outages distinct from anonymous", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockResolvedValueOnce(reply({ google: true, guest: false }))
    .mockResolvedValueOnce(reply({ message: "private" }, 503));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("error"));
  expect(JSON.stringify(state())).not.toContain("private");
});
it("accepts pending metadata without granting bearer access and ignores a stale bootstrap", async () => {
  let resolve!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise<Response>((done) => (resolve = done))),
  );
  mount();
  await act(async () => {});
  act(() =>
    current.accept({ kind: "pending", expiresAt: googlePending.expiresAt }),
  );
  await act(async () => resolve(reply(session)));
  expect(state().status).toBe("pending");
  await expect(current.authorizedFetch("/protected")).rejects.toThrow();
});
it("does not probe onboarding after a stale readiness result when a newer login has been accepted", async () => {
  let resolve!: (r: Response) => void;
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockImplementationOnce(
      () => new Promise<Response>((done) => (resolve = done)),
    );
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  act(() => current.accept(session));
  await act(async () => resolve(reply({ google: true, guest: false })));
  expect(state().status).toBe("active-member");
  expect(request).toHaveBeenCalledTimes(2);
});
