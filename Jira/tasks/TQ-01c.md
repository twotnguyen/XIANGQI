# [TQ-01c] Playwright Mức 3: D4 (người xem), D5 (khoá phòng), D9 (mất kết nối)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EQ](../epics/EQ-kiem-thu-demo.md) · Kiểm thử chấp nhận và chuẩn bị demo |
| Nhãn | `P1`, `T1`, `R7` |
| Vai trò đề xuất | R7: Kiểm thử, CI/CD, triển khai, chuẩn bị demo |
| Ước lượng (Original estimate) | 1 ngày công |
| Đợt triển khai | T1 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 3 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R7 · ngày 27,81; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R7 · ngày 15,7 |
| Tiền đề (is blocked by) | [TQ-01b](../tasks/TQ-01b.md), [TB-11b](../tasks/TB-11b.md), [TD-08](../tasks/TD-08.md), [TD-05](../tasks/TD-05.md) |
| Story liên quan (relates to) | — (việc hạ tầng/kiểm thử) |

## Mô tả

Playwright Mức 3: D4 (người xem), D5 (khoá phòng), D9 (mất kết nối).

## Việc cần làm

- [ ] Người thứ ba và thứ tư làm người xem, người xem thứ ba bị từ chối
- [ ] Khoá phòng: người ngoài có link/mã không vào được
- [ ] Ngắt mạng một bên giữa ván: overlay 60 giây, nối lại, quá hạn thì thua

## Đầu ra

* Bộ Playwright Mức 3

## Cách kiểm thử và nghiệm thu

* Xanh ổn định

## Tham chiếu

docs/05 mục 1

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
