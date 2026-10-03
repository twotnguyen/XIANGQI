# [US-ROOM-08] Danh sách phòng công khai ở Sảnh

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.0, 2.7 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Danh sách phòng công khai ở Sảnh. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-ROOM-08-01** — Chỉ hiện phòng `PUBLIC` đang `WAITING`/`PLAYING`; mỗi dòng: tên phòng, Host, mức giờ, số người `X/Y`, nút *Vào xem*.
* **AC-ROOM-08-02** — Sắp mới nhất lên đầu, tối đa 50 phòng, tự làm mới.
* **AC-ROOM-08-03** — Phòng đã đủ người xem thì nút *Vào xem* `DISABLED` kèm tooltip nêu lý do.
* **AC-ROOM-08-04** — `EMPTY`: hiện giải thích và nút *Tạo phòng*.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-01](../tasks/TB-01.md) BE: tạo phòng, mã 8 ký tự, token mời, danh sách Sảnh | R2 | 1,5 | T1 |
| [TB-08](../tasks/TB-08.md) FE: Sảnh (danh sách phòng, tạo phòng, vào bằng mã, thẻ chế độ) | R5 | 3 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
