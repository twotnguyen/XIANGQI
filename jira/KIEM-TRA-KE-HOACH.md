# Kiểm tra kế hoạch lập lại 09/10/2026

| Kiểm tra dữ liệu kế hoạch | Kết quả |
|---|---|
| Danh tính/membership kế hoạch local | 9 Epic, 27 Story, 71 Task; 107 ID duy nhất |
| Description độc lập | 107/107; đủ mục tiêu, bối cảnh, yêu cầu, việc làm, bàn giao, điều kiện hoàn thành và phạm vi |
| Mã kế hoạch không giải thích trong Description | 0; kiểm riêng nội dung mô tả, giữ mã liên kết ở các trường quản lý |
| Components / Labels | 107/107; mỗi Task đúng một nhóm chính và nhãn tương ứng |
| CSV | 107 dòng dữ liệu; kiểm đủ trường, cột lặp, ước lượng giây và Fix version theo ngày hoàn tất |
| Phân công theo vai trò | Đạt; BE/FE/Tester và phạm vi hỗ trợ được kiểm tra |
| Đánh giá khối lượng | 71/71 Task có lý do; áp dụng phân công và 848 giờ đã thống nhất |
| Độc lập kiểm chuyên đề theo từng AC | Không tự nghiệm thu phần tính năng mình triển khai |
| Giờ | 848 |
| Điểm | 198 |
| QA chuyên đề | 20 |
| AC duy nhất / truy vết | 268 |
| Phụ thuộc trực tiếp | 186 |
| Chu trình / tham chiếu thiếu / sai thứ tự | 0 / 0 / 0 |
| Trùng người / kiểm Story tự triển khai | 0 / 0 |
| Task kéo sang Sprint kế tiếp | T20, T24, T26, T52, T53 |
| AC nghiệm thu trước đầu vào hoặc thiếu đường phụ thuộc | 0 |
| Song song tối đa | 7 |
| T51 bắt đầu sau mọi triển khai | Đạt; QA chuyên đề chạy song song |
| T70 chờ toàn bộ QA + T51 + T66 | Đạt |
| Hoàn tất kế hoạch | 04/11 sáng |
| 04/11 | Sáng tổng duyệt; chiều dự phòng |

**Giới hạn:** đây là kiểm tra cấu trúc/lịch dự kiến, không phải kiểm thử ứng dụng. Chưa có mã triển khai, TC thực thi, số đo gate hoặc xác nhận import trên Jira. Bằng chứng PASS/FAIL/BLOCKED sẽ được ghi khi thực hiện.

Tái chạy: `python3 jira/build_plan.py --check`.
