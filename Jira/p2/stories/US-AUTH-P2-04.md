# [US-AUTH-P2-04] Đổi username (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [I](../epics/I.md) · Tài khoản mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 1.6, 1.4 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-AUTH-P2-04-01** — Chính chủ thực hiện bốn bước: yêu cầu đổi → OTP email hiện tại → xác minh → nhập username mới; chưa OTP hợp lệ không được giữ/đổi tên.
* **AC-AUTH-P2-04-02** — Tên mới tuân cú pháp 3–20 ký tự và kiểm trùng không phân biệt hoa/thường; không giới hạn tần suất, email không cho đổi.
* **AC-AUTH-P2-04-03** — Sau đổi, tên cũ bị khoá 30 ngày cho chủ cũ; chính chủ lấy lại được trong thời hạn, người khác không được. Hết thời hạn tên có thể dùng lại nếu không có người đang giữ.
* **AC-AUTH-P2-04-04** — user_id bất biến; Elo, lịch sử, bạn bè, tin nhắn giữ nguyên. Tên cũ không còn là tên đăng nhập hiện tại.
* **AC-AUTH-P2-04-05** — Tên vừa bị lấy hoặc OTP hết hiệu lực thì không đổi dữ liệu; cập nhật tên/đặt giữ tên cũ cùng giao dịch để không có trạng thái nửa chừng.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
