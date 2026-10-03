# [TA-06b] BE: cập nhật tên hiển thị có lọc từ cấm ở máy chủ (client không ghi trực tiếp)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EA](../epics/EA-tai-khoan.md) · Tài khoản và phiên (Nhóm A) |
| Nhãn | `P1`, `T2`, `R2` |
| Vai trò đề xuất | R2: Backend: tài khoản, phòng, bạn bè, dữ liệu |
| Ước lượng (Original estimate) | 0,5 ngày công |
| Đợt triển khai | T2 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 4 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R1 · ngày 13,12; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R1 · ngày 7,35 |
| Tiền đề (is blocked by) | [TA-03](../tasks/TA-03.md) |
| Story liên quan (relates to) | [US-AUTH-05](../stories/US-AUTH-05.md) |

## Mô tả

Máy chủ: cập nhật tên hiển thị có lọc từ cấm (client không ghi trực tiếp vào `profiles`).

## Việc cần làm

- [ ] API cập nhật `display_name` (2–30 ký tự, có dấu, có khoảng trắng)
- [ ] Bộ lọc từ cấm ở máy chủ: **từ chối** (không che `***`) khi chứa từ cấm
- [ ] Chỉ người sở hữu hồ sơ được cập nhật; RLS không cho client ghi trực tiếp

## Đầu ra

* API cập nhật tên hiển thị

## Cách kiểm thử và nghiệm thu

* Từ cấm (kể cả biến thể bỏ dấu/chèn ký tự) bị từ chối
* Người khác không sửa được hồ sơ của mình

## Tham chiếu

US-AUTH-05, BA 1.4, 5.3

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
