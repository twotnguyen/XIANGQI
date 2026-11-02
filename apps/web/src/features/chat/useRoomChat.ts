import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { maskForbiddenChat } from "@xiangqi/shared";
import type {
  ChatChannel,
  ChatPage,
  ChatPreview,
  ChatPreviewRevert,
  RoomSnapshot,
} from "@xiangqi/shared";
import { isSingleMove } from "../../shared/room-snapshot.js";
import type { RoomConnection } from "../rooms/room-client.js";
import type { ChatChanged } from "./chat-client.js";
import type { RoomChatChannelState, RoomChatProps } from "./RoomChat.js";
const empty = (scopeToken: string | null = null): RoomChatChannelState => ({
  scopeToken,
  canSend: false,
  messages: [],
  historyReady: false,
  hasMore: false,
  loading: false,
  error: null,
});
interface Work {
  page: ChatPage | null;
  notice: ChatChanged | null;
  dirty: boolean;
  inFlight: Promise<void> | null;
  catchUp: boolean;
  retry: { id: string; content: string; scopeToken: string } | null;
}
interface PreviewEntry {
  id: string;
  channel: ChatChannel;
  message: RoomChatChannelState["messages"][number];
  /** Số thứ tự tin thật lớn nhất đã có lúc tin tạm xuất hiện. */
  afterSeq: number;
  own: boolean;
}
const work = (): Work => ({
  page: null,
  notice: null,
  dirty: false,
  inFlight: null,
  catchUp: false,
  retry: null,
});
const safeError = (error: unknown) =>
  error instanceof Error &&
  [
    "Bạn gửi quá nhanh",
    "Chat tạm thời không dùng được",
    "Quyền đọc chat đã thay đổi",
    "Không có quyền gửi tin nhắn",
    "Phiên đăng nhập không hợp lệ",
    "Bạn không có quyền truy cập kênh chat này",
    "Tin nhắn không hợp lệ",
    "Tab này chỉ có thể xem",
    "Mã lệnh đã được dùng cho nội dung khác",
  ].includes(error.message)
    ? error.message
    : "Chat tạm thời không dùng được";
/**
 * Custom React hook quản lý trạng thái và đồng bộ tin nhắn chat thời gian thực trong phòng cờ (kênh riêng/kênh chung).
 */
export function useRoomChat(
  roomId: string,
  connection: RefObject<RoomConnection | null>,
) {
  const [channels, setChannels] = useState<RoomChatProps["channels"]>({
    ROOM_PUBLIC: empty(),
  });
  const state = useRef(channels);
  const [pendingSend, setPendingSend] = useState<ChatChannel | null>(null);
  const [previews, setPreviews] = useState<PreviewEntry[]>([]);
  const previewTimers = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const pending = useRef<{ channel: ChatChannel } | null>(null);
  const jobs = useRef<Record<ChatChannel, Work>>({
    ROOM_PUBLIC: work(),
    PLAYERS_PRIVATE: work(),
  });
  const context = useRef<{
    snapshot: RoomSnapshot | null;
    connected: boolean;
    key: string;
    control: string;
    scopeVersion: number;
  }>({
    snapshot: null,
    connected: false,
    key: "",
    control: "",
    scopeVersion: 0,
  });
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      previewTimers.current.forEach((timer) => clearTimeout(timer));
      previewTimers.current.clear();
      jobs.current = { ROOM_PUBLIC: work(), PLAYERS_PRIVATE: work() };
      pending.current = null;
    };
  }, []);
  function publish(channel: ChatChannel, next: RoomChatChannelState) {
    if (!alive.current) return;
    state.current = { ...state.current, [channel]: next };
    setChannels(state.current);
  }
  function enabled(channel: ChatChannel) {
    const current = context.current;
    return (
      current.connected &&
      current.snapshot &&
      current.snapshot.room.status !== "CLOSED" &&
      (channel === "ROOM_PUBLIC"
        ? (current.snapshot.room.kind ?? "CUSTOM") === "CUSTOM"
        : current.snapshot.role !== "spectator")
    );
  }
  function current(channel: ChatChannel, w: Work, peer: RoomConnection | null) {
    return (
      alive.current &&
      enabled(channel) &&
      jobs.current[channel] === w &&
      connection.current === peer
    );
  }
  function revoke(channel: ChatChannel, error: unknown) {
    const message = safeError(error);
    const auth = message === "Phiên đăng nhập không hợp lệ";
    const lostScope = [
      "Bạn không có quyền truy cập kênh chat này",
      "Quyền đọc chat đã thay đổi",
    ].includes(message);
    const readOnly = message === "Tab này chỉ có thể xem";
    if (!auth && !lostScope && !readOnly) return false;
    for (const target of auth || readOnly
      ? (["ROOM_PUBLIC", "PLAYERS_PRIVATE"] as const)
      : [channel]) {
      const previous = jobs.current[target],
        s = state.current[target];
      const next = work();
      if (readOnly && previous.page)
        next.page = { ...previous.page, canSend: false };
      jobs.current[target] = next;
      if (s)
        publish(
          target,
          readOnly
            ? { ...s, canSend: false, loading: false, error: message }
            : { ...empty(), error: message },
        );
    }
    if (auth)
      context.current = {
        ...context.current,
        snapshot: null,
        connected: false,
      };
    pending.current = null;
    setPendingSend(null);
    return true;
  }
  function read(channel: ChatChannel, catchUp = false): Promise<void> {
    const w = jobs.current[channel],
      peer = connection.current;
    if (!enabled(channel) || !peer) return Promise.resolve();
    w.catchUp ||= catchUp;
    if (w.inFlight) {
      w.dirty = true;
      return w.inFlight;
    }
    publish(channel, {
      ...(state.current[channel] ?? empty()),
      loading: true,
      error: null,
    });
    const operation = (async () => {
      do {
        w.dirty = false;
        const after = w.page?.nextCursor ?? 0;
        try {
          const page = await peer.readChat(channel, after);
          if (!current(channel, w, peer)) return;
          if (w.dirty) continue;
          if (
            !page ||
            page.roomId !== roomId ||
            page.channel !== channel ||
            page.roomVersion < context.current.scopeVersion ||
            (w.notice && page.roomVersion < w.notice.roomVersion)
          )
            throw new Error("Quyền đọc chat đã thay đổi");
          if (
            page.messages.length > 50 ||
            (page.hasMore && page.nextCursor <= after)
          )
            throw new Error("Chat tạm thời không dùng được");
          if (w.page && w.page.scopeToken !== page.scopeToken) {
            w.page = null;
            w.retry = null;
            w.notice = {
              roomId,
              channel,
              roomVersion: page.roomVersion,
              scopeToken: page.scopeToken,
              canSend: page.canSend,
            };
            publish(channel, { ...empty(page.scopeToken), loading: true });
            w.dirty = true;
            continue;
          }
          const messages =
            w.page?.scopeToken === page.scopeToken
              ? [
                  ...w.page.messages,
                  ...page.messages.filter(
                    (m) =>
                      !w.page!.messages.some(
                        (old) => old.messageId === m.messageId,
                      ),
                  ),
                ]
              : page.messages;
          w.page = { ...page, messages };
          publish(channel, {
            scopeToken: page.scopeToken,
            canSend: page.canSend,
            messages,
            historyThrough:
              state.current[channel]?.scopeToken === page.scopeToken
                ? (state.current[channel]?.historyThrough ??
                  page.latestSequence)
                : page.latestSequence,
            historyReady: true,
            hasMore: page.hasMore,
            loading: w.catchUp && page.hasMore,
            error: null,
          });
          if (w.catchUp && page.hasMore) w.dirty = true;
          if (!page.hasMore) w.catchUp = false;
        } catch (error) {
          if (!current(channel, w, peer)) return;
          if (w.dirty) continue;
          if (!revoke(channel, error))
            publish(channel, {
              ...(state.current[channel] ?? empty()),
              loading: false,
              error: safeError(error),
            });
          // eslint-disable-next-line preserve-caught-error -- UI errors must not retain private upstream details in cause.
          throw new Error(safeError(error));
        }
      } while (w.dirty && current(channel, w, peer));
    })();
    w.inFlight = operation;
    void operation
      .finally(() => {
        if (jobs.current[channel] === w) {
          w.inFlight = null;
          const s = state.current[channel];
          if (s?.loading) publish(channel, { ...s, loading: false });
        }
      })
      .catch(() => {});
    return operation;
  }
  function refresh(channel: ChatChannel, catchUp = false) {
    void read(channel, catchUp).catch(() => {});
  }
  const lastSequence = (channel: ChatChannel) =>
    Math.max(
      0,
      ...(state.current[channel]?.messages.map((m) => m.sequence) ?? []),
    );
  function addPreview(entry: PreviewEntry) {
    setPreviews((prev) =>
      prev.some((p) => p.id === entry.id) ? prev : [...prev, entry],
    );
    previewTimers.current.set(
      entry.id,
      setTimeout(() => dropPreview(entry.id), 15000),
    );
  }
  function dropPreview(id: string) {
    clearTimeout(previewTimers.current.get(id));
    previewTimers.current.delete(id);
    if (alive.current) setPreviews((prev) => prev.filter((p) => p.id !== id));
  }
  function dropAllPreviews() {
    previewTimers.current.forEach((timer) => clearTimeout(timer));
    previewTimers.current.clear();
    if (alive.current) setPreviews([]);
  }
  /** Tin của người khác, server đã kiểm quyền nhưng database chưa lưu. */
  function addRemotePreview(p: ChatPreview) {
    if (p.roomId !== roomId || !enabled(p.channel)) return;
    addPreview({
      id: `${p.channel}:${p.commandId}`,
      channel: p.channel,
      afterSeq: lastSequence(p.channel),
      own: false,
      message: {
        messageId: `preview:${p.commandId}`,
        senderId: p.senderId,
        roomId: p.roomId,
        sequence: 0,
        channel: p.channel,
        content: p.content,
        createdAt: p.createdAt,
        sender: p.sender,
      },
    });
  }
  /** Hiện ngay tin của chính mình (chỉ khi biết tên hiển thị từ snapshot); trả mã để gỡ nếu gửi lỗi. */
  function ownPreview(
    channel: ChatChannel,
    content: string,
    commandId: string,
  ) {
    const snap = context.current.snapshot;
    const displayName =
      snap && snap.role !== "spectator"
        ? snap.room.seatPlayers?.[snap.role]?.displayName
        : undefined;
    if (!snap || snap.role === "spectator" || !displayName) return null;
    const entry: PreviewEntry = {
      id: `${channel}:${commandId}`,
      channel,
      afterSeq: lastSequence(channel),
      own: true,
      message: {
        messageId: `preview:${commandId}`,
        roomId,
        sequence: 0,
        channel,
        content: maskForbiddenChat(content),
        createdAt: new Date().toISOString(),
        sender: {
          displayName,
          isGuest: Boolean(snap.room.seatPlayers?.[snap.role]?.guest),
          role: snap.role,
        },
      },
    };
    addPreview(entry);
    return entry.id;
  }
  function clear() {
    dropAllPreviews();
    context.current = {
      snapshot: null,
      connected: false,
      key: "",
      control: "",
      scopeVersion: 0,
    };
    jobs.current = { ROOM_PUBLIC: work(), PLAYERS_PRIVATE: work() };
    pending.current = null;
    state.current = { ROOM_PUBLIC: empty() };
    if (alive.current) {
      setChannels(state.current);
      setPendingSend(null);
    }
  }
  function update(snapshot: RoomSnapshot | null, connected: boolean) {
    const prior = context.current;
    if (!connected || !snapshot) {
      dropAllPreviews();
      context.current = { ...prior, snapshot: null, connected };
      jobs.current = { ROOM_PUBLIC: work(), PLAYERS_PRIVATE: work() };
      pending.current = null;
      setPendingSend(null);
      const next: RoomChatProps["channels"] = {
        ROOM_PUBLIC: {
          ...empty(state.current.ROOM_PUBLIC.scopeToken),
          historyThrough: state.current.ROOM_PUBLIC.historyThrough,
        },
      };
      if (state.current.PLAYERS_PRIVATE)
        next.PLAYERS_PRIVATE = {
          ...empty(state.current.PLAYERS_PRIVATE.scopeToken),
          historyThrough: state.current.PLAYERS_PRIVATE.historyThrough,
        };
      state.current = next;
      setChannels(next);
      return;
    }
    const key =
      snapshot.role === "spectator"
        ? "viewer"
        : "pair:" +
          [snapshot.room.seats.red, snapshot.room.seats.black].sort().join("|");
    const control = snapshot.control.mode + ":" + snapshot.control.generation;
    const reset =
      !prior.snapshot || prior.key !== key || prior.control !== control;
    const moveOnly = isSingleMove(prior.snapshot, snapshot);
    context.current = {
      snapshot,
      connected,
      key,
      control,
      scopeVersion:
        reset || (!moveOnly && snapshot.version > prior.snapshot!.version)
          ? snapshot.version
          : prior.scopeVersion,
    };
    if (reset) {
      const priorJobs = jobs.current;
      jobs.current = { ROOM_PUBLIC: work(), PLAYERS_PRIVATE: work() };
      pending.current = null;
      setPendingSend(null);
      const keep = prior.key === key;
      if (keep && prior.snapshot) {
        jobs.current.ROOM_PUBLIC.page = priorJobs.ROOM_PUBLIC.page;
        jobs.current.PLAYERS_PRIVATE.page = priorJobs.PLAYERS_PRIVATE.page;
      }
      const scopeUnknown = snapshot.version > (prior.snapshot?.version ?? -1);
      const next: RoomChatProps["channels"] = {
        ROOM_PUBLIC: {
          ...state.current.ROOM_PUBLIC,
          ...(scopeUnknown ? { messages: [], loading: true } : {}),
          canSend: false,
          error: null,
        },
      };
      if (snapshot.role !== "spectator")
        next.PLAYERS_PRIVATE = keep
          ? {
              ...(state.current.PLAYERS_PRIVATE ?? empty()),
              ...(scopeUnknown ? { messages: [], loading: true } : {}),
              canSend: false,
              error: null,
            }
          : empty();
      state.current = next;
      setChannels(next);
      refresh("ROOM_PUBLIC", next.ROOM_PUBLIC.historyThrough !== undefined);
      if (snapshot.role !== "spectator")
        refresh(
          "PLAYERS_PRIVATE",
          next.PLAYERS_PRIVATE?.historyThrough !== undefined,
        );
    } else if (
      !moveOnly &&
      snapshot.version > (prior.snapshot?.version ?? -1)
    ) {
      for (const channel of ["PLAYERS_PRIVATE", "ROOM_PUBLIC"] as const) {
        const s = state.current[channel];
        if (!s || !enabled(channel)) continue;
        if (channel === "PLAYERS_PRIVATE" || snapshot.role === "spectator")
          publish(channel, {
            ...s,
            messages: [],
            loading: true,
            canSend: false,
          });
        refresh(channel);
      }
    }
  }
  function changed(notice: ChatChanged) {
    if (notice.roomId !== roomId || !enabled(notice.channel)) return;
    const channel = notice.channel;
    let w = jobs.current[channel];
    if (notice.roomVersion < (w.notice?.roomVersion ?? 0)) return;
    if (
      state.current[channel]?.scopeToken &&
      state.current[channel]!.scopeToken !== notice.scopeToken
    ) {
      w = work();
      jobs.current[channel] = w;
      publish(channel, empty(notice.scopeToken));
      if (pending.current?.channel === channel) {
        pending.current = null;
        setPendingSend(null);
      }
    } else if (!notice.canSend && state.current[channel])
      publish(channel, { ...state.current[channel]!, canSend: false });
    w.notice = notice;
    refresh(channel, true);
  }
  async function onSend(channel: ChatChannel, content: string) {
    const peer = connection.current,
      w = jobs.current[channel],
      s = state.current[channel];
    if (
      !enabled(channel) ||
      !peer ||
      !s?.canSend ||
      !s.scopeToken ||
      pending.current
    )
      throw new Error("Không có quyền gửi tin nhắn");
    if (w.retry?.content !== content || w.retry.scopeToken !== s.scopeToken)
      w.retry = { id: crypto.randomUUID(), content, scopeToken: s.scopeToken };
    const attempt = { channel };
    pending.current = attempt;
    setPendingSend(channel);
    const echo = ownPreview(channel, content, w.retry.id);
    try {
      await peer.sendChat(channel, content, w.retry.id);
      if (!current(channel, w, peer))
        throw new Error("Quyền đọc chat đã thay đổi");
      w.retry = null;
      refresh(channel, true);
    } catch (error) {
      if (echo) dropPreview(echo);
      if (current(channel, w, peer)) revoke(channel, error);
      // eslint-disable-next-line preserve-caught-error -- UI errors must not retain private upstream details in cause.
      throw new Error(safeError(error));
    } finally {
      if (pending.current === attempt) {
        pending.current = null;
        if (alive.current) setPendingSend(null);
      }
    }
  }
  /** Tin tạm chỉ hiện khi chưa có tin thật khớp (cùng nội dung, vai, đến sau lúc tin tạm xuất hiện). */
  const shownChannels = useMemo(() => {
    if (!previews.length) return channels;
    const out = { ...channels };
    for (const channel of ["ROOM_PUBLIC", "PLAYERS_PRIVATE"] as const) {
      const s = channels[channel];
      if (!s?.scopeToken) continue;
      const extra = previews.filter(
        (p) =>
          p.channel === channel &&
          !s.messages.some(
            (m) =>
              m.sequence > p.afterSeq &&
              m.content === p.message.content &&
              m.sender.role === p.message.sender.role &&
              (p.own || m.senderId === p.message.senderId),
          ),
      );
      if (extra.length)
        out[channel] = {
          ...s,
          messages: [
            ...s.messages,
            ...extra.map((p, i) => ({
              ...p.message,
              sequence: p.afterSeq + 0.5 + i * 0.001,
            })),
          ],
        };
    }
    return out;
  }, [channels, previews]);
  return {
    channels: shownChannels,
    pendingSend,
    update,
    changed,
    clear,
    onSend,
    preview: addRemotePreview,
    revertPreview: (revert: ChatPreviewRevert) =>
      dropPreview(`${revert.channel}:${revert.commandId}`),
    onLoadMore: (channel: ChatChannel) => read(channel),
  };
}
