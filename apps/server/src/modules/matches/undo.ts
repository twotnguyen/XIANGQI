/**
 * Undo and move ancestry replay.
 * Reconstructs position, activeMoveIds, and repetition counts for one branch.
 *
 * Canonical source of an effective branch is `public.match_moves` walked through
 * `parent_move_id` (spec 09 §6.3) starting at the tip recorded in
 * `matches.active_move_ids` (spec 09 §6.1). `public.moves` is legacy audit only.
 */
import type { Position, Move, Side, Square } from '@xiangqi/contracts';
import { createInitialPosition, applyMove, positionKey } from '@xiangqi/game-rules';

/** Legacy flat move row (public.moves). */
export interface RecordedMove {
  id: string;
  moveNumber: number;
  playerId: string;
  side: Side;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/** One row of the canonical runtime log (public.match_moves). */
export interface AncestryMove {
  id: string;
  parentMoveId: string | null;
  eventVersion: number;
  side: Side;
  move: Move;
}

export interface RebuiltBranch {
  position: Position;
  activeMoveIds: string[];
  lastMove: Move | null;
  /** positionKey → occurrences on this branch, including the initial position. */
  repetitionCounts: Record<string, number>;
}

/** Minimal query surface shared by pg.Pool and pg.PoolClient. */
export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

/**
 * Replay flat legacy moves from the initial position up to targetPly.
 * Pure function; kept for the AI undo path.
 */
export function rebuildActiveBranch(
  allMoves: RecordedMove[],
  targetPly: number,
): RebuiltBranch {
  const movesToApply = allMoves
    .filter((m) => m.moveNumber <= targetPly)
    .sort((a, b) => a.moveNumber - b.moveNumber);

  let currentPos = createInitialPosition();
  const counts: Record<string, number> = { [positionKey(currentPos)]: 1 };
  const activeMoveIds: string[] = [];
  let lastMove: Move | null = null;

  for (const m of movesToApply) {
    const move: Move = {
      from: { x: m.fromX, y: m.fromY },
      to: { x: m.toX, y: m.toY },
    };
    currentPos = applyMove(currentPos, move);
    const key = positionKey(currentPos);
    counts[key] = (counts[key] ?? 0) + 1;
    activeMoveIds.push(m.id);
    lastMove = move;
  }

  return {
    position: currentPos,
    activeMoveIds,
    lastMove,
    repetitionCounts: counts,
  };
}

/**
 * Order the ancestry chain ending at `tipId` from root (ply 1) to tip.
 * Returns [] when the tip is unknown. Defensive against a corrupt cycle.
 */
export function orderAncestry(rows: AncestryMove[], tipId: string | null): AncestryMove[] {
  if (!tipId) return [];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const chain: AncestryMove[] = [];
  const seen = new Set<string>();

  let current = byId.get(tipId);
  while (current) {
    if (seen.has(current.id)) break;
    seen.add(current.id);
    chain.push(current);
    current = current.parentMoveId ? byId.get(current.parentMoveId) : undefined;
  }

  return chain.reverse();
}

/** Rebuild position + activeMoveIds + repetition counts from a root→tip chain. */
export function rebuildFromAncestry(chain: AncestryMove[]): RebuiltBranch {
  let currentPos = createInitialPosition();
  const counts: Record<string, number> = { [positionKey(currentPos)]: 1 };
  const activeMoveIds: string[] = [];
  let lastMove: Move | null = null;

  for (const entry of chain) {
    currentPos = applyMove(currentPos, entry.move);
    const key = positionKey(currentPos);
    counts[key] = (counts[key] ?? 0) + 1;
    activeMoveIds.push(entry.id);
    lastMove = entry.move;
  }

  return {
    position: currentPos,
    activeMoveIds,
    lastMove,
    repetitionCounts: counts,
  };
}

/** Effective branch truncated to `targetPly` moves (0 = initial position, no moves). */
export function rebuildEffectiveBranch(
  branch: AncestryMove[],
  targetPly: number,
): RebuiltBranch {
  const clamped = Math.max(0, Math.min(targetPly, branch.length));
  return rebuildFromAncestry(branch.slice(0, clamped));
}

/** Parse `matches.active_move_ids` (jsonb array of UUID text) into a string[]. */
export function parseActiveMoveIds(raw: unknown): string[] {
  const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

interface MatchMoveRow {
  id: string;
  parent_move_id: string | null;
  event_version: string | number;
  side: Side;
  move: unknown;
}

function toAncestryMove(row: MatchMoveRow): AncestryMove {
  const raw = (typeof row.move === 'string' ? JSON.parse(row.move) : row.move) as {
    from: Square;
    to: Square;
  };
  return {
    id: row.id,
    parentMoveId: row.parent_move_id,
    eventVersion: Number(row.event_version),
    side: row.side,
    move: { from: { x: raw.from.x, y: raw.from.y }, to: { x: raw.to.x, y: raw.to.y } },
  };
}

/**
 * Load the effective branch for a match: the ancestry chain ending at the tip stored in
 * `matches.active_move_ids`. The column is authoritative (spec 09 §6.1: its length equals
 * ply), so an empty list means an empty branch and an unknown tip means stale state —
 * neither may silently resolve to the newest row, which is how an abandoned branch would
 * be resurrected.
 */
export async function loadActiveBranch(
  client: Queryable,
  matchId: string,
  activeMoveIds: string[],
): Promise<AncestryMove[]> {
  const tip = activeMoveIds.length > 0 ? activeMoveIds[activeMoveIds.length - 1]! : null;
  if (!tip) return [];

  const res = await client.query(
    `SELECT id, parent_move_id, event_version, side, move
     FROM public.match_moves
     WHERE match_id = $1
     ORDER BY event_version ASC`,
    [matchId],
  );

  // pg hands back jsonb/array columns untyped; the SELECT list above fixes the shape.
  const rawRows = res.rows as MatchMoveRow[];
  return orderAncestry(rawRows.map(toAncestryMove), tip);
}
