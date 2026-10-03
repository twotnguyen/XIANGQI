# [EF] Bạn bè (Nhóm F)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Epic |
| Nhãn | `P1` |
| Nhóm tính năng ([docs/01](../../docs/01-yeu-cau-chi-tiet.md)) | F |
| Mục tiêu cốt lõi | Mục tiêu 3: mời bạn bè online vào phòng |
| Ước lượng tổng | 8 ngày công (T1 0 · T2 8 · T3 0) |
| Số Story / Task | 5 / 4 |

## Mô tả

Hệ thống bạn bè tối thiểu để mời bạn đang online vào phòng đang ngồi ghế.

## Phạm vi

* Tìm theo username, gửi/thu hồi/trả lời lời mời, huỷ kết bạn
* Trạng thái online / đang đấu / offline
* Mời bạn vào phòng (pop-up 30 giây)
* Giới hạn 200 bạn, 50 lời mời, từ chối 2 lần thì không gửi lại
* Không làm ở P1: chat 1-1, Thách đấu

## Tiêu chí hoàn thành Epic

* Mọi AC của US-FRIEND-01…05 đạt
* Kịch bản D3 chạy

## Story

* [US-FRIEND-01](../stories/US-FRIEND-01.md) Tìm người và gửi lời mời
* [US-FRIEND-02](../stories/US-FRIEND-02.md) Nhận và trả lời lời mời
* [US-FRIEND-03](../stories/US-FRIEND-03.md) Danh sách bạn và trạng thái
* [US-FRIEND-04](../stories/US-FRIEND-04.md) Mời bạn bè online vào phòng
* [US-FRIEND-05](../stories/US-FRIEND-05.md) Giới hạn

## Task

| Việc | Vai trò | Ngày | Đợt | Tiền đề |
|---|---|---:|---|---|
| [TF-01](../tasks/TF-01.md) BE: tìm, gửi/thu hồi/trả lời lời mời, huỷ kết bạn, giới hạn, lịch sử từ chối | R2 | 2,5 | T2 | T0-03, TA-03 |
| [TF-02](../tasks/TF-02.md) BE: trạng thái online/đang đấu, mời bạn vào phòng 30 giây | R1 | 1,5 | T2 | TF-01, TB-02 |
| [TF-03](../tasks/TF-03.md) FE: trang Bạn bè, chuông, pop-up mời, tab mời trong MODAL-INVITE | R6 | 3 | T2 | TF-01, TB-10 |
| [TF-04](../tasks/TF-04.md) Kiểm thử nhóm F | R7 | 1 | T2 | TF-03, TF-02 |

## Thành phần giao diện liên quan

`SCR-FRIENDS`

## Rủi ro

* Trạng thái online cần đúng khi nhiều tab và khi mất kết nối

## Tài liệu tham chiếu

* BA 2.5, 5.5
* docs/03 `friendships`, `friend_declines`
* DANH-MUC SCR-FRIENDS
