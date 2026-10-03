# [US-AUTH-02] Đăng ký bước 2: email và gửi OTP

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EA](../epics/EA-tai-khoan.md) · Tài khoản và phiên (Nhóm A) |
| Nhãn | `P1`, `nhom-EA` |
| Nguồn luật | BA 1.1, 1.5 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4 |

## Mô tả

Đăng ký bước 2: email và gửi OTP. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Khi email đã có tài khoản thì báo *"Email này đã được đăng ký"* và không gửi OTP.
* Khi email hợp lệ và chưa dùng (hoặc chỉ có bản đăng ký dở) thì gửi mã OTP 6 chữ số và sang bước 3.
* Nút *Gửi lại mã* bị vô hiệu trong 60 giây kể từ lần gửi, kèm bộ đếm lùi và tooltip nêu lý do.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TA-01](../tasks/TA-01.md) BE: kiểm tra username/email, gửi OTP, dùng lại đăng ký dở, tuần tự hoá theo email | R2 | 1,5 | T1 |
| [TA-04](../tasks/TA-04.md) FE: trình hướng dẫn đăng ký 3 bước, OTP 6 ô, đếm lùi | R5 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
