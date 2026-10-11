import { io, type Socket } from "socket.io-client";
import type {
  ClientRealtimeEvents,
  ServerRealtimeEvents,
  RoomSnapshot,
  RoomAction,
  CommandAcknowledgement,
  RoomStateSnapshot,
} from "@xiangqi/shared";
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
        !/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(entry.inviteCode)))
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
    ![5, 10, 15].includes(room.timeMinutes as number) ||
    !Number.isInteger(room.viewerLimit) ||
    (room.viewerLimit as number) < 0 ||
    (room.viewerLimit as number) > 5 ||
    (room.inviteCode !== null &&
      (typeof room.inviteCode !== "string" ||
        !/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(room.inviteCode)))
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
    const clocks = record(snapshot.clocks),
      match = record(snapshot.match);
    if (
      !Number.isSafeInteger(clocks.redMs) ||
      (clocks.redMs as number) < 0 ||
      !Number.isSafeInteger(clocks.blackMs) ||
      (clocks.blackMs as number) < 0 ||
      !isDate(clocks.asOf) ||
      !["red", "black"].includes(match.turn as string) ||
      !["ACTIVE", "FINISHED", "INTERRUPTED"].includes(match.status as string) ||
      clocks.running !== (match.status === "ACTIVE" ? match.turn : null)
    )
      invalidResponse();
  }
  return snapshot as unknown as RoomSnapshot;
}
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
    create: (input: CreateRoomInput) =>
      request("/rooms", parseEntry, {
        commandId: crypto.randomUUID(),
        ...input,
      }),
    join: (code: string) =>
      request("/rooms/join", parseEntry, {
        commandId: crypto.randomUUID(),
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
  };
}
export type RoomClient = ReturnType<typeof createRoomClient>;
export interface RoomConnection {
  refresh(): Promise<RoomSnapshot>;
  command(action: RoomAction, version: number): Promise<CommandAcknowledgement>;
  close(): void;
}
export interface RoomConnectionInput {
  roomId: string;
  getProof: () => Promise<{ accessToken: string; appSession: string }>;
  onSnapshot: (snapshot: RoomSnapshot) => void;
  onConnection: (connected: boolean) => void;
  onError: (message: string) => void;
  onClosed?: (message: string) => void;
}
export function connectRoom(input: RoomConnectionInput): RoomConnection {
  let closed = false;
  let closureNotified = false;
  const socket: Socket<ServerRealtimeEvents, ClientRealtimeEvents> = io(
    import.meta.env.VITE_API_URL || "http://localhost:3000",
    {
      autoConnect: false,
      auth: (done) => {
        void input.getProof().then(
          (proof) => {
            if (!closed) done({ ...proof, roomId: input.roomId, tabId });
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
    },
  );
  const tabId = crypto.randomUUID();
  socket.on("connect", () => input.onConnection(true));
  socket.on("disconnect", () => input.onConnection(false));
  socket.on("connect_error", () => {
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
      input.onClosed?.("Phòng đã đóng");
    }
  });
  socket.on("session.read_only", () =>
    input.onError("Phiên này đã được mở ở tab khác. Tab hiện tại chỉ xem."),
  );
  socket.connect();
  return {
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
                resolve(parseSnapshot(acknowledgement.snapshot, input.roomId));
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
        commandId: crypto.randomUUID(),
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
                  if (ack.status === "ok" || ack.snapshot !== undefined)
                    parseSnapshot(ack.snapshot, input.roomId);
                  resolve(acknowledgement);
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
    close() {
      closed = true;
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
}
