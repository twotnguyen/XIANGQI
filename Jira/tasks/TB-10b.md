# [TB-10b] FE: danh sách người xem và xác nhận đuổi

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
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R5 · ngày 17,18; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R4 · ngày 9,97 |
| Tiền đề (is blocked by) | [TB-10](../tasks/TB-10.md), [TB-06](../tasks/TB-06.md) |
| Story liên quan (relates to) | [US-ROOM-09](../stories/US-ROOM-09.md) |

## Mô tả

Giao diện: danh sách người xem và xác nhận đuổi.

## Việc cần làm

- [ ] `PANEL-SPECTATORS` hiển thị *Người xem (X / N)*, nút *Kick* cho Host và người chơi còn lại
- [ ] `MODAL-CONFIRM-KICK` với câu xác nhận theo BA 4.2, mặc định focus ở Huỷ
- [ ] Thông báo cho người bị đuổi

## Đầu ra

* Giao diện đuổi người xem

## Cách kiểm thử và nghiệm thu

* Kiểm cùng `TB-06`: người bị đuổi không vào lại; kiểm thử đuổi nằm ở đây vì thuộc đợt 2

## Tham chiếu

US-ROOM-09

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
