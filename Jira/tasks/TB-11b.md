# [TB-11b] Kiểm thử nhóm B: khoá phòng, người xem, kết nối lại, kịch bản A–E của BA 2.8

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `T1`, `R7` |
| Vai trò đề xuất | R7: Kiểm thử, CI/CD, triển khai, chuẩn bị demo |
| Ước lượng (Original estimate) | 1 ngày công |
| Đợt triển khai | T1 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 3 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R6 · ngày 15; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R6 · ngày 7,87 |
| Tiền đề (is blocked by) | [TB-05](../tasks/TB-05.md), [TB-11](../tasks/TB-11.md) |
| Story liên quan (relates to) | — (việc hạ tầng/kiểm thử) |

## Mô tả

Kiểm thử nhóm phòng: khoá phòng, người xem, kết nối lại, kịch bản A–E (Mức 3).

## Việc cần làm

- [ ] Kiểm thử tích hợp ba client: người xem, trần người xem, `LOCKED`, thu hồi link
- [ ] Người đang có ghế/đang xem mất mạng vào lại được
- [ ] Phiên bản Mức 3 của kịch bản A–E (BA 2.8): người vào sau ghế đã kín thành người xem, khoá phòng chặn người ngoài; **không** gồm đổi chỗ ghế (thuộc `TB-04`, đợt 2), phần đó kiểm ở `TQ-01d`

## Đầu ra

* Bộ kiểm thử phòng đầy đủ xanh (không gồm đuổi người xem, thuộc `TB-06`/`TB-10b` ở đợt 2)

## Cách kiểm thử và nghiệm thu

* Theo docs/05 mục 4 nhóm B

## Tham chiếu

docs/05

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
