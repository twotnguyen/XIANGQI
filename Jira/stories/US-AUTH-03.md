# [US-AUTH-03] Đăng ký bước 3: xác thực OTP, tạo tài khoản

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EA](../epics/EA-tai-khoan.md) · Tài khoản và phiên (Nhóm A) |
| Nhãn | `P1`, `nhom-EA` |
| Nguồn luật | BA 1.1, 1.5 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 4,5 |

## Mô tả

Đăng ký bước 3: xác thực OTP, tạo tài khoản. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Khi nhập đúng mã trong 3 phút thì tài khoản được tạo, `display_name` = `username`, tự đăng nhập và vào `/lobby`.
* Khi mã hết 3 phút thì báo hết hạn và yêu cầu gửi lại.
* Khi nhập sai mã thì báo sai; khi bị **giới hạn nhập sai** (mục tiêu 5 lần, thực thi gần đúng theo giới hạn tốc độ của hệ thống xác thực, BA 1.5) thì khoá form và bắt buộc chờ hoặc bấm *Gửi lại mã*.
* Khi bỏ dở (đóng tab, hết hạn) thì **không có hồ sơ và không đăng nhập được**, username không bị giữ, và có thể đăng ký lại ngay bằng cùng email.
* Khi username vừa bị người khác lấy trong lúc chờ thì báo lỗi và quay về bước 1.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TA-02](../tasks/TA-02.md) BE: xác minh OTP, hoàn tất đăng ký, hoàn tác, tác vụ quét tài khoản chưa hoàn tất | R2 | 2 | T1 |
| [TA-04](../tasks/TA-04.md) FE: trình hướng dẫn đăng ký 3 bước, OTP 6 ô, đếm lùi | R5 | 2,5 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
