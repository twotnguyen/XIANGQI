import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { ClockService } from "./clock/clock-service.js";
import { ClockWorker } from "./clock/clock-worker.js";
import type { ClockWorkerPort } from "./clock/contracts.js";
import {
  DisconnectWorker,
  dueDisconnectMatches,
} from "./match/disconnect-worker.js";
import { PostgresClockWorkerPort } from "./clock/postgres-clock-port.js";
import { MatchStore } from "./match/match-store.js";
import { RoomError, type RoomScope, type RoomActor } from "./room/contracts.js";
import { RoomTransactions } from "./room/room-transactions.js";
import { PostgresMemberRoomAuthorizer } from "./room/member-room-auth.js";
import { RoomStore } from "./room/room-store.js";
import { RoomHttpService } from "./room/room-http.service.js";
import { RoomModule } from "./room/room.module.js";
import { RoomWorker } from "./room/room-worker.js";
import { PostgresRoomWorkerPort } from "./room/postgres-room-worker-port.js";
import {
  MemberRealtimeIdentities,
  MemberRealtimeTransactions,
} from "./realtime/member-transactions.js";
import { MemberRealtimePresence } from "./realtime/member-presence.js";
import { GameRooms } from "./realtime/game-rooms.js";
import { RealtimeStore } from "./realtime/store.js";
import type { RealtimePublisher } from "./realtime/gateway.js";
import type { RealtimeTransactions } from "./realtime/contracts.js";
import { logEvent } from "./logger.js";
export async function createRoomRuntime(
  env: Record<string, string | undefined>,
  registration: NonNullable<
    Awaited<ReturnType<typeof createRegistrationRuntime>>
  > | null,
) {
  const enabled = env.ROOMS_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions
  )
    throw new Error("Invalid Room configuration");
  const pool = registration.pool;
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
  } catch {
    throw new Error("Room migration is not ready");
  }
  const coordinator = new RoomTransactions(pool),
    clock = new ClockService(),
    instance = randomUUID();
  const context = new WeakMap<PoolClient, RoomScope>();
  const withScope = async <T>(scope: RoomScope, work: () => Promise<T>) => {
    if (context.has(scope.client))
      throw new RoomError(
        "ROOM_AUTH_PROOF_INVALID",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    context.set(scope.client, scope);
    try {
      return await work();
    } finally {
      context.delete(scope.client);
    }
  };
  const getScope = (client: PoolClient, actor: RoomActor, roomId: string) => {
    const scope = context.get(client);
    if (
      !scope ||
      scope.client !== client ||
      scope.actor.userId !== actor.userId ||
      scope.actor.kind !== actor.kind ||
      !scope.lockedActorIds.has(actor.userId) ||
      !scope.lockedRoomIds.has(roomId)
    )
      throw new RoomError(
        "ROOM_AUTH_PROOF_INVALID",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    return scope;
  };
  const rooms = new RoomStore({
    start: (client, input) => matches.start(client, input),
  });
  const matches = new MatchStore(clock, {
    onMatchEnded: async (client, input) => {
      const scope = context.get(client);
      if (!scope)
        throw new RoomError(
          "ROOM_AUTH_PROOF_INVALID",
          "Giao dịch phòng chưa sẵn sàng",
          503,
        );
      await rooms.onMatchEnded(
        getScope(client, scope.actor, input.roomId),
        input,
      );
    },
  });
  const authorizer = new PostgresMemberRoomAuthorizer(registration.sessions),
    guard = new MemberRealtimeTransactions(coordinator, authorizer);
  const transactions: RealtimeTransactions = {
    run: (connection, work) =>
      guard.run(connection, (client) =>
        withScope(
          guard.getScope(client, connection.identity, connection.roomId),
          () => work(client),
        ),
      ),
  };
  const presence = new MemberRealtimePresence(
    pool,
    coordinator,
    rooms,
    guard,
    instance,
  );
  const store = new RealtimeStore(
    pool,
    new GameRooms(rooms, matches, clock, getScope),
    transactions,
    presence,
  );
  let publisher: RealtimePublisher | null = null;
  const roomPort = new PostgresRoomWorkerPort(
    pool,
    rooms,
    coordinator,
    authorizer,
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
        if (event.type === "media.revoke-room")
          throw new RoomError(
            "MEDIA_UNAVAILABLE",
            "Chia sẻ camera và mic chưa sẵn sàng",
            503,
          );
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
        await publisher.publishSnapshots(event.roomId);
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
  // Managed rooms only: old legacy state lacks the canonical match encoding.
  let cursor: string | null = null;
  do {
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
    closing: Promise<void> | undefined;
  const tick = async () => {
    for (const run of [
      () => clockWorker.tick(),
      () => disconnectWorker.tick(),
      () => worker.tick(),
    ]) {
      try {
        await run();
      } catch {
        process.stderr.write(
          logEvent("error", "realtime_maintenance_failed") + "\n",
        );
      }
    }
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
  const close = () =>
    (closing ??= (async () => {
      closed = true;
      if (timer) clearTimeout(timer);
      await inFlight;
    })());
  const module = RoomModule.forRoot(
    new RoomHttpService(rooms, coordinator, authorizer),
  );
  module.providers = [
    ...(module.providers ?? []),
    { provide: "ROOM_RUNTIME_LIFECYCLE", useValue: { onModuleDestroy: close } },
  ];
  return {
    module,
    realtime: {
      store,
      identities: new MemberRealtimeIdentities(
        authorizer,
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
      if (!started) {
        started = true;
        schedule();
      }
    },
    close,
  };
}
