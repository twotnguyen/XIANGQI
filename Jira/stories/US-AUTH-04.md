# [US-AUTH-04] Đăng nhập bằng username và mật khẩu

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EA](../epics/EA-tai-khoan.md) · Tài khoản và phiên (Nhóm A) |
| Nhãn | `P1`, `nhom-EA` |
| Nguồn luật | BA 1.4, 1.8 |
| Đợt sớm nhất có việc | T1 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 2,5 |

## Mô tả

Đăng nhập bằng username và mật khẩu. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* Khi nhập đúng thì vào `/lobby` (hoặc vào đúng phòng nếu đến từ link mời, US-AUTH-06).
* Khi sai tên hoặc mật khẩu thì báo chung *"Sai tên đăng nhập hoặc mật khẩu"* (không nói sai ô nào) và không tiết lộ email.
* Tick *Ghi nhớ đăng nhập* (mặc định tick) thì phiên giữ 30 ngày; bỏ tick thì phiên hết khi đóng trình duyệt hoặc sau 12 giờ.
* Nút *Guest* và *Đăng nhập bằng Google* hiện ở trạng thái `DISABLED` kèm tooltip *"Sắp ra mắt"*.
* Đăng nhập khi đang đăng nhập ở tab/thiết bị khác thì phiên mới tiếp quản, nơi cũ nhận thông báo và chuyển chỉ đọc (BA 1.8).

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TA-03](../tasks/TA-03.md) BE: đăng nhập bằng username, phiên 30 ngày/12 giờ, chặn tài khoản chưa hoàn tất | R2 | 1,5 | T1 |
| [TA-05](../tasks/TA-05.md) FE: đăng nhập, ghi nhớ, nút Guest/Google DISABLED | R5 | 1 | T1 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu dừng phần theo [docs/06](../../docs/06-ke-hoach-jira.md) mục 1b thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm và lối vào đã `DISABLED`/ẩn), **không** đánh Done.
