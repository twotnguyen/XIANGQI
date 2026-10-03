# [US-AI-01] Chọn cấp độ và phe

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EG](../epics/EG-danh-voi-may.md) · Đánh với máy (Nhóm G) |
| Nhãn | `P1`, `nhom-EG` |
| Nguồn luật | BA 6.1, 6.3 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Chọn cấp độ và phe. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-AI-01-01** — Ở Sảnh có 3 thẻ **Dễ / Trung bình / Khó**; bấm mở `MODAL-AI-SETUP` chọn phe **Đỏ / Đen / Ngẫu nhiên** (50/50 do máy chủ bốc).
* **AC-AI-01-02** — Cầm Đen thì máy (cầm Đỏ) **tự đi nước đầu** và bàn cờ lật cho Đen ở dưới.
* **AC-AI-01-03** — Không có nút gợi ý nước đi.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TG-05](../tasks/TG-05.md) BE: dịch vụ ván với máy (phe, vào lại 30 phút, bỏ dở) | R2 | 2 | T1 |
| [TG-06](../tasks/TG-06.md) FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
