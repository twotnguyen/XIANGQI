# Bộ tài liệu Scrum và lập kế hoạch triển khai trên Jira

**Phiên bản:** 1.0 · **Ngày tổng hợp:** 2026-10-04 (UTC+7) · **Ngôn ngữ:** Tiếng Việt.

## Mục đích và phạm vi

Tổng hợp nghiên cứu và trao đổi về: nền tảng Scrum; chuyển yêu cầu thành backlog; thứ tự triển khai; Epic/Story/Task/Sub-task; trường và nội dung Jira; tiêu chuẩn chất lượng; vận hành Sprint; truy vết và nghiệm thu.

Đây là tài liệu tham khảo có nguồn, không phải kế hoạch Sprint đã được nhóm phê duyệt. Không tự đặt người phụ trách, Story Points, capacity, thời hạn hoặc yêu cầu nghiệp vụ còn thiếu. Không có thao tác tạo/sửa ticket hay cấu hình Jira trong lần đóng gói này.

## Đọc theo thứ tự

| Tệp | Nội dung |
|---|---|
| [01 — Nền tảng Scrum](01-nen-tang-scrum.md) | Quy tắc framework và thực hành bổ sung; Product Goal, Sprint Goal, Increment, AC/DoD/DoR |
| [02 — Lập kế hoạch dự án](02-lap-ke-hoach-du-an.md) | Đầu vào, nguồn chuẩn, phân rã, truy vết, các mức độ chi tiết và điều kiện chuyển bước |
| [03 — Thứ tự triển khai](03-thu-tu-trien-khai.md) | Giá trị, phụ thuộc, rủi ro, công việc song song và lựa chọn Sprint |
| [04 — Áp dụng và quan sát Jira](04-ap-dung-jira-va-quan-sat.md) | Hierarchy, field, Parent/Sprint/Version/Links, cơ chế Done và audit XIAN/XW |
| [05 — Mẫu nội dung](05-mau-noi-dung-ticket.md) | Product Goal, Epic, Story, Task, QA, Spike, Sprint Goal, bảng truy vết |
| [06 — Vận hành và kiểm tra](06-van-hanh-sprint-va-checklist.md) | Planning, Daily, Review, Retro; công việc chưa Done; checklist đánh giá |
| [07 — Danh mục nguồn](07-nguon-va-gioi-han.md) | URL, vị trí nội dung, giá trị chứng minh và giới hạn từng nguồn |

## Quy ước bằng chứng

- **[Q] Quy tắc:** được định nghĩa trong Scrum Guide.
- **[H] Hướng dẫn:** thực hành/diễn giải từ Scrum.org hoặc Atlassian; không tự trở thành quy tắc Scrum.
- **[K] Khuyến nghị:** cách tổ chức đề xuất cho nhóm, cần thống nhất trước khi áp dụng.
- **[O] Quan sát:** kết quả kiểm tra Jira riêng trong phiên 2026-10-03; không xác minh lại live khi đóng gói.
- **[V] Ví dụ:** minh họa, không phải requirement/cấu hình/lịch đã xác nhận.

Mỗi tài liệu trỏ tới mã nguồn S01–S17 trong danh mục. Khi có khác biệt, dùng Scrum Guide bản gốc để xác định quy tắc Scrum; dùng cấu hình thực tế để xác định hành vi Jira.

## Bằng chứng Jira kèm theo

Thư mục `evidence/` chứa hai bản ghi từ phiên audit trước: metadata API và inventory browser. Chúng giữ phạm vi nguồn gốc, không phải export toàn bộ Jira. Các đường dẫn Jira riêng có thể cần quyền đăng nhập. Bộ tài liệu có tên project và key ticket riêng, vì vậy nên xem lại trước khi chia sẻ công khai.

## Cách sử dụng

Đọc 01–03 để thống nhất cách làm; dùng 04 để ánh xạ lên Jira; sao chép có chọn lọc mẫu 05; dùng checklist 06 trong refinement/planning/review. Đừng biến mọi mục trong mẫu thành trường bắt buộc khi tạo ticket. Giữ mục chưa biết dưới dạng câu hỏi hoặc giả định, không điền bằng phỏng đoán.
