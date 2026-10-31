import type {
  RealtimeHandshake,
  RoomAction,
  RoomCommand,
} from "@xiangqi/shared";
import type { RoomRequestProof } from "../room/room-session.js";
import { RealtimeError } from "./realtime.types.js";

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new RealtimeError("COMMAND_INVALID", "Dữ liệu lệnh không hợp lệ");
  return value as Record<string, unknown>;
}
export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new RealtimeError("COMMAND_INVALID", "Dữ liệu lệnh không hợp lệ");
  return value.toLowerCase();
}
/**
 * Phân tích và kiểm tra tính hợp lệ của payload bắt tay (handshake auth) khi client mở kết nối WebSocket.
 */
export function parseHandshake(value: unknown): RealtimeHandshake {
  const input = object(value);
  const keys = Object.keys(input).sort().join(",");
  // Unknown key sets (e.g. a guest handshake without roomId) are authentication failures.
  if (
    keys !== "accessToken,appSession,roomId,tabId" &&
    keys !== "guestCapability,roomId,tabId"
  )
    throw new RealtimeError(
      "AUTH_REQUIRED",
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    );
  const roomId = uuid(input.roomId);
  const tabId = uuid(input.tabId);
  if (
    keys === "accessToken,appSession,roomId,tabId" &&
    typeof input.accessToken === "string" &&
    input.accessToken.length > 0 &&
    input.accessToken.length <= 8192 &&
    typeof input.appSession === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(input.appSession)
  )
    return {
      accessToken: input.accessToken,
      appSession: input.appSession,
      roomId,
      tabId,
    };
  if (
    keys === "guestCapability,roomId,tabId" &&
    typeof input.guestCapability === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(input.guestCapability)
  )
    return { guestCapability: input.guestCapability, roomId, tabId };
  throw new RealtimeError(
    "AUTH_REQUIRED",
    "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
  );
}
export function handshakeProof(handshake: RealtimeHandshake): RoomRequestProof {
  if ("guestCapability" in handshake)
    return { guestCapability: handshake.guestCapability };
  return {
    accessToken: handshake.accessToken,
    appSession: handshake.appSession,
  };
}
/**
 * Phân tích, xác thực định dạng và trích xuất lệnh phòng cờ (`RoomCommand`) từ dữ liệu thô do client gửi qua socket.
 */
export function parseCommand(value: unknown): RoomCommand {
  const input = object(value);
  const action = object(input.action);
  const payload = object(action.payload);
  if (
    typeof input.expectedVersion !== "number" ||
    !Number.isSafeInteger(input.expectedVersion) ||
    input.expectedVersion < 0
  )
    throw new RealtimeError("COMMAND_INVALID", "Dữ liệu lệnh không hợp lệ");
  let parsed: RoomAction;
  if (action.type === "room.ready" && typeof payload.ready === "boolean")
    parsed = { type: action.type, payload: { ready: payload.ready } };
  else if (action.type === "room.start" && Object.keys(payload).length === 0)
    parsed = { type: action.type, payload: {} };
  else if (
    action.type === "match.move" &&
    Object.keys(payload).every((key) =>
      ["matchId", "matchVersion", "from", "to"].includes(key),
    ) &&
    typeof payload.matchVersion === "number" &&
    Number.isSafeInteger(payload.matchVersion) &&
    payload.matchVersion >= 0 &&
    typeof payload.from === "number" &&
    typeof payload.to === "number" &&
    Number.isInteger(payload.from) &&
    Number.isInteger(payload.to) &&
    payload.from >= 0 &&
    payload.from < 90 &&
    payload.to >= 0 &&
    payload.to < 90 &&
    payload.from !== payload.to
  )
    parsed = {
      type: action.type,
      payload: {
        matchId: uuid(payload.matchId),
        matchVersion: payload.matchVersion,
        from: payload.from,
        to: payload.to,
      },
    };
  else if (
    (action.type === "match.resign" || action.type === "match.still-here") &&
    Object.keys(payload).every((key) =>
      ["matchId", "matchVersion"].includes(key),
    ) &&
    typeof payload.matchVersion === "number" &&
    Number.isSafeInteger(payload.matchVersion) &&
    payload.matchVersion >= 0
  )
    parsed = {
      type: action.type,
      payload: {
        matchId: uuid(payload.matchId),
        matchVersion: payload.matchVersion,
      },
    };
  else if (
    (action.type === "match.draw.offer" ||
      action.type === "match.draw.withdraw" ||
      action.type === "match.draw.respond") &&
    typeof payload.matchVersion === "number" &&
    Number.isSafeInteger(payload.matchVersion) &&
    payload.matchVersion >= 0 &&
    Object.keys(payload).every((key) =>
      [
        "matchId",
        "matchVersion",
        ...(action.type === "match.draw.offer" ? [] : ["offerId"]),
        ...(action.type === "match.draw.respond" ? ["accept"] : []),
      ].includes(key),
    )
  ) {
    const base = {
      matchId: uuid(payload.matchId),
      matchVersion: payload.matchVersion,
    };
    if (action.type === "match.draw.offer")
      parsed = { type: action.type, payload: base };
    else if (action.type === "match.draw.withdraw")
      parsed = {
        type: action.type,
        payload: { ...base, offerId: uuid(payload.offerId) },
      };
    else if (typeof payload.accept === "boolean")
      parsed = {
        type: action.type,
        payload: {
          ...base,
          offerId: uuid(payload.offerId),
          accept: payload.accept,
        },
      };
    else
      throw new RealtimeError("COMMAND_INVALID", "Dữ liệu lệnh không hợp lệ");
  } else if (
    action.type === "media.sharing" &&
    typeof payload.sharing === "string" &&
    (payload.sharing === "none" ||
      payload.sharing === "opponent" ||
      payload.sharing === "room")
  )
    parsed = {
      type: action.type,
      payload: { sharing: payload.sharing },
    };
  else throw new RealtimeError("COMMAND_INVALID", "Dữ liệu lệnh không hợp lệ");
  return {
    commandId: uuid(input.commandId),
    roomId: uuid(input.roomId),
    expectedVersion: input.expectedVersion,
    action: parsed,
  };
}
