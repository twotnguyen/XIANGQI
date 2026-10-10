# Kiểm tra kế hoạch đồng bộ Jira — 10/10/2026

| Kiểm tra | Kết quả |
|---|---|
| Dữ liệu | 107 mục khớp snapshot Jira: 9 Epic, 27 Story, 71 Task |
| Description | 107/107 đủ bảy phần, khớp nội dung Jira |
| Status / Resolution | 36 BA Done/Done; 71 Task To Do/Resolution trống |
| Giờ ước lượng / còn lại | 880 / 880; chưa ghi giờ thực tế |
| Story Points Jira | 198 |
| AC | 268 |
| Phụ thuộc | 186 |
| Giới hạn ngày | Tối đa 7 Task/ngày; mỗi người 1 Task/ngày |
| Thứ tự bắt đầu | Epic < Story < Task |
| Độc lập nghiệm thu chuyên đề | Đạt theo AC và phạm vi Task |
| Release | Task không vượt hạn phiên bản; BA không gắn phiên bản |
| Hạn cuối | 2026-11-04 |
| Sprint | 4 future; chưa bắt đầu |
| Task qua ranh giới Sprint | T02, T20, T24, T35, T56 |


## Nhãn Sprint lịch sử chưa đồng bộ trên Jira

Giữ nguyên nhãn từ Jira để bản local phản ánh đúng nguồn; **không dùng các nhãn này để suy ra lịch**. Trường Sprint là nguồn chính. Việc đồng bộ repo không tự sửa dữ liệu Jira.

| Jira | Task | Nhãn hiện tại | Sprint thực tế |
|---|---|---|---|
| XIAN-39 | T03 | sprint-1 | XIAN Sprint 2 |
| XIAN-44 | T08 | sprint-1 | XIAN Sprint 2 |
| XIAN-51 | T15 | sprint-1 | XIAN Sprint 2 |
| XIAN-52 | T16 | sprint-1 | XIAN Sprint 2 |
| XIAN-62 | T26 | sprint-2 | XIAN Sprint 3 |
| XIAN-63 | T27 | sprint-4 | XIAN Sprint 3 |
| XIAN-71 | T35 | sprint-2 | XIAN Sprint 1 |
| XIAN-80 | T44 | sprint-2 | XIAN Sprint 3 |
| XIAN-86 | T50 | sprint-3 | XIAN Sprint 4 |
| XIAN-89 | T53 | sprint-2 | XIAN Sprint 3 |
| XIAN-92 | T56 | sprint-3 | XIAN Sprint 2 |
| XIAN-99 | T63 | sprint-3 | XIAN Sprint 2 |
| XIAN-104 | T68 | sprint-4 | XIAN Sprint 3 |


## Giới hạn

- Lịch có cuối tuần; không còn nửa ngày dự phòng 04/11.
- Giờ theo Sprint được phân bổ đều trên các ngày của Task để trình bày, không phải giờ log hoặc lịch giờ cụ thể.
- Cấu hình Resolution đã lưu và đọc lại, chưa thử chuyển Task thật.
- Không xác nhận mã sản phẩm, ca kiểm thử, gate, thiết bị hoặc quyền GitHub của từng người đã sẵn sàng.
- Kiểm khớp snapshot không thay thế truy vấn live khi Jira có thay đổi mới.

Tái chạy: `python3 jira/build_plan.py --check`.
