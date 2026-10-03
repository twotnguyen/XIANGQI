# [US-ROOM-07] Chế độ riêng tư và khoá phòng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | BA 2.7, 4.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4 |

## Mô tả

Chế độ riêng tư và khoá phòng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Host đổi giữa `PUBLIC`, `CODE_ONLY`, `LOCKED` bất kỳ lúc nào (kể cả đang đấu); riêng `LOCKED` chỉ bật được khi **đã đủ 2 người chơi** (nếu chưa thì nút `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"*).
* `LOCKED`: phòng biến mất khỏi Sảnh; **không ai mới vào được** dù có link, mã hay QR; người đang có ghế hoặc đang xem **giữ nguyên** và vẫn xem được.
* Người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi trong 60 giây, người xem trong 5 phút); quá hạn coi như người mới.
* `CODE_ONLY`: không hiện ở Sảnh; vào bằng mã hoặc link.
* Xác nhận khi chuyển `LOCKED`: *"Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại."*

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-05](../tasks/TB-05.md) BE: riêng tư, khoá phòng, thu hồi link, kết nối lại theo vai trò | R2 | 1,5 | T1 |
| [TB-09](../tasks/TB-09.md) FE: phòng chờ (ghế, Sẵn sàng, đếm ngược, cài đặt phòng) | R5 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
