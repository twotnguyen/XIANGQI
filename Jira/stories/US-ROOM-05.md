# [US-ROOM-05] Vào phòng bằng mã, link hoặc Sảnh

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.6, 2.8 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2 |

## Mô tả

Vào phòng bằng mã, link hoặc Sảnh. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Nhập mã 8 ký tự ở Sảnh hoặc mở link: còn ghế trống thì **vào ghế đó**; ghế đã kín và còn chỗ xem thì vào làm **Người xem** kèm thông báo *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."*
* Phòng đủ (2 người chơi + số người xem tối đa của phòng, tối đa 4 người) thì từ chối kèm *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* ở `SCR-ACCESS-DENIED`.
* Vào từ danh sách phòng ở Sảnh (nút *Vào xem*) thì **luôn** vào làm Người xem.
* Người bị đuổi hoặc phòng `LOCKED` thì vào bị từ chối (US-ROOM-09, US-ROOM-07).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-02](../tasks/TB-02.md) BE: vào phòng (mã/link/Sảnh), ghế hoặc người xem, trần, chặn vào | R2 | 2 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
