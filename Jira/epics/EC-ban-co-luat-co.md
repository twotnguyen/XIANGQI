# [EC] Bàn cờ và luật cờ (Nhóm C)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | C |
| Mục tiêu cốt lõi | Mục tiêu 4: khởi tạo bàn cờ |
| Ước lượng tổng | 16 ngày công (T1 14,5 · T2 1,5 · T3 0) |
| Số Story / Task | 5 / 8 |

## Mô tả

Gói luật cờ dùng chung (máy chủ, máy cờ, giao diện) và bàn cờ SVG tương tác.

## Phạm vi

* Luật cờ đầy đủ cách đi, chiếu, chiếu hết, hết nước, lặp thế, chiếu liên tục, 120 nửa nước
* Ký hiệu nước đi tiếng Việt
* Bàn SVG, quân chữ Hán, lật bàn, click và kéo thả, âm thanh Web Audio

## Tiêu chí hoàn thành Epic

* Mọi AC của US-BOARD-01…05 đạt
* Perft và bộ thế kiểm thử xanh (perft tham chiếu đã xác minh)
* Bàn cờ dùng được bằng chuột, bàn phím và cảm ứng

## Story

* [US-BOARD-01](../stories/US-BOARD-01.md) Hiển thị bàn cờ
* [US-BOARD-02](../stories/US-BOARD-02.md) Chọn quân và gợi ý ô đi bằng click
* [US-BOARD-03](../stories/US-BOARD-03.md) Kéo thả
* [US-BOARD-04](../stories/US-BOARD-04.md) Đánh dấu nước cuối và chiếu
* [US-BOARD-05](../stories/US-BOARD-05.md) Âm thanh

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TC-01](../tasks/TC-01.md) Gói luật cờ: toạ độ, quân, sinh nước, hợp lệ, chiếu, FEN | R3 | 4 | T1 | T0-01 |
| [TC-02](../tasks/TC-02.md) Kết thúc ván: chiếu hết, hết nước, lặp thế, chiếu liên tục, 120 nửa nước | R3 | 2 | T1 | TC-01 |
| [TC-03](../tasks/TC-03.md) Ký hiệu tiếng Việt duy nhất và bộ thế kiểm thử | R3 | 1,5 | T1 | TC-02 |
| [TC-04](../tasks/TC-04.md) Kiểm thử luật: xác minh perft, bộ thế từng quân | R3 | 1,5 | T1 | TC-02 |
| [TC-05](../tasks/TC-05.md) FE: bàn cờ SVG, quân chữ Hán, lật bàn, nhãn đọc | R4 | 2,5 | T1 | T0-05 |
| [TC-06](../tasks/TC-06.md) FE: chọn quân, chấm gợi ý, đi bằng click | R4 | 1,5 | T1 | TC-05, TC-01 |
| [TC-07](../tasks/TC-07.md) FE: kéo thả và cảm ứng | R4 | 1,5 | T1 | TC-06 |
| [TC-08](../tasks/TC-08.md) FE: dấu nước cuối, chiếu, âm thanh Web Audio | R4 | 1,5 | T2 | TC-07 |

## Thành phần giao diện liên quan

—

## Rủi ro

* Sai luật là lỗi nghiêm trọng: cần bộ kiểm thử rộng
* Giá trị perft tham chiếu cần xác minh độc lập

## Tài liệu tham chiếu

* docs/02
* BA 3.1, 3.4, 3.5
* DESIGN §7
