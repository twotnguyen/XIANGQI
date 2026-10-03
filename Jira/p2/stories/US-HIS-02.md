# [US-HIS-02] Xem lại (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [M](../epics/M.md) · Lịch sử, xem lại, xuất dữ liệu |
| Nhãn | `P2` |
| Nguồn luật | BA 6.2 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-HIS-02-01** — Chỉ người chơi của ván đọc Replay từ Lịch sử; người xem/người ngoài không có link chia sẻ hay dữ liệu, kể cả RANKED.
* **AC-HIS-02-02** — Tái dựng từ thế đầu và chuỗi nước hiệu lực tới current_move_id; không phát các nhánh đã đi lại hoặc nước chưa lưu.
* **AC-HIS-02-03** — Các nút đầu/trước/sau/cuối, nhấp dòng nước nhảy đúng thế; đầu/cuối vô hiệu nút vượt biên kèm lý do.
* **AC-HIS-02-04** — Tự phát 1,5 giây/nước, dừng ở cuối; không có nước thì hiện thế đầu và trạng thái chưa có nước, không lỗi chỉ số.
* **AC-HIS-02-05** — Replay chỉ đọc: không đi quân, không sửa kết quả, không trừ/tăng Elo hoặc gửi lệnh ván thật.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
