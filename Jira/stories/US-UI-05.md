# [US-UI-05] Trợ năng

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EH](../epics/EH-giao-dien-chung.md) · Giao diện chung (Nhóm H) |
| Nhãn | `P1`, `nhom-EH` |
| Nguồn luật | AGENTS §6; DESIGN |
| Đợt sớm nhất có việc | T3 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Trợ năng. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-UI-05-01** — Tuân WCAG 2.1 AA: tương phản theo DESIGN §2, điều khiển bằng bàn phím (có vòng tiêu điểm), nhãn cho mọi nút chỉ có biểu tượng, `prefers-reduced-motion` tắt chuyển động, đếm lùi không đọc từng giây (dùng `aria-live` cho thông báo quan trọng).
* **AC-UI-05-02** — Không truyền thông tin chỉ bằng màu.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TH-03](../tasks/TH-03.md) Trợ năng: bàn phím, nhãn, giảm chuyển động, tương phản | R5 | 1,5 | T3 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
