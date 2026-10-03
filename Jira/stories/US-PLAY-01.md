# [US-PLAY-01] Đi nước qua mạng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [ED](../epics/ED-van-online.md) · Ván đấu online (Nhóm D) |
| Nhãn | `P1`, `nhom-ED` |
| Nguồn luật | BA 3.3; [04] mục 4 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 6 |

## Mô tả

Đi nước qua mạng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Chỉ người ngồi ghế, đúng lượt, mới gửi được nước đi; máy chủ kiểm hợp lệ theo [02] và phát thế mới cho cả phòng (người chơi và người xem) trong **dưới 100 ms** trên mạng cục bộ.
* Nước không hợp lệ bị từ chối và quân về chỗ cũ; trạng thái ván không đổi.
* Lệnh gửi trùng (`commandId`) không làm đi hai lần; lệnh cũ (`matchVersion` lỗi thời) bị từ chối kèm thế mới.
* Quân vừa gửi hiển thị mờ chờ xác nhận (DESIGN §7.4) rồi cố định khi máy chủ xác nhận.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TD-01](../tasks/TD-01.md) BE: dịch vụ ván: nhận nước, tuần tự hoá, biên lai, ghi cơ sở dữ liệu | R1 | 3 | T1 |
| [TD-06](../tasks/TD-06.md) FE: phòng thi đấu (bố cục, đồng hồ, bảng nước đi, trạng thái) | R4 | 3 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
