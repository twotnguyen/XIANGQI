# [US-CHAT-01] Hai kênh chat

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EE](../epics/EE-chat-media.md) · Chat và camera/mic (Nhóm E) |
| Nhãn | `P1`, `nhom-EE` |
| Nguồn luật | BA 5.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Hai kênh chat. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **Người chơi:** thấy cả `[Kênh Riêng]` (mặc định mở) và `[Kênh Chung]`, có công tắc ẩn Kênh Chung. **Người xem:** chỉ thấy `[Kênh Chung]`.
* Tin ở Kênh Riêng chỉ hai người **đang ngồi ghế** nhận; người đổi chỗ sau không đọc tin cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào.
* Chat phòng xoá khi phòng đóng.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TE-01](../tasks/TE-01.md) BE: chat 2 kênh, quyền đọc theo mốc ngồi ghế, giới hạn, lọc từ cấm | R6 | 2,5 | T1 |
| [TE-02](../tasks/TE-02.md) FE: khung chat (tab, ẩn Kênh Chung) | R6 | 2 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
