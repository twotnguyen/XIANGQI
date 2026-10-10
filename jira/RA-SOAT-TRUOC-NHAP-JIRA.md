# Rà soát trước khi cập nhật Jira — 09/10/2026

> **Cập nhật sau đợt rà soát:** Jira đã được cập nhật và xác minh đủ XIAN-1–XIAN-107 theo ánh xạ tuyến tính. Xem [Kết quả cập nhật Jira](KET-QUA-CAP-NHAT-JIRA.md). Các phần bên dưới ghi lại trạng thái lịch sử trước khi cập nhật, không phải trạng thái Jira hiện tại.

**Kết luận: bộ kế hoạch local đã được rà và đồng bộ; CSV chưa đủ điều kiện cập nhật trực tiếp lên dự án thật nếu phải giữ XIAN-1–XIAN-107.** Không có thao tác sửa, tạo, xoá hoặc chuyển trạng thái Jira trong đợt rà soát này.

## Phạm vi

Đối chiếu BA-SCOPE-DECISIONS, BACKLOG-P1, DESIGN, DANH-MUC-MAN-HINH-XIANGQI, IDEA, README; nguồn 107 Description, dữ liệu 71 Task, bản đồ 268 tiêu chí nghiệm thu; các báo cáo phân công/ước lượng, kế hoạch, bản chi tiết, Components/Labels và CSV. Đọc lại cấu trúc/hướng dẫn công cụ site: đó là công cụ cũ tham chiếu `docs/` đã xoá, không phải nguồn đặc tả hiện hành. Các báo cáo `_analysis/` là bằng chứng lịch sử của website, không phải kiểm nghiệm sản phẩm hoặc kế hoạch mới.

## Kết quả kiểm local

| Nội dung | Kết quả |
|---|---|
| Số lượng | 9 Epic, 27 Story, 71 Task; 107 mã nội bộ duy nhất |
| Giờ / điểm | 848 giờ / 198 điểm theo công thức quy đổi giờ hiện có; điểm này không phải đánh giá độ khó độc lập |
| Description | 107 mục có mục tiêu, bối cảnh, yêu cầu, việc làm, bàn giao, hoàn thành và phạm vi |
| Nghiệm thu | 268 tiêu chí duy nhất, đủ liên kết triển khai/kiểm chứng; không bỏ tiêu chí |
| Phân công | Tình 10 Task/140h; Đông 9/136h; Tùng 9/132h; Cường 10/124h; Nhạn 11/104h; Kỳ 12/108h; Thư 10/104h |
| T49 | Giữ Kỳ, không chuyển Tình |
| Kiểm thử chuyên đề | Người kiểm độc lập với người triển khai các phần được ánh xạ trong tiêu chí |
| Lịch | Không trùng người, không vượt 8 giờ/ngày, phụ thuộc hoàn thành trước khi việc sau bắt đầu |
| Task kéo qua Sprint | T20, T24, T26, T52, T53; Sprint/nhãn là Sprint bắt đầu, phiên bản bàn giao theo Sprint hoàn tất |
| Mốc cuối | Tổng duyệt sáng 04/11; chiều 04/11 dự phòng; demo 05/11 |
| CSV | 107 dòng dữ liệu, số cột nhất quán, kiểm đúng người/giờ/ngày/điểm/Description/quan hệ/cột Components và Labels lặp |

Kiểm lại bằng `python3 jira/build_plan.py --check`. Kiểm máy chỉ chứng minh tính nhất quán của dữ liệu và lịch theo giả định; không chứng minh tốc độ làm việc, khả thi dịch vụ ngoài, tiêu chí đã đạt hoặc import đã thành công.

## Những điểm đã sửa trong lần rà này

1. **Fix version của Task kéo qua Sprint:** trước đó lấy theo Sprint bắt đầu, khiến việc chưa xong bị gắn bản bàn giao sớm. Đã lấy theo Sprint hoàn tất; không đổi Sprint bắt đầu hoặc tạo thêm Task.
2. **Nguồn giới thiệu và phân vai cũ:** IDEA cập nhật 848 giờ và mốc 04/11; BACKLOG/BA đồng bộ Tùng làm lõi luật và ván online, Đông tinh chỉnh máy cờ, Tình giữ phần nền/media. Quyền hỗ trợ FE của Cường được ghi theo quyết định người dùng.
3. **Chat khi đổi bên:** danh mục màn hình ghi rõ cùng cặp đổi bên/chơi ván tiếp giữ chat ngay ở P1; chỉ Tái đấu là P2.
4. **Tham chiếu thiếu:** bỏ liên kết tới AGENTS.md không tồn tại; giữ nguyên quy tắc toạ độ, thuật ngữ và hạn chế thư viện trong DESIGN. Ước lượng FE không được giả định thêm thư viện giao diện dựng sẵn trái DESIGN.
5. **Nghiệm thu cơ sở dữ liệu quá sớm:** T14 hoàn tất trước T09, nên không thể chứng minh toàn bộ tệp tạo bảng đã có. T14 kiểm phần đã bàn giao; AC-00.2.1/2 chuyển sang T51 với đủ đầu vào T04/T09/T12/T14. Bổ sung kiểm dựng cơ sở dữ liệu trống và quyền toàn bộ bảng trong Description T51.
6. **Thiếu người sở hữu việc dọn Khách:** Description T56 nay ghi rõ điều phối hết phiên/đăng xuất, dọn tên và dữ liệu cá nhân, về Đăng nhập, tạo danh tính mới lần sau. T51 kiểm cả hết hạn và chủ động đăng xuất, giữ ngoại lệ không ngắt Khách đang ngồi ghế/trong ván.
7. **Máy cờ quá 10 giây — người dùng chốt trong lượt rà này:** giữ nguyên mã ván/thế/lượt/phe; Thử lại tính nước trên cùng thế, không gửi lại nước người. Đồng bộ BA, AC-08.3.3, Story và T38/T63/T68; kiểm kết quả tác vụ cũ đến muộn để không đi hai nước. Không đổi nhánh lỗi thực sự đã làm ván Bỏ dở hoặc mất trạng thái sau restart.
8. **Tình trạng website tài liệu:** đánh dấu hướng dẫn site là lịch sử, không dùng số lượng tài liệu cũ hoặc báo cáo website làm bằng chứng cho kế hoạch mới.

Các bổ sung làm rõ việc đã có trong tiêu chí, không đổi 848 giờ, phân công, số lượng mục hoặc ngưỡng nghiệm thu. Giờ dự kiến vẫn cần được theo dõi khi thực hiện; không khẳng định việc làm rõ không bao giờ ảnh hưởng công thực tế.

## Đối chiếu Jira thật — chỉ đọc

Truy vấn dự án XIAN ngày 09/10/2026 trả về đủ một trang 98 mục đang nhìn thấy, tất cả To Do:

| Trên Jira | Bộ local |
|---|---|
| 8 Epic: XIAN-1–XIAN-8 | 9 Epic |
| 26 Story: XIAN-9–XIAN-34 | 27 Story |
| 64 Task: XIAN-35–XIAN-98 | 71 Task |
| Chưa thấy XIAN-99–XIAN-107 trong kết quả | Mục tiêu 107 khóa |

Nguồn truy vấn: dự án [XIAN](https://xiangqi-web.atlassian.net/browse/XIAN-1), `project = XIAN ORDER BY key ASC`. Đây là dữ liệu truy cập thấy được tại thời điểm kiểm; không xác nhận rằng chưa từng có mục bị xoá hoặc bộ đếm cấp khóa sẽ bắt đầu ở 99.

**Không được suy ra khóa XIAN từ Issue Id trong CSV.** Ví dụ Issue Id 9 ở local là Epic EP-08, trong khi XIAN-9 thật đang là Story. Local 35/36 là Story nhưng XIAN-35/36 thật là Task. Tên/nội dung nhiều mục cũng khác. Nhập theo số thứ tự hoặc tạo mới toàn bộ có thể không bảo toàn các khóa người dùng yêu cầu.

## Các bước còn lại trước khi cập nhật thật

1. **Chốt bảng ánh xạ 107 mục sang khóa XIAN:** export/sao lưu dữ liệu hiện có; xác định mục nào cập nhật nội dung, mục nào cần đổi loại và mục nào cần tạo thêm. Không xoá rồi tạo lại để cố lấy cùng khóa. Nếu chọn ánh xạ số tuyến tính thì ba trường hợp XIAN-9/35/36 đổi loại phải được xử lý rõ; chưa mặc định chọn cách đó.
2. **Đối chiếu bảy tài khoản thật:** tên ngắn trong CSV chưa phải định danh tài khoản. Xác minh người nhận, người báo cáo và quyền sửa trường; không tự suy ra chỉ từ tên gần giống.
3. **Đối chiếu cấu hình đích:** Sprint, phiên bản, Components, Time tracking, Story Points, cha Epic cho Story/Task và liên kết relates to/is blocked by. Tạo thiếu, không tạo trùng; kiểm cách nhập hỗ trợ các trường trên bằng một mẫu trước.
4. **Chuẩn bị bản cập nhật theo khóa đã xác minh:** CSV hiện tại là nguồn nội dung/quan hệ tham chiếu, chưa có cột khóa cập nhật Jira. Cần bản cập nhật riêng hoặc thao tác qua công cụ hỗ trợ khóa thật. Parent Id/Story/Blocked by trong CSV hiện đều là tham chiếu nội bộ, không phải ID hệ thống Jira.
5. **Kiểm sau cập nhật:** đúng 107 khóa mục tiêu; đủ 9/27/71; tổng Task 848h; T49 Kỳ; đúng người, Description, thành phần/nhãn, ngày, Sprint, phiên bản, cha và liên kết; không còn quan hệ cũ sai hoặc tạo mục trùng. Việc hoàn tất một lần kiểm file không thay được bước này.

Đợt này hoàn tất rà soát và sửa tài liệu local. Chưa thực hiện ánh xạ khóa cuối cùng, import thử, cập nhật Jira hoặc commit/push.

## Các giới hạn còn cần theo dõi khi triển khai

- AI hỗ trợ là giả định của 848 giờ, chưa có số đo năng suất của nhóm. Các Task kiểm thử 4 giờ, máy cờ và cấu hình xác thực/media cần theo dõi sớm.
- Bộ thế bắt buộc và cỡ mẫu ngẫu nhiên được chuẩn bị/thống nhất trong Task tương ứng, không tự coi một vài lượt thử là đạt; không lấy đáp án từ chính chương trình đang kiểm làm chuẩn duy nhất.
- Cổng kỹ thuật về gửi thư, Google, quyền đổi email, phiên, sức chơi/tốc độ, media và tải vẫn phải được thực hiện; chưa có sản phẩm để chứng minh PASS.
- Chỉ còn nửa ngày dự phòng; việc sửa lỗi và điều phối ngoài Task chưa được phân thành ngân sách riêng. Không tăng ngày làm quá 8 giờ hoặc hạ tiêu chí để giữ mốc demo.
