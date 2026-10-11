// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialPosition, parsePosition } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "./XiangqiBoard.js";
import type { Position, Side } from "@xiangqi/xiangqi-core";
import {
  cleanup,
  render as renderDom,
  screen,
  fireEvent,
} from "@testing-library/react";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function pointerFixture(orientation: Side) {
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    constructor(type: string, init: PointerEventInit) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  const move = vi.fn(),
    view = renderDom(
      createElement(XiangqiBoard, {
        position: initialPosition(),
        orientation,
        playerSide: "red",
        onMove: move,
      }),
    );
  const svg = view.container.querySelector("svg")!;
  Object.defineProperty(svg, "getScreenCTM", {
    value: () => ({
      inverse: () => ({ a: 0.5, b: 0, c: 0, d: 0.5, e: -10, f: -20 }),
    }),
  });
  Object.defineProperty(svg, "setPointerCapture", { value: vi.fn() });
  Object.defineProperty(svg, "releasePointerCapture", { value: vi.fn() });
  Object.defineProperty(svg, "hasPointerCapture", { value: () => true });
  return { move, svg, view };
}
it.each(["red", "black"] as const)(
  "mouse drag in %s orientation maps scaled SVG coordinates and sends only canonical intent",
  (orientation) => {
    const { move, svg } = pointerFixture(orientation);
    const from =
      orientation === "red"
        ? { clientX: 68, clientY: 568 }
        : { clientX: 708, clientY: 328 };
    const to =
      orientation === "red"
        ? { clientX: 68, clientY: 488 }
        : { clientX: 708, clientY: 408 };
    fireEvent.pointerDown(svg, { ...from, pointerId: 7 });
    fireEvent.pointerMove(svg, { ...to, pointerId: 7 });
    fireEvent.pointerUp(svg, { ...to, pointerId: 7 });
    expect(move).toHaveBeenCalledExactlyOnceWith(54, 45);
    expect(
      screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
    ).toBeTruthy();
  },
);
it("touch drag outside the board and pointercancel keep the position and do not send", () => {
  const { move, svg } = pointerFixture("red");
  fireEvent.pointerDown(svg, {
    clientX: 68,
    clientY: 568,
    pointerId: 4,
    pointerType: "touch",
  });
  fireEvent.pointerMove(svg, {
    clientX: -30,
    clientY: 200,
    pointerId: 4,
    pointerType: "touch",
  });
  fireEvent.pointerUp(svg, {
    clientX: -30,
    clientY: 200,
    pointerId: 4,
    pointerType: "touch",
  });
  expect(move).not.toHaveBeenCalled();
  fireEvent.pointerDown(svg, {
    clientX: 68,
    clientY: 568,
    pointerId: 5,
    pointerType: "touch",
  });
  fireEvent.pointerMove(svg, {
    clientX: 68,
    clientY: 488,
    pointerId: 5,
    pointerType: "touch",
  });
  fireEvent.pointerCancel(svg, { pointerId: 5, pointerType: "touch" });
  expect(move).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it("touch drag accepts the legal move and ignores the following compatibility click", () => {
  const { move, svg } = pointerFixture("red");
  fireEvent.pointerDown(svg, {
    clientX: 68,
    clientY: 568,
    pointerId: 11,
    pointerType: "touch",
  });
  fireEvent.pointerMove(svg, {
    clientX: 68,
    clientY: 488,
    pointerId: 11,
    pointerType: "touch",
  });
  fireEvent.pointerUp(svg, {
    clientX: 68,
    clientY: 488,
    pointerId: 11,
    pointerType: "touch",
  });
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  expect(move).toHaveBeenCalledExactlyOnceWith(54, 45);
});
it("Escape during a captured drag cancels the request", () => {
  const { move, svg } = pointerFixture("red");
  fireEvent.pointerDown(svg, { clientX: 68, clientY: 568, pointerId: 8 });
  fireEvent.pointerMove(svg, { clientX: 68, clientY: 488, pointerId: 8 });
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
    { key: "Escape" },
  );
  fireEvent.pointerUp(svg, { clientX: 68, clientY: 488, pointerId: 8 });
  expect(move).not.toHaveBeenCalled();
});
it("a new canonical position invalidates an old drag without sending it", () => {
  const { move, svg, view } = pointerFixture("red");
  fireEvent.pointerDown(svg, { clientX: 68, clientY: 568, pointerId: 9 });
  fireEvent.pointerMove(svg, { clientX: 68, clientY: 488, pointerId: 9 });
  view.rerender(
    createElement(XiangqiBoard, {
      position: { ...initialPosition(), turn: "black" },
      onMove: move,
    }),
  );
  fireEvent.pointerUp(svg, { clientX: 68, clientY: 488, pointerId: 9 });
  expect(move).not.toHaveBeenCalled();
});
it.each(["red", "black"] as const)(
  "keyboard visual arrows submit the same canonical pawn move in %s orientation",
  (orientation) => {
    const move = vi.fn();
    renderDom(
      createElement(XiangqiBoard, {
        position: initialPosition(),
        orientation,
        playerSide: "red",
        onMove: move,
      }),
    );
    const pawn = screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" });
    pawn.focus();
    fireEvent.keyDown(pawn, { key: "Enter" });
    fireEvent.keyDown(pawn, {
      key: orientation === "red" ? "ArrowUp" : "ArrowDown",
    });
    const destination = screen.getByRole("button", {
      name: "Trống, cột 1 hàng 6",
    });
    expect(document.activeElement).toBe(destination);
    fireEvent.keyDown(destination, { key: " " });
    expect(move).toHaveBeenCalledExactlyOnceWith(54, 45);
  },
);
it("marks cannon captures from legal core and preserves previous-move and check information for spectators", () => {
  const view = renderDom(
    createElement(XiangqiBoard, {
      position: initialPosition(),
      onMove: vi.fn(),
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Pháo đỏ, cột 2 hàng 8" }),
  );
  expect(
    screen
      .getByRole("button", { name: "Mã đen, cột 2 hàng 1" })
      .getAttribute("data-legal"),
  ).toBe("true");
  expect(
    view.container.querySelectorAll(".xq-board-capture").length,
  ).toBeGreaterThan(0);
  view.rerender(
    createElement(XiangqiBoard, {
      position: parsePosition("4k4/9/9/9/9/9/9/9/4r4/4K4 w - - 0 1"),
      orientation: "black",
      lastMove: { from: 54, to: 45 },
    }),
  );
  expect(screen.getByText(/Đang bị chiếu/)).toBeTruthy();
  expect(view.container.querySelectorAll(".xq-board-check")).toHaveLength(1);
  const markers = view.container.querySelectorAll(".xq-board-last");
  expect(markers).toHaveLength(2);
  expect(markers[0]!.getAttribute("transform")).toBe("translate(344 144)");
  expect(markers[1]!.getAttribute("transform")).toBe("translate(344 184)");
  expect(screen.queryByRole("button")).toBeNull();
});
it("selects legal pawn targets, sends intent, and keeps the canonical piece at its source", () => {
  const move = vi.fn();
  renderDom(
    createElement(XiangqiBoard, { position: initialPosition(), onMove: move }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  expect(
    screen
      .getByRole("button", { name: "Trống, cột 1 hàng 6" })
      .getAttribute("data-legal"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  expect(move).toHaveBeenCalledExactlyOnceWith(54, 45);
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it("cancels selected pieces through repeated click, invalid target and Escape", () => {
  renderDom(
    createElement(XiangqiBoard, {
      position: initialPosition(),
      onMove: vi.fn(),
    }),
  );
  const pawn = screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" });
  fireEvent.click(pawn);
  expect(pawn.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(pawn);
  expect(pawn.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(pawn);
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 2 hàng 6" }));
  expect(pawn.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(pawn);
  fireEvent.keyDown(pawn, { key: "Escape" });
  expect(pawn.getAttribute("aria-pressed")).toBe("false");
});
it("prevents selection for disabled, pending or the wrong side", () => {
  const move = vi.fn();
  const view = renderDom(
    createElement(XiangqiBoard, {
      position: initialPosition(),
      onMove: move,
      pending: true,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  expect(move).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  view.rerender(
    createElement(XiangqiBoard, {
      position: initialPosition(),
      onMove: move,
      orientation: "black",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Tốt đen, cột 1 hàng 4" }),
  );
  expect(
    screen
      .getByRole("button", { name: "Tốt đen, cột 1 hàng 4" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  view.rerender(
    createElement(XiangqiBoard, {
      position: initialPosition(),
      onMove: move,
      disabled: true,
    }),
  );
  expect(screen.queryByRole("button")).toBeNull();
});

function render(position = initialPosition(), orientation?: Side): string {
  return renderToStaticMarkup(
    createElement(XiangqiBoard, { position, orientation }),
  );
}

function pieces(markup: string) {
  return [...markup.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/g)]
    .filter((match) => /role="img"/.test(match[1]!))
    .map((match) => ({
      label: match[1]!.match(/aria-label="([^"]*)"/)?.[1],
      transform: match[1]!.match(/transform="([^"]*)"/)?.[1],
      circles: (match[2]!.match(/<circle\b/g) ?? []).length,
      content: match[2]!,
    }));
}

describe("T11 SVG board display", () => {
  it("renders all 32 opening pieces with the specified Han glyphs and original labels", () => {
    const rendered = pieces(render());
    expect(rendered).toHaveLength(32);
    expect(
      rendered.filter((piece) => piece.label?.includes("đỏ")),
    ).toHaveLength(16);
    expect(
      rendered.filter((piece) => piece.label?.includes("đen")),
    ).toHaveLength(16);
    for (const [side, glyphs] of [
      ["đỏ", "俥傌相仕帥仕相傌俥"],
      ["đen", "車馬象士將士象馬車"],
    ]) {
      const row = rendered.filter(
        (piece) =>
          piece.label?.includes(side!) &&
          piece.label.endsWith(side === "đỏ" ? "hàng 10" : "hàng 1"),
      );
      expect(
        row
          .map((piece) => piece.content.match(/<text[^>]*>(.*?)<\/text>/)?.[1])
          .join(""),
      ).toBe(glyphs);
    }
    expect(
      rendered.find((piece) => piece.label === "Pháo đỏ, cột 2 hàng 8")
        ?.content,
    ).toContain("炮");
    expect(
      rendered.find((piece) => piece.label === "Pháo đen, cột 8 hàng 3")
        ?.content,
    ).toContain("砲");
    expect(
      rendered.find((piece) => piece.label === "Tốt đỏ, cột 1 hàng 7")?.content,
    ).toContain("兵");
    expect(
      rendered.find((piece) => piece.label === "Tốt đen, cột 9 hàng 4")
        ?.content,
    ).toContain("卒");
  });

  it("puts Red at the bottom by default, including the spectator view", () => {
    const rendered = pieces(render());
    expect(
      rendered.find((piece) => piece.label === "Xe đỏ, cột 1 hàng 10")
        ?.transform,
    ).toBe("translate(24 384)");
    expect(
      rendered.find((piece) => piece.label === "Tướng đen, cột 5 hàng 1")
        ?.transform,
    ).toBe("translate(184 24)");
    expect(render(initialPosition(), "red")).toContain("Đỏ ở phía dưới");
  });

  it("flips displayed coordinates for Black while preserving input and original-coordinate labels", () => {
    const position = initialPosition();
    const before = structuredClone(position);
    const markup = render(position, "black");
    const rendered = pieces(markup);
    expect(
      rendered.find((piece) => piece.label === "Xe đen, cột 1 hàng 1")
        ?.transform,
    ).toBe("translate(344 384)");
    expect(
      rendered.find((piece) => piece.label === "Tướng đỏ, cột 5 hàng 10")
        ?.transform,
    ).toBe("translate(184 24)");
    expect(position).toEqual(before);
    expect(markup).toContain("Đen ở phía dưới");
    expect(markup).not.toContain("rotate(");
  });

  it("draws the river, ten ranks, split inner files and two crossed palaces", () => {
    const markup = render();
    expect(markup).toContain('viewBox="0 0 368 408"');
    expect(markup).toContain("楚河");
    expect(markup).toContain("漢界");
    expect(markup.match(/class="xq-board-rank"/g) ?? []).toHaveLength(10);
    expect(markup.match(/class="xq-board-file"/g) ?? []).toHaveLength(16);
    expect(markup.match(/class="xq-board-palace"/g) ?? []).toHaveLength(2);
  });

  it("distinguishes sides with one and two rings and announces the turn in Vietnamese", () => {
    const markup = render();
    for (const piece of pieces(markup)) {
      expect(piece.circles).toBe(piece.label?.includes("đỏ") ? 1 : 2);
    }
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Lượt: Đỏ");
    expect(render({ ...initialPosition(), turn: "black" })).toContain(
      "Lượt: Đen",
    );
    expect(markup).not.toMatch(/tabindex=|draggable=|role="button"/);
  });

  it("updates from an opening to a midgame with captured pieces removed and correct turn", () => {
    const midgame: Position = parsePosition(
      "3k5/9/5r3/9/9/5c3/5N3/9/9/3C1K3 b - - 20 11",
    );
    const rendered = pieces(render(midgame));
    expect(rendered).toHaveLength(6);
    expect(
      rendered.some((piece) => piece.label === "Xe đỏ, cột 1 hàng 10"),
    ).toBe(false);
    expect(
      rendered.find((piece) => piece.label === "Mã đỏ, cột 6 hàng 7")
        ?.transform,
    ).toBe("translate(224 264)");
    expect(render(midgame)).toContain("Lượt: Đen");
  });
});

it("selects a captured no-movement click even when Chrome retargets click to the SVG", () => {
  const { svg } = pointerFixture("red");
  fireEvent.pointerDown(svg, { clientX: 68, clientY: 568, pointerId: 12 });
  fireEvent.pointerUp(svg, { clientX: 68, clientY: 568, pointerId: 12 });
  fireEvent.click(svg);
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen
      .getByRole("button", { name: "Trống, cột 1 hàng 6" })
      .getAttribute("data-legal"),
  ).toBe("true");
});
