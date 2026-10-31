import { randomUUID } from "node:crypto";
import { vi } from "vitest";
import { apply, pool, reset } from "../room/room.test-helper.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import type { RoomActor, RoomScope } from "@server/game/room/room.types.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import {
  GuestRoomAuthorizer,
  GuestRoomCoordinator,
} from "@server/game/room/guest-room-auth.js";
import { RoomGuestPort } from "@server/game/room/guest-room-port.js";
import { RoomStore } from "@server/game/room/room-store.js";
import {
  RoomSessionAuthorizer,
  type RoomRequestProof,
} from "@server/game/room/room-session.js";
import { GuestService } from "@server/account/guest/guest.service.js";
import { GuestStore } from "@server/account/guest/guest.store.js";
import { SessionService } from "@server/account/login/session.service.js";
import {
  createLoginPool,
  PostgresLoginStore,
} from "@server/account/login/postgres-login-store.js";
import { AiPresence } from "@server/game/ai/ai-presence.js";
import { AiReservations } from "@server/game/ai/ai-reservations.js";
import { AiHistoryStore } from "@server/game/ai/ai-history-store.js";
import { SqlAiTransactions } from "@server/game/ai/ai-sql-transactions.js";
import { AiGames } from "@server/game/ai/ai-games.js";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
import type { EngineWorker } from "@xiangqi/engine";
import { scopeContext } from "../room/guest-scope.test-helper.js";

export const loginPool = createLoginPool({
  connectionString: process.env.ROOM_TEST_DATABASE_URL,
});
export const coordinator = new RoomTransactions(pool);
const scopes = scopeContext();
export async function resetExpiry() {
  await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE");
  await reset();
  for (const suffix of [
    "06_rooms",
    "07_match_outcomes",
    "08_room_modes",
    "09_match_draw",
    "10_room_chat",
    "11_ai_reservations",
    "12_ai_presence",
  ])
    await apply(`supabase/migrations/202610110000${suffix}.sql`);
  await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
  await apply("supabase/migrations/20261103000005_match_aborted.sql");
  await apply("supabase/migrations/20261103000006_online_undo.sql");
  await apply(
    "supabase/migrations/20261103000007_match_simultaneous_disconnect.sql",
  );
}
export async function run<T>(
  actor: RoomActor,
  work: (scope: RoomScope) => Promise<T>,
) {
  const result = await coordinator.withRoom(
    { actor, roomIds: [] },
    async () => ({ status: "active", actor }),
    work,
  );
  if (result.status !== "active") throw Error("Synthetic expiry fixture ended");
  return result.value;
}

/** Actual sessions, presence, reservations, history and transaction coordinator; only provider/engine are synthetic. */
export async function expiryFixture(kind: "member" | "guest" = "member") {
  let ownerId = randomUUID();
  const email = ownerId + "@example.invalid";
  const provider = {
    signInPassword: vi.fn(),
    verifyAccessToken: vi.fn(async () => ({ userId: ownerId, email })),
  };
  const sessions = new SessionService(
      new PostgresLoginStore(loginPool),
      provider,
    ),
    rooms = new RoomStore(),
    guestPort = new RoomGuestPort(async (client, _guestId, roomId) => {
      await rooms.leave(scopes.scopeOf(client), roomId);
    }, scopes.scopeOf),
    guests = new GuestService(
      new GuestStore(pool),
      guestPort,
      () => new Date(),
      new GuestRoomCoordinator(coordinator, scopes.withScope),
    );
  let proof: RoomRequestProof;
  if (kind === "guest") {
    const guest = await guests.create("Synthetic Guest");
    ownerId = guest.userId;
    proof = { guestCapability: guest.capability };
  } else {
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
      [ownerId, email],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic expiry member',clock_timestamp(),false)",
      [ownerId, "m" + ownerId.replaceAll("-", "").slice(0, 18)],
    );
    const issued = await sessions.issue(ownerId, false);
    proof = {
      accessToken: "synthetic-expiry-token",
      appSession: issued.appSession,
    };
  }
  const authorizer = new RoomSessionAuthorizer(
    new PostgresMemberRoomAuthorizer(sessions),
    new GuestRoomAuthorizer(guests, pool),
  );
  const actor = await authorizer.resolve(proof),
    reservations = new AiReservations(),
    history = new AiHistoryStore(reservations),
    boot = await run(actor, (scope) => reservations.createBoot(scope.client)),
    presence = new AiPresence(boot.id, reservations);
  const origin: Extract<AiOrigin, { kind: "human" }> = {
    kind: "human",
    proof,
    tab: { tabId: randomUUID(), connectionId: randomUUID(), generation: 1 },
  };
  const attached = await run(actor, (scope) =>
    presence.attach(scope, origin.tab),
  );
  origin.tab.generation = attached.control.generation;
  const transactions = new SqlAiTransactions({
    coordinator,
    pool,
    authorizer,
    guests,
    withScope: scopes.withScope,
    reservations,
    history,
    bootId: boot.id,
    control: presence,
  });
  const engine = {
    ready: vi.fn(async () => {}),
    search: vi.fn(() => new Promise<never>(() => {})),
    close: vi.fn(async () => {}),
  };
  const games = new AiGames({
    engine: engine as unknown as EngineWorker,
    transactions,
  });
  await games.ready();
  const initial = await games.create(
    ownerId,
    { requestedSide: "red", level: "easy" },
    origin,
  );
  return {
    actor,
    ownerId,
    origin,
    boot,
    presence,
    reservations,
    history,
    transactions,
    games,
    initial,
  };
}
export async function disconnect(
  f: Awaited<ReturnType<typeof expiryFixture>>,
  expired = true,
) {
  await run(f.actor, (scope) =>
    f.presence.disconnected(scope, { ...f.origin.tab, gameId: f.initial.id }),
  );
  if (expired)
    await pool.query(
      "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '31 minutes' WHERE owner_id=$1 AND game_id=$2",
      [f.ownerId, f.initial.id],
    );
}
