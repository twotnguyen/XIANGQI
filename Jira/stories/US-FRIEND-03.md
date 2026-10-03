# [US-FRIEND-03] Danh sách bạn và trạng thái

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EF](../epics/EF-ban-be.md) · Bạn bè (Nhóm F) |
| Nhãn | `P1`, `nhom-EF` |
| Nguồn luật | BA 2.5, 5.5 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 7 |

## Mô tả

Danh sách bạn và trạng thái. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Hiện avatar, tên, `@username`, Elo (P2) và trạng thái 🟢 Online / 🟠 Đang đấu / ⚫ Offline.
* Nút *Nhắn tin* và *Thách đấu* `DISABLED` kèm tooltip *"Sắp ra mắt"*; **không có nút mời vào phòng** ở trang này.
* Huỷ kết bạn thì hai bên không còn là bạn.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TF-01](../tasks/TF-01.md) BE: tìm, gửi/thu hồi/trả lời lời mời, huỷ kết bạn, giới hạn, lịch sử từ chối | R2 | 2,5 | T2 |
| [TF-02](../tasks/TF-02.md) BE: trạng thái online/đang đấu, mời bạn vào phòng 30 giây | R1 | 1,5 | T2 |
| [TF-03](../tasks/TF-03.md) FE: trang Bạn bè, chuông, pop-up mời, tab mời trong MODAL-INVITE | R6 | 3 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
