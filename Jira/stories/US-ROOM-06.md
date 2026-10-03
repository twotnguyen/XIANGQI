# [US-ROOM-06] Đổi chỗ giữa ghế và người xem

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.8 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2 |

## Mô tả

Đổi chỗ giữa ghế và người xem. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Chỉ khi phòng `WAITING` hoặc `FINISHED`; khi đang đấu thì không đổi chỗ.
* Người ngồi ghế bấm *Chuyển sang người xem*: thực hiện được khi **còn chỗ xem**; phòng không có người xem hoặc đã đủ người xem thì nút `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"*. Không bao giờ vượt số người xem tối đa.
* Host bấm *Chuyển sang người xem* cho người đang ngồi ghế (cùng điều kiện còn chỗ), hoặc *Mời xuống ghế* cho người xem khi còn ghế trống.
* Người xem **không tự ngồi** vào ghế trống. Host không tự chuyển mình sang người xem (nút ẩn).
* Mỗi lần đổi thành phần người ngồi ghế thì phòng về `WAITING` và reset Sẵn sàng.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-04](../tasks/TB-04.md) BE: đổi chỗ ghế/người xem, reset Sẵn sàng | R2 | 1,5 | T2 |
| [TB-09b](../tasks/TB-09b.md) FE: đổi chỗ ghế/người xem trong phòng chờ | R5 | 0,5 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
