// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  resetSession,
  memberProof,
  session,
  reply,
  current,
  mount,
  state,
  withoutGuest,
} from "./SessionProvider.test-helper.js";

afterEach(resetSession);
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
  vi.stubGlobal("fetch", withoutGuest(request));
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
    "/api/auth/refresh",
    "/api/auth/providers",
    "/api/auth/google/onboarding",
  ]);
  expect(
    storage.mock.calls.every(
      ([key, value]) => key === "xiangqi.tab" && /^[a-f0-9-]{36}$/.test(value),
    ),
  ).toBe(true);
  await expect(current.authorizedFetch("/protected")).rejects.toThrow();
});
it("does not probe Google onboarding when server readiness is false", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({}, 401))
    .mockResolvedValueOnce(reply({ google: false, guest: false }));
  vi.stubGlobal("fetch", withoutGuest(request));
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
  vi.stubGlobal("fetch", withoutGuest(request));
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
  vi.stubGlobal("fetch", withoutGuest(request));
  mount();
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  act(() => current.accept(session));
  await act(async () => resolve(reply({ google: true, guest: false })));
  expect(state().status).toBe("active-member");
  expect(request).toHaveBeenCalledTimes(2);
});

it("returns socket handshake proof only from active memory and never public state or storage", async () => {
  const storage = vi.spyOn(Storage.prototype, "setItem");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(session)));
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  const first = await current.getRealtimeProof();
  expect(first).toEqual({
    kind: "member",
    accessToken: session.access_token,
    appSession: session.appSession,
  });
  memberProof(first).accessToken = "mutated caller copy";
  expect(memberProof(await current.getRealtimeProof()).accessToken).toBe(
    session.access_token,
  );
  expect(JSON.stringify(state())).not.toContain(session.access_token);
  expect(
    storage.mock.calls.every(
      ([key, value]) => key === "xiangqi.tab" && /^[a-f0-9-]{36}$/.test(value),
    ),
  ).toBe(true);
  await act(async () => {
    current.accept({ kind: "pending", expiresAt: "2030-01-01T00:00:00Z" });
  });
  await expect(current.getRealtimeProof()).rejects.toThrow();
});

it("accepts a renamed username on refresh while preserving the capability, deadline and account", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply(session))
    .mockResolvedValueOnce(reply({ ...session, username: "TenMoi" }));
  vi.stubGlobal("fetch", request);
  mount();
  await vi.waitFor(() => expect(state().status).toBe("active-member"));
  await act(async () => current.refresh());
  expect(state()).toMatchObject({
    username: "TenMoi",
    userId: session.userId,
    expiresAt: session.expiresAt,
  });
  expect(memberProof(await current.getRealtimeProof()).appSession).toBe(
    session.appSession,
  );
});
it("refreshes an expired socket bearer once and rejects unavailable or fixed-expired proof", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T00:00:00Z"));
  const request = vi
    .fn()
    .mockResolvedValueOnce(reply({ ...session, expires_in: 1 }))
    .mockResolvedValue(reply({ ...session, access_token: "renewed-socket" }));
  vi.stubGlobal("fetch", request);
  mount();
  await act(async () => {});
  vi.setSystemTime(new Date("2026-10-11T00:00:02Z"));
  let proofs!: Awaited<ReturnType<typeof current.getRealtimeProof>>[];
  await act(async () => {
    proofs = await Promise.all([
      current.getRealtimeProof(),
      current.getRealtimeProof(),
    ]);
  });
  expect(request).toHaveBeenCalledTimes(2);
  expect(
    proofs.every(
      (proof) =>
        proof.kind === "member" && proof.accessToken === "renewed-socket",
    ),
  ).toBe(true);
  vi.setSystemTime(new Date(session.expiresAt));
  await expect(current.getRealtimeProof()).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(2);
});
