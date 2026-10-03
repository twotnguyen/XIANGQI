# [US-ROOM-03] Sẵn sàng và bắt đầu ván

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

Sẵn sàng và bắt đầu ván. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-ROOM-03-01** — Mỗi người ngồi ghế bật/tắt *Sẵn sàng* tuỳ ý trước khi đối thủ vào.
* **AC-ROOM-03-02** — Khi **cả hai** ngồi ghế và cùng Sẵn sàng thì đếm ngược **3… 2… 1…** (có âm thanh gỗ), rồi tạo ván mới và chuyển sang `SCR-GAME-ROOM`; đồng hồ chạy cho **bên Đỏ**.
* **AC-ROOM-03-03** — Khi một bên bỏ Sẵn sàng trong lúc đếm thì **dừng đếm**.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-03](../tasks/TB-03.md) BE: ghế, Sẵn sàng, đếm 3 giây, bắt đầu ván | R1 | 1,5 | T1 |
| [TB-09](../tasks/TB-09.md) FE: phòng chờ (ghế, Sẵn sàng, đếm ngược, cài đặt phòng) | R5 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
