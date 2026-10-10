# Kết quả cập nhật Jira XIAN

Đã thực hiện theo ánh xạ tuyến tính do Tình chốt, qua kết nối Atlassian và giao diện Computer. Không sử dụng CSV.

Thời điểm xác minh: 2026-10-09 16:57:34 UTC (23:57 ngày 09/10/2026 tại Việt Nam).

| Dải mã thật | Kế hoạch | Số lượng |
|---|---|---|
| XIAN-1–XIAN-9 | EP-00–EP-08 | 9 Epic |
| XIAN-10–XIAN-36 | Story theo thứ tự kế hoạch | 27 Story |
| XIAN-37–XIAN-107 | T01–T71 | 71 Task |

T05 — lõi luật đi/ăn của bảy loại quân đã ở [XIAN-41](https://xiangqi-web.atlassian.net/browse/XIAN-41).

## Thao tác đã thực hiện

- Cập nhật 98 mục hiện có; giữ khóa và lịch sử của từng mục.
- Đổi XIAN-9 từ Story thành Epic; đổi XIAN-35 và XIAN-36 từ Task thành Story.
- Tạo đúng chín Task XIAN-99–XIAN-107, tương ứng T63–T71.
- Đồng bộ 107 Description, Summary, Assignee, Priority, Labels, Components, ngày bắt đầu/kết thúc, phiên bản bàn giao và Epic cha. Reporter của tất cả các mục đã là tài khoản Tình và được giữ nguyên.
- Tạo 12 Components còn thiếu; dùng lại QA & DevOps. Mỗi Task có đúng một nhóm chính FE, BE hoặc QA & DevOps cùng nhãn nhóm chính. Tám Components tên cũ vẫn còn trong danh mục nhưng không gán cho mục nào của kế hoạch mới.
- Thêm Story Points vào màn hình Task/Story riêng của XIAN; nhập 198 điểm cho Task. Epic/Story không mang điểm hoặc Sprint; giờ riêng bằng 0 để không cộng trùng.
- Đồng bộ 71 Original Estimate và Remaining Estimate, tổng 848 giờ. Không ghi giờ đã làm.
- Giữ bốn Sprint ở trạng thái future: 10–16/10, 17–23/10, 24–30/10, 31/10–04/11. Sprint cuối kết thúc trưa 04/11; chiều dự phòng, demo 05/11. Đồng bộ bốn phiên bản v0.1/v0.2/v0.3/v1.0, chưa phát hành.
- Gỡ 354 liên kết cũ không còn phù hợp; giữ 28 liên kết còn đúng; tạo 229 liên kết mới. Kết quả chính xác 186 quan hệ Blocks và 71 quan hệ Relates giữa Task và Story.

## Kiểm chứng

Đọc lại hai trang kết quả Jira, đủ 107 mục. So sánh từng mục với nguồn plan-data.json và descriptions.json: không có sai khác ở loại, mã, nội dung chữ trong Description, tiêu đề, người nhận/người báo cáo, nhóm/nhãn, ước lượng, điểm, ngày, Sprint, phiên bản và cha. Description được so sánh sau khi chuẩn hóa ký hiệu Markdown và khoảng trắng do Jira chuyển đổi.

Kiểm toàn bộ liên kết theo loại và hướng Blocks: 257 liên kết duy nhất; không thiếu, không thừa, không trùng. Cả 107 mục vẫn To Do. Hai bảng XIAN dùng bộ lọc theo project XIAN nên bao gồm các mục mới.

Bộ kiểm dữ liệu local cũng đạt: 107 mục, 71 Task, 848 giờ, 268 tiêu chí nghiệm thu. Đây là xác minh kế hoạch và dữ liệu Jira, chưa phải kiểm nghiệm sản phẩm hoặc xác nhận Task hoàn thành.

## Phân công giữ nguyên

| Người nhận | Task | Giờ |
|---|---|---|
| Tình | 10 | 140 |
| Đông | 9 | 136 |
| Tùng | 9 | 132 |
| Cường | 10 | 124 |
| Nhạn | 11 | 104 |
| Kỳ | 12 | 108 |
| Thư | 10 | 104 |
| Tổng | 71 | 848 |

T49 giữ Kỳ. Task thường thuộc Epic, liên kết với Story bằng relates to; không đổi thành sub-task.

## Bằng chứng và nguồn

- ANH-XA-JIRA-107-MUC.md: bảng ánh xạ đầy đủ cho người đọc.
- jira-key-account-mapping.json: khóa, tài khoản, cha và quan hệ nguồn.
- JIRA-VERIFICATION-RESULT.json: kết quả kiểm tự động sau cập nhật.
- migration-execution-log.json: nhật ký cập nhật và quan hệ được thay.
- live-before-linear-migration.json: ảnh chụp dữ liệu trước cập nhật; không phải bản sao lưu toàn bộ cấu hình hoặc lịch sử Jira.
- live-after-linear-migration.json: 107 mục và các trường đã đọc lại sau cập nhật.
- RA-SOAT-TRUOC-NHAP-JIRA.md: báo cáo lịch sử của đợt rà soát trước khi cập nhật thật.

Chưa commit/push các tệp bằng chứng của lượt cập nhật Jira này.
