# [EQ] Kiểm thử chấp nhận và chuẩn bị demo

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | — |
| Mục tiêu cốt lõi | Tiêu chí hoàn thành P1 |
| Ước lượng tổng | 9 ngày công (T1 3 · T2 4 · T3 2) |
| Số Story / Task | 0 / 7 |

## Mô tả

Kịch bản Playwright D1–D10, kiểm thử tải, bảo mật và chuẩn bị buổi demo.

## Phạm vi

* Playwright D1–D10
* Kiểm thử tải 50 kết nối
* Kiểm thử bảo mật
* Chuẩn bị và tập dượt demo

## Tiêu chí hoàn thành Epic

* Demo D1–D10 chạy ổn định
* Số đo NFR được ghi lại

## Story

Không có Story (Epic hạ tầng/kiểm thử); chỉ có Task.

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TQ-01a](../tasks/TQ-01a.md) Playwright Mức 1: D1 (đăng ký/đăng nhập) và D8 (ván với máy cấp Dễ/Trung bình) | R7 | 1 | T1 | TA-08, TA-04, TA-05, TG-06, TD-07 |
| [TQ-01b](../tasks/TQ-01b.md) Playwright Mức 2: D2 (tạo phòng) và D6 (ván online đến chiếu hết) | R7 | 1 | T1 | TD-09, TB-11, TB-10 |
| [TQ-01c](../tasks/TQ-01c.md) Playwright Mức 3: D4 (người xem), D5 (khoá phòng), D9 (mất kết nối) | R7 | 1 | T1 | TQ-01b, TB-11b, TD-08, TD-05 |
| [TQ-01d](../tasks/TQ-01d.md) Playwright Mức 4: D3 (mời bạn bè), D7 (camera/mic), D8 cấp Khó, D10, và kịch bản A–E đầy đủ có đổi chỗ ghế | R7 | 1,5 | T2 | TQ-01c, TF-04, TE-06, TG-03, TB-04, TB-09b |
| [TQ-02](../tasks/TQ-02.md) Kiểm thử tải 50 kết nối | R7 | 2 | T3 | TD-09 |
| [TQ-03](../tasks/TQ-03.md) Kiểm thử bảo mật | R7 | 1,5 | T2 | TA-08, TD-09 |
| [TQ-04](../tasks/TQ-04.md) Chuẩn bị demo: dữ liệu, kịch bản, tập dượt | R7 | 1 | T2 | TQ-01d |

## Thành phần giao diện liên quan

—

## Rủi ro

* Kiểm thử cuối dồn vào cuối kế hoạch: cần viết song song với phát triển

## Tài liệu tham chiếu

* docs/05
