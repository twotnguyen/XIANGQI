import { useEffect, useRef, useState, type ReactNode } from "react";
import type { RoomSnapshot } from "@xiangqi/shared";
import { parsePosition } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "../components/XiangqiBoard.js";
import { Button, ErrorState, Notice, Skeleton } from "../ui/primitives.js";
import {
  connectRoom,
  RoomRequestError,
  type RoomClient,
  type RoomConnection,
  type RoomConnectionInput,
  type RoomView,
} from "./room-client.js";
import { createGameAudio } from "./game-audio.js";
import { MatchClocks } from "./MatchClocks.js";
import { MatchResult } from "./MatchResult.js";
import { RoomSettings } from "./RoomSettings.js";
import { ReconnectStatus } from "./ReconnectStatus.js";
import "./rooms.css";
export interface RoomPageProps {
  roomId: string;
  userId: string;
  client: RoomClient;
  getProof: RoomConnectionInput["getProof"];
  inviteCode?: string;
  onLeft: (message?: string) => void;
  connect?: (input: RoomConnectionInput) => RoomConnection;
  chat?: ReactNode;
  media?: ReactNode;
}
export function RoomPage({
  roomId,
  userId,
  client,
  getProof,
  inviteCode,
  onLeft,
  connect = connectRoom,
  chat,
  media,
}: RoomPageProps) {
  const [view, setView] = useState<RoomView | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [dismissedResult, setDismissedResult] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const settingsPending = useRef(false);
  const connection = useRef<RoomConnection | null>(null);
  const epoch = useRef(0);
  const refreshEpoch = useRef(0);
  const versionFloor = useRef(0);
  const latest = useRef<RoomSnapshot | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const commandPending = useRef(false);
  const commandEpoch = useRef(0);
  const connectedRef = useRef(false);
  const audioBaseline = useRef(true);
  const gameAudio = useRef<ReturnType<typeof createGameAudio> | null>(null);
  const [muted, setMuted] = useState(false);
  const leaveCallback = useRef(onLeft);
  leaveCallback.current = onLeft;
  function invalidateCommands() {
    commandEpoch.current++;
    if (commandPending.current) setBusy(false);
    commandPending.current = false;
  }
  function acceptSnapshot(value: RoomSnapshot) {
    const prior = latest.current;
    if (
      !connectedRef.current ||
      value.roomId !== roomId ||
      value.version < versionFloor.current ||
      (prior &&
        (value.version < prior.version ||
          value.control.generation < prior.control.generation ||
          (value.version === prior.version &&
            Date.parse(value.serverNow) < Date.parse(prior.serverNow))))
    )
      return false;
    if (
      prior &&
      (prior.match?.id !== value.match?.id ||
        prior.role !== value.role ||
        prior.control.generation !== value.control.generation ||
        prior.control.mode !== value.control.mode)
    )
      invalidateCommands();
    // A duplicate authoritative sample must not refund local elapsed time.
    if (
      prior?.clocks &&
      value.clocks &&
      prior.clocks.asOf === value.clocks.asOf &&
      prior.clocks.redMs === value.clocks.redMs &&
      prior.clocks.blackMs === value.clocks.blackMs &&
      prior.clocks.running === value.clocks.running
    )
      value = { ...value, clocks: prior.clocks };
    gameAudio.current?.accept(audioBaseline.current ? null : prior, value);
    audioBaseline.current = false;
    versionFloor.current = value.version;
    if (prior?.match?.status === "ACTIVE" && value.match?.status !== "ACTIVE")
      setSettingsOpen(false);
    latest.current = value;
    setSnapshot(value);
    setView(value);
    return true;
  }
  useEffect(() => {
    let alive = true;
    epoch.current++;
    latest.current = null;
    versionFloor.current = 0;
    setBusy(false);
    commandPending.current = false;
    audioBaseline.current = true;
    setSnapshot(null);
    setView(null);
    connectedRef.current = false;
    setConnected(false);
    setError("");
    void client.snapshot(roomId).then(
      (value) => {
        if (alive && !latest.current && value.version >= versionFloor.current) {
          versionFloor.current = value.version;
          setView(value);
        }
      },
      () => {
        if (alive && !latest.current)
          setError("Chưa thể tải phòng. Kiểm tra quyền vào phòng và kết nối.");
      },
    );
    const peer = connect({
      roomId,
      getProof,
      onSnapshot: (value) => {
        if (alive && acceptSnapshot(value)) setError("");
      },
      onConnection: (value) => {
        if (alive) {
          refreshEpoch.current++;
          connectedRef.current = value;
          setConnected(value);
          if (!value) {
            invalidateCommands();
            audioBaseline.current = true;
            setSnapshot(null);
          }
        }
      },
      onError: (message) => {
        if (alive) setError(message);
      },
      onClosed: (message) => {
        if (alive) leaveCallback.current(message);
      },
    });
    connection.current = peer;
    const refreshVisible = () => {
      if (
        document.visibilityState !== "visible" ||
        !connectedRef.current ||
        !alive
      )
        return;
      const requestEpoch = ++refreshEpoch.current;
      const matchId = latest.current?.match?.id;
      const isCurrent = () =>
        alive &&
        connectedRef.current &&
        connection.current === peer &&
        refreshEpoch.current === requestEpoch &&
        latest.current?.match?.id === matchId;
      void peer.refresh().then(
        (value) => {
          if (isCurrent() && acceptSnapshot(value)) setError("");
        },
        () => {
          if (isCurrent())
            setError("Chưa thể đồng bộ đồng hồ. Kiểm tra kết nối rồi thử lại.");
        },
      );
    };
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      alive = false;
      refreshEpoch.current++;
      document.removeEventListener("visibilitychange", refreshVisible);
      epoch.current++;
      commandEpoch.current++;
      connectedRef.current = false;
      peer.close();
      if (connection.current === peer) connection.current = null;
    };
  }, [roomId, client, getProof, connect, retry]);
  useEffect(() => {
    const playback = createGameAudio();
    gameAudio.current = playback;
    setMuted(playback.muted);
    return () => {
      playback.close();
      if (gameAudio.current === playback) gameAudio.current = null;
      void audio.current?.close();
      audio.current = null;
    };
  }, []);
  function unlockAudio() {
    void gameAudio.current?.unlock();
    if (muted) return;
    try {
      if (!audio.current && typeof AudioContext !== "undefined")
        audio.current = new AudioContext();
      void audio.current?.resume();
    } catch {
      /* Browser permissions may prevent audio. Visual count remains. */
    }
  }
  function sound() {
    const context = audio.current;
    if (muted || !context || context.state !== "running") return;
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  }
  async function ready() {
    if (
      !snapshot ||
      snapshot.version < versionFloor.current ||
      !connected ||
      !connectedRef.current ||
      busy ||
      commandPending.current ||
      snapshot.role === "spectator" ||
      snapshot.control.mode !== "writable" ||
      snapshot.room.status !== "WAITING"
    )
      return;
    const requestEpoch = epoch.current;
    const requestCommandEpoch = ++commandEpoch.current;
    const matchId = latest.current?.match?.id;
    const isCurrent = () =>
      epoch.current === requestEpoch &&
      commandEpoch.current === requestCommandEpoch &&
      connectedRef.current &&
      latest.current?.match?.id === matchId;
    commandPending.current = true;
    unlockAudio();
    setBusy(true);
    setError("");
    try {
      const acknowledgement = await connection.current!.command(
        {
          type: "room.ready",
          payload: { ready: !snapshot.room.ready[snapshot.role] },
        },
        snapshot.version,
      );
      if (!isCurrent()) return;
      if (acknowledgement.snapshot) acceptSnapshot(acknowledgement.snapshot);
      if (acknowledgement.status === "error")
        setError(
          acknowledgement.error.code === "VERSION_STALE"
            ? "Phòng đã thay đổi. Kiểm tra trạng thái mới rồi thử lại."
            : "Chưa thể thay đổi Sẵn sàng. Kiểm tra kết nối, ghế và quyền điều khiển.",
        );
    } catch {
      if (isCurrent())
        setError(
          "Chưa nhận được xác nhận Sẵn sàng. Kiểm tra trạng thái phòng trước khi thao tác lại.",
        );
    } finally {
      if (isCurrent()) {
        commandPending.current = false;
        setBusy(false);
      }
    }
  }
  async function move(from: number, to: number) {
    const current = latest.current;
    if (
      !current?.match ||
      current.version < versionFloor.current ||
      !connected ||
      !connectedRef.current ||
      busy ||
      commandPending.current ||
      current.role === "spectator" ||
      current.control.mode !== "writable" ||
      current.room.status !== "PLAYING" ||
      current.match.status !== "ACTIVE" ||
      current.role !== current.match.turn
    )
      return;
    const requestEpoch = epoch.current;
    const matchId = current.match.id;
    const requestCommandEpoch = ++commandEpoch.current;
    const isCurrent = () =>
      epoch.current === requestEpoch &&
      commandEpoch.current === requestCommandEpoch &&
      connectedRef.current &&
      latest.current?.match?.id === matchId;
    commandPending.current = true;
    unlockAudio();
    setBusy(true);
    setError("");
    try {
      const acknowledgement = await connection.current!.command(
        {
          type: "match.move",
          payload: { matchId, matchVersion: current.match.version, from, to },
        },
        current.version,
      );
      if (!isCurrent()) return;
      if (acknowledgement.snapshot) acceptSnapshot(acknowledgement.snapshot);
      if (acknowledgement.status === "error")
        setError(
          acknowledgement.error.code === "MATCH_VERSION_CONFLICT" ||
            acknowledgement.error.code === "VERSION_STALE"
            ? "Thế cờ đã thay đổi. Kiểm tra bàn cờ mới rồi thử lại."
            : acknowledgement.error.code === "MATCH_ILLEGAL_MOVE"
              ? "Nước đi không hợp lệ. Chọn lại quân và ô đích."
              : "Chưa thể đi cờ. Kiểm tra lượt, kết nối và quyền điều khiển.",
        );
    } catch {
      if (isCurrent())
        setError(
          "Chưa nhận được xác nhận nước đi. Kiểm tra bàn cờ máy chủ trước khi thao tác lại.",
        );
    } finally {
      if (isCurrent()) {
        commandPending.current = false;
        setBusy(false);
      }
    }
  }
  async function changeVisibility(visibility: RoomView["room"]["visibility"]) {
    const current = latest.current;
    if (
      !current ||
      !connectedRef.current ||
      current.room.hostId !== userId ||
      current.role === "spectator" ||
      busy ||
      settingsPending.current ||
      current.version < versionFloor.current
    )
      return;
    const requestEpoch = epoch.current;
    const physicalEpoch = refreshEpoch.current;
    const peer = connection.current;
    const isCurrent = () =>
      epoch.current === requestEpoch &&
      connectedRef.current &&
      connection.current === peer &&
      refreshEpoch.current === physicalEpoch;
    settingsPending.current = true;
    setBusy(true);
    setSettingsError("");
    setSettingsStatus("");
    try {
      const next = await client.changeVisibility(
        roomId,
        current.version,
        visibility,
      );
      if (
        !isCurrent() ||
        latest.current?.room.hostId !== userId ||
        next.version < versionFloor.current
      )
        return;
      versionFloor.current = next.version;
      setView(next);
      setSettingsStatus("Đã cập nhật chế độ phòng.");
      if (peer) {
        try {
          const fresh = await peer.refresh();
          if (isCurrent()) acceptSnapshot(fresh);
        } catch {
          if (isCurrent())
            setSettingsError(
              "Chế độ đã lưu. Chưa thể đồng bộ phòng; kiểm tra kết nối.",
            );
        }
      }
    } catch (e) {
      if (!isCurrent()) return;
      setSettingsError(
        e instanceof RoomRequestError
          ? e.message
          : "Chưa thể đổi chế độ phòng. Kiểm tra trạng thái mới rồi thử lại.",
      );
      if (peer) {
        try {
          const fresh = await peer.refresh();
          if (isCurrent()) acceptSnapshot(fresh);
        } catch {
          /* Keep the last canonical state. */
        }
      }
    } finally {
      settingsPending.current = false;
      if (epoch.current === requestEpoch) setBusy(false);
    }
  }
  async function httpAction(action: "switch" | "leave") {
    if (!view || busy) return;
    const requestEpoch = epoch.current;
    setBusy(true);
    setError("");
    setLeaveError("");
    try {
      if (action === "leave") {
        await client.leave(roomId, view.version);
        if (epoch.current === requestEpoch) onLeft();
      } else {
        const next = await client.switchSeat(roomId, view.version);
        if (
          epoch.current === requestEpoch &&
          next.version >= versionFloor.current
        ) {
          versionFloor.current = next.version;
          setView(next);
          setSnapshot(null);
        }
      }
    } catch (e) {
      if (epoch.current !== requestEpoch) return;
      const message =
        e instanceof RoomRequestError
          ? e.message
          : "Thao tác chưa thực hiện được. Kiểm tra trạng thái phòng rồi thử lại.";
      setError(message);
      if (action === "leave") setLeaveError(message);
      if (e instanceof RoomRequestError && e.code === "VERSION_STALE") {
        try {
          const next = await client.snapshot(roomId);
          if (
            epoch.current === requestEpoch &&
            next.version >= versionFloor.current
          ) {
            versionFloor.current = next.version;
            setView(next);
            const current = latest.current;
            if (
              action === "leave" &&
              current?.match &&
              current.match.status !== "ACTIVE"
            ) {
              // A failed leave must retain the final board and result while
              // a fresh control-bearing snapshot catches up with the HTTP CAS.
              const peer = connection.current;
              if (connectedRef.current && peer) {
                const freshEpoch = refreshEpoch.current;
                const fresh = await peer.refresh();
                if (
                  epoch.current === requestEpoch &&
                  connection.current === peer &&
                  refreshEpoch.current === freshEpoch
                )
                  acceptSnapshot(fresh);
              }
            } else setSnapshot(null);
          }
        } catch {
          /* Preserve the last authoritative state. */
        }
      }
    } finally {
      if (epoch.current === requestEpoch) setBusy(false);
    }
  }
  if (!view)
    return (
      <main className="xq-ui xq-room-page">
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => setRetry((value) => value + 1)}
          />
        ) : (
          <Skeleton label="Đang tải phòng…" />
        )}
      </main>
    );
  const { room } = view;
  const serverCode = room.inviteCode;
  const code = serverCode === undefined ? inviteCode : serverCode;
  const player = view.role !== "spectator";
  const writable =
    connected &&
    snapshot?.control.mode === "writable" &&
    snapshot.version >= versionFloor.current;
  const canManage =
    connected &&
    Boolean(snapshot) &&
    room.hostId === userId &&
    view.role !== "spectator";
  const solo =
    Number(Boolean(room.seats.red)) + Number(Boolean(room.seats.black)) === 1;
  const clockState = snapshot ?? latest.current;
  const playingLayout = Boolean(clockState?.match);
  const active =
    room.status === "PLAYING" && snapshot?.match?.status === "ACTIVE";
  let board = null;
  if (snapshot?.match) {
    try {
      board = parsePosition(snapshot.match.position);
    } catch {
      /* Do not fabricate a board from malformed server data. */
    }
  }
  return (
    <main className={`xq-ui xq-room-page${playingLayout ? " is-playing" : ""}`}>
      <header className="xq-room-header">
        <div>
          <h1>{room.name}</h1>
          <p>
            {room.status === "CLOSED"
              ? "Phòng đã đóng"
              : clockState?.match?.status === "ACTIVE"
                ? "Ván cờ đang diễn ra"
                : "Phòng chờ thi đấu"}
          </p>
        </div>
        <div className="xq-room-header-actions">
          {canManage && (
            <Button
              variant="ghost"
              onClick={() => {
                setSettingsError("");
                setSettingsStatus("");
                setSettingsOpen(true);
              }}
            >
              Cài đặt phòng
            </Button>
          )}
          {active && (
            <Button
              variant="ghost"
              onClick={() => {
                const nextMuted = gameAudio.current?.toggle() ?? false;
                setMuted(nextMuted);
                if (nextMuted) {
                  void audio.current?.close();
                  audio.current = null;
                } else unlockAudio();
              }}
              aria-pressed={muted}
            >
              {muted ? "Bật âm thanh" : "Tắt âm thanh"}
            </Button>
          )}
          <Button
            variant="ghost"
            loading={busy}
            onClick={() => void httpAction("leave")}
          >
            Rời phòng
          </Button>
        </div>
      </header>
      <div className="xq-room-content">
        <section className="xq-room-arena" aria-label="Ghế và trạng thái phòng">
          {error && <Notice tone="error" message={error} />}
          <ReconnectStatus
            connected={connected}
            waitingForSnapshot={connected && !snapshot}
            ownRole={clockState?.role ?? view.role}
            matchStatus={clockState?.match?.status ?? null}
            opponentGraceUntil={
              view.role === "spectator"
                ? (Object.values(room.graceUntil)
                    .filter((value): value is string => value !== null)
                    .sort()[0] ?? null)
                : room.graceUntil[view.role === "red" ? "black" : "red"]
            }
            serverNow={view.serverNow}
          />
          {snapshot?.control.mode === "readonly" && (
            <Notice
              message={
                snapshot.control.reason === "superseded"
                  ? "Phiên này đã được mở ở tab khác. Tab hiện tại chỉ xem."
                  : "Bạn đang xem phòng."
              }
            />
          )}
          <div className="xq-room-seats">
            {(["red", "black"] as const).map((side) => {
              const occupant = room.seats[side],
                label = side === "red" ? "Đỏ" : "Đen";
              return (
                <section
                  className={`xq-room-seat ${side}`}
                  key={side}
                  aria-label={`Ghế ${label}`}
                >
                  <span className="xq-seat-piece" aria-hidden="true">
                    {side === "red" ? "帥" : "將"}
                  </span>
                  <h2>
                    {occupant
                      ? occupant === userId
                        ? `Bạn · ${label}`
                        : `Người chơi ${label}${occupant === room.hostId ? " · Chủ phòng" : ""}`
                      : `Ghế ${label} đang trống`}
                  </h2>
                  {occupant === userId && occupant === room.hostId && (
                    <p>Chủ phòng</p>
                  )}
                  <p>
                    {!occupant
                      ? "Đang chờ kỳ hữu"
                      : !room.connected[side]
                        ? "Mất kết nối · đang giữ ghế"
                        : room.ready[side]
                          ? "Đã sẵn sàng"
                          : "Chưa sẵn sàng"}
                  </p>
                </section>
              );
            })}
          </div>
          {clockState?.clocks && (
            <MatchClocks
              clocks={clockState.clocks}
              matchStatus={clockState.match?.status ?? null}
              connected={connected}
            />
          )}
          {connected &&
            snapshot &&
            room.countdown &&
            room.status === "WAITING" && (
              <Countdown
                key={room.countdown.token}
                dueAt={room.countdown.dueAt}
                serverNow={view.serverNow}
                sound={sound}
              />
            )}
          {board && (
            <div className="xq-room-board" aria-label="Bàn cờ đang thi đấu">
              <XiangqiBoard
                position={board}
                orientation={view.role === "black" ? "black" : "red"}
                playerSide={view.role === "black" ? "black" : "red"}
                disabled={
                  !active ||
                  !writable ||
                  !player ||
                  snapshot?.match?.turn !== view.role
                }
                pending={busy}
                lastMove={snapshot?.match?.lastMove ?? null}
                onMove={(from, to) => void move(from, to)}
              />
            </div>
          )}
          {active && !board && (
            <Notice
              tone="error"
              message="Chưa thể hiển thị bàn cờ từ trạng thái máy chủ."
            />
          )}
          {room.status === "WAITING" &&
            snapshot?.match &&
            snapshot.match.status !== "ACTIVE" && (
              <Notice
                message={
                  snapshot.match.status === "INTERRUPTED"
                    ? "Ván vừa gián đoạn. Hai bên có thể Sẵn sàng cho ván mới."
                    : "Ván đã kết thúc. Hai bên có thể Sẵn sàng cho ván mới."
                }
              />
            )}
          {room.status === "WAITING" && player && (
            <div className="xq-room-actions">
              <Button
                loading={busy}
                disabledReason={
                  !writable
                    ? "Cần kết nối và quyền điều khiển ghế."
                    : !room.seats.red || !room.seats.black
                      ? "Chờ đủ hai người chơi để Sẵn sàng."
                      : undefined
                }
                onClick={() => void ready()}
              >
                {room.ready[view.role as "red" | "black"]
                  ? "Huỷ sẵn sàng"
                  : "Sẵn sàng"}
              </Button>
              {solo && room.hostId === userId && (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển ghế."
                      : undefined
                  }
                  onClick={() => void httpAction("switch")}
                >
                  Đổi ghế
                </Button>
              )}
            </div>
          )}
          {view.role === "spectator" && (
            <p>Bạn đang xem. Chỉ người ngồi ghế mới có thể Sẵn sàng.</p>
          )}
        </section>
        <aside className="xq-room-info" aria-label="Thông tin phòng">
          <h2>Phòng của kỳ hữu</h2>
          <dl>
            <dt>Mỗi bên</dt>
            <dd>{room.timeMinutes} phút</dd>
            <dt>Người xem tối đa</dt>
            <dd>{room.viewerLimit}</dd>
            <dt>Chế độ</dt>
            <dd>
              {room.visibility === "CODE_ONLY"
                ? "Theo mã mời"
                : room.visibility === "PUBLIC"
                  ? "Công khai"
                  : "Đã khóa"}
            </dd>
          </dl>
          <p>Thời gian và trần người xem đã cố định.</p>
          {code && room.visibility !== "LOCKED" ? (
            <>
              <p>
                Mã phòng: <strong>{code}</strong>
              </p>
              <a href={`/rooms/join?token=${encodeURIComponent(code)}`}>
                Đường dẫn mời vào phòng
              </a>
            </>
          ) : (
            <p>Mã mời chưa được cung cấp cho phiên này.</p>
          )}
          <div className="xq-room-slots">
            {chat ?? <p>Chat phòng chưa khả dụng.</p>}
            {media ?? <p>Camera và mic chưa khả dụng.</p>}
          </div>
        </aside>
      </div>
      <RoomSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        room={room}
        canManage={canManage}
        busy={busy}
        error={settingsError}
        status={settingsStatus}
        onChange={changeVisibility}
      />
      {connected &&
        snapshot?.match &&
        snapshot.match.status !== "ACTIVE" &&
        (snapshot.role === "spectator" ||
          dismissedResult !== snapshot.match.id) && (
          <MatchResult
            match={snapshot.match}
            role={snapshot.role}
            leaving={busy}
            error={leaveError}
            onStay={() => {
              setDismissedResult(snapshot.match!.id);
              setLeaveError("");
            }}
            onLeave={() => void httpAction("leave")}
          />
        )}
    </main>
  );
}
function Countdown({
  dueAt,
  serverNow,
  sound,
}: {
  dueAt: string;
  serverNow: string;
  sound: () => void;
}) {
  const [count, setCount] = useState(() =>
    Math.max(
      0,
      Math.min(
        3,
        Math.ceil((Date.parse(dueAt) - Date.parse(serverNow)) / 1000),
      ),
    ),
  );
  const sounded = useRef<number | null>(null);
  const play = useRef(sound);
  play.current = sound;
  useEffect(() => {
    const received = Date.now(),
      remaining = Date.parse(dueAt) - Date.parse(serverNow);
    function update() {
      setCount(
        Math.max(
          0,
          Math.min(3, Math.ceil((remaining - (Date.now() - received)) / 1000)),
        ),
      );
    }
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [dueAt, serverNow]);
  useEffect(() => {
    if (count > 0 && sounded.current !== count) {
      sounded.current = count;
      play.current();
    }
  }, [count]);
  return (
    <div
      className="xq-room-countdown"
      role="status"
      aria-label="Đếm ngược bắt đầu ván"
    >
      {count > 0 ? (
        <>
          <p>Hai bên đã sẵn sàng</p>
          <strong>{count}</strong>
        </>
      ) : (
        <p>Đang chờ máy chủ xác nhận bắt đầu…</p>
      )}
    </div>
  );
}
