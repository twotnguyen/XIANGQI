import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoginPage } from "../auth/LoginPage.js";
import { RegistrationPage } from "../auth/RegistrationPage.js";
import { GoogleSignInButton } from "../auth/GoogleSignInButton.js";
import { GoogleOnboardingPage } from "../auth/GoogleOnboardingPage.js";
import { useSession } from "../auth/SessionProvider.js";
import { AppShell } from "../layouts/AppShell.js";
import {
  LobbyShell,
  type DataState,
  type PublicRoom,
} from "../pages/LobbyShell.js";
import { Button, ErrorState, Notice } from "../ui/primitives.js";
import { NavigationLink } from "./NavigationLink.js";
import {
  getLocation,
  navigate,
  subscribeLocation,
  getAuthDestination,
} from "./navigation.js";
import { guardRoute, resolveRoute, type Route } from "./routes.js";

function publicRooms(value: unknown): PublicRoom[] {
  if (!value || typeof value !== "object")
    throw new Error("Invalid public rooms");
  const rooms = (value as { rooms?: unknown }).rooms;
  if (!Array.isArray(rooms) || rooms.length > 50)
    throw new Error("Invalid public rooms");
  const ids = new Set<string>();
  return rooms.map((value: unknown) => {
    if (!value || typeof value !== "object")
      throw new Error("Invalid public rooms");
    const room = value as Record<string, unknown>;
    if (
      !["id", "name", "hostName"].every(
        (key) => typeof room[key] === "string" && room[key].trim().length > 0,
      ) ||
      typeof room.id !== "string" ||
      /[/\\]/.test(room.id) ||
      Array.from(room.id).some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || code === 127;
      }) ||
      typeof room.hostGuest !== "boolean" ||
      ![5, 10, 15].includes(Number(room.timeMinutes)) ||
      typeof room.timeMinutes !== "number" ||
      typeof room.status !== "string" ||
      !["waiting", "playing"].includes(String(room.status)) ||
      ![0, 1, 2].includes(Number(room.seats)) ||
      typeof room.seats !== "number" ||
      !Number.isSafeInteger(room.viewers) ||
      !Number.isSafeInteger(room.spectatorLimit) ||
      Number(room.viewers) < 0 ||
      Number(room.spectatorLimit) < Number(room.viewers) ||
      ids.has(room.id)
    )
      throw new Error("Invalid public rooms");
    ids.add(room.id);
    return {
      id: room.id,
      name: room.name as string,
      hostName: room.hostName as string,
      hostGuest: room.hostGuest,
      timeMinutes: room.timeMinutes as PublicRoom["timeMinutes"],
      status: room.status as PublicRoom["status"],
      seats: room.seats as PublicRoom["seats"],
      viewers: room.viewers as number,
      spectatorLimit: room.spectatorLimit as number,
    };
  });
}
function Lobby() {
  const { authorizedFetch, logout } = useSession();
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [state, setState] = useState<DataState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    setState("loading");
    void (async () => {
      try {
        const response = await authorizedFetch("/rooms/public", {
          signal: abort.signal,
        });
        if (!response.ok) throw new Error("Rooms unavailable");
        const list = publicRooms(await response.json());
        if (abort.signal.aborted) return;
        setRooms(list);
        setState(list.length ? "success" : "empty");
      } catch {
        if (!abort.signal.aborted) {
          setRooms([]);
          setState("error");
        }
      }
    })();
    return () => abort.abort();
  }, [attempt, authorizedFetch]);
  const unavailable = () =>
    setNotice("Chức năng này hiện chưa khả dụng. Vui lòng quay lại sau.");
  return (
    <>
      {notice && <Notice tone="error" message={notice} />}
      <LobbyShell
        rooms={rooms}
        state={state}
        onCreate={unavailable}
        onJoinCode={unavailable}
        onPlayAI={unavailable}
        onJoinRoom={(id, intent) =>
          navigate(`/rooms/${encodeURIComponent(id)}?intent=${intent}`)
        }
        onRetry={() => setAttempt((value) => value + 1)}
      />
      <Button
        variant="ghost"
        loading={loggingOut}
        onClick={() => {
          if (loggingOut) return;
          setLoggingOut(true);
          void logout()
            .catch(() => setNotice("Chưa thể đăng xuất. Vui lòng thử lại."))
            .finally(() => setLoggingOut(false));
        }}
      >
        Đăng xuất
      </Button>
    </>
  );
}
const titles: Partial<Record<Route["name"], string>> = {
  login: "Đăng nhập",
  register: "Đăng ký",
  onboarding: "Thiết lập tài khoản",
  lobby: "Sảnh kỳ hữu",
  "not-found": "Không tìm thấy trang",
  room: "Phòng cờ",
  join: "Vào phòng",
  ai: "Đánh với máy",
  friends: "Bạn bè",
  settings: "Hồ sơ",
  "access-denied": "Không thể truy cập",
};
export function AppRouter() {
  const session = useSession();
  const [location, setLocation] = useState(getLocation);
  const pending = useRef<string | null>(getAuthDestination());
  const [googleFlow, setGoogleFlow] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const route = resolveRoute(location.pathname, location.search);
  const decision = guardRoute(route, session.state);
  const title = titles[route.name] || "Chức năng đang chuẩn bị";
  useEffect(() => subscribeLocation(() => setLocation(getLocation())), []);
  useEffect(() => {
    if (decision.kind !== "redirect") return;
    if (decision.preserveDestination && route.name !== "onboarding")
      pending.current = `${location.pathname}${location.search}`;
    const destination =
      decision.to === "/lobby" && pending.current
        ? pending.current
        : decision.to;
    if (destination === pending.current) pending.current = null;
    navigate(destination, { replace: true, authDestination: pending.current });
  }, [
    decision.kind,
    decision.kind === "redirect" ? decision.to : null,
    location.pathname,
    location.search,
    session.state.status,
  ]);
  useEffect(() => {
    document.title = `Cờ Tướng Online · ${title}`;
    const heading = container.current?.querySelector<HTMLHeadingElement>("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [location.pathname, location.search, decision.kind, title]);
  const complete = (result: unknown) => {
    session.accept(result);
    const destination = pending.current || "/lobby";
    pending.current = null;
    navigate(destination, { replace: true, authDestination: null });
  };
  const googleResult = (result: unknown) => {
    if ((result as { kind?: unknown })?.kind === "pending") {
      session.accept(result);
      setGoogleFlow((n) => n + 1);
      navigate("/onboarding", {
        replace: true,
        authDestination: pending.current,
      });
    } else complete(result);
  };
  let content: ReactNode;
  if (decision.kind === "checking" || decision.kind === "redirect")
    content = (
      <section>
        <h1>Kiểm tra phiên</h1>
        <p role="status">Đang kiểm tra phiên đăng nhập…</p>
      </section>
    );
  else if (decision.kind === "session-error")
    content = (
      <section>
        <h1>Phiên đăng nhập</h1>
        <ErrorState
          message="Chưa thể xác thực phiên đăng nhập. Vui lòng thử lại."
          onRetry={() => void session.refresh()}
        />
      </section>
    );
  else if (route.name === "login")
    content = (
      <LoginPage
        onLoggedIn={complete}
        renderGoogle={(remember, disabled, onBusyChange) => (
          <GoogleSignInButton
            remember={remember}
            disabled={disabled}
            onResult={googleResult}
            onBusyChange={onBusyChange}
          />
        )}
      />
    );
  else if (route.name === "register")
    content = (
      <RegistrationPage
        onRegistered={(result) => complete({ ...result, remember: true })}
        renderGoogle={(disabled, onBusyChange) => (
          <GoogleSignInButton
            remember={true}
            disabled={disabled}
            text="signup_with"
            onResult={googleResult}
            onBusyChange={onBusyChange}
          />
        )}
      />
    );
  else if (route.name === "onboarding" && session.state.status === "pending")
    content = (
      <GoogleOnboardingPage
        key={googleFlow}
        pending={{
          kind: "pending",
          expiresAt: session.state.expiresAt,
          recovering: session.state.recovering,
          email: session.state.email,
          avatar: session.state.avatar,
        }}
        onResult={googleResult}
      />
    );
  else if (route.name === "lobby" && session.state.status === "active-member")
    content = <Lobby key={session.state.userId} />;
  else
    content = (
      <section className="xq-panel xq-stack">
        <h1>{title}</h1>
        <p>
          {route.name === "not-found"
            ? "Đường dẫn này không tồn tại. Kiểm tra lại đường dẫn hoặc quay về trang chính."
            : route.name === "room" || route.name === "join"
              ? "Dịch vụ phòng cờ hiện chưa khả dụng; bạn chưa thể vào phòng lúc này."
              : "Chức năng này hiện chưa khả dụng. Vui lòng quay lại sau."}
        </p>
        <NavigationLink
          href={session.state.status === "active-member" ? "/lobby" : "/login"}
        >
          {session.state.status === "active-member"
            ? "Quay về Sảnh"
            : "Về trang đăng nhập"}
        </NavigationLink>
      </section>
    );
  return (
    <div ref={container} className="xq-ui">
      {session.state.status === "active-member" &&
      route.name !== "login" &&
      route.name !== "register" ? (
        <AppShell
          title={title}
          active={location.pathname}
          user={{ displayName: session.state.username, guest: false }}
        >
          {content}
        </AppShell>
      ) : (
        content
      )}
    </div>
  );
}
