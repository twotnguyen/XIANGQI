# [EH] Giao diện chung (Nhóm H)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | H |
| Mục tiêu cốt lõi | Tất cả mục tiêu |
| Ước lượng tổng | 7,5 ngày công (T1 1,5 · T2 0 · T3 6) |
| Số Story / Task | 6 / 4 |

## Mô tả

Thanh điều hướng, cách hiển thị tính năng P2, năm trạng thái, responsive từ 360 px, trợ năng.

## Phạm vi

* Thanh điều hướng, banner ván dở
* Mục P2 `DISABLED` + "Sắp ra mắt", chức năng sâu thì ẩn hẳn
* Responsive từ 360 px
* Trợ năng WCAG 2.1 AA

## Tiêu chí hoàn thành Epic

* Mọi AC của US-UI-01…06 đạt
* NFR-03 đạt

## Story

* [US-UI-01](../stories/US-UI-01.md) Thanh điều hướng
* [US-UI-02](../stories/US-UI-02.md) Sảnh
* [US-UI-03](../stories/US-UI-03.md) Năm trạng thái cho mọi màn hình
* [US-UI-04](../stories/US-UI-04.md) Responsive
* [US-UI-05](../stories/US-UI-05.md) Trợ năng
* [US-UI-06](../stories/US-UI-06.md) Tính năng P2 hiển thị đúng quy tắc

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TH-01](../tasks/TH-01.md) Thanh điều hướng, mục P2 DISABLED, banner ván dở | R5 | 1,5 | T1 | TB-08 |
| [TH-02](../tasks/TH-02.md) Responsive từ 360 px cho các màn hình P1 | R4 | 3 | T3 | TD-07, TB-10 |
| [TH-03](../tasks/TH-03.md) Trợ năng: bàn phím, nhãn, giảm chuyển động, tương phản | R5 | 1,5 | T3 | TH-02 |
| [TH-04](../tasks/TH-04.md) Kiểm thử trợ năng và responsive | R5 | 1,5 | T3 | TH-03 |

## Thành phần giao diện liên quan

`PANEL-NAVBAR`

## Rủi ro

* Phòng thi đấu nhiều thành phần khó vừa 360 px

## Tài liệu tham chiếu

* DANH-MUC §2, §7
* DESIGN.md
* docs/05 mục 6
