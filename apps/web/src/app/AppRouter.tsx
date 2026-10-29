import { EmailVerification } from "../features/profile/EmailVerification.js";
import { EmailStatusBanner } from "../features/profile/EmailStatusBanner.js";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
  GuestRequestError,
  LogoutConfirmRequired,
  useSession,
} from "../features/auth/SessionProvider.js";
import { GuestNameDialog } from "../features/auth/GuestNameDialog.js";
import { AppShell } from "./layouts/AppShell.js";
import { P2ScopePage } from "./P2ScopePage.js";
import {
  LobbyShell,
  type DataState,
  type PublicRoom,
} from "../features/lobby/LobbyShell.js";
import {
  Button,
  Dialog,
  ErrorState,
  LoadingScreen,
  Notice,
} from "../shared/ui/primitives.js";
import { NavigationLink } from "../shared/navigation/NavigationLink.js";
import {
  getLocation,
  navigate,
  subscribeLocation,
  getAuthDestination,
} from "../shared/navigation/navigation.js";
import { FriendsBell } from "../features/friends/FriendsBell.js";
import { RoomInvitePopup } from "../features/friends/RoomInvitePopup.js";
import { createFriendClient } from "../features/friends/friend-client.js";
import {
  createRoomClient,
  type RoomClient,
  type RoomEntry,
} from "../features/rooms/room-client.js";
import {
  makePublicRoomClient,
  connectPublicRooms,
  PublicRoomRequestError,
} from "../features/rooms/public-room-client.js";
import type { PublicRoomView } from "@xiangqi/shared";
import { createMediaClient } from "../features/media/media-client.js";
import { createProfileClient } from "../features/profile/profile-client.js";
import type { ProfileLocation } from "../features/profile/profile-client.js";
import {
  guardRoute,
  resolveRoute,
  type Route,
} from "../shared/navigation/routes.js";
import { makeHistoryClient } from "../features/history/history-client.js";

// Keep non-current feature graphs out of the session/lobby bootstrap.
const LoginPage = lazy(() =>
  import("../features/auth/LoginPage.js").then((module) => ({
    default: module.LoginPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../features/auth/ForgotPasswordPage.js").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/ResetPasswordPage.js").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const RegistrationPage = lazy(() =>
  import("../features/auth/RegistrationPage.js").then((module) => ({
    default: module.RegistrationPage,
  })),
);
const GoogleSignInButton = lazy(() =>
  import("../features/auth/GoogleSignInButton.js").then((module) => ({
    default: module.GoogleSignInButton,
  })),
);
const GoogleOnboardingPage = lazy(() =>
  import("../features/auth/GoogleOnboardingPage.js").then((module) => ({
    default: module.GoogleOnboardingPage,
  })),
);
const CreateRoomForm = lazy(() =>
  import("../features/rooms/RoomForms.js").then((module) => ({
    default: module.CreateRoomForm,
  })),
);
const loadRoomPage = () =>
  import("../features/rooms/RoomPage.js").then((module) => ({
    default: module.RoomPage,
  }));
const RoomPage = lazy(loadRoomPage);
const InviteEntry = lazy(() =>
  import("../features/rooms/InviteEntry.js").then((module) => ({
    default: module.InviteEntry,
  })),
);
const FriendsPage = lazy(() =>
  import("../features/friends/FriendsPage.js").then((module) => ({
    default: module.FriendsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../features/profile/ProfilePage.js").then((module) => ({
    default: module.ProfilePage,
  })),
);
const AiSetupDialog = lazy(() =>
  import("../features/ai/AiSetupDialog.js").then((module) => ({
    default: module.AiSetupDialog,
  })),
);
const AiGamePage = lazy(() =>
  import("../features/ai/AiGamePage.js").then((module) => ({
    default: module.AiGamePage,
  })),
);
const HistoryPage = lazy(() =>
  import("../features/history/HistoryPage.js").then((module) => ({
    default: module.HistoryPage,
  })),
);
const ReplayRoute = lazy(() =>
  import("../features/history/ReplayPage.js").then((module) => ({
    default: module.ReplayRoute,
  })),
);

/**
 * Component bọc nội dung route để hỗ trợ trợ năng, tự động focus vào thẻ heading h1 khi chuyển trang.
 */
function RouteContent({
  children,
  container,
}: {
  children: ReactNode;
  container: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const heading = container.current?.querySelector<HTMLHeadingElement>("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [container]);
  return children;
}

/**
 * Component hiển thị giao diện Sảnh chính, kết nối luồng phòng chơi realtime, tạo phòng và ghép ván.
 */
function Lobby({
  client,
  onEntered,
  blockedReason,
  banner,
  requestLogout,
  performLogout,
}: {
  client: RoomClient;
  onEntered: (entry: RoomEntry) => void;
  blockedReason?: string;
  banner?: ReactNode;
  requestLogout: (run: (confirmedResign: boolean) => Promise<void>) => void;
  performLogout: (confirmedResign: boolean) => Promise<void>;
}) {
  const { sessionFetch, getRealtimeProof } = useSession();
  const publicClient = useMemo(
    () => makePublicRoomClient(sessionFetch),
    [sessionFetch],
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
  const [aiDialog, setAiDialog] = useState(false);
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
    queueMicrotask(() => {
      if (!current()) return;
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
    });
    const feed = connectPublicRooms({
      getProof: getRealtimeProof,
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
  return (
    <>
      {banner}
      {notice && <Notice tone="error" message={notice} />}
      <LobbyShell
        rooms={rooms}
        state={state}
        onCreate={() => {
          void loadRoomPage().catch(() => undefined);
          setDialog(true);
        }}
        onJoinCode={(code) =>
          navigate(`/rooms/join?token=${encodeURIComponent(code)}`)
        }
        onPlayAI={() => setAiDialog(true)}
        admissionReady={admissionReady}
        joiningRoomId={joiningRoomId}
        blockedReason={blockedReason}
        onJoinRoom={(id, intent) => void join(id, intent)}
        onRetry={() => setAttempt((value) => value + 1)}
      />
      {dialog && (
        <Dialog open onClose={() => setDialog(false)} title="Tạo phòng">
          <Suspense fallback={<p role="status">Đang tải biểu mẫu…</p>}>
            <CreateRoomForm
              onCreate={async (input) => onEntered(await client.create(input))}
            />
          </Suspense>
        </Dialog>
      )}
      {aiDialog && (
        <Suspense
          fallback={
            <Dialog
              open
              onClose={() => setAiDialog(false)}
              title="Thiết lập ván với máy"
            >
              <p role="status">Đang tải thiết lập…</p>
            </Dialog>
          }
        >
          <AiSetupDialog
            open={aiDialog}
            onClose={() => setAiDialog(false)}
            onStart={async (selection) => {
              // Lazy by design: the AI page chunk must not join the lobby bundle.
              const { startAiGame } =
                await import("../features/ai/AiGamePage.js");
              const gameId = await startAiGame(
                sessionFetch,
                getRealtimeProof,
                selection,
              );
              setAiDialog(false);
              navigate(`/ai/${gameId}`);
            }}
          />
        </Suspense>
      )}
      <Button
        variant="ghost"
        loading={loggingOut}
        onClick={() => {
          if (loggingOut) return;
          requestLogout(async (confirmedResign) => {
            setLoggingOut(true);
            try {
              await performLogout(confirmedResign);
            } finally {
              setLoggingOut(false);
            }
          });
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
  settings: "Cài đặt",
  history: "Lịch sử ván đấu",
  replay: "Xem lại ván đấu",
  "access-denied": "Không thể truy cập",
  "forgot-password": "Quên mật khẩu",
  "reset-password": "Đặt lại mật khẩu",
  leaderboard: "Bảng xếp hạng",
};
/**
 * Component điều hướng chính của ứng dụng web, kiểm soát phân quyền route, điều hướng URL và kết nối layout chung.
 */
export function AppRouter() {
  const session = useSession();
  const client = useMemo(
    () => createRoomClient(session.sessionFetch),
    [session.sessionFetch],
  );
  const mediaClient = useMemo(
    () => createMediaClient(session.sessionFetch),
    [session.sessionFetch],
  );
  const friendClient = useMemo(
    () => createFriendClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const historyClient = useMemo(
    () => makeHistoryClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const profileClient = useMemo(
    () => createProfileClient(session.authorizedFetch),
    [session.authorizedFetch],
  );
  const [profileName, setProfileName] = useState<string | null>(null);
  const [where, setWhere] = useState<ProfileLocation | null>(null);
  useEffect(() => {
    if (session.state.status !== "active-member") {
      setProfileName(null);
      setWhere(null);
      return;
    }
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      void profileClient.read().then(
        (view) => {
          if (alive) setProfileName(view.displayName);
        },
        () => undefined,
      );
    });
    return () => {
      alive = false;
    };
  }, [profileClient, session.state.status]);
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
  const [logoutGate, setLogoutGate] = useState<{
    gameId: string;
    run: (confirmedResign: boolean) => Promise<void>;
  } | null>(null);
  const [onlineLogout, setOnlineLogout] = useState<{
    run: (confirmedResign: boolean) => Promise<void>;
  } | null>(null);
  // Người đang đăng nhập (member hoặc Khách) dưới dạng tham chiếu đã thu hẹp để đọc userId an toàn.
  const actor =
    session.state.status === "active-member" || session.state.status === "guest"
      ? session.state
      : null;
  const signedIn = actor !== null;
  const shellUser =
    session.state.status === "guest"
      ? { displayName: session.state.displayName, guest: true }
      : session.state.status === "active-member"
        ? { displayName: profileName ?? session.state.username, guest: false }
        : null;
  const [guestDialog, setGuestDialog] = useState(false);
  const [guestResign, setGuestResign] = useState(false);
  // Ván AI đang mở (route /ai/:id hoặc vị trí đang chơi dở) cần đầu hàng trước khi đăng xuất.
  const aiGameId =
    route.name === "ai"
      ? route.id
      : where?.kind === "playing-ai"
        ? (where.matchId ?? null)
        : null;
  const logoutGuestSession = (confirmedResign: boolean) =>
    session.logoutGuest(confirmedResign).catch((failure: unknown) => {
      if (
        !confirmedResign &&
        failure instanceof GuestRequestError &&
        failure.code === "GUEST_RESIGN_CONFIRM_REQUIRED"
      )
        setGuestResign(true);
      else setRoomNotice("Chưa thể đăng xuất. Vui lòng thử lại.");
    });
  const performSessionLogout = (confirmedResign: boolean): Promise<void> => {
    pending.current = null;
    if (session.state.status === "guest")
      return logoutGuestSession(confirmedResign);
    return session.logout(confirmedResign).catch((failure: unknown) => {
      if (!confirmedResign && failure instanceof LogoutConfirmRequired)
        setOnlineLogout({ run: performSessionLogout });
      else setRoomNotice("Chưa thể đăng xuất. Vui lòng thử lại.");
    });
  };
  const guardedLogout = (run: (confirmedResign: boolean) => Promise<void>) => {
    if (aiGameId) setLogoutGate({ gameId: aiGameId, run });
    else if (where?.kind === "playing-online") setOnlineLogout({ run });
    else void run(false);
  };
  const confirmLogoutGate = async () => {
    const gate = logoutGate;
    if (!gate) return;
    try {
      // Lazy by design (như startAiGame): chunk AI không được vào bundle sảnh.
      const { resignActiveAiGame } =
        await import("../features/ai/AiGamePage.js");
      await resignActiveAiGame(
        session.sessionFetch,
        session.getRealtimeProof,
        gate.gameId,
      );
    } catch {
      setLogoutGate(null);
      setRoomNotice("Chưa thể đầu hàng ván đang chơi. Vui lòng thử lại.");
      return;
    }
    setLogoutGate(null);
    await gate.run(false);
  };
  const title = titles[route.name] || "Chức năng đang chuẩn bị";
  useEffect(() => subscribeLocation(() => setLocation(getLocation())), []);
  useEffect(() => {
    if (route.name === "room") void loadRoomPage().catch(() => undefined);
  }, [route.name]);
  useEffect(() => {
    if (session.state.status !== "active-member") return;
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      void profileClient.location().then(
        (value) => {
          if (alive) setWhere(value);
        },
        () => undefined,
      );
    });
    return () => {
      alive = false;
    };
  }, [profileClient, session.state.status, location.pathname]);
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
  }, [location.pathname, location.search, decision.kind, title]);
  const complete = (result: unknown) => {
    session.accept(result);
    // Thiết bị mới vừa thay ghế cũ: không giữ lời mời đang chờ, về lobby.
    const displaced = (result as { displaced?: unknown })?.displaced === true;
    const destination =
      !displaced && pending.current ? pending.current : "/lobby";
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
      <LoadingScreen
        title="Kiểm tra phiên"
        message="Đang kiểm tra phiên đăng nhập…"
      />
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
      <>
        <LoginPage
          onLoggedIn={complete}
          onGuest={() => setGuestDialog(true)}
          renderGoogle={(remember, disabled, onBusyChange) => (
            <GoogleSignInButton
              remember={remember}
              disabled={disabled}
              onResult={googleResult}
              onBusyChange={onBusyChange}
            />
          )}
        />
        <GuestNameDialog
          open={guestDialog}
          onClose={() => setGuestDialog(false)}
        />
      </>
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
  else if (route.name === "lobby" && actor)
    content = (
      <Lobby
        key={actor.userId}
        client={client}
        onEntered={enterRoom}
        requestLogout={guardedLogout}
        performLogout={performSessionLogout}
        blockedReason={
          where && where.kind !== "none"
            ? "Bạn đang ở trong một ván/phòng khác."
            : undefined
        }
        banner={
          where && where.kind !== "none" ? (
            <section className="xq-rejoin-banner" role="status">
              <p>
                Bạn có ván đang chơi dở.{" "}
                <NavigationLink
                  href={
                    where.kind === "playing-ai" && where.matchId
                      ? `/ai/${where.matchId}`
                      : `/rooms/${where.roomId}`
                  }
                >
                  Quay lại
                </NavigationLink>
              </p>
            </section>
          ) : null
        }
      />
    );
  else if (route.name === "settings" && signedIn)
    content = (
      <ProfilePage
        client={profileClient}
        guest={session.state.status === "guest"}
        onSaved={setProfileName}
        onLogout={() => guardedLogout(performSessionLogout)}
        emailSection={
          session.state.status === "active-member" ? (
            <EmailVerification
              client={profileClient}
              emailStatus={session.emailStatus}
              reloadEmailStatus={session.reloadEmailStatus}
            />
          ) : undefined
        }
      />
    );
  else if (route.name === "join" && signedIn)
    content = (
      <InviteEntry client={client} onEntered={enterRoom} code={route.token} />
    );
  else if (route.name === "friends" && session.state.status === "active-member")
    content = <FriendsPage client={friendClient} />;
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
      <ReplayRoute
        key={`${session.state.userId}:${session.state.expiresAt}:${route.id}`}
        authorizedFetch={session.authorizedFetch}
        id={route.id}
      />
    );
  else if (route.name === "ai" && signedIn)
    content = (
      <AiGamePage
        key={route.id}
        gameId={route.id}
        authorizedFetch={session.sessionFetch}
        getProof={session.getRealtimeProof}
      />
    );
  else if (decision.kind === "access-denied")
    content = (
      <section className="xq-panel xq-stack">
        <h1>{title}</h1>
        <p>Phiên Khách không có quyền xem nội dung này.</p>
        <NavigationLink href="/login">Về trang đăng nhập</NavigationLink>
      </section>
    );
  else if (route.name === "forgot-password") content = <ForgotPasswordPage />;
  else if (route.name === "reset-password") content = <ResetPasswordPage />;
  else if (route.name === "leaderboard")
    content = (
      <P2ScopePage
        route="leaderboard"
        signedIn={session.state.status === "active-member"}
      />
    );
  else if (route.name === "room" && actor)
    content =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        route.id,
      ) ? (
        <RoomPage
          key={`${actor.userId}:${route.id}`}
          roomId={route.id}
          userId={actor.userId}
          client={client}
          getProof={session.getRealtimeProof}
          mediaClient={mediaClient}
          onLeft={(message) => {
            setRoomNotice(message ?? "");
            navigate("/lobby");
          }}
        />
      ) : (
        <section className="xq-panel xq-stack">
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
        <NavigationLink href={signedIn ? "/lobby" : "/login"}>
          {signedIn ? "Quay về Sảnh" : "Về trang đăng nhập"}
        </NavigationLink>
      </section>
    );
  const page = (
    <Suspense
      key={`${location.pathname}${location.search}:${decision.kind}`}
      fallback={
        <section className="xq-panel xq-stack" aria-busy="true">
          <h1>{title}</h1>
          <p role="status">Đang tải giao diện…</p>
        </section>
      }
    >
      <RouteContent container={container}>{content}</RouteContent>
    </Suspense>
  );
  return (
    <div ref={container} className="xq-ui">
      {roomNotice && signedIn && (
        <Notice message={roomNotice} onDismiss={() => setRoomNotice("")} />
      )}
      {shellUser && route.name !== "login" && route.name !== "register" ? (
        <AppShell
          title={title}
          active={location.pathname}
          user={shellUser}
          bell={
            session.state.status === "active-member" ? (
              <FriendsBell client={friendClient} />
            ) : undefined
          }
          onLogout={() => guardedLogout(performSessionLogout)}
        >
          {session.state.status === "active-member" && (
            <EmailStatusBanner
              status={session.emailStatus}
              reloadEmailStatus={session.reloadEmailStatus}
            />
          )}
          {page}
          {session.state.status === "active-member" && (
            <RoomInvitePopup client={friendClient} />
          )}
        </AppShell>
      ) : (
        page
      )}
      {logoutGate && (
        <Dialog
          open
          onClose={() => setLogoutGate(null)}
          title="Đăng xuất khi đang có ván?"
          danger
          onConfirm={() => void confirmLogoutGate()}
          confirmLabel="Đầu hàng và đăng xuất"
          cancelLabel="Ở lại"
        >
          <p>
            Đăng xuất sẽ được tính là đầu hàng và thua ván đang chơi với máy.
            Ván đấu với máy không thay đổi Elo.
          </p>
        </Dialog>
      )}
      {onlineLogout && (
        <Dialog
          open
          onClose={() => setOnlineLogout(null)}
          title="Đăng xuất khi đang có ván?"
          danger
          onConfirm={() => {
            const gate = onlineLogout;
            setOnlineLogout(null);
            void gate.run(true);
          }}
          confirmLabel="Đầu hàng và đăng xuất"
          cancelLabel="Ở lại"
        >
          <p>
            Đăng xuất sẽ được tính là đầu hàng và thua ván đang chơi trực tuyến.
          </p>
        </Dialog>
      )}
      {guestResign && (
        <Dialog
          open
          onClose={() => setGuestResign(false)}
          title="Đăng xuất sẽ xin thua ván đang chơi"
          danger
          onConfirm={() => {
            setGuestResign(false);
            void logoutGuestSession(true);
          }}
          confirmLabel="Xin thua và đăng xuất"
          cancelLabel="Ở lại"
        >
          <p>Ván đang chơi sẽ được tính là thua khi bạn đăng xuất.</p>
        </Dialog>
      )}
    </div>
  );
}
