import { createHash } from "node:crypto";
import { RoomError, type RoomScope } from "../room/contracts.js";
import {
  RealtimeError,
  type RealtimeConnection,
} from "../realtime/contracts.js";
import type { MemberRealtimeTransactions } from "../realtime/member-transactions.js";
import type {
  ChatStore,
  ChatChannel,
  ChatPage,
  ChatSent,
} from "./chat-store.js";
export type RealtimeChatPage = ChatPage & {
  roomId: string;
  channel: ChatChannel;
  roomVersion: number;
  scopeToken: string;
  canSend: boolean;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw new RoomError("CHAT_INPUT_INVALID", "Tin nhắn không hợp lệ", 400);
}
function body(value: object, keys: string[]) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    invalid();
}
function channel(value: unknown) {
  if (value !== "PLAYERS_PRIVATE" && value !== "ROOM_PUBLIC") invalid();
}
export class ChatRealtimeService {
  constructor(
    private readonly store: ChatStore,
    private readonly transactions: Pick<
      MemberRealtimeTransactions,
      "run" | "getScope"
    >,
  ) {}
  private async guarded<T>(
    connection: RealtimeConnection,
    work: (scope: RoomScope) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.transactions.run(connection, (client) =>
        work(
          this.transactions.getScope(
            client,
            connection.identity,
            connection.roomId,
          ),
        ),
      );
    } catch (error) {
      if (error instanceof RoomError || error instanceof RealtimeError)
        throw error;
      throw new RealtimeError("REALTIME_UNAVAILABLE", "Chat chưa sẵn sàng");
    }
  }
  private async canSend(
    scope: RoomScope,
    connection: RealtimeConnection,
    requested: ChatChannel,
  ): Promise<boolean> {
    const member = (
      await scope.client.query<{ role: string }>(
        "SELECT role FROM public.room_members WHERE room_id=$1 AND user_id=$2 FOR UPDATE",
        [connection.roomId, scope.actor.userId],
      )
    ).rows[0];
    if (!member || !["PLAYER", "SPECTATOR"].includes(member.role))
      throw new RoomError(
        "CHAT_FORBIDDEN",
        "Bạn không có quyền truy cập kênh chat này",
        403,
      );
    if (member.role === "SPECTATOR") {
      if (requested !== "ROOM_PUBLIC")
        throw new RoomError(
          "CHAT_FORBIDDEN",
          "Bạn không có quyền truy cập kênh chat này",
          403,
        );
      return true;
    }
    // This is a controller fence only; it never creates or promotes a controller.
    return Boolean(
      (
        await scope.client.query(
          "SELECT 1 FROM xiangqi_realtime.controllers WHERE room_id=$1 AND user_id=$2 AND tab_id=$3 AND connection_id=$4 FOR UPDATE",
          [
            connection.roomId,
            scope.actor.userId,
            connection.tabId,
            connection.connectionId,
          ],
        )
      ).rowCount,
    );
  }
  async read(
    connection: RealtimeConnection,
    input: { channel: ChatChannel; after?: number },
  ): Promise<RealtimeChatPage> {
    body(input, ["channel", "after"]);
    channel(input.channel);
    if (
      input.after !== undefined &&
      (!Number.isSafeInteger(input.after) || input.after < 0)
    )
      invalid();
    return this.guarded(connection, async (scope) => {
      const page = await this.store.read(
        scope,
        connection.roomId,
        input.channel,
        input.after ?? 0,
      );
      // Store access already holds room/chat/membership rows, so this token shares its exact authorization scope.
      const state = (
        await scope.client.query<{
          pair_epoch: string;
          floor: string;
          version: number;
        }>(
          "SELECT c.pair_epoch,e.floor,r.room_version::float8 AS version FROM xiangqi_chat.rooms c JOIN public.rooms r ON r.id=c.room_id JOIN xiangqi_chat.entries e ON e.room_id=c.room_id WHERE c.room_id=$1 AND e.user_id=$2",
          [connection.roomId, scope.actor.userId],
        )
      ).rows[0];
      if (!state)
        throw new RealtimeError("REALTIME_UNAVAILABLE", "Chat chưa sẵn sàng");
      const scopeToken = createHash("sha256")
        .update(
          JSON.stringify([
            connection.roomId,
            scope.actor.userId,
            input.channel,
            input.channel === "PLAYERS_PRIVATE"
              ? state.pair_epoch
              : state.floor,
          ]),
        )
        .digest("hex");
      return {
        ...page,
        roomId: connection.roomId,
        channel: input.channel,
        roomVersion: state.version,
        scopeToken,
        canSend: await this.canSend(scope, connection, input.channel),
      };
    });
  }
  async send(
    connection: RealtimeConnection,
    input: { commandId: string; channel: ChatChannel; content: string },
  ): Promise<ChatSent> {
    body(input, ["commandId", "channel", "content"]);
    channel(input.channel);
    if (
      typeof input.commandId !== "string" ||
      !uuid.test(input.commandId) ||
      typeof input.content !== "string" ||
      !input.content.trim() ||
      Array.from(input.content).length > 200
    )
      invalid();
    return this.guarded(connection, async (scope) => {
      if (!(await this.canSend(scope, connection, input.channel)))
        throw new RealtimeError("TAB_READ_ONLY", "Tab này chỉ có thể xem");
      return this.store.send(scope, connection.roomId, {
        commandId: input.commandId.toLowerCase(),
        channel: input.channel,
        content: input.content,
      });
    });
  }
}
