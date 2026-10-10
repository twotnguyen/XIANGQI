import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SessionState =
  | { status: "checking" }
  | { status: "anonymous" }
  | {
      status: "active-member";
      userId: string;
      username: string;
      expiresAt: string;
      remember: boolean;
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
}
const SessionContext = createContext<SessionContextValue | null>(null);
const unavailable = "Chưa thể xác thực phiên đăng nhập. Vui lòng thử lại.";
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
function backend(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
    throw new Error(unavailable);
  const base = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}${path}`;
}
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "checking" });
  const credentials = useRef<Credentials | null>(null);
  const mounted = useRef(false);
  const epoch = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const refreshing = useRef<Promise<void> | null>(null);
  const loggingOut = useRef<Promise<void> | null>(null);
  const renewal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => {});
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
    if (mounted.current) setState({ status: "anonymous" });
  }, [clearTimers, invalidateRequest]);
  const install = useCallback(
    (result: SessionResult) => {
      clearTimers();
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
      const result = parse(value);
      invalidateRequest();
      loggingOut.current = null;
      install(result);
    },
    [install, invalidateRequest],
  );
  const refresh = useCallback(() => {
    if (loggingOut.current) return Promise.resolve();
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
        if (!credentials.current)
          setState({ status: "error", message: unavailable });
        else {
          if (renewal.current !== null) clearTimeout(renewal.current);
          renewal.current = setTimeout(() => void refreshRef.current(), 15000);
        }
      }
    })().finally(() => {
      if (refreshing.current === pending) refreshing.current = null;
    });
    refreshing.current = pending;
    return pending;
  }, [anonymous, install, invalidateRequest]);
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
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      invalidateRequest();
      loggingOut.current = null;
      clearTimers();
      credentials.current = null;
    };
  }, [clearTimers, invalidateRequest, refresh]);
  return (
    <SessionContext.Provider
      value={{ state, accept, refresh, logout, authorizedFetch }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is required");
  return context;
}
