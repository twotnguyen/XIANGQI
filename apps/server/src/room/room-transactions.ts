import type { Pool, PoolClient } from "pg";
import {
  RoomError,
  RoomRosterChanged,
  type RoomActor,
  type RoomScope,
} from "./contracts.js";

export interface RoomTransactionInput {
  actor: RoomActor;
  // [] is valid before a create/join target has been resolved.
  roomIds: readonly string[];
}
// Internal trusted proof. Never serialize to snapshots, receipts or clients.
export interface RoomActorProof {
  client: PoolClient;
  actor: RoomActor;
  roomIds: readonly string[];
  lockedActorIds: ReadonlySet<string>;
  activeActorIds?: ReadonlySet<string>;
}
export type RoomAuthorization =
  | { status: "active"; actor: RoomActor; activeActorIds?: ReadonlySet<string> }
  | { status: "ended" };
export type RoomAuthorize = (
  proof: RoomActorProof,
) => Promise<RoomAuthorization>;
export type PreparedRoomActors =
  { status: "active"; proof: RoomActorProof } | { status: "ended" };
export type RoomTransactionResult<T> =
  { status: "active"; value: T } | { status: "ended" };

function uuid(value: string) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new RoomError("ROOM_INPUT_INVALID", "Định danh không hợp lệ", 400);
  return value.toLowerCase();
}
function canonical(input: RoomTransactionInput): RoomTransactionInput {
  if (
    !input?.actor ||
    !["member", "guest"].includes(input.actor.kind) ||
    !Array.isArray(input.roomIds)
  )
    throw new RoomError(
      "ROOM_INPUT_INVALID",
      "Thông tin phòng không hợp lệ",
      400,
    );
  return {
    actor: { userId: uuid(input.actor.userId), kind: input.actor.kind },
    roomIds: [...new Set(input.roomIds.map(uuid))].sort(),
  };
}
async function projection(client: PoolClient, input: RoomTransactionInput) {
  const rooms = (
    await client.query<{ id: string }>(
      `SELECT id FROM public.rooms WHERE id=ANY($1::uuid[])
     OR (owner_id=$2 AND closed_at IS NULL)
     OR id IN (SELECT room_id FROM public.room_members WHERE user_id=$2)
     OR id IN (SELECT room_id FROM public.active_players WHERE user_id=$2)
     OR id IN (SELECT room_id FROM public.matches WHERE id IN (SELECT match_id FROM public.active_players WHERE user_id=$2))
     ORDER BY id`,
      [input.roomIds, input.actor.userId],
    )
  ).rows.map((r) => r.id);
  const actors = (
    await client.query<{ id: string }>(
      `SELECT owner_id AS id FROM public.rooms WHERE id=ANY($1::uuid[])
     UNION SELECT user_id FROM public.room_members WHERE room_id=ANY($1::uuid[])
     UNION SELECT red_user_id FROM public.matches WHERE id IN
       (SELECT current_match_id FROM public.rooms WHERE id=ANY($1::uuid[]) UNION SELECT match_id FROM public.active_players WHERE user_id=$2)
     UNION SELECT black_user_id FROM public.matches WHERE id IN
       (SELECT current_match_id FROM public.rooms WHERE id=ANY($1::uuid[]) UNION SELECT match_id FROM public.active_players WHERE user_id=$2)`,
      [rooms, input.actor.userId],
    )
  ).rows
    .map((r) => r.id)
    .filter((id): id is string => id !== null);
  // Include nonexistent targets for the room advisory lock and eventual domain 404.
  return {
    roomIds: [...new Set([...input.roomIds, ...rooms])].sort(),
    actorIds: [...new Set([input.actor.userId, ...actors])].sort(),
  };
}
function requireComplete(
  proof: RoomActorProof,
  current: { roomIds: string[]; actorIds: string[] },
) {
  if (
    current.actorIds.some((id) => !proof.lockedActorIds.has(id)) ||
    current.roomIds.some((id) => !proof.roomIds.includes(id))
  )
    throw new RoomRosterChanged(current.actorIds);
}

export class RoomTransactions {
  constructor(private readonly pool: Pool) {}

  // Caller owns an open app_server transaction. Call before every room lock.
  // authorize may lockRooms(proof) only after validating the principal, for ended cleanup.
  async prepare(
    client: PoolClient,
    input: RoomTransactionInput,
    authorize: RoomAuthorize,
    extraActorIds: readonly string[] = [],
  ): Promise<PreparedRoomActors> {
    const normalized = canonical(input);
    const before = await projection(client, normalized);
    const actorIds = [
      ...new Set([...before.actorIds, ...extraActorIds.map(uuid)]),
    ].sort();
    for (const id of actorIds)
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        ["actor:" + id],
      );
    const after = await projection(client, normalized);
    const proof: RoomActorProof = {
      client,
      actor: normalized.actor,
      roomIds: after.roomIds,
      lockedActorIds: new Set(actorIds),
    };
    requireComplete(proof, after);
    const authorization = await this.reauthorize(proof, authorize);
    if (authorization.status === "ended") return { status: "ended" };
    return { status: "active", proof };
  }

  // Recheck after room locks as a fixed deadline may pass during a row lock wait.
  // Auth implementations reuse already held actor/session/profile locks and never
  // call the provider or acquire additional actor locks here.
  async reauthorize(
    proof: RoomActorProof,
    authorize: RoomAuthorize,
  ): Promise<RoomAuthorization> {
    const authorization = await authorize(proof);
    if (authorization.status === "ended") return { status: "ended" };
    if (
      uuid(authorization.actor.userId) !== proof.actor.userId ||
      authorization.actor.kind !== proof.actor.kind
    )
      throw new RoomError(
        "ROOM_AUTH_MISMATCH",
        "Phiên không khớp người thao tác",
        403,
      );
    if (authorization.activeActorIds) {
      const active = new Set([...authorization.activeActorIds].map(uuid));
      if ([...active].some((id) => !proof.lockedActorIds.has(id)))
        throw new RoomError(
          "ROOM_AUTH_PROOF_INVALID",
          "Chứng thực người chơi chưa đầy đủ",
          503,
        );
      proof.activeActorIds = active;
    } else delete proof.activeActorIds;
    return authorization;
  }

  // Same client and complete actor union; never acquire actors here.
  async lockRooms(proof: RoomActorProof): Promise<RoomScope> {
    for (const id of proof.roomIds)
      await proof.client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        ["room:" + id],
      );
    if (proof.roomIds.length)
      await proof.client.query(
        "SELECT id FROM public.rooms WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [proof.roomIds],
      );
    requireComplete(
      proof,
      await projection(proof.client, {
        actor: proof.actor,
        roomIds: proof.roomIds,
      }),
    );
    return {
      client: proof.client,
      actor: proof.actor,
      lockedActorIds: proof.lockedActorIds,
      lockedRoomIds: new Set(proof.roomIds),
      ...(proof.activeActorIds ? { activeActorIds: proof.activeActorIds } : {}),
    };
  }

  async withRoom<T>(
    input: RoomTransactionInput,
    authorize: RoomAuthorize,
    work: (scope: RoomScope) => Promise<T>,
  ): Promise<RoomTransactionResult<T>> {
    const normalized = canonical(input);
    const extraActors = new Set<string>();
    for (let attempt = 0; attempt < 3; attempt++) {
      const client = await this.pool.connect();
      let broken = false;
      try {
        await client.query("BEGIN");
        await client.query("SET LOCAL ROLE app_server");
        const prepared = await this.prepare(client, normalized, authorize, [
          ...extraActors,
        ]);
        if (prepared.status === "ended") {
          await client.query("COMMIT");
          return { status: "ended" };
        }
        const scope = await this.lockRooms(prepared.proof);
        const current = await this.reauthorize(prepared.proof, authorize);
        if (current.status === "ended") {
          await client.query("COMMIT");
          return { status: "ended" };
        }
        scope.activeActorIds = prepared.proof.activeActorIds;
        const value = await work(scope);
        await client.query("COMMIT");
        return { status: "active", value };
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          broken = true;
        }
        if (!broken && error instanceof RoomRosterChanged) {
          for (const id of error.actorIds) extraActors.add(uuid(id));
          if (attempt < 2) continue;
          throw new RoomError(
            "ROOM_ROSTER_UNSTABLE",
            "Phòng đang thay đổi, vui lòng thử lại",
            409,
          );
        }
        throw error;
      } finally {
        client.release(broken);
      }
    }
    throw new RoomError(
      "ROOM_ROSTER_UNSTABLE",
      "Phòng đang thay đổi, vui lòng thử lại",
      409,
    );
  }
}
