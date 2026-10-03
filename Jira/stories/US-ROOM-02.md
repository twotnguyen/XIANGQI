# [US-ROOM-02] Phòng chờ và ghế ngồi

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4 |

## Mô tả

Phòng chờ và ghế ngồi. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-ROOM-02-01** — Host mặc định ghế Đỏ; khi chỉ có một mình, Host đổi sang ghế Đen hoặc đổi lại không giới hạn số lần.
* **AC-ROOM-02-02** — Người thứ hai vào phòng thì tự xếp vào **ghế còn trống**.
* **AC-ROOM-02-03** — Khi thành phần người ngồi ghế thay đổi thì trạng thái *Sẵn sàng* của cả hai **reset về chưa sẵn sàng** (BA 2.8).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-03](../tasks/TB-03.md) BE: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | R1 | 1,5 | T1 |
| [TB-09](../tasks/TB-09.md) FE: phòng chờ (ghế, Sẵn sàng, đếm ngược, cài đặt phòng) | R5 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
