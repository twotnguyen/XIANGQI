import { createElement, StrictMode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  SessionProvider,
  useSession,
} from "@web/features/auth/SessionProvider.js";
import type { PublicRoomAuthProof } from "@xiangqi/shared";

// Narrows a proof to the member variant: a guest proof has no accessToken, so reading it is a failure.
export function memberProof(proof: PublicRoomAuthProof) {
  if (proof.kind !== "member") throw new Error("expected a member proof");
  return proof;
}
export const session = {
  access_token: "fixture-access",
  refresh_token: "fixture-refresh",
  appSession: "fixture-cap",
  userId: "fixture-user",
  username: "KyThu",
  expires_in: 3600,
  expiresAt: "2030-01-01T00:00:00.000Z",
  remember: true,
};
export const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
export let current: ReturnType<typeof useSession>;
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
export function mount(strict = false) {
  vi.stubGlobal("fetch", withEmailStatus(globalThis.fetch));
  return render(
    createElement(
      strict ? StrictMode : "div",
      null,
      createElement(SessionProvider, null, createElement(Probe)),
    ),
  );
}
export const state = () =>
  JSON.parse(screen.getByLabelText("state").textContent!);
// Member-only fixtures have no guest cookie: answer the guest restore 401 so
// the sequenced member responses are consumed only by member requests.
export function withoutGuest(
  inner: (url: string, init?: RequestInit) => Promise<Response>,
) {
  return vi.fn((url: string, init?: RequestInit) =>
    new URL(url).pathname === "/api/account/guest/session"
      ? Promise.resolve(reply({ code: "AUTH_REQUIRED" }, 401))
      : inner(url, init),
  );
}
export const verifiedEmail = {
  email: "kythu@example.invalid",
  emailVerified: true,
  pendingEmail: null,
  expiresAt: null,
  resendAt: null,
};
// Answers GET /account/email from a fixture so member call counts stay unchanged.
export const email = {
  reply: () => reply(verifiedEmail),
  calls: [] as { url: string; init?: RequestInit }[],
};
function withEmailStatus(inner: typeof fetch) {
  return vi.fn((url: string | URL | Request, init?: RequestInit) => {
    if (!String(url).endsWith("/account/email")) return inner(url, init);
    email.calls.push({ url: String(url), init });
    return Promise.resolve(email.reply());
  });
}
export function resetSession() {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  email.calls = [];
  email.reply = () => reply(verifiedEmail);
}
