import {
  parsePosition,
  playMove,
  serializePosition,
  type Move,
} from "@xiangqi/xiangqi-core";
import type { EngineRequest } from "./contracts.js";

/** Every transition is played legally; expected outcomes are fixed test oracles. */
export function historyCases() {
  return [
    {
      name: "quiet repetition",
      fen: "4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 0 1",
      cycle: [
        [12, 21],
        [4, 5],
        [21, 12],
        [5, 4],
      ],
      terminal: { reason: "DRAW_REPETITION", winner: null },
    },
    {
      name: "Red perpetual check",
      fen: "4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 0 1",
      cycle: [
        [12, 13],
        [4, 3],
        [13, 12],
        [3, 4],
      ],
      terminal: { reason: "PERPETUAL_CHECK", winner: "black" },
    },
    {
      name: "Black perpetual check",
      fen: "4k4/9/9/9/4p4/9/9/9/3r5/4K4 b - - 0 1",
      cycle: [
        [75, 76],
        [85, 84],
        [76, 75],
        [84, 85],
      ],
      terminal: { reason: "PERPETUAL_CHECK", winner: "red" },
    },
  ].map(({ name, fen, cycle, terminal }) => {
    let current = parsePosition(fen);
    const history = [serializePosition(current)];
    for (const [from, to] of [...cycle, ...cycle]) {
      current = playMove(current, { from, to } as Move);
      history.push(serializePosition(current));
    }
    const input: EngineRequest = {
      position: serializePosition(current),
      side: current.turn,
      level: "easy",
      history,
    };
    return { name, input, terminal };
  });
}
