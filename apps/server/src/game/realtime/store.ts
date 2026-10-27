import { createHash } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type {
  CommandAcknowledgement,
  RoomCommand,
  RoomSnapshot,
} from "@xiangqi/shared";
import {
  RealtimeError,
  type RoomCollaborator,
  type RealtimeConnection,
  type RealtimeTransactions,
  type RealtimePresence,
} from "./realtime.types.js";

export function errorAcknowledgement(
  error: unknown,
  commandId?: string,
): CommandAcknowledgement {
  return {
    status: "error",
    ...(commandId ? { commandId } : {}),
    error:
      error instanceof RealtimeError
        ? { code: error.code, message: error.message }
        : {
            code: "REALTIME_UNAVAILABLE",
            message:
              "Dịch vụ thời gian thực chưa thể xử lý yêu cầu, vui lòng thử lại",
          },
  };
}

function fingerprint(command: RoomCommand) {
  // Validation constructs the action in a fixed field order, independent of client key order.
  return createHash("sha256")
    .update(
      JSON.stringify({
        expectedVersion: command.expectedVersion,
        action: command.action,
      }),
    )
    .digest("hex");
}

/**
 * Lớp Store quản lý tầng realtime: lưu trữ thẻ điều khiển (tab/controller), biên lai lệnh idempotent và snapshot phòng.
 */
export class RealtimeStore {
  constructor(
    private readonly pool: Pool,
    private readonly rooms: RoomCollaborator,
    private readonly transactions?: RealtimeTransactions,
    private readonly presence?: RealtimePresence,
  ) {}
  private async transaction<T>(
    connection: RealtimeConnection | null,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    if (connection && this.transactions)
      return this.transactions.run(connection, work);
    const roomId = connection?.roomId ?? null;
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE app_server");
      if (roomId)
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          [`room:${roomId}`],
        );
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        broken = true;
      }
      throw error;
    } finally {
      client.release(broken);
    }
  }
  private async control(
    client: PoolClient,
    connection: RealtimeConnection,
    canControl: boolean,
  ) {
    const { rows } = await client.query(
      "SELECT tab_id,connection_id,generation FROM xiangqi_realtime.controllers WHERE user_id=$1 AND room_id=$2",
      [connection.identity.userId, connection.roomId],
    );
    return this.controlState(rows[0] ?? null, connection, canControl);
  }
  // Pure derivation so command() can reuse a controller row read in its own query.
  private controlState(
    row: {
      tab_id: string;
      connection_id: string;
      generation: number;
    } | null,
    connection: RealtimeConnection,
    canControl: boolean,
  ) {
    const ownsTab =
      row?.tab_id === connection.tabId &&
      row.connection_id === connection.connectionId;
    const writable = canControl && ownsTab;
    return {
      mode: writable ? ("writable" as const) : ("readonly" as const),
      generation: (row?.generation ?? 0) as number,
      reason: writable
        ? null
        : (row && !ownsTab) || canControl
          ? ("superseded" as const)
          : ("not_allowed" as const),
    };
  }
  private async currentSnapshot(
    client: PoolClient,
    connection: RealtimeConnection,
  ): Promise<RoomSnapshot> {
    const snapshot = await this.rooms.snapshot(
      client,
      connection.identity,
      connection.roomId,
    );
    return {
      ...snapshot,
      control: await this.control(
        client,
        connection,
        snapshot.role === "red" || snapshot.role === "black",
      ),
    };
  }
  /**
   * Đăng ký kết nối client vào phòng, xác định tab có quyền điều khiển (writable) hoặc chỉ xem (readonly/superseded).
   */
  async connect(
    connection: RealtimeConnection,
    takeover = false,
  ): Promise<RoomSnapshot> {
    const result = await this.transaction(connection, async (client) => {
      const access = await this.rooms.authorize(
        client,
        connection.identity,
        connection.roomId,
      );
      const known = await client.query(
        "SELECT 1 FROM xiangqi_realtime.tabs WHERE user_id=$1 AND room_id=$2 AND tab_id=$3",
        [connection.identity.userId, connection.roomId, connection.tabId],
      );
      const current = await client.query(
        "SELECT tab_id FROM xiangqi_realtime.controllers WHERE user_id=$1 AND room_id=$2",
        [connection.identity.userId, connection.roomId],
      );
      await client.query(
        "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [connection.identity.userId, connection.roomId, connection.tabId],
      );
      if (
        takeover ||
        !known.rowCount ||
        !current.rowCount ||
        current.rows[0].tab_id === connection.tabId
      ) {
        await client.query(
          `INSERT INTO xiangqi_realtime.controllers(user_id,room_id,tab_id,connection_id,generation) VALUES($1,$2,$3,$4,1)
          ON CONFLICT(user_id,room_id) DO UPDATE SET tab_id=EXCLUDED.tab_id,connection_id=EXCLUDED.connection_id,generation=xiangqi_realtime.controllers.generation+1`,
          [
            connection.identity.userId,
            connection.roomId,
            connection.tabId,
            connection.connectionId,
          ],
        );
      }
      const control = await this.control(client, connection, access.canControl);
      if (
        (await this.presence?.connected(client, connection, control)) ===
        "ended"
      )
        return null;
      return {
        ...(await this.rooms.snapshot(
          client,
          connection.identity,
          connection.roomId,
        )),
        control,
      };
    });
    if (!result)
      throw new RealtimeError("ROOM_FORBIDDEN", "Ghế trong phòng đã hết hạn");
    return result;
  }
  /**
   * Xử lý ngắt kết nối của client khỏi phòng.
   */
  async disconnect(connection: RealtimeConnection): Promise<void> {
    await this.presence?.disconnected(connection);
  }
  /**
   * Xử lý thực thi lệnh phòng từ client với kiểm tra quyền điều khiển thẻ tab, chống lặp qua biên lai receipt và kiểm tra version.
   */
  async command(
    connection: RealtimeConnection,
    command: RoomCommand,
  ): Promise<CommandAcknowledgement> {
    try {
      if (command.roomId !== connection.roomId)
        throw new RealtimeError(
          "ROOM_FORBIDDEN",
          "Bạn không có quyền truy cập phòng này",
        );
      return await this.transaction(connection, async (client) => {
        const access = await this.rooms.authorize(
          client,
          connection.identity,
          connection.roomId,
        );
        const key = [
          connection.identity.userId,
          connection.roomId,
          command.commandId,
        ];
        // One round-trip for the controller row and the receipt row (same key tuple).
        const { rows } = await client.query<{
          tab_id: string;
          connection_id: string;
          generation: number;
          has_controller: boolean;
          fingerprint: string | null;
          response: CommandAcknowledgement | null;
          active: boolean | null;
          has_receipt: boolean;
        }>(
          `SELECT c.tab_id,c.connection_id,c.generation,(c.user_id IS NOT NULL) AS has_controller,
             r.fingerprint,r.response,r.expires_at>now() AS active,(r.command_id IS NOT NULL) AS has_receipt
           FROM (SELECT 1) seed
           LEFT JOIN xiangqi_realtime.controllers c ON c.user_id=$1 AND c.room_id=$2
           LEFT JOIN xiangqi_realtime.receipts r ON r.user_id=$1 AND r.room_id=$2 AND r.command_id=$3`,
          key,
        );
        const state = rows[0];
        if (!state)
          throw new Error("Realtime command state query returned no seed row");
        const control = this.controlState(
          state.has_controller
            ? {
                tab_id: state.tab_id,
                connection_id: state.connection_id,
                generation: state.generation,
              }
            : null,
          connection,
          access.canControl,
        );
        if (control.mode !== "writable")
          throw new RealtimeError(
            "TAB_READ_ONLY",
            "Thẻ này chỉ có quyền xem; vui lòng chủ động tiếp quản để điều khiển",
          );
        const digest = fingerprint(command);
        if (state.active) {
          if (state.fingerprint !== digest)
            throw new RealtimeError(
              "COMMAND_ID_REUSED",
              "Mã lệnh đã được dùng cho nội dung khác",
            );
          return state.response as CommandAcknowledgement;
        }
        // Expired keys may be reused even before the periodic cleanup has run.
        if (state.has_receipt)
          await client.query(
            "DELETE FROM xiangqi_realtime.receipts WHERE user_id=$1 AND room_id=$2 AND command_id=$3 AND expires_at<=now()",
            key,
          );
        let response: CommandAcknowledgement;
        if (access.version !== command.expectedVersion) {
          response = {
            status: "error",
            commandId: command.commandId,
            error: {
              code: "VERSION_STALE",
              message: "Trạng thái đã thay đổi, vui lòng đồng bộ lại",
            },
            snapshot: {
              ...(await this.rooms.snapshot(
                client,
                connection.identity,
                connection.roomId,
              )),
              control,
            },
          };
        } else {
          const next = await this.rooms.execute(
            client,
            connection.identity,
            command,
          );
          const executed = "snapshot" in next ? next : { snapshot: next };
          const snapshot = { ...executed.snapshot, control };
          response = executed.error
            ? {
                status: "error",
                commandId: command.commandId,
                error: executed.error,
                snapshot,
              }
            : { status: "ok", commandId: command.commandId, snapshot };
        }
        await client.query(
          "INSERT INTO xiangqi_realtime.receipts(user_id,room_id,command_id,fingerprint,response) VALUES($1,$2,$3,$4,$5::jsonb)",
          [...key, digest, JSON.stringify(response)],
        );
        return response;
      });
    } catch (error) {
      return errorAcknowledgement(error, command.commandId);
    }
  }
  /**
   * Truy vấn ảnh chụp nhanh trạng thái phòng hiện tại kèm quyền điều khiển (control) của kết nối.
   */
  async snapshot(connection: RealtimeConnection): Promise<RoomSnapshot> {
    return this.transaction(connection, (client) =>
      this.currentSnapshot(client, connection),
    );
  }
  /**
   * Xóa định kỳ các biên lai lệnh đã hết hạn (tối đa 500 biên lai mỗi lần chạy).
   */
  async cleanupExpiredReceipts(): Promise<number> {
    return this.transaction(null, async (client) => {
      await client.query("SET LOCAL lock_timeout='250ms'");
      return (
        (
          await client.query(`
        WITH expired AS (
          SELECT user_id,room_id,command_id FROM xiangqi_realtime.receipts
          WHERE expires_at<=now() ORDER BY expires_at,user_id,room_id,command_id LIMIT 500
        )
        DELETE FROM xiangqi_realtime.receipts r USING expired e
        WHERE r.user_id=e.user_id AND r.room_id=e.room_id AND r.command_id=e.command_id`)
        ).rowCount ?? 0
      );
    });
  }
}
