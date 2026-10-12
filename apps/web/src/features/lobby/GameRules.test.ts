// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameRules } from "./GameRules.js";
afterEach(cleanup);
it("uses an inline native disclosure with a keyboard-focusable Vietnamese label", async () => {
  const { container } = render(createElement(GameRules));
  const disclosure = container.querySelector("details")!;
  const summary = screen.getByText("Luật chơi");
  expect(summary.tagName).toBe("SUMMARY");
  expect(disclosure.open).toBe(false);
  await userEvent.setup().tab();
  expect(document.activeElement).toBe(summary);
  await userEvent.setup().click(summary);
  expect(disclosure.open).toBe(true);
  await userEvent.setup().click(summary);
  expect(disclosure.open).toBe(false);
  expect(container.querySelector("dialog")).toBeNull();
  expect(container.querySelector("a")).toBeNull();
});
it.each([
  ["Tướng", /một giao điểm ngang hoặc dọc.*trong cung/s],
  ["Sĩ", /một giao điểm chéo.*trong cung/s],
  ["Tượng", /hai giao điểm chéo.*không qua sông.*mắt Tượng/s],
  ["Xe", /ngang hoặc dọc.*không nhảy qua quân/s],
  ["Mã", /hai giao điểm.*một giao điểm.*chân Mã/s],
  ["Pháo", /không ăn.*không có quân chắn.*ăn.*đúng một quân.*ngòi/s],
  ["Tốt/Binh", /một giao điểm.*trước.*qua sông.*ngang.*không.*lùi/s],
])("teaches %s movement and restrictions", (name, rule) => {
  render(createElement(GameRules));
  const title = screen.getByText(name);
  expect(title.closest("li")!.textContent).toMatch(rule);
});
it("states king safety and decisive losses rather than stalemate draw", () => {
  render(createElement(GameRules));
  expect(screen.getByText(/Không được để Tướng của bạn bị chiếu/)).toBeTruthy();
  expect(screen.getByText(/Hai Tướng không được đối mặt/)).toBeTruthy();
  expect(
    screen.getByText(
      /Chiếu hết: bên bị chiếu không còn nước hợp lệ để thoát chiếu sẽ thua/,
    ),
  ).toBeTruthy();
  expect(
    screen.getByText(
      /Hết nước đi: bên tới lượt không có nước đi hợp lệ sẽ thua, kể cả khi không bị chiếu/,
    ),
  ).toBeTruthy();
});
it("defines the third-occurrence cycle with side to move and all own checking moves", () => {
  render(createElement(GameRules));
  expect(
    screen.getByText(/vị trí của mọi quân giống hệt và cùng một bên tới lượt/),
  ).toBeTruthy();
  expect(
    screen.getByText(
      /Chu kỳ lặp tính từ lần xuất hiện thứ nhất đến lần thứ ba/,
    ),
  ).toBeTruthy();
  expect(
    screen.getByText(
      /mọi nước của một bên trong chu kỳ đều là nước chiếu.*bên đó thua.*cả hai bên.*hòa/s,
    ),
  ).toBeTruthy();
  expect(screen.getByText(/Đuổi quân liên tục không xử riêng/)).toBeTruthy();
});
it("separates half-move noncapture draw and result priority", () => {
  render(createElement(GameRules));
  expect(
    screen.getByText(
      /120 nửa nước liên tiếp.*mỗi bên 60 nước.*không ăn quân.*hòa/s,
    ),
  ).toBeTruthy();
  expect(
    screen.getByText(
      /Chiếu hết được ưu tiên cao nhất.*hết nước đi hoặc chiếu liên tục.*120 nửa nước/s,
    ),
  ).toBeTruthy();
});
it("explains proposals without promising undo or Ranked features", () => {
  render(createElement(GameRules));
  expect(
    screen.getByText(/30 giây.*5 nước tiếp theo của chính mình/s),
  ).toBeTruthy();
  expect(
    screen.getByText(/X hoặc Esc chỉ thu gọn.*đồng hồ vẫn chạy/s),
  ).toBeTruthy();
  expect(screen.getByText(/Đầu hàng.*thua ngay/s)).toBeTruthy();
  expect(screen.getByText(/Hết giờ.*thua.*trước khi.*nước đi/s)).toBeTruthy();
  expect(screen.getByText(/Mất kết nối.*60 giây.*thua/s)).toBeTruthy();
  expect(
    screen.getByText(
      /máy chủ gián đoạn.*không có người thắng và không phải hòa/s,
    ),
  ).toBeTruthy();
  expect(screen.queryByText(/Ranked|Elo|Xin đi lại/)).toBeNull();
  expect(
    screen.getByText(
      "Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức",
    ),
  ).toBeTruthy();
});
