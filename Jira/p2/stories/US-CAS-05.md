# [US-CAS-05] Không giới hạn giờ và chống treo (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [K](../epics/K.md) · Đánh Thường mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 2.1, 3.3 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-CAS-05-01** — Không giới hạn là lựa chọn thứ tư chỉ của CASUAL; RANKED cố định 10 phút, AI không áp dụng chống treo này.
* **AC-CAS-05-02** — Bên tới lượt không đi 3 phút thì banner không modal đếm 30 giây; không giữ focus/che bàn hay nút Đầu hàng.
* **AC-CAS-05-03** — Tôi còn đây đặt lại 3 phút, tối đa hai lần liên tiếp khi chưa có nước mới; lần cảnh báo thứ ba không có nút đó.
* **AC-CAS-05-04** — Hết hạn không có nước hoặc xác nhận hợp lệ thì INACTIVITY thua; nước hợp lệ mới đặt lại chu kỳ. Lệnh đến sau kết thúc không hồi sinh ván.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
