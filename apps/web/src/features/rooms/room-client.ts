import { io, type Socket } from "socket.io-client";
import { isSingleMove } from "../../shared/room-snapshot.js";
import type { PublicRoomAuthProof } from "@xiangqi/shared";
import { handshakeAuth } from "../../shared/realtime-proof.js";
import type {
  ClientRealtimeEvents,
  ServerRealtimeEvents,
  RoomSnapshot,
  RoomAction,
  CommandAcknowledgement,
  RoomStateSnapshot,
  ChatChannel,
  ChatPage,
  ChatSent,
  ClientChatEvents,
  ServerChatEvents,
} from "@xiangqi/shared";
import {
  parseChatPage,
  parseChatSent,
  parseChatChanged,
  chatAcknowledgement,
  chatUuid,
  isChatChannel,
  type ChatChanged,
} from "../chat/chat-client.js";
import type { CreateRoomInput } from "./RoomForms.js";
export type RoomView = Pick<
  RoomStateSnapshot,
  "serverNow" | "roomId" | "version" | "room" | "role"
>;
export interface RoomEntry {
  roomId: string;
  version: number;
  role: "red" | "black" | "spectator";
  inviteCode?: string;
  notice?: string;
}
export type AuthorizedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

/**
 * Lớp lỗi xử lý các lỗi yêu cầu HTTP liên quan đến phòng cờ (quyền chủ phòng, đủ người để khóa, phiên hết hạn...).
 */
export class RoomRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    context?: "visibility",
  ) {
    super(
      code === "ROOM_LOCK_REQUIRES_PLAYERS"
        ? "Chỉ khoá được khi đã đủ 2 người chơi"
        : code === "ROOM_FORBIDDEN" && context === "visibility"
          ? "Chỉ chủ phòng được đổi chế độ"
          : code === "ROOM_FULL"
            ? "Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"
            : code === "ROOM_BLOCKED"
              ? "Bạn đã bị đuổi và chặn tham gia phòng cờ này!"
              : code === "ROOM_LOCKED"
                ? "Phòng đã khóa, không thể nhận người mới."
                : code === "ROOM_FORBIDDEN" || code === "ROOM_CODE_CHANGED"
                  ? "Mã phòng không tồn tại hoặc phòng đã đóng"
                  : code === "ALREADY_SEATED"
                    ? "Bạn đang ở trong một ván/phòng khác"
                    : code === "VERSION_STALE"
                      ? "Phòng đã thay đổi. Kiểm tra trạng thái mới rồi thử lại."
                      : status === 401
                        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                        : status === 503
                          ? "Chức năng phòng chưa sẵn sàng. Vui lòng thử lại."
                          : "Thao tác chưa thực hiện được. Kiểm tra thông tin và quyền vào phòng.",
    );
  }
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
import { getApiBaseUrl } from "../../shared/api.js";
import { generateUuid } from "../../shared/uuid.js";

function invalidResponse(): never {
  throw new Error("Phản hồi phòng không hợp lệ. Vui lòng tải lại.");
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalidResponse();
  return value as Record<string, unknown>;
}
function isId(value: unknown) {
  return typeof value === "string" && uuid.test(value);
}
function isDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function parseEntry(value: unknown): RoomEntry {
  const entry = record(value);
  if (
    !isId(entry.roomId) ||
    !Number.isSafeInteger(entry.version) ||
    (entry.version as number) < 0 ||
    !["red", "black", "spectator"].includes(entry.role as string) ||
    (entry.inviteCode !== undefined &&
      (typeof entry.inviteCode !== "string" ||
        !/^[0-9]{8}$/.test(entry.inviteCode)))
  )
    invalidResponse();
  return entry as unknown as RoomEntry;
}
function parseView(value: unknown, roomId: string): RoomView {
  const view = record(value);
  parseEntry(view);
  if (view.roomId !== roomId || !isDate(view.serverNow)) invalidResponse();
  const room = record(view.room),
    seats = record(room.seats),
    ready = record(room.ready),
    connected = record(room.connected),
    grace = record(room.graceUntil);
  if (
    typeof room.name !== "string" ||
    !["WAITING", "PLAYING", "FINISHED", "CLOSED"].includes(
      room.status as string,
    ) ||
    !["PUBLIC", "CODE_ONLY", "LOCKED"].includes(room.visibility as string) ||
    (room.hostId !== null && !isId(room.hostId)) ||
    ![0, 5, 10, 15].includes(room.timeMinutes as number) ||
    !Number.isInteger(room.viewerLimit) ||
    (room.viewerLimit as number) < 0 ||
    (room.viewerLimit as number) > 5 ||
    (room.inviteCode !== null &&
      (typeof room.inviteCode !== "string" ||
        !/^[0-9]{8}$/.test(room.inviteCode)))
  )
    invalidResponse();
  for (const side of ["red", "black"])
    if (
      (seats[side] !== null && !isId(seats[side])) ||
      typeof ready[side] !== "boolean" ||
      typeof connected[side] !== "boolean" ||
      (grace[side] !== null && !isDate(grace[side]))
    )
      invalidResponse();
  if (room.countdown !== null) {
    const countdown = record(room.countdown);
    if (!isId(countdown.token) || !isDate(countdown.dueAt)) invalidResponse();
  }
  if (room.swapOffer !== null && room.swapOffer !== undefined) {
    const offer = record(room.swapOffer);
    if (
      !isId(offer.id) ||
      !isId(offer.proposerId) ||
      !isId(offer.responderId) ||
      !isDate(offer.expiresAt)
    )
      invalidResponse();
  }
  if (room.downOffer !== null && room.downOffer !== undefined) {
    const offer = record(room.downOffer);
    if (!isId(offer.id) || !isId(offer.inviteeId) || !isDate(offer.expiresAt))
      invalidResponse();
  }
  if (
    room.swapCooldownUntil !== null &&
    room.swapCooldownUntil !== undefined &&
    !isDate(room.swapCooldownUntil)
  )
    invalidResponse();
  if (!Array.isArray(room.spectators)) invalidResponse();
  for (const entry of room.spectators as unknown[]) {
    const watcher = record(entry);
    if (
      typeof watcher.userId !== "string" ||
      !isId(watcher.userId) ||
      typeof watcher.displayName !== "string"
    )
      invalidResponse();
  }
  return view as unknown as RoomView;
}
function parseSnapshot(value: unknown, roomId: string): RoomSnapshot {
  parseView(value, roomId);
  const snapshot = record(value);
  if (snapshot.match !== null) {
    const match = record(snapshot.match);
    if (
      !isId(match.id) ||
      !Number.isSafeInteger(match.version) ||
      (match.version as number) < 0
    )
      invalidResponse();
    if (match.lastMove !== null) {
      const move = record(match.lastMove);
      if (
        !Number.isInteger(move.from) ||
        !Number.isInteger(move.to) ||
        (move.from as number) < 0 ||
        (move.from as number) > 89 ||
        (move.to as number) < 0 ||
        (move.to as number) > 89 ||
        move.from === move.to ||
        !Number.isSafeInteger(move.eventVersion) ||
        (move.eventVersion as number) <= 0 ||
        (move.eventVersion as number) > (match.version as number)
      )
        invalidResponse();
    }
  }
  if (snapshot.match === null) {
    if (snapshot.clocks !== null) invalidResponse();
  } else {
    const match = record(snapshot.match);
    if (
      !["red", "black"].includes(match.turn as string) ||
      !["ACTIVE", "FINISHED", "INTERRUPTED"].includes(match.status as string)
    )
      invalidResponse();
    if (record(snapshot.room).timeMinutes === 0) {
      if (snapshot.clocks !== null) invalidResponse();
      if (match.status === "ACTIVE") {
        const inactivity = record(match.inactivity);
        if (
          !isDate(inactivity.promptAt) ||
          !isDate(inactivity.expiresAt) ||
          Date.parse(inactivity.promptAt as string) >=
            Date.parse(inactivity.expiresAt as string) ||
          ![0, 1, 2].includes(inactivity.confirmsLeft as number)
        )
          invalidResponse();
      } else if (match.inactivity !== null) invalidResponse();
    } else {
      const clocks = record(snapshot.clocks);
      if (
        !Number.isSafeInteger(clocks.redMs) ||
        (clocks.redMs as number) < 0 ||
        !Number.isSafeInteger(clocks.blackMs) ||
        (clocks.blackMs as number) < 0 ||
        !isDate(clocks.asOf) ||
        clocks.running !== (match.status === "ACTIVE" ? match.turn : null)
      )
        invalidResponse();
    }
  }
  let normalizedDraw: RoomSnapshot["draw"] = null;
  if (snapshot.draw !== undefined && snapshot.draw !== null) {
    if (
      snapshot.role === "spectator" ||
      snapshot.match === null ||
      record(snapshot.match).status !== "ACTIVE"
    )
      invalidResponse();
    const draw = record(snapshot.draw),
      remaining = record(draw.remainingMoves);
    if (
      !Array.isArray(draw.offers) ||
      draw.offers.length > 2 ||
      ![remaining.red, remaining.black].every(
        (value) =>
          Number.isInteger(value) &&
          (value as number) >= 0 &&
          (value as number) <= 5,
      )
    )
      invalidResponse();
    const ids = new Set<string>(),
      senders = new Set<string>();
    const offers = draw.offers.map((value) => {
      const offer = record(value);
      if (
        !isId(offer.id) ||
        !["red", "black"].includes(offer.sender as string) ||
        !isDate(offer.expiresAt) ||
        ids.has((offer.id as string).toLowerCase()) ||
        senders.has(offer.sender as string)
      )
        invalidResponse();
      ids.add((offer.id as string).toLowerCase());
      senders.add(offer.sender as string);
      return {
        id: offer.id as string,
        sender: offer.sender as "red" | "black",
        expiresAt: offer.expiresAt as string,
      };
    });
    normalizedDraw = {
      offers,
      remainingMoves: {
        red: remaining.red as number,
        black: remaining.black as number,
      },
    };
  }
  return { ...(snapshot as unknown as RoomSnapshot), draw: normalizedDraw };
}

/**
 * Khởi tạo client REST API để quản lý phòng cờ.
 * Cung cấp các thao tác: tạo phòng (create), vào phòng bằng mã (join), lấy snapshot,
 * thay đổi chế độ hiển thị (changeVisibility), đổi ghế (switchSeat), chuyển sang xem (toSpectator),
 * mời/đáp lại lời mời xuống ghế (inviteDown, respondDown), đuổi người xem (kickViewer),
 * rời phòng (leave), và đề xuất/rút/đáp lại hoán đổi ghế (proposeSwap, withdrawSwap, respondSwap).
 */
export function createRoomClient(authorizedFetch: AuthorizedFetch) {
  async function request<T>(
    path: string,
    parse: (value: unknown) => T,
    body?: object,
    context?: "visibility",
  ): Promise<T> {
    const response = await authorizedFetch(path, {
      method: body ? "POST" : "GET",
      redirect: "error",
      cache: "no-store",
      ...(body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    if (!response.ok) {
      let code = "ROOM_UNAVAILABLE";
      try {
        const value = (await response.json()) as { code?: unknown };
        if (typeof value.code === "string") code = value.code;
      } catch {
        /* Do not display upstream response bodies. */
      }
      throw new RoomRequestError(code, response.status, context);
    }
    try {
      return parse(await response.json());
    } catch {
      throw new Error("Phản hồi phòng không hợp lệ. Vui lòng tải lại.");
    }
  }
  return {
    create: (input: CreateRoomInput, commandId: string = generateUuid()) =>
      request("/rooms", parseEntry, {
        ...input,
        commandId,
      }),
    join: (code: string) =>
      request("/rooms/join", parseEntry, {
        commandId: generateUuid(),
        code,
        preference: "auto",
      }),
    snapshot: (roomId: string) =>
      request(`/rooms/${encodeURIComponent(roomId)}`, (value) =>
        parseView(value, roomId),
      ),
    changeVisibility: (
      roomId: string,
      expectedVersion: number,
      visibility: RoomView["room"]["visibility"],
    ) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/visibility`,
        (value) => parseView(value, roomId),
        { expectedVersion, visibility },
        "visibility",
      ),
    switchSeat: (roomId: string, expectedVersion: number) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/switch-seat`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
        },
      ),
    toSpectator: (roomId: string, expectedVersion: number) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/to-spectator`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
        },
      ),
    moveToSpectator: (
      roomId: string,
      expectedVersion: number,
      targetId: string,
    ) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/move-to-spectator`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
          targetId,
        },
      ),
    inviteDown: (roomId: string, expectedVersion: number, targetId: string) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/invite-down`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
          targetId,
        },
      ),
    respondDown: (roomId: string, expectedVersion: number, accept: boolean) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/respond-down`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
          accept,
        },
      ),
    kickViewer: (roomId: string, expectedVersion: number, targetId: string) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/kick`,
        (value) => parseView(value, roomId),
        {
          expectedVersion,
          targetId,
        },
      ),
    leave: (roomId: string, expectedVersion: number) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/leave`,
        (value) => {
          const result = record(value);
          if (result.roomId !== roomId || result.left !== true)
            invalidResponse();
          return { roomId, left: true as const };
        },
        { expectedVersion },
      ),
    proposeSwap: (roomId: string, expectedVersion: number) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/swap-propose`,
        (value) => parseView(value, roomId),
        { expectedVersion },
      ),
    withdrawSwap: (roomId: string, expectedVersion: number) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/swap-withdraw`,
        (value) => parseView(value, roomId),
        { expectedVersion },
      ),
    respondSwap: (roomId: string, expectedVersion: number, accept: boolean) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/swap-respond`,
        (value) => parseView(value, roomId),
        { expectedVersion, accept },
      ),
    proposeRematch: (
      roomId: string,
      expectedVersion: number,
      side: "KEEP" | "SWAP",
    ) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/rematch-propose`,
        (value) => parseView(value, roomId),
        { expectedVersion, side },
      ),
    respondRematch: (
      roomId: string,
      expectedVersion: number,
      accept: boolean,
    ) =>
      request(
        `/rooms/${encodeURIComponent(roomId)}/rematch-respond`,
        (value) => parseView(value, roomId),
        { expectedVersion, accept },
      ),
  };
}
export type RoomClient = ReturnType<typeof createRoomClient>;
export interface RoomConnection {
  refresh(): Promise<RoomSnapshot>;
  command(action: RoomAction, version: number): Promise<CommandAcknowledgement>;
  readonly tabId: string;
  takeover(): Promise<void>;
  readChat(channel: ChatChannel, after?: number): Promise<ChatPage>;
  sendChat(
    channel: ChatChannel,
    content: string,
    commandId: string,
  ): Promise<ChatSent>;
  close(): void;
}
export interface RoomConnectionInput {
  roomId: string;
  getProof: () => Promise<PublicRoomAuthProof>;
  onSnapshot: (snapshot: RoomSnapshot) => void;
  onConnection: (connected: boolean) => void;
  onError: (message: string) => void;
  onClosed?: (message: string) => void;
  onChatChanged?: (notice: ChatChanged) => void;
}

/**
 * Thiết lập kết nối thời gian thực qua Socket.IO tới namespace gốc (`/`) tại `/api/socket.io` cho một phòng cờ cụ thể.
 * Đồng bộ snapshot phòng (bàn cờ, đồng hồ, lượt đi, danh sách người chơi/khán giả),
 * gửi lệnh ván cờ (đi quân, xin hòa, chấp nhận/từ chối hòa, đầu hàng, sẵn sàng),
 * tích hợp đọc/gửi tin nhắn chat trong phòng, và tự động xử lý kết nối lại/mất kết nối.
 */
export function connectRoom(input: RoomConnectionInput): RoomConnection {
  let closed = false;
  let closureNotified = false;
  let chatEpoch = 0;
  let latestRoomVersion = -1;
  let chatScopeVersion = -1;
  let latestSnapshot: RoomSnapshot | null = null;
  let chatRoomAuthority: string | null = null;
  const chatNotices = new Map<ChatChannel, ChatChanged>();
  const chatGrants = new Map<ChatChannel, ChatChanged>();
  const chatReads = new Map<ChatChannel, number>();
  function invalidateChat() {
    chatEpoch++;
    chatGrants.clear();
  }
  function observeSnapshot(snapshot: RoomSnapshot) {
    if (snapshot.version < latestRoomVersion) return;
    if (
      snapshot.version > latestRoomVersion &&
      !isSingleMove(latestSnapshot, snapshot)
    )
      chatScopeVersion = snapshot.version;
    latestSnapshot = snapshot;
    latestRoomVersion = snapshot.version;
    const authority = JSON.stringify([
      snapshot.role === "spectator" ? "spectator" : "player",
      [snapshot.room.seats.red, snapshot.room.seats.black].sort(),
      snapshot.control.mode,
      snapshot.control.reason,
      snapshot.control.generation,
    ]);
    if (authority !== chatRoomAuthority) {
      chatRoomAuthority = authority;
      chatScopeVersion = snapshot.version;
      invalidateChat();
    }
  }
  const api = new URL(getApiBaseUrl());
  const socket: Socket<
    ServerRealtimeEvents & ServerChatEvents,
    ClientRealtimeEvents & ClientChatEvents
  > = io(api.origin, {
    path: `${api.pathname}/socket.io`,
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false,
    auth: (done) => {
      invalidateChat();
      void input.getProof().then(
        (proof) => {
          if (!closed)
            done({ ...handshakeAuth(proof), roomId: input.roomId, tabId });
        },
        () => {
          if (closed) return;
          input.onError(
            "Phiên đăng nhập chưa sẵn sàng. Vui lòng đăng nhập lại.",
          );
          done({});
        },
      );
    },
  });
  const tabId = generateUuid();
  socket.on("connect", () => {
    invalidateChat();
    input.onConnection(true);
  });
  socket.on("disconnect", () => {
    invalidateChat();
    input.onConnection(false);
  });
  socket.on("connect_error", () => {
    invalidateChat();
    input.onConnection(false);
    input.onError("Chưa thể kết nối phòng. Kiểm tra mạng và phiên đăng nhập.");
  });
  socket.on("room.snapshot", (snapshot) => {
    if (closed) return;
    let parsed: RoomSnapshot;
    try {
      parsed = parseSnapshot(snapshot, input.roomId);
    } catch {
      input.onError("Phản hồi phòng không hợp lệ. Vui lòng tải lại.");
      return;
    }
    observeSnapshot(parsed);
    input.onSnapshot(parsed);
  });
  socket.on("room.closed", (notice) => {
    if (
      !closed &&
      !closureNotified &&
      notice?.roomId === input.roomId &&
      notice.message === "Phòng đã đóng"
    ) {
      closureNotified = true;
      invalidateChat();
      input.onClosed?.("Phòng đã đóng");
    }
  });
  socket.on("session.read_only", () => {
    invalidateChat();
    input.onError("Phiên này đã được mở ở tab khác. Tab hiện tại chỉ xem.");
  });
  socket.on("chat.changed", (value) => {
    if (closed || closureNotified) return;
    let notice: ChatChanged;
    try {
      notice = parseChatChanged(value, input.roomId);
    } catch {
      input.onError("Phản hồi chat không hợp lệ. Vui lòng thử lại.");
      return;
    }
    const previous = chatNotices.get(notice.channel);
    if (notice.roomVersion < latestRoomVersion) return;
    if (previous && notice.roomVersion < previous.roomVersion) return;
    chatNotices.set(notice.channel, notice);
    chatReads.set(notice.channel, (chatReads.get(notice.channel) ?? 0) + 1);
    if (
      !previous ||
      previous.scopeToken !== notice.scopeToken ||
      previous.canSend !== notice.canSend
    )
      chatGrants.delete(notice.channel);
    input.onChatChanged?.(notice);
  });
  queueMicrotask(() => {
    if (!closed) socket.connect();
  });
  return {
    tabId,
    readChat(channel, after = 0) {
      if (!isChatChannel(channel) || !Number.isSafeInteger(after) || after < 0)
        return Promise.reject(new Error("Tin nhắn không hợp lệ"));
      if (closed || closureNotified || !socket.connected)
        return Promise.reject(new Error("Kết nối phòng đang gián đoạn."));
      const epoch = chatEpoch,
        revision = (chatReads.get(channel) ?? 0) + 1;
      chatReads.set(channel, revision);
      return new Promise((resolve, reject) => {
        socket
          .timeout(8000)
          .emit(
            "chat.read",
            { channel, after },
            (error: Error | null, acknowledgement: unknown) => {
              if (
                closed ||
                error ||
                !socket.connected ||
                epoch !== chatEpoch ||
                revision !== chatReads.get(channel)
              ) {
                reject(new Error("Chat tạm thời không dùng được"));
                return;
              }
              try {
                const page = parseChatPage(
                  chatAcknowledgement(acknowledgement),
                  input.roomId,
                  channel,
                  after,
                );
                const notice = chatNotices.get(channel);
                if (
                  page.roomVersion < chatScopeVersion ||
                  (notice && page.roomVersion < notice.roomVersion)
                )
                  throw new Error("Quyền đọc chat đã thay đổi");
                const authority = {
                  roomId: page.roomId,
                  channel,
                  roomVersion: page.roomVersion,
                  scopeToken: page.scopeToken,
                  canSend: page.canSend,
                };
                chatNotices.set(channel, authority);
                chatGrants.set(channel, authority);
                resolve(page);
              } catch (failure) {
                reject(failure);
              }
            },
          );
      });
    },
    sendChat(channel, content, commandId) {
      if (
        !isChatChannel(channel) ||
        typeof content !== "string" ||
        !content.trim() ||
        Array.from(content).length > 200 ||
        typeof commandId !== "string" ||
        !chatUuid.test(commandId)
      )
        return Promise.reject(new Error("Tin nhắn không hợp lệ"));
      if (closed || closureNotified || !socket.connected)
        return Promise.reject(new Error("Kết nối phòng đang gián đoạn."));
      const grant = chatGrants.get(channel),
        epoch = chatEpoch;
      if (!grant?.canSend)
        return Promise.reject(new Error("Không có quyền gửi tin nhắn"));
      return new Promise((resolve, reject) => {
        socket
          .timeout(8000)
          .emit(
            "chat.send",
            { channel, content, commandId },
            (error: Error | null, acknowledgement: unknown) => {
              const current = chatGrants.get(channel);
              if (
                closed ||
                error ||
                !socket.connected ||
                epoch !== chatEpoch ||
                !current?.canSend ||
                current.scopeToken !== grant.scopeToken
              ) {
                reject(new Error("Chat tạm thời không dùng được"));
                return;
              }
              try {
                resolve(parseChatSent(chatAcknowledgement(acknowledgement)));
              } catch (failure) {
                reject(failure);
              }
            },
          );
      });
    },
    refresh() {
      if (closed || !socket.connected)
        return Promise.reject(new Error("Kết nối phòng đang gián đoạn."));
      return new Promise((resolve, reject) => {
        socket
          .timeout(8000)
          .emit(
            "room.sync",
            (error: Error | null, acknowledgement: CommandAcknowledgement) => {
              if (closed || error || acknowledgement?.status !== "ok") {
                reject(
                  new Error(
                    "Chưa thể đồng bộ phòng. Kiểm tra kết nối và phiên đăng nhập.",
                  ),
                );
                return;
              }
              try {
                const parsed = parseSnapshot(
                  acknowledgement.snapshot,
                  input.roomId,
                );
                observeSnapshot(parsed);
                resolve(parsed);
              } catch {
                reject(
                  new Error("Phản hồi phòng không hợp lệ. Vui lòng tải lại."),
                );
              }
            },
          );
      });
    },
    command(action, expectedVersion) {
      if (!socket.connected)
        return Promise.reject(new Error("Kết nối phòng đang gián đoạn."));
      const command = {
        commandId: generateUuid(),
        roomId: input.roomId,
        expectedVersion,
        action,
      };
      return new Promise((resolve, reject) => {
        socket
          .timeout(8000)
          .emit(
            "room.command",
            command,
            (error: Error | null, acknowledgement: CommandAcknowledgement) => {
              if (error)
                reject(
                  new Error(
                    "Chưa nhận được xác nhận. Kiểm tra trạng thái phòng trước khi thao tác lại.",
                  ),
                );
              else {
                try {
                  const ack = record(acknowledgement);
                  if (ack.status === "ok" || ack.snapshot !== undefined) {
                    const parsed = parseSnapshot(ack.snapshot, input.roomId);
                    observeSnapshot(parsed);
                    resolve({
                      ...acknowledgement,
                      snapshot: parsed,
                    });
                  } else resolve(acknowledgement);
                } catch {
                  reject(
                    new Error("Phản hồi phòng không hợp lệ. Vui lòng tải lại."),
                  );
                }
              }
            },
          );
      });
    },
    takeover() {
      if (closed || closureNotified || !socket.connected)
        return Promise.reject(new Error("Kết nối phòng đang gián đoạn."));
      return new Promise<void>((resolve, reject) => {
        socket
          .timeout(8000)
          .emit(
            "session.takeover",
            (error: Error | null, acknowledgement: CommandAcknowledgement) => {
              if (closed || error) {
                reject(new Error("Chưa nhận được xác nhận giành quyền."));
                return;
              }
              if (acknowledgement?.status !== "ok") {
                reject(
                  new Error(
                    acknowledgement?.error?.message ??
                      "Không thể giành lại quyền thao tác.",
                  ),
                );
                return;
              }
              try {
                const parsed = parseSnapshot(
                  acknowledgement.snapshot,
                  input.roomId,
                );
                observeSnapshot(parsed);
                input.onSnapshot(parsed);
                resolve();
              } catch {
                reject(
                  new Error("Phản hồi phòng không hợp lệ. Vui lòng tải lại."),
                );
              }
            },
          );
      });
    },
    close() {
      closed = true;
      invalidateChat();
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
}
