# [US-AUTH-P2-03] Quên và đặt lại mật khẩu (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [I](../epics/I.md) · Tài khoản mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 1.7, 1.5 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-AUTH-P2-03-01** — Nhập email có/không có tài khoản đều nhận cùng thông báo Nếu email này đã đăng ký, mã khôi phục đã được gửi; không tiết lộ tồn tại tài khoản.
* **AC-AUTH-P2-03-02** — OTP tuân BA 1.5: 6 số, 180 giây, gửi lại 60 giây, giới hạn sai gần đúng; email truyền qua trạng thái ứng dụng, không nằm trên URL.
* **AC-AUTH-P2-03-03** — Chỉ OTP hợp lệ cho đúng email/mục đích mới cho đặt mật khẩu đạt tối thiểu 8 ký tự và xác nhận khớp; OTP sai/hết hạn không đổi mật khẩu.
* **AC-AUTH-P2-03-04** — Đổi thành công thu hồi mọi phiên khác theo BA 1.7; mật khẩu cũ không đăng nhập được, mật khẩu mới được. Yêu cầu trùng hoặc lỗi không báo thành công giả.
* **AC-AUTH-P2-03-05** — Khi thiếu trạng thái khôi phục (mở URL trực tiếp/tải lại mất ngữ cảnh), không hiện email đoán hay cho đổi mật khẩu; cho trở về bước yêu cầu mã.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
