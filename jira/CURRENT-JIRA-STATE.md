# Trạng thái Jira đã xác minh ngày 10/10/2026

Nguồn xác minh mới nhất: `post-workflow-verification-2026-10-10.json`.

- Board duy nhất: 38; cả 4 Sprint chưa bắt đầu.
- 9 Epic và 27 Story BA: Done, Resolution = Done, không gắn Release triển khai.
- 71 Task: To Do, Resolution trống; tổng 880 giờ. Nhạn và Thư mỗi người 120 giờ.
- Lịch kết thúc 04/11/2026; tối đa 7 Task/ngày, mỗi người 1 Task/ngày; 186 phụ thuộc đầu-cuối không trùng ngày. Lịch dùng cả cuối tuần; 5 Task kéo qua Sprint kế tiếp.
- Release v1.0: 04/11/2026; XIAN-86 thuộc v1.0. Các Release chỉ tính Task triển khai và đang 0% hoàn thành.
- Workflow: transition 5 (Ready For Test → Done) đặt Resolution = Done; transition 9 (Mở lại, Done → To Do) xóa Resolution. Đã lưu và đọc lại cấu hình; không chuyển thử các Task thực tế.

## Phân biệt dữ liệu gốc và dữ liệu Jira hiện tại

`plan-data.json`, `descriptions.json`, `build_plan.py`, `xian-import.csv`, `JIRA-MUC-CHI-TIET.md` và phần kế hoạch sinh tự động là bộ dữ liệu gốc 09/10, tổng 848 giờ. Kiểm tra `build_plan.py --check` xác nhận tính nhất quán của bộ dữ liệu gốc, không xác nhận trạng thái Jira mới nhất. Không nhập lại CSV hoặc dùng bộ sinh này để ghi đè lịch/trạng thái hiện tại trên Jira.

Các thư mục `rebalance-2026-10-10`, `deadline-2026-11-04` và các báo cáo audit cũ là lịch sử từng đợt. Các mục cảnh báo trong báo cáo cũ có thể đã được xử lý. Thay đổi ước lượng gần nhất và lý do nằm trong `readiness-fixes-2026-10-10.json`; kết quả sau sửa workflow nằm trong báo cáo mới nhất nêu trên.
