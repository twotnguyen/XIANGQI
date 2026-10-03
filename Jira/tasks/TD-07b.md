# [TD-07b] FE: xin hoà (gửi, nhận, rút, đếm lùi)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [ED](../epics/ED-van-online.md) · Ván đấu online (Nhóm D) |
| Nhãn | `P1`, `T2`, `R4` |
| Vai trò đề xuất | R4: Frontend trưởng: bàn cờ, phòng thi đấu, ván với máy, responsive |
| Ước lượng (Original estimate) | 0,5 ngày công |
| Đợt triển khai | T2 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 4 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R5 · ngày 22,81; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R6 · ngày 10,67 |
| Tiền đề (is blocked by) | [TD-07](../tasks/TD-07.md), [TD-04](../tasks/TD-04.md) |
| Story liên quan (relates to) | [US-PLAY-05](../stories/US-PLAY-05.md) |

## Mô tả

Giao diện: xin hoà (gửi, nhận, rút, đếm lùi).

## Việc cần làm

- [ ] `MODAL-DRAW-PROMPT` cho người nhận (đếm lùi 30 giây)
- [ ] Người gửi thấy *"Đang chờ đối thủ trả lời…"* và *Rút đề nghị*
- [ ] Nút `DISABLED` kèm tooltip số nước còn phải chờ

## Đầu ra

* Xin hoà

## Cách kiểm thử và nghiệm thu

* Playwright: xin hoà đồng ý và từ chối

## Tham chiếu

US-PLAY-05

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
