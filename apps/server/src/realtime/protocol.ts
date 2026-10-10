import type {
  RealtimeHandshake,
  RoomAction,
  RoomCommand,
} from "@xiangqi/shared";
import { RealtimeError } from "./contracts.js";

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
export function parseHandshake(value: unknown): RealtimeHandshake {
  const input = object(value);
  if (
    typeof input.accessToken !== "string" ||
    !input.accessToken ||
    input.accessToken.length > 8192
  )
    throw new RealtimeError(
      "AUTH_REQUIRED",
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    );
  return {
    accessToken: input.accessToken,
    roomId: uuid(input.roomId),
    tabId: uuid(input.tabId),
  };
}
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
  else if (
    action.type === "match.move" &&
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
      payload: { from: payload.from, to: payload.to },
    };
  else if (action.type === "match.resign" && !Object.keys(payload).length)
    parsed = { type: action.type, payload: {} };
  else if (
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
