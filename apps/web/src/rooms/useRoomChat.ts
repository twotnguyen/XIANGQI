import { useEffect, useRef, useState, type RefObject } from "react";
import type { ChatChannel, ChatPage, RoomSnapshot } from "@xiangqi/shared";
import type { RoomConnection } from "./room-client.js";
import type { ChatChanged } from "./chat-client.js";
import type { RoomChatChannelState, RoomChatProps } from "../chat/RoomChat.js";
const empty = (scopeToken: string | null = null): RoomChatChannelState => ({
  scopeToken,
  canSend: false,
  messages: [],
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
export function useRoomChat(
  roomId: string,
  connection: RefObject<RoomConnection | null>,
) {
  const [channels, setChannels] = useState<RoomChatProps["channels"]>({
    ROOM_PUBLIC: empty(),
  });
  const state = useRef(channels);
  const [pendingSend, setPendingSend] = useState<ChatChannel | null>(null);
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
  }>({ snapshot: null, connected: false, key: "", control: "" });
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
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
      (channel === "ROOM_PUBLIC" || current.snapshot.role !== "spectator")
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
            page.roomVersion < context.current.snapshot!.version ||
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
  function clear() {
    context.current = {
      snapshot: null,
      connected: false,
      key: "",
      control: "",
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
      context.current = { ...prior, snapshot: null, connected };
      jobs.current = { ROOM_PUBLIC: work(), PLAYERS_PRIVATE: work() };
      pending.current = null;
      setPendingSend(null);
      const next: RoomChatProps["channels"] = {
        ROOM_PUBLIC: empty(state.current.ROOM_PUBLIC.scopeToken),
      };
      if (state.current.PLAYERS_PRIVATE)
        next.PLAYERS_PRIVATE = empty(state.current.PLAYERS_PRIVATE.scopeToken);
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
    context.current = { snapshot, connected, key, control };
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
        ROOM_PUBLIC: keep
          ? {
              ...state.current.ROOM_PUBLIC,
              ...(scopeUnknown && snapshot.role === "spectator"
                ? { messages: [], loading: true }
                : {}),
              canSend: false,
              error: null,
            }
          : empty(),
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
      refresh("ROOM_PUBLIC");
      if (snapshot.role !== "spectator") refresh("PLAYERS_PRIVATE");
    } else if (snapshot.version > (prior.snapshot?.version ?? -1)) {
      for (const channel of ["PLAYERS_PRIVATE", "ROOM_PUBLIC"] as const) {
        const s = state.current[channel];
        if (!s || !enabled(channel)) continue;
        if (channel === "PLAYERS_PRIVATE" || snapshot.role === "spectator")
          publish(channel, {
            ...s,
            messages: [],
            canSend: false,
            loading: true,
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
    try {
      await peer.sendChat(channel, content, w.retry.id);
      if (!current(channel, w, peer))
        throw new Error("Quyền đọc chat đã thay đổi");
      w.retry = null;
      refresh(channel, true);
    } catch (error) {
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
  return {
    channels,
    pendingSend,
    update,
    changed,
    clear,
    onSend,
    onLoadMore: (channel: ChatChannel) => read(channel),
  };
}
