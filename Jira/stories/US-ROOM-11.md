# [US-ROOM-11] Sau ván CASUAL: quay về phòng chờ

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.3 mục 8 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Sau ván CASUAL: quay về phòng chờ. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-ROOM-11-01** — Khi ván kết thúc phòng ở `FINISHED` tối đa 10 phút; hết hạn nếu vẫn `FINISHED` thì đóng và đưa thành viên còn lại về Sảnh. Đã trở lại `WAITING` thì hẹn giờ FINISHED cũ không được đóng phòng.
* **AC-ROOM-11-02** — Một người ngồi ghế rời, hoặc thành phần người ngồi ghế đổi, thì phòng về `WAITING`, người còn lại giữ ghế và quyền Host (nếu người rời là Host thì chuyển quyền).
* **AC-ROOM-11-03** — Người mới vào theo US-ROOM-05; mất kết nối ở `WAITING` giữ ghế 60 giây.
* **AC-ROOM-11-04** — Ví dụ nghiệm thu (BA 2.8): A và C đánh xong, A rời, C thành Host, C mời B xuống ghế, B và C bấm Sẵn sàng thì đếm ngược và đấu tiếp.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-07](../tasks/TB-07.md) BE: Host rời, chuyển quyền, đóng phòng, quay về phòng chờ | R6 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
