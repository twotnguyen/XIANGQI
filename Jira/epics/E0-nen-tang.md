# [E0] Nền tảng và thử nghiệm rủi ro

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | — |
| Mục tiêu cốt lõi | Mọi mục tiêu (nền móng) |
| Ước lượng tổng | 11 ngày công (T1 11 · T2 0 · T3 0) |
| Số Story / Task | 0 / 9 |

## Mô tả

Dựng kho mã, CI, cơ sở dữ liệu, khung máy chủ và khung giao diện, triển khai; chạy 3 thử nghiệm rủi ro cao ngay đầu (LiveKit, OTP Supabase, máy cờ).

## Phạm vi

* Kho pnpm, CI, `.env.example`
* Supabase thử nghiệm và migration schema P1
* Khung NestJS + Socket.IO, hợp đồng sự kiện dùng chung
* Khung React/Vite, token thiết kế, thành phần 5 trạng thái
* Triển khai web tĩnh và máy chủ
* PoC: LiveKit, OTP, máy cờ

## Tiêu chí hoàn thành Epic

* Mọi người chạy được kho cục bộ và CI xanh
* Có bản triển khai thử trên Internet
* Ba PoC có số đo thật; nếu không đạt thì đã báo Product Owner

## Story

Không có Story (Epic hạ tầng/kiểm thử); chỉ có Task.

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [T0-01](../tasks/T0-01.md) Khởi tạo monorepo pnpm, lint, Vitest, .env.example | R7 | 1 | T1 | — |
| [T0-02](../tasks/T0-02.md) CI chạy kiểm thử mỗi lần đẩy mã | R7 | 0,5 | T1 | T0-01 |
| [T0-03](../tasks/T0-03.md) Dự án Supabase thử nghiệm, khung migration SQL, schema P1 | R2 | 2 | T1 | T0-01 |
| [T0-04](../tasks/T0-04.md) Khung NestJS + Socket.IO, xác thực kết nối, hợp đồng sự kiện dùng chung | R1 | 2 | T1 | T0-01 |
| [T0-05](../tasks/T0-05.md) Khung React/Vite, định tuyến, token thiết kế, thành phần 5 trạng thái | R5 | 2 | T1 | T0-01 |
| [T0-06](../tasks/T0-06.md) Triển khai web tĩnh và máy chủ, biến môi trường | R7 | 1 | T1 | T0-04, T0-05 |
| [T0-07](../tasks/T0-07.md) PoC LiveKit: quyền đăng ký track theo từng người | R6 | 1 | T1 | T0-04 |
| [T0-08](../tasks/T0-08.md) PoC OTP Supabase: hạn 180 giây, giới hạn tốc độ, mã 6 số, quét dọn | R2 | 0,5 | T1 | T0-03 |
| [T0-09](../tasks/T0-09.md) PoC máy cờ: độ sâu đạt được trong ngân sách | R3 | 1 | T1 | TC-01 |

## Thành phần giao diện liên quan

—

## Rủi ro

* PoC thất bại phải đổi phương án sớm
* Chọn nền tảng triển khai cần quyết định nhanh

## Tài liệu tham chiếu

* docs/03
* docs/04
* docs/05 mục 7
