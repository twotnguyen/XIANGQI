# [US-BOARD-02] Chọn quân và gợi ý ô đi bằng click

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EC](../epics/EC-ban-co-luat-co.md) · Bàn cờ và luật cờ (Nhóm C) |
| Nhãn | `P1`, `nhom-EC` |
| Nguồn luật | BA 3.4 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Chọn quân và gợi ý ô đi bằng click. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Click quân của mình: hiện vòng chọn và các **chấm gợi ý** ở mọi giao điểm hợp lệ; quân đối phương ăn được có vòng cố định (không nhấp nháy).
* Click giao điểm hợp lệ: đi nước đó. Hủy chọn: click lại quân, click ô không hợp lệ, hoặc `Esc`.
* Chỉ chọn được quân của mình và chỉ khi tới lượt mình; người xem và ván kết thúc là chỉ đọc.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TC-06](../tasks/TC-06.md) FE: chọn quân, chấm gợi ý, đi bằng click | R4 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
