# [US-ROOM-01] Tạo phòng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.7, 2.8 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Tạo phòng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Form gồm: tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ **5 / 10 / 15 phút (mặc định 10)**, chế độ `PUBLIC` hoặc `CODE_ONLY`, số người xem tối đa **Không có người xem / 1 / 2 (mặc định 2)**. `LOCKED` không chọn được lúc tạo.
* Khi tạo thành công thì tạo mã 8 ký tự, người tạo là **Host** ngồi **ghế Đỏ** ở phòng chờ.
* Khi đang ngồi ghế ở phòng/ván khác thì nút *Tạo phòng* `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"* (BA 1.8).
* Mức giờ và số người xem **không đổi được** sau khi tạo.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-01](../tasks/TB-01.md) BE: tạo phòng, mã 8 ký tự, token mời, danh sách Sảnh | R2 | 1,5 | T1 |
| [TB-08](../tasks/TB-08.md) FE: Sảnh (danh sách phòng, tạo phòng, vào bằng mã, thẻ chế độ) | R5 | 3 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
