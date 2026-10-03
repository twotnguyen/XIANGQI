# [US-RANK-05] Mất kết nối ở Đánh Hạng (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 8.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-RANK-05-01** — Trục thời gian 60 giây giữ nguyên luật online; đồng hồ ván vẫn chạy, TIMEOUT xảy ra trước hạn mất kết nối thì ưu tiên TIMEOUT.
* **AC-RANK-05-02** — Nối lại trong hạn nhận đầy đủ thế/giờ/phiên bản; quá hạn DISCONNECT thua và Elo cập nhật một lần.
* **AC-RANK-05-03** — Cả hai rớt nhưng máy chủ sống: nếu cùng quá hạn thì bên rớt trước thua; lỗi máy chủ của chính nó thì INTERRUPTED, không người thắng và không thay Elo.
* **AC-RANK-05-04** — Reconnect sau kết thúc chỉ nhận kết quả, không hồi sinh ván hoặc áp dụng lệnh cũ.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
