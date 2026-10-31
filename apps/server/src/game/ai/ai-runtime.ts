import type { Server as HttpServer } from "node:http";
import type { DynamicModule } from "@nestjs/common";
import type { Pool } from "pg";
import type { Socket } from "socket.io";
import type { SessionService } from "../../account/login/session.service.js";
import type { GuestService } from "../../account/guest/guest.service.js";
import type { AiSessionTermination } from "../room/guest-room-port.js";
import type {
  RoomRequestProof,
  RoomSessionAuthorizer,
} from "../room/room-session.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type { RoomAuthorization } from "../room/room-transactions.js";
import { AiControl } from "./ai-control.js";
import { createCompiledAiEngine, type AiEngine } from "./ai-engine.js";
import { AiGames } from "./ai-games.js";
import { AiHistoryStore } from "./ai-history-store.js";
import { AiHttpService } from "./ai-http.service.js";
import { AiPresence, type AiAttachment } from "./ai-presence.js";
import { AiReservations } from "./ai-reservations.js";
import type {
  AiExpiredCursor,
  AiExpiredReservation,
} from "./ai-reservations.js";
import type { ExpiredAiPresence } from "./ai-presence.js";
import { SqlAiTransactions } from "./ai-sql-transactions.js";
import {
  attachAiSocketGateway,
  type AiSocketAdmission,
  type AiSocketControl,
  type AiSocketProof,
  type AiSocketSnapshot,
} from "./ai-socket-gateway.js";
import { AiModule } from "./ai.module.js";

/** Lease heartbeat cadence; the boot lease is 60 seconds. */
const heartbeatMilliseconds = 20_000;
/** Lease boot 60 giây; quá hạn đo từ lần gia hạn thành công gần nhất. */
const leaseMilliseconds = 60_000;
/** Chu kỳ quét ván hết ân hạn và boot hết hạn. */
const sweepMilliseconds = 5_000;

/** Session expiry/revocation surfaces as AUTH_REQUIRED (401); only that may trigger the physical-proof fallback. */
function sessionRevoked(error: unknown) {
  if (!error || typeof error !== "object") return false;
  return (
    ("code" in error && error.code === "AUTH_REQUIRED") ||
    ("status" in error && error.status === 401)
  );
}

/** Transport-only tabId is stripped here; the credential keeps its exact actor kind for every SQL authority check. */
function credentialOf(
  proof: AiSocketProof | RoomRequestProof,
): RoomRequestProof {
  if ("guestCapability" in proof)
    return Object.freeze({ guestCapability: proof.guestCapability });
  return Object.freeze({
    accessToken: proof.accessToken,
    appSession: proof.appSession,
  });
}
/** Baseline schema AI (migration 11-12): bảng, RLS, policy, quyền app_server và cột ai trên active_players. */
const AI_SCHEMA_READY_SQL = `
SELECT
 to_regnamespace('xiangqi_ai') IS NOT NULL
 AND to_regclass('xiangqi_ai.boots') IS NOT NULL
 AND to_regclass('xiangqi_ai.tabs') IS NOT NULL
 AND to_regclass('xiangqi_ai.controllers') IS NOT NULL
 AND to_regclass('xiangqi_ai.presence') IS NOT NULL
 AND (SELECT count(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_ai' AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity)=4
 AND (SELECT count(*) FROM pg_catalog.pg_policies WHERE schemaname='xiangqi_ai')=4
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.boots','SELECT')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.boots','INSERT')
 AND pg_catalog.has_column_privilege('app_server','xiangqi_ai.boots','lease_until','UPDATE')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.tabs','SELECT')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.tabs','INSERT')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.controllers','SELECT')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.controllers','INSERT')
 AND pg_catalog.has_column_privilege('app_server','xiangqi_ai.controllers','generation','UPDATE')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.presence','SELECT')
 AND pg_catalog.has_table_privilege('app_server','xiangqi_ai.presence','INSERT')
 AND pg_catalog.has_column_privilege('app_server','xiangqi_ai.presence','disconnected_at','UPDATE')
 AND (SELECT count(*) FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::regclass AND attname IN ('ai_game_id','ai_boot_id') AND NOT attisdropped)=2
 AS ready`;

export interface AiRuntimeOptions {
  env: Record<string, string | undefined>;
  registration: { pool: Pool; sessions: SessionService | null };
  authorizer: RoomSessionAuthorizer;
  guests: GuestService;
  withScope: <T>(scope: RoomScope, work: () => Promise<T>) => Promise<T>;
  /** Test seam; production uses the compiled engine worker outside the HTTP main thread. */
  engine?: AiEngine;
}

export interface AiRuntime {
  /** Nest module carrying the AI HTTP controller; import it after registration. */
  module: DynamicModule;
  /** Session termination commit hook; root attaches it to room/session lifecycle. */
  sessionTermination: AiSessionTermination;
  /** Attach the AI socket namespace to the HTTP server; call after createApp and before listen. */
  attach(server: HttpServer): void;
  /** Begin lease heartbeats; call after the server is listening. */
  start(): Promise<void>;
  /** Resolves once the engine worker is ready; wire into /ready. */
  ready(): Promise<void>;
  /** Idempotent. Stop heartbeats and sockets, drain games, close the engine. */
  close(): Promise<void>;
}

function corsOriginsOf(env: Record<string, string | undefined>): string[] {
  return (env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
}

/**
 * Dựng runtime chơi với máy AI phía server (engine worker ngoài main server).
 * Trả về null khi phòng/ván không bật (`ROOMS_ENABLED !== "true"`).
 * Ném lỗi khi schema `xiangqi_ai` chưa sẵn sàng hoặc thiếu phiên đăng nhập.
 */
export async function createAiRuntime(
  options: AiRuntimeOptions,
): Promise<AiRuntime | null> {
  if ((options.env.ROOMS_ENABLED ?? "false") !== "true") return null;
  const { pool } = options.registration;
  const schema = await pool.query<{ ready: boolean }>(AI_SCHEMA_READY_SQL);
  if (schema.rows[0]?.ready !== true)
    throw new Error("AI migration is not ready");

  const engine = options.engine ?? (await createCompiledAiEngine());
  const coordinator = new RoomTransactions(pool);
  const { authorizer, guests, withScope } = options;
  const reservations = new AiReservations();
  let bootId: string;
  try {
    const bootClient = await pool.connect();
    try {
      bootId = (await reservations.createBoot(bootClient)).id;
    } finally {
      bootClient.release();
    }
  } catch (error) {
    await engine.close().catch(() => {});
    throw error;
  }
  const presence = new AiPresence(bootId, reservations);
  const control = new AiControl(presence);
  const transactions = new SqlAiTransactions({
    coordinator,
    authorizer,
    pool,
    guests,
    withScope,
    reservations,
    history: new AiHistoryStore(reservations),
    bootId,
    control,
  });
  const games = new AiGames({ engine, transactions });
  const http = new AiHttpService({
    games,
    transactions,
    reservations,
    bootId,
    control,
  });
  const sessionTermination: AiSessionTermination = {
    async terminate(scope, input) {
      const effect = await transactions.prepareTermination(scope, input, () =>
        games.terminationSnapshot(input.ownerId, input.aiGameId),
      );
      return {
        commit() {
          try {
            games.drop(input.ownerId, input.aiGameId);
          } finally {
            effect.commit();
          }
        },
        rollback() {
          effect.rollback();
        },
      };
    },
  };
  const corsOrigins = corsOriginsOf(options.env);

  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  let heartbeatError: unknown;
  let gateway: { close(): Promise<void> } | undefined;
  let closing: Promise<void> | undefined;
  let started = false;
  let warm: Promise<void> | undefined;
  let beating: Promise<void> | undefined;
  let leasedSince: number | undefined;
  let sweepTimer: ReturnType<typeof setInterval> | undefined;
  let sweeping: Promise<void> | undefined;
  let fenced = false;
  let sweepError: unknown;

  /** Lease cục bộ đã quá hạn kể từ lần gia hạn thành công gần nhất. */
  const lapsed = () =>
    leasedSince !== undefined && Date.now() - leasedSince >= leaseMilliseconds;
  const heartbeat = async () => {
    const client = await pool.connect();
    try {
      const sent = Date.now();
      // Lease đã hết hạn cục bộ thì fence vĩnh viễn: gia hạn thành công sau đó không khôi phục RAM cũ.
      if (lapsed()) fenced = true;
      await reservations.heartbeat(client, bootId);
      if (!fenced) leasedSince = sent;
    } finally {
      client.release();
    }
  };
  /** Một lượt gia hạn lease tại một thời điểm; lỗi được giữ để /ready báo lỗi. */
  const beat = (): Promise<void> => {
    beating ??= heartbeat()
      .then(
        () => {
          heartbeatError = undefined;
        },
        (error: unknown) => {
          heartbeatError = error;
          throw error;
        },
      )
      .finally(() => {
        beating = undefined;
      });
    return beating;
  };
  const warmUp = (): Promise<void> => {
    warm ??= games.ready().catch((error: unknown) => {
      warm = undefined;
      throw error;
    });
    return warm;
  };
  /**
   * Thu hồi boot đã hết hạn; ván còn RAM hết ân hạn 30 phút được lưu trước khi giải phóng.
   * Lease cục bộ đã quá hạn thì fence và bỏ mọi ván RAM trước khi quét.
   * Lỗi từng dòng không dừng cả lượt: được ghi vào sweepError (làm /ready thất bại) và thử lại lượt sau.
   */
  const sweep = (): Promise<void> => {
    sweeping ??= (async () => {
      if (lapsed()) fenced = true;
      if (fenced) await games.close();
      games.prune();
      const failures: unknown[] = [];
      let cursor: AiExpiredCursor | null = null;
      for (;;) {
        const client = await pool.connect();
        let page: AiExpiredReservation[];
        try {
          page = await reservations.expired(client, cursor);
        } finally {
          client.release();
        }
        for (const row of page)
          await transactions
            .run(row.ownerId, { kind: "sweep" }, async (tx) => {
              await tx.reclaim(row.gameId, row.bootId);
              return { value: undefined, install() {} };
            })
            .catch((error: unknown) => {
              failures.push(error);
            });
        if (page.length < 50) break;
        cursor = page.at(-1)!.cursor;
      }
      cursor = null;
      for (;;) {
        const client = await pool.connect();
        let page: ExpiredAiPresence[];
        try {
          page = await presence.dueExpired(client, cursor);
        } finally {
          client.release();
        }
        for (const row of page)
          await games
            .expire(row.ownerId, row.gameId)
            .catch((error: unknown) => {
              failures.push(error);
            });
        if (page.length < 50) break;
        cursor = page.at(-1)!.cursor;
      }
      sweepError = failures[0];
    })()
      .catch((error: unknown) => {
        sweepError = error;
        throw error;
      })
      .finally(() => {
        sweeping = undefined;
      });
    return sweeping;
  };

  /** Socket adapter: every command re-resolves identity and physical tab authority through SQL. */
  const open = async (
    socket: Socket,
    proof: AiSocketProof,
  ): Promise<AiSocketAdmission> => {
    let session: RoomRequestProof = credentialOf(proof);
    const tabId = proof.tabId;
    let generation = 0;
    let watched: string | null = null;
    let owner: RoomScope["actor"] | null = null;

    const toControl = (attachment: AiAttachment): AiSocketControl => {
      generation = attachment.control.generation;
      watched = attachment.gameId;
      return {
        tabId,
        connectionId: socket.id,
        generation,
        mode:
          attachment.control.mode === "writable" ? "controller" : "readonly",
        gameId: attachment.gameId,
        graceUntil: attachment.graceUntil,
      };
    };

    const attach = (
      sessionProof: RoomRequestProof,
      takeover: boolean,
      expectedOwner?: string,
    ) =>
      transactions.read(sessionProof, async (scope, ownerId) => {
        // Refresh stays on the admitted actor; any other principal is an expired session.
        if (expectedOwner !== undefined && ownerId !== expectedOwner)
          throw new RoomError(
            "AUTH_REQUIRED",
            "Phiên chơi với máy không hợp lệ",
            401,
          );
        const attachment = await presence.attach(scope, {
          tabId,
          connectionId: socket.id,
          takeover,
        });
        owner = scope.actor;
        control.bind(
          socket,
          ownerId,
          sessionProof,
          tabId,
          attachment.control.generation,
        );
        return toControl(attachment);
      });

    const origin = () => ({
      kind: "human" as const,
      proof: { ...session },
      tab: { tabId, connectionId: socket.id, generation },
    });

    const sample = (gameId: string) =>
      transactions.read(session, async (scope, ownerId) => {
        const snapshot = games.read(ownerId, gameId);
        if (snapshot.status === "ACTIVE" || snapshot.status === "FINALIZING") {
          await reservations.check(scope, { gameId, bootId });
          await control.assertRetained(scope, gameId);
        }
        const inspected = await control.inspect(scope, origin());
        const { ownerId: _owner, ...publicSnapshot } = snapshot;
        void _owner;
        return {
          snapshot: publicSnapshot,
          serverNow: new Date().toISOString(),
          control: inspected,
        } satisfies AiSocketSnapshot;
      });

    /** Disconnect authority = current reservation under actor lock + exact physical controller proof; watched ids never decide it. */
    const release = async (scope: RoomScope, ownerId: string) => {
      const held = await reservations.held(scope, ownerId);
      if (held.gameId && held.bootId !== bootId) return;
      await presence.disconnected(scope, {
        tabId,
        connectionId: socket.id,
        generation,
        gameId: held.gameId,
      });
    };

    return {
      connect: () => attach(session, false),
      refresh: async (next) => {
        const expectedOwner = owner?.userId;
        if (expectedOwner === undefined)
          throw new RoomError(
            "AUTH_REQUIRED",
            "Phiên chơi với máy không hợp lệ",
            401,
          );
        const attachment = await attach(next, false, expectedOwner);
        session = credentialOf(next);
        return attachment;
      },
      takeover: () => attach(session, true),
      watch: async (gameId) => {
        const value = await sample(gameId);
        watched = gameId;
        return value;
      },
      read: async () => (watched ? sample(watched) : null),
      close: async () => {
        control.unbind(socket);
        if (owner === null || generation === 0) return;
        const actor = owner;
        try {
          await transactions.read(session, (scope, actorId) =>
            release(scope, actorId),
          );
        } catch (error) {
          if (!sessionRevoked(error)) throw error;
          // Revoked session: downgrade-only fallback under the admitted actor's own lock; physical proof still fences.
          await coordinator.withRoom(
            { actor, roomIds: [] },
            async (proof): Promise<RoomAuthorization> => ({
              status: "active",
              actor: proof.actor,
            }),
            (scope) => release(scope, actor.userId),
          );
        }
      },
    };
  };

  return {
    module: AiModule.forRoot(http),
    sessionTermination,
    attach(server) {
      if (closing) throw new Error("AI runtime is closed");
      if (gateway) throw new Error("AI socket gateway already attached");
      gateway = attachAiSocketGateway(server, { corsOrigins, open });
    },
    async start() {
      if (closing) throw new Error("AI runtime is closed");
      if (started) throw new Error("AI runtime already started");
      started = true;
      await warmUp();
      await beat();
      if (closing) return;
      await sweep();
      // close() có thể đã chạy trong lúc chờ warm/lease: không tạo timer mới cho runtime đã đóng.
      if (closing) return;
      heartbeatTimer = setInterval(() => {
        beat().catch(() => {
          // Lỗi đã ghi vào heartbeatError để /ready báo lỗi.
        });
      }, heartbeatMilliseconds);
      heartbeatTimer.unref?.();
      sweepTimer = setInterval(() => {
        sweep().catch(() => {
          // Lỗi đã ghi vào sweepError để /ready báo lỗi.
        });
      }, sweepMilliseconds);
      sweepTimer.unref?.();
    },
    ready() {
      if (closing) return Promise.reject(new Error("AI runtime is closed"));
      if (heartbeatError !== undefined) return Promise.reject(heartbeatError);
      if (sweepError !== undefined) return Promise.reject(sweepError);
      if (fenced || leasedSince === undefined || lapsed())
        return Promise.reject(new Error("AI boot lease expired"));
      return warmUp();
    },
    async close() {
      closing ??= (async () => {
        clearInterval(heartbeatTimer);
        clearInterval(sweepTimer);
        // Chờ lượt gia hạn/quét đang chạy xong trước khi đóng engine và games.
        await Promise.allSettled([beating, sweeping]);
        const failures: unknown[] = [];
        for (const step of [
          () => gateway?.close(),
          () => games.close(),
          () => engine.close(),
        ]) {
          try {
            await step();
          } catch (error) {
            failures.push(error);
          }
        }
        if (failures.length) throw failures[0];
      })();
      return closing;
    },
  };
}
