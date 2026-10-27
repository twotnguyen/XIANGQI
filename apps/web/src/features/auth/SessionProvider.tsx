import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  googleAvailable,
  googleRequest,
  GoogleRequestError,
  parseGooglePending,
  type GooglePending,
} from "./google-gis.js";
import type { PublicRoomAuthProof } from "@xiangqi/shared";

export type SessionState =
  | { status: "checking" }
  | { status: "anonymous" }
  | ({ status: "pending"; method: "google" } & Omit<GooglePending, "kind">)
  | {
      status: "active-member";
      userId: string;
      username: string;
      expiresAt: string;
      remember: boolean;
    }
  | {
      status: "guest";
      userId: string;
      displayName: string;
      expiresAt: string;
      deferred: boolean;
    }
  | { status: "error"; message: string };
interface SessionResult {
  access_token: string;
  refresh_token: string;
  appSession: string;
  userId: string;
  username: string;
  expires_in: number;
  expiresAt: string;
  remember: boolean;
}
interface Credentials {
  bearer: string;
  capability: string;
  bearerExpiresAt: number;
  member: Extract<SessionState, { status: "active-member" }>;
}
interface SessionContextValue {
  state: SessionState;
  accept(result: unknown): void;
  refresh(): Promise<void>;
  logout(): Promise<void>;
  authorizedFetch(path: string, init?: RequestInit): Promise<Response>;
  getRealtimeProof(): Promise<PublicRoomAuthProof>;
  startGuest(displayName: string, signal?: AbortSignal): Promise<void>;
  logoutGuest(confirmedResign: boolean): Promise<void>;
  guestFetch(path: string, init?: RequestInit): Promise<Response>;
  sessionFetch(path: string, init?: RequestInit): Promise<Response>;
}
const SessionContext = createContext<SessionContextValue | null>(null);
const unavailable = "Chưa thể xác thực phiên đăng nhập. Vui lòng thử lại.";
const guestMinDelayMs = 1000;
const guestRetryMs = 30000;
function parse(value: unknown): SessionResult {
  if (!value || typeof value !== "object") throw new Error(unavailable);
  const result = value as Record<string, unknown>;
  if (
    ![
      "access_token",
      "refresh_token",
      "appSession",
      "userId",
      "username",
    ].every(
      (key) => typeof result[key] === "string" && result[key].length > 0,
    ) ||
    typeof result.expires_in !== "number" ||
    !Number.isFinite(result.expires_in) ||
    result.expires_in <= 0 ||
    typeof result.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(result.expiresAt)) ||
    Date.parse(result.expiresAt) <= Date.now() ||
    typeof result.remember !== "boolean"
  )
    throw new Error(unavailable);
  return value as SessionResult;
}

interface GuestRecord {
  capability: string;
  state: Extract<SessionState, { status: "guest" }>;
}
function parseGuest(value: unknown): GuestRecord {
  const result = value as Record<string, unknown> | null;
  if (
    !result ||
    typeof result !== "object" ||
    result.kind !== "guest" ||
    typeof result.userId !== "string" ||
    typeof result.displayName !== "string" ||
    typeof result.capability !== "string" ||
    result.capability.length === 0 ||
    typeof result.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(result.expiresAt)) ||
    typeof result.deferred !== "boolean"
  )
    throw new Error(unavailable);
  return {
    capability: result.capability,
    state: {
      status: "guest",
      userId: result.userId,
      displayName: result.displayName,
      expiresAt: result.expiresAt,
      deferred: result.deferred,
    },
  };
}
/** Lỗi guest có mã máy đọc được (ví dụ GUEST_NAME_INVALID), không chứa nội dung thô từ server. */
export class GuestRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}
async function readCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: unknown };
    return typeof body.code === "string" ? body.code : "UNAVAILABLE";
  } catch {
    return "UNAVAILABLE";
  }
}
import { getApiBaseUrl } from "../../shared/api.js";

function backend(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
    throw new Error(unavailable);
  const base = getApiBaseUrl();
  return `${base}${path}`;
}
/**
 * Context Provider quản lý vòng đời phiên đăng nhập toàn cục, tự động làm mới token và cung cấp hàm gọi API có xác thực.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "checking" });
  const credentials = useRef<Credentials | null>(null);
  const guestRef = useRef<GuestRecord | null>(null);
  const pendingGoogle = useRef<GooglePending | null>(null);
  const mounted = useRef(false);
  const epoch = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const refreshing = useRef<Promise<void> | null>(null);
  const loggingOut = useRef<Promise<void> | null>(null);
  const renewal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const recheckRef = useRef<(guest: GuestRecord) => Promise<void>>(
    async () => {},
  );
  const clearTimers = useCallback(() => {
    if (renewal.current !== null) clearTimeout(renewal.current);
    if (deadline.current !== null) clearTimeout(deadline.current);
    renewal.current = deadline.current = null;
  }, []);
  const invalidateRequest = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    refreshing.current = null;
    return ++epoch.current;
  }, []);
  const anonymous = useCallback(() => {
    invalidateRequest();
    loggingOut.current = null;
    clearTimers();
    credentials.current = null;
    guestRef.current = null;
    pendingGoogle.current = null;
    if (mounted.current) setState({ status: "anonymous" });
  }, [clearTimers, invalidateRequest]);
  const install = useCallback(
    (result: SessionResult) => {
      clearTimers();
      guestRef.current = null;
      pendingGoogle.current = null;
      const record: Credentials = {
        bearer: result.access_token,
        capability: result.appSession,
        bearerExpiresAt: Date.now() + result.expires_in * 1000,
        member: {
          status: "active-member",
          userId: result.userId,
          username: result.username,
          expiresAt: result.expiresAt,
          remember: result.remember,
        },
      };
      credentials.current = record;
      if (mounted.current) setState(record.member);
      const expire = () => {
        if (credentials.current !== record) return;
        const remaining = Date.parse(record.member.expiresAt) - Date.now();
        if (remaining <= 0) anonymous();
        else
          deadline.current = setTimeout(
            expire,
            Math.min(remaining, 2147483647),
          );
      };
      expire();
      const lifetime = result.expires_in * 1000;
      renewal.current = setTimeout(
        () => {
          if (credentials.current === record) void refreshRef.current();
        },
        Math.min(lifetime - Math.min(30000, lifetime / 2), 2147483647),
      );
    },
    [anonymous, clearTimers],
  );
  const accept = useCallback(
    (value: unknown) => {
      if ((value as { kind?: unknown })?.kind === "pending") {
        const pending = parseGooglePending(
          value,
          typeof (value as { email?: unknown }).email === "string",
        );
        invalidateRequest();
        loggingOut.current = null;
        clearTimers();
        credentials.current = null;
        guestRef.current = null;
        pendingGoogle.current = pending;
        setState({
          status: "pending",
          method: "google",
          expiresAt: pending.expiresAt,
          recovering: pending.recovering,
          ...(pending.email
            ? { email: pending.email, avatar: pending.avatar }
            : {}),
        });
        return;
      }
      const result = parse(value);
      invalidateRequest();
      loggingOut.current = null;
      install(result);
    },
    [clearTimers, install, invalidateRequest],
  );
  const armGuest = useCallback(
    (guest: GuestRecord, delay?: number) => {
      clearTimers();
      const remaining = Date.parse(guest.state.expiresAt) - Date.now();
      // Hết hạn phía client chỉ là lúc hỏi lại server; server quyết định phiên còn sống (ván đang chơi có thể giữ phiên quá hạn).
      deadline.current = setTimeout(
        () => {
          if (guestRef.current === guest) void recheckRef.current(guest);
        },
        delay ??
          (remaining > 0
            ? Math.max(guestMinDelayMs, Math.min(remaining, 2147483647))
            : guestRetryMs),
      );
    },
    [clearTimers],
  );
  const installGuest = useCallback(
    (guest: GuestRecord) => {
      pendingGoogle.current = null;
      credentials.current = null;
      guestRef.current = guest;
      armGuest(guest);
      if (mounted.current) setState(guest.state);
    },
    [armGuest],
  );
  const isLive = useCallback(
    (requestEpoch: number, signal: AbortSignal) =>
      !signal.aborted && mounted.current && epoch.current === requestEpoch,
    [],
  );
  // Trả false khi cookie Khách không còn (401); lỗi khác ném ra để refresh báo lỗi tạm thời, không xóa phiên.
  const restoreGuest = useCallback(
    async (requestEpoch: number, signal: AbortSignal): Promise<boolean> => {
      const response = await fetch(backend("/account/guest/session"), {
        credentials: "include",
        redirect: "error",
        cache: "no-store",
        signal,
      });
      if (!isLive(requestEpoch, signal)) return true;
      if (response.status === 401) return false;
      if (!response.ok) throw new Error(unavailable);
      const guest = parseGuest(await response.json());
      if (!isLive(requestEpoch, signal)) return true;
      installGuest(guest);
      return true;
    },
    [installGuest, isLive],
  );
  const recheckGuest = useCallback(
    async (guest: GuestRecord) => {
      if (loggingOut.current || guestRef.current !== guest) return;
      const requestEpoch = invalidateRequest();
      const abort = new AbortController();
      controller.current = abort;
      try {
        const response = await fetch(backend("/account/guest/session"), {
          credentials: "include",
          redirect: "error",
          cache: "no-store",
          signal: abort.signal,
        });
        if (!isLive(requestEpoch, abort.signal) || guestRef.current !== guest)
          return;
        if (response.status === 401) {
          anonymous();
          return;
        }
        if (!response.ok) throw new Error(unavailable);
        const next = parseGuest(await response.json());
        if (!isLive(requestEpoch, abort.signal) || guestRef.current !== guest)
          return;
        installGuest(next);
      } catch {
        if (!isLive(requestEpoch, abort.signal) || guestRef.current !== guest)
          return;
        armGuest(guest, guestRetryMs);
      }
    },
    [anonymous, armGuest, invalidateRequest, installGuest, isLive],
  );
  recheckRef.current = recheckGuest;
  const refresh = useCallback(() => {
    if (loggingOut.current || guestRef.current) return Promise.resolve();
    if (refreshing.current) return refreshing.current;
    const pending = (async () => {
      const previous = credentials.current;
      if (previous && Date.parse(previous.member.expiresAt) <= Date.now()) {
        anonymous();
        return;
      }
      const requestEpoch = invalidateRequest();
      const abort = new AbortController();
      controller.current = abort;
      try {
        const response = await fetch(backend("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          redirect: "error",
          signal: abort.signal,
        });
        if (
          abort.signal.aborted ||
          !mounted.current ||
          epoch.current !== requestEpoch
        )
          return;
        if (response.status === 401) {
          if (!previous && (await restoreGuest(requestEpoch, abort.signal)))
            return;
          if (!previous) {
            const enabled = await googleAvailable(abort.signal);
            if (
              abort.signal.aborted ||
              !mounted.current ||
              epoch.current !== requestEpoch
            )
              return;
            if (enabled) {
              let google: GooglePending;
              try {
                google = parseGooglePending(
                  await googleRequest("onboarding", undefined, abort.signal),
                  true,
                );
              } catch (e) {
                if (e instanceof GoogleRequestError && e.status === 401) {
                  if (
                    !abort.signal.aborted &&
                    mounted.current &&
                    epoch.current === requestEpoch
                  )
                    anonymous();
                  return;
                }
                throw e;
              }
              if (
                abort.signal.aborted ||
                !mounted.current ||
                epoch.current !== requestEpoch
              )
                return;
              pendingGoogle.current = google;
              setState({
                status: "pending",
                method: "google",
                expiresAt: google.expiresAt,
                recovering: google.recovering,
                email: google.email,
                avatar: google.avatar,
              });
              return;
            }
          }
          anonymous();
          return;
        }
        if (!response.ok) throw new Error(unavailable);
        const result = parse(await response.json());
        if (
          abort.signal.aborted ||
          !mounted.current ||
          epoch.current !== requestEpoch
        )
          return;
        if (
          previous &&
          (result.userId !== previous.member.userId ||
            result.username !== previous.member.username ||
            result.appSession !== previous.capability ||
            result.expiresAt !== previous.member.expiresAt ||
            result.remember !== previous.member.remember)
        )
          throw new Error(unavailable);
        install(result);
      } catch {
        if (
          abort.signal.aborted ||
          !mounted.current ||
          epoch.current !== requestEpoch
        )
          return;
        if (!credentials.current && !pendingGoogle.current)
          setState({ status: "error", message: unavailable });
        else if (credentials.current) {
          if (renewal.current !== null) clearTimeout(renewal.current);
          renewal.current = setTimeout(() => void refreshRef.current(), 15000);
        }
      }
    })().finally(() => {
      if (refreshing.current === pending) refreshing.current = null;
    });
    refreshing.current = pending;
    return pending;
  }, [anonymous, install, invalidateRequest, restoreGuest]);
  refreshRef.current = refresh;
  const logout = useCallback(() => {
    if (loggingOut.current) return loggingOut.current;
    const initial = credentials.current;
    if (!initial) return Promise.resolve();
    if (renewal.current !== null) clearTimeout(renewal.current);
    renewal.current = null;
    let pending: Promise<void> | null = null;
    pending = (async () => {
      try {
        if (initial.bearerExpiresAt <= Date.now()) await refresh();
        else await Promise.resolve();
        if (loggingOut.current !== pending || !mounted.current) return;
        const record = credentials.current;
        if (!record) return;
        if (record.bearerExpiresAt <= Date.now()) throw new Error(unavailable);
        if (renewal.current !== null) clearTimeout(renewal.current);
        renewal.current = null;
        const requestEpoch = invalidateRequest();
        const abort = new AbortController();
        controller.current = abort;
        const response = await fetch(backend("/auth/logout"), {
          method: "POST",
          credentials: "include",
          redirect: "error",
          headers: {
            Authorization: `Bearer ${record.bearer}`,
            "X-Xiangqi-Session": record.capability,
          },
          signal: abort.signal,
        });
        if (
          abort.signal.aborted ||
          !mounted.current ||
          epoch.current !== requestEpoch
        )
          return;
        if (!response.ok) throw new Error(unavailable);
        anonymous();
      } catch {
        if (mounted.current && loggingOut.current === pending) {
          if (renewal.current !== null) clearTimeout(renewal.current);
          renewal.current = setTimeout(() => void refreshRef.current(), 15000);
          throw new Error(unavailable);
        }
      }
    })().finally(() => {
      if (loggingOut.current === pending) loggingOut.current = null;
    });
    loggingOut.current = pending;
    return pending;
  }, [anonymous, invalidateRequest, refresh]);
  const getRealtimeProof =
    useCallback(async (): Promise<PublicRoomAuthProof> => {
      if (!mounted.current || loggingOut.current) throw new Error(unavailable);
      const guest = guestRef.current;
      if (guest) return { kind: "guest", guestCapability: guest.capability };
      const previous = credentials.current;
      if (!previous || Date.parse(previous.member.expiresAt) <= Date.now())
        throw new Error(unavailable);
      if (previous.bearerExpiresAt <= Date.now()) await refresh();
      const record = credentials.current;
      if (
        !record ||
        loggingOut.current ||
        !mounted.current ||
        Date.parse(record.member.expiresAt) <= Date.now() ||
        record.bearerExpiresAt <= Date.now()
      )
        throw new Error(unavailable);
      return {
        kind: "member",
        accessToken: record.bearer,
        appSession: record.capability,
      };
    }, [refresh]);
  const authorizedFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const url = backend(path);
      if (loggingOut.current) throw new Error(unavailable);
      if (
        credentials.current &&
        credentials.current.bearerExpiresAt <= Date.now()
      )
        await refresh();
      if (loggingOut.current) throw new Error(unavailable);
      const record = credentials.current;
      if (
        !record ||
        Date.parse(record.member.expiresAt) <= Date.now() ||
        record.bearerExpiresAt <= Date.now()
      )
        throw new Error(unavailable);
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${record.bearer}`);
      headers.set("X-Xiangqi-Session", record.capability);
      const response = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
        redirect: "error",
      });
      if (response.status === 401 && credentials.current === record)
        anonymous();
      return response;
    },
    [anonymous, refresh],
  );
  const guestFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const url = backend(path);
      const guest = guestRef.current;
      if (!guest || loggingOut.current) throw new Error(unavailable);
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Guest ${guest.capability}`);
      const response = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
        redirect: "error",
      });
      if (response.status === 401 && guestRef.current === guest) anonymous();
      return response;
    },
    [anonymous],
  );
  const sessionFetch = useCallback(
    (path: string, init?: RequestInit) =>
      guestRef.current ? guestFetch(path, init) : authorizedFetch(path, init),
    [authorizedFetch, guestFetch],
  );
  const startGuest = useCallback(
    async (displayName: string, signal?: AbortSignal) => {
      if (loggingOut.current) throw new Error(unavailable);
      const requestEpoch = invalidateRequest();
      // Không gắn signal vào fetch: phiên vừa tạo phải về đủ để thu hồi nếu đã bị hủy.
      const response = await fetch(backend("/account/guest"), {
        method: "POST",
        credentials: "include",
        redirect: "error",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!response.ok)
        throw new GuestRequestError(response.status, await readCode(response));
      const guest = parseGuest(await response.json());
      if (
        signal?.aborted ||
        !mounted.current ||
        epoch.current !== requestEpoch
      ) {
        // Đã hủy hoặc đã đổi phiên trong lúc chờ: thu hồi Khách vừa tạo, không cài.
        void fetch(backend("/account/guest/logout"), {
          method: "POST",
          credentials: "include",
          redirect: "error",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Guest ${guest.capability}`,
          },
          body: JSON.stringify({ confirmedResign: false }),
        }).catch(() => undefined);
        return;
      }
      installGuest(guest);
    },
    [installGuest, invalidateRequest],
  );
  const logoutGuest = useCallback(
    (confirmedResign: boolean): Promise<void> => {
      if (loggingOut.current) return loggingOut.current;
      const guest = guestRef.current;
      if (!guest) return Promise.resolve();
      invalidateRequest();
      const abort = new AbortController();
      controller.current = abort;
      let pending: Promise<void> | null = null;
      pending = (async () => {
        try {
          const response = await fetch(backend("/account/guest/logout"), {
            method: "POST",
            credentials: "include",
            redirect: "error",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Guest ${guest.capability}`,
            },
            body: JSON.stringify({ confirmedResign }),
            signal: abort.signal,
          });
          if (response.status === 409)
            throw new GuestRequestError(409, await readCode(response));
          if (!response.ok && response.status !== 401)
            throw new Error(unavailable);
          if (guestRef.current === guest) anonymous();
        } catch (failure) {
          // Đăng xuất lỗi thì giữ phiên Khách và hẹn kiểm tra lại, không xóa phiên.
          if (
            mounted.current &&
            guestRef.current === guest &&
            loggingOut.current === pending
          )
            armGuest(guest, guestRetryMs);
          throw failure;
        }
      })().finally(() => {
        if (loggingOut.current === pending) loggingOut.current = null;
      });
      loggingOut.current = pending;
      return pending;
    },
    [anonymous, armGuest, invalidateRequest],
  );
  useEffect(() => {
    mounted.current = true;
    const lifecycleEpoch = epoch.current;
    queueMicrotask(() => {
      if (mounted.current && epoch.current === lifecycleEpoch) void refresh();
    });
    return () => {
      mounted.current = false;
      invalidateRequest();
      loggingOut.current = null;
      clearTimers();
      credentials.current = null;
      guestRef.current = null;
      pendingGoogle.current = null;
    };
  }, [clearTimers, invalidateRequest, refresh]);
  return (
    <SessionContext.Provider
      value={{
        state,
        accept,
        refresh,
        logout,
        authorizedFetch,
        getRealtimeProof,
        startGuest,
        logoutGuest,
        guestFetch,
        sessionFetch,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
/**
 * Hook truy xuất thông tin phiên đăng nhập hiện tại và các hàm điều phối xác thực (fetch, logout, refresh).
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is required");
  return context;
}
