# [US-ROOM-09] Đuổi người xem

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 4.2 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Đuổi người xem. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Cả Host và người chơi còn lại đều thấy nút *Kick* cạnh mỗi người xem; bấm thì hiện xác nhận *"Người này sẽ không vào lại được phòng này."*
* Sau xác nhận: người xem bị ngắt kết nối, đưa ra Sảnh kèm *"Bạn đã bị đuổi khỏi phòng thi đấu"*, bị chặn **đến khi phòng đóng**.
* Người bị đuổi quay lại bằng link hoặc mã thì thấy *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"*.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-06](../tasks/TB-06.md) BE: đuổi người xem, chặn đến khi đóng phòng | R1 | 1 | T2 |
| [TB-10b](../tasks/TB-10b.md) FE: danh sách người xem và xác nhận đuổi | R5 | 0,5 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
