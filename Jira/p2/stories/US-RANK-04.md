# [US-RANK-04] Bảng xếp hạng (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [J](../epics/J.md) · Đánh Hạng |
| Nhãn | `P2` |
| Nguồn luật | BA 7.1 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-RANK-04-01** — Chỉ xếp tài khoản có ít nhất 5 ván Đánh Hạng hoàn tất; không Khách, không tính CASUAL/AI hoặc ván gián đoạn vào điều kiện.
* **AC-RANK-04-02** — Trả Top 50 theo Elo giảm dần; bằng thì số thắng giảm dần, thời điểm đạt Elo sớm hơn, cuối cùng user_id tăng dần.
* **AC-RANK-04-03** — Dòng ghim chính mình phản ánh thứ hạng toàn bảng kể cả ngoài Top 50; chưa đủ thì ghi Chưa xếp hạng — cần thêm X ván với X = 5 − số ván hoàn tất.
* **AC-RANK-04-04** — Không bộ lọc ngày/tuần/mùa hoặc reset mùa; không có kết quả thì trạng thái EMPTY, lỗi tải có Thử lại không bịa hạng 0.
* **AC-RANK-04-05** — Thẻ tóm tắt chỉ thông tin công khai và thống kê Đánh Hạng; không tiết lộ email hoặc lịch sử riêng tư.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
