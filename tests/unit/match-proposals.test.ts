import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import { rebuildActiveBranch } from '../../apps/server/src/modules/matches/undo.js';
import { createInitialPosition, applyMove } from '@xiangqi/game-rules';

describe('T014-01: Move ancestry and undo replay', () => {
  it('rebuildActiveBranch with targetPly=0 returns initial position', () => {
    const initial = createInitialPosition();
    const result = rebuildActiveBranch(
      [
        {
          id: 'move-1',
          moveNumber: 1,
          playerId: 'user-red',
          side: 'RED',
          fromX: 0,
          fromY: 3,
          toX: 0,
          toY: 4,
        },
      ],
      0, // target ply = 0
    );

    expect(result.position.turn).toBe('RED');
    expect(result.activeMoveIds).toHaveLength(0);
    expect(result.lastMove).toBeNull();
    // Same board as initial
    expect(JSON.stringify(result.position.board)).toBe(JSON.stringify(initial.board));
  });

  it('rebuildActiveBranch replays moves in order up to targetPly', () => {
    const initial = createInitialPosition();
    // Simulate 2 moves
    const move1 = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
    const pos1 = applyMove(initial, move1);
    const move2 = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } };
    const pos2 = applyMove(pos1, move2);

    const moves = [
      {
        id: 'm1',
        moveNumber: 1,
        playerId: 'u1',
        side: 'RED' as const,
        fromX: 0,
        fromY: 3,
        toX: 0,
        toY: 4,
      },
      {
        id: 'm2',
        moveNumber: 2,
        playerId: 'u2',
        side: 'BLACK' as const,
        fromX: 0,
        fromY: 6,
        toX: 0,
        toY: 5,
      },
    ];

    // Replay to ply 1 (only move 1)
    const ply1 = rebuildActiveBranch(moves, 1);
    expect(ply1.position.turn).toBe('BLACK');
    expect(ply1.activeMoveIds).toEqual(['m1']);
    expect(JSON.stringify(ply1.position.board)).toBe(JSON.stringify(pos1.board));

    // Replay to ply 2 (both moves)
    const ply2 = rebuildActiveBranch(moves, 2);
    expect(ply2.position.turn).toBe('RED');
    expect(ply2.activeMoveIds).toEqual(['m1', 'm2']);
    expect(JSON.stringify(ply2.position.board)).toBe(JSON.stringify(pos2.board));
  });
});

describe('T014-02: Proposal endpoints authentication', () => {
  it('POST /api/v1/matches/:id/commands/propose requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/propose',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: { kind: 'DRAW' },
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/matches/:id/commands/respond requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/respond',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: {
          proposalId: '550e8400-e29b-41d4-a716-446655440002',
          accept: true,
        },
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/matches/:id/commands/undo-ai requires auth', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/matches/550e8400-e29b-41d4-a716-446655440000/commands/undo-ai',
      payload: {
        commandId: '550e8400-e29b-41d4-a716-446655440001',
        expectedVersion: 0,
        payload: {},
      },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });
});
