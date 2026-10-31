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
import { BoardDefs } from "./BoardDefs.js";
import { BoardGrid } from "./BoardGrid.js";
import { glyphs, PieceContent } from "./PieceContent.js";
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

/**
 * Component hiển thị và tương tác bàn cờ Tướng (hỗ trợ kéo thả, nhấp chọn nước đi, chiếu tướng và trợ năng).
 */
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
  const justDropped = useRef(false);
  const prevLastMoveRef = useRef<Move | null>(null);
  const [slidingMove, setSlidingMove] = useState<{
    from: number;
    to: number;
    dx: number;
    dy: number;
  } | null>(null);

  const fen = useMemo(() => serializePosition(position), [position]);

  useEffect(() => {
    if (
      !disabled &&
      lastMove &&
      (lastMove.from !== prevLastMoveRef.current?.from ||
        lastMove.to !== prevLastMoveRef.current?.to)
    ) {
      if (justDropped.current) {
        justDropped.current = false;
      } else {
        const [fromX, fromY] = point(lastMove.from);
        const [toX, toY] = point(lastMove.to);
        setSlidingMove({
          from: lastMove.from,
          to: lastMove.to,
          dx: fromX - toX,
          dy: fromY - toY,
        });
        const timer = setTimeout(() => {
          setSlidingMove(null);
        }, 280);
        prevLastMoveRef.current = lastMove;
        return () => clearTimeout(timer);
      }
      prevLastMoveRef.current = lastMove;
    }
  }, [lastMove, orientation]);
  const moves = useMemo(
    () => (enabled ? legalMoves(position) : []),
    [enabled, fen],
  );
  const destinations = useMemo(
    () => moves.filter((move) => move.from === selected).map((move) => move.to),
    [moves, selected],
  );
  const checks = useMemo(
    () =>
      (["red", "black"] as const).filter((side) => isInCheck(position, side)),
    [fen],
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
      justDropped.current = true;
      setGhost(null);
      onMove?.(current.from, to);
      return;
    }
    const [x, y] = point(current.from);
    setGhost({ from: current.from, x, y, returning: true });
    returnTimer.current = setTimeout(() => {
      setGhost(null);
      returnTimer.current = null;
    }, 240);
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
    // Bấm quân mình khác thì chuyển chọn ngay (YC4 mục 16); bấm lại quân đang chọn hoặc ô sai thì bỏ chọn.
    if (position.board[square]?.side === playerSide && square !== selected) {
      setSelected(square);
      return;
    }
    if (selected !== null) setSelected(null);
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
  const boardFrameId = `${id}-board-frame`;
  const pieceWoodId = `${id}-piece-wood`;
  const pieceRimId = `${id}-piece-rim`;
  const pieceGrooveId = `${id}-piece-groove`;
  const pieceShadowId = `${id}-piece-shadow`;
  const pieceLiftedShadowId = `${id}-piece-shadow-lifted`;
  const selectedGlowId = `${id}-selected-glow`;
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
          9 cột, 10 hàng giao điểm. Quân cờ tiện gỗ 3D chạm khắc tinh xảo. Nhãn
          quân dùng tọa độ gốc.
        </desc>
        <BoardDefs
          clipId={clipId}
          pieceShadowId={pieceShadowId}
          pieceLiftedShadowId={pieceLiftedShadowId}
          selectedGlowId={selectedGlowId}
          boardFrameId={boardFrameId}
          woodId={woodId}
          pieceWoodId={pieceWoodId}
          pieceRimId={pieceRimId}
          pieceGrooveId={pieceGrooveId}
        />
        <BoardGrid woodId={woodId} boardFrameId={boardFrameId} />
        <g aria-hidden="true" className="xq-board-signs">
          {lastMove &&
            (() => {
              const [fromX, fromY] = point(lastMove.from);
              const [toX, toY] = point(lastMove.to);
              return (
                <g className="xq-board-last-indicators">
                  <g
                    className="xq-board-last"
                    transform={`translate(${fromX} ${fromY})`}
                  >
                    <path
                      className="xq-board-last-corners"
                      d="M-11-18H-18V-11M11-18H18V-11M18 11V18H11M-11 18H-18V11"
                    />
                  </g>
                  <g
                    className="xq-board-last"
                    transform={`translate(${toX} ${toY})`}
                  >
                    <path
                      className="xq-board-last-corners"
                      d="M-11-18H-18V-11M11-18H18V-11M18 11V18H11M-11 18H-18V11"
                    />
                  </g>
                </g>
              );
            })()}
          {destinations.map((square) => {
            const [x, y] = point(square);
            const isCapture = Boolean(position.board[square]);
            return isCapture ? (
              <circle
                key={square}
                className="xq-board-capture"
                cx={x}
                cy={y}
                r="19"
              />
            ) : (
              <circle
                key={square}
                className="xq-board-hint-dot"
                cx={x}
                cy={y}
                r="4.8"
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
        {(() => {
          // Render regular pieces first, then the selected floating piece or sliding piece on top
          const piecesToRender: number[] = [];
          let topSquare: number | null = null;
          position.board.forEach((p, sq) => {
            if (!p) return;
            if (
              (selected === sq && enabled) ||
              (slidingMove !== null && slidingMove.to === sq)
            ) {
              topSquare = sq;
            } else {
              piecesToRender.push(sq);
            }
          });
          if (topSquare !== null) {
            piecesToRender.push(topSquare);
          }

          return piecesToRender.map((square) => {
            const piece = position.board[square];
            if (!piece) return null;
            const x = square % 9;
            const y = Math.floor(square / 9);
            const displayX = orientation === "black" ? 8 - x : x;
            const displayY = orientation === "black" ? 9 - y : y;
            const isSelected = selected === square && enabled;
            const isSliding = slidingMove !== null && slidingMove.to === square;
            const isSource = ghost?.from === square;
            const slideStyle = isSliding
              ? ({
                  "--slide-dx": `${slidingMove.dx}px`,
                  "--slide-dy": `${slidingMove.dy}px`,
                } as React.CSSProperties)
              : undefined;

            return (
              <g
                key={square}
                className={`xq-board-piece-anchor${isSource ? " xq-board-drag-source" : ""}`}
                transform={`translate(${24 + displayX * 40} ${24 + displayY * 40})`}
                role="img"
                aria-hidden={interactive || undefined}
                aria-label={`${names[piece.type]} ${piece.side === "red" ? "đỏ" : "đen"}, cột ${x + 1} hàng ${y + 1}`}
              >
                <g
                  className={`xq-board-piece xq-board-piece-${piece.side}${isSelected ? " xq-board-piece-selected" : ""}${isSliding ? " xq-board-piece-slide" : ""}`}
                  style={slideStyle}
                  filter={
                    isSelected || isSliding
                      ? `url(#${pieceLiftedShadowId})`
                      : `url(#${pieceShadowId})`
                  }
                >
                  <PieceContent
                    side={piece.side}
                    type={piece.type}
                    woodId={pieceWoodId}
                    rimId={pieceRimId}
                    grooveId={pieceGrooveId}
                  />
                </g>
              </g>
            );
          });
        })()}
        {ghost &&
          (() => {
            const piece = position.board[ghost.from];
            if (!piece) return null;
            return (
              <g aria-hidden="true" clipPath={`url(#${clipId})`}>
                <g
                  className={`xq-board-piece xq-board-piece-${piece.side} xq-board-ghost${ghost.returning ? " xq-board-returning" : ""}`}
                  transform={`translate(${ghost.x} ${ghost.y})`}
                  filter={`url(#${pieceLiftedShadowId})`}
                >
                  <PieceContent
                    side={piece.side}
                    type={piece.type}
                    woodId={pieceWoodId}
                    rimId={pieceRimId}
                    grooveId={pieceGrooveId}
                  />
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
                  style={{ outline: "none", stroke: "none" }}
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
