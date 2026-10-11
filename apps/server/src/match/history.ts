import { ending, playMove, type Position } from "@xiangqi/xiangqi-core";
import {
  corrupt,
  decodeMove,
  decodePosition,
  record,
  toFen,
  uuid,
} from "./position-codec.js";
export type HistoryMove = {
  id: string;
  parent_move_id: string | null;
  event_version: number | string;
  side: string;
  move: unknown;
  event_type: string;
  payload: unknown;
};
export type HistoryInput = {
  position: unknown;
  ply: number;
  version: number | string;
  active_move_ids: unknown;
  start: unknown;
  moves: HistoryMove[];
};
export function replayHistory(input: HistoryInput): Position[] {
  if (!record(input.start) || input.start.encoding !== "xiangqi-core-v1")
    throw new Error("MATCH_HISTORY_UNSUPPORTED");
  const initial = decodePosition(input.start.initialPosition);
  if (
    !Array.isArray(input.active_move_ids) ||
    input.active_move_ids.length !== input.ply ||
    new Set(input.active_move_ids).size !== input.ply ||
    !Number.isSafeInteger(input.ply) ||
    input.ply < 0 ||
    !Number.isSafeInteger(Number(input.version))
  )
    corrupt();
  const history = [initial];
  let parent: string | null = null;
  let version = 0;
  for (const id of input.active_move_ids) {
    if (typeof id !== "string" || !uuid.test(id)) corrupt();
    const matches = input.moves.filter((m) => m.id === id);
    if (matches.length !== 1) corrupt();
    const row = matches[0]!;
    const current = history.at(-1)!;
    if (
      row.parent_move_id !== parent ||
      Number(row.event_version) <= version ||
      Number(row.event_version) > Number(input.version) ||
      !Number.isSafeInteger(Number(row.event_version)) ||
      row.side !== (current.turn === "red" ? "RED" : "BLACK") ||
      row.event_type !== "MOVE" ||
      !record(row.payload) ||
      row.payload.moveId !== id ||
      row.payload.side !== row.side ||
      ending(history)
    )
      corrupt();
    const move = decodeMove(row.move),
      eventMove = decodeMove(row.payload.move);
    if (move.from !== eventMove.from || move.to !== eventMove.to) corrupt();
    try {
      history.push(playMove(current, move));
    } catch {
      corrupt();
    }
    parent = id;
    version = Number(row.event_version);
  }
  if (toFen(history.at(-1)!) !== toFen(decodePosition(input.position)))
    corrupt();
  return history;
}
