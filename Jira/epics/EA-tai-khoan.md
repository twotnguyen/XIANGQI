# [EA] Tài khoản và phiên (Nhóm A)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | A |
| Mục tiêu cốt lõi | Mục tiêu 1: giao diện đăng ký / đăng nhập |
| Ước lượng tổng | 12 ngày công (T1 10,5 · T2 1,5 · T3 0) |
| Số Story / Task | 6 / 9 |

## Mô tả

Đăng ký 3 bước với OTP email (Phương án B), đăng nhập bằng username, phiên, hồ sơ cơ bản, chuyển hướng vào phòng sau đăng nhập.

## Phạm vi

* Đăng ký username → email → OTP, tạo hồ sơ sau OTP đúng
* Đăng nhập, Ghi nhớ đăng nhập, đăng xuất
* Hồ sơ cơ bản (tên hiển thị)
* Chuyển hướng vào phòng của link mời
* Không làm ở P1: Khách, Google, quên mật khẩu, đổi username (nút `DISABLED` + "Sắp ra mắt")

## Tiêu chí hoàn thành Epic

* Mọi AC của US-AUTH-01…06 đạt
* Kịch bản demo D1 chạy
* Phục hồi đăng ký dở đã được kiểm thử bằng giết tiến trình

## Story

* [US-AUTH-01](../stories/US-AUTH-01.md) Đăng ký bước 1: username và mật khẩu
* [US-AUTH-02](../stories/US-AUTH-02.md) Đăng ký bước 2: email và gửi OTP
* [US-AUTH-03](../stories/US-AUTH-03.md) Đăng ký bước 3: xác thực OTP, tạo tài khoản
* [US-AUTH-04](../stories/US-AUTH-04.md) Đăng nhập bằng username và mật khẩu
* [US-AUTH-05](../stories/US-AUTH-05.md) Hồ sơ cơ bản và đăng xuất
* [US-AUTH-06](../stories/US-AUTH-06.md) Chuyển hướng vào phòng sau đăng nhập

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TA-01](../tasks/TA-01.md) BE: kiểm tra username/email, gửi OTP, dùng lại đăng ký dở, tuần tự hoá theo email | R2 | 1,5 | T1 | T0-03, T0-04, T0-08 |
| [TA-02](../tasks/TA-02.md) BE: xác minh OTP, hoàn tất đăng ký, hoàn tác, tác vụ quét tài khoản chưa hoàn tất | R2 | 2 | T1 | TA-01 |
| [TA-03](../tasks/TA-03.md) BE: đăng nhập bằng username, phiên 30 ngày/12 giờ, chặn tài khoản chưa hoàn tất | R2 | 1,5 | T1 | TA-02 |
| [TA-04](../tasks/TA-04.md) FE: trình hướng dẫn đăng ký 3 bước, OTP 6 ô, đếm lùi | R5 | 2,5 | T1 | T0-05, TA-01 |
| [TA-05](../tasks/TA-05.md) FE: đăng nhập, ghi nhớ, nút Guest/Google DISABLED | R5 | 1 | T1 | T0-05 |
| [TA-06](../tasks/TA-06.md) FE: hồ sơ cơ bản: đổi tên hiển thị, đăng xuất | R5 | 1 | T2 | TA-05, TA-06b |
| [TA-06b](../tasks/TA-06b.md) BE: cập nhật tên hiển thị có lọc từ cấm ở máy chủ (client không ghi trực tiếp) | R2 | 0,5 | T2 | TA-03 |
| [TA-07](../tasks/TA-07.md) FE: chuyển hướng vào phòng sau đăng nhập | R5 | 0,5 | T1 | TA-05, TB-02 |
| [TA-08](../tasks/TA-08.md) Kiểm thử nhóm A (đơn vị, tích hợp) | R7 | 1,5 | T1 | TA-03 |

## Thành phần giao diện liên quan

`SCR-LOGIN`, `SCR-REGISTER`, `SCR-PROFILE-SETTINGS`

## Rủi ro

* Cấu hình OTP Supabase (hạn 180 giây, giới hạn tốc độ) cần PoC
* Đăng ký dở để lại người dùng chưa hoàn tất: dựa vào tác vụ quét

## Tài liệu tham chiếu

* BA 1.1, 1.4, 1.5, 1.8, 2.4
* docs/04 mục 3
* DANH-MUC SCR-LOGIN, SCR-REGISTER, SCR-PROFILE-SETTINGS
