# [US-PLAY-10] Bảng nước đi

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [ED](../epics/ED-van-online.md) · Ván đấu online (Nhóm D) |
| Nhãn | `P1`, `nhom-ED` |
| Nguồn luật | [02] mục 7 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Bảng nước đi. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-PLAY-10-01** — Hiển thị danh sách nước đi theo ký hiệu tiếng Việt (ví dụ `Pháo 2 bình 5`), tự cuộn tới nước mới nhất.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TC-03](../tasks/TC-03.md) Ký hiệu tiếng Việt duy nhất và bộ thế kiểm thử | R3 | 1,5 | T1 |
| [TD-06](../tasks/TD-06.md) FE: phòng thi đấu (bố cục, đồng hồ, bảng nước đi, trạng thái) | R4 | 3 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
