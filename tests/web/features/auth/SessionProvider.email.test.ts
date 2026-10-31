// @vitest-environment jsdom
import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  resetSession,
  session,
  reply,
  current,
  mount,
  state,
  withoutGuest,
  verifiedEmail,
  email,
} from "./SessionProvider.test-helper.js";

afterEach(resetSession);
it("reads GET /account/email once for an active member and exposes the status", async () => {
  const request = vi.fn().mockResolvedValue(reply(session));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(current.emailStatus.status).toBe("ready"));
  expect(state().status).toBe("active-member");
  expect(current.emailStatus).toMatchObject({
    status: "ready",
    email: "kythu@example.invalid",
    emailVerified: true,
  });
  expect(email.calls).toHaveLength(1);
  expect(email.calls[0]!.url.endsWith("/account/email")).toBe(true);
  expect(email.calls[0]!.init?.redirect).toBe("error");
  expect(
    request.mock.calls.some(([url]) => String(url).endsWith("/account/email")),
  ).toBe(false);
});
it("keeps the member active when email status fails and recovers through reloadEmailStatus", async () => {
  email.reply = () => reply({ code: "UNAVAILABLE" }, 503);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(session)));
  mount();
  await vi.waitFor(() => expect(current.emailStatus.status).toBe("error"));
  expect(state().status).toBe("active-member");
  email.reply = () => reply(verifiedEmail);
  await act(async () => {
    await current.reloadEmailStatus();
  });
  expect(current.emailStatus.status).toBe("ready");
  expect(email.calls).toHaveLength(2);
  expect(state().status).toBe("active-member");
});
it("never reads email status for anonymous visitors", async () => {
  vi.stubGlobal(
    "fetch",
    withoutGuest(
      vi
        .fn()
        .mockResolvedValueOnce(reply({ code: "AUTH_REQUIRED" }, 401))
        .mockResolvedValueOnce(reply({ google: false, guest: false })),
    ),
  );
  mount();
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
  await act(async () => {});
  expect(email.calls).toEqual([]);
  expect(current.emailStatus.status).toBe("idle");
});
it("resets email status to idle after logout so the next account never sees the previous one", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockResolvedValueOnce(reply({ ok: true }));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(current.emailStatus.status).toBe("ready"));
  fireEvent.click(screen.getByText("logout"));
  await vi.waitFor(() => expect(state().status).toBe("anonymous"));
  expect(current.emailStatus.status).toBe("idle");
});
