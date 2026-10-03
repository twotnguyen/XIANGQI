# [TQ-01b] Playwright Mức 2: D2 (tạo phòng) và D6 (ván online đến chiếu hết)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EQ](../epics/EQ-kiem-thu-demo.md) · Kiểm thử chấp nhận và chuẩn bị demo |
| Nhãn | `P1`, `T1`, `R7` |
| Vai trò đề xuất | R7: Kiểm thử, CI/CD, triển khai, chuẩn bị demo |
| Ước lượng (Original estimate) | 1 ngày công |
| Đợt triển khai | T1 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 2 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R7 · ngày 26,56; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R7 · ngày 15 |
| Tiền đề (is blocked by) | [TD-09](../tasks/TD-09.md), [TB-11](../tasks/TB-11.md), [TB-10](../tasks/TB-10.md) |
| Story liên quan (relates to) | — (việc hạ tầng/kiểm thử) |

## Mô tả

Playwright Mức 2: D2 (tạo phòng) và D6 (ván online đến chiếu hết).

## Việc cần làm

- [ ] Hai trình duyệt: tạo phòng, vào bằng mã/link, ghế, Sẵn sàng, đếm 3 giây
- [ ] Ván online đến chiếu hết, đồng hồ, đầu hàng

## Đầu ra

* Bộ Playwright Mức 2

## Cách kiểm thử và nghiệm thu

* Xanh ổn định

## Tham chiếu

docs/05 mục 1

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
