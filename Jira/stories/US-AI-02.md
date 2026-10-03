# [US-AI-02] Chơi với máy

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EG](../epics/EG-danh-voi-may.md) · Đánh với máy (Nhóm G) |
| Nhãn | `P1`, `nhom-EG` |
| Nguồn luật | BA 6.1, 6.3; [02] mục 9 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 5,5 |

## Mô tả

Chơi với máy. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Người chơi đi, máy trả lời với **thời gian tính** (từ lúc bắt đầu tìm) trong ngân sách: Dễ ≤ 300 ms, Trung bình ≤ 1 000 ms, Khó ≤ 3 000 ms; hàng đợi chờ tiến trình rảnh (tối đa 3 giây, chỉ khi máy bận) không tính vào ngân sách nhưng báo *Thử lại* nếu quá; hết ngân sách thì máy đi nước tốt nhất đã tìm được.
* Ván với máy **không giới hạn thời gian** cho người chơi, không có cảnh báo chống treo ván; không tính Elo; **không có nút Xin hoà**, chỉ có *Đầu hàng*.
* Máy không bao giờ đi nước không hợp lệ.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TG-02](../tasks/TG-02.md) Máy cờ: cấp Dễ và Trung bình (ngẫu nhiên có kiểm soát) | R3 | 1 | T1 |
| [TG-03](../tasks/TG-03.md) Máy cờ: cấp Khó (bảng chuyển vị, tìm tĩnh) | R3 | 2 | T2 |
| [TG-06](../tasks/TG-06.md) FE: thẻ cấp độ, AI-SETUP, trang ván với máy | R4 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
