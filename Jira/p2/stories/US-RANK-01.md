# [US-RANK-01] Ghép trận Đánh Hạng (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 7.1, 7.2 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-RANK-01-01** — Chỉ tài khoản chính thức không chiếm vị trí chơi được tìm; cùng người không có hai vé hàng đợi hoạt động. MODAL-MATCHMAKING hiện thời gian và Huỷ.
* **AC-RANK-01-02** — Biên độ theo BA 7.2: ±100, thêm 50 mỗi 10 giây; ghép dùng biên độ lớn hơn của hai vé. Tại 60 giây thử lần cuối ±400 rồi mới hết hạn; không ghép với AI.
* **AC-RANK-01-03** — Cặp đã bắt đầu đủ 3 ván trong cửa sổ 24 giờ bị bỏ qua âm thầm; tính cả INTERRUPTED, dùng started_at theo BA 7.2, không dùng bộ đếm ván hoàn tất.
* **AC-RANK-01-04** — Huỷ thành công khi chưa MATCH_FOUND thì không tạo ván; nếu ghép thắng cuộc đua trước thì không huỷ, báo trạng thái đã tìm thấy. Hai người chỉ được ghép một lần.
* **AC-RANK-01-05** — Không có đối thủ thì báo Chưa tìm được đối thủ phù hợp, hãy thử lại sau; khởi động lại máy chủ huỷ vé và báo Hàng đợi đã bị huỷ; không khôi phục một vé ma.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
