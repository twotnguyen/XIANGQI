# [US-ROOM-10] Host rời, chuyển quyền, đóng phòng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Host rời, chuyển quyền, đóng phòng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-ROOM-10-01** — Host rời lúc phòng `WAITING`: nếu còn người chơi thứ hai thì họ thành Host, phòng vẫn mở.
* **AC-ROOM-10-02** — Khi không còn người ngồi ghế sau khi Host rời, đóng phòng dù còn người xem; họ về Sảnh. Ngoài ra phòng còn đóng khi hết hạn `FINISHED` theo US-ROOM-11, không gọi điều kiện hết ghế là nguyên nhân đóng duy nhất.
* **AC-ROOM-10-03** — Đang đấu (`PLAYING`): Host mất kết nối tạm thời **không** đổi Host; Host rời hoặc bị xử thua thì quyền Host chuyển cho người chơi còn lại; rời giữa ván tính là **Đầu hàng**.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-07](../tasks/TB-07.md) BE: Host rời, chuyển quyền, đóng phòng, quay về phòng chờ | R6 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
