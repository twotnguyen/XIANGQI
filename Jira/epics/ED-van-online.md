# [ED] Ván đấu online (Nhóm D)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | D |
| Mục tiêu cốt lõi | Mục tiêu 5: hai người đánh cờ qua mạng |
| Ước lượng tổng | 18,5 ngày công (T1 17 · T2 1,5 · T3 0) |
| Số Story / Task | 10 / 10 |

## Mô tả

Dịch vụ ván phía máy chủ (máy chủ quyết định), đồng hồ, kết thúc ván, đầu hàng, xin hoà, mất kết nối, và giao diện phòng thi đấu.

## Phạm vi

* Nhận nước đi, kiểm hợp lệ, đồng bộ cho người chơi và người xem
* Đồng hồ 5/10/15 phút, hết giờ
* Chiếu hết, hết nước, đầu hàng, rời phòng, hoà (thoả thuận, lặp, 120 nửa nước)
* Mất kết nối theo vai trò, INTERRUPTED
* Giao diện phòng thi đấu, bảng nước đi, kết quả

## Tiêu chí hoàn thành Epic

* Mọi AC của US-PLAY-01…10 đạt
* Kịch bản D6, D9 chạy
* NFR-01: người xem nhận thế cờ < 100 ms trên mạng cục bộ

## Story

* [US-PLAY-01](../stories/US-PLAY-01.md) Đi nước qua mạng
* [US-PLAY-02](../stories/US-PLAY-02.md) Đồng hồ
* [US-PLAY-03](../stories/US-PLAY-03.md) Kết thúc ván và kết quả
* [US-PLAY-04](../stories/US-PLAY-04.md) Đầu hàng
* [US-PLAY-05](../stories/US-PLAY-05.md) Xin hoà
* [US-PLAY-06](../stories/US-PLAY-06.md) Rời phòng giữa ván
* [US-PLAY-07](../stories/US-PLAY-07.md) Mất kết nối và kết nối lại
* [US-PLAY-08](../stories/US-PLAY-08.md) Lặp thế, chiếu liên tục, không ăn quân
* [US-PLAY-09](../stories/US-PLAY-09.md) Người xem theo dõi trực tiếp
* [US-PLAY-10](../stories/US-PLAY-10.md) Bảng nước đi

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TD-01](../tasks/TD-01.md) BE: dịch vụ ván: nhận nước, tuần tự hoá, biên lai, ghi cơ sở dữ liệu | R1 | 3 | T1 | TC-02, T0-04 |
| [TD-02](../tasks/TD-02.md) BE: đồng hồ, hết giờ, tính giờ trước khi xét nước | R6 | 1,5 | T1 | TD-01 |
| [TD-03](../tasks/TD-03.md) BE: kết thúc ván, đầu hàng, rời phòng, kết quả | R1 | 1,5 | T1 | TD-01 |
| [TD-04](../tasks/TD-04.md) BE: xin hoà và giới hạn gửi lại | R1 | 1 | T2 | TD-03 |
| [TD-05](../tasks/TD-05.md) BE: mất kết nối, ân hạn theo vai trò, đồng bộ lại, INTERRUPTED | R1 | 2,5 | T1 | TD-02, TD-03 |
| [TD-06](../tasks/TD-06.md) FE: phòng thi đấu (bố cục, đồng hồ, bảng nước đi, trạng thái) | R4 | 3 | T1 | TC-07, TC-03, TD-01 |
| [TD-07](../tasks/TD-07.md) FE: kết quả, xác nhận đầu hàng/rời, lớp phủ kết nối | R4 | 2 | T1 | TD-03 |
| [TD-07b](../tasks/TD-07b.md) FE: xin hoà (gửi, nhận, rút, đếm lùi) | R4 | 0,5 | T2 | TD-07, TD-04 |
| [TD-08](../tasks/TD-08.md) FE: chế độ người xem chỉ đọc | R4 | 1 | T1 | TD-06 |
| [TD-09](../tasks/TD-09.md) Kiểm thử nhóm D (nhiều client, đồng hồ, kết nối lại) | R7 | 2,5 | T1 | TD-05, TD-07, TD-06 |

## Thành phần giao diện liên quan

`SCR-GAME-ROOM`, `MODAL-DRAW-PROMPT`, `MODAL-CONFIRM-RESIGN`, `MODAL-CONFIRM-LEAVE`, `MODAL-MATCH-RESULT`, `OVERLAY-RECONNECTING`

## Rủi ro

* Chuỗi phụ thuộc dài (nền tảng → phòng → ván) nằm trên đường găng
* Đồng bộ và đồng hồ phải đúng khi mạng chập chờn

## Tài liệu tham chiếu

* BA 2.1, 3.3, 3.5, 3.6, 8.3
* docs/02 mục 3
* docs/04 mục 4–6
* DANH-MUC SCR-GAME-ROOM
