# [US-CHAT-02] Giới hạn và bộ lọc từ cấm

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EE](../epics/EE-chat-media.md) · Chat và camera/mic (Nhóm E) |
| Nhãn | `P1`, `nhom-EE` |
| Nguồn luật | BA 5.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2,5 |

## Mô tả

Giới hạn và bộ lọc từ cấm. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-CHAT-02-01** — Mỗi tin tối đa 200 ký tự; tối đa 5 tin/10 giây/người, vượt thì báo *"Bạn gửi quá nhanh"*.
* **AC-CHAT-02-02** — Từ cấm (tiếng Việt, tiếng Anh) bị che bằng `***` ở máy chủ **và** client, có chuẩn hoá dấu, khoảng trắng, ký tự chèn, ký tự thay thế (`0`→`o`, `1`→`i`).
* **AC-CHAT-02-03** — Sticker chưa có ở P1 (khay ẩn).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TE-01](../tasks/TE-01.md) BE: chat 2 kênh, quyền đọc theo mốc ngồi ghế, giới hạn, lọc từ cấm | R6 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
