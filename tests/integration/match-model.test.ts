/**
 * Match model acceptance on the LOCAL stack (F-01/F-02/F-02b/F-18/F-29, spec 09 rows
 * DB-10/DB-18): canonical match_moves ancestry, undo that keeps audit rows, a new branch
 * after undo, replay of the effective branch, and repetition counted on that branch only.
 */
import crypto from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CommandResult, MatchSnapshot, Move, Outcome, Position } from '@xiangqi/contracts';
import {
  INTEGRATION_LANE_ENV,
  createTestContext,
  type TestContext,
  type TestUserKey,
} from '../fixtures/integration.js';
import { recoverActiveMatchesOnBoot } from '../../apps/server/src/modules/matches/deadlines.js';
import { createInitialPosition } from '@xiangqi/game-rules';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

interface ReplayDTO {
  initialPosition: Position;
  effectiveMoves: Move[];
  undoCount: number;
  outcome: Outcome | null;
  plies: { ply: number; move: Move | null; position: Position }[];
}

const RED_HORSE_OUT: Move = { from: { x: 1, y: 0 }, to: { x: 2, y: 2 } };
const RED_HORSE_BACK: Move = { from: { x: 2, y: 2 }, to: { x: 1, y: 0 } };
const BLACK_HORSE_OUT: Move = { from: { x: 1, y: 9 }, to: { x: 2, y: 7 } };
const BLACK_HORSE_BACK: Move = { from: { x: 2, y: 7 }, to: { x: 1, y: 9 } };
const RED_PAWN: Move = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
const BLACK_PAWN: Move = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } };

describe.runIf(inIntegrationLane)(
  'T012/T014/T027: match ancestry model on local Postgres',
  () => {
    let ctx: TestContext;

    beforeAll(async () => {
      ctx = await createTestContext();
    }, 60_000);

    afterAll(async () => {
      await ctx?.dispose();
    });

    /**
     * Unwrap the `{ok, data, requestId}` route envelope. Each caller names the payload type;
     * the preceding status assertion is what proves the shape at runtime.
     */
    function unwrap<T>(res: { json(): unknown }): T {
      const body = res.json() as { data: T };
      return body.data;
    }

    async function createMatch(
      red: TestUserKey = 'A',
      black: TestUserKey = 'B',
    ): Promise<{ roomId: string; matchId: string }> {
      const roomRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/rooms',
        headers: ctx.authAs(red),
        payload: {
          name: `ancestry-${ctx.runId.slice(0, 10)}`,
          visibility: 'PUBLIC',
          timeControl: 0,
        },
      });
      expect(roomRes.statusCode, roomRes.body).toBe(200);
      const roomId = unwrap<{ id: string }>(roomRes).id;

      const joinRes = await ctx.app.inject({
        method: 'POST',
        url: '/api/v1/rooms/join',
        headers: ctx.authAs(black),
        payload: { roomId, role: 'PLAYER' },
      });
      expect(joinRes.statusCode, joinRes.body).toBe(200);

      const readyRed = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${roomId}/ready`,
        headers: ctx.authAs(red),
        payload: { ready: true },
      });
      expect(readyRed.statusCode, readyRed.body).toBe(200);

      const readyBlack = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${roomId}/ready`,
        headers: ctx.authAs(black),
        payload: { ready: true },
      });
      expect(readyBlack.statusCode, readyBlack.body).toBe(200);

      const matchSnapshot = unwrap<{ matchSnapshot: MatchSnapshot | null }>(readyBlack).matchSnapshot;
      expect(matchSnapshot?.status).toBe('ACTIVE');
      return { roomId, matchId: matchSnapshot!.id };
    }

    async function makeMove(
      key: TestUserKey,
      matchId: string,
      expectedVersion: number,
      move: Move,
    ): Promise<CommandResult> {
      const res = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/commands/move`,
        headers: ctx.authAs(key),
        payload: { commandId: crypto.randomUUID(), expectedVersion, payload: move },
      });
      expect(res.statusCode, res.body).toBe(200);
      return unwrap<CommandResult>(res);
    }

    async function propose(
      key: TestUserKey,
      matchId: string,
      expectedVersion: number,
      kind: 'DRAW' | 'UNDO',
    ): Promise<CommandResult> {
      const res = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/commands/propose`,
        headers: ctx.authAs(key),
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion,
          payload: { kind },
        },
      });
      expect(res.statusCode, res.body).toBe(200);
      return unwrap<CommandResult>(res);
    }

    async function acceptProposal(
      key: TestUserKey,
      matchId: string,
      expectedVersion: number,
      proposalId: string,
      accept = true,
    ): Promise<CommandResult> {
      const res = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/commands/respond`,
        headers: ctx.authAs(key),
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion,
          payload: { proposalId, accept },
        },
      });
      expect(res.statusCode, res.body).toBe(200);
      return unwrap<CommandResult>(res);
    }

    async function getSnapshot(matchId: string, key: TestUserKey = 'A'): Promise<MatchSnapshot> {
      const res = await ctx.app.inject({
        method: 'GET',
        url: `/api/v1/matches/${matchId}`,
        headers: ctx.authAs(key),
      });
      expect(res.statusCode, res.body).toBe(200);
      return unwrap<MatchSnapshot>(res);
    }

    async function getReplay(matchId: string, key: TestUserKey = 'A'): Promise<ReplayDTO> {
      const res = await ctx.app.inject({
        method: 'GET',
        url: `/api/v1/matches/${matchId}/replay`,
        headers: ctx.authAs(key),
      });
      expect(res.statusCode, res.body).toBe(200);
      return unwrap<ReplayDTO>(res);
    }

    /**
     * Fixture shape the parallel DB-harness lane creates: a match row that is ACTIVE while
     * its room is still WAITING with `current_match_id IS NULL`.
     */
    async function createDirtyWaitingRoomMatch(
      red: TestUserKey,
      black: TestUserKey,
    ): Promise<{ roomId: string; matchId: string }> {
      const roomId = crypto.randomUUID();
      const matchId = crypto.randomUUID();

      await ctx.pool.query(
        `INSERT INTO public.rooms (id, name, owner_id, visibility, status, time_control, room_version)
         VALUES ($1, $2, $3, 'PUBLIC', 'WAITING', 0, 1)`,
        [roomId, `dirty-${ctx.runId.slice(0, 10)}`, ctx.users[red].id],
      );
      await ctx.pool.query(
        `INSERT INTO public.matches (
           id, room_id, mode, status, red_user_id, black_user_id, position, version, ply,
           time_control, repetition_counts, active_move_ids, boot_id
         ) VALUES (
           $1, $2, 'ONLINE', 'ACTIVE', $3, $4, $5, 0, 0, 0, '{}'::jsonb, '[]'::jsonb,
           gen_random_uuid()
         )`,
        [
          matchId,
          roomId,
          ctx.users[red].id,
          ctx.users[black].id,
          JSON.stringify(createInitialPosition()),
        ],
      );

      return { roomId, matchId };
    }

    it('F-01/F-02b/F-18: undo keeps audit rows and the next move starts a new branch', async () => {
      const { matchId } = await createMatch();

      const move1 = await makeMove('A', matchId, 0, RED_PAWN);
      expect(move1.snapshot.ply).toBe(1);
      expect(move1.snapshot.activeMoveIds).toHaveLength(1);

      const move2 = await makeMove('B', matchId, move1.appliedVersion, BLACK_PAWN);
      expect(move2.snapshot.activeMoveIds).toHaveLength(2);

      const proposed = await propose('A', matchId, move2.appliedVersion, 'UNDO');
      const proposalId = proposed.snapshot.proposal?.id;
      expect(proposalId).toBeTruthy();

      const undone = await acceptProposal('B', matchId, proposed.appliedVersion, proposalId!);
      expect(undone.snapshot.ply).toBe(0);
      expect(undone.snapshot.activeMoveIds).toEqual([]);

      // F-01 regression: this used to violate moves_match_move_number_unique → HTTP 500.
      const move3 = await makeMove('A', matchId, undone.appliedVersion, RED_HORSE_OUT);
      expect(move3.snapshot.ply).toBe(1);
      expect(move3.snapshot.activeMoveIds).toHaveLength(1);

      // Canonical log keeps both branches; nothing deletes audit rows.
      const log = await ctx.pool.query<{
        id: string;
        parent_move_id: string | null;
        event_version: string;
      }>(
        `SELECT id, parent_move_id, event_version FROM public.match_moves
         WHERE match_id = $1 ORDER BY event_version ASC`,
        [matchId],
      );
      expect(log.rowCount).toBe(3);

      const legacy = await ctx.pool.query<{ n: number }>(
        'SELECT count(*)::int AS n FROM public.moves WHERE match_id = $1',
        [matchId],
      );
      expect(legacy.rows[0]!.n).toBe(0);

      // UNDO event carries removedMoveIds/targetPly/requester/approver (spec 03 §Undo).
      const undoEvents = await ctx.pool.query<{ payload: unknown }>(
        `SELECT payload FROM public.match_events WHERE match_id = $1 AND type = 'UNDO'`,
        [matchId],
      );
      expect(undoEvents.rowCount).toBe(1);
      const undoPayload = undoEvents.rows[0]!.payload as {
        removedMoveIds: string[];
        targetPly: number;
        requester: string;
        approver: string;
      };
      const activeAfterUndo = move2.snapshot.activeMoveIds;
      expect(undoPayload.removedMoveIds).toEqual(activeAfterUndo);
      expect(undoPayload.targetPly).toBe(0);
      expect(undoPayload.requester).toBe(ctx.users.A.id);
      expect(undoPayload.approver).toBe(ctx.users.B.id);

      // The replacement move is the tip of a fresh root branch (parent null at ply 0).
      const replacement = log.rows.find((row) => row.id === move3.snapshot.activeMoveIds[0]);
      expect(replacement?.parent_move_id).toBeNull();
      expect(move3.snapshot.activeMoveIds[0]).not.toBe(activeAfterUndo[0]);

      // F-02b: snapshots expose the real branch, and reading does not mutate state.
      const first = await getSnapshot(matchId);
      const second = await getSnapshot(matchId);
      expect(first.activeMoveIds).toEqual(move3.snapshot.activeMoveIds);
      expect(second.activeMoveIds).toEqual(first.activeMoveIds);
      expect(second.version).toBe(first.version);
      expect(second.ply).toBe(1);

      // Replay returns the effective branch only (spec 04 + ISSUE-027).
      const replay = await getReplay(matchId);
      expect(replay.undoCount).toBe(1);
      expect(replay.effectiveMoves).toEqual([RED_HORSE_OUT]);
      expect(replay.initialPosition.turn).toBe('RED');
      expect(replay.plies).toHaveLength(2);
      expect(replay.outcome).toBeNull();

      // Terminal mutation keeps the branch and releases the match for the next case.
      const resignRes = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${matchId}/commands/resign`,
        headers: ctx.authAs('A'),
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion: move3.appliedVersion,
          payload: {},
        },
      });
      expect(resignRes.statusCode, resignRes.body).toBe(200);
      const resigned = unwrap<CommandResult>(resignRes);
      expect(resigned.snapshot.status).toBe('FINISHED');
      expect(resigned.snapshot.outcome).toEqual({ winner: 'BLACK', reason: 'RESIGN' });
      expect(resigned.snapshot.ply).toBe(1);
      expect(resigned.snapshot.activeMoveIds).toEqual(move3.snapshot.activeMoveIds);
    });

    it('F-02: threefold repetition on the active branch ends the match as a draw', async () => {
      const { matchId } = await createMatch('S1', 'S2');

      // Two full horse cycles: ply 4 and ply 8 return to the initial position.
      const move1 = await makeMove('S1', matchId, 0, RED_HORSE_OUT);
      const move2 = await makeMove('S2', matchId, move1.appliedVersion, BLACK_HORSE_OUT);
      const move3 = await makeMove('S1', matchId, move2.appliedVersion, RED_HORSE_BACK);
      const move4 = await makeMove('S2', matchId, move3.appliedVersion, BLACK_HORSE_BACK);
      expect(move4.snapshot.status).toBe('ACTIVE');
      const move5 = await makeMove('S1', matchId, move4.appliedVersion, RED_HORSE_OUT);
      const move6 = await makeMove('S2', matchId, move5.appliedVersion, BLACK_HORSE_OUT);
      const move7 = await makeMove('S1', matchId, move6.appliedVersion, RED_HORSE_BACK);
      expect(move7.snapshot.status).toBe('ACTIVE');

      // ply 8 repeats the initial position for the third time.
      const move8 = await makeMove('S2', matchId, move7.appliedVersion, BLACK_HORSE_BACK);
      expect(move8.snapshot.status).toBe('FINISHED');
      expect(move8.snapshot.outcome).toEqual({ winner: null, reason: 'REPETITION' });
      expect(move8.snapshot.activeMoveIds).toHaveLength(8);
      expect(move8.snapshot.ply).toBe(8);

      const counts = await ctx.pool.query<{ repetition_counts: Record<string, number> }>(
        'SELECT repetition_counts FROM public.matches WHERE id = $1',
        [matchId],
      );
      expect(Math.max(...Object.values(counts.rows[0]!.repetition_counts))).toBe(3);
    });

    it('F-02: a repetition that only exists on the abandoned branch does not fire', async () => {
      const { roomId, matchId } = await createMatch('S3', 'S4');

      // Five plies: the position after ply 1 recurs at ply 5 (two occurrences, no draw).
      const move1 = await makeMove('S3', matchId, 0, RED_HORSE_OUT);
      const move2 = await makeMove('S4', matchId, move1.appliedVersion, BLACK_HORSE_OUT);
      const move3 = await makeMove('S3', matchId, move2.appliedVersion, RED_HORSE_BACK);
      const move4 = await makeMove('S4', matchId, move3.appliedVersion, BLACK_HORSE_BACK);
      const move5 = await makeMove('S3', matchId, move4.appliedVersion, RED_HORSE_OUT);
      expect(move5.snapshot.status).toBe('ACTIVE');

      // RED undoes its own ply 5: the branch rewinds to ply 4.
      const proposed = await propose('S3', matchId, move5.appliedVersion, 'UNDO');
      const proposalId = proposed.snapshot.proposal?.id;
      const undone = await acceptProposal('S4', matchId, proposed.appliedVersion, proposalId!);
      expect(undone.snapshot.ply).toBe(4);
      expect(undone.snapshot.activeMoveIds).toEqual(move4.snapshot.activeMoveIds);

      // Same ply-5 move replayed on the new branch: its position key already occurred at
      // ply 1 and once more in the abandoned branch, so an all-events scan reports 3.
      const replayed = await makeMove('S3', matchId, undone.appliedVersion, RED_HORSE_OUT);
      expect(replayed.snapshot.status).toBe('ACTIVE');
      expect(replayed.snapshot.outcome).toBeNull();
      expect(replayed.snapshot.ply).toBe(5);
      expect(replayed.snapshot.activeMoveIds).toHaveLength(5);

      // Six rows accepted, five on the effective branch, nothing deleted.
      const log = await ctx.pool.query<{ id: string }>(
        'SELECT id FROM public.match_moves WHERE match_id = $1',
        [matchId],
      );
      expect(log.rowCount).toBe(6);

      const undoEvents = await ctx.pool.query<{ payload: unknown }>(
        `SELECT payload FROM public.match_events WHERE match_id = $1 AND type = 'UNDO'`,
        [matchId],
      );
      const undoPayload = undoEvents.rows[0]!.payload as {
        removedMoveIds: string[];
        targetPly: number;
      };
      expect(undoPayload.removedMoveIds).toHaveLength(1);
      expect(undoPayload.targetPly).toBe(4);
      for (const moveId of undoPayload.removedMoveIds) {
        expect(replayed.snapshot.activeMoveIds).not.toContain(moveId);
      }

      const counts = await ctx.pool.query<{ repetition_counts: Record<string, number> }>(
        'SELECT repetition_counts FROM public.matches WHERE id = $1',
        [matchId],
      );
      expect(Math.max(...Object.values(counts.rows[0]!.repetition_counts))).toBe(2);

      const replay = await getReplay(matchId, 'S3');
      expect(replay.effectiveMoves).toHaveLength(5);
      expect(replay.undoCount).toBe(1);

      // Fixture state the parallel DB-harness lane leaves behind: match rows that are ACTIVE
      // while their room is still WAITING with current_match_id NULL.
      //
      // A) Reject path writes a spec-valid event: the legacy PROPOSAL_REJECTED value is
      //    rejected by match_events_type_check (23514), so this used to 500.
      const rejectDirty = await createDirtyWaitingRoomMatch('S5', 'S6');
      const rejectProposed = await propose('S5', rejectDirty.matchId, 0, 'DRAW');
      const rejected = await acceptProposal(
        'S6',
        rejectDirty.matchId,
        rejectProposed.appliedVersion,
        rejectProposed.snapshot.proposal!.id,
        false,
      );
      expect(rejected.snapshot.status).toBe('ACTIVE');
      expect(rejected.snapshot.proposal).toBeNull();

      const resolvedEvents = await ctx.pool.query<{ type: string }>(
        `SELECT type FROM public.match_events WHERE match_id = $1 AND version = $2`,
        [rejectDirty.matchId, rejected.appliedVersion],
      );
      expect(resolvedEvents.rows[0]!.type).toBe('PROPOSAL_RESOLVED');

      // B) Accepted DRAW terminates the match without forcing the WAITING room to FINISHED
      //    (pre-guard: rooms_status_invariants 23514 → HTTP 500).
      const drawDirty = await createDirtyWaitingRoomMatch('S1', 'S2');
      const drawProposed = await propose('S1', drawDirty.matchId, 0, 'DRAW');
      const drawAccepted = await acceptProposal(
        'S2',
        drawDirty.matchId,
        drawProposed.appliedVersion,
        drawProposed.snapshot.proposal!.id,
      );
      expect(drawAccepted.snapshot.status).toBe('FINISHED');
      expect(drawAccepted.snapshot.outcome).toEqual({ winner: null, reason: 'AGREED_DRAW' });

      const drawRoom = await ctx.pool.query<{ status: string; current_match_id: string | null }>(
        'SELECT status, current_match_id FROM public.rooms WHERE id = $1',
        [drawDirty.roomId],
      );
      expect(drawRoom.rows[0]!.status).toBe('WAITING');
      expect(drawRoom.rows[0]!.current_match_id).toBeNull();

      // C) Server restart: every eligible ACTIVE match must be interrupted in one sweep, even
      //    with the rejected match still ACTIVE in its WAITING room (pre-guard: the whole
      //    recovery transaction aborted on rooms_status_invariants and no match was touched).
      const activeBefore = await ctx.pool.query<{ id: string }>(
        `SELECT id FROM public.matches WHERE status = 'ACTIVE'`,
      );
      expect(activeBefore.rowCount ?? 0).toBeGreaterThanOrEqual(2);

      const recovered = await recoverActiveMatchesOnBoot(ctx.pool);
      expect(recovered).toBeGreaterThanOrEqual(activeBefore.rowCount ?? 0);

      const stillActive = await ctx.pool.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM public.matches WHERE status = 'ACTIVE'`,
      );
      expect(stillActive.rows[0]!.n).toBe(0);

      // Normal case: the room owning the interrupted match ends FINISHED with finished_at.
      const owningRoom = await ctx.pool.query<{ status: string; finished_at: string | null }>(
        'SELECT status, finished_at FROM public.rooms WHERE id = $1',
        [roomId],
      );
      expect(owningRoom.rows[0]!.status).toBe('FINISHED');
      expect(owningRoom.rows[0]!.finished_at).not.toBeNull();

      // Dirty case: the WAITING room is left as it was instead of aborting the whole sweep.
      const dirtyRoom = await ctx.pool.query<{ status: string; current_match_id: string | null }>(
        'SELECT status, current_match_id FROM public.rooms WHERE id = $1',
        [rejectDirty.roomId],
      );
      expect(dirtyRoom.rows[0]!.status).toBe('WAITING');
      expect(dirtyRoom.rows[0]!.current_match_id).toBeNull();

      const dirtyMatch = await ctx.pool.query<{ status: string; outcome: Outcome }>(
        'SELECT status, outcome FROM public.matches WHERE id = $1',
        [rejectDirty.matchId],
      );
      expect(dirtyMatch.rows[0]!.status).toBe('INTERRUPTED');
      expect(dirtyMatch.rows[0]!.outcome).toEqual({ winner: null, reason: 'SERVER_RESTART' });

      // History survives the restart and replay still returns the effective branch.
      const afterRestart = await getSnapshot(matchId, 'S3');
      expect(afterRestart.status).toBe('INTERRUPTED');
      expect(afterRestart.outcome).toEqual({ winner: null, reason: 'SERVER_RESTART' });
      expect(afterRestart.activeMoveIds).toEqual(replayed.snapshot.activeMoveIds);

      const replayAfterRestart = await getReplay(matchId, 'S3');
      expect(replayAfterRestart.effectiveMoves).toEqual(replay.effectiveMoves);
      expect(replayAfterRestart.undoCount).toBe(1);
    });
  },
);
