import {
  parsePosition,
  serializePosition,
  type Move,
} from "@xiangqi/xiangqi-core";
import type { AiGameSnapshot } from "./AiGame.js";
import type { AiSetupSelection } from "./AiSetupDialog.js";
import type { AuthorizedFetch } from "../rooms/room-client.js";
export interface AiControlProof {
  tabId: string;
  connectionId: string;
  generation: number;
}
export interface AiResponse {
  snapshot: AiGameSnapshot;
  serverNow: string;
  control: {
    mode: "controller" | "readonly";
    reason: "other_tab" | null;
    generation: number;
  };
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const unavailable = "Chưa thể thực hiện thao tác với máy. Vui lòng thử lại.";
function invalid(): never {
  throw Error("Phản hồi ván với máy không hợp lệ. Vui lòng tải lại.");
}
function record(v: unknown, keys: string[]): Record<string, unknown> {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.keys(v).length !== keys.length ||
    Object.keys(v).some((k) => !keys.includes(k))
  )
    invalid();
  return v as Record<string, unknown>;
}
function isId(v: unknown): v is string {
  return typeof v === "string" && uuid.test(v);
}
function integer(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
}
function fen(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    return serializePosition(parsePosition(v)) === v;
  } catch {
    return false;
  }
}
function utc(v: unknown): v is string {
  if (
    typeof v !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(v)
  )
    return false;
  const ms = Date.parse(v);
  if (!Number.isFinite(ms)) return false;
  return new Date(ms).toISOString().slice(0, 19) === v.slice(0, 19);
}
export function parseAiResponse(
  value: unknown,
  expectedId?: string,
): AiResponse {
  const row = record(value, ["snapshot", "serverNow", "control"]),
    s = record(row.snapshot, [
      "id",
      "requestedSide",
      "actualSide",
      "level",
      "position",
      "history",
      "version",
      "status",
      "engineState",
      "engineError",
      "outcome",
    ]),
    c = record(row.control, ["mode", "reason", "generation"]);
  if (
    !isId(s.id) ||
    (expectedId !== undefined &&
      s.id.toLowerCase() !== expectedId.toLowerCase()) ||
    !["red", "black", "random"].includes(s.requestedSide as string) ||
    !["red", "black"].includes(s.actualSide as string) ||
    !["easy", "medium", "hard"].includes(s.level as string) ||
    !fen(s.position) ||
    !Array.isArray(s.history) ||
    s.history.length === 0 ||
    !s.history.every(fen) ||
    s.history.at(-1) !== s.position ||
    !integer(s.version) ||
    !["ACTIVE", "FINALIZING", "FINISHED", "ABANDONED"].includes(
      s.status as string,
    ) ||
    !["IDLE", "THINKING", "RETRY"].includes(s.engineState as string) ||
    ![null, "ENGINE_TIMEOUT", "ENGINE_BUSY"].includes(
      s.engineError as null | string,
    ) ||
    !utc(row.serverNow) ||
    !integer(c.generation) ||
    c.generation === 0 ||
    !(
      (c.mode === "controller" && c.reason === null) ||
      (c.mode === "readonly" && c.reason === "other_tab")
    )
  )
    invalid();
  if (s.outcome !== null) {
    const o = record(s.outcome, ["reason", "winner"]);
    if (
      ![
        "CHECKMATE",
        "STALEMATE",
        "PERPETUAL_CHECK",
        "DRAW_REPETITION",
        "DRAW_NO_CAPTURE",
        "RESIGN",
        "ENGINE_FAILURE",
      ].includes(o.reason as string) ||
      ![null, "red", "black"].includes(o.winner as string | null) ||
      (["DRAW_REPETITION", "DRAW_NO_CAPTURE", "ENGINE_FAILURE"].includes(
        o.reason as string,
      ) &&
        o.winner !== null) ||
      (["CHECKMATE", "STALEMATE", "RESIGN"].includes(o.reason as string) &&
        o.winner === null)
    )
      invalid();
  }
  if (
    (s.status === "FINISHED" && s.outcome === null) ||
    (s.status === "ACTIVE" && s.outcome !== null)
  )
    invalid();
  return row as unknown as AiResponse;
}
const codes = [
  "VERSION_STALE",
  "AI_VERSION_STALE",
  "AUTH_REQUIRED",
  "TAB_READ_ONLY",
  "AI_FORBIDDEN",
  "AI_GAME_EXPIRED",
  "AI_BOOT_EXPIRED",
  "AI_NOT_FOUND",
  "AI_INPUT_INVALID",
  "AI_ILLEGAL_MOVE",
  "AI_NOT_YOUR_TURN",
  "AI_ENGINE_BUSY",
  "AI_UNAVAILABLE",
  "AI_AUTHORITY_REQUIRED",
  "ACTIVE_GAME_EXISTS",
] as const;
export class AiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(
      status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : code === "VERSION_STALE" || code === "AI_VERSION_STALE"
          ? "Ván đã thay đổi. Tải trạng thái mới trước khi thao tác."
          : code === "TAB_READ_ONLY"
            ? "Tab này chỉ có thể xem."
            : unavailable,
    );
  }
}
export function makeAiClient(
  authorizedFetch: AuthorizedFetch,
  getControl: () => Promise<AiControlProof>,
) {
  async function request(
    path: string,
    method: "GET" | "POST",
    body?: unknown,
    controlled = true,
  ): Promise<unknown> {
    const headers: Record<string, string> = {};
    if (controlled) {
      let proof: AiControlProof;
      try {
        proof = await getControl();
      } catch {
        throw new AiRequestError(403, "TAB_READ_ONLY");
      }
      if (
        !proof ||
        !isId(proof.tabId) ||
        typeof proof.connectionId !== "string" ||
        !/^[-_a-zA-Z0-9]{1,128}$/.test(proof.connectionId) ||
        !integer(proof.generation) ||
        proof.generation === 0
      )
        throw new AiRequestError(403, "TAB_READ_ONLY");
      headers["X-AI-Tab"] = proof.tabId;
      headers["X-AI-Connection"] = proof.connectionId;
      headers["X-AI-Generation"] = String(proof.generation);
    }
    if (body !== undefined) headers["Content-Type"] = "application/json";
    let response: Response;
    try {
      response = await authorizedFetch(path, {
        method,
        headers,
        redirect: "error",
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw new AiRequestError(503, "AI_UNAVAILABLE");
    }
    if (!response.ok) {
      let code = "AI_UNAVAILABLE";
      try {
        const v = (await response.json()) as Record<string, unknown>;
        if (v && codes.includes(v.code as (typeof codes)[number]))
          code = v.code as string;
      } catch {
        /* No raw body reaches UI. */
      }
      throw new AiRequestError(response.status, code);
    }
    try {
      return (await response.json()) as unknown;
    } catch {
      return invalid();
    }
  }
  function input(id: string, version?: number) {
    if (!isId(id) || (version !== undefined && !integer(version)))
      throw Error("Thông tin ván không hợp lệ.");
  }
  async function mutation(
    id: string,
    version: number,
    action: string,
    move?: Move,
  ) {
    input(id, version);
    if (!integer(version)) throw Error("Thông tin ván không hợp lệ.");
    if (
      move &&
      (!integer(move.from) ||
        !integer(move.to) ||
        move.from > 89 ||
        move.to > 89 ||
        move.from === move.to)
    )
      throw Error("Nước đi không hợp lệ.");
    return parseAiResponse(
      await request(`/ai/${id}/${action}`, "POST", {
        version,
        ...(move ? { move: { from: move.from, to: move.to } } : {}),
      }),
      action === "retry" ? undefined : id,
    );
  }
  return {
    async current(): Promise<{ gameId: string | null }> {
      const v = record(await request("/ai/current", "GET", undefined, false), [
        "gameId",
      ]);
      if (v.gameId !== null && !isId(v.gameId)) invalid();
      return { gameId: v.gameId as string | null };
    },
    async read(id: string) {
      input(id);
      return parseAiResponse(await request(`/ai/${id}`, "GET"), id);
    },
    async create(selection: AiSetupSelection) {
      if (
        !["easy", "medium", "hard"].includes(selection.level) ||
        !["red", "black", "random"].includes(selection.requestedSide)
      )
        throw Error("Thiết lập ván không hợp lệ.");
      return parseAiResponse(
        await request("/ai", "POST", {
          level: selection.level,
          requestedSide: selection.requestedSide,
        }),
      );
    },
    move: (id: string, version: number, move: Move) =>
      mutation(id, version, "move", move),
    resign: (id: string, version: number) => mutation(id, version, "resign"),
    retry: (id: string, version: number) => mutation(id, version, "retry"),
  };
}
export type AiClient = ReturnType<typeof makeAiClient>;
