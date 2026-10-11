import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { Button, Dialog, ErrorState, Notice } from "../ui/primitives.js";
import { NavigationLink } from "./NavigationLink.js";
import {
  getLocation,
  navigate,
  subscribeLocation,
  getAuthDestination,
} from "./navigation.js";
import { CreateRoomForm } from "../rooms/RoomForms.js";
import { RoomPage } from "../rooms/RoomPage.js";
import { InviteEntry } from "../rooms/InviteEntry.js";
import {
  createRoomClient,
  type RoomClient,
  type RoomEntry,
} from "../rooms/room-client.js";
import {
  makePublicRoomClient,
  connectPublicRooms,
  PublicRoomRequestError,
} from "../rooms/public-room-client.js";
import type { PublicRoomView } from "@xiangqi/shared";
import { guardRoute, resolveRoute, type Route } from "./routes.js";
import { HistoryPage } from "../history/HistoryPage.js";
import { makeHistoryClient } from "../history/history-client.js";
import { ReplayPage } from "../history/ReplayPage.js";
import { makeReplayClient } from "../history/replay-client.js";

function Lobby({
  client,
  onEntered,
}: {
  client: RoomClient;
  onEntered: (entry: RoomEntry) => void;
}) {
  const { authorizedFetch, logout, getRealtimeProof } = useSession();
  const publicClient = useMemo(
    () => makePublicRoomClient(authorizedFetch),
    [authorizedFetch],
  );
  const epoch = useRef(0),
    connectionRevision = useRef(0),
    ready = useRef(false);
  const canonical = useRef<PublicRoomView[]>([]);
  const joinPending = useRef<{ epoch: number; revision: number } | null>(null);
  const [admissionReady, setAdmissionReady] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [state, setState] = useState<DataState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [dialog, setDialog] = useState(false);
  useEffect(() => {
    const generation = ++epoch.current;
    let alive = true,
      feedSeen = false;
    const current = () => alive && epoch.current === generation;
    ready.current = false;
    canonical.current = [];
    joinPending.current = null;
    setAdmissionReady(false);
    setJoiningRoomId(null);
    setRooms([]);
    setState("loading");
    const accept = (rows: PublicRoomView[]) => {
      canonical.current = rows;
      setRooms(
        rows.map((row) => ({
          id: row.roomId,
          name: row.name,
          hostName: row.host.displayName,
          hostGuest: row.host.isGuest,
          timeMinutes: row.timeMinutes as PublicRoom["timeMinutes"],
          status: row.status,
          seats: (2 - row.emptySeats) as PublicRoom["seats"],
          viewers: row.spectators,
          spectatorLimit: row.viewerLimit,
          canPlay: row.canPlay,
          canWatch: row.canWatch,
        })),
      );
      setState(rows.length ? "success" : "empty");
    };
    void publicClient.list().then(
      (rows) => {
        if (current() && !feedSeen) accept(rows);
      },
      () => {
        if (current() && !feedSeen) {
          setRooms([]);
          setState("error");
        }
      },
    );
    const feed = connectPublicRooms({
      getProof: async () => {
        const proof = await getRealtimeProof();
        return {
          kind: "member",
          accessToken: proof.accessToken,
          appSession: proof.appSession,
        };
      },
      onRooms: (rows) => {
        if (current()) {
          feedSeen = true;
          accept(rows);
        }
      },
      onConnection: (value) => {
        if (!current()) return;
        if (!value) connectionRevision.current++;
        ready.current = value;
        setAdmissionReady(value);
      },
      onError: () => {
        if (!current()) return;
        feedSeen = true;
        ready.current = false;
        setAdmissionReady(false);
        canonical.current = [];
        setRooms([]);
        setState("error");
      },
    });
    return () => {
      alive = false;
      epoch.current++;
      ready.current = false;
      feed.close();
    };
  }, [attempt, publicClient, getRealtimeProof]);
  const join = async (id: string, intent: "player" | "spectator") => {
    const row = canonical.current.find((row) => row.roomId === id);
    if (
      joinPending.current ||
      !ready.current ||
      !row ||
      !(intent === "player" ? row.canPlay : row.canWatch)
    )
      return;
    const request = {
      epoch: epoch.current,
      revision: connectionRevision.current,
    };
    joinPending.current = request;
    setJoiningRoomId(id);
    setNotice("");
    try {
      const entry = await publicClient.join(
        id,
        intent === "player" ? "play" : "watch",
      );
      if (
        joinPending.current === request &&
        epoch.current === request.epoch &&
        ready.current &&
        connectionRevision.current === request.revision
      )
        onEntered(entry);
    } catch (error) {
      if (joinPending.current === request && epoch.current === request.epoch) {
        setNotice(
          error instanceof PublicRoomRequestError
            ? error.message
            : "Chưa thể vào phòng. Vui lòng thử lại.",
        );
        setAttempt((value) => value + 1);
      }
    } finally {
      if (joinPending.current === request && epoch.current === request.epoch) {
        joinPending.current = null;
        setJoiningRoomId(null);
      }
    }
  };
  const unavailable = () =>
    setNotice("Chức năng này hiện chưa khả dụng. Vui lòng quay lại sau.");
  return (
    <>
      {notice && <Notice tone="error" message={notice} />}
      <LobbyShell
        rooms={rooms}
        state={state}
        onCreate={() => setDialog(true)}
        onJoinCode={(code) =>
          navigate(`/rooms/join?token=${encodeURIComponent(code)}`)
        }
        onPlayAI={unavailable}
        admissionReady={admissionReady}
        joiningRoomId={joiningRoomId}
        onJoinRoom={(id, intent) => void join(id, intent)}
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {dialog && (
        <Dialog open onClose={() => setDialog(false)} title="Tạo phòng">
          <CreateRoomForm
            onCreate={async (input) => onEntered(await client.create(input))}
          />
        </Dialog>
      )}
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
  history: "Lịch sử ván đấu",
  replay: "Xem lại ván đấu",
  "access-denied": "Không thể truy cập",
};
export function AppRouter() {
  const session = useSession();
  const client = useMemo(
    () => createRoomClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const historyClient = useMemo(
    () => makeHistoryClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const replayClient = useMemo(
    () => makeReplayClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const [roomNotice, setRoomNotice] = useState("");
  const enterRoom = (entry: RoomEntry) => {
    setRoomNotice(entry.notice ?? "");
    navigate(`/rooms/${entry.roomId}`);
  };
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
    content = (
      <Lobby key={session.state.userId} client={client} onEntered={enterRoom} />
    );
  else if (route.name === "join" && session.state.status === "active-member")
    content = (
      <InviteEntry client={client} onEntered={enterRoom} code={route.token} />
    );
  else if (route.name === "history" && session.state.status === "active-member")
    content = (
      <HistoryPage
        key={`${session.state.userId}:${session.state.expiresAt}`}
        client={historyClient}
        onReplay={(id) => navigate(`/history/${id}`)}
      />
    );
  else if (route.name === "replay" && session.state.status === "active-member")
    content = (
      <ReplayPage
        key={`${session.state.userId}:${session.state.expiresAt}:${route.id}`}
        client={replayClient}
        id={route.id}
      />
    );
  else if (route.name === "room" && session.state.status === "active-member")
    content =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        route.id,
      ) ? (
        <RoomPage
          key={`${session.state.userId}:${route.id}`}
          roomId={route.id}
          userId={session.state.userId}
          client={client}
          getProof={session.getRealtimeProof}
          onLeft={(message) => {
            setRoomNotice(message ?? "");
            navigate("/lobby");
          }}
        />
      ) : (
        <section>
          <h1>Phòng cờ</h1>
          <p>Định danh phòng không hợp lệ.</p>
          <NavigationLink href="/lobby">Quay về Sảnh</NavigationLink>
        </section>
      );
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
      {roomNotice && session.state.status === "active-member" && (
        <Notice message={roomNotice} onDismiss={() => setRoomNotice("")} />
      )}
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
