# [US-BOARD-01] Hiển thị bàn cờ

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EC](../epics/EC-ban-co-luat-co.md) · Bàn cờ và luật cờ (Nhóm C) |
| Nhãn | `P1`, `nhom-EC` |
| Nguồn luật | BA 3.1; [02](../../docs/02-luat-co-tuong.md) mục 1 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2,5 |

## Mô tả

Hiển thị bàn cờ. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Bàn SVG 9×10 giao điểm, thế khởi đầu đúng [02] mục 1.2; quân **chỉ chữ Hán** (帥仕相傌俥炮兵 / 將士象馬車砲卒), không chữ Việt/Latin.
* Người cầm Đen thấy bàn **lật ngược**; toạ độ gửi máy chủ luôn theo hệ gốc.
* Có nhãn đọc cho trình đọc màn hình theo toạ độ gốc (DESIGN §7.5).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TC-05](../tasks/TC-05.md) FE: bàn cờ SVG, quân chữ Hán, lật bàn, nhãn đọc | R4 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
