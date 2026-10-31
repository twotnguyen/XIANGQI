import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { RoomSnapshot } from "@xiangqi/shared";
import type { Position } from "@xiangqi/xiangqi-core";
import { useRoomChat } from "../chat/useRoomChat.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomConnection,
  type RoomConnectionInput,
  type RoomView,
} from "./room-client.js";
import type { GameAudio } from "./game-audio.js";

export interface OptimisticMove {
  position: Position;
  lastMove: { from: number; to: number };
  matchVersion: number;
}

export interface RoomConnectionOptions {
  roomId: string;
  client: RoomClient;
  getProof: RoomConnectionInput["getProof"];
  connect: (input: RoomConnectionInput) => RoomConnection;
  onLeft: (message?: string) => void;
  onMatchEnded: () => void;
  gameAudio: RefObject<GameAudio | null>;
}

/**
 * Vòng đời kết nối phòng: một generation cho mỗi lần mount/reconnect, snapshot realtime là nguồn quyền,
 * HTTP chỉ hiển thị khi socket mất kết nối và mọi phản hồi cũ bị chặn bằng epoch/version.
 */
export function useRoomConnection(options: RoomConnectionOptions) {
  const { roomId, client, getProof, connect } = options;
  const callbacks = useRef(options);
  callbacks.current = options;
  const [view, setView] = useState<RoomView | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [optimistic, setOptimistic] = useState<OptimisticMove | null>(null);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [demoDisconnected, setDemoDisconnected] = useState(false);
  const demoRequested = useRef(false);
  const connection = useRef<RoomConnection | null>(null);
  const roomChat = useRoomChat(roomId, connection);
  const epoch = useRef(0);
  const refreshEpoch = useRef(0);
  const versionFloor = useRef(0);
  const latest = useRef<RoomSnapshot | null>(null);
  const commandPending = useRef(false);
  const commandEpoch = useRef(0);
  const connectedRef = useRef(false);
  const audioBaseline = useRef(true);
  function invalidateCommands() {
    setActionError("");
    commandEpoch.current++;
    if (commandPending.current) setBusy(false);
    commandPending.current = false;
    setOptimistic(null);
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
        prior.match?.status !== value.match?.status ||
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
    callbacks.current.gameAudio.current?.accept(
      audioBaseline.current ? null : prior,
      value,
    );
    audioBaseline.current = false;
    versionFloor.current = value.version;
    if (prior?.match?.status === "ACTIVE" && value.match?.status !== "ACTIVE")
      callbacks.current.onMatchEnded();
    latest.current = value;
    roomChat.update(value, true);
    setSnapshot(value);
    setView(value);
    setOptimistic((prev) =>
      prev && value.match && value.match.version <= prev.matchVersion
        ? prev
        : null,
    );
    return true;
  }
  useEffect(() => {
    let alive = true;
    epoch.current++;
    roomChat.clear();
    latest.current = null;
    versionFloor.current = 0;
    setDemoEnabled(false);
    setDemoDisconnected(false);
    demoRequested.current = false;
    setBusy(false);
    commandPending.current = false;
    audioBaseline.current = true;
    setSnapshot(null);
    setView(null);
    connectedRef.current = false;
    setConnected(false);
    setError("");
    const loadingTimeout = setTimeout(() => {
      if (alive && !latest.current) {
        setError(
          (prev) =>
            prev ||
            "Chưa thể kết nối phòng. Vui lòng kiểm tra máy chủ hoặc thử lại.",
        );
      }
    }, 6000);
    let fallbackStarted = false;
    let connectionGeneration = 0;
    const loadDisplayFallback = () => {
      if (!alive || connectedRef.current || fallbackStarted) return;
      fallbackStarted = true;
      const requestGeneration = connectionGeneration;
      const requestEpoch = epoch.current;
      void client.snapshot(roomId).then(
        (value) => {
          if (
            alive &&
            epoch.current === requestEpoch &&
            connectionGeneration === requestGeneration &&
            !connectedRef.current &&
            value.version >= versionFloor.current
          ) {
            versionFloor.current = value.version;
            setView(value);
          }
        },
        (error) => {
          if (
            !alive ||
            epoch.current !== requestEpoch ||
            connectionGeneration !== requestGeneration ||
            connectedRef.current ||
            connection.current !== peer
          )
            return;
          if (
            error instanceof RoomRequestError &&
            error.code === "ROOM_FORBIDDEN"
          ) {
            callbacks.current.onLeft("Phòng không còn khả dụng.");
          } else if (!latest.current) {
            setError(
              "Chưa thể tải phòng. Kiểm tra quyền vào phòng và kết nối.",
            );
          }
        },
      );
    };
    const peer = connect({
      roomId,
      getProof,
      onSnapshot: (value) => {
        if (alive && acceptSnapshot(value)) setError("");
      },
      onConnection: (value) => {
        if (alive) {
          if (value !== connectedRef.current) connectionGeneration++;
          refreshEpoch.current++;
          connectedRef.current = value;
          setConnected(value);
          roomChat.update(null, value);
          if (value) fallbackStarted = false;
          if (value) {
            setDemoDisconnected(false);
            demoRequested.current = false;
          } else if (demoRequested.current) {
            setDemoDisconnected(true);
          }
          if (!value) {
            invalidateCommands();
            audioBaseline.current = true;
            setSnapshot(null);
            loadDisplayFallback();
          }
        }
      },
      onError: (message) => {
        if (alive) setError(message);
      },
      onClosed: (message) => {
        if (alive) {
          roomChat.clear();
          callbacks.current.onLeft(message);
        }
      },
      onChatChanged: (notice) => {
        if (alive) roomChat.changed(notice);
      },
      onDemoCapability: (enabled) => {
        if (alive) setDemoEnabled(enabled);
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
      const current = latest.current;
      if (!current?.match || current.match.status !== "ACTIVE") return;
      const requestEpoch = ++refreshEpoch.current;
      const matchId = current.match.id;
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
      roomChat.clear();
      clearTimeout(loadingTimeout);
      peer.close();
      if (connection.current === peer) connection.current = null;
    };
  }, [roomId, client, getProof, connect, retryCount]);
  return {
    demoEnabled,
    demoDisconnected,
    disconnectDemo: async () => {
      if (
        !demoEnabled ||
        !connectedRef.current ||
        demoRequested.current ||
        !connection.current?.networkDemo
      )
        return;
      const requestEpoch = epoch.current;
      demoRequested.current = true;
      try {
        await connection.current.networkDemo.disconnect();
      } catch {
        if (epoch.current !== requestEpoch) return;
        demoRequested.current = false;
        setError("Chưa thể giả lập mất mạng. Hãy thử lại.");
      }
    },
    reconnectDemo: () => {
      if (demoEnabled && demoDisconnected)
        connection.current?.networkDemo?.reconnect();
    },
    view,
    setView,
    snapshot,
    setSnapshot,
    connected,
    error,
    setError,
    /** Dựng lại kết nối: tạo generation mới, đóng socket cũ và chờ snapshot realtime. */
    retry: () => setRetryCount((value) => value + 1),
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
  };
}
