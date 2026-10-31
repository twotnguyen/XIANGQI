import {
  useEffect,
  lazy,
  Suspense,
  useMemo,
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
import { InactivityBanner } from "./match/InactivityBanner.js";
import { NetworkDemo } from "./NetworkDemo.js";
import { SpectatorsPanel } from "./SpectatorsPanel.js";
import { Countdown } from "./RoomCountdown.js";
import { RoomDetails } from "./RoomDetails.js";
import { RoomInvite } from "./RoomInvite.js";
import { RoomSeats } from "./RoomSeats.js";
import { RematchPanel } from "./RematchPanel.js";
import { SwapPrompt } from "./SwapPrompt.js";
import {
  rematchMessage,
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
  renderInviteFriends?: (roomId: string) => ReactNode;
  isMember?: boolean;
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
  renderInviteFriends,
  isMember = false,
}: RoomPageProps) {
  const [dismissedResult, setDismissedResult] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState("");
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  useEffect(() => {
    if (!copied || copying) return;
    const timer = setTimeout(() => setCopied(null), 1500);
    return () => clearTimeout(timer);
  }, [copied, copying]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [swapCollapsedId, setSwapCollapsedId] = useState<string | null>(null);
  const [liveMatchId, setLiveMatchId] = useState<string | null>(null);
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
    demoEnabled,
    demoDisconnected,
    disconnectDemo,
    reconnectDemo,
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
  useEffect(() => {
    if (!connected || snapshot?.control.mode !== "writable")
      setLeaveConfirm(null);
  }, [connected, snapshot?.control.mode]);
  const canRematch =
    view !== null &&
    view.room.status === "WAITING" &&
    (view.room.inviteCode !== null || view.room.visibility === "LOCKED") &&
    (view.role === "red" || view.role === "black") &&
    Boolean(view.room.seats.red && view.room.seats.black) &&
    snapshot?.match != null &&
    snapshot.match.status !== "ACTIVE" &&
    view.room.countdown === null &&
    view.room.rematchOffer === null;
  const swapOfferId = view?.room.swapOffer?.id ?? null;
  const swapExpiresAt = view?.room.swapOffer?.expiresAt ?? null;
  const cooldownUntil = view?.room.swapCooldownUntil ?? null;
  const receivedAt = useMemo(() => Date.now(), [view?.serverNow]);
  const clockSkew = view ? Date.parse(view.serverNow) - receivedAt : 0;
  const liveMatch = snapshot?.match ?? null;
  const downOffer = view?.room.downOffer ?? null;
  const seatRequests = view?.room.seatRequests ?? [];
  const timed = Boolean(
    swapOfferId ||
    cooldownUntil ||
    downOffer ||
    seatRequests.length ||
    view?.room.downCooldownUntil ||
    view?.room.seatRequestCooldownUntil,
  );
  useEffect(() => {
    if (!timed) return;
    setNowMs(Date.now());
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [timed]);
  const remainingSeconds = (until: string | null) =>
    until
      ? Math.max(0, Math.ceil((Date.parse(until) - nowMs - clockSkew) / 1000))
      : 0;
  const swapSeconds = remainingSeconds(swapExpiresAt);
  const cooldownSeconds = remainingSeconds(cooldownUntil);
  const downSeconds = remainingSeconds(downOffer?.expiresAt ?? null);
  // Hết hạn không có sự kiện nào đẩy snapshot mới: tự tính 10 giây chờ từ hạn gốc để nút khóa đúng lúc, server vẫn kiểm lại khi gửi.
  const afterExpiry = (expiresAt: string | undefined) =>
    expiresAt && remainingSeconds(expiresAt) === 0
      ? remainingSeconds(new Date(Date.parse(expiresAt) + 10000).toISOString())
      : 0;
  const inviteCooldownSeconds = Math.max(
    remainingSeconds(view?.room.downCooldownUntil ?? null),
    afterExpiry(downOffer?.expiresAt),
  );
  const ownRequest = seatRequests.find((q) => q.userId === userId);
  const seatRequestCooldownSeconds = Math.max(
    remainingSeconds(view?.room.seatRequestCooldownUntil ?? null),
    afterExpiry(ownRequest?.expiresAt),
  );
  const liveRequests = seatRequests
    .map((q) => ({
      id: q.id,
      userId: q.userId,
      expiresAt: q.expiresAt,
      seconds: remainingSeconds(q.expiresAt),
    }))
    .filter((q) => q.seconds > 0);
  // Yêu cầu của chính mình biến mất khi vẫn là người xem: báo vì sao (ghế đã có người, bị từ chối hoặc đã hết hạn).
  const liveOwn = liveRequests.find((q) => q.userId === userId);
  const seatsFull = Boolean(view?.room.seats.red && view?.room.seats.black);
  const [seatNotice, setSeatNotice] = useState("");
  const hadRequest = useRef(0);
  const requestCooldownUntil = view?.room.seatRequestCooldownUntil ?? null;
  useEffect(() => {
    if (liveOwn) {
      hadRequest.current = Date.parse(liveOwn.expiresAt);
      setSeatNotice("");
      return;
    }
    if (!hadRequest.current) return;
    const expiresAt = hadRequest.current;
    hadRequest.current = 0;
    if (view?.role !== "spectator") return;
    // Từ chối đặt chờ 10 giây từ lúc phản hồi (sớm hơn hạn gốc); hết hạn đặt chờ đúng hạn gốc + 10 giây.
    const declined =
      requestCooldownUntil !== null &&
      Date.parse(requestCooldownUntil) - 10000 < expiresAt - 1000;
    setSeatNotice(
      seatsFull
        ? "Ghế đã có người."
        : declined
          ? "Chủ phòng đã từ chối yêu cầu ngồi ghế."
          : "Yêu cầu ngồi ghế đã hết hạn.",
    );
  }, [liveOwn?.expiresAt, view?.role, seatsFull, requestCooldownUntil]);
  const swapOfferOpen = Boolean(
    swapOfferId &&
    view?.room.swapOffer?.responderId === userId &&
    !view?.room.countdown &&
    swapSeconds > 0,
  );
  const swapModalOpen = swapOfferOpen && swapCollapsedId !== swapOfferId;
  const swapReopenSeconds =
    swapOfferOpen && swapCollapsedId === swapOfferId ? swapSeconds : null;
  // undefined = no snapshot yet; the first snapshot of a load never opens a result.
  const previousMatchId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!snapshot) return;
    const previous = previousMatchId.current;
    previousMatchId.current = snapshot.match?.id ?? null;
    if (!snapshot.match) return;
    // Q1: a terminal match that differs from the last seen one is live, even if its PLAYING snapshot was coalesced; a duplicate or reconnect of the same match is not.
    if (
      snapshot.room.status === "PLAYING" ||
      (previous !== undefined &&
        previous !== snapshot.match.id &&
        snapshot.match.status !== "ACTIVE")
    )
      setLiveMatchId(snapshot.match.id);
  }, [snapshot]);
  async function copyInvite(code: string, format: "code" | "link") {
    if (copying) return;
    setCopying(true);
    try {
      if (!navigator.clipboard?.writeText) throw Error("clipboard unavailable");
      const value =
        format === "link"
          ? new URL(
              `/rooms/join?token=${encodeURIComponent(code)}`,
              window.location.origin,
            ).href
          : code;
      await navigator.clipboard.writeText(value);
      setCopied(format);
      setCopyStatus("");
    } catch {
      setCopied(null);
      setCopyStatus(
        format === "link"
          ? "Chưa sao chép được link. Hãy thử lại hoặc chia sẻ mã phòng."
          : "Chưa sao chép được. Hãy chọn mã và sao chép thủ công.",
      );
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
  async function ready(action?: "start") {
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
        action === "start"
          ? { type: "room.start", payload: {} }
          : {
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
            : action === "start"
              ? "Chưa thể bắt đầu ván. Kiểm tra đối thủ đã Sẵn sàng và đang kết nối."
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
      gameAudio.current?.playLocal(current, nextBoard, { from, to });
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
  function ownsHttpControl() {
    const state = latest.current;
    return Boolean(
      connectedRef.current &&
      connection.current &&
      state &&
      state.version >= versionFloor.current &&
      (state.control.mode === "writable" ||
        (state.role === "spectator" && state.control.reason === "not_allowed")),
    );
  }
  async function changeVisibility(visibility: RoomView["room"]["visibility"]) {
    const current = latest.current;
    if (
      !current ||
      !connectedRef.current ||
      current.control.mode !== "writable" ||
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
      const control = await peer!.getControl();
      if (
        !isCurrent() ||
        latest.current?.control.mode !== "writable" ||
        latest.current.control.generation !== control.generation
      )
        return;
      const next = await client.changeVisibility(
        roomId,
        current.version,
        visibility,
        control,
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
      | "transfer-host"
      | "leave"
      | "swap-propose"
      | "swap-withdraw"
      | "swap-accept"
      | "swap-decline"
      | "rematch-propose"
      | "rematch-accept"
      | "rematch-decline",
    side: "KEEP" | "SWAP" = "SWAP",
  ) {
    if (!view || busy || !ownsHttpControl()) return;
    const requestEpoch = epoch.current;
    if (action === "leave") refreshEpoch.current++;
    setBusy(true);
    setError("");
    setLeaveError("");
    try {
      const control = await connection.current!.getControl();
      if (
        epoch.current !== requestEpoch ||
        !ownsHttpControl() ||
        latest.current?.control.generation !== control.generation
      )
        return;
      if (action === "leave") {
        await client.leave(roomId, view.version, control);
        if (epoch.current === requestEpoch) onLeft();
      } else if (action === "switch" || action === "transfer-host") {
        const seatCommand =
          action === "switch" ? client.switchSeat : client.transferHost;
        const next = await seatCommand(roomId, view.version, control);
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
            ? await client.proposeSwap(roomId, view.version, control)
            : action === "swap-withdraw"
              ? await client.withdrawSwap(roomId, view.version, control)
              : action === "rematch-propose"
                ? await client.proposeRematch(
                    roomId,
                    view.version,
                    side,
                    control,
                  )
                : action === "rematch-accept" || action === "rematch-decline"
                  ? await client.respondRematch(
                      roomId,
                      view.version,
                      action === "rematch-accept",
                      control,
                    )
                  : await client.respondSwap(
                      roomId,
                      view.version,
                      action === "swap-accept",
                      control,
                    );
        if (
          epoch.current === requestEpoch &&
          next.version >= versionFloor.current
        ) {
          versionFloor.current = next.version;
          setView(next);
          // Keep the terminal board and result while a rematch offer is exchanged.
          if (!action.startsWith("rematch")) setSnapshot(null);
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
          ? action.startsWith("rematch")
            ? rematchMessage(e.code, e.message)
            : swapMessage(e.code, e.message)
          : "Thao tác chưa thực hiện được. Kiểm tra trạng thái phòng rồi thử lại.";
      setError(message);
      if (action === "leave" || action.startsWith("rematch"))
        setLeaveError(message);
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
    action:
      | "to-spectator"
      | "move-to-spectator"
      | "invite-down"
      | "respond-down"
      | "request-seat"
      | "respond-seat-request"
      | "invite-leave"
      | "kick",
    extra: {
      targetId?: string;
      accept?: boolean;
      offerId?: string;
      requestId?: string;
    } = {},
  ) {
    if (!view || busy || !ownsHttpControl()) return;
    if (
      action === "move-to-spectator" &&
      (!connectedRef.current ||
        latest.current?.control.mode !== "writable" ||
        latest.current.version < versionFloor.current)
    )
      return;
    const requestEpoch = epoch.current;
    setBusy(true);
    setError("");
    setSeatNotice("");
    try {
      const control = await connection.current!.getControl();
      if (
        epoch.current !== requestEpoch ||
        !ownsHttpControl() ||
        latest.current?.control.generation !== control.generation
      )
        return;
      const send = () => {
        switch (action) {
          case "to-spectator":
            return client.toSpectator(roomId, view.version, control);
          case "move-to-spectator":
            return client.moveToSpectator(
              roomId,
              view.version,
              extra.targetId!,
              control,
            );
          case "invite-down":
            return client.inviteDown(
              roomId,
              view.version,
              extra.targetId!,
              control,
            );
          case "respond-down":
            return client.respondDown(
              roomId,
              view.version,
              extra.offerId!,
              extra.accept === true,
              control,
            );
          case "request-seat":
            return client.requestSeat(roomId, control);
          case "respond-seat-request":
            return client.respondSeatRequest(
              roomId,
              extra.requestId!,
              extra.accept === true,
              control,
            );
          case "invite-leave":
            return client.inviteLeave(
              roomId,
              view.version,
              extra.targetId!,
              control,
            );
          case "kick":
            return client.kickViewer(
              roomId,
              view.version,
              extra.targetId!,
              control,
            );
        }
      };
      const next = await send();
      if (
        epoch.current === requestEpoch &&
        next.version >= versionFloor.current
      ) {
        versionFloor.current = next.version;
        setView(next);
        setSnapshot(null);
        // Chấp nhận nhưng vẫn là người xem: lời mời đã hết hạn hoặc ghế/phòng đã đổi.
        if (
          action === "respond-down" &&
          extra.accept === true &&
          next.role === "spectator"
        )
          setError(
            "Chưa vào được ghế: lời mời đã hết hạn hoặc ghế/phòng đã thay đổi.",
          );
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
    writable && room.hostId === userId && view.role !== "spectator";
  const solo =
    Number(Boolean(room.seats.red)) + Number(Boolean(room.seats.black)) === 1;
  const clockState = snapshot ?? latest.current;
  const playingLayout = room.status === "PLAYING" && Boolean(clockState?.match);
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
  const isHost = room.hostId === userId;
  const opponentSide = view.role === "red" ? "black" : "red";
  const readyControl = room.status === "WAITING" && player && (
    <Button
      className="xq-room-ready"
      loading={busy}
      disabledReason={
        !writable
          ? "Cần kết nối và quyền điều khiển ghế."
          : !room.seats.red || !room.seats.black
            ? isHost
              ? "Chờ người chơi thứ hai"
              : "Chờ đủ hai người chơi để Sẵn sàng."
            : isHost &&
                !(room.ready[opponentSide] && room.connected[opponentSide])
              ? "Chờ đối thủ sẵn sàng"
              : room.countdown
                ? "Đang đếm ngược bắt đầu ván."
                : undefined
      }
      onClick={() => void ready(isHost ? "start" : undefined)}
    >
      {isHost
        ? "Bắt đầu"
        : room.ready[view.role as "red" | "black"]
          ? "Huỷ sẵn sàng"
          : "Sẵn sàng"}
    </Button>
  );
  const resultVisible = Boolean(
    connected &&
    snapshot?.match &&
    snapshot.match.status !== "ACTIVE" &&
    !room.countdown &&
    liveMatchId === snapshot.match.id &&
    (snapshot.role === "spectator" || dismissedResult !== snapshot.match.id),
  );
  const resultInModal = resultVisible && player;
  const rematchPanel = (
    <RematchPanel
      offer={isMember ? (room.rematchOffer ?? null) : null}
      selfId={userId}
      canPropose={canRematch && isMember && writable}
      clockSkew={clockSkew}
      busy={busy}
      writable={writable}
      onPropose={(side) => void httpAction("rematch-propose", side)}
      onRespond={(accept) =>
        void httpAction(accept ? "rematch-accept" : "rematch-decline")
      }
    />
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
            <div className="xq-waiting-meta">
              <span>
                {room.timeMinutes === 0
                  ? "Không giới hạn"
                  : `${room.timeMinutes} phút mỗi bên`}
              </span>
              <span>{visibilityLabel(room.visibility)}</span>
            </div>
          )}
        </div>
        <div className="xq-room-header-actions">
          <NetworkDemo
            enabled={demoEnabled}
            disconnected={demoDisconnected}
            onDisconnect={() => void disconnectDemo()}
            onReconnect={reconnectDemo}
          />
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
              !ownsHttpControl()
                ? "Cần kết nối và quyền điều khiển phòng."
                : player &&
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
      {!playingLayout && (
        <fieldset className="xq-room-mobile-nav" aria-label="Khu vực phòng chờ">
          <label>
            <input
              type="radio"
              name={`room-area-${roomId}`}
              value="room"
              defaultChecked
            />
            Phòng chờ
          </label>
          <label>
            <input type="radio" name={`room-area-${roomId}`} value="media" />
            Camera
          </label>
          <label>
            <input type="radio" name={`room-area-${roomId}`} value="chat" />
            Trò chuyện
          </label>
        </fieldset>
      )}
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
              !ownsHttpControl() ||
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
          {seatNotice && <Notice message={seatNotice} />}
          {downOffer?.inviteeId === userId && downSeconds > 0 && (
            <div
              className="xq-down-prompt"
              role="group"
              aria-label="Lời mời xuống ghế"
            >
              <p>
                Chủ phòng mời bạn xuống ghế chơi · còn {downSeconds} giây. Ghế
                có thể đã bị lấy trước khi bạn đồng ý.
              </p>
              <Button
                loading={busy}
                disabledReason={
                  !ownsHttpControl()
                    ? "Cần kết nối và quyền điều khiển phòng."
                    : undefined
                }
                onClick={() =>
                  void viewerAction("respond-down", {
                    accept: true,
                    offerId: downOffer.id,
                  })
                }
              >
                Chấp nhận
              </Button>{" "}
              <Button
                variant="secondary"
                loading={busy}
                disabledReason={
                  !ownsHttpControl()
                    ? "Cần kết nối và quyền điều khiển phòng."
                    : undefined
                }
                onClick={() =>
                  void viewerAction("respond-down", {
                    accept: false,
                    offerId: downOffer.id,
                  })
                }
              >
                Từ chối
              </Button>
            </div>
          )}
          <ReconnectStatus
            connected={connected}
            waitingForSnapshot={connected && !snapshot}
            onReconnect={demoDisconnected ? reconnectDemo : undefined}
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
            swapCooldownSeconds={cooldownSeconds}
            swapReopenSeconds={swapReopenSeconds}
            onSwapReopen={() => setSwapCollapsedId(null)}
            readyControl={readyControl}
            onTransferHost={() => setConfirmTransfer(true)}
            onAction={(action) => void httpAction(action)}
            onMoveToSpectator={(targetId) =>
              void viewerAction("move-to-spectator", { targetId })
            }
            onInviteLeave={
              room.hostId === userId
                ? (targetId) => void viewerAction("invite-leave", { targetId })
                : undefined
            }
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
                  Boolean(
                    snapshot?.undo?.offers.some(
                      (offer) => offer.sender === view.role,
                    ),
                  ) ||
                  (optimistic
                    ? optimistic.position.turn !== view.role
                    : snapshot?.match?.turn !== view.role)
                }
                pending={busy}
                lastMove={activeLastMove}
                onMove={(from, to) => void move(from, to)}
              />
            </div>
          )}
          {snapshot && liveMatch && (
            <InactivityBanner
              match={liveMatch}
              role={snapshot.role}
              serverNow={snapshot.serverNow}
              busy={busy}
              canAct={Boolean(writable && player && active)}
              onStillHere={() =>
                matchAction({
                  type: "match.still-here",
                  payload: {
                    matchId: liveMatch.id,
                    matchVersion: liveMatch.version,
                  },
                })
              }
            />
          )}
          {snapshot && (
            <MatchActions
              match={snapshot.match}
              role={snapshot.role}
              draw={snapshot.draw}
              undo={snapshot.undo}
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
                  snapshot.match.result === "ABORTED"
                    ? "Ván bị hủy. Hai bên có thể Sẵn sàng cho ván mới."
                    : snapshot.match.status === "INTERRUPTED"
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
        {view.role !== "spectator" && code && room.visibility !== "LOCKED" && (
          <RoomInvite
            code={code}
            copying={copying}
            copyStatus={copyStatus}
            copied={copied}
            onCopy={() => void copyInvite(code, "code")}
            onCopyLink={() => void copyInvite(code, "link")}
            friends={
              isMember && renderInviteFriends
                ? renderInviteFriends(roomId)
                : undefined
            }
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
              !room.countdown
            }
            canInviteDown={
              player &&
              room.hostId === userId &&
              room.status === "WAITING" &&
              !(room.seats.red && room.seats.black)
            }
            canKick={player}
            downOfferInviteeId={
              downOffer && downSeconds > 0 ? downOffer.inviteeId : null
            }
            inviteCooldownSeconds={inviteCooldownSeconds}
            seatRequests={
              room.hostId === userId
                ? liveRequests
                : liveRequests.filter((q) => q.userId === userId)
            }
            canRespondRequests={
              room.hostId === userId && room.status === "WAITING" && !seatsFull
            }
            canRequestSeat={view.role === "spectator"}
            requestSeatReason={
              room.status !== "WAITING"
                ? "Đang trong ván"
                : seatsFull
                  ? "Ghế đã đủ người"
                  : room.countdown
                    ? "Phòng đang đếm ngược"
                    : room.occupiedElsewhere
                      ? "Bạn đang ở trong một ván/phòng khác"
                      : seatRequestCooldownSeconds > 0
                        ? `Chờ ${seatRequestCooldownSeconds} giây để xin lại`
                        : undefined
            }
            onRequestSeat={() => void viewerAction("request-seat")}
            onRespondRequest={(requestId, accept) =>
              void viewerAction("respond-seat-request", { requestId, accept })
            }
            busy={busy}
            // Tab người xem luôn readonly/not_allowed nhưng vẫn là chủ HTTP của chính mình.
            writable={
              writable || (view.role === "spectator" && ownsHttpControl())
            }
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
                    writable={writable}
                    tabId={connection.current?.tabId ?? ""}
                    getControl={() =>
                      connection.current
                        ? connection.current.getControl()
                        : Promise.reject(
                            new RoomRequestError("ROOM_TAB_READ_ONLY", 403),
                          )
                    }
                    onTakeover={() =>
                      connection.current
                        ? connection.current.takeover()
                        : Promise.reject(new Error("Chưa kết nối phòng."))
                    }
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
      <Dialog
        open={confirmTransfer}
        onClose={() => setConfirmTransfer(false)}
        title="Nhường Host?"
        cancelLabel="Hủy"
        confirmLabel="Xác nhận nhường Host"
        onConfirm={() => {
          setConfirmTransfer(false);
          void httpAction("transfer-host");
        }}
      >
        <p>
          Quyền Host (Bắt đầu, Cài đặt phòng) chuyển ngay cho đối thủ, không cần
          họ đồng ý. Ghế và phe giữ nguyên.
        </p>
      </Dialog>
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
      {!resultInModal && rematchPanel}
      <SwapPrompt
        open={swapModalOpen}
        seconds={swapSeconds}
        writable={writable}
        busy={busy}
        onAccept={() => void httpAction("swap-accept")}
        onDecline={() => void httpAction("swap-decline")}
        onCollapse={() => setSwapCollapsedId(swapOfferId)}
      />
      {resultVisible && snapshot?.match && (
        <MatchResult
          match={snapshot.match}
          role={snapshot.role}
          leaving={busy}
          canLeave={ownsHttpControl()}
          error={leaveError}
          rematch={rematchPanel}
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
