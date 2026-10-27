import {
  useEffect,
  lazy,
  Suspense,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { parsePosition, playMove, type Position } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "../../shared/board/XiangqiBoard.js";
import {
  Button,
  Dialog,
  ErrorState,
  Notice,
  Skeleton,
} from "../../shared/ui/primitives.js";
import {
  connectRoom,
  RoomRequestError,
  type RoomClient,
  type RoomConnection,
  type RoomConnectionInput,
  type RoomView,
} from "./room-client.js";
import { useRoomConnection } from "./useRoomConnection.js";
import { createGameAudio, type GameAudio } from "./game-audio.js";
import { MatchClocks } from "./match/MatchClocks.js";
import { MatchResult } from "./match/MatchResult.js";
import { RoomSettings } from "./RoomSettings.js";
import { MatchActions, type MatchAction } from "./match/MatchActions.js";
import { ReconnectStatus } from "./match/ReconnectStatus.js";
import { SpectatorsPanel } from "./SpectatorsPanel.js";
import { Countdown } from "./RoomCountdown.js";
import { RoomDetails } from "./RoomDetails.js";
import { RoomInvite } from "./RoomInvite.js";
import { RoomSeats } from "./RoomSeats.js";
import {
  swapMessage,
  viewerActionMessage,
  visibilityLabel,
} from "./room-labels.js";

import { RoomChat } from "../chat/RoomChat.js";
import type { MediaClient } from "../media/media-client.js";
import { MediaSeats } from "../media/MediaSeats.js";
const LazyMediaPanel = lazy(() =>
  import("../media/MediaPanel.js").then((module) => ({
    default: module.MediaPanel,
  })),
);
import "./rooms.css";
// The HTTP snapshot is a display-only fallback while realtime establishes authority.

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
  mediaClient?: MediaClient;
}
/**
 * Trang phòng cờ trực tuyến: điều phối kết nối realtime, bàn cờ, đồng hồ đấu, ghế ngồi, video/audio và chat phòng.
 */
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
  mediaClient,
}: RoomPageProps) {
  const [dismissedResult, setDismissedResult] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState("");
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [swapNow, setSwapNow] = useState(() => Date.now());
  const settingsPending = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const gameAudio = useRef<GameAudio | null>(null);
  const [muted, setMuted] = useState(false);
  const {
    view,
    setView,
    snapshot,
    setSnapshot,
    connected,
    error,
    setError,
    retry,
    busy,
    setBusy,
    actionError,
    setActionError,
    optimistic,
    setOptimistic,
    roomChat,
    connection,
    connectedRef,
    epoch,
    refreshEpoch,
    versionFloor,
    latest,
    commandPending,
    commandEpoch,
    acceptSnapshot,
  } = useRoomConnection({
    roomId,
    client,
    getProof,
    connect,
    onLeft,
    gameAudio,
    onMatchEnded: () => {
      setSettingsOpen(false);
      setLeaveConfirm(null);
    },
  });
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
  const swapOfferId = view?.room.swapOffer?.id ?? null;
  useEffect(() => {
    if (!swapOfferId) return;
    setSwapNow(Date.now());
    const timer = setInterval(() => setSwapNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [swapOfferId]);
  async function copyInvite(value: string) {
    if (copying) return;
    setCopying(true);
    setCopyStatus("");
    try {
      if (!navigator.clipboard?.writeText) throw Error("clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setCopyStatus("Đã sao chép mã phòng.");
    } catch {
      setCopyStatus("Chưa sao chép được. Hãy chọn mã và sao chép thủ công.");
    } finally {
      setCopying(false);
    }
  }
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
    let nextBoard: Position | null = null;
    try {
      const currentBoard = parsePosition(current.match.position);
      nextBoard = playMove(currentBoard, { from, to });
    } catch {
      /* Nước đi không hợp lệ theo luật cờ */
    }
    if (nextBoard) {
      setOptimistic({
        position: nextBoard,
        lastMove: { from, to },
        matchVersion: current.match.version,
      });
      void gameAudio.current?.unlock();
    }
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
      if (acknowledgement.status === "error") {
        setOptimistic(null);
        setError(
          acknowledgement.error.code === "MATCH_VERSION_CONFLICT" ||
            acknowledgement.error.code === "VERSION_STALE"
            ? "Thế cờ đã thay đổi. Kiểm tra bàn cờ mới rồi thử lại."
            : acknowledgement.error.code === "MATCH_ILLEGAL_MOVE"
              ? "Nước đi không hợp lệ. Chọn lại quân và ô đích."
              : "Chưa thể đi cờ. Kiểm tra lượt, kết nối và quyền điều khiển.",
        );
      }
    } catch {
      if (isCurrent()) {
        setOptimistic(null);
        setError(
          "Chưa nhận được xác nhận nước đi. Kiểm tra bàn cờ máy chủ trước khi thao tác lại.",
        );
      }
    } finally {
      if (isCurrent()) {
        commandPending.current = false;
        setBusy(false);
      }
    }
  }
  async function matchAction(action: MatchAction) {
    const current = latest.current;
    const peer = connection.current;
    if (
      !current?.match ||
      !peer ||
      !connectedRef.current ||
      current.version < versionFloor.current ||
      busy ||
      commandPending.current ||
      current.role === "spectator" ||
      current.control.mode !== "writable" ||
      current.room.status !== "PLAYING" ||
      current.match.status !== "ACTIVE" ||
      action.payload.matchId !== current.match.id ||
      action.payload.matchVersion !== current.match.version
    )
      return;
    const requestEpoch = epoch.current;
    const requestCommandEpoch = ++commandEpoch.current;
    const isCurrent = () =>
      epoch.current === requestEpoch &&
      commandEpoch.current === requestCommandEpoch &&
      connectedRef.current &&
      connection.current === peer &&
      latest.current?.match?.id === current.match!.id;
    commandPending.current = true;
    setBusy(true);
    setActionError("");
    try {
      const acknowledgement = await peer.command(action, current.version);
      if (!isCurrent()) return;
      if (acknowledgement.snapshot) acceptSnapshot(acknowledgement.snapshot);
      if (!isCurrent()) return;
      if (acknowledgement.status === "error") {
        setActionError(
          acknowledgement.error.code === "VERSION_STALE" ||
            acknowledgement.error.code === "MATCH_VERSION_CONFLICT"
            ? "Ván cờ đã thay đổi. Kiểm tra trạng thái mới rồi thử lại."
            : "Thao tác chưa thực hiện được. Kiểm tra đề nghị và quyền điều khiển.",
        );
      }
    } catch {
      if (isCurrent()) {
        setActionError(
          "Chưa nhận được xác nhận thao tác ván cờ. Kiểm tra trạng thái máy chủ trước khi thử lại.",
        );
        throw new Error("MATCH_ACTION_UNCONFIRMED");
      }
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
  async function httpAction(
    action:
      | "switch"
      | "leave"
      | "swap-propose"
      | "swap-withdraw"
      | "swap-accept"
      | "swap-decline",
  ) {
    if (!view || busy) return;
    const requestEpoch = epoch.current;
    if (action === "leave") refreshEpoch.current++;
    setBusy(true);
    setError("");
    setLeaveError("");
    try {
      if (action === "leave") {
        await client.leave(roomId, view.version);
        if (epoch.current === requestEpoch) onLeft();
      } else if (action === "switch") {
        const next = await client.switchSeat(roomId, view.version);
        if (
          epoch.current === requestEpoch &&
          next.version >= versionFloor.current
        ) {
          versionFloor.current = next.version;
          setView(next);
          setSnapshot(null);
        }
      } else {
        const next =
          action === "swap-propose"
            ? await client.proposeSwap(roomId, view.version)
            : action === "swap-withdraw"
              ? await client.withdrawSwap(roomId, view.version)
              : await client.respondSwap(
                  roomId,
                  view.version,
                  action === "swap-accept",
                );
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
      if (
        action === "leave" &&
        e instanceof RoomRequestError &&
        e.code === "ROOM_FORBIDDEN"
      ) {
        onLeft("Phòng không còn khả dụng.");
        return;
      }
      const message =
        e instanceof RoomRequestError
          ? swapMessage(e.code, e.message)
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
  async function viewerAction(
    action: "to-spectator" | "invite-down" | "respond-down" | "kick",
    extra: { targetId?: string; accept?: boolean } = {},
  ) {
    if (!view || busy) return;
    const requestEpoch = epoch.current;
    setBusy(true);
    setError("");
    try {
      const next =
        action === "to-spectator"
          ? await client.toSpectator(roomId, view.version)
          : action === "invite-down"
            ? await client.inviteDown(roomId, view.version, extra.targetId!)
            : action === "respond-down"
              ? await client.respondDown(
                  roomId,
                  view.version,
                  extra.accept === true,
                )
              : await client.kickViewer(roomId, view.version, extra.targetId!);
      if (
        epoch.current === requestEpoch &&
        next.version >= versionFloor.current
      ) {
        versionFloor.current = next.version;
        setView(next);
        setSnapshot(null);
      }
    } catch (e) {
      if (epoch.current !== requestEpoch) return;
      setError(viewerActionMessage(e));
    } finally {
      if (epoch.current === requestEpoch) setBusy(false);
    }
  }
  if (!view)
    return (
      <main className="xq-ui xq-room-page">
        {error ? (
          <div
            className="xq-stack"
            style={{
              maxWidth: 480,
              margin: "64px auto",
              padding: 24,
              textAlign: "center",
            }}
          >
            <ErrorState message={error} onRetry={retry} />
            <Button variant="secondary" onClick={() => onLeft()}>
              Quay về Sảnh
            </Button>
          </div>
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
  const activeBoard = optimistic ? optimistic.position : board;
  const activeLastMove = optimistic
    ? { ...optimistic.lastMove, eventVersion: 0 }
    : (snapshot?.match?.lastMove ?? null);
  const readyControl = room.status === "WAITING" && player && (
    <Button
      className="xq-room-ready"
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
      {room.ready[view.role as "red" | "black"] ? "Huỷ sẵn sàng" : "Sẵn sàng"}
    </Button>
  );
  return (
    <main
      className={`xq-ui xq-room-page${playingLayout ? " is-playing" : " is-waiting"}`}
    >
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
          {!playingLayout && (
            <div className="xq-room-meta">
              <span>{room.timeMinutes} phút mỗi bên</span>
              <span>{visibilityLabel(room.visibility)}</span>
            </div>
          )}
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
            disabledReason={
              player &&
              room.status === "PLAYING" &&
              (!connected ||
                !snapshot ||
                snapshot.version < versionFloor.current ||
                snapshot.match?.status !== "ACTIVE")
                ? "Chờ đồng bộ ván cờ để xác nhận rời phòng."
                : undefined
            }
            onClick={() => {
              const current = latest.current;
              if (
                player &&
                room.status === "PLAYING" &&
                (!connectedRef.current ||
                  !snapshot ||
                  current?.match?.status !== "ACTIVE" ||
                  current.version < versionFloor.current)
              )
                return;
              if (
                view.role !== "spectator" &&
                current?.match?.status === "ACTIVE"
              ) {
                setSettingsOpen(false);
                setLeaveError("");
                setLeaveConfirm(current.match.id);
              } else void httpAction("leave");
            }}
          >
            Rời phòng
          </Button>
        </div>
      </header>
      <fieldset className="match-actions__confirmation" disabled={busy}>
        <Dialog
          open={leaveConfirm !== null}
          title="Rời phòng?"
          danger
          confirmLabel="Rời phòng"
          cancelLabel="Ở lại"
          onClose={() => {
            if (!busy) setLeaveConfirm(null);
          }}
          onConfirm={() => {
            const current = latest.current;
            if (
              !connectedRef.current ||
              current?.match?.id !== leaveConfirm ||
              current.match.status !== "ACTIVE" ||
              current.role === "spectator" ||
              busy
            )
              return;
            void httpAction("leave");
          }}
        >
          <p>
            <strong>
              Rời phòng lúc này được tính là đầu hàng. Bạn sẽ thua ván này.
            </strong>
          </p>
          {leaveError && <Notice tone="error" message={leaveError} />}
        </Dialog>
      </fieldset>
      <div className="xq-room-content">
        <section className="xq-room-arena" aria-label="Ghế và trạng thái phòng">
          {error &&
            (connected ? (
              <Notice tone="error" message={error} />
            ) : (
              <ErrorState message={error} onRetry={retry} />
            ))}
          {room.downOffer?.inviteeId === userId && (
            <div
              className="xq-down-prompt"
              role="group"
              aria-label="Lời mời xuống ghế"
            >
              <p>
                Chủ phòng mời bạn xuống ghế chơi. Ghế có thể đã bị lấy trước khi
                bạn đồng ý.
              </p>
              <Button
                loading={busy}
                onClick={() =>
                  void viewerAction("respond-down", { accept: true })
                }
              >
                Chấp nhận
              </Button>{" "}
              <Button
                variant="secondary"
                loading={busy}
                onClick={() =>
                  void viewerAction("respond-down", { accept: false })
                }
              >
                Từ chối
              </Button>
            </div>
          )}
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
          <RoomSeats
            room={room}
            userId={userId}
            playingLayout={playingLayout}
            player={player}
            solo={solo}
            writable={writable}
            busy={busy}
            swapNow={swapNow}
            readyControl={readyControl}
            onAction={(action) => void httpAction(action)}
          />
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
          {activeBoard && (
            <div className="xq-room-board" aria-label="Bàn cờ đang thi đấu">
              <XiangqiBoard
                position={activeBoard}
                orientation={view.role === "black" ? "black" : "red"}
                playerSide={view.role === "black" ? "black" : "red"}
                disabled={
                  !active ||
                  !writable ||
                  !player ||
                  (optimistic
                    ? optimistic.position.turn !== view.role
                    : snapshot?.match?.turn !== view.role)
                }
                pending={busy && !optimistic}
                lastMove={activeLastMove}
                onMove={(from, to) => void move(from, to)}
              />
            </div>
          )}
          {snapshot && (
            <MatchActions
              match={snapshot.match}
              role={snapshot.role}
              draw={snapshot.draw}
              serverNow={snapshot.serverNow}
              canAct={Boolean(writable && player && active)}
              busy={busy}
              error={actionError}
              onAction={matchAction}
            />
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
          {playingLayout && readyControl}
          {view.role === "spectator" && (
            <p>Bạn đang xem. Chỉ người ngồi ghế mới có thể Sẵn sàng.</p>
          )}
        </section>
        {code && room.visibility !== "LOCKED" && (
          <RoomInvite
            code={code}
            copying={copying}
            copyStatus={copyStatus}
            onCopy={() => void copyInvite(code)}
          />
        )}
        <aside className="xq-room-info" aria-label="Thông tin phòng">
          <RoomDetails room={room} />
          <SpectatorsPanel
            spectators={room.spectators ?? []}
            limit={room.viewerLimit}
            selfId={userId}
            canMoveToSpectator={
              player &&
              room.hostId !== userId &&
              room.status === "WAITING" &&
              !room.countdown &&
              (room.spectators?.length ?? 0) < room.viewerLimit
            }
            canInviteDown={
              player &&
              room.hostId === userId &&
              room.status === "WAITING" &&
              !(room.seats.red && room.seats.black)
            }
            canKick={player}
            downOfferInviteeId={room.downOffer?.inviteeId ?? null}
            busy={busy}
            onMoveToSpectator={() => void viewerAction("to-spectator")}
            onInviteDown={(target) =>
              void viewerAction("invite-down", { targetId: target })
            }
            onKick={(target) => void viewerAction("kick", { targetId: target })}
          />
          <div className="xq-room-slots">
            <div className="xq-room-chat-slot">
              {chat ?? (
                <RoomChat
                  viewerRole={view.role}
                  connected={connected && !!snapshot}
                  channels={roomChat.channels}
                  pendingSend={roomChat.pendingSend}
                  onSend={roomChat.onSend}
                  onLoadMore={roomChat.onLoadMore}
                />
              )}
              {connected &&
                snapshot &&
                (["PLAYERS_PRIVATE", "ROOM_PUBLIC"] as const).map((channel) =>
                  roomChat.channels[channel]?.error ? (
                    <Button
                      key={channel}
                      variant="secondary"
                      onClick={() =>
                        void roomChat.onLoadMore(channel).catch(() => {})
                      }
                    >
                      Tải lại{" "}
                      {channel === "PLAYERS_PRIVATE"
                        ? "Kênh riêng"
                        : "Kênh chung"}
                    </Button>
                  ) : null,
                )}
            </div>
            <div className="xq-room-media-slot">
              {mediaClient ? (
                <Suspense
                  fallback={<MediaSeats seats={room.seats} selfId={userId} />}
                >
                  <LazyMediaPanel
                    roomId={roomId}
                    role={view.role}
                    client={mediaClient}
                    connected={connected && Boolean(snapshot)}
                    seats={room.seats}
                    userId={userId}
                  />
                </Suspense>
              ) : (
                (media ?? (
                  <section className="xq-media" aria-label="Camera và mic">
                    <h2>Camera và mic</h2>
                    <MediaSeats seats={room.seats} selfId={userId} />
                    <p>Camera và mic chưa khả dụng.</p>
                  </section>
                ))
              )}
            </div>
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
