# [TB-09b] FE: đổi chỗ ghế/người xem trong phòng chờ

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EB](../epics/EB-phong.md) · Phòng, mời, ghế, người xem (Nhóm B) |
| Nhãn | `P1`, `T2`, `R5` |
| Vai trò đề xuất | R5: Frontend: tài khoản, Sảnh, phòng chờ, giao diện chung, trợ năng |
| Ước lượng (Original estimate) | 0,5 ngày công |
| Đợt triển khai | T2 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 4 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R4 · ngày 22,5; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R4 · ngày 12,6 |
| Tiền đề (is blocked by) | [TB-09](../tasks/TB-09.md), [TB-04](../tasks/TB-04.md) |
| Story liên quan (relates to) | [US-ROOM-06](../stories/US-ROOM-06.md) |

## Mô tả

Giao diện: đổi chỗ ghế/người xem trong phòng chờ.

## Việc cần làm

- [ ] Nút *Chuyển sang người xem* cho người ngồi ghế; Host có *Chuyển sang người xem* và *Mời xuống ghế*
- [ ] `DISABLED` kèm tooltip khi không còn chỗ xem
- [ ] Host không có nút chuyển chính mình

## Đầu ra

* Các điều khiển đổi chỗ

## Cách kiểm thử và nghiệm thu

* Kiểm tooltip và trạng thái `DISABLED`

## Tham chiếu

US-ROOM-06

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
