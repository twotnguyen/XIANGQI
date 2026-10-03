# [US-FRIEND-04] Mời bạn bè online vào phòng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EF](../epics/EF-ban-be.md) · Bạn bè (Nhóm F) |
| Nhãn | `P1`, `nhom-EF` |
| Nguồn luật | BA 2.5 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Mời bạn bè online vào phòng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-FRIEND-04-01** — Trong `MODAL-INVITE` (người ngồi ghế mở), danh sách bạn hiện trạng thái; nút *Mời* chỉ sáng với bạn 🟢 Online.
* **AC-FRIEND-04-02** — Bạn 🟠 Đang đấu thì nút `DISABLED` kèm tooltip *"Bạn bè đang trong ván khác"*; bạn ⚫ Offline thì kèm nhãn *"Ngoại tuyến"*.
* **AC-FRIEND-04-03** — Người được mời thấy pop-up *"Người chơi [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* với *Tham gia* và *Từ chối*, đếm lùi **30 giây** rồi tự tắt.
* **AC-FRIEND-04-04** — Bấm *Tham gia* thì vào phòng theo US-ROOM-05.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TF-02](../tasks/TF-02.md) BE: trạng thái online/đang đấu, mời bạn vào phòng 30 giây | R1 | 1,5 | T2 |
| [TF-03](../tasks/TF-03.md) FE: trang Bạn bè, chuông, pop-up mời, tab mời trong MODAL-INVITE | R6 | 3 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
