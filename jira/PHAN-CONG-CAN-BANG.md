# Phân công hiện hành — 880 giờ

Đồng bộ từ Jira ngày 10/10/2026. 71 Task To Do; BA Done theo dõi riêng; chưa bắt đầu Sprint.

| Người | Task | Giờ | Tải đánh giá | S1 giờ phân bổ | S2 | S3 | S4 |
|---|---|---|---|---|---|---|---|
| Tình | 11 | 156 | 83 | 56.0 | 28.0 | 48.0 | 24.0 |
| Đông | 8 | 120 | 55 | 36.0 | 40.0 | 44.0 | 0.0 |
| Tùng | 9 | 132 | 57 | 48.0 | 52.0 | 32.0 | 0.0 |
| Cường | 10 | 124 | 52 | 32.0 | 48.0 | 44.0 | 0.0 |
| Nhạn | 11 | 120 | 54 | 40.0 | 24.0 | 32.0 | 24.0 |
| Kỳ | 12 | 108 | 54 | 0.0 | 44.0 | 44.0 | 20.0 |
| Thư | 10 | 120 | 57 | 24.0 | 16.0 | 48.0 | 32.0 |


Giờ Sprint chỉ là phân bổ đều ước lượng trên số ngày lịch để báo cáo. Mỗi người tối đa một Task/ngày, tối đa 8 giờ/ngày; cả nhóm tối đa 7 Task/ngày. Có làm cuối tuần. Hạn cuối 04/11, không còn buổi chiều dự phòng cố định.

T37 thuộc Tình. Nhạn tăng 16 giờ tại T11/T19/T21/T62; Thư tăng 16 giờ tại T02/T71. Lý do cụ thể nằm trong Description tương ứng. Tổng giờ khác nhau theo phạm vi được giao; không phải khẳng định mức tải đã bằng nhau.

## Tình

Giữ nền kết nối, xây máy cờ, quyền và giao diện camera/mic, đo chất lượng và phát hành. Chuyển ván online cho Tùng, tinh chỉnh máy cờ cho Đông; giữ ba kiểm chuyên đề độc lập T16/T27/T60. Phân công hiện tại gồm T37 chat; tổng 156 giờ.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T01 / XIAN-37 | Dựng monorepo, CI, nhật ký và /health | QA & DevOps | 8 | 1 | 10/10 | 10/10 |
| T12 / XIAN-48 | Khung realtime Socket.IO | BE | 24 | 1 | 11/10 | 13/10 |
| T24 / XIAN-60 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | BE | 32 | 1 | 14/10 | 17/10 |
| T16 / XIAN-52 | Kiểm thử US-04.2 | QA & DevOps | 4 | 2 | 20/10 | 20/10 |
| T37 / XIAN-73 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | BE | 16 | 2 | 22/10 | 23/10 |
| T33 / XIAN-69 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | BE | 24 | 3 | 24/10 | 26/10 |
| T58 / XIAN-94 | FE danh sách người xem, thao tác ghế và khung camera/mic | FE | 20 | 3 | 27/10 | 29/10 |
| T27 / XIAN-63 | Kiểm thử US-04.3 | QA & DevOps | 4 | 3 | 30/10 | 30/10 |
| T66 / XIAN-102 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | QA & DevOps | 16 | 4 | 31/10 | 01/11 |
| T60 / XIAN-96 | Kiểm thử US-05.3 | QA & DevOps | 4 | 4 | 02/11 | 02/11 |
| T70 / XIAN-106 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | QA & DevOps | 4 | 4 | 03/11 | 03/11 |

## Đông

Nhận T54 danh sách phòng gắn với quản lý người xem; nhận T59 tinh chỉnh máy cờ gắn với dịch vụ ván máy. Tình bàn giao từ T24 bộ máy, cấu hình, dữ liệu đo và cách chạy; không đổi người kiểm độc lập T68.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T04 / XIAN-40 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | BE | 24 | 1 | 11/10 | 13/10 |
| T14 / XIAN-50 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | BE | 12 | 1 | 14/10 | 15/10 |
| T59 / XIAN-95 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | BE | 12 | 2 | 18/10 | 19/10 |
| T34 / XIAN-70 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | BE | 12 | 2 | 20/10 | 21/10 |
| T56 / XIAN-92 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | BE | 24 | 2 | 22/10 | 24/10 |
| T55 / XIAN-91 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | BE | 16 | 3 | 25/10 | 26/10 |
| T54 / XIAN-90 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | BE | 8 | 3 | 27/10 | 27/10 |
| T52 / XIAN-88 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | BE | 12 | 3 | 29/10 | 30/10 |

## Tùng

Giữ trọn lõi luật và nhận T20 ván online để nối luật với phân xử/lưu ván; tiếp tục phòng, đăng nhập và bạn bè. T54 chuyển Đông.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T05 / XIAN-41 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | BE | 8 | 1 | 11/10 | 11/10 |
| T07 / XIAN-43 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | BE | 8 | 1 | 12/10 | 12/10 |
| T10 / XIAN-46 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | BE | 8 | 1 | 13/10 | 13/10 |
| T09 / XIAN-45 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | BE | 16 | 1 | 14/10 | 15/10 |
| T20 / XIAN-56 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | BE | 24 | 1 | 16/10 | 18/10 |
| T18 / XIAN-54 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | BE | 24 | 2 | 19/10 | 21/10 |
| T22 / XIAN-58 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | BE | 12 | 2 | 22/10 | 23/10 |
| T53 / XIAN-89 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | BE | 12 | 3 | 24/10 | 25/10 |
| T31 / XIAN-67 | BE bạn bè, trạng thái online, mời bạn online vào phòng | BE | 20 | 3 | 26/10 | 28/10 |

## Cường

Giữ thử nguyên mẫu, Google/Khách, đồng hồ, đề nghị trong ván và vòng đời phòng; nhận phục hồi ván máy. Chỉ nhận các màn dùng lại thành phần chung: chia sẻ, bạn bè, cài đặt phòng, hồ sơ; không nhận bàn cờ/kéo thả hay nhiệm vụ Tester. BE giảm 24 giờ so với phân công đúng vai trò ban đầu.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T06 / XIAN-42 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | QA & DevOps | 24 | 1 | 11/10 | 13/10 |
| T35 / XIAN-71 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | BE | 24 | 1 | 16/10 | 18/10 |
| T23 / XIAN-59 | BE đồng hồ thi đấu và hết giờ | BE | 8 | 2 | 19/10 | 19/10 |
| T32 / XIAN-68 | BE đầu hàng, rời phòng giữa ván, xin hoà | BE | 12 | 2 | 20/10 | 21/10 |
| T63 / XIAN-99 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | BE | 12 | 2 | 22/10 | 23/10 |
| T26 / XIAN-62 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | FE | 8 | 3 | 24/10 | 24/10 |
| T41 / XIAN-77 | BE Xin đổi bên và phòng về chờ sau ván | BE | 12 | 3 | 25/10 | 26/10 |
| T57 / XIAN-93 | FE Cài đặt phòng | FE | 4 | 3 | 27/10 | 27/10 |
| T65 / XIAN-101 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | FE | 8 | 3 | 28/10 | 28/10 |
| T40 / XIAN-76 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | FE | 12 | 3 | 29/10 | 30/10 |

## Nhạn

Giữ FE và kiểm thử độc lập theo Jira; T11/T19/T21/T62 tăng tổng cộng 16 giờ cho các nhánh đã đặc tả, tổng 120 giờ.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T11 / XIAN-47 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | FE | 16 | 1 | 11/10 | 12/10 |
| T19 / XIAN-55 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | FE | 24 | 1 | 14/10 | 16/10 |
| T17 / XIAN-53 | Kiểm thử US-01.2 | QA & DevOps | 8 | 2 | 21/10 | 21/10 |
| T21 / XIAN-57 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | FE | 16 | 2 | 22/10 | 23/10 |
| T36 / XIAN-72 | FE nút Đầu hàng, Xin hoà và khung đề nghị | FE | 8 | 3 | 24/10 | 24/10 |
| T29 / XIAN-65 | Kiểm thử US-03.1 | QA & DevOps | 8 | 3 | 25/10 | 25/10 |
| T46 / XIAN-82 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | FE | 8 | 3 | 27/10 | 27/10 |
| T68 / XIAN-104 | Kiểm thử US-08.3 | QA & DevOps | 8 | 3 | 30/10 | 30/10 |
| T67 / XIAN-103 | Kiểm thử US-06.2 | QA & DevOps | 8 | 4 | 31/10 | 31/10 |
| T69 / XIAN-105 | Kiểm thử US-01.4 | QA & DevOps | 8 | 4 | 01/11 | 01/11 |
| T62 / XIAN-98 | Kiểm thử US-06.1 | QA & DevOps | 8 | 4 | 02/11 | 02/11 |

## Kỳ

Giữ khung giao diện và bộ đăng ký/đăng nhập/Google nhất quán; tiếp tục màn đấu, chat, chơi máy và Sảnh. Chỉ hỗ trợ kiểm các phần không tự viết, không chịu trách nhiệm hạ tầng phát hành.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T03 / XIAN-39 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | FE | 12 | 2 | 18/10 | 19/10 |
| T15 / XIAN-51 | FE màn Đăng nhập | FE | 8 | 2 | 20/10 | 20/10 |
| T08 / XIAN-44 | FE màn Đăng ký 3 bước | FE | 8 | 2 | 21/10 | 21/10 |
| T25 / XIAN-61 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | FE | 16 | 2 | 22/10 | 23/10 |
| T44 / XIAN-80 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | FE | 8 | 3 | 24/10 | 24/10 |
| T39 / XIAN-75 | Kiểm thử US-05.2 | QA & DevOps | 4 | 3 | 25/10 | 25/10 |
| T42 / XIAN-78 | FE khung chat hai kênh | FE | 8 | 3 | 26/10 | 26/10 |
| T38 / XIAN-74 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | FE | 12 | 3 | 27/10 | 28/10 |
| T61 / XIAN-97 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | FE | 12 | 3 | 29/10 | 30/10 |
| T50 / XIAN-86 | Kiểm thử US-02.2 | QA & DevOps | 4 | 4 | 31/10 | 31/10 |
| T49 / XIAN-85 | Kiểm thử US-03.2 | QA & DevOps | 8 | 4 | 01/11 | 01/11 |
| T64 / XIAN-100 | Kiểm thử US-06.3 | QA & DevOps | 8 | 4 | 02/11 | 02/11 |

## Thư

T02 tăng từ 20 lên 32 giờ, bắt đầu 14/10; T71 tăng từ 4 lên 8 giờ. Chuẩn bị dữ liệu, kiểm thử, hồi quy và tổng duyệt: 120 giờ.

| Task / Jira | Công việc | Nhóm chính | Giờ | Sprint | Bắt đầu | Kết thúc |
|---|---|---|---|---|---|---|
| T02 / XIAN-38 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | QA & DevOps | 32 | 1 | 14/10 | 17/10 |
| T13 / XIAN-49 | Kiểm thử US-01.1 | QA & DevOps | 8 | 2 | 22/10 | 22/10 |
| T28 / XIAN-64 | Kiểm thử US-02.1 | QA & DevOps | 8 | 3 | 25/10 | 25/10 |
| T48 / XIAN-84 | Kiểm thử US-01.3 | QA & DevOps | 8 | 3 | 26/10 | 26/10 |
| T30 / XIAN-66 | Kiểm thử US-05.1 | QA & DevOps | 8 | 3 | 27/10 | 27/10 |
| T47 / XIAN-83 | Kiểm thử US-07.1 | QA & DevOps | 8 | 3 | 28/10 | 28/10 |
| T43 / XIAN-79 | Kiểm thử US-08.1 | QA & DevOps | 8 | 3 | 29/10 | 29/10 |
| T45 / XIAN-81 | Kiểm thử US-07.2 | QA & DevOps | 8 | 3 | 30/10 | 30/10 |
| T51 / XIAN-87 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | QA & DevOps | 24 | 4 | 31/10 | 02/11 |
| T71 / XIAN-107 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | QA & DevOps | 8 | 4 | 04/11 | 04/11 |
