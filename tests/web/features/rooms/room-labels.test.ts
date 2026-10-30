import { describe, expect, it } from "vitest";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  swapMessage,
  viewerActionMessage,
  visibilityLabel,
} from "@web/features/rooms/room-labels.js";

const generic =
  "Thao tác chưa thực hiện được. Kiểm tra trạng thái phòng rồi thử lại.";

describe("room labels", () => {
  it("names each room visibility in Vietnamese", () => {
    expect(visibilityLabel("PUBLIC")).toBe("Công khai");
    expect(visibilityLabel("CODE_ONLY")).toBe("Theo mã mời");
    expect(visibilityLabel("LOCKED")).toBe("Đã khóa");
  });

  it("explains every swap error code and falls back to the server message", () => {
    expect(swapMessage("SWAP_COOLDOWN", "x")).toBe(
      "Vừa bị từ chối hoặc hết hạn. Chờ 60 giây rồi gửi lại.",
    );
    expect(swapMessage("SWAP_ALREADY_PENDING", "x")).toBe(
      "Đang có đề nghị đổi bên chờ trả lời.",
    );
    expect(swapMessage("SWAP_EXPIRED", "x")).toBe(
      "Đề nghị đã hết hạn. Gửi đề nghị mới nếu muốn đổi bên.",
    );
    expect(swapMessage("SWAP_NOT_PENDING", "x")).toBe(
      "Không còn đề nghị đổi bên nào.",
    );
    expect(swapMessage("SWAP_STALE", "x")).toBe(
      "Thành phần phòng đã thay đổi. Đề nghị cũ đã huỷ.",
    );
    expect(swapMessage("SOMETHING_ELSE", "dự phòng")).toBe("dự phòng");
  });

  it.each([
    ["FRIEND_BUSY", "Người này đang ở trong một ván/phòng khác."],
    ["ALREADY_SEATED", "Bạn đang ở trong một ván/phòng khác."],
    ["ROOM_FULL", "Phòng đã đầy chỗ xem."],
    ["SEAT_FULL", "Ghế đã đủ hai người chơi."],
    ["HOST_STAYS", "Chủ phòng không tự chuyển xuống xem."],
    ["KICK_DENIED", "Chỉ người chơi được đuổi người xem."],
    ["SEAT_MOVE_DENIED", "Không thể đổi chỗ khi ván đang diễn ra."],
  ])("maps viewer action error %s", (code, message) => {
    expect(viewerActionMessage(new RoomRequestError(code, 409))).toBe(message);
  });

  it("uses the generic message for unknown codes and non-room errors", () => {
    expect(viewerActionMessage(new RoomRequestError("UNKNOWN", 500))).toBe(
      generic,
    );
    expect(viewerActionMessage(new Error("boom"))).toBe(generic);
    expect(viewerActionMessage("boom")).toBe(generic);
  });
});
