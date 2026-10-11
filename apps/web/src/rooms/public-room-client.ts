import { io } from "socket.io-client";
import type { PublicRoomAuthProof, PublicRoomView } from "@xiangqi/shared";
import type { AuthorizedFetch } from "./room-client.js";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const invalid = "Phản hồi danh sách phòng không hợp lệ. Vui lòng tải lại.";
const unavailable = "Chưa thể tải danh sách phòng. Vui lòng thử lại.";
const expired = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
const notice = "Ghế vừa có người, bạn đang xem trận";
function fail(): never {
  throw Error(invalid);
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail();
  return value as Record<string, unknown>;
}
function id(value: unknown): value is string {
  return typeof value === "string" && uuid.test(value);
}
function integer(value: unknown, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= max
  );
}
function date(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const days = [
    31,
    year! % 4 === 0 && (year! % 100 !== 0 || year! % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return (
    month! >= 1 &&
    month! <= 12 &&
    day! >= 1 &&
    day! <= days[month! - 1]! &&
    hour! <= 23 &&
    minute! <= 59 &&
    second! <= 59
  );
}
export function parsePublicRooms(value: unknown): PublicRoomView[] {
  if (!Array.isArray(value) || value.length > 50) fail();
  const ids = new Set<string>();
  return value.map((item) => {
    const row = record(item),
      host = record(row.host);
    if (
      !id(row.roomId) ||
      ids.has(row.roomId.toLowerCase()) ||
      typeof row.name !== "string" ||
      !row.name.trim() ||
      Array.from(row.name).length > 60 ||
      typeof host.displayName !== "string" ||
      !host.displayName.trim() ||
      Array.from(host.displayName).length > 30 ||
      typeof host.isGuest !== "boolean" ||
      ![5, 10, 15].includes(row.timeMinutes as number) ||
      !["waiting", "playing"].includes(row.status as string) ||
      !integer(row.viewerLimit, 5) ||
      !integer(row.spectators, row.viewerLimit) ||
      !integer(row.emptySeats, 2) ||
      typeof row.canPlay !== "boolean" ||
      typeof row.canWatch !== "boolean" ||
      (row.canPlay && (row.status !== "waiting" || row.emptySeats === 0)) ||
      (row.canWatch && row.spectators >= row.viewerLimit) ||
      !(row.publicOpenedAt === null || date(row.publicOpenedAt))
    )
      fail();
    ids.add(row.roomId.toLowerCase());
    return {
      roomId: row.roomId,
      name: row.name,
      host: { displayName: host.displayName, isGuest: host.isGuest },
      timeMinutes: row.timeMinutes as number,
      status: row.status as "waiting" | "playing",
      spectators: row.spectators,
      viewerLimit: row.viewerLimit,
      emptySeats: row.emptySeats,
      canPlay: row.canPlay,
      canWatch: row.canWatch,
      publicOpenedAt: row.publicOpenedAt,
    };
  });
}
export interface PublicRoomEntry {
  roomId: string;
  version: number;
  role: "red" | "black" | "spectator";
  notice?: string;
}
export class PublicRoomRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(
      status === 401
        ? expired
        : code === "ROOM_NOT_PUBLIC"
          ? "Phòng không còn công khai. Hãy làm mới danh sách."
          : unavailable,
    );
  }
}
export function makePublicRoomClient(authorizedFetch: AuthorizedFetch) {
  async function response(path: string, init: RequestInit) {
    const response = await authorizedFetch(path, init);
    if (!response.ok) {
      let code = "PUBLIC_ROOMS_UNAVAILABLE";
      try {
        const value = record(await response.json());
        if (value.code === "ROOM_NOT_PUBLIC") code = value.code;
      } catch {
        /* Raw error bodies are never displayed. */
      }
      throw new PublicRoomRequestError(response.status, code);
    }
    try {
      return (await response.json()) as unknown;
    } catch {
      return fail();
    }
  }
  return {
    async list() {
      return parsePublicRooms(
        await response("/public-rooms", { method: "GET" }),
      );
    },
    async join(
      roomId: string,
      preference: "play" | "watch",
    ): Promise<PublicRoomEntry> {
      if (!id(roomId) || !["play", "watch"].includes(preference))
        throw Error("Thông tin phòng không hợp lệ.");
      const row = record(
        await response(`/public-rooms/${roomId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commandId: crypto.randomUUID(), preference }),
        }),
      );
      if (
        !id(row.roomId) ||
        row.roomId.toLowerCase() !== roomId.toLowerCase() ||
        !integer(row.version, Number.MAX_SAFE_INTEGER) ||
        !["red", "black", "spectator"].includes(row.role as string) ||
        (row.notice !== undefined && row.notice !== notice)
      )
        fail();
      return {
        roomId: row.roomId,
        version: row.version,
        role: row.role as PublicRoomEntry["role"],
        ...(row.notice === undefined ? {} : { notice }),
      };
    },
  };
}
export interface PublicRoomsConnectionInput {
  getProof: () => Promise<PublicRoomAuthProof>;
  onRooms: (rooms: PublicRoomView[], serverNow: string) => void;
  /** Ready for actions, not merely physically connected. */
  onConnection: (ready: boolean) => void;
  onError: (message: string) => void;
}
function proof(value: unknown): PublicRoomAuthProof {
  const row = record(value),
    cap = (v: unknown) =>
      typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
  if (
    row.kind === "member" &&
    Object.keys(row).length === 3 &&
    typeof row.accessToken === "string" &&
    row.accessToken.length > 0 &&
    row.accessToken.length <= 8192 &&
    !/\s/.test(row.accessToken) &&
    cap(row.appSession)
  )
    return {
      kind: "member",
      accessToken: row.accessToken,
      appSession: row.appSession as string,
    };
  if (
    row.kind === "guest" &&
    Object.keys(row).length === 2 &&
    cap(row.guestCapability)
  )
    return { kind: "guest", guestCapability: row.guestCapability as string };
  throw Error(expired);
}
export function connectPublicRooms(input: PublicRoomsConnectionInput) {
  let closed = false,
    denied = false,
    connected = false,
    epoch = 0;
  const current = () => !closed && !denied;
  const socket = io(
    `${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "")}/public-rooms`,
    {
      path: "/public-rooms/socket.io",
      autoConnect: false,
      auth: (done) => {
        const attempt = ++epoch;
        input.onConnection(false);
        void input.getProof().then(
          (value) => {
            if (!current() || attempt !== epoch) return;
            let safe: PublicRoomAuthProof;
            try {
              safe = proof(value);
            } catch {
              denied = true;
              input.onConnection(false);
              input.onError(expired);
              socket.disconnect();
              return;
            }
            done(safe);
          },
          () => {
            if (!current() || attempt !== epoch) return;
            input.onConnection(false);
            input.onError(unavailable);
            socket.disconnect();
          },
        );
      },
    },
  );
  socket.on("connect", () => {
    connected = true;
    if (current()) input.onConnection(false);
  });
  socket.on("disconnect", () => {
    connected = false;
    if (closed) return;
    epoch++;
    input.onConnection(false);
  });
  socket.on("connect_error", (error: Error) => {
    if (!current()) return;
    input.onConnection(false);
    if (error.message === "Phiên truy cập không hợp lệ") {
      denied = true;
      epoch++;
      socket.disconnect();
      input.onError(expired);
    } else input.onError(unavailable);
  });
  socket.on("public.rooms", (value: unknown) => {
    if (!connected || !current()) return;
    let rooms: PublicRoomView[], serverNow: string;
    try {
      const packet = record(value);
      if (!date(packet.serverNow)) fail();
      serverNow = packet.serverNow;
      rooms = parsePublicRooms(packet.rooms);
    } catch {
      input.onConnection(false);
      input.onError(invalid);
      return;
    }
    input.onRooms(rooms, serverNow);
    input.onConnection(true);
  });
  socket.on("public.error", (value: unknown) => {
    if (!current()) return;
    input.onConnection(false);
    if (
      value &&
      typeof value === "object" &&
      (value as { code?: unknown }).code === "AUTH_REQUIRED"
    ) {
      denied = true;
      epoch++;
      socket.disconnect();
      input.onError(expired);
    } else input.onError(unavailable);
  });
  socket.connect();
  return {
    close() {
      if (closed) return;
      closed = true;
      epoch++;
      socket.removeAllListeners();
      socket.disconnect();
      input.onConnection(false);
    },
  };
}
