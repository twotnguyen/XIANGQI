import { useState } from "react";
import { initialPosition, parsePosition } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "./XiangqiBoard.js";

const midgameFen =
  "r1ba1a3/4kn3/2n1b4/pNp1p1p1p/4c4/6P2/P1P2R2P/1CcC5/9/2BAKAB2 w - - 0 1";

/** Isolated display examples; no game commands, selection or server connection. */
export function BoardPreview() {
  const [example, setExample] = useState<"initial" | "midgame">("initial");
  const [view, setView] = useState<"red" | "black" | "spectator">("red");
  const position =
    example === "initial" ? initialPosition() : parsePosition(midgameFen);
  return (
    <div className="xq-board-preview">
      <header className="xq-board-preview-heading">
        <h1>Bàn cờ</h1>
        <p>Chữ Hán trên quân gỗ, hai góc nhìn cùng một thế cờ.</p>
      </header>
      <div className="xq-board-preview-options">
        <fieldset>
          <legend>Thế cờ</legend>
          <label>
            <input
              type="radio"
              name="position"
              checked={example === "initial"}
              onChange={() => setExample("initial")}
            />
            Khai cuộc
          </label>
          <label>
            <input
              type="radio"
              name="position"
              checked={example === "midgame"}
              onChange={() => setExample("midgame")}
            />
            Giữa ván
          </label>
        </fieldset>
        <fieldset>
          <legend>Góc nhìn</legend>
          <label>
            <input
              type="radio"
              name="view"
              checked={view === "red"}
              onChange={() => setView("red")}
            />
            Đỏ ở dưới
          </label>
          <label>
            <input
              type="radio"
              name="view"
              checked={view === "black"}
              onChange={() => setView("black")}
            />
            Đen ở dưới
          </label>
          <label>
            <input
              type="radio"
              name="view"
              checked={view === "spectator"}
              onChange={() => setView("spectator")}
            />
            Người xem
          </label>
        </fieldset>
      </div>
      <XiangqiBoard
        position={position}
        orientation={view === "black" ? "black" : "red"}
      />
    </div>
  );
}
