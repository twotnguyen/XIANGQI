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
- `sprint-1` đến `sprint-4`: Sprint bắt đầu của Task; xem ngày kết thúc khi Task kéo sang Sprint sau.
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

Bản xuất dùng nhãn để nhận biết nhóm chính, không yêu cầu thêm trường tùy chỉnh. Kiểm sau nhập: đủ 107 mục có Components/Labels; mỗi Task có đúng một nhóm chính và đúng nhãn; các component chức năng không bị mất. Đây là dữ liệu chuẩn bị nhập, chưa phải xác nhận cấu hình hay dữ liệu trên Jira thật.

## Danh sách đầy đủ

| Mã | Loại | Component chính | Components | Labels |
|---|---|---|---|---|
| EP-00 | Epic | Tổng hợp | FE, BE, QA & DevOps, Nền tảng, Luật cờ, Ván trực tuyến, Camera và mic, Máy cờ | EP-00, dac-ta, p1, nen-tang, luat-co, van-truc-tuyen, camera-va-mic, may-co |
| EP-01 | Epic | Tổng hợp | FE, BE, QA & DevOps, Tài khoản, Ván trực tuyến | EP-01, dac-ta, p1, tai-khoan, van-truc-tuyen |
| EP-02 | Epic | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Ván trực tuyến | EP-02, dac-ta, p1, phong-choi, van-truc-tuyen |
| EP-03 | Epic | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Bạn bè | EP-03, dac-ta, p1, phong-choi, ban-be |
| EP-04 | Epic | Tổng hợp | FE, BE, QA & DevOps, Luật cờ, Bàn cờ | EP-04, dac-ta, p1, luat-co, ban-co |
| EP-05 | Epic | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Luật cờ, Bàn cờ, Ván trực tuyến | EP-05, dac-ta, p1, phong-choi, luat-co, ban-co, van-truc-tuyen |
| EP-06 | Epic | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Camera và mic | EP-06, dac-ta, p1, phong-choi, camera-va-mic |
| EP-07 | Epic | Tổng hợp | FE, BE, QA & DevOps, Trò chuyện, Camera và mic | EP-07, dac-ta, p1, tro-chuyen, camera-va-mic |
| EP-08 | Epic | Tổng hợp | FE, BE, QA & DevOps, Luật cờ, Bàn cờ, Máy cờ | EP-08, dac-ta, p1, luat-co, ban-co, may-co |
| US-00.1 | Story | Tổng hợp | FE, QA & DevOps, Nền tảng | dac-ta, EP-00, p1, nen-tang |
| US-00.2 | Story | Tổng hợp | BE, Nền tảng | dac-ta, EP-00, p1, nen-tang |
| US-00.3 | Story | Tổng hợp | BE, Nền tảng, Ván trực tuyến | dac-ta, EP-00, p1, nen-tang, van-truc-tuyen |
| US-00.4 | Story | Tổng hợp | QA & DevOps, Nền tảng, Luật cờ, Camera và mic, Máy cờ | dac-ta, EP-00, p1, nen-tang, luat-co, camera-va-mic, may-co |
| US-00.5 | Story | Tổng hợp | QA & DevOps, Nền tảng | dac-ta, EP-00, p1, nen-tang |
| US-01.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Tài khoản | dac-ta, EP-01, p1, tai-khoan |
| US-01.2 | Story | Tổng hợp | FE, BE, QA & DevOps, Tài khoản | dac-ta, EP-01, p1, tai-khoan |
| US-01.3 | Story | Tổng hợp | FE, BE, QA & DevOps, Tài khoản | dac-ta, EP-01, p1, tai-khoan |
| US-01.4 | Story | Tổng hợp | FE, BE, QA & DevOps, Tài khoản, Ván trực tuyến | dac-ta, EP-01, p1, tai-khoan, van-truc-tuyen |
| US-02.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi | dac-ta, EP-02, p1, phong-choi |
| US-02.2 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Ván trực tuyến | dac-ta, EP-02, p1, phong-choi, van-truc-tuyen |
| US-03.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi | dac-ta, EP-03, p1, phong-choi |
| US-03.2 | Story | Tổng hợp | FE, BE, QA & DevOps, Bạn bè | dac-ta, EP-03, p1, ban-be |
| US-04.1 | Story | Tổng hợp | BE, Luật cờ | dac-ta, EP-04, p1, luat-co |
| US-04.2 | Story | Tổng hợp | FE, QA & DevOps, Bàn cờ | dac-ta, EP-04, p1, ban-co |
| US-04.3 | Story | Tổng hợp | FE, QA & DevOps, Bàn cờ | dac-ta, EP-04, p1, ban-co |
| US-05.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Luật cờ, Bàn cờ, Ván trực tuyến | dac-ta, EP-05, p1, luat-co, ban-co, van-truc-tuyen |
| US-05.2 | Story | Tổng hợp | FE, BE, QA & DevOps, Ván trực tuyến | dac-ta, EP-05, p1, van-truc-tuyen |
| US-05.3 | Story | Tổng hợp | BE, QA & DevOps, Phòng chơi, Ván trực tuyến | dac-ta, EP-05, p1, phong-choi, van-truc-tuyen |
| US-06.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi | dac-ta, EP-06, p1, phong-choi |
| US-06.2 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi | dac-ta, EP-06, p1, phong-choi |
| US-06.3 | Story | Tổng hợp | FE, BE, QA & DevOps, Phòng chơi, Camera và mic | dac-ta, EP-06, p1, phong-choi, camera-va-mic |
| US-07.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Trò chuyện | dac-ta, EP-07, p1, tro-chuyen |
| US-07.2 | Story | Tổng hợp | BE, QA & DevOps, Camera và mic | dac-ta, EP-07, p1, camera-va-mic |
| US-08.1 | Story | Tổng hợp | FE, BE, QA & DevOps, Bàn cờ, Máy cờ | dac-ta, EP-08, p1, ban-co, may-co |
| US-08.2 | Story | Tổng hợp | BE, Luật cờ, Máy cờ | dac-ta, EP-08, p1, luat-co, may-co |
| US-08.3 | Story | Tổng hợp | BE, QA & DevOps, Luật cờ, Máy cờ | dac-ta, EP-08, p1, luat-co, may-co |
| T01 | Task | QA & DevOps | QA & DevOps, Nền tảng | sprint-1, ha-tang, p1, chinh-qa-devops, nen-tang |
| T02 | Task | QA & DevOps | QA & DevOps, Nền tảng, Luật cờ, Máy cờ | sprint-1, chuan-bi-kiem-thu, p1, chinh-qa-devops, nen-tang, luat-co, may-co |
| T03 | Task | FE | FE, Nền tảng | sprint-1, phat-trien, p1, chinh-fe, nen-tang |
| T04 | Task | BE | BE, Tài khoản | sprint-1, phat-trien, p1, chinh-be, tai-khoan |
| T05 | Task | BE | BE, Luật cờ | sprint-1, phat-trien, p1, chinh-be, luat-co |
| T06 | Task | QA & DevOps | QA & DevOps, Nền tảng, Camera và mic | sprint-1, thu-nghiem-ky-thuat, p1, chinh-qa-devops, nen-tang, camera-va-mic |
| T07 | Task | BE | BE, Luật cờ | sprint-1, phat-trien, p1, chinh-be, luat-co |
| T08 | Task | FE | FE, Tài khoản | sprint-1, phat-trien, p1, chinh-fe, tai-khoan |
| T09 | Task | BE | BE, Tài khoản | sprint-1, phat-trien, p1, chinh-be, tai-khoan |
| T10 | Task | BE | BE, Luật cờ | sprint-1, phat-trien, p1, chinh-be, luat-co |
| T11 | Task | FE | FE, Bàn cờ | sprint-1, phat-trien, p1, chinh-fe, ban-co |
| T12 | Task | BE | BE, Nền tảng, Ván trực tuyến | sprint-1, phat-trien, p1, chinh-be, nen-tang, van-truc-tuyen |
| T13 | Task | QA & DevOps | QA & DevOps, Tài khoản | sprint-2, kiem-thu, p1, chinh-qa-devops, tai-khoan |
| T14 | Task | BE | BE, Nền tảng | sprint-1, phat-trien, p1, chinh-be, nen-tang |
| T15 | Task | FE | FE, Tài khoản | sprint-1, phat-trien, p1, chinh-fe, tai-khoan |
| T16 | Task | QA & DevOps | QA & DevOps, Bàn cờ | sprint-1, kiem-thu, p1, chinh-qa-devops, ban-co |
| T17 | Task | QA & DevOps | QA & DevOps, Tài khoản | sprint-2, kiem-thu, p1, chinh-qa-devops, tai-khoan |
| T18 | Task | BE | BE, Phòng chơi | sprint-2, phat-trien, p1, chinh-be, phong-choi |
| T19 | Task | FE | FE, Bàn cờ | sprint-1, phat-trien, p1, chinh-fe, ban-co |
| T20 | Task | BE | BE, Luật cờ, Ván trực tuyến | sprint-1, phat-trien, p1, chinh-be, luat-co, van-truc-tuyen |
| T21 | Task | FE | FE, Phòng chơi | sprint-2, phat-trien, p1, chinh-fe, phong-choi |
| T22 | Task | BE | BE, Phòng chơi | sprint-2, phat-trien, p1, chinh-be, phong-choi |
| T23 | Task | BE | BE, Ván trực tuyến | sprint-2, phat-trien, p1, chinh-be, van-truc-tuyen |
| T24 | Task | BE | BE, Luật cờ, Máy cờ | sprint-1, phat-trien, p1, chinh-be, luat-co, may-co |
| T25 | Task | FE | FE, Bàn cờ, Ván trực tuyến | sprint-2, phat-trien, p1, chinh-fe, ban-co, van-truc-tuyen |
| T26 | Task | FE | FE, Phòng chơi | sprint-2, phat-trien, p1, chinh-fe, phong-choi |
| T27 | Task | QA & DevOps | QA & DevOps, Bàn cờ | sprint-4, kiem-thu, p1, chinh-qa-devops, ban-co |
| T28 | Task | QA & DevOps | QA & DevOps, Phòng chơi | sprint-3, kiem-thu, p1, chinh-qa-devops, phong-choi |
| T29 | Task | QA & DevOps | QA & DevOps, Phòng chơi | sprint-3, kiem-thu, p1, chinh-qa-devops, phong-choi |
| T30 | Task | QA & DevOps | QA & DevOps, Luật cờ, Ván trực tuyến | sprint-3, kiem-thu, p1, chinh-qa-devops, luat-co, van-truc-tuyen |
| T31 | Task | BE | BE, Bạn bè | sprint-3, phat-trien, p1, chinh-be, ban-be |
| T32 | Task | BE | BE, Ván trực tuyến | sprint-2, phat-trien, p1, chinh-be, van-truc-tuyen |
| T33 | Task | BE | BE, Camera và mic | sprint-3, phat-trien, p1, chinh-be, camera-va-mic |
| T34 | Task | BE | BE, Máy cờ | sprint-2, phat-trien, p1, chinh-be, may-co |
| T35 | Task | BE | BE, Tài khoản | sprint-2, phat-trien, p1, chinh-be, tai-khoan |
| T36 | Task | FE | FE, Ván trực tuyến | sprint-3, phat-trien, p1, chinh-fe, van-truc-tuyen |
| T37 | Task | BE | BE, Trò chuyện | sprint-2, phat-trien, p1, chinh-be, tro-chuyen |
| T38 | Task | FE | FE, Bàn cờ, Máy cờ | sprint-3, phat-trien, p1, chinh-fe, ban-co, may-co |
| T39 | Task | QA & DevOps | QA & DevOps, Ván trực tuyến | sprint-3, kiem-thu, p1, chinh-qa-devops, van-truc-tuyen |
| T40 | Task | FE | FE, Bạn bè | sprint-3, phat-trien, p1, chinh-fe, ban-be |
| T41 | Task | BE | BE, Phòng chơi, Ván trực tuyến | sprint-3, phat-trien, p1, chinh-be, phong-choi, van-truc-tuyen |
| T42 | Task | FE | FE, Trò chuyện | sprint-3, phat-trien, p1, chinh-fe, tro-chuyen |
| T43 | Task | QA & DevOps | QA & DevOps, Bàn cờ, Máy cờ | sprint-3, kiem-thu, p1, chinh-qa-devops, ban-co, may-co |
| T44 | Task | FE | FE, Tài khoản | sprint-2, phat-trien, p1, chinh-fe, tai-khoan |
| T45 | Task | QA & DevOps | QA & DevOps, Camera và mic | sprint-3, kiem-thu, p1, chinh-qa-devops, camera-va-mic |
| T46 | Task | FE | FE, Phòng chơi, Ván trực tuyến | sprint-3, phat-trien, p1, chinh-fe, phong-choi, van-truc-tuyen |
| T47 | Task | QA & DevOps | QA & DevOps, Trò chuyện | sprint-3, kiem-thu, p1, chinh-qa-devops, tro-chuyen |
| T48 | Task | QA & DevOps | QA & DevOps, Tài khoản | sprint-3, kiem-thu, p1, chinh-qa-devops, tai-khoan |
| T49 | Task | QA & DevOps | QA & DevOps, Bạn bè | sprint-4, kiem-thu, p1, chinh-qa-devops, ban-be |
| T50 | Task | QA & DevOps | QA & DevOps, Phòng chơi, Ván trực tuyến | sprint-3, kiem-thu, p1, chinh-qa-devops, phong-choi, van-truc-tuyen |
| T51 | Task | QA & DevOps | QA & DevOps, Nền tảng | sprint-4, kiem-thu-tich-hop, p1, chinh-qa-devops, nen-tang |
| T52 | Task | BE | BE, Phòng chơi, Ván trực tuyến | sprint-3, phat-trien, p1, chinh-be, phong-choi, van-truc-tuyen |
| T53 | Task | BE | BE, Phòng chơi | sprint-2, phat-trien, p1, chinh-be, phong-choi |
| T54 | Task | BE | BE, Phòng chơi | sprint-3, phat-trien, p1, chinh-be, phong-choi |
| T55 | Task | BE | BE, Phòng chơi | sprint-3, phat-trien, p1, chinh-be, phong-choi |
| T56 | Task | BE | BE, Tài khoản, Ván trực tuyến | sprint-3, phat-trien, p1, chinh-be, tai-khoan, van-truc-tuyen |
| T57 | Task | FE | FE, Phòng chơi | sprint-3, phat-trien, p1, chinh-fe, phong-choi |
| T58 | Task | FE | FE, Phòng chơi, Camera và mic | sprint-3, phat-trien, p1, chinh-fe, phong-choi, camera-va-mic |
| T59 | Task | BE | BE, Luật cờ, Máy cờ | sprint-2, phat-trien, p1, chinh-be, luat-co, may-co |
| T60 | Task | QA & DevOps | QA & DevOps, Phòng chơi, Ván trực tuyến | sprint-4, kiem-thu, p1, chinh-qa-devops, phong-choi, van-truc-tuyen |
| T61 | Task | FE | FE, Phòng chơi | sprint-3, phat-trien, p1, chinh-fe, phong-choi |
| T62 | Task | QA & DevOps | QA & DevOps, Phòng chơi | sprint-4, kiem-thu, p1, chinh-qa-devops, phong-choi |
| T63 | Task | BE | BE, Máy cờ | sprint-3, phat-trien, p1, chinh-be, may-co |
| T64 | Task | QA & DevOps | QA & DevOps, Phòng chơi, Camera và mic | sprint-4, kiem-thu, p1, chinh-qa-devops, phong-choi, camera-va-mic |
| T65 | Task | FE | FE, Tài khoản | sprint-3, phat-trien, p1, chinh-fe, tai-khoan |
| T66 | Task | QA & DevOps | QA & DevOps, Nền tảng | sprint-4, do-chat-luong, p1, chinh-qa-devops, nen-tang |
| T67 | Task | QA & DevOps | QA & DevOps, Phòng chơi | sprint-4, kiem-thu, p1, chinh-qa-devops, phong-choi |
| T68 | Task | QA & DevOps | QA & DevOps, Luật cờ, Máy cờ | sprint-4, kiem-thu, p1, chinh-qa-devops, luat-co, may-co |
| T69 | Task | QA & DevOps | QA & DevOps, Tài khoản, Ván trực tuyến | sprint-4, kiem-thu, p1, chinh-qa-devops, tai-khoan, van-truc-tuyen |
| T70 | Task | QA & DevOps | QA & DevOps, Nền tảng | sprint-4, dong-goi-phat-hanh, p1, chinh-qa-devops, nen-tang |
| T71 | Task | QA & DevOps | QA & DevOps, Nền tảng | sprint-4, tong-duyet, p1, chinh-qa-devops, nen-tang |
