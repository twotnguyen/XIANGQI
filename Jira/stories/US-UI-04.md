# [US-UI-04] Responsive

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EH](../epics/EH-giao-dien-chung.md) · Giao diện chung (Nhóm H) |
| Nhãn | `P1`, `nhom-EH` |
| Nguồn luật | BA 10.1 |
| Đợt sớm nhất có việc | T3 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 3 |

## Mô tả

Responsive. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Dùng được ở **360 px** trở lên, không cuộn ngang; bàn cờ chơi được bằng cảm ứng; ở màn nhỏ camera/chat có thể thu thành tab.
* Kiểm ở 360, 390, 1366, 1920 px (DESIGN §13).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TH-02](../tasks/TH-02.md) Responsive từ 360 px cho các màn hình P1 | R4 | 3 | T3 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
