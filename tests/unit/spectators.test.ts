/**
 * Unit coverage for spectator admission caps and room-lock revocation (F-07).
 *
 * These tests use an injected fake pool: they prove the service decision path
 * (which rows are touched, what is emitted after commit). Real PostgreSQL
 * behavior is covered by the integration lane, not here.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type pg from 'pg';
import {
  MAX_SPECTATORS,
  notifyAccessRevoked,
  onAccessRevoked,
  revokeSpectators,
} from '../../apps/server/src/modules/rooms/spectators.js';
import { patchRoom, requireControlLease, takeoverControl } from '../../apps/server/src/modules/rooms/service.js';
import { onRealtimeEvent } from '../../apps/server/src/realtime/events.js';

const ROOM_ID = '550e8400-e29b-41d4-a716-446655440000';
const OWNER_ID = '11111111-1111-1111-1111-111111111111';
const SPECTATOR_A = '22222222-2222-2222-2222-222222222222';
const SPECTATOR_B = '33333333-3333-3333-3333-333333333333';

interface FakeResult {
  rows: Record<string, unknown>[];
  rowCount: number;
}

interface QueryLog {
  sql: string;
  params: unknown[];
}

class FakePgClient {
  queries: QueryLog[] = [];

  constructor(private readonly handle: (sql: string, params: unknown[]) => FakeResult) {}

  async query(sql: string, params: unknown[] = []): Promise<FakeResult> {
    this.queries.push({ sql, params });
    const trimmed = sql.trim().replace(/\s+/g, ' ');
    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(trimmed)) {
      return { rows: [], rowCount: 0 };
    }
    return this.handle(trimmed, params);
  }

  release(): void {}
}

class FakePgPool {
  constructor(public client: FakePgClient) {}

  async connect(): Promise<unknown> {
    return this.client;
  }

  async end(): Promise<void> {}
}

function asPool(pool: FakePgPool): pg.Pool {
  return pool as unknown as pg.Pool;
}

describe('T016-01: Spectator limits and revocation events', () => {
  it('MAX_SPECTATORS constant equals 5 per product spec', () => {
    expect(MAX_SPECTATORS).toBe(5);
  });

  it('notifyAccessRevoked delivers to registered listeners and unsubscribes', () => {
    const received: { roomId: string; reason: string; roomVersion: number }[] = [];
    const unsubscribe = onAccessRevoked((data) => {
      received.push(data);
    });

    notifyAccessRevoked({ roomId: ROOM_ID, reason: 'ROOM_LOCKED', roomVersion: 2 });
    expect(received).toEqual([{ roomId: ROOM_ID, reason: 'ROOM_LOCKED', roomVersion: 2 }]);

    unsubscribe();
    notifyAccessRevoked({ roomId: ROOM_ID, reason: 'ROOM_LOCKED', roomVersion: 3 });
    expect(received).toHaveLength(1);
  });
});

describe('T016-02: revokeSpectators runs inside the caller transaction', () => {
  it('bumps room_version, deletes spectator rows and returns the affected user ids', async () => {
    let roomVersion = 4;
    const deleted: string[] = [];
    const client = new FakePgClient((sql, params) => {
      if (/^UPDATE public\.rooms SET room_version = room_version \+ 1/.test(sql)) {
        roomVersion += 1;
        expect(params[0]).toBe(ROOM_ID);
        return { rows: [{ room_version: roomVersion }], rowCount: 1 };
      }
      if (/^DELETE FROM public\.room_members/.test(sql)) {
        deleted.push(SPECTATOR_A, SPECTATOR_B);
        return { rows: [{ user_id: SPECTATOR_A }, { user_id: SPECTATOR_B }], rowCount: 2 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await revokeSpectators(
      client as unknown as pg.PoolClient,
      ROOM_ID,
      'ROOM_LOCKED',
    );

    expect(result).toEqual({
      roomId: ROOM_ID,
      reason: 'ROOM_LOCKED',
      revokedUserIds: [SPECTATOR_A, SPECTATOR_B],
      roomVersion: 5,
    });
    expect(deleted).toHaveLength(2);
    // Version bump happens before membership deletion so reader locks observe
    // a single consistent room_version for the revocation.
    expect(client.queries[0]!.sql).toContain('UPDATE public.rooms');
    expect(client.queries[1]!.sql).toContain('DELETE FROM public.room_members');
  });
});

describe('T016-03: locking a room revokes spectators and emits after commit', () => {
  let room: Record<string, unknown>;
  let members: Record<string, unknown>[];
  let client: FakePgClient;
  let pool: FakePgPool;
  let emitted: { event: string; payload: unknown; lastQuery: string }[];
  let notified: { roomId: string; reason: string; roomVersion: number }[];
  let unsubscribeEvent: () => void;
  let unsubscribeNotice: () => void;

  beforeEach(() => {
    roomVersionReset();
    emitted = [];
    notified = [];
    unsubscribeEvent = onRealtimeEvent({
      publish: (event, payload) => {
        emitted.push({
          event,
          payload,
          lastQuery: client.queries[client.queries.length - 1]?.sql.trim() ?? '',
        });
      },
    });
    unsubscribeNotice = onAccessRevoked((notice) => {
      notified.push(notice);
    });
  });

  afterEach(() => {
    unsubscribeEvent();
    unsubscribeNotice();
  });

  function roomVersionReset(): void {
    room = {
      id: ROOM_ID,
      name: 'Phòng thử',
      owner_id: OWNER_ID,
      visibility: 'PUBLIC',
      status: 'WAITING',
      room_version: 4,
      time_control: 0,
      current_match_id: null,
    };
    members = [
      { room_id: ROOM_ID, user_id: OWNER_ID, role: 'PLAYER', side: 'RED', ready: false },
      { room_id: ROOM_ID, user_id: SPECTATOR_A, role: 'SPECTATOR', side: null, ready: false },
      { room_id: ROOM_ID, user_id: SPECTATOR_B, role: 'SPECTATOR', side: null, ready: false },
    ];

    client = new FakePgClient((sql, params) => {
      if (/^SELECT \* FROM public\.rooms WHERE id = \$1 FOR UPDATE/.test(sql)) {
        return { rows: [room], rowCount: 1 };
      }
      if (/^SELECT \* FROM public\.rooms WHERE id = \$1$/.test(sql)) {
        return { rows: [room], rowCount: 1 };
      }
      if (/^SELECT status FROM public\.rooms WHERE id = \$1 FOR UPDATE/.test(sql)) {
        return { rows: [{ status: room['status'] }], rowCount: 1 };
      }
      if (/^UPDATE public\.rooms SET room_version = room_version \+ 1/.test(sql)) {
        room['room_version'] = (room['room_version'] as number) + 1;
        return { rows: [{ room_version: room['room_version'] }], rowCount: 1 };
      }
      if (/^DELETE FROM public\.room_members WHERE room_id = \$1 AND role = 'SPECTATOR'/.test(sql)) {
        const removed = members.filter((m) => m['role'] === 'SPECTATOR');
        members = members.filter((m) => m['role'] !== 'SPECTATOR');
        return { rows: removed.map((m) => ({ user_id: m['user_id'] })), rowCount: removed.length };
      }
      if (/^UPDATE public\.invitations SET status = 'REVOKED'/.test(sql)) {
        return { rows: [], rowCount: 0 };
      }
      if (/^UPDATE public\.rooms SET name = \$1/.test(sql)) {
        room['name'] = params[0];
        room['visibility'] = params[1];
        return { rows: [], rowCount: 1 };
      }
      if (/^SELECT role FROM public\.room_members WHERE room_id = \$1 AND user_id = \$2/.test(sql)) {
        const found = members.find((m) => m['room_id'] === params[0] && m['user_id'] === params[1]);
        return found ? { rows: [{ role: found['role'] }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }
      if (/^SELECT user_id, role, side, ready FROM public\.room_members WHERE room_id = \$1/.test(sql)) {
        return { rows: members.filter((m) => m['room_id'] === params[0]), rowCount: members.length };
      }
      return { rows: [], rowCount: 0 };
    });
    pool = new FakePgPool(client);
  }

  it('PUBLIC -> LOCKED deletes spectator memberships and emits access:revoked after COMMIT', async () => {
    const updated = await patchRoom(ROOM_ID, OWNER_ID, { visibility: 'LOCKED' }, asPool(pool));

    expect(updated.visibility).toBe('LOCKED');
    expect(updated.roomVersion).toBe(5);
    expect(members.filter((m) => m['role'] === 'SPECTATOR')).toHaveLength(0);

    const revocation = emitted.find((e) => e.event === 'access:revoked');
    expect(revocation).toBeDefined();
    expect(revocation!.payload).toEqual({
      roomId: ROOM_ID,
      reason: 'ROOM_LOCKED',
      roomVersion: 5,
      userIds: [SPECTATOR_A, SPECTATOR_B],
    });
    // Emit must never happen inside the transaction.
    expect(revocation!.lastQuery).toBe('COMMIT');

    // In-process hook (media generation rotation) sees the same revocation.
    expect(notified).toEqual([{ roomId: ROOM_ID, reason: 'ROOM_LOCKED', roomVersion: 5 }]);
    expect(client.queries.some((q) => q.sql.includes('DELETE FROM public.room_members'))).toBe(true);
  });

  it('a rename keeps spectators, pushes the room DTO and revokes nothing', async () => {
    const updated = await patchRoom(ROOM_ID, OWNER_ID, { name: 'Tên mới' }, asPool(pool));

    expect(updated.name).toBe('Tên mới');
    expect(members.filter((m) => m['role'] === 'SPECTATOR')).toHaveLength(2);
    // Push-only clients need the room DTO; nothing else may be emitted for a rename.
    expect(emitted.map((e) => e.event)).toEqual(['room:updated']);
    const pushed = emitted[0]!.payload as { roomId: string; room: { name: string } };
    expect(pushed.roomId).toBe(ROOM_ID);
    expect(pushed.room.name).toBe('Tên mới');
    expect(emitted[0]!.lastQuery).toBe('COMMIT');
    expect(notified).toHaveLength(0);
    expect(client.queries.some((q) => q.sql.includes('DELETE FROM public.room_members'))).toBe(false);
  });
});

const MATCH_ID = '77777777-7777-7777-7777-777777777777';
const TAB_ID = '88888888-8888-8888-8888-888888888888';
const SESSION_ID = '99999999-9999-9999-9999-999999999999';
const CONTROLLER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

describe('T013-01: control lease persists against the real client_controls DDL', () => {
  it('inserts every NOT NULL column (regression: the old tab_id column raised 23502)', async () => {
    let hadController = false;
    const client = new FakePgClient((sql, params) => {
      if (/^SELECT rm\.room_id, r\.current_match_id, r\.status FROM public\.room_members rm/.test(sql)) {
        return {
          rows: [{ room_id: ROOM_ID, current_match_id: MATCH_ID, status: 'PLAYING' }],
          rowCount: 1,
        };
      }
      if (/^SELECT controller_id FROM public\.client_controls WHERE user_id = \$1 FOR UPDATE/.test(sql)) {
        return hadController
          ? { rows: [{ controller_id: CONTROLLER_ID }], rowCount: 1 }
          : { rows: [], rowCount: 0 };
      }
      if (/^INSERT INTO public\.client_controls/.test(sql)) {
        return {
          rows: [
            {
              controller_id: params[3],
              control_epoch: hadController ? 2 : 1,
              room_id: params[1],
              match_id: params[2],
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const pool = asPool(new FakePgPool(client));

    const first = await takeoverControl(OWNER_ID, TAB_ID, SESSION_ID, pool);
    expect(first.controlEpoch).toBe(1);

    const insert = client.queries.find((q) => q.sql.startsWith('INSERT INTO public.client_controls'));
    expect(insert).toBeDefined();
    const columnList = insert!.sql.slice(insert!.sql.indexOf('(') + 1, insert!.sql.indexOf(')'));
    const columns = columnList.split(',').map((column) => column.trim());
    expect(columns).toEqual([
      'user_id',
      'room_id',
      'match_id',
      'controller_id',
      'controller_tab_id',
      'session_id',
      'control_epoch',
      'lease_until',
      'disconnected_at',
      'updated_at',
    ]);
    expect(columns).not.toContain('tab_id');
    expect(insert!.sql).toContain("interval '30 seconds'");
    expect(insert!.params[1]).toBe(ROOM_ID);
    expect(insert!.params[2]).toBe(MATCH_ID);
    expect(insert!.params[4]).toBe(TAB_ID);
    expect(insert!.params[5]).toBe(SESSION_ID);

    // First takeover has no previous controller to revoke.
    hadController = true;
    const events: string[] = [];
    const unsubscribe = onRealtimeEvent({
      publish: (event) => {
        events.push(event);
      },
    });
    const second = await takeoverControl(OWNER_ID, TAB_ID, SESSION_ID, pool);
    expect(second.controlEpoch).toBe(2);
    expect(events).toEqual(['control:revoked']);
    unsubscribe();
  });

  it('derives an AI match context when the user has no room membership', async () => {
    const client = new FakePgClient((sql) => {
      if (/^SELECT rm\.room_id, r\.current_match_id, r\.status FROM public\.room_members rm/.test(sql)) {
        return { rows: [], rowCount: 0 };
      }
      if (/^SELECT id FROM public\.matches/.test(sql)) {
        return { rows: [{ id: MATCH_ID }], rowCount: 1 };
      }
      if (/^SELECT controller_id FROM public\.client_controls WHERE user_id = \$1 FOR UPDATE/.test(sql)) {
        return { rows: [], rowCount: 0 };
      }
      if (/^INSERT INTO public\.client_controls/.test(sql)) {
        return {
          rows: [{ controller_id: 'b', control_epoch: 1, room_id: null, match_id: MATCH_ID }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const pool = asPool(new FakePgPool(client));

    await takeoverControl(OWNER_ID, TAB_ID, SESSION_ID, pool);

    const insert = client.queries.find((q) => q.sql.startsWith('INSERT INTO public.client_controls'));
    expect(insert!.params[1]).toBeNull();
    expect(insert!.params[2]).toBe(MATCH_ID);
  });

  it('rejects a user with no room and no active match context', async () => {
    const client = new FakePgClient(() => ({ rows: [], rowCount: 0 }));
    const pool = asPool(new FakePgPool(client));

    await expect(takeoverControl(OWNER_ID, TAB_ID, SESSION_ID, pool)).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    });
  });
});

describe('T013-02: requireControlLease guard', () => {
  const leaseRow = {
    controller_id: CONTROLLER_ID,
    control_epoch: 3,
    room_id: ROOM_ID,
    match_id: MATCH_ID,
    lease_live: true,
  };

  function guardPool(rows: Record<string, unknown>[]): { pool: pg.Pool; client: FakePgClient } {
    const client = new FakePgClient((sql) => {
      if (/^SELECT controller_id, control_epoch, room_id, match_id/.test(sql)) {
        return { rows, rowCount: rows.length };
      }
      return { rows: [], rowCount: 0 };
    });
    return { pool: asPool(new FakePgPool(client)), client };
  }

  it('rejects missing headers before touching the DB', async () => {
    const { pool, client } = guardPool([leaseRow]);

    await expect(requireControlLease(OWNER_ID, undefined, 3, {}, pool)).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONTROL_REQUIRED',
    });
    await expect(requireControlLease(OWNER_ID, CONTROLLER_ID, undefined, {}, pool)).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONTROL_REQUIRED',
    });
    await expect(requireControlLease(OWNER_ID, CONTROLLER_ID, 'abc', {}, pool)).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONTROL_REQUIRED',
    });
    expect(client.queries).toHaveLength(0);
  });

  it('rejects a stale epoch and a different controller id', async () => {
    const { pool } = guardPool([leaseRow]);

    await expect(requireControlLease(OWNER_ID, CONTROLLER_ID, 2, {}, pool)).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONTROL_REQUIRED',
    });
    await expect(
      requireControlLease(OWNER_ID, 'ffffffff-ffff-ffff-ffff-ffffffffffff', 3, {}, pool),
    ).rejects.toMatchObject({ statusCode: 403, code: 'CONTROL_REQUIRED' });
  });

  it('rejects when no lease row exists', async () => {
    const { pool } = guardPool([]);

    await expect(requireControlLease(OWNER_ID, CONTROLLER_ID, 3, {}, pool)).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONTROL_REQUIRED',
    });
  });

  it('rejects a lease that expired without a heartbeat', async () => {
    const { pool } = guardPool([{ ...leaseRow, lease_live: false }]);

    await expect(
      requireControlLease(OWNER_ID, CONTROLLER_ID, 3, { roomId: ROOM_ID }, pool),
    ).rejects.toMatchObject({ statusCode: 403, code: 'CONTROL_REQUIRED' });
  });

  it('accepts a matching lease and enforces the room/match context', async () => {
    const { pool } = guardPool([leaseRow]);

    await expect(
      requireControlLease(OWNER_ID, CONTROLLER_ID, '3', { roomId: ROOM_ID }, pool),
    ).resolves.toEqual({ controllerId: CONTROLLER_ID, controlEpoch: 3 });
    await expect(
      requireControlLease(OWNER_ID, CONTROLLER_ID, 3, { matchId: MATCH_ID }, pool),
    ).resolves.toEqual({ controllerId: CONTROLLER_ID, controlEpoch: 3 });
    await expect(
      requireControlLease(
        OWNER_ID,
        CONTROLLER_ID,
        3,
        { roomId: 'ffffffff-ffff-ffff-ffff-ffffffffffff' },
        pool,
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: 'CONTROL_REQUIRED' });
  });
});
