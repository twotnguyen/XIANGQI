import { describe, it, expect } from 'vitest';
import type pg from 'pg';
import { createApp } from '../../apps/server/src/app.js';
import {
  generateCode,
  generateToken,
  hashCode,
  joinRoom,
} from '../../apps/server/src/modules/invitations/service.js';
import { JoinRoomBodySchema } from '@xiangqi/contracts';

const ROOM_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_USER = '44444444-4444-4444-4444-444444444444';
const OWNER_ID = '11111111-1111-1111-1111-111111111111';

interface FakeResult {
  rows: Record<string, unknown>[];
  rowCount: number;
}

interface RoomRow {
  id: string;
  name: string;
  owner_id: string;
  visibility: string;
  status: string;
  room_version: number;
  watch_epoch: number;
  time_control: number;
  current_match_id: string | null;
}

/** Live `public.invitations` shape (spec 09 §5.4): hashes are 32-byte HMAC digests. */
interface InvitationRow {
  id: string;
  room_id: string;
  role: 'PLAY' | 'WATCH';
  status: string;
  epoch: number;
  expires_at: string;
  code_hash: Buffer | null;
  token_hash: Buffer | null;
}

interface MemberRow {
  room_id: string;
  user_id: string;
  role: string;
  side: string | null;
  ready: boolean;
}

interface JoinState {
  rooms: RoomRow[];
  invitations: InvitationRow[];
  members: MemberRow[];
  activePlayers: { user_id: string; room_id: string }[];
  inserts: string[];
}

/** Minimal stateful pg fake: enough to exercise joinRoom's decision path. */
class FakePgClient {
  queries: { sql: string; params: unknown[] }[] = [];

  constructor(private readonly state: JoinState) {}

  async query(sql: string, params: unknown[] = []): Promise<FakeResult> {
    const trimmed = sql.trim().replace(/\s+/g, ' ');
    this.queries.push({ sql: trimmed, params });
    const s = this.state;

    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(trimmed)) return { rows: [], rowCount: 0 };

    if (/^SELECT id, room_id, role FROM public\.invitations WHERE code_hash = \$1/.test(trimmed)) {
      const hash = params[0] as Buffer;
      const found = s.invitations.find(
        (inv) =>
          inv.code_hash !== null &&
          inv.code_hash.equals(hash) &&
          inv.status === 'ACTIVE' &&
          new Date(inv.expires_at) > new Date(),
      );
      return found ? { rows: [found], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT id, room_id, role FROM public\.invitations WHERE token_hash = \$1/.test(trimmed)) {
      const hash = params[0] as Buffer;
      const found = s.invitations.find(
        (inv) =>
          inv.token_hash !== null &&
          inv.token_hash.equals(hash) &&
          inv.status === 'ACTIVE' &&
          new Date(inv.expires_at) > new Date(),
      );
      return found ? { rows: [found], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT \* FROM public\.rooms WHERE id = \$1 FOR UPDATE/.test(trimmed)) {
      const found = s.rooms.find((room) => room.id === params[0]);
      return found ? { rows: [found], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT id, status, role, expires_at FROM public\.invitations WHERE id = \$1 FOR UPDATE/.test(trimmed)) {
      const found = s.invitations.find((inv) => inv.id === params[0]);
      return found ? { rows: [found], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT role FROM public\.room_members WHERE room_id = \$1 AND user_id = \$2/.test(trimmed)) {
      const found = s.members.find((m) => m.room_id === params[0] && m.user_id === params[1]);
      return found ? { rows: [{ role: found.role }], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT room_id FROM public\.active_players WHERE user_id = \$1/.test(trimmed)) {
      const found = s.activePlayers.filter((a) => a.user_id === params[0]);
      return { rows: found, rowCount: found.length };
    }
    if (/^SELECT side FROM public\.room_members WHERE room_id = \$1 AND role = 'PLAYER'/.test(trimmed)) {
      const players = s.members.filter((m) => m.room_id === params[0] && m.role === 'PLAYER');
      return { rows: players.map((m) => ({ side: m.side })), rowCount: players.length };
    }
    if (/^SELECT count\(\*\) FROM public\.room_members WHERE room_id = \$1 AND role = 'SPECTATOR'/.test(trimmed)) {
      const count = s.members.filter((m) => m.room_id === params[0] && m.role === 'SPECTATOR').length;
      return { rows: [{ count }], rowCount: 1 };
    }
    if (/^INSERT INTO public\.room_members/.test(trimmed)) {
      s.inserts.push('room_members');
      const spectator = trimmed.includes("'SPECTATOR'");
      s.members.push({
        room_id: params[0] as string,
        user_id: params[1] as string,
        role: spectator ? 'SPECTATOR' : 'PLAYER',
        // Spectator params are [room, user, admission_epoch] → no side.
        side: spectator ? null : ((params[2] as string | undefined) ?? null),
        ready: false,
      });
      return { rows: [], rowCount: 1 };
    }
    if (/^INSERT INTO public\.active_players/.test(trimmed)) {
      s.inserts.push('active_players');
      s.activePlayers.push({ user_id: params[0] as string, room_id: params[1] as string });
      return { rows: [], rowCount: 1 };
    }
    if (/^UPDATE public\.invitations SET status = 'CONSUMED'/.test(trimmed)) {
      s.inserts.push('invitation_consumed');
      const found = s.invitations.find((inv) => inv.id === params[0]);
      if (found) found.status = 'CONSUMED';
      return { rows: [], rowCount: found ? 1 : 0 };
    }
    if (/^SELECT \* FROM public\.rooms WHERE id = \$1$/.test(trimmed)) {
      const found = s.rooms.find((room) => room.id === params[0]);
      return found ? { rows: [found], rowCount: 1 } : { rows: [], rowCount: 0 };
    }
    if (/^SELECT user_id, role, side, ready FROM public\.room_members WHERE room_id = \$1$/.test(trimmed)) {
      const found = s.members.filter((m) => m.room_id === params[0]);
      return { rows: found, rowCount: found.length };
    }
    return { rows: [], rowCount: 0 };
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

function makeState(visibility: string, role: 'PLAYER' | 'SPECTATOR' | null): JoinState {
  const state: JoinState = {
    rooms: [
      {
        id: ROOM_ID,
        name: 'Phòng thử',
        owner_id: OWNER_ID,
        visibility,
        status: 'WAITING',
        room_version: 3,
        watch_epoch: 0,
        time_control: 0,
        current_match_id: null,
      },
    ],
    invitations: [],
    members: [
      { room_id: ROOM_ID, user_id: OWNER_ID, role: 'PLAYER', side: 'RED', ready: false },
    ],
    activePlayers: [],
    inserts: [],
  };
  if (role) {
    // The fake needs the real digest to answer `WHERE code_hash = $1`; the join
    // passes the code, so mirror what the service would hash.
    state.invitations.push({
      id: '99999999-9999-9999-9999-999999999999',
      room_id: ROOM_ID,
      role: role === 'PLAYER' ? 'PLAY' : 'WATCH',
      status: 'ACTIVE',
      epoch: 0,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      code_hash: hashCode('ABCD2345'),
      token_hash: null,
    });
  }
  return state;
}

function poolFor(state: JoinState): pg.Pool {
  return new FakePgPool(new FakePgClient(state)) as unknown as pg.Pool;
}

describe('T011-01: Invitations helpers and generators', () => {
  it('generateCode produces 8-char string from unambiguous alphabet', () => {
    const code = generateCode();
    expect(code).toHaveLength(8);
    // Unambiguous alphabet: no 0, O, 1, I
    expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  });

  it('generateToken produces a 64-char hex token and a 32-byte digest', () => {
    const { token, tokenHash } = generateToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenHash).toHaveLength(32);
    expect(tokenHash.equals(Buffer.from(token))).toBe(false);
  });
});

describe('T011-02: JoinRoomBodySchema validation', () => {
  it('rejects payload with 0 locators', () => {
    const res = JoinRoomBodySchema.safeParse({ role: 'SPECTATOR' });
    expect(res.success).toBe(false);
  });

  it('rejects payload with 2 locators (both roomId and code)', () => {
    const res = JoinRoomBodySchema.safeParse({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      code: 'ABCD2345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(false);
  });

  it('accepts payload with exactly 1 locator (roomId)', () => {
    const res = JoinRoomBodySchema.safeParse({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      role: 'PLAYER',
    });
    expect(res.success).toBe(true);
  });

  it('accepts payload with exactly 1 locator (code)', () => {
    const res = JoinRoomBodySchema.safeParse({
      code: 'ABCD2345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(true);
  });

  it('accepts payload with exactly 1 locator (token)', () => {
    const res = JoinRoomBodySchema.safeParse({
      token: 'sampletokenhex12345',
      role: 'SPECTATOR',
    });
    expect(res.success).toBe(true);
  });
});

describe('T011-03: Invitations endpoints auth check', () => {
  it('POST /api/v1/rooms/:id/invitations requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/550e8400-e29b-41d4-a716-446655440000/invitations',
      payload: {},
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('GET /api/v1/invitations requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/invitations',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/rooms/join requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/rooms/join',
      payload: { role: 'SPECTATOR', code: 'ABCD2345' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});

describe('T011-04: joinRoom enforces room visibility (F-03)', () => {
  it('rejects a roomId join into a LOCKED room with 403 INVITE_INVALID', async () => {
    const state = makeState('LOCKED', null);

    await expect(
      joinRoom(OTHER_USER, { roomId: ROOM_ID }, 'SPECTATOR', poolFor(state)),
    ).rejects.toMatchObject({ statusCode: 403, code: 'INVITE_INVALID' });
    expect(state.inserts).toEqual([]);
  });

  it('rejects a roomId join into a CODE_ONLY room with 403 INVITE_INVALID', async () => {
    const state = makeState('CODE_ONLY', null);

    await expect(
      joinRoom(OTHER_USER, { roomId: ROOM_ID }, 'PLAYER', poolFor(state)),
    ).rejects.toMatchObject({ statusCode: 403, code: 'INVITE_INVALID' });
    expect(state.inserts).toEqual([]);
  });

  it('allows a roomId join into a PUBLIC room as SPECTATOR', async () => {
    const state = makeState('PUBLIC', null);

    const room = await joinRoom(OTHER_USER, { roomId: ROOM_ID }, 'SPECTATOR', poolFor(state));

    expect(room.id).toBe(ROOM_ID);
    expect(state.members).toEqual([
      { room_id: ROOM_ID, user_id: OWNER_ID, role: 'PLAYER', side: 'RED', ready: false },
      { room_id: ROOM_ID, user_id: OTHER_USER, role: 'SPECTATOR', side: null, ready: false },
    ]);
  });

  it('allows a roomId join into a PUBLIC room as PLAYER and claims the free side', async () => {
    const state = makeState('PUBLIC', null);

    const room = await joinRoom(OTHER_USER, { roomId: ROOM_ID }, 'PLAYER', poolFor(state));

    expect(room.id).toBe(ROOM_ID);
    expect(state.members).toEqual([
      { room_id: ROOM_ID, user_id: OWNER_ID, role: 'PLAYER', side: 'RED', ready: false },
      { room_id: ROOM_ID, user_id: OTHER_USER, role: 'PLAYER', side: 'BLACK', ready: false },
    ]);
    expect(state.activePlayers).toEqual([{ user_id: OTHER_USER, room_id: ROOM_ID }]);
  });

  it('enforces the 5-spectator cap inside the room lock', async () => {
    const state = makeState('PUBLIC', 'SPECTATOR');
    for (let i = 0; i < 5; i++) {
      state.members.push({
        room_id: ROOM_ID,
        user_id: `55555555-5555-5555-5555-55555555555${i}`,
        role: 'SPECTATOR',
        side: null,
        ready: false,
      });
    }

    await expect(
      joinRoom(OTHER_USER, { code: 'ABCD2345' }, 'SPECTATOR', poolFor(state)),
    ).rejects.toMatchObject({ statusCode: 409, code: 'ROOM_FULL' });
    expect(state.inserts).toEqual([]);
  });
});

describe('T011-05: joinRoom role must match the code grant', () => {
  it('rejects a WATCH code used with role PLAYER', async () => {
    const state = makeState('CODE_ONLY', 'SPECTATOR');

    await expect(
      joinRoom(OTHER_USER, { code: 'ABCD2345' }, 'PLAYER', poolFor(state)),
    ).rejects.toMatchObject({ statusCode: 403, code: 'INVITE_INVALID' });
    expect(state.inserts).toEqual([]);
  });

  it('accepts a PLAY code used with role PLAYER and consumes it', async () => {
    const state = makeState('CODE_ONLY', 'PLAYER');

    const room = await joinRoom(OTHER_USER, { code: 'ABCD2345' }, 'PLAYER', poolFor(state));

    expect(room.id).toBe(ROOM_ID);
    expect(state.inserts).toContain('invitation_consumed');
    expect(state.invitations[0]!.status).toBe('CONSUMED');
  });

  it('locks the room before the invitation row (spec 09 lock order)', async () => {
    const state = makeState('CODE_ONLY', 'SPECTATOR');
    const client = new FakePgClient(state);
    const pool = new FakePgPool(client) as unknown as pg.Pool;

    await joinRoom(OTHER_USER, { code: 'ABCD2345' }, 'SPECTATOR', pool);

    const roomLockIndex = client.queries.findIndex((q) => q.sql.includes('public.rooms WHERE id = $1 FOR UPDATE'));
    const invitationLockIndex = client.queries.findIndex((q) =>
      q.sql.includes('public.invitations WHERE id = $1 FOR UPDATE'),
    );
    expect(roomLockIndex).toBeGreaterThanOrEqual(0);
    expect(invitationLockIndex).toBeGreaterThan(roomLockIndex);
  });
});
