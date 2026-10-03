# [US-HIS-03] Đi lại với máy (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [M](../epics/M.md) · Lịch sử, xem lại, xuất dữ liệu |
| Nhãn | `P2` |
| Nguồn luật | BA 6.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-HIS-03-01** — Chỉ AI đang chơi ở P2, tối đa ba lần thành công; không cần máy đồng ý.
* **AC-HIS-03-02** — Máy đã đáp thì lùi cặp hai nửa nước về lượt người chơi; máy đang nghĩ thì huỷ tác vụ và chỉ lùi nước vừa đi của người chơi, vẫn tính một lượt.
* **AC-HIS-03-03** — Chưa có nước của người chơi (kể cả cầm Đen máy mới khai cuộc) hoặc ván đã kết thúc thì DISABLED kèm lý do.
* **AC-HIS-03-04** — Lệnh trùng không trừ thêm lượt; kết quả tìm cũ đến sau huỷ không áp dụng; phục hồi bộ đếm lặp/không ăn quân theo nhánh hiệu lực.
* **AC-HIS-03-05** — Hiện Lượt đi lại: X/3 nhất quán với số lượt đã dùng; hết ba lượt không nhận yêu cầu thứ tư ở máy chủ.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
