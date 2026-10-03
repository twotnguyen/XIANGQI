# [US-AI-04] Sự cố máy cờ

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EG](../epics/EG-danh-voi-may.md) · Đánh với máy (Nhóm G) |
| Nhãn | `P1`, `nhom-EG` |
| Nguồn luật | BA 6.1 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Sự cố máy cờ. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-AI-04-01** — Nếu tiến trình máy cờ lỗi hoặc không phản hồi quá hạn 10 giây thì ván chuyển *Bỏ dở*, báo *"Máy cờ gặp sự cố"* kèm nút *Thử lại*.
* **AC-AI-04-02** — Thử lại sau `ABANDONED`: tạo Match ID mới, cùng cấp độ và phe thực tế, không hồi sinh ván cũ; nếu phe cũ Ngẫu nhiên thì giữ kết quả đã bốc. Kiểm một vị trí chơi và chặn bấm trùng; thất bại không thông báo đã tạo ván (BA 6.1).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TG-04](../tasks/TG-04.md) Tiến trình máy cờ riêng, hàng đợi, hạn chót, khởi động lại | R3 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
