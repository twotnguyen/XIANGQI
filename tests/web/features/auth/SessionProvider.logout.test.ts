// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LogoutConfirmRequired } from "@web/features/auth/SessionProvider.js";
import {
  resetSession,
  memberProof,
  session,
  reply,
  current,
  mount,
  state,
} from "./SessionProvider.test-helper.js";

afterEach(resetSession);
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
    "/api/auth/refresh",
    "/api/auth/refresh",
    "/api/auth/logout",
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
    "/api/auth/refresh",
    "/api/auth/refresh",
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

it("retains the member after the server demands logout confirmation and signs out only after consent", async () => {
  const request = vi.fn((url: string, init?: RequestInit) => {
    if (url.endsWith("/auth/refresh")) return Promise.resolve(reply(session));
    const confirmed = JSON.parse(String(init?.body ?? "{}")).confirm === true;
    return Promise.resolve(
      confirmed
        ? reply({ loggedOut: true })
        : reply({ code: "LOGOUT_CONFIRM_REQUIRED" }, 409),
    );
  });
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  await act(async () => {
    await expect(current.logout()).rejects.toBeInstanceOf(
      LogoutConfirmRequired,
    );
  });
  expect(state().status).toBe("active-member");
  expect(memberProof(await current.getRealtimeProof()).appSession).toBe(
    session.appSession,
  );
  await act(async () => {
    await current.logout(true);
  });
  expect(state().status).toBe("anonymous");
  await expect(current.getRealtimeProof()).rejects.toThrow();
});
