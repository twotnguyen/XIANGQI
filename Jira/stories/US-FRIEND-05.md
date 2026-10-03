# [US-FRIEND-05] Giới hạn

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EF](../epics/EF-ban-be.md) · Bạn bè (Nhóm F) |
| Nhãn | `P1`, `nhom-EF` |
| Nguồn luật | BA 5.5 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2,5 |

## Mô tả

Giới hạn. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-FRIEND-05-01** — Tối đa 200 bạn và 50 lời mời đang chờ **tổng gửi + nhận** mỗi người; vượt thì nút `DISABLED` kèm tooltip, máy chủ cũng chặn. Kiểm giới hạn cả hai tài khoản khi gửi/chấp nhận để không vượt trần bởi lệnh đồng thời.
* **AC-FRIEND-05-02** — Hai lời mời ngược chiều đồng thời giữ một lời mời chờ, không tự thành bạn; thu hồi/hết hạn không tính là một lần Từ chối (BA 5.5).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TF-01](../tasks/TF-01.md) BE: tìm, gửi/thu hồi/trả lời lời mời, huỷ kết bạn, giới hạn, lịch sử từ chối | R2 | 2,5 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
