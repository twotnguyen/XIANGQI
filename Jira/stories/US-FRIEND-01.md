# [US-FRIEND-01] Tìm người và gửi lời mời

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EF](../epics/EF-ban-be.md) · Bạn bè (Nhóm F) |
| Nhãn | `P1`, `nhom-EF` |
| Nguồn luật | BA 5.5 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 5,5 |

## Mô tả

Tìm người và gửi lời mời. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-FRIEND-01-01** — Tìm theo `username` (tiền tố, **không phân biệt hoa thường**); kết quả hiện thẻ tóm tắt (avatar, tên hiển thị, `@username`) và nút *Kết bạn*.
* **AC-FRIEND-01-02** — Bấm *Kết bạn* thì gửi lời mời; có thể **thu hồi** lời mời đã gửi. Lời mời tự hết hạn sau 30 ngày.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TF-01](../tasks/TF-01.md) BE: tìm, gửi/thu hồi/trả lời lời mời, huỷ kết bạn, giới hạn, lịch sử từ chối | R2 | 2,5 | T2 |
| [TF-03](../tasks/TF-03.md) FE: trang Bạn bè, chuông, pop-up mời, tab mời trong MODAL-INVITE | R6 | 3 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
