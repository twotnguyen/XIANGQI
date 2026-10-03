# [US-RANK-01] Ghép trận Ranked (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 7.1, 7.2 |

## Mô tả và tiêu chí chính

nút *Tìm trận Xếp hạng* mở `MODAL-MATCHMAKING`; biên độ Elo ban đầu ≤ 100, mở thêm ±50 mỗi 10 giây, **dừng ở 60 giây** (±400); hai người có biên độ khác nhau thì dùng biên độ lớn hơn; quá 60 giây báo *"Chưa tìm được đối thủ phù hợp, hãy thử lại sau"* (không ghép với máy); *Hủy tìm trận* tự do khi chưa tìm thấy, khoá khi `MATCH_FOUND`; hàng đợi mất khi khởi động lại (báo *"Hàng đợi đã bị huỷ"*); cặp đã đủ 3 ván/24 giờ bị bỏ qua âm thầm.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2. Tiêu chí nghiệm thu chi tiết bổ sung lúc đó từ nguồn luật ở trên.
