# [EE] Chat và camera/mic (Nhóm E)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | E |
| Mục tiêu cốt lõi | Mục tiêu 7: chat, camera, mic; kênh chat người xem tách riêng |
| Ước lượng tổng | 12 ngày công (T1 4,5 · T2 7,5 · T3 0) |
| Số Story / Task | 5 / 6 |

## Mô tả

Chat hai kênh (Riêng cho hai người chơi, Chung cho cả phòng), bộ lọc từ cấm, camera/mic LiveKit với 3 mức chia sẻ, xử lý nhiều tab.

## Phạm vi

* Kênh Riêng và Kênh Chung, quyền đọc theo mốc ngồi ghế
* Giới hạn 200 ký tự, 5 tin/10 giây, lọc từ cấm
* Camera/mic bật/tắt độc lập, 3 mức chia sẻ, người xem chỉ nhận
* Nhiều tab: tab mới tiếp quản
* Không làm ở P1: sticker, chat 1-1

## Tiêu chí hoàn thành Epic

* Mọi AC của US-CHAT-01,02 và US-MEDIA-01…03 đạt
* Kịch bản D7 chạy

## Story

* [US-CHAT-01](../stories/US-CHAT-01.md) Hai kênh chat
* [US-CHAT-02](../stories/US-CHAT-02.md) Giới hạn và bộ lọc từ cấm
* [US-MEDIA-01](../stories/US-MEDIA-01.md) Camera và micro cho hai người chơi
* [US-MEDIA-02](../stories/US-MEDIA-02.md) Người xem chỉ xem/nghe
* [US-MEDIA-03](../stories/US-MEDIA-03.md) Mở nhiều tab

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TE-01](../tasks/TE-01.md) BE: chat 2 kênh, quyền đọc theo mốc ngồi ghế, giới hạn, lọc từ cấm | R6 | 2,5 | T1 | TB-02, T0-04 |
| [TE-02](../tasks/TE-02.md) FE: khung chat (tab, ẩn Kênh Chung) | R6 | 2 | T1 | TE-01 |
| [TE-03](../tasks/TE-03.md) BE: cấp token LiveKit, quyền theo vai trò, cập nhật khi đổi ghế/đuổi | R6 | 2 | T2 | T0-07, TB-02 |
| [TE-04](../tasks/TE-04.md) FE: khung camera/mic, 3 mức chia sẻ | R6 | 3 | T2 | TE-03, TB-09 |
| [TE-05](../tasks/TE-05.md) Nhiều tab tiếp quản (socket và media) | R1 | 1 | T2 | TE-04 |
| [TE-06](../tasks/TE-06.md) Kiểm thử nhóm E (chat, kiểm tay LiveKit) | R7 | 1,5 | T2 | TE-04, TE-02 |

## Thành phần giao diện liên quan

`PANEL-CHAT`, `PANEL-MEDIA`

## Rủi ro

* LiveKit quyền đăng ký track theo từng người cần PoC
* Kiểm thử camera/mic chủ yếu là kiểm tay

## Tài liệu tham chiếu

* BA 4.1, 5.3, 5.4, 1.8
* docs/04 mục 7
* DANH-MUC PANEL-CHAT, PANEL-MEDIA
