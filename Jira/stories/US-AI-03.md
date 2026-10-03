# [US-AI-03] Kết thúc, bỏ dở và vào lại

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EG](../epics/EG-danh-voi-may.md) · Đánh với máy (Nhóm G) |
| Nhãn | `P1`, `nhom-EG` |
| Nguồn luật | BA 6.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Kết thúc, bỏ dở và vào lại. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Kết thúc khi chiếu hết, hết nước đi, đầu hàng hoặc hoà theo [02] mục 3.3; hiện `MODAL-MATCH-RESULT` chỉ có *Rời phòng*.
* Đóng tab hoặc mất kết nối: ván **giữ 30 phút** để vào lại cùng đường dẫn `/ai/:id`; Sảnh hiện banner *"Bạn có ván đang chơi dở — Quay lại"*. Quá 30 phút thì ván coi là *Bỏ dở* (không tính thắng/thua).
* Đi lại và lưu Lịch sử là P2, **không hiện** ở P1.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TG-05](../tasks/TG-05.md) BE: dịch vụ ván với máy (phe, vào lại 30 phút, bỏ dở) | R2 | 2 | T1 |
| [TG-06](../tasks/TG-06.md) FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
