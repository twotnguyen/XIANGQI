# [US-UI-06] Tính năng P2 hiển thị đúng quy tắc

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EH](../epics/EH-giao-dien-chung.md) · Giao diện chung (Nhóm H) |
| Nhãn | `P1`, `nhom-EH` |
| Nguồn luật | DANH-MUC §7 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Tính năng P2 hiển thị đúng quy tắc. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-UI-06-01** — Lối vào điều hướng chính của tính năng P2 hiển thị `DISABLED` kèm *"Sắp ra mắt"*; chức năng nằm sâu trong màn hình P1 (QR, sticker, Xin đi lại, Xin đổi bên, Tái đấu, Xem lại, đi lại với máy, widget AI, bộ chọn giao diện) **ẩn hoàn toàn**.
* **AC-UI-06-02** — P1 luôn Kỳ Đài Cổ Phong; Giấy Sáng/Theo hệ thống thuộc US-UI-P2-01, không tự đổi theo cài đặt hệ điều hành ở P1 (BA 10.3).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TH-01](../tasks/TH-01.md) Thanh điều hướng, mục P2 DISABLED, banner ván dở | R5 | 1,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
