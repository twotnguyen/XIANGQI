import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  legalMoves,
  isInCheck,
  serializePosition,
  type Move,
  type PieceType,
  type Position,
  type Side,
} from "@xiangqi/xiangqi-core";
import "./XiangqiBoard.css";
import "./XiangqiBoardInteraction.css";

export interface XiangqiBoardProps {
  position: Position;
  /** Display only; spectators use the default Red-at-bottom view. */
  orientation?: Side;
  playerSide?: Side;
  disabled?: boolean;
  pending?: boolean;
  onMove?: (from: number, to: number) => void;
  lastMove?: Move | null;
}

const glyphs: Record<Side, Record<PieceType, string>> = {
  red: {
    king: "帥",
    advisor: "仕",
    elephant: "相",
    rook: "俥",
    horse: "傌",
    cannon: "炮",
    pawn: "兵",
  },
  black: {
    king: "將",
    advisor: "士",
    elephant: "象",
    rook: "車",
    horse: "馬",
    cannon: "砲",
    pawn: "卒",
  },
};
const names: Record<PieceType, string> = {
  king: "Tướng",
  advisor: "Sĩ",
  elephant: "Tượng",
  rook: "Xe",
  horse: "Mã",
  cannon: "Pháo",
  pawn: "Tốt",
};
const pieceTypes: PieceType[] = [
  "king",
  "advisor",
  "elephant",
  "horse",
  "rook",
  "cannon",
  "pawn",
];
const files = Array.from({ length: 9 }, (_, x) => x);
const ranks = Array.from({ length: 10 }, (_, y) => y);
const marks = [
  [1, 2],
  [7, 2],
  [1, 7],
  [7, 7],
  ...[0, 2, 4, 6, 8].flatMap((x) => [
    [x, 3],
    [x, 6],
  ]),
];

function markerPath(x: number, y: number): string {
  const cx = 24 + x * 40;
  const cy = 24 + y * 40;
  const corners: string[] = [];
  for (const dx of [-1, 1]) {
    if ((x === 0 && dx === -1) || (x === 8 && dx === 1)) continue;
    for (const dy of [-1, 1]) {
      corners.push(`M${cx + dx * 4} ${cy + dy * 9}v${-dy * 5}h${dx * 5}`);
    }
  }
  return corners.join(" ");
}

/** Controlled position: callbacks request a move; only new props change the board. */
export function XiangqiBoard({
  position,
  orientation = "red",
  playerSide = orientation,
  disabled = false,
  pending = false,
  onMove,
  lastMove = null,
}: XiangqiBoardProps) {
  const interactive = Boolean(onMove) && !disabled;
  const enabled = interactive && !pending && position.turn === playerSide;
  const [selected, setSelected] = useState<number | null>(null);
  const [focused, setFocused] = useState(orientation === "red" ? 85 : 4);
  const controls = useRef<(SVGRectElement | null)[]>([]);
  const svg = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{
    from: number;
    pointerId: number;
    start: [number, number];
    moved: boolean;
    fen: string;
  } | null>(null);
  const [ghost, setGhost] = useState<{
    from: number;
    x: number;
    y: number;
    returning: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fen = serializePosition(position);
  const moves = useMemo(
    () => (enabled ? legalMoves(position) : []),
    [enabled, fen],
  );
  const destinations = moves
    .filter((move) => move.from === selected)
    .map((move) => move.to);
  const checks = (["red", "black"] as const).filter((side) =>
    isInCheck(position, side),
  );
  useEffect(() => {
    setSelected(null);
    drag.current = null;
    setGhost(null);
  }, [fen, pending, disabled, orientation, playerSide]);
  useEffect(
    () => () => {
      if (returnTimer.current !== null) clearTimeout(returnTimer.current);
    },
    [],
  );
  function point(square: number): [number, number] {
    const x = square % 9,
      y = Math.floor(square / 9);
    return [
      24 + (orientation === "red" ? x : 8 - x) * 40,
      24 + (orientation === "red" ? y : 9 - y) * 40,
    ];
  }
  function pointerPoint(
    event: PointerEvent<SVGSVGElement>,
  ): [number, number] | null {
    const matrix = svg.current?.getScreenCTM()?.inverse();
    if (!matrix) return null;
    return [
      matrix.a * event.clientX + matrix.c * event.clientY + matrix.e,
      matrix.b * event.clientX + matrix.d * event.clientY + matrix.f,
    ];
  }
  function squareAt(local: [number, number]): number | null {
    const x = Math.round((local[0] - 24) / 40),
      y = Math.round((local[1] - 24) / 40);
    if (
      x < 0 ||
      x > 8 ||
      y < 0 ||
      y > 9 ||
      local[0] < 4 ||
      local[0] > 364 ||
      local[1] < 4 ||
      local[1] > 404
    )
      return null;
    return orientation === "red" ? y * 9 + x : (9 - y) * 9 + 8 - x;
  }
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    suppressClick.current = false;
    if (
      !enabled ||
      event.button !== 0 ||
      event.isPrimary === false ||
      drag.current
    )
      return;
    const local = pointerPoint(event),
      square = local ? squareAt(local) : null;
    if (square === null || position.board[square]?.side !== playerSide) return;
    if (returnTimer.current !== null) clearTimeout(returnTimer.current);
    setGhost(null);
    drag.current = {
      from: square,
      pointerId: event.pointerId,
      start: local!,
      moved: false,
      fen,
    };
    setFocused(square);
    controls.current[square]?.focus();
    svg.current?.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    if (
      !current ||
      current.pointerId !== event.pointerId ||
      current.fen !== fen ||
      !enabled
    )
      return;
    const local = pointerPoint(event);
    if (!local) return;
    if (
      !current.moved &&
      Math.hypot(local[0] - current.start[0], local[1] - current.start[1]) < 4
    )
      return;
    event.preventDefault();
    current.moved = true;
    setSelected(current.from);
    setGhost({
      from: current.from,
      x: local[0],
      y: local[1],
      returning: false,
    });
  }
  function release(pointerId: number) {
    if (svg.current?.hasPointerCapture(pointerId))
      svg.current.releasePointerCapture(pointerId);
  }
  function pointerUp(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    release(event.pointerId);
    if (!current.moved) {
      suppressClick.current = true;
      choose(current.from);
      return;
    }
    suppressClick.current = true;
    setSelected(null);
    const local = pointerPoint(event),
      to = local ? squareAt(local) : null;
    if (
      enabled &&
      current.fen === fen &&
      to !== null &&
      moves.some((move) => move.from === current.from && move.to === to)
    ) {
      setGhost(null);
      onMove?.(current.from, to);
      return;
    }
    const [x, y] = point(current.from);
    setGhost({ from: current.from, x, y, returning: true });
    returnTimer.current = setTimeout(() => {
      setGhost(null);
      returnTimer.current = null;
    }, 180);
  }
  function cancelPointer(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    release(event.pointerId);
    setGhost(null);
    setSelected(null);
    suppressClick.current = true;
  }
  function choose(square: number) {
    if (!enabled) return;
    if (selected !== null && destinations.includes(square)) {
      onMove?.(selected, square);
      setSelected(null);
      return;
    }
    if (selected !== null) {
      setSelected(null);
      return;
    }
    if (position.board[square]?.side === playerSide) setSelected(square);
  }
  function keyboard(event: KeyboardEvent<SVGRectElement>, square: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      const current = drag.current;
      drag.current = null;
      if (current) release(current.pointerId);
      setGhost(null);
      setSelected(null);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(square);
      return;
    }
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const factor = orientation === "red" ? 1 : -1;
    const x = (square % 9) + direction[0]! * factor,
      y = Math.floor(square / 9) + direction[1]! * factor;
    if (x < 0 || x > 8 || y < 0 || y > 9) return;
    const next = y * 9 + x;
    setFocused(next);
    controls.current[next]?.focus();
  }
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const woodId = `${id}-wood`;
  const clipId = `${id}-drag-clip`;
  const bottom = orientation === "red" ? "Đỏ" : "Đen";
  return (
    <figure
      className={`xq-board${interactive ? " xq-board-interactive" : ""}${enabled ? " xq-board-can-move" : ""}`}
    >
      <svg
        ref={svg}
        className="xq-board-svg"
        viewBox="0 0 368 408"
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={pending || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={cancelPointer}
        onLostPointerCapture={cancelPointer}
      >
        <title id={titleId}>{`Bàn cờ tướng — ${bottom} ở phía dưới`}</title>
        <desc id={descriptionId}>
          9 cột, 10 hàng giao điểm. Quân đỏ viền một nét, quân đen viền hai nét.
          Nhãn quân dùng tọa độ gốc.
        </desc>
        <defs>
          <clipPath id={clipId}>
            <rect width="368" height="408" />
          </clipPath>
          <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-wood)" />
            <stop offset="0.5" stopColor="var(--color-paper-board)" />
            <stop offset="1" stopColor="var(--color-wood)" />
          </linearGradient>
        </defs>
        <g aria-hidden="true" className="xq-board-grid">
          <rect
            x="1"
            y="1"
            width="366"
            height="406"
            rx="8"
            fill={`url(#${woodId})`}
          />
          {ranks.map((y) => (
            <line
              key={y}
              className="xq-board-rank"
              x1="24"
              x2="344"
              y1={24 + y * 40}
              y2={24 + y * 40}
            />
          ))}
          {files.map((x) =>
            x === 0 || x === 8 ? (
              <line
                key={x}
                className="xq-board-file"
                x1={24 + x * 40}
                x2={24 + x * 40}
                y1="24"
                y2="384"
              />
            ) : (
              <g key={x}>
                <line
                  className="xq-board-file"
                  x1={24 + x * 40}
                  x2={24 + x * 40}
                  y1="24"
                  y2="184"
                />
                <line
                  className="xq-board-file"
                  x1={24 + x * 40}
                  x2={24 + x * 40}
                  y1="224"
                  y2="384"
                />
              </g>
            ),
          )}
          <path
            className="xq-board-palace"
            d="M144 24L224 104M224 24L144 104"
          />
          <path
            className="xq-board-palace"
            d="M144 304L224 384M224 304L144 384"
          />
          {marks.map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              className="xq-board-mark"
              d={markerPath(x!, y!)}
            />
          ))}
          <text className="xq-board-river" x="104" y="204">
            楚河
          </text>
          <text className="xq-board-river" x="264" y="204">
            漢界
          </text>
        </g>
        <g aria-hidden="true" className="xq-board-signs">
          {lastMove &&
            [lastMove.from, lastMove.to].map((square, index) => {
              const [x, y] = point(square);
              return (
                <path
                  key={index}
                  className="xq-board-last"
                  transform={`translate(${x} ${y})`}
                  d="M-12 -20h-8v8M12 -20h8v8M-12 20h-8v-8M12 20h8v-8"
                />
              );
            })}
          {selected !== null &&
            enabled &&
            (() => {
              const [x, y] = point(selected);
              return (
                <circle className="xq-board-selected" cx={x} cy={y} r="21" />
              );
            })()}
          {destinations.map((square) => {
            const [x, y] = point(square);
            return (
              <circle
                key={square}
                className={
                  position.board[square] ? "xq-board-capture" : "xq-board-hint"
                }
                cx={x}
                cy={y}
                r={position.board[square] ? 20 : 5}
              />
            );
          })}
          {checks.map((side) => {
            const square = position.board.findIndex(
              (piece) => piece?.side === side && piece.type === "king",
            );
            const [x, y] = point(square);
            return (
              <circle
                key={side}
                className="xq-board-check"
                cx={x}
                cy={y}
                r="22"
              />
            );
          })}
        </g>
        {position.board.map((piece, square) => {
          if (!piece) return null;
          const x = square % 9;
          const y = Math.floor(square / 9);
          const displayX = orientation === "black" ? 8 - x : x;
          const displayY = orientation === "black" ? 9 - y : y;
          return (
            <g
              key={square}
              className={`xq-board-piece xq-board-piece-${piece.side}${ghost?.from === square ? " xq-board-drag-source" : ""}`}
              role="img"
              aria-hidden={interactive || undefined}
              aria-label={`${names[piece.type]} ${piece.side === "red" ? "đỏ" : "đen"}, cột ${x + 1} hàng ${y + 1}`}
              transform={`translate(${24 + displayX * 40} ${24 + displayY * 40})`}
            >
              <circle className="xq-board-piece-face" r="17.6" />
              {piece.side === "black" && (
                <circle className="xq-board-piece-inner" r="14.5" />
              )}
              <text className="xq-board-piece-glyph" aria-hidden="true">
                {glyphs[piece.side][piece.type]}
              </text>
            </g>
          );
        })}
        {ghost &&
          (() => {
            const piece = position.board[ghost.from];
            if (!piece) return null;
            return (
              <g aria-hidden="true" clipPath={`url(#${clipId})`}>
                <g
                  className={`xq-board-piece xq-board-piece-${piece.side} xq-board-ghost${ghost.returning ? " xq-board-returning" : ""}`}
                  transform={`translate(${ghost.x} ${ghost.y})`}
                >
                  <circle className="xq-board-piece-face" r="17.6" />
                  {piece.side === "black" && (
                    <circle className="xq-board-piece-inner" r="14.5" />
                  )}
                  <text className="xq-board-piece-glyph">
                    {glyphs[piece.side][piece.type]}
                  </text>
                </g>
              </g>
            );
          })()}
        {interactive && (
          <g aria-label="Điều khiển giao điểm">
            {Array.from({ length: 90 }, (_, square) => {
              const [x, y] = point(square),
                piece = position.board[square];
              return (
                <rect
                  key={square}
                  ref={(node) => {
                    controls.current[square] = node;
                  }}
                  role="button"
                  aria-label={`${piece ? `${names[piece.type]} ${piece.side === "red" ? "đỏ" : "đen"}` : "Trống"}, cột ${(square % 9) + 1} hàng ${Math.floor(square / 9) + 1}`}
                  aria-pressed={selected === square && enabled}
                  aria-disabled={!enabled}
                  data-legal={destinations.includes(square)}
                  className="xq-board-hit"
                  x={x - 20}
                  y={y - 20}
                  width="40"
                  height="40"
                  tabIndex={focused === square ? 0 : -1}
                  onFocus={() => setFocused(square)}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    setFocused(square);
                    controls.current[square]?.focus();
                    choose(square);
                  }}
                  onKeyDown={(event) => keyboard(event, square)}
                />
              );
            })}
          </g>
        )}
      </svg>
      <figcaption
        className="xq-board-turn"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span aria-hidden="true">▸</span> Lượt:{" "}
        {position.turn === "red" ? "Đỏ" : "Đen"}
        {pending && <span> · Đang gửi nước…</span>}
        {checks.length > 0 && (
          <span>
            {" "}
            · <span aria-hidden="true">⚠</span> Đang bị chiếu
          </span>
        )}
      </figcaption>
      <details className="xq-board-legend">
        <summary>Chú giải quân</summary>
        <div className="xq-board-legend-sides">
          {(["red", "black"] as const).map((side) => (
            <ul key={side} aria-label={`Quân ${side === "red" ? "đỏ" : "đen"}`}>
              {pieceTypes.map((type) => (
                <li key={type}>
                  <span
                    className={`xq-board-legend-glyph xq-board-piece-${side}`}
                    aria-hidden="true"
                  >
                    {glyphs[side][type]}
                  </span>
                  {names[type]} {side === "red" ? "đỏ" : "đen"}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </details>
    </figure>
  );
}
