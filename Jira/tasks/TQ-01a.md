# [TQ-01a] Playwright Mức 1: D1 (đăng ký/đăng nhập) và D8 (ván với máy cấp Dễ/Trung bình)

> **Bản nháp để Product Owner review. Chưa tạo trên Jira.** Dự án Jira dự kiến: **XIAN** (site `xiangqi-web`). Khoá thật `XIAN-<số>` do Jira cấp khi tạo; không đoán số (AGENTS §5).

| Trường Jira | Giá trị |
|---|---|
| Loại | Task |
| Epic | [EQ](../epics/EQ-kiem-thu-demo.md) · Kiểm thử chấp nhận và chuẩn bị demo |
| Nhãn | `P1`, `T1`, `R7` |
| Vai trò đề xuất | R7: Kiểm thử, CI/CD, triển khai, chuẩn bị demo |
| Ước lượng (Original estimate) | 1 ngày công |
| Đợt triển khai | T1 |
| Mức phạm vi sớm nhất cần việc này ([docs/06](../../docs/06-ke-hoach-jira.md) mục 1) | Mức 1 |
| Mô phỏng xếp lịch theo lớp mức (người làm gợi ý, ngày xong; xem [docs/06](../../docs/06-ke-hoach-jira.md) mục 1a) | cơ sở (hệ số 0,8): R7 · ngày 22,19; rất lạc quan (−30%, hệ số 1,0; chỉ để thử độ nhạy): R7 · ngày 12,55 |
| Tiền đề (is blocked by) | [TA-08](../tasks/TA-08.md), [TA-04](../tasks/TA-04.md), [TA-05](../tasks/TA-05.md), [TG-06](../tasks/TG-06.md), [TD-07](../tasks/TD-07.md) |
| Story liên quan (relates to) | — (việc hạ tầng/kiểm thử) |

## Mô tả

Playwright Mức 1: D1 (đăng ký/đăng nhập) và D8 (ván với máy cấp Dễ/Trung bình).

## Việc cần làm

- [ ] Đăng ký 3 bước (OTP giả), đăng nhập, đăng xuất
- [ ] Ván với máy cấp Dễ và Trung bình, cầm Đỏ và cầm Đen, đến khi kết thúc
- [ ] Dữ liệu thử và tài khoản kiểm thử (không dùng email thật); chạy trên CI

## Đầu ra

* Bộ Playwright Mức 1

## Cách kiểm thử và nghiệm thu

* Xanh ổn định nhiều lần chạy

## Tham chiếu

docs/05 mục 1

## Định nghĩa hoàn thành

Xem [docs/06 mục 11](../../docs/06-ke-hoach-jira.md): đạt AC liên quan, kiểm thử xanh trên CI, có review, đủ 5 trạng thái (nếu có giao diện), không có lỗi Nghiêm trọng/Cao mở, tài liệu cập nhật, không commit khoá bí mật.
