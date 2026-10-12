// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoomQr } from "./RoomQr.js";

afterEach(() => cleanup());

const url = "https://xiangqi.example.invalid/rooms/join?token=K7M2XQP4";

describe("room QR invitation", () => {
  it("encodes the current invite link and never grants extra permissions", () => {
    render(createElement(RoomQr, { url, code: "K7M2XQP4" }));
    const svg = screen.getByRole("img", {
      name: "QR mời vào phòng, mã K7M2XQP4",
    });
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(
      screen.getByText("không cấp quyền chơi hoặc xem riêng", { exact: false }),
    ).toBeTruthy();
  });
  it("renders a real QR matrix, not an empty placeholder", () => {
    render(createElement(RoomQr, { url, code: "K7M2XQP4" }));
    const svg = document.querySelector(".xq-room-qr-code svg")!;
    // qrcode.react draws the matrix as long path data; a placeholder would be empty.
    const lengths = Array.from(svg.querySelectorAll("path")).map(
      (node) => (node.getAttribute("d") ?? "").length,
    );
    expect(Math.max(...lengths)).toBeGreaterThan(200);
    expect(svg.getAttribute("viewBox")).toBe("0 0 33 33");
  });
  it("downloads the SVG with the room code and copies the link", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const createUrl = vi.fn(() => "blob:qr");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createUrl,
    });
    const revoke = vi.fn();
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revoke,
    });
    const original = document.createElement.bind(document);
    const clicked: string[] = [];
    const spy = vi.spyOn(document, "createElement").mockImplementation(((
      tag: string,
      options?: ElementCreationOptions,
    ) => {
      const node = original(tag as keyof HTMLElementTagNameMap, options);
      if (tag === "a")
        (node as HTMLAnchorElement).click = () =>
          clicked.push((node as HTMLAnchorElement).download);
      return node;
    }) as typeof document.createElement);
    render(createElement(RoomQr, { url, code: "K7M2XQP4" }));
    await user.click(screen.getByRole("button", { name: "Tải ảnh QR" }));
    expect(createUrl).toHaveBeenCalledOnce();
    expect(clicked).toEqual(["xiangqi-K7M2XQP4.svg"]);
    expect(revoke).toHaveBeenCalledWith("blob:qr");
    await user.click(screen.getByRole("button", { name: "Sao chép liên kết" }));
    expect(writeText).toHaveBeenCalledWith(url);
    expect(await screen.findByText("Đã sao chép liên kết mời.")).toBeTruthy();
    spy.mockRestore();
  });
});
