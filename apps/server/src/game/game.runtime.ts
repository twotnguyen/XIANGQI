import { createHash, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { maskForbiddenChat } from "@xiangqi/shared";
import { FriendStore } from "../account/friend/friend.store.js";
import { RoomFriendInvites } from "./room/friend-room-port.js";
import { RoomSessionSeats } from "./room/session-seat-port.js";
import { SessionSeatStore } from "./room/session-seat-store.js";
import { ChatStore } from "./chat/chat-store.js";
import { ChatRealtimeService } from "./chat/chat-realtime.js";
import { ChatOutboxWorker } from "./chat/chat-worker.js";
import type { createRegistrationRuntime } from "../account/auth/registration.module.js";
import { ClockService } from "./clock/clock.service.js";
import { ClockWorker } from "./clock/clock-worker.js";
import type { ClockWorkerPort } from "./clock/clock.types.js";
import {
  DisconnectWorker,
  dueDisconnectMatches,
} from "./match/disconnect-worker.js";
import { PostgresClockWorkerPort } from "./clock/postgres-clock-port.js";
import { DrawWorker, dueDrawOffers } from "./match/draw-worker.js";
import {
  RoomError,
  type RoomScope,
  type RoomActor,
} from "./room/room.types.js";
import { createRoomWiring } from "./room/room-wiring.js";
import { PostgresMemberRoomAuthorizer } from "./room/member-room-auth.js";
import { RoomHttpService } from "./room/room-http.service.js";
import { GuestService } from "../account/guest/guest.service.js";
import { GuestStore } from "../account/guest/guest.store.js";
import { GuestError } from "../account/guest/guest.types.js";
import {
  GuestRoomAuthorizer,
  GuestRoomCoordinator,
} from "./room/guest-room-auth.js";
import {
  RoomGuestPort,
  type AiSessionTermination,
} from "./room/guest-room-port.js";
import { RoomSessionAuthorizer } from "./room/room-session.js";
import { PublicRoomModule } from "./room/public/public-room.module.js";
import { PublicRoomStore } from "./room/public/public-room-store.js";
import { PublicRoomService } from "./room/public/public-room-service.js";
import type { PublicFeedProof } from "./room/public/public-room-feed.js";
import { RoomModule } from "./room/room.module.js";
import { RoomWorker } from "./room/room-worker.js";
import { PostgresRoomWorkerPort } from "./room/postgres-room-worker-port.js";
import {
  RoomRealtimeIdentities,
  RoomRealtimeTransactions,
} from "./realtime/member-transactions.js";
import { RoomRealtimePresence } from "./realtime/member-presence.js";
import { GameRooms } from "./realtime/game-rooms.js";
import { RealtimeStore } from "./realtime/store.js";
import type { RealtimePublisher } from "./realtime/gateway.js";
import type { RealtimeTransactions } from "./realtime/realtime.types.js";
import { logEvent } from "../core/logger.js";
import {
  acquireRuntimeLock,
  fenceClient,
  unfenceClient,
  type RuntimeLock,
} from "../core/runtime-lock.js";
type RoomRegistration = NonNullable<
  Awaited<ReturnType<typeof createRegistrationRuntime>>
>;
type RoomMedia = {
  revoke(roomId: string, userId: string, eventId: string): Promise<void>;
  revokeRoom(roomId: string): Promise<void>;
} | null;
/**
 * Khởi tạo toàn bộ môi trường chạy phòng cờ (Room Runtime):
 * - Kiểm tra tính sẵn sàng của schema và migration CSDL (room, draw, chat, public room).
 * - Khởi tạo các Store, Service, và Authorizer cho phòng, trận đấu, đồng hồ và chat.
 * - Khôi phục trạng thái phòng/ván cờ khi server khởi động lại (SERVER_RESTART).
 * - Điều phối vòng lặp các worker nền: đồng hồ, ngắt kết nối, hết hạn hòa, outbox phòng, chat và media.
 */
export async function createRoomRuntime(
  env: Record<string, string | undefined>,
  registration: NonNullable<
    Awaited<ReturnType<typeof createRegistrationRuntime>>
  > | null,
  media: RoomMedia = null,
) {
  const enabled = env.ROOMS_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions
  )
    throw new Error("Invalid Room configuration");
  const sessions = registration.sessions;
  const lock = await acquireRuntimeLock(registration.pool);
  try {
    return await bootRoomRuntime(registration, sessions, media, lock);
  } catch (error) {
    await lock.release().catch(() => undefined);
    throw error;
  }
}

async function bootRoomRuntime(
  registration: RoomRegistration,
  sessions: NonNullable<RoomRegistration["sessions"]>,
  media: RoomMedia,
  lock: RuntimeLock,
) {
  const admission = new RoomAdmission();
  const pool = admittedPool(registration.pool, admission, lock);
  let drawReady: boolean;
  let chatReady = false;
  let publicReady: boolean;
  try {
    const schema =
      await pool.query(`SELECT pg_has_role(current_user,'app_server','SET') AND
      has_schema_privilege('app_server','xiangqi_auth','USAGE') AND has_schema_privilege('app_server','xiangqi_realtime','USAGE') AND has_schema_privilege('app_server','xiangqi_room','USAGE') AND
      (SELECT bool_and(pg_catalog.to_regclass(name) IS NOT NULL AND has_table_privilege('app_server',name,'SELECT')) FROM unnest(ARRAY[
        'xiangqi_auth.registration_intents','xiangqi_auth.accounts','xiangqi_auth.app_sessions','xiangqi_auth.login_attempts',
        'xiangqi_auth.principals','xiangqi_auth.google_creation_intents','xiangqi_auth.google_temporary_accounts',
        'xiangqi_realtime.tabs','xiangqi_realtime.controllers','xiangqi_realtime.receipts',
        'xiangqi_room.presence','xiangqi_room.countdowns','xiangqi_room.outbox','xiangqi_room.entry_receipts',
        'public.rooms','public.room_members','public.matches','public.active_players','public.match_events','public.match_moves']) name)
      AND EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE oid='public.moves'::regclass AND relrowsecurity AND relforcerowsecurity)
      AND NOT has_table_privilege('anon','public.moves','INSERT,UPDATE,DELETE')
      AND NOT has_table_privilege('authenticated','public.moves','INSERT,UPDATE,DELETE')
      AND EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.matches'::regclass AND conname='matches_status_and_outcome_invariants' AND convalidated
        AND strpos(pg_catalog.pg_get_constraintdef(oid),'SERVER_RESTART')>0 AND strpos(pg_catalog.pg_get_constraintdef(oid),'DRAW_AGREEMENT')>0) AS ready`);
    if (!schema.rows[0]?.ready) throw new Error();
    const draw = await pool.query<{ present: boolean; ready: boolean }>(`SELECT
      to_regclass('xiangqi_room.match_draw_offers') IS NOT NULL AS present,
      CASE WHEN to_regclass('xiangqi_room.match_draw_offers') IS NULL THEN false ELSE
        has_table_privilege('app_server','xiangqi_room.match_draw_offers','SELECT') AND
        has_table_privilege('app_server','xiangqi_room.match_draw_offers','INSERT') AND
        has_table_privilege('app_server','xiangqi_room.match_draw_offers','UPDATE') AND
        NOT has_table_privilege('app_server','xiangqi_room.match_draw_offers','DELETE') AND
        NOT has_table_privilege('anon','xiangqi_room.match_draw_offers','SELECT,INSERT,UPDATE,DELETE') AND
        NOT has_table_privilege('authenticated','xiangqi_room.match_draw_offers','SELECT,INSERT,UPDATE,DELETE')
      END AS ready`);
    if (draw.rows[0]?.present && !draw.rows[0].ready) throw new Error();
    drawReady = draw.rows[0]?.ready === true;
    const publicSchema = await pool.query<{
      present: boolean;
      ready: boolean;
    }>(`SELECT
      EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.rooms'::regclass
        AND attname='public_opened_at' AND NOT attisdropped) AS present,
      EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.rooms'::regclass
        AND attname='public_opened_at' AND atttypid='timestamptz'::regtype AND NOT attisdropped)
      AND EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.rooms'::regclass
        AND conname='rooms_visibility_check' AND convalidated
        AND strpos(pg_get_constraintdef(oid),'LOCKED')>0
        AND strpos(pg_get_constraintdef(oid),'PUBLIC')>0) AS ready`);
    if (publicSchema.rows[0]?.present && !publicSchema.rows[0].ready)
      throw new Error();
    publicReady = publicSchema.rows[0]?.ready === true;
    const chatSchema = await pool.query(
      "SELECT to_regnamespace('xiangqi_chat') IS NOT NULL AS present",
    );
    if (chatSchema.rows[0]?.present) {
      const chat = await pool.query(`SELECT
        has_schema_privilege('app_server','xiangqi_chat','USAGE') AND
        (SELECT bool_and(
          c.oid IS NOT NULL AND c.relrowsecurity AND c.relforcerowsecurity AND
          has_table_privilege('app_server',c.oid,'SELECT') AND
          has_table_privilege('app_server',c.oid,'INSERT') AND
          has_table_privilege('app_server',c.oid,'DELETE') AND
          has_table_privilege('app_server',c.oid,'UPDATE') = (t.name IN ('rooms','entries','rate','outbox')) AND
          NOT has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') AND
          NOT has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE') AND
          NOT has_table_privilege('service_role',c.oid,'SELECT,INSERT,UPDATE,DELETE')
        ) FROM unnest(ARRAY['rooms','entries','messages','receipts','rate','outbox']) t(name)
          LEFT JOIN pg_class c ON c.oid=to_regclass('xiangqi_chat.'||t.name)) AND
        EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid=to_regclass('xiangqi_chat.messages')
          AND attname='sender_role' AND atttypid='text'::regtype AND attnotnull AND NOT attisdropped) AND
        EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.room_members'::regclass AND tgname='chat_membership' AND tgenabled='O') AND
        EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='chat_room_closed' AND tgenabled='O') AS ready`);
      if (chat.rows[0]?.ready !== true) throw new Error();
      chatReady = true;
    }
  } catch {
    throw new Error("Room migration is not ready");
  }
  const clock = new ClockService(),
    instance = randomUUID();
  const { coordinator, context, withScope, getScope, rooms, matches } =
    createRoomWiring(pool, clock);
  const sessionSeats = new RoomSessionSeats(
    coordinator,
    rooms,
    new SessionSeatStore(),
    withScope,
  );
  sessions.attachSeats(sessionSeats);
  const authorizer = new PostgresMemberRoomAuthorizer(sessions);
  const guestPort = new RoomGuestPort(
    (client, guestId, roomId) =>
      rooms
        .leave(
          getScope(client, { userId: guestId, kind: "guest" }, roomId),
          roomId,
        )
        .then(() => undefined),
    (client) => {
      const scope = context.get(client);
      if (!scope)
        throw new RoomError(
          "ROOM_AUTH_PROOF_INVALID",
          "Giao dịch phòng chưa sẵn sàng",
          503,
        );
      return scope;
    },
  );
  const guests = new GuestService(
    new GuestStore(pool),
    guestPort,
    () => new Date(),
    new GuestRoomCoordinator(coordinator, withScope),
  );
  const sessionAuthorizer = new RoomSessionAuthorizer(
    authorizer,
    new GuestRoomAuthorizer(guests, pool),
  );
  const guard = new RoomRealtimeTransactions(coordinator, sessionAuthorizer);
  const transactions: RealtimeTransactions = {
    run: (connection, work) =>
      guard.run(connection, (client) =>
        withScope(
          guard.getScope(client, connection.identity, connection.roomId),
          () => work(client),
        ),
      ),
  };
  let publisher: RealtimePublisher | null = null;
  const chat = chatReady
    ? new ChatRealtimeService(new ChatStore(maskForbiddenChat), guard)
    : undefined;
  const chatWorker = chat
    ? new ChatOutboxWorker(pool, async (roomId, channel) => {
        if (!publisher?.publishChat)
          throw new Error("Chat publisher is not attached");
        await publisher.publishChat(roomId, channel);
      })
    : undefined;
  const presence = new RoomRealtimePresence(
    pool,
    coordinator,
    rooms,
    guard,
    instance,
    (id) => publisher?.connections(id) ?? [],
  );
  const store = new RealtimeStore(
    pool,
    new GameRooms(
      rooms,
      matches,
      clock,
      getScope,
      drawReady ? matches : undefined,
    ),
    transactions,
    presence,
  );
  const roomPort = new PostgresRoomWorkerPort(
    pool,
    rooms,
    coordinator,
    sessionAuthorizer,
    (id) => publisher?.connections(id) ?? [],
  );
  const worker = new RoomWorker(
    rooms,
    {
      dueRooms: () => roomPort.dueRooms(),
      pendingEvents: () => roomPort.pendingEvents(),
      markDelivered: (id: string) => roomPort.markDelivered(id),
      markFailed: (id: string) => roomPort.markFailed(id),
      withRoom: (id: string, work: (scope: RoomScope) => Promise<void>) =>
        roomPort.withRoom(id, (scope) => withScope(scope, () => work(scope))),
    },
    {
      deliver: async (event) => {
        if (!publisher) throw new Error("Realtime publisher is not attached");
        if (event.type === "room.closed") {
          const recipients = event.payload.recipients;
          if (
            event.payload.message !== "Phòng đã đóng" ||
            !Array.isArray(recipients) ||
            recipients.some(
              (id) =>
                typeof id !== "string" ||
                !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                  id,
                ),
            )
          )
            throw new RoomError(
              "ROOM_EVENT_INVALID",
              "Sự kiện phòng chưa hợp lệ",
              503,
            );
          await publisher.publishRoomClosed(event.roomId, recipients);
          return;
        }
        await publisher.publishSnapshots(event.roomId, event.version);
      },
    },
  );
  const clockPort = new PostgresClockWorkerPort(pool, coordinator);
  const withMatch: ClockWorkerPort["withMatch"] = (candidate, work) =>
    clockPort.withMatch(candidate, async (scope) => {
      const actor = (
        await scope.client.query<{ id: string; kind: RoomActor["kind"] }>(
          "SELECT m.red_user_id AS id,p.kind FROM public.matches m JOIN xiangqi_auth.principals p ON p.id=m.red_user_id WHERE m.id=$1 AND m.room_id=$2",
          [scope.matchId, scope.roomId],
        )
      ).rows[0];
      if (!actor || !scope.lockedActorIds.has(actor.id))
        throw new RoomError(
          "ROOM_AUTH_PROOF_INVALID",
          "Giao dịch phòng chưa sẵn sàng",
          503,
        );
      await withScope(
        {
          client: scope.client,
          actor: { userId: actor.id, kind: actor.kind },
          lockedActorIds: scope.lockedActorIds,
          lockedRoomIds: scope.lockedRoomIds,
        },
        () => work(scope),
      );
    });
  const clockWorker = new ClockWorker(clock, matches, {
    dueMatches: (cursor) => clockPort.dueMatches(cursor),
    withMatch,
  });
  const read = async <T>(work: (client: PoolClient) => Promise<T>) => {
    const client = await pool.connect();
    let broken = false;
    try {
      await client.query("BEGIN READ ONLY; SET LOCAL ROLE app_server");
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
  };
  const disconnectWorker = new DisconnectWorker(matches, {
    dueMatches: (cursor) =>
      read((client) => dueDisconnectMatches(client, cursor)),
    withMatch,
  });
  const drawWorker = drawReady
    ? new DrawWorker(matches, {
        dueOffers: (cursor) => read((client) => dueDrawOffers(client, cursor)),
        withMatch: (candidate, work) =>
          withMatch(candidate, async (scope) => {
            const roomScope = context.get(scope.client);
            if (!roomScope)
              throw new RoomError(
                "ROOM_AUTH_PROOF_INVALID",
                "Giao dịch phòng chưa sẵn sàng",
                503,
              );
            await work({
              ...roomScope,
              roomId: candidate.roomId,
              canControl: true,
            });
          }),
      })
    : null;
  // Managed rooms only: old legacy state lacks the canonical match encoding.
  let cursor: string | null = null;
  do {
    lock.ready();
    const batch = await read((client) =>
      client.query<{ id: string; owner_id: string; kind: RoomActor["kind"] }>(
        "SELECT r.id,r.owner_id,p.kind FROM public.rooms r JOIN xiangqi_auth.principals p ON p.id=r.owner_id WHERE r.invite_code IS NOT NULL AND r.closed_at IS NULL AND r.status IN('WAITING','FINISHED','PLAYING') AND ($1::uuid IS NULL OR r.id>$1) ORDER BY r.id LIMIT 50",
        [cursor],
      ),
    );
    for (const row of batch.rows)
      await coordinator.withRoom(
        { actor: { userId: row.owner_id, kind: row.kind }, roomIds: [row.id] },
        async (proof) => ({ status: "active", actor: proof.actor }),
        (scope) =>
          withScope(scope, async () => {
            lock.ready();
            const current = (
              await scope.client.query<{
                status: string;
                current_match_id: string | null;
              }>(
                "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
                [row.id],
              )
            ).rows[0];
            if (!current || current.status === "CLOSED") return;
            if (current.status === "PLAYING") {
              if (!current.current_match_id)
                throw new Error("Room recovery is not ready");
              const at = (
                await scope.client.query<{ at: Date }>(
                  "SELECT clock_timestamp() AS at",
                )
              ).rows[0]!.at;
              await matches.finish(scope.client, {
                roomId: row.id,
                matchId: current.current_match_id,
                outcome: { reason: "SERVER_RESTART", winner: null },
                at,
              });
            }
            await rooms.recoverWaiting(scope, row.id, instance);
          }),
      );
    cursor = batch.rows.length === 50 ? batch.rows[49]!.id : null;
  } while (cursor);
  let timer: ReturnType<typeof setTimeout> | undefined,
    inFlight: Promise<void> | null = null,
    started = false,
    closed = false,
    closing: Promise<void> | undefined,
    stopping: Promise<void> | undefined;
  let nextReceiptCleanup = 0;
  let nextGuestExpiry = 0;
  let nextMediaSweep = 0;
  let mediaInFlight: Promise<void> | null = null;
  const drainMedia = async () => {
    const event = await roomPort.pendingMediaEvent();
    if (!event) return;
    try {
      if (!media) throw new Error("Media revocation is unavailable");
      if (event.type === "media.revoke-room") {
        await media.revokeRoom(event.roomId);
      } else {
        const userId = event.payload.userId;
        if (
          typeof userId !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            userId,
          )
        )
          throw new Error("malformed media.revoke-user payload");
        await media.revoke(event.roomId, userId, event.id);
      }
      await roomPort.markDelivered(event.id);
    } catch {
      await roomPort.markFailed(event.id);
    }
    nextMediaSweep = 0;
  };
  const tick = async () => {
    // Media service latency must not delay clocks, room transitions or chat.
    if (!mediaInFlight && Date.now() >= nextMediaSweep) {
      nextMediaSweep = Date.now() + 1000;
      mediaInFlight = drainMedia()
        .catch(() => {
          process.stderr.write(
            logEvent("error", "media_revocation_failed") + "\n",
          );
        })
        .finally(() => {
          mediaInFlight = null;
        });
    }
    // Pollers are independent and each takes its own room locks; serial runs
    // cost one DB round-trip chain per worker, which dominates tick latency.
    await Promise.all(
      [
        async () => {
          if (Date.now() < nextReceiptCleanup) return;
          nextReceiptCleanup = Date.now() + 60000;
          const removed = await roomPort.cleanupExpiredReceipts();
          nextReceiptCleanup = Date.now() + (removed >= 500 ? 1000 : 60000);
        },
        async () => {
          if (Date.now() < nextGuestExpiry) return;
          nextGuestExpiry = Date.now() + 60000;
          await guests.expireDue();
        },
        () => clockWorker.tick(),
        () => disconnectWorker.tick(),
        ...(drawWorker ? [() => drawWorker.tick()] : []),
        () => worker.tick(),
        ...(chatWorker ? [() => chatWorker.tick()] : []),
      ].map(async (run) => {
        try {
          await run();
        } catch {
          process.stderr.write(
            logEvent("error", "realtime_maintenance_failed") + "\n",
          );
        }
      }),
    );
  };
  const schedule = () => {
    if (closed) return;
    timer = setTimeout(() => {
      timer = undefined;
      inFlight = tick().finally(() => {
        inFlight = null;
        schedule();
      });
    }, 100);
    timer.unref();
  };
  void lock.lost.then(() => {
    closed = true;
    clearTimeout(timer);
    void admission.close();
  });
  // Quiesce: đóng cổng nhận trước, rồi chờ tick/media/chat và thao tác đang chạy; giữ khóa tới close().
  const stop = () =>
    (stopping ??= (async () => {
      closed = true;
      clearTimeout(timer);
      const drained = admission.close();
      try {
        await inFlight;
        await mediaInFlight;
        await chatWorker?.close();
      } finally {
        await drained;
      }
    })());
  const close = () =>
    (closing ??= (async () => {
      try {
        await stop();
      } finally {
        await lock.release();
      }
    })());
  const publicService = publicReady
    ? new PublicRoomService(
        new PublicRoomStore(rooms),
        coordinator,
        sessionAuthorizer,
        withScope,
      )
    : null;
  const module = RoomModule.forRoot(
    new RoomHttpService(rooms, coordinator, sessionAuthorizer, withScope),
  );
  if (publicService)
    module.imports = [
      ...(module.imports ?? []),
      PublicRoomModule.forRoot(publicService),
    ];
  module.providers = [
    ...(module.providers ?? []),
    { provide: "ROOM_RUNTIME_LIFECYCLE", useValue: { onModuleDestroy: close } },
  ];
  lock.ready();
  return {
    module,
    guests,
    authorizer: sessionAuthorizer,
    friendInvites: new RoomFriendInvites(
      new FriendStore(pool),
      rooms,
      coordinator,
      sessionAuthorizer,
      withScope,
    ),
    withScope,
    attachAiTermination(port: AiSessionTermination) {
      guestPort.attachAiTermination(port);
      sessionSeats.attachAiTermination(port);
    },
    get ownershipPool(): Pool {
      return pool;
    },
    publicFeed: publicService
      ? {
          open: (proof: PublicFeedProof) =>
            publicService.open(
              proof.kind === "member"
                ? {
                    accessToken: proof.accessToken,
                    appSession: proof.appSession,
                  }
                : { guestCapability: proof.guestCapability },
            ),
        }
      : null,
    realtime: {
      store,
      ...(chat ? { chat } : {}),
      identities: new RoomRealtimeIdentities(
        sessionAuthorizer,
        (userId, appSession) =>
          read(async (client) => {
            const hash = createHash("sha256").update(appSession).digest("hex");
            const row = (
              await client.query<{ active: boolean }>(
                `
 SELECT (s.revoked_at IS NULL AND s.expires_at>clock_timestamp()
 AND a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL
 AND NOT p.registration_pending AND n.kind='member' AND n.auth_user_id=a.id) AS active
 FROM xiangqi_auth.app_sessions s JOIN xiangqi_auth.accounts a ON a.id=s.user_id
 JOIN public.profiles p ON p.user_id=a.id JOIN xiangqi_auth.principals n ON n.id=a.id
 WHERE s.token_hash=$1 AND s.user_id=$2`,
                [hash, userId],
              )
            ).rows[0];
            return row?.active === true;
          }),
        (guestCapability: string) =>
          guests.requireActive(guestCapability, "read").then(
            () => true,
            (error: unknown) => {
              if (
                error instanceof GuestError &&
                (error.code === "GUEST_INVALID" ||
                  error.code === "GUEST_EXPIRED")
              )
                return false;
              throw error;
            },
          ),
      ),
      onAttached: (attached: RealtimePublisher) => {
        if (publisher && publisher !== attached)
          throw new Error("Realtime publisher is already attached");
        publisher = attached;
      },
    },
    start: async () => {
      if (closed) throw new Error("Room runtime is closed");
      if (!publisher) throw new Error("Realtime publisher is not attached");
      if (chat && !publisher.publishChat)
        throw new Error("Chat publisher is not attached");
      if (!started) {
        started = true;
        schedule();
      }
    },
    ready: async () => {
      lock.ready();
      if (!started || closed) throw new Error("Room runtime is not ready");
    },
    lost: lock.lost,
    stop,
    close,
  };
}
/** Cổng nhận thao tác: đóng nhận mới rồi chờ các thao tác đang chạy kết thúc. */
class RoomAdmission {
  private open = true;
  private active = 0;
  private readonly idle: Promise<void>;
  private resolveIdle!: () => void;
  constructor() {
    this.idle = new Promise<void>((resolve) => {
      this.resolveIdle = resolve;
    });
  }
  assertOpen(): void {
    if (!this.open)
      throw new RoomError(
        "ROOM_RUNTIME_UNAVAILABLE",
        "Máy chủ phòng đang dừng",
        503,
      );
  }
  enter(): () => void {
    this.assertOpen();
    this.active += 1;
    let left = false;
    return () => {
      if (left) return;
      left = true;
      this.active -= 1;
      if (this.active === 0 && !this.open) this.resolveIdle();
    };
  }
  close(): Promise<void> {
    this.open = false;
    if (this.active === 0) this.resolveIdle();
    return this.idle;
  }
}

/**
 * Mọi truy cập DB của runtime đi qua cổng nhận và fence: kết nối chỉ dùng được khi
 * holder PID của khóa đơn vẫn giữ khóa (xem runtime-lock). Kết nối xếp hàng trước khi
 * đóng cổng được kiểm tra lại sau khi lấy được, nên không ghi khi máy chủ đã dừng.
 */
function admittedPool(
  pool: Pool,
  admission: RoomAdmission,
  lock: RuntimeLock,
): Pool {
  const connect = async (target: Pool): Promise<PoolClient> => {
    const exit = admission.enter();
    let client: PoolClient;
    try {
      client = await target.connect();
    } catch (error) {
      exit();
      throw error;
    }
    const release = client.release.bind(client) as (
      error?: Error | boolean,
    ) => void;
    let left = false;
    const leave = () => {
      if (left) return;
      left = true;
      exit();
    };
    try {
      admission.assertOpen();
      lock.ready();
      await fenceClient(client, lock.holderPid);
    } catch (error) {
      release(true);
      leave();
      throw error;
    }
    let returned = false;
    client.release = (error?: Error | boolean) => {
      if (returned) return;
      returned = true;
      if (error) {
        release(error);
        leave();
        return;
      }
      unfenceClient(client)
        .then(
          () => release(),
          () => release(true),
        )
        .finally(leave);
    };
    return client;
  };
  return new Proxy(pool, {
    get(target, key) {
      if (key === "connect")
        return (...args: unknown[]) => {
          const callback =
            typeof args.at(-1) === "function"
              ? (args.pop() as (...results: unknown[]) => void)
              : undefined;
          const acquired = connect(target);
          if (!callback) return acquired;
          acquired.then(
            (client) =>
              callback(undefined, client, (error?: Error | boolean) =>
                client.release(error),
              ),
            (error: unknown) => callback(error),
          );
          return undefined;
        };
      if (key === "query")
        return (...args: unknown[]) => {
          const callback =
            typeof args.at(-1) === "function"
              ? (args.pop() as (...results: unknown[]) => void)
              : undefined;
          const result = (async () => {
            const client = await connect(target);
            try {
              return await Reflect.apply(client.query, client, args);
            } finally {
              client.release();
            }
          })();
          if (!callback) return result;
          result.then(
            (value) => callback(undefined, value),
            (error: unknown) => callback(error),
          );
          return undefined;
        };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
