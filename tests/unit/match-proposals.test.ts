import { describe, it, expect } from 'vitest';
import { createApp } from '../../apps/server/src/app.js';
import {
  orderAncestry,
  parseActiveMoveIds,
  rebuildActiveBranch,
  rebuildEffectiveBranch,
  rebuildFromAncestry,
  type AncestryMove,
} from '../../apps/server/src/modules/matches/undo.js';
import { createInitialPosition, applyMove, positionKey } from '@xiangqi/game-rules';
import type { Move } from '@xiangqi/contracts';

const RED_HORSE_OUT: Move = { from: { x: 1, y: 0 }, to: { x: 2, y: 2 } };
const RED_HORSE_BACK: Move = { from: { x: 2, y: 2 }, to: { x: 1, y: 0 } };
const BLACK_HORSE_OUT: Move = { from: { x: 1, y: 9 }, to: { x: 2, y: 7 } };
const BLACK_HORSE_BACK: Move = { from: { x: 2, y: 7 }, to: { x: 1, y: 9 } };

/** Four plies that return to the start: ply 1 == ply 3, ply 0 == ply 4. */
const REPEAT_CYCLE: Move[] = [
  RED_HORSE_OUT,
  BLACK_HORSE_OUT,
  RED_HORSE_BACK,
  BLACK_HORSE_BACK,
];

function keyAfter(moves: Move[], count: number): string {
  let position = createInitialPosition();
  for (const move of moves.slice(0, count)) position = applyMove(position, move);
  return positionKey(position);
}

/** Build chain rows (parent = previous row) with RED/BLACK alternating. */
function chain(ids: string[], moves: Move[]): AncestryMove[] {
  return moves.map((move, index) => ({
    id: ids[index]!,
    parentMoveId: index === 0 ? null : ids[index - 1]!,
    eventVersion: index + 1,
    side: index % 2 === 0 ? 'RED' : 'BLACK',
    move,
  }));
}

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
    // Repetition cache starts at the initial position only
    expect(result.repetitionCounts[positionKey(initial)]).toBe(1);
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
    expect(ply1.repetitionCounts[positionKey(pos1)]).toBe(1);

    // Replay to ply 2 (both moves)
    const ply2 = rebuildActiveBranch(moves, 2);
    expect(ply2.position.turn).toBe('RED');
    expect(ply2.activeMoveIds).toEqual(['m1', 'm2']);
    expect(JSON.stringify(ply2.position.board)).toBe(JSON.stringify(pos2.board));
  });
});

describe('T014-03: effective branch ancestry (undo must not leak abandoned plies)', () => {
  it('rebuildFromAncestry counts the initial position and every repeated position', () => {
    const rebuilt = rebuildFromAncestry(chain(['m1', 'm2', 'm3', 'm4'], REPEAT_CYCLE));

    expect(rebuilt.activeMoveIds).toEqual(['m1', 'm2', 'm3', 'm4']);
    expect(rebuilt.lastMove).toEqual(BLACK_HORSE_BACK);
    // ply 0 and ply 4 are the same position
    expect(rebuilt.repetitionCounts[positionKey(createInitialPosition())]).toBe(2);
    // ply 1 is unique on this branch
    expect(rebuilt.repetitionCounts[keyAfter(REPEAT_CYCLE, 1)]).toBe(1);
    expect(rebuilt.repetitionCounts[keyAfter(REPEAT_CYCLE, 2)]).toBe(1);
  });

  it('orderAncestry walks only the chain ending at the tip, ignoring siblings', () => {
    const rows: AncestryMove[] = [
      ...chain(['m1', 'm2', 'm3'], REPEAT_CYCLE.slice(0, 3)),
      {
        id: 'm4',
        parentMoveId: 'm2',
        eventVersion: 4,
        side: 'RED',
        move: RED_HORSE_BACK,
      },
    ];

    expect(orderAncestry(rows, 'm4').map((row) => row.id)).toEqual(['m1', 'm2', 'm4']);
    expect(orderAncestry(rows, 'm3').map((row) => row.id)).toEqual(['m1', 'm2', 'm3']);
    expect(orderAncestry(rows, null)).toEqual([]);
    expect(orderAncestry(rows, 'missing')).toEqual([]);
  });

  it('a ply abandoned by undo does not add occurrences to the effective branch', () => {
    // Five plies: the position after ply 1 recurs at ply 5 (key K, two occurrences).
    const fivePlies: Move[] = [...REPEAT_CYCLE, RED_HORSE_OUT];
    const abandoned = chain(['m1', 'm2', 'm3', 'm4', 'm5'], fivePlies);
    const repeatedKey = keyAfter(fivePlies, 1);

    const abandonedBranch = rebuildFromAncestry(abandoned);
    expect(abandonedBranch.repetitionCounts[repeatedKey]).toBe(2);

    // Undo rewinds past the requester's last move (index 4) → effective prefix of 4 plies.
    const prefix = rebuildEffectiveBranch(abandoned, 4);
    expect(prefix.activeMoveIds).toEqual(['m1', 'm2', 'm3', 'm4']);
    expect(prefix.repetitionCounts[repeatedKey]).toBe(1);

    // RED replays the same ply-1 move on the new branch: occurrence 2 → still ACTIVE.
    const replayed = rebuildFromAncestry([
      ...abandoned.slice(0, 4),
      { id: 'm6', parentMoveId: 'm4', eventVersion: 6, side: 'RED', move: RED_HORSE_OUT },
    ]);
    expect(replayed.activeMoveIds).toEqual(['m1', 'm2', 'm3', 'm4', 'm6']);
    expect(replayed.repetitionCounts[repeatedKey]).toBe(2);

    // What the pre-fix event scan fed the rules: 1 (current) + ply 1 + the abandoned ply 5
    // = 3 → false REPETITION draw, while the effective branch only holds 2 occurrences.
    const eventKeyCounts: Record<string, number> = {};
    let position = createInitialPosition();
    for (const move of fivePlies) {
      position = applyMove(position, move);
      const key = positionKey(position);
      eventKeyCounts[key] = (eventKeyCounts[key] ?? 0) + 1;
    }
    expect(eventKeyCounts[repeatedKey]).toBe(2);
    expect(replayed.repetitionCounts[repeatedKey]).toBeLessThan(3);
  });
});

describe('T014-04: activeMoveIds parsing', () => {
  it('accepts the jsonb array shape and rejects anything else', () => {
    expect(parseActiveMoveIds(['a', 'b'])).toEqual(['a', 'b']);
    expect(parseActiveMoveIds('["a","b"]')).toEqual(['a', 'b']);
    expect(parseActiveMoveIds({})).toEqual([]);
    expect(parseActiveMoveIds(null)).toEqual([]);
    expect(parseActiveMoveIds([1, 'a'])).toEqual(['a']);
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
