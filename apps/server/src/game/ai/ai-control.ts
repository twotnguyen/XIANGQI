import type { Socket } from "socket.io";
import { createHash } from "node:crypto";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type { AiPresence } from "./ai-presence.js";
import type { AiOrigin } from "./ai-transactions.js";
import type { AiHttpResult } from "./ai.controller.js";
import type { RoomRequestProof } from "../room/room-session.js";
type Human = Extract<AiOrigin, { kind: "human" }>;
type Binding = {
  socket: Socket;
  ownerId: string;
  credential: string;
  tabId: string;
  generation: number;
};
function denied(): never {
  throw new RoomError(
    "AI_AUTHORITY_REQUIRED",
    "Kết nối chơi với máy không hợp lệ",
    403,
  );
}
/** Fingerprint credential phiên (member appSession / guest capability); không lưu secret thô. */
function credentialOf(proof: RoomRequestProof): string {
  if ("guestCapability" in proof)
    return createHash("sha256")
      .update(`guest:${proof.guestCapability}`)
      .digest("hex");
  return createHash("sha256")
    .update(`member:${proof.appSession}`)
    .digest("hex");
}
/**
 * Quản lý trạng thái và quyền điều khiển kết nối Socket của người chơi trong chế độ chơi với AI.
 */
export class AiControl {
  private readonly connections = new Map<string, Binding>();
  constructor(
    private readonly presence: Pick<
      AiPresence,
      "authorize" | "bindGame" | "assertRetained"
    >,
  ) {}
  /**
   * Đăng ký gắn kết socket client với thông tin phiên, tab và generation điều khiển.
   */
  bind(
    socket: Socket,
    ownerId: string,
    proof: RoomRequestProof,
    tabId: string,
    generation: number,
  ): void {
    if (!socket.connected) denied();
    this.connections.set(socket.id, {
      socket,
      ownerId,
      credential: credentialOf(proof),
      tabId,
      generation,
    });
  }
  /**
   * Hủy đăng ký socket khi kết nối bị đóng.
   */
  unbind(socket: Socket): void {
    if (this.connections.get(socket.id)?.socket === socket)
      this.connections.delete(socket.id);
  }
  private check(scope: RoomScope, origin: Human, expected?: Binding): Binding {
    const binding = this.connections.get(origin.tab.connectionId);
    if (
      !binding ||
      (expected && binding !== expected) ||
      !binding.socket.connected ||
      ("guestCapability" in origin.proof ? "guest" : "member") !==
        scope.actor.kind ||
      !scope.lockedActorIds.has(scope.actor.userId) ||
      binding.ownerId !== scope.actor.userId ||
      binding.credential !== credentialOf(origin.proof) ||
      binding.tabId !== origin.tab.tabId ||
      binding.generation !== origin.tab.generation
    )
      denied();
    return binding;
  }
  /**
   * Kiểm tra quyền của tab: là controller hay readonly do đã mở ở tab khác.
   */
  async inspect(
    scope: RoomScope,
    origin: Human,
  ): Promise<AiHttpResult["control"]> {
    const binding = this.check(scope, origin);
    let mode: "controller" | "readonly" = "controller";
    try {
      await this.presence.authorize(scope, origin);
    } catch (error) {
      if (
        error instanceof RoomError &&
        error.code === "TAB_READ_ONLY" &&
        error.status === 409
      )
        mode = "readonly";
      else throw error;
    }
    this.check(scope, origin, binding);
    return {
      mode,
      reason: mode === "readonly" ? "other_tab" : null,
      generation: binding.generation,
    };
  }
  /**
   * Xác thực quyền điều khiển của người chơi trong giao dịch an toàn.
   */
  async authorize(scope: RoomScope, origin: Human): Promise<void> {
    const binding = this.check(scope, origin);
    await this.presence.authorize(scope, origin);
    this.check(scope, origin, binding);
  }
  /**
   * Gắn kết trận đấu cờ với AI vào tab điều khiển hiện tại của người chơi.
   */
  async bindGame(
    scope: RoomScope,
    gameId: string,
    origin: Human,
  ): Promise<void> {
    const binding = this.check(scope, origin);
    await this.presence.bindGame(scope, gameId, origin);
    this.check(scope, origin, binding);
  }
  /**
   * Kiểm tra và bảo đảm ván đấu cờ với AI vẫn đang được lưu giữ trong phiên.
   */
  assertRetained(scope: RoomScope, gameId: string): Promise<void> {
    return this.presence.assertRetained(scope, gameId);
  }
}
