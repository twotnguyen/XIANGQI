# [EB] Phòng, mời, ghế, người xem (Nhóm B)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | B |
| Mục tiêu cốt lõi | Mục tiêu 2, 3, 6 |
| Ước lượng tổng | 20 ngày công (T1 16,5 · T2 3,5 · T3 0) |
| Số Story / Task | 12 / 14 |

## Mô tả

Tạo phòng, mời bằng link và mã, ghế đỏ/đen, người xem tối đa 2, chế độ công khai/chỉ có mã/khoá, đuổi người xem, vòng đời phòng.

## Phạm vi

* Tạo phòng (tên, mức giờ 5/10/15, riêng tư, số người xem 0–2)
* Vào bằng mã, link, Sảnh; ghế trống vào ghế, hết ghế làm người xem
* Sẵn sàng + đếm 3 giây
* Khoá phòng, thu hồi link, kết nối lại theo vai trò
* Đuổi người xem; Host rời và chuyển quyền; quay về phòng chờ sau ván
* Không làm ở P1: Mã QR, ghép ngẫu nhiên, Xin đổi bên, Tái đấu

## Tiêu chí hoàn thành Epic

* Mọi AC của US-ROOM-01…12 đạt
* Kịch bản D2, D4, D5 chạy
* Ví dụ A–E (BA 2.8) chạy hết

## Story

* [US-ROOM-01](../stories/US-ROOM-01.md) Tạo phòng
* [US-ROOM-02](../stories/US-ROOM-02.md) Phòng chờ và ghế ngồi
* [US-ROOM-03](../stories/US-ROOM-03.md) Sẵn sàng và bắt đầu ván
* [US-ROOM-04](../stories/US-ROOM-04.md) Chia sẻ phòng bằng link và mã
* [US-ROOM-05](../stories/US-ROOM-05.md) Vào phòng bằng mã, link hoặc Sảnh
* [US-ROOM-06](../stories/US-ROOM-06.md) Đổi chỗ giữa ghế và người xem
* [US-ROOM-07](../stories/US-ROOM-07.md) Chế độ riêng tư và khoá phòng
* [US-ROOM-08](../stories/US-ROOM-08.md) Danh sách phòng công khai ở Sảnh
* [US-ROOM-09](../stories/US-ROOM-09.md) Đuổi người xem
* [US-ROOM-10](../stories/US-ROOM-10.md) Host rời, chuyển quyền, đóng phòng
* [US-ROOM-11](../stories/US-ROOM-11.md) Sau ván: quay về phòng chờ
* [US-ROOM-12](../stories/US-ROOM-12.md) Màn hình từ chối truy cập

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TB-01](../tasks/TB-01.md) BE: tạo phòng, mã 8 ký tự, token mời, danh sách Sảnh | R2 | 1,5 | T1 | T0-03, T0-04 |
| [TB-02](../tasks/TB-02.md) BE: vào phòng (mã/link/Sảnh), ghế hoặc người xem, trần, chặn vào | R2 | 2 | T1 | TB-01 |
| [TB-03](../tasks/TB-03.md) BE: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | R1 | 1,5 | T1 | TB-02 |
| [TB-04](../tasks/TB-04.md) BE: đổi chỗ ghế/người xem, reset Sẵn sàng | R2 | 1,5 | T2 | TB-03 |
| [TB-05](../tasks/TB-05.md) BE: riêng tư, khoá phòng, thu hồi link, kết nối lại theo vai trò | R2 | 1,5 | T1 | TB-02 |
| [TB-06](../tasks/TB-06.md) BE: đuổi người xem, chặn đến khi đóng phòng | R1 | 1 | T2 | TB-02 |
| [TB-07](../tasks/TB-07.md) BE: Host rời, chuyển quyền, đóng phòng, quay về phòng chờ | R6 | 1,5 | T1 | TB-03 |
| [TB-08](../tasks/TB-08.md) FE: Sảnh (danh sách phòng, tạo phòng, vào bằng mã, thẻ chế độ) | R5 | 3 | T1 | T0-05, TB-01 |
| [TB-09](../tasks/TB-09.md) FE: phòng chờ (ghế, Sẵn sàng, đếm ngược, cài đặt phòng) | R5 | 2,5 | T1 | TB-08, TB-03 |
| [TB-09b](../tasks/TB-09b.md) FE: đổi chỗ ghế/người xem trong phòng chờ | R5 | 0,5 | T2 | TB-09, TB-04 |
| [TB-10](../tasks/TB-10.md) FE: chia sẻ phòng (link+mã) và màn từ chối truy cập | R5 | 1 | T1 | TB-09 |
| [TB-10b](../tasks/TB-10b.md) FE: danh sách người xem và xác nhận đuổi | R5 | 0,5 | T2 | TB-10, TB-06 |
| [TB-11](../tasks/TB-11.md) Kiểm thử nhóm B phần cơ bản: tạo phòng, vào bằng mã/link, ghế, Sẵn sàng, Host rời | R7 | 1 | T1 | TB-07 |
| [TB-11b](../tasks/TB-11b.md) Kiểm thử nhóm B: khoá phòng, người xem, kết nối lại, kịch bản A–E của BA 2.8 | R7 | 1 | T1 | TB-05, TB-11 |

## Thành phần giao diện liên quan

`SCR-LOBBY`, `SCR-WAITING-ROOM`, `SCR-ACCESS-DENIED`, `MODAL-CREATE-ROOM`, `MODAL-INVITE`, `MODAL-ROOM-SETTINGS`, `MODAL-CONFIRM-KICK`, `PANEL-SPECTATORS`

## Rủi ro

* Nhiều trạng thái chồng nhau (ghế, người xem, khoá, kết nối lại): cần kiểm thử nhiều client

## Tài liệu tham chiếu

* BA 2.0–2.8, 4.2, 4.3
* docs/03 `rooms`, `room_participants`
* DANH-MUC SCR-LOBBY, SCR-WAITING-ROOM, SCR-ACCESS-DENIED
