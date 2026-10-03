# [US-ROOM-12] Màn hình từ chối truy cập

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `nhom-EB` |
| Nguồn luật | DANH-MUC mục 14 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 3 |

## Mô tả

Màn hình từ chối truy cập. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Hiện đúng thông báo theo lý do: phòng đầy, bị đuổi, phòng `LOCKED` (nội dung theo BA 4.3); chỉ có một nút *Quay về Sảnh*.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TB-02](../tasks/TB-02.md) BE: vào phòng (mã/link/Sảnh), ghế hoặc người xem, trần, chặn vào | R2 | 2 | T1 |
| [TB-10](../tasks/TB-10.md) FE: chia sẻ phòng (link+mã) và màn từ chối truy cập | R5 | 1 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
