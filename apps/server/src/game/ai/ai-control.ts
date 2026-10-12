import type { Socket } from "socket.io";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type { AiPresence } from "./ai-presence.js";
import type { AiOrigin } from "./ai-transactions.js";
import type { AiHttpResult } from "./ai.controller.js";
type Human = Extract<AiOrigin, { kind: "human" }>;
type Binding = {
  socket: Socket;
  ownerId: string;
  appSession: string;
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
/** Bind only after authenticated Socket admission and SQL presence COMMIT; never from HTTP headers. */
export class AiControl {
  private readonly connections = new Map<string, Binding>();
  constructor(
    private readonly presence: Pick<
      AiPresence,
      "authorize" | "bindGame" | "assertRetained"
    >,
  ) {}
  bind(
    socket: Socket,
    ownerId: string,
    appSession: string,
    tabId: string,
    generation: number,
  ): void {
    if (!socket.connected) denied();
    this.connections.set(socket.id, {
      socket,
      ownerId,
      appSession,
      tabId,
      generation,
    });
  }
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
      scope.actor.kind !== "member" ||
      !scope.lockedActorIds.has(scope.actor.userId) ||
      binding.ownerId !== scope.actor.userId ||
      binding.appSession !== origin.proof.appSession ||
      binding.tabId !== origin.tab.tabId ||
      binding.generation !== origin.tab.generation
    )
      denied();
    return binding;
  }
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
  async authorize(scope: RoomScope, origin: Human): Promise<void> {
    const binding = this.check(scope, origin);
    await this.presence.authorize(scope, origin);
    this.check(scope, origin, binding);
  }
  async bindGame(
    scope: RoomScope,
    gameId: string,
    origin: Human,
  ): Promise<void> {
    const binding = this.check(scope, origin);
    await this.presence.bindGame(scope, gameId, origin);
    this.check(scope, origin, binding);
  }
  assertRetained(scope: RoomScope, gameId: string): Promise<void> {
    return this.presence.assertRetained(scope, gameId);
  }
}
