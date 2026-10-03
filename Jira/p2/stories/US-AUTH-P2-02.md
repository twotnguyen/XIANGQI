# [US-AUTH-P2-02] Google OAuth (P2)

> **Bản nháp P2, chưa lên kế hoạch.** Chưa tạo trên Jira.

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [I](../epics/I.md) · Tài khoản mở rộng |
| Nhãn | `P2` |
| Nguồn luật | BA 1.2 |

## Tiêu chí nghiệm thu (chép nguyên từ docs/01)

* **AC-AUTH-P2-02-01** — Đăng ký bằng Google mới đi tới SCR-ONBOARDING: Username và mật khẩu hợp lệ/xác nhận, không OTP; display_name khởi tạo bằng username.
* **AC-AUTH-P2-02-02** — Đăng nhập Google với danh tính đã hoàn tất thì vào Sảnh hoặc phòng mời; chưa thiết lập thì vào onboarding, chưa được dùng chức năng ứng dụng.
* **AC-AUTH-P2-02-03** — Email thuộc tài khoản khác đã có thì báo Email này đã được đăng ký; không tự gộp tài khoản hoặc làm mất mật khẩu/username hiện có.
* **AC-AUTH-P2-02-04** — Bỏ dở hoặc Google từ chối/lỗi thì không có tài khoản ứng dụng hoàn tất; không tự đi tiếp vào Sảnh. Gửi hoàn tất trùng không tạo hai tài khoản; username bị chiếm trong lúc chờ phải báo để nhập lại.
* **AC-AUTH-P2-02-05** — Sau thiết lập thành công, cùng danh tính đăng nhập được bằng Google hoặc username/mật khẩu; dữ liệu gắn user_id, không tạo hồ sơ thứ hai.

## Ghi chú

Tách thành Task và ước lượng khi lên kế hoạch P2.
