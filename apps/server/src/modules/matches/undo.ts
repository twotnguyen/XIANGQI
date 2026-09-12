/**
 * Undo and move ancestry replay.
 * Reconstructs position, activeMoveIds, and repetition counts up to a target ply.
 */
import { createInitialPosition, applyMove } from '@xiangqi/game-rules';
import type { Position, Move, Side } from '@xiangqi/contracts';

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

export interface RebuiltBranch {
  position: Position;
  activeMoveIds: string[];
  lastMove: Move | null;
}

/**
 * Replay moves from initial position up to targetPly.
 * Pure function.
 */
export function rebuildActiveBranch(
  allMoves: RecordedMove[],
  targetPly: number,
): RebuiltBranch {
  // Filter and sort moves up to targetPly
  const movesToApply = allMoves
    .filter((m) => m.moveNumber <= targetPly)
    .sort((a, b) => a.moveNumber - b.moveNumber);

  let currentPos = createInitialPosition();
  const activeMoveIds: string[] = [];
  let lastMove: Move | null = null;

  for (const m of movesToApply) {
    const move: Move = {
      from: { x: m.fromX, y: m.fromY },
      to: { x: m.toX, y: m.toY },
    };
    currentPos = applyMove(currentPos, move);
    activeMoveIds.push(m.id);
    lastMove = move;
  }

  return {
    position: currentPos,
    activeMoveIds,
    lastMove,
  };
}
