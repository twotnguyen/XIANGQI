import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialPosition, parsePosition } from "@xiangqi/xiangqi-core";
import { XiangqiBoard } from "./XiangqiBoard.js";
import type { Position, Side } from "@xiangqi/xiangqi-core";

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
