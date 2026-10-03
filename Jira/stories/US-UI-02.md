# [US-UI-02] Sảnh

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EH](../epics/EH-giao-dien-chung.md) · Giao diện chung (Nhóm H) |
| Nhãn | `P1`, `nhom-EH` |
| Nguồn luật | BA 2.0, Phần 11 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Sảnh. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Có: Tạo phòng, Vào phòng bằng mã, Danh sách phòng công khai, 3 thẻ Đánh với máy. Thẻ **Đánh Hạng** hiện `DISABLED` + *"Sắp ra mắt"*; *Ghép ngẫu nhiên* **ẩn** ở P1.
* Có ván/phòng dở thì hiện banner quay lại; đang ngồi ghế ở phòng thì các nút tạo/ghép `DISABLED` kèm tooltip.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-08](../tasks/TB-08.md) FE: Sảnh (danh sách phòng, tạo phòng, vào bằng mã, thẻ chế độ) | R5 | 3 | T1 |
| [TH-01](../tasks/TH-01.md) Thanh điều hướng, mục P2 DISABLED, banner ván dở | R5 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
