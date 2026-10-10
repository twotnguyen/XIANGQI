# Components và Labels cho 107 mục Jira

Mỗi Task có đúng một component chính: **FE** (giao diện), **BE** (xử lý máy chủ/luật/dữ liệu) hoặc **QA & DevOps** (kiểm thử/hạ tầng/vận hành). Ngoài ra có một hoặc nhiều component chức năng. Nhóm chính phản ánh công việc, không suy ra từ tên người được giao. Ví dụ người làm máy chủ vẫn có thể nhận Task thuộc QA & DevOps khi dựng hạ tầng.

Epic và Story tổng hợp component từ các Task thuộc phạm vi; vì vậy có thể đồng thời chứa FE, BE và QA & DevOps. Đây là phạm vi sản phẩm liên quan; Epic/Story vẫn là công việc đặc tả, không thay đổi phân công hoặc ước lượng.

Component chính được ghi rõ trong dữ liệu kế hoạch và bảng dưới. Khi nhập Jira, nhãn `chinh-fe`, `chinh-be` hoặc `chinh-qa-devops` giữ dấu hiệu nhóm chính; không dựa vào vị trí đầu tiên trong danh sách Components. Epic/Story không có nhãn nhóm chính của Task.

## Danh mục component

| Tên chính xác | Ý nghĩa |
|---|---|
| FE | Giao diện và thao tác trên trình duyệt. |
| BE | Xử lý máy chủ, dữ liệu, luật cờ và máy chọn nước. |
| QA & DevOps | Chuẩn bị/kiểm thử, thử tính khả thi, hạ tầng, đo chất lượng và đóng gói bàn giao. |
| Nền tảng | Bộ khung ứng dụng, kết nối và hạ tầng chung. |
| Tài khoản | Đăng ký, đăng nhập, phiên, hồ sơ và quyền Khách. |
| Phòng chơi | Tạo/vào phòng, ghế, chế độ phòng, Sảnh và người xem. |
| Bạn bè | Quan hệ bạn bè, trạng thái và lời mời bạn vào phòng. |
| Luật cờ | Nước hợp lệ và quy tắc kết thúc ván. |
| Bàn cờ | Hiển thị bàn/quân và thao tác đi quân. |
| Ván trực tuyến | Ván giữa hai người, đồng hồ, kết quả và nối lại. |
| Trò chuyện | Hai kênh tin nhắn, lọc từ và giới hạn gửi. |
| Camera và mic | Truyền hình/tiếng và quyền phát/nhận. |
| Máy cờ | Ván luyện tập, thuật toán chọn nước và xử lý sự cố máy cờ. |


## Quy ước Labels

- `p1`: thuộc bản bàn giao đầu tiên.
- `sprint-1` đến `sprint-4`: nhãn lịch sử, 13 Task đang lệch trường Sprint trên Jira; không dùng làm nguồn lịch. Xem báo cáo kiểm tra để đối chiếu.
- `chinh-fe`, `chinh-be`, `chinh-qa-devops`: đúng một nhãn nhóm chính trên mỗi Task.
- `dac-ta`: công việc đặc tả ở Epic/Story; mã `EP-xx` giữ liên hệ nhóm yêu cầu.
- `phat-trien`, `kiem-thu`: triển khai tính năng hoặc kiểm thử chuyên đề. Các công việc đặc thù dùng `ha-tang`, `chuan-bi-kiem-thu`, `thu-nghiem-ky-thuat`, `kiem-thu-tich-hop`, `do-chat-luong`, `dong-goi-phat-hanh`, `tong-duyet`.
- Nhãn chức năng viết không dấu, nối bằng gạch ngang: `tai-khoan`, `luat-co`, `camera-va-mic`… tương ứng component chức năng để dễ lọc.

## Phân bố Task theo nhóm chính

| Component chính | Số Task |
|---|---|
| FE | 18 |
| BE | 26 |
| QA & DevOps | 27 |


## Chuẩn bị nhập Jira

Tạo/đối chiếu danh mục Components bằng đúng tên bên trên trong dự án đích. CSV xuất mỗi giá trị vào một cột lặp tên `Components` hoặc `Labels`; khi thử nhập cần ánh xạ toàn bộ các cột cùng tên vào trường tương ứng và kiểm việc nhận nhiều giá trị. Không tách chuỗi bằng dấu phẩy hoặc chỉ lấy cột đầu. Không dùng trình đọc CSV chỉ giữ một giá trị cho tên cột trùng.

Bản xuất dùng nhãn để nhận biết nhóm chính, không yêu cầu thêm trường tùy chỉnh. Các nhãn sprint lịch sử có thể lệch; trường Sprint mới là nguồn lịch hiện hành (xem KIEM-TRA-KE-HOACH.md). Kiểm sau nhập: đủ 107 mục có Components/Labels; mỗi Task có đúng một nhóm chính và đúng nhãn; các component chức năng không bị mất. Components/Labels lấy nguyên snapshot Jira, không tự sửa các nhãn cũ trong lượt đồng bộ repo.

## Danh sách đầy đủ

| Mã | Loại | Component chính | Components | Labels |
|---|---|---|---|---|
| EP-00 | Epic | Tổng hợp | BE, Camera và mic, FE, Luật cờ, Máy cờ, Nền tảng, QA & DevOps, Ván trực tuyến | EP-00, camera-va-mic, dac-ta, luat-co, may-co, nen-tang, p1, van-truc-tuyen |
| EP-01 | Epic | Tổng hợp | BE, FE, QA & DevOps, Tài khoản, Ván trực tuyến | EP-01, dac-ta, p1, tai-khoan, van-truc-tuyen |
| EP-02 | Epic | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps, Ván trực tuyến | EP-02, dac-ta, p1, phong-choi, van-truc-tuyen |
| EP-03 | Epic | Tổng hợp | Bạn bè, BE, FE, Phòng chơi, QA & DevOps | EP-03, ban-be, dac-ta, p1, phong-choi |
| EP-04 | Epic | Tổng hợp | Bàn cờ, BE, FE, Luật cờ, QA & DevOps | EP-04, ban-co, dac-ta, luat-co, p1 |
| EP-05 | Epic | Tổng hợp | Bàn cờ, BE, FE, Luật cờ, Phòng chơi, QA & DevOps, Ván trực tuyến | EP-05, ban-co, dac-ta, luat-co, p1, phong-choi, van-truc-tuyen |
| EP-06 | Epic | Tổng hợp | BE, Camera và mic, FE, Phòng chơi, QA & DevOps | EP-06, camera-va-mic, dac-ta, p1, phong-choi |
| EP-07 | Epic | Tổng hợp | BE, Camera và mic, FE, QA & DevOps, Trò chuyện | EP-07, camera-va-mic, dac-ta, p1, tro-chuyen |
| EP-08 | Epic | Tổng hợp | Bàn cờ, BE, FE, Luật cờ, Máy cờ, QA & DevOps | EP-08, ban-co, dac-ta, luat-co, may-co, p1 |
| US-00.1 | Story | Tổng hợp | FE, Nền tảng, QA & DevOps | EP-00, dac-ta, nen-tang, p1 |
| US-00.2 | Story | Tổng hợp | BE, Nền tảng | EP-00, dac-ta, nen-tang, p1 |
| US-00.3 | Story | Tổng hợp | BE, Nền tảng, Ván trực tuyến | EP-00, dac-ta, nen-tang, p1, van-truc-tuyen |
| US-00.4 | Story | Tổng hợp | Camera và mic, Luật cờ, Máy cờ, Nền tảng, QA & DevOps | EP-00, camera-va-mic, dac-ta, luat-co, may-co, nen-tang, p1 |
| US-00.5 | Story | Tổng hợp | Nền tảng, QA & DevOps | EP-00, dac-ta, nen-tang, p1 |
| US-01.1 | Story | Tổng hợp | BE, FE, QA & DevOps, Tài khoản | EP-01, dac-ta, p1, tai-khoan |
| US-01.2 | Story | Tổng hợp | BE, FE, QA & DevOps, Tài khoản | EP-01, dac-ta, p1, tai-khoan |
| US-01.3 | Story | Tổng hợp | BE, FE, QA & DevOps, Tài khoản | EP-01, dac-ta, p1, tai-khoan |
| US-01.4 | Story | Tổng hợp | BE, FE, QA & DevOps, Tài khoản, Ván trực tuyến | EP-01, dac-ta, p1, tai-khoan, van-truc-tuyen |
| US-02.1 | Story | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps | EP-02, dac-ta, p1, phong-choi |
| US-02.2 | Story | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps, Ván trực tuyến | EP-02, dac-ta, p1, phong-choi, van-truc-tuyen |
| US-03.1 | Story | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps | EP-03, dac-ta, p1, phong-choi |
| US-03.2 | Story | Tổng hợp | Bạn bè, BE, FE, QA & DevOps | EP-03, ban-be, dac-ta, p1 |
| US-04.1 | Story | Tổng hợp | BE, Luật cờ | EP-04, dac-ta, luat-co, p1 |
| US-04.2 | Story | Tổng hợp | Bàn cờ, FE, QA & DevOps | EP-04, ban-co, dac-ta, p1 |
| US-04.3 | Story | Tổng hợp | Bàn cờ, FE, QA & DevOps | EP-04, ban-co, dac-ta, p1 |
| US-05.1 | Story | Tổng hợp | Bàn cờ, BE, FE, Luật cờ, QA & DevOps, Ván trực tuyến | EP-05, ban-co, dac-ta, luat-co, p1, van-truc-tuyen |
| US-05.2 | Story | Tổng hợp | BE, FE, QA & DevOps, Ván trực tuyến | EP-05, dac-ta, p1, van-truc-tuyen |
| US-05.3 | Story | Tổng hợp | BE, Phòng chơi, QA & DevOps, Ván trực tuyến | EP-05, dac-ta, p1, phong-choi, van-truc-tuyen |
| US-06.1 | Story | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps | EP-06, dac-ta, p1, phong-choi |
| US-06.2 | Story | Tổng hợp | BE, FE, Phòng chơi, QA & DevOps | EP-06, dac-ta, p1, phong-choi |
| US-06.3 | Story | Tổng hợp | BE, Camera và mic, FE, Phòng chơi, QA & DevOps | EP-06, camera-va-mic, dac-ta, p1, phong-choi |
| US-07.1 | Story | Tổng hợp | BE, FE, QA & DevOps, Trò chuyện | EP-07, dac-ta, p1, tro-chuyen |
| US-07.2 | Story | Tổng hợp | BE, Camera và mic, QA & DevOps | EP-07, camera-va-mic, dac-ta, p1 |
| US-08.1 | Story | Tổng hợp | Bàn cờ, BE, FE, Máy cờ, QA & DevOps | EP-08, ban-co, dac-ta, may-co, p1 |
| US-08.2 | Story | Tổng hợp | BE, Luật cờ, Máy cờ | EP-08, dac-ta, luat-co, may-co, p1 |
| US-08.3 | Story | Tổng hợp | BE, Luật cờ, Máy cờ, QA & DevOps | EP-08, dac-ta, luat-co, may-co, p1 |
| T01 | Task | QA & DevOps | Nền tảng, QA & DevOps | chinh-qa-devops, ha-tang, nen-tang, p1, sprint-1 |
| T02 | Task | QA & DevOps | Luật cờ, Máy cờ, Nền tảng, QA & DevOps | chinh-qa-devops, chuan-bi-kiem-thu, luat-co, may-co, nen-tang, p1, sprint-1 |
| T03 | Task | FE | FE, Nền tảng | chinh-fe, nen-tang, p1, phat-trien, sprint-1 |
| T04 | Task | BE | BE, Tài khoản | chinh-be, p1, phat-trien, sprint-1, tai-khoan |
| T05 | Task | BE | BE, Luật cờ | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| T06 | Task | QA & DevOps | Camera và mic, Nền tảng, QA & DevOps | camera-va-mic, chinh-qa-devops, nen-tang, p1, sprint-1, thu-nghiem-ky-thuat |
| T07 | Task | BE | BE, Luật cờ | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| T08 | Task | FE | FE, Tài khoản | chinh-fe, p1, phat-trien, sprint-1, tai-khoan |
| T09 | Task | BE | BE, Tài khoản | chinh-be, p1, phat-trien, sprint-1, tai-khoan |
| T10 | Task | BE | BE, Luật cờ | chinh-be, luat-co, p1, phat-trien, sprint-1 |
| T11 | Task | FE | Bàn cờ, FE | ban-co, chinh-fe, p1, phat-trien, sprint-1 |
| T12 | Task | BE | BE, Nền tảng, Ván trực tuyến | chinh-be, nen-tang, p1, phat-trien, sprint-1, van-truc-tuyen |
| T13 | Task | QA & DevOps | QA & DevOps, Tài khoản | chinh-qa-devops, kiem-thu, p1, sprint-2, tai-khoan |
| T14 | Task | BE | BE, Nền tảng | chinh-be, nen-tang, p1, phat-trien, sprint-1 |
| T15 | Task | FE | FE, Tài khoản | chinh-fe, p1, phat-trien, sprint-1, tai-khoan |
| T16 | Task | QA & DevOps | Bàn cờ, QA & DevOps | ban-co, chinh-qa-devops, kiem-thu, p1, sprint-1 |
| T17 | Task | QA & DevOps | QA & DevOps, Tài khoản | chinh-qa-devops, kiem-thu, p1, sprint-2, tai-khoan |
| T18 | Task | BE | BE, Phòng chơi | chinh-be, p1, phat-trien, phong-choi, sprint-2 |
| T19 | Task | FE | Bàn cờ, FE | ban-co, chinh-fe, p1, phat-trien, sprint-1 |
| T20 | Task | BE | BE, Luật cờ, Ván trực tuyến | chinh-be, luat-co, p1, phat-trien, sprint-1, van-truc-tuyen |
| T21 | Task | FE | FE, Phòng chơi | chinh-fe, p1, phat-trien, phong-choi, sprint-2 |
| T22 | Task | BE | BE, Phòng chơi | chinh-be, p1, phat-trien, phong-choi, sprint-2 |
| T23 | Task | BE | BE, Ván trực tuyến | chinh-be, p1, phat-trien, sprint-2, van-truc-tuyen |
| T24 | Task | BE | BE, Luật cờ, Máy cờ | chinh-be, luat-co, may-co, p1, phat-trien, sprint-1 |
| T25 | Task | FE | Bàn cờ, FE, Ván trực tuyến | ban-co, chinh-fe, p1, phat-trien, sprint-2, van-truc-tuyen |
| T26 | Task | FE | FE, Phòng chơi | chinh-fe, p1, phat-trien, phong-choi, sprint-2 |
| T27 | Task | QA & DevOps | Bàn cờ, QA & DevOps | ban-co, chinh-qa-devops, kiem-thu, p1, sprint-4 |
| T28 | Task | QA & DevOps | Phòng chơi, QA & DevOps | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-3 |
| T29 | Task | QA & DevOps | Phòng chơi, QA & DevOps | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-3 |
| T30 | Task | QA & DevOps | Luật cờ, QA & DevOps, Ván trực tuyến | chinh-qa-devops, kiem-thu, luat-co, p1, sprint-3, van-truc-tuyen |
| T31 | Task | BE | Bạn bè, BE | ban-be, chinh-be, p1, phat-trien, sprint-3 |
| T32 | Task | BE | BE, Ván trực tuyến | chinh-be, p1, phat-trien, sprint-2, van-truc-tuyen |
| T33 | Task | BE | BE, Camera và mic | camera-va-mic, chinh-be, p1, phat-trien, sprint-3 |
| T34 | Task | BE | BE, Máy cờ | chinh-be, may-co, p1, phat-trien, sprint-2 |
| T35 | Task | BE | BE, Tài khoản | chinh-be, p1, phat-trien, sprint-2, tai-khoan |
| T36 | Task | FE | FE, Ván trực tuyến | chinh-fe, p1, phat-trien, sprint-3, van-truc-tuyen |
| T37 | Task | BE | BE, Trò chuyện | chinh-be, p1, phat-trien, sprint-2, tro-chuyen |
| T38 | Task | FE | Bàn cờ, FE, Máy cờ | ban-co, chinh-fe, may-co, p1, phat-trien, sprint-3 |
| T39 | Task | QA & DevOps | QA & DevOps, Ván trực tuyến | chinh-qa-devops, kiem-thu, p1, sprint-3, van-truc-tuyen |
| T40 | Task | FE | Bạn bè, FE | ban-be, chinh-fe, p1, phat-trien, sprint-3 |
| T41 | Task | BE | BE, Phòng chơi, Ván trực tuyến | chinh-be, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| T42 | Task | FE | FE, Trò chuyện | chinh-fe, p1, phat-trien, sprint-3, tro-chuyen |
| T43 | Task | QA & DevOps | Bàn cờ, Máy cờ, QA & DevOps | ban-co, chinh-qa-devops, kiem-thu, may-co, p1, sprint-3 |
| T44 | Task | FE | FE, Tài khoản | chinh-fe, p1, phat-trien, sprint-2, tai-khoan |
| T45 | Task | QA & DevOps | Camera và mic, QA & DevOps | camera-va-mic, chinh-qa-devops, kiem-thu, p1, sprint-3 |
| T46 | Task | FE | FE, Phòng chơi, Ván trực tuyến | chinh-fe, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| T47 | Task | QA & DevOps | QA & DevOps, Trò chuyện | chinh-qa-devops, kiem-thu, p1, sprint-3, tro-chuyen |
| T48 | Task | QA & DevOps | QA & DevOps, Tài khoản | chinh-qa-devops, kiem-thu, p1, sprint-3, tai-khoan |
| T49 | Task | QA & DevOps | Bạn bè, QA & DevOps | ban-be, chinh-qa-devops, kiem-thu, p1, sprint-4 |
| T50 | Task | QA & DevOps | Phòng chơi, QA & DevOps, Ván trực tuyến | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-3, van-truc-tuyen |
| T51 | Task | QA & DevOps | Nền tảng, QA & DevOps | chinh-qa-devops, kiem-thu-tich-hop, nen-tang, p1, sprint-4 |
| T52 | Task | BE | BE, Phòng chơi, Ván trực tuyến | chinh-be, p1, phat-trien, phong-choi, sprint-3, van-truc-tuyen |
| T53 | Task | BE | BE, Phòng chơi | chinh-be, p1, phat-trien, phong-choi, sprint-2 |
| T54 | Task | BE | BE, Phòng chơi | chinh-be, p1, phat-trien, phong-choi, sprint-3 |
| T55 | Task | BE | BE, Phòng chơi | chinh-be, p1, phat-trien, phong-choi, sprint-3 |
| T56 | Task | BE | BE, Tài khoản, Ván trực tuyến | chinh-be, p1, phat-trien, sprint-3, tai-khoan, van-truc-tuyen |
| T57 | Task | FE | FE, Phòng chơi | chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| T58 | Task | FE | Camera và mic, FE, Phòng chơi | camera-va-mic, chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| T59 | Task | BE | BE, Luật cờ, Máy cờ | chinh-be, luat-co, may-co, p1, phat-trien, sprint-2 |
| T60 | Task | QA & DevOps | Phòng chơi, QA & DevOps, Ván trực tuyến | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4, van-truc-tuyen |
| T61 | Task | FE | FE, Phòng chơi | chinh-fe, p1, phat-trien, phong-choi, sprint-3 |
| T62 | Task | QA & DevOps | Phòng chơi, QA & DevOps | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| T63 | Task | BE | BE, Máy cờ | chinh-be, may-co, p1, phat-trien, sprint-3 |
| T64 | Task | QA & DevOps | Camera và mic, Phòng chơi, QA & DevOps | camera-va-mic, chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| T65 | Task | FE | FE, Tài khoản | chinh-fe, p1, phat-trien, sprint-3, tai-khoan |
| T66 | Task | QA & DevOps | Nền tảng, QA & DevOps | chinh-qa-devops, do-chat-luong, nen-tang, p1, sprint-4 |
| T67 | Task | QA & DevOps | Phòng chơi, QA & DevOps | chinh-qa-devops, kiem-thu, p1, phong-choi, sprint-4 |
| T68 | Task | QA & DevOps | Luật cờ, Máy cờ, QA & DevOps | chinh-qa-devops, kiem-thu, luat-co, may-co, p1, sprint-4 |
| T69 | Task | QA & DevOps | QA & DevOps, Tài khoản, Ván trực tuyến | chinh-qa-devops, kiem-thu, p1, sprint-4, tai-khoan, van-truc-tuyen |
| T70 | Task | QA & DevOps | Nền tảng, QA & DevOps | chinh-qa-devops, dong-goi-phat-hanh, nen-tang, p1, sprint-4 |
| T71 | Task | QA & DevOps | Nền tảng, QA & DevOps | chinh-qa-devops, nen-tang, p1, sprint-4, tong-duyet |
