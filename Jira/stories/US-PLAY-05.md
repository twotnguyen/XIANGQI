# [US-PLAY-05] Xin hoà

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [ED](../epics/ED-van-online.md) · Ván đấu online (Nhóm D) |
| Nhãn | `P1`, `nhom-ED` |
| Nguồn luật | BA 3.3, 3.5, 3.6 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Xin hoà. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Gửi đề nghị: người nhận thấy `MODAL-DRAW-PROMPT` với đếm lùi 30 giây; người gửi thấy *"Đang chờ đối thủ trả lời…"* và nút *Rút đề nghị*.
* Đồng ý thì ván hoà; từ chối hoặc hết hạn thì ván tiếp tục.
* Mỗi người chỉ có **1 đề nghị đang chờ**; bị từ chối hoặc hết hạn thì **phải đi thêm 5 nước của mình** mới xin hoà lại (nút `DISABLED` kèm tooltip số nước còn phải chờ).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TD-04](../tasks/TD-04.md) BE: xin hoà và giới hạn gửi lại | R1 | 1 | T2 |
| [TD-07b](../tasks/TD-07b.md) FE: xin hoà (gửi, nhận, rút, đếm lùi) | R4 | 0,5 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
