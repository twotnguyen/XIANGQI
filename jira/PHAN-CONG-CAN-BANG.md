# Phân công đã áp dụng — 848 giờ

Giữ 9 Epic, 27 Story, 71 Task. T20 sang Tùng; T54/T59 sang Đông; T33 ở Tình; T49 giữ Kỳ. Tình có nhiều giờ Task nhất. Đã đồng bộ tài liệu local và CSV, chưa cập nhật Jira thật.

| Người | Task | Giờ | Tải đánh giá | S1 giờ | S2 giờ | S3 giờ | S4 giờ |
|---|---|---|---|---|---|---|---|
| Tình | 10 | 140 | 75 | 52 | 16 | 44 | 28 |
| Đông | 9 | 136 | 63 | 36 | 40 | 56 | 4 |
| Tùng | 9 | 132 | 57 | 48 | 56 | 28 | 0 |
| Cường | 10 | 124 | 52 | 24 | 48 | 52 | 0 |
| Nhạn | 11 | 104 | 54 | 32 | 20 | 24 | 28 |
| Kỳ | 12 | 108 | 54 | 28 | 24 | 40 | 16 |
| Thư | 10 | 104 | 57 | 20 | 8 | 48 | 28 |


Giờ Sprint tính theo phần thời gian thực nằm trong từng Sprint. Task gắn Sprint bắt đầu, có thể kéo sang Sprint sau; không tạo thêm Task. Tổng duyệt sáng 04/11, chiều 04/11 dự phòng, demo 05/11. Lịch làm tối đa 8 giờ/ngày, có cuối tuần. Việc điều phối, rà mã và hỗ trợ ngoài Task chưa có ước lượng riêng.

Cường giữ BE và thử nguyên mẫu, hỗ trợ 32 giờ FE; Nhạn/Kỳ giữ FE chính và hỗ trợ QA 44/24 giờ. Đông/Tùng chỉ nhận BE. Thư giữ kiểm thử chính, hồi quy và tổng duyệt. Người kiểm chuyên đề không tự nghiệm thu tính năng mình triển khai.

Tình bàn giao máy cờ T24 cho Đông làm T59: mã, giao diện gọi, cấu hình, bộ đo và số liệu ban đầu. T68 vẫn là kiểm độc lập. Điểm tải là nhận định nội dung, không phải giờ hoặc thước đo công bằng; không giữ kết luận cũ rằng sáu người đều 52–57 điểm.

## Tình

Giữ nền kết nối, xây máy cờ, quyền và giao diện camera/mic, đo chất lượng và phát hành. Chuyển ván online cho Tùng, tinh chỉnh máy cờ cho Đông; giữ ba kiểm chuyên đề độc lập T16/T27/T60.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | QA & DevOps | 8 | 1 | 10/10 sáng | 10/10 chiều |
| T12 | Khung realtime Socket.IO | BE | 24 | 1 | 11/10 sáng | 13/10 chiều |
| T16 | Kiểm thử US-04.2 | QA & DevOps | 4 | 1 | 14/10 sáng | 14/10 sáng |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | BE | 32 | 1 | 15/10 sáng | 18/10 chiều |
| T33 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | BE | 24 | 3 | 24/10 sáng | 26/10 chiều |
| T58 | FE danh sách người xem, thao tác ghế và khung camera/mic | FE | 20 | 3 | 27/10 sáng | 29/10 sáng |
| T27 | Kiểm thử US-04.3 | QA & DevOps | 4 | 4 | 31/10 sáng | 31/10 sáng |
| T60 | Kiểm thử US-05.3 | QA & DevOps | 4 | 4 | 31/10 chiều | 31/10 chiều |
| T66 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | QA & DevOps | 16 | 4 | 01/11 sáng | 02/11 chiều |
| T70 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | QA & DevOps | 4 | 4 | 03/11 chiều | 03/11 chiều |

## Đông

Nhận T54 danh sách phòng gắn với quản lý người xem; nhận T59 tinh chỉnh máy cờ gắn với dịch vụ ván máy. Tình bàn giao từ T24 bộ máy, cấu hình, dữ liệu đo và cách chạy; không đổi người kiểm độc lập T68.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T04 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | BE | 24 | 1 | 11/10 sáng | 13/10 chiều |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | BE | 12 | 1 | 14/10 sáng | 15/10 sáng |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | BE | 12 | 2 | 19/10 sáng | 20/10 sáng |
| T59 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | BE | 12 | 2 | 20/10 chiều | 21/10 chiều |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | BE | 16 | 2 | 22/10 sáng | 23/10 chiều |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | BE | 16 | 3 | 24/10 sáng | 25/10 chiều |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | BE | 8 | 3 | 26/10 sáng | 26/10 chiều |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | BE | 24 | 3 | 27/10 sáng | 29/10 chiều |
| T52 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | BE | 12 | 3 | 30/10 sáng | 31/10 sáng |

## Tùng

Giữ trọn lõi luật và nhận T20 ván online để nối luật với phân xử/lưu ván; tiếp tục phòng, đăng nhập và bạn bè. T54 chuyển Đông.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | BE | 8 | 1 | 11/10 sáng | 11/10 chiều |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | BE | 8 | 1 | 12/10 sáng | 12/10 chiều |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | BE | 8 | 1 | 13/10 sáng | 13/10 chiều |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | BE | 16 | 1 | 14/10 sáng | 15/10 chiều |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | BE | 24 | 1 | 16/10 sáng | 18/10 chiều |
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | BE | 24 | 2 | 19/10 sáng | 21/10 chiều |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | BE | 12 | 2 | 22/10 sáng | 23/10 sáng |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | BE | 12 | 2 | 23/10 chiều | 24/10 chiều |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | BE | 20 | 3 | 25/10 sáng | 27/10 sáng |

## Cường

Giữ thử nguyên mẫu, Google/Khách, đồng hồ, đề nghị trong ván và vòng đời phòng; nhận phục hồi ván máy. Chỉ nhận các màn dùng lại thành phần chung: chia sẻ, bạn bè, cài đặt phòng, hồ sơ; không nhận bàn cờ/kéo thả hay nhiệm vụ Tester. BE giảm 24 giờ so với phân công đúng vai trò ban đầu.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T06 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | QA & DevOps | 24 | 1 | 11/10 sáng | 13/10 chiều |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | BE | 24 | 2 | 17/10 sáng | 19/10 chiều |
| T23 | BE đồng hồ thi đấu và hết giờ | BE | 8 | 2 | 20/10 sáng | 20/10 chiều |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | BE | 12 | 2 | 21/10 sáng | 22/10 sáng |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | FE | 8 | 2 | 23/10 chiều | 24/10 sáng |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | BE | 12 | 3 | 24/10 chiều | 25/10 chiều |
| T57 | FE Cài đặt phòng | FE | 4 | 3 | 26/10 sáng | 26/10 sáng |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | BE | 12 | 3 | 26/10 chiều | 27/10 chiều |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | FE | 12 | 3 | 28/10 sáng | 29/10 sáng |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | FE | 8 | 3 | 30/10 sáng | 30/10 chiều |

## Nhạn

Giữ cả vẽ bàn và kéo thả để không chia tọa độ/tương tác cho nhiều người. Giữ phòng chờ, đầu hàng/đổi bên; giảm phần media/chat để có thời gian kiểm các luồng tài khoản/Sảnh/máy cờ không do mình triển khai.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | FE | 12 | 1 | 11/10 sáng | 12/10 sáng |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | FE | 20 | 1 | 14/10 sáng | 16/10 sáng |
| T17 | Kiểm thử US-01.2 | QA & DevOps | 8 | 2 | 17/10 sáng | 17/10 chiều |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | FE | 12 | 2 | 22/10 sáng | 23/10 sáng |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | FE | 8 | 3 | 24/10 sáng | 24/10 chiều |
| T29 | Kiểm thử US-03.1 | QA & DevOps | 8 | 3 | 25/10 sáng | 25/10 chiều |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | FE | 8 | 3 | 26/10 sáng | 26/10 chiều |
| T67 | Kiểm thử US-06.2 | QA & DevOps | 8 | 4 | 31/10 sáng | 31/10 chiều |
| T62 | Kiểm thử US-06.1 | QA & DevOps | 4 | 4 | 01/11 sáng | 01/11 sáng |
| T68 | Kiểm thử US-08.3 | QA & DevOps | 8 | 4 | 01/11 chiều | 02/11 sáng |
| T69 | Kiểm thử US-01.4 | QA & DevOps | 8 | 4 | 02/11 chiều | 03/11 sáng |

## Kỳ

Giữ khung giao diện và bộ đăng ký/đăng nhập/Google nhất quán; tiếp tục màn đấu, chat, chơi máy và Sảnh. Chỉ hỗ trợ kiểm các phần không tự viết, không chịu trách nhiệm hạ tầng phát hành.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | FE | 12 | 1 | 11/10 sáng | 12/10 sáng |
| T08 | FE màn Đăng ký 3 bước | FE | 8 | 1 | 14/10 sáng | 14/10 chiều |
| T15 | FE màn Đăng nhập | FE | 8 | 1 | 16/10 sáng | 16/10 chiều |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | FE | 8 | 2 | 20/10 sáng | 20/10 chiều |
| T25 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | FE | 16 | 2 | 21/10 chiều | 23/10 sáng |
| T42 | FE khung chat hai kênh | FE | 8 | 3 | 24/10 sáng | 24/10 chiều |
| T39 | Kiểm thử US-05.2 | QA & DevOps | 4 | 3 | 25/10 chiều | 25/10 chiều |
| T38 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | FE | 12 | 3 | 26/10 sáng | 27/10 sáng |
| T50 | Kiểm thử US-02.2 | QA & DevOps | 4 | 3 | 27/10 chiều | 27/10 chiều |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | FE | 12 | 3 | 28/10 chiều | 29/10 chiều |
| T49 | Kiểm thử US-03.2 | QA & DevOps | 8 | 4 | 01/11 sáng | 01/11 chiều |
| T64 | Kiểm thử US-06.3 | QA & DevOps | 8 | 4 | 02/11 sáng | 02/11 chiều |

## Thư

Giữ dữ liệu có đáp án độc lập, đăng ký thật, phòng/ván/chat/Google, camera, hồi quy tổng và tổng duyệt. Chuyển một số kiểm chuyên đề cho Nhạn/Kỳ/Tình; giữ kiểm đăng ký vào Sprint 2 để tránh dồn toàn bộ kiểm chức năng tới cuối.

| Task | Công việc | Nhóm chính | Giờ | Sprint bắt đầu | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T02 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | QA & DevOps | 20 | 1 | 10/10 sáng | 12/10 sáng |
| T13 | Kiểm thử US-01.1 | QA & DevOps | 8 | 2 | 17/10 sáng | 17/10 chiều |
| T28 | Kiểm thử US-02.1 | QA & DevOps | 8 | 3 | 25/10 sáng | 25/10 chiều |
| T48 | Kiểm thử US-01.3 | QA & DevOps | 8 | 3 | 26/10 sáng | 26/10 chiều |
| T47 | Kiểm thử US-07.1 | QA & DevOps | 8 | 3 | 27/10 sáng | 27/10 chiều |
| T30 | Kiểm thử US-05.1 | QA & DevOps | 8 | 3 | 28/10 sáng | 28/10 chiều |
| T43 | Kiểm thử US-08.1 | QA & DevOps | 8 | 3 | 29/10 sáng | 29/10 chiều |
| T45 | Kiểm thử US-07.2 | QA & DevOps | 8 | 3 | 30/10 sáng | 30/10 chiều |
| T51 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | QA & DevOps | 24 | 4 | 31/10 chiều | 03/11 sáng |
| T71 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | QA & DevOps | 4 | 4 | 04/11 sáng | 04/11 sáng |


Mã T01–T71 là mã nội bộ; phải đối chiếu khóa XIAN trước khi cập nhật Jira thật.
