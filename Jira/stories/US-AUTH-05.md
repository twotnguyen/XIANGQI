# [US-AUTH-05] Hồ sơ cơ bản và đăng xuất

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Story |
| Epic | [EA](../epics/EA-tai-khoan.md) · Tài khoản và phiên (Nhóm A) |
| Nhãn | `P1`, `nhom-EA` |
| Nguồn luật | BA 1.4, 1.6 |
| Đợt sớm nhất có việc | T2 |
| Tổng ngày công của các việc liên quan (một việc có thể phục vụ nhiều Story) | 1,5 |

## Mô tả

Hồ sơ cơ bản và đăng xuất. Chi tiết nghiệp vụ theo nguồn luật ở bảng trên; tài liệu phân tích ở [docs/01](../../docs/01-yeu-cau-chi-tiet.md).

## Tiêu chí nghiệm thu (AC)

* **AC-AUTH-05-01** — Ở `/settings` đổi *Tên hiển thị* (2–30 ký tự, có dấu, có khoảng trắng); chứa từ cấm thì **từ chối lưu** kèm thông báo.
* **AC-AUTH-05-02** — `Username` và `Email` hiển thị nhưng **không sửa được** ở P1 (nút đổi Username `DISABLED` + "Sắp ra mắt"; email luôn khoá).
* **AC-AUTH-05-03** — Avatar luôn là chữ cái đầu của tên hiển thị; không có tải ảnh.
* **AC-AUTH-05-04** — Đăng xuất khi không trong ván: thực hiện rời phòng theo BA 1.8 nếu còn ghế, xoá phiên và về `/login`. Khi đang đấu online/AI, dùng xác nhận hậu quả đầu hàng; Huỷ giữ nguyên. Đồng ý chỉ báo hoàn tất khi máy chủ đã nhận đầu hàng/rời ván, không âm thầm biến thành mất mạng.
* **AC-AUTH-05-05** — Nếu lệnh Đăng xuất giữa ván lỗi hoặc chưa rõ đã nhận, giữ trạng thái chờ/lỗi và đối soát ván bằng cùng định danh lệnh; không tạo hai kết quả. Đóng tab/mất mạng vẫn theo ân hạn, không phải chủ động đầu hàng.

## Việc liên quan (Task)

| Việc | Vai trò | Ngày | Đợt |
|---|---|---:|---|
| [TA-06](../tasks/TA-06.md) FE: hồ sơ cơ bản: đổi tên hiển thị, đăng xuất | R5 | 1 | T2 |
| [TA-06b](../tasks/TA-06b.md) BE: cập nhật tên hiển thị có lọc từ cấm ở máy chủ (client không ghi trực tiếp) | R2 | 0,5 | T2 |

## Kiểm thử

Xem [docs/05 mục 4](../../docs/05-kiem-thu.md) (tình huống bắt buộc theo nhóm) và kịch bản demo D1–D10 ở mục 1.

## Định nghĩa hoàn thành

Đạt toàn bộ AC ở trên; **tất cả việc liên quan Done (kể cả đợt 2 và 3)**; kiểm thử tự động xanh; đủ 5 trạng thái cho giao diện của Story. Nếu đến hạn mà chưa xong thì Story ở trạng thái *một phần* (ghi rõ việc chưa làm), **không** đánh Done và **báo Product Owner**; không tự cắt phạm vi (BA 10.1).
