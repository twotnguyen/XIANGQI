# [US-RANK-03] Elo và cấp bậc (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 7.1, 7.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-RANK-03-01** — Khởi tạo 1200; tính FIDE theo BA 7.1, K lấy riêng từng người từ số ván hoàn tất trước ván: ván 30 K=32, ván 31 K=16.
* **AC-RANK-03-02** — Elo mới mỗi bên tính từ Elo trước ván; làm tròn gần nhất, .5 lên trên, sau đó sàn 100. Hai K khác nhau hoặc sàn có thể làm tổng biến động khác 0.
* **AC-RANK-03-03** — Kết quả thắng/thua/hoà của ván RANKED hoàn tất cập nhật Elo, thống kê, mốc đạt Elo trong cùng giao dịch, lặp xử lý cùng ván không cập nhật lần hai.
* **AC-RANK-03-04** — INTERRUPTED/ABANDONED không đổi Elo, không đếm ván hoàn tất; CASUAL/AI không đổi Elo. Không nhầm bộ đếm này với giới hạn cặp ghép.
* **AC-RANK-03-05** — Cấp bậc theo toàn bộ bảng khoảng Elo BA 7.1; chưa chơi ván Đánh Hạng nào hiện Chưa xếp hạng, không tự suy thứ hạng từ Elo khởi tạo.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
