// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentGallery } from "./ComponentGallery.js";
afterEach(() => cleanup());
it("switches among five distinguishable states and retries back to successful content", async () => {
  render(createElement(ComponentGallery));
  const user = userEvent.setup();
  const picker = within(
    screen.getByRole("group", { name: "Trạng thái minh họa" }),
  );
  await user.click(picker.getByRole("button", { name: "Đang tải" }));
  expect(screen.getByText("Đang tải dữ liệu…")).toBeTruthy();
  await user.click(picker.getByRole("button", { name: "Trống" }));
  expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy();
  await user.click(picker.getByRole("button", { name: "Lỗi" }));
  const error = screen
    .getByText("Chưa tải được dữ liệu minh họa.")
    .closest("section")!;
  await user.click(within(error).getByRole("button", { name: "Thử lại" }));
  expect(
    screen.getByText(
      "Danh sách đã sẵn sàng. Bạn có thể chọn phòng để vào chơi hoặc xem.",
    ),
  ).toBeTruthy();
  await user.click(picker.getByRole("button", { name: "Vô hiệu" }));
  expect(
    screen
      .getByRole("button", { name: "Mở danh sách" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
});
