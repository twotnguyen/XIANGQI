# [US-MEDIA-02] Người xem chỉ xem/nghe

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EE](../epics/EE-chat-media.md) · Chat và camera/mic (Nhóm E) |
| Nhãn | `P1`, `nhom-EE` |
| Nguồn luật | BA 4.1 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 5 |

## Mô tả

Người xem chỉ xem/nghe. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Người xem **không có** nút bật camera/mic; máy chủ không cấp quyền phát.
* Người xem chỉ thấy/nghe luồng của người chơi chọn mức *Cả đối thủ và người xem*.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TE-03](../tasks/TE-03.md) BE: cấp token LiveKit, quyền theo vai trò, cập nhật khi đổi ghế/đuổi | R6 | 2 | T2 |
| [TE-04](../tasks/TE-04.md) FE: khung camera/mic, 3 mức chia sẻ | R6 | 3 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
