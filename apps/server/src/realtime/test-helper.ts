import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import type { RoomCommand, RoomStateSnapshot } from "@xiangqi/shared";
import {
  RealtimeError,
  type RealtimeIdentity,
  type RoomCollaborator,
  type RealtimeConnection,
  type RoomExecutionResult,
} from "./contracts.js";

export const realtimeTestUrl = process.env.REALTIME_TEST_DATABASE_URL;
if (realtimeTestUrl) {
  const parsed = new URL(realtimeTestUrl);
  if (
    !["localhost", "127.0.0.1", "postgres"].includes(parsed.hostname) ||
    parsed.pathname !== "/xiangqi_realtime_test"
  )
    throw new Error(
      "REALTIME_TEST_DATABASE_URL must identify the isolated xiangqi_realtime_test database",
    );
}

export async function prepareFixture() {
  const admin = new Pool({ connectionString: realtimeTestUrl });
  await admin.query(`
    DO $$ BEGIN
      IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='app_server') THEN CREATE ROLE app_server NOLOGIN; END IF;
      IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='realtime_test_server') THEN CREATE ROLE realtime_test_server LOGIN NOINHERIT; END IF;
      IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='supabase_auth_admin') THEN CREATE ROLE supabase_auth_admin NOLOGIN; END IF;
    END $$;
    GRANT app_server TO realtime_test_server WITH INHERIT FALSE, SET TRUE;
    ALTER ROLE realtime_test_server NOINHERIT;
    ALTER ROLE realtime_test_server PASSWORD 'realtime-fixture-only';
    DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE;
    DROP SCHEMA IF EXISTS auth CASCADE;
    DROP TABLE IF EXISTS public.rooms CASCADE;
    CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    ALTER TABLE auth.users OWNER TO supabase_auth_admin;
    CREATE TABLE public.rooms(id uuid PRIMARY KEY, version integer NOT NULL DEFAULT 0, red_ready boolean NOT NULL DEFAULT false, black_ready boolean NOT NULL DEFAULT false, members uuid[] NOT NULL);
    ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.rooms FORCE ROW LEVEL SECURITY;
    CREATE POLICY app_server_room_fixture ON public.rooms TO app_server USING(true) WITH CHECK(true);
    REVOKE ALL ON public.rooms FROM PUBLIC;
    GRANT USAGE ON SCHEMA public TO app_server;
    GRANT SELECT ON public.rooms TO app_server;
    GRANT UPDATE(version,red_ready,black_ready) ON public.rooms TO app_server;
  `);
  await admin.query(
    await readFile("supabase/migrations/20261011000002_realtime.sql", "utf8"),
  );
  const parsed = new URL(realtimeTestUrl!);
  parsed.username = "realtime_test_server";
  parsed.password = "realtime-fixture-only";
  const runtime = new Pool({ connectionString: parsed.toString(), max: 10 });
  const rooms = new FixtureRooms();
  return {
    admin,
    runtime,
    rooms,
    close: async () => {
      await runtime.end();
      await admin.end();
    },
  };
}

export async function addRoom(
  admin: Pool,
  members = [randomUUID(), randomUUID()],
) {
  for (const id of members)
    await admin.query(
      "INSERT INTO auth.users(id) VALUES($1) ON CONFLICT DO NOTHING",
      [id],
    );
  const roomId = randomUUID();
  await admin.query("INSERT INTO public.rooms(id,members) VALUES($1,$2)", [
    roomId,
    members,
  ]);
  const connection = (
    userId = members[0]!,
    tabId = randomUUID(),
  ): RealtimeConnection => ({
    identity: { userId, kind: "member" },
    roomId,
    tabId,
    connectionId: randomUUID(),
  });
  return { roomId, members, connection };
}

export function readyCommand(
  roomId: string,
  version = 0,
  commandId = randomUUID(),
): RoomCommand {
  return {
    roomId,
    commandId,
    expectedVersion: version,
    action: { type: "room.ready", payload: { ready: true } },
  };
}

export class FixtureRooms implements RoomCollaborator {
  failAfterMutation = false;
  async authorize(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ) {
    const { rows } = await client.query(
      "SELECT members FROM public.rooms WHERE id=$1",
      [roomId],
    );
    const members: string[] | undefined = rows[0]?.members;
    const index = members?.indexOf(identity.userId) ?? -1;
    if (index < 0)
      throw new RealtimeError(
        "ROOM_FORBIDDEN",
        "Bạn không có quyền truy cập phòng này",
      );
    return { canControl: index < 2 };
  }
  async snapshot(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): Promise<RoomStateSnapshot> {
    await this.authorize(client, identity, roomId);
    const { rows } = await client.query(
      "SELECT * FROM public.rooms WHERE id=$1",
      [roomId],
    );
    const row = rows[0];
    const members: string[] = row.members;
    return {
      serverNow: new Date().toISOString(),
      roomId,
      version: row.version,
      room: {
        status: "WAITING",
        hostId: members[0]!,
        name: "Synthetic realtime fixture",
        visibility: "CODE_ONLY",
        timeMinutes: 5,
        viewerLimit: 5,
        connected: { red: true, black: true },
        graceUntil: { red: null, black: null },
        countdown: null,
        seats: { red: members[0]!, black: members[1] ?? null },
        ready: { red: row.red_ready, black: row.black_ready },
      },
      match: null,
      clocks: null,
      role:
        members.indexOf(identity.userId) === 0
          ? "red"
          : members.indexOf(identity.userId) === 1
            ? "black"
            : "spectator",
    };
  }
  async execute(
    client: PoolClient,
    identity: RealtimeIdentity,
    command: RoomCommand,
  ): Promise<RoomStateSnapshot | RoomExecutionResult> {
    if (
      !(await this.authorize(client, identity, command.roomId)).canControl ||
      command.action.type !== "room.ready"
    )
      throw new RealtimeError("ROOM_FORBIDDEN", "Thao tác không được phép");
    const snapshot = await this.snapshot(client, identity, command.roomId);
    const column = snapshot.role === "red" ? "red_ready" : "black_ready";
    await client.query(
      `UPDATE public.rooms SET ${column}=$2,version=version+1 WHERE id=$1`,
      [command.roomId, command.action.payload.ready],
    );
    if (this.failAfterMutation) throw new Error("fake-sensitive-fixture");
    return this.snapshot(client, identity, command.roomId);
  }
}
