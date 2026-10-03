# [US-SOC-01] Chat 1-1 (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [L](../epics/L.md) · Xã hội mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 5.2, 5.5, 8.2 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-SOC-01-01** — Chỉ hai tài khoản đang ACCEPTED truy cập hội thoại; người ngoài hoặc Khách gọi trực tiếp phải bị chặn, không trả tin rồi ẩn ở UI.
* **AC-SOC-01-02** — Gửi/nhận văn bản và sticker theo giới hạn/lọc BA 5.3; tin lưu bền và có huy hiệu chưa đọc, không bị xoá do đóng một phòng chơi.
* **AC-SOC-01-03** — Huỷ kết bạn lập tức mất quyền gửi/đọc, lịch sử giữ nhưng ẩn; kết bạn lại hiện lịch sử đó, không tạo hội thoại trùng cho cặp đảo chiều.
* **AC-SOC-01-04** — Lỗi gửi không hiện đã gửi; truy lại cùng định danh tin khi mất xác nhận không nhân đôi tin. Lỗi tải lịch sử giữ dữ liệu đang xem, có Thử lại.
* **AC-SOC-01-05** — Badge đếm tổng tin đến chưa đọc từ bạn hiện tại, không tin mình gửi. Tin vào vùng nhìn hội thoại ở tab hoạt động mới đánh dấu đọc; tải nền không đánh dấu. Đồng bộ giữa thiết bị; huỷ bạn loại khỏi badge nhưng giữ trạng thái đọc, kết bạn lại tính lại tin còn chưa đọc (BA 5.2).

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
