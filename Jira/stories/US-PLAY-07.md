# [US-PLAY-07] Mất kết nối và kết nối lại

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [ED](../epics/ED-van-online.md) · Ván đấu online (Nhóm D) |
| Nhãn | `P1`, `nhom-ED` |
| Nguồn luật | BA 8.3; DANH-MUC overlay 2 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Mất kết nối và kết nối lại. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-PLAY-07-01** — Khi mất kết nối: lớp phủ không đóng bằng `Esc`. Nội dung theo vai trò:
  * Người chơi **đang đấu**: đếm lùi **60 giây**; nối lại thì tự tắt; quá hạn thì thua `DISCONNECT`; **đồng hồ ván vẫn chạy** (hết giờ trước thì `TIMEOUT`).
  * Người chơi ở phòng chờ/kết thúc: giữ ghế 60 giây rồi mất ghế (không xử thua).
  * Người xem: giữ chỗ 5 phút.
* **AC-PLAY-07-02** — Nối lại thành công: nhận lại thế cờ đầy đủ và đồng hồ chính xác.
* **AC-PLAY-07-03** — Cả hai cùng mất kết nối nhưng máy chủ vẫn chạy: **bên mất kết nối trước thua** nếu cả hai cùng quá hạn.
* **AC-PLAY-07-04** — Máy chủ tự ghi nhận sự cố của chính nó (khởi động lại): ván thành `INTERRUPTED`.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TD-05](../tasks/TD-05.md) BE: mất kết nối, ân hạn theo vai trò, đồng bộ lại, INTERRUPTED | R1 | 2,5 | T1 |
| [TD-07](../tasks/TD-07.md) FE: kết quả, xác nhận đầu hàng/rời, lớp phủ kết nối | R4 | 2 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
