/**
 * T025 — media policy contracts, rotation planning and route guards (fast unit lane).
 *
 * The DB-backed authority cases (persistence, optimistic concurrency, APPLYING on
 * SFU failure, generation rotation) live in `tests/media/spike.ts`, where a real
 * Postgres and a real SFU are required. This file stays dependency-free so the
 * unit lane cannot claim SFU/DB proof it did not run.
 */
import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import {
  CreateMediaSessionBodySchema,
  EndMediaBodySchema,
  UpdateMediaPolicyBodySchema,
  type SourcePolicy,
} from '@xiangqi/contracts';
import { planRotationTargets, createRoomName, TRANSPORT_TUPLES } from '../../apps/server/src/modules/media/reconciler.js';

describe('T025-01: media request schemas', () => {
  it('accepts a valid policy patch with the expected version', () => {
    const res = UpdateMediaPolicyBodySchema.safeParse({
      matchId: '550e8400-e29b-41d4-a716-446655440000',
      kind: 'CAMERA',
      audience: 'OPPONENT_AND_SPECTATORS',
      policyVersion: 3,
    });
    expect(res.success).toBe(true);
  });

  it('rejects the retired PUBLIC scope name', () => {
    const res = UpdateMediaPolicyBodySchema.safeParse({
      matchId: '550e8400-e29b-41d4-a716-446655440000',
      kind: 'CAMERA',
      audience: 'PUBLIC',
      policyVersion: 0,
    });
    expect(res.success).toBe(false);
  });

  it('rejects a lowercase track kind and unknown privilege fields', () => {
    expect(
      UpdateMediaPolicyBodySchema.safeParse({
        matchId: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'camera',
        audience: 'OFF',
        policyVersion: 0,
      }).success,
    ).toBe(false);

    // A client may not smuggle role/identity/grants into the payload.
    expect(
      UpdateMediaPolicyBodySchema.safeParse({
        matchId: '550e8400-e29b-41d4-a716-446655440000',
        kind: 'CAMERA',
        audience: 'OFF',
        policyVersion: 0,
        userId: '11111111-1111-4111-8111-111111111111',
      }).success,
    ).toBe(false);

    expect(
      CreateMediaSessionBodySchema.safeParse({
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        matchId: '550e8400-e29b-41d4-a716-446655440001',
        controllerId: '550e8400-e29b-41d4-a716-446655440002',
        grants: [],
      }).success,
    ).toBe(false);

    expect(EndMediaBodySchema.safeParse({ matchId: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('T025-02: media routes require authentication', () => {
  it('rejects unauthenticated reads and writes before touching the DB', async () => {
    const app = await createApp();
    const matchId = '550e8400-e29b-41d4-a716-446655440000';

    const calls = [
      { method: 'POST' as const, url: '/api/v1/media/session', payload: {} },
      { method: 'GET' as const, url: `/api/v1/media/policy?matchId=${matchId}` },
      { method: 'PATCH' as const, url: '/api/v1/media/policy', payload: {} },
      { method: 'POST' as const, url: '/api/v1/media/end', payload: { matchId } },
    ];

    for (const call of calls) {
      const res = await app.inject(call);
      expect(res.statusCode).toBe(401);
      expect(res.json().error.code).toBe('UNAUTHENTICATED');
    }

    await app.close();
  });
});

describe('T025-03: rotation planning follows spec 06 narrowing rules', () => {
  const applied = (camera: SourcePolicy['camera'], microphone: SourcePolicy['microphone']): SourcePolicy => ({
    camera,
    microphone,
  });

  it('rotates the private room when a source is turned off', () => {
    expect(planRotationTargets(applied('OPPONENT_ONLY', 'OFF'), 'CAMERA', 'OFF')).toEqual([
      { kind: 'CAMERA', audience: 'PRIVATE' },
    ]);
  });

  it('rotates the watch room when a public source narrows', () => {
    expect(planRotationTargets(applied('OPPONENT_AND_SPECTATORS', 'OFF'), 'CAMERA', 'OPPONENT_ONLY')).toEqual([
      { kind: 'CAMERA', audience: 'WATCH' },
    ]);
  });

  it('rotates both rooms when a public source is turned off', () => {
    expect(planRotationTargets(applied('OPPONENT_AND_SPECTATORS', 'OFF'), 'CAMERA', 'OFF')).toEqual([
      { kind: 'CAMERA', audience: 'PRIVATE' },
      { kind: 'CAMERA', audience: 'WATCH' },
    ]);
  });

  it('needs no rotation when a source widens or stays off', () => {
    expect(planRotationTargets(applied('OFF', 'OFF'), 'MICROPHONE', 'OPPONENT_ONLY')).toEqual([]);
    expect(planRotationTargets(applied('OFF', 'OPPONENT_ONLY'), 'CAMERA', 'OPPONENT_AND_SPECTATORS')).toEqual([]);
    expect(planRotationTargets(applied('OPPONENT_ONLY', 'OFF'), 'MICROPHONE', 'OFF')).toEqual([]);
  });
});

describe('T025-04: transport room names are opaque and never reused', () => {
  it('embeds a fresh 128-bit nonce per name', () => {
    const first = createRoomName('match-1', 'CAMERA', 'WATCH');
    const second = createRoomName('match-1', 'CAMERA', 'WATCH');
    expect(first).not.toBe(second);
    expect(first).toMatch(/-[0-9a-f]{32}$/);
    expect(second).toMatch(/-[0-9a-f]{32}$/);
  });

  it('owns exactly four independent tuples per match', () => {
    const keys = TRANSPORT_TUPLES.map((tuple) => `${tuple.kind}:${tuple.audience}`).sort();
    expect(keys).toEqual(['CAMERA:PRIVATE', 'CAMERA:WATCH', 'MICROPHONE:PRIVATE', 'MICROPHONE:WATCH']);
  });
});
