# KẾ HOẠCH JIRA — Cờ Tướng Online (XIAN)

> **Đồng bộ Jira ngày 10/10/2026 · phiên bản 3.0.** 9 Epic + 27 Story BA đã Done; 71 Task triển khai To Do, **880 giờ**, hạn hoàn thành và Release v1.0 **04/11/2026**. Cả bốn Sprint chưa bắt đầu.

Nguồn dữ liệu: [snapshot Jira](jira/data/current-jira-snapshot.json), [kế hoạch](jira/data/plan-data.json), [Description](jira/data/descriptions.json). Nghiệp vụ: [BA](BA-SCOPE-DECISIONS.md), [backlog](BACKLOG-P1.md), [truy vết 268 AC](jira/reports/TRUY-VET-AC.md). [Danh sách 107 mục](jira/reports/JIRA-MUC-CHI-TIET.md) và [CSV đối chiếu](jira/exports/xian-import.csv) được sinh từ cùng nguồn.

## 1. Quy tắc lịch và cách đọc

- Lịch theo **ngày**, tính cả ngày bắt đầu và ngày kết thúc, kể cả cuối tuần. Mỗi người tối đa một Task/ngày; toàn nhóm tối đa bảy Task/ngày. Task phụ thuộc chỉ bắt đầu từ ngày sau khi đầu vào kết thúc.
- Ước lượng giờ độc lập với độ dài thanh lịch. Một Task 4 giờ vẫn chiếm một ngày trong ràng buộc một Task/người/ngày; không suy ra giờ làm bằng số ngày × 8. Mỗi Task không vượt 8 giờ/ngày nếu phân bổ đều trong khoảng lịch.
- Epic và Story là hồ sơ BA đã chốt; Done của BA không đại diện cho phần mềm đã hoàn thành. Story và Task cùng thuộc Epic, liên kết với nhau bằng relates to. Ngày BA giữ nguyên giá trị Jira; Epic bắt đầu trước Story, Story trước Task. BA có thể kết thúc trước hoặc sau các Task đầu một khoảng ngắn theo lịch mục 4; không mặc định chờ Task cuối.
- Task gắn Sprint theo ngày bắt đầu, có thể kéo qua Sprint sau. **Trường Sprint** là nguồn chính; 71/71 nhãn sprint đã khớp trường Sprint sau đợt sửa 13 nhãn cũ.
- Story Points lấy nguyên Jira, không tự tính lại từ giờ mới. Các bảng chia giờ theo Sprint phân bổ đều ước lượng trên số ngày lịch, chỉ là cách trình bày kế hoạch, không phải giờ đã làm.
- Tổng duyệt T71 chiếm ngày 04/11 (8 giờ); **không còn cam kết chiều 04/11 dự phòng**. Mốc demo 05/11 trong hồ sơ cũ là lịch sử; hạn kế hoạch hiện tại là 04/11.

| Chỉ số | Kết quả |
|---|---|
| Epic / Story / Task | 9 / 27 / 71 |
| Giờ / Story Points | 880 / 198 |
| Phụ thuộc trực tiếp | 186 |
| Song song tối đa | 7 |
| Hạn hoàn thành | 2026-11-04 |
| Trạng thái Sprint | 4 future; chưa bắt đầu |


## 2. Phân công

| Người | Task | Giờ | S1 giờ phân bổ | S2 | S3 | S4 |
|---|---|---|---|---|---|---|
| Tình | 11 | 156 | 56.0 | 28.0 | 48.0 | 24.0 |
| Đông | 8 | 120 | 36.0 | 40.0 | 44.0 | 0.0 |
| Tùng | 9 | 132 | 48.0 | 52.0 | 32.0 | 0.0 |
| Cường | 10 | 124 | 32.0 | 48.0 | 44.0 | 0.0 |
| Nhạn | 11 | 120 | 40.0 | 24.0 | 32.0 | 24.0 |
| Kỳ | 12 | 108 | 0.0 | 44.0 | 44.0 | 20.0 |
| Thư | 10 | 120 | 24.0 | 16.0 | 48.0 | 32.0 |


Nhạn và Thư mỗi người tăng từ 104 lên 120 giờ; T37 thuộc Tình. Tổng giờ là 880, chưa bao gồm giờ BA/điều phối riêng. Phân công không bằng nhau tuyệt đối; xem [cơ sở phân công](jira/reports/PHAN-CONG-CAN-BANG.md) và [đánh giá nội dung](jira/reports/DANH-GIA-KHOI-LUONG.md).

## 3. Sprint

### XIAN Sprint 1 · 10/10–16/10 · chưa bắt đầu

Nền tảng máy chủ, xác thực, lõi luật, bàn cờ tương tác, thử media và khởi động kế hoạch kiểm thử. Task gắn Sprint theo ngày bắt đầu; có Task hoàn tất trong Sprint kế tiếp.

15 Task · 284 giờ ước lượng của các Task gắn Sprint.

| Task / Jira | Tên | Story | Người | Giờ | Điểm Jira | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T01 / XIAN-37 | Dựng monorepo, CI, nhật ký và /health | US-00.1 | Tình | 8 | 2 | 10/10 | 10/10 | — |
| T04 / XIAN-40 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | US-01.1 | Đông | 24 | 5 | 11/10 | 13/10 | T01 |
| T05 / XIAN-41 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | US-04.1 | Tùng | 8 | 2 | 11/10 | 11/10 | T01 |
| T06 / XIAN-42 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | US-00.4 | Cường | 24 | 5 | 11/10 | 13/10 | T01 |
| T11 / XIAN-47 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | US-04.2 | Nhạn | 16 | 3 | 11/10 | 12/10 | T01 |
| T12 / XIAN-48 | Khung realtime Socket.IO | US-00.3 | Tình | 24 | 5 | 11/10 | 13/10 | T01 |
| T07 / XIAN-43 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | US-04.1 | Tùng | 8 | 2 | 12/10 | 12/10 | T05 |
| T10 / XIAN-46 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | US-04.1 | Tùng | 8 | 2 | 13/10 | 13/10 | T07 |
| T02 / XIAN-38 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | US-00.4 | Thư | 32 | 5 | 14/10 | 17/10 | — |
| T09 / XIAN-45 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | US-01.2 | Tùng | 16 | 3 | 14/10 | 15/10 | T04 |
| T14 / XIAN-50 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | US-00.2 | Đông | 12 | 3 | 14/10 | 15/10 | T04 |
| T19 / XIAN-55 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | US-04.3 | Nhạn | 24 | 5 | 14/10 | 16/10 | T10, T11 |
| T24 / XIAN-60 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | US-08.2 | Tình | 32 | 8 | 14/10 | 17/10 | T10 |
| T20 / XIAN-56 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | US-05.1 | Tùng | 24 | 5 | 16/10 | 18/10 | T10, T12, T14 |
| T35 / XIAN-71 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | US-01.3 | Cường | 24 | 5 | 16/10 | 18/10 | T09, T14 |

### XIAN Sprint 2 · 17/10–23/10 · chưa bắt đầu

Khung giao diện, xác thực, phòng và ván cơ bản, máy cờ; triển khai chat và quản lý phiên theo lịch cân ngày. Task gắn Sprint theo ngày bắt đầu.

17 Task · 212 giờ ước lượng của các Task gắn Sprint.

| Task / Jira | Tên | Story | Người | Giờ | Điểm Jira | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T03 / XIAN-39 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | US-00.1 | Kỳ | 12 | 3 | 18/10 | 19/10 | T01 |
| T59 / XIAN-95 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | US-08.3 | Đông | 12 | 3 | 18/10 | 19/10 | T02, T24 |
| T18 / XIAN-54 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | US-02.1 | Tùng | 24 | 5 | 19/10 | 21/10 | T12, T14 |
| T23 / XIAN-59 | BE đồng hồ thi đấu và hết giờ | US-05.1 | Cường | 8 | 2 | 19/10 | 19/10 | T20 |
| T15 / XIAN-51 | FE màn Đăng nhập | US-01.2 | Kỳ | 8 | 2 | 20/10 | 20/10 | T03, T09 |
| T16 / XIAN-52 | Kiểm thử US-04.2 | US-04.2 | Tình | 4 | 1 | 20/10 | 20/10 | T11 |
| T32 / XIAN-68 | BE đầu hàng, rời phòng giữa ván, xin hoà | US-05.2 | Cường | 12 | 3 | 20/10 | 21/10 | T20 |
| T34 / XIAN-70 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | US-08.1 | Đông | 12 | 3 | 20/10 | 21/10 | T20, T24 |
| T08 / XIAN-44 | FE màn Đăng ký 3 bước | US-01.1 | Kỳ | 8 | 2 | 21/10 | 21/10 | T03, T04 |
| T17 / XIAN-53 | Kiểm thử US-01.2 | US-01.2 | Nhạn | 8 | 2 | 21/10 | 21/10 | T15 |
| T13 / XIAN-49 | Kiểm thử US-01.1 | US-01.1 | Thư | 8 | 2 | 22/10 | 22/10 | T08 |
| T21 / XIAN-57 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | US-02.1 | Nhạn | 16 | 3 | 22/10 | 23/10 | T03, T18 |
| T22 / XIAN-58 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | US-03.1 | Tùng | 12 | 3 | 22/10 | 23/10 | T09, T18 |
| T25 / XIAN-61 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | US-05.1 | Kỳ | 16 | 3 | 22/10 | 23/10 | T19, T23 |
| T37 / XIAN-73 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | US-07.1 | Tình | 16 | 3 | 22/10 | 23/10 | T18, T35 |
| T56 / XIAN-92 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | US-01.4 | Đông | 24 | 5 | 22/10 | 24/10 | T18, T20, T35 |
| T63 / XIAN-99 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | US-08.3 | Cường | 12 | 3 | 22/10 | 23/10 | T34, T35 |

### XIAN Sprint 3 · 24/10–30/10 · chưa bắt đầu

Hoàn thiện bạn bè, chat/media, phòng/người xem, Sảnh, hồ sơ, nối lại và kiểm thử chuyên đề. Các phần triển khai hoàn tất chậm nhất 30/10 để hồi quy từ 31/10.

28 Task · 284 giờ ước lượng của các Task gắn Sprint.

| Task / Jira | Tên | Story | Người | Giờ | Điểm Jira | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T26 / XIAN-62 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | US-03.1 | Cường | 8 | 2 | 24/10 | 24/10 | T21, T22 |
| T33 / XIAN-69 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | US-07.2 | Tình | 24 | 5 | 24/10 | 26/10 | T06, T22, T35 |
| T36 / XIAN-72 | FE nút Đầu hàng, Xin hoà và khung đề nghị | US-05.2 | Nhạn | 8 | 2 | 24/10 | 24/10 | T25, T32 |
| T44 / XIAN-80 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | US-01.3 | Kỳ | 8 | 2 | 24/10 | 24/10 | T15, T35 |
| T53 / XIAN-89 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | US-06.1 | Tùng | 12 | 3 | 24/10 | 25/10 | T22 |
| T28 / XIAN-64 | Kiểm thử US-02.1 | US-02.1 | Thư | 8 | 2 | 25/10 | 25/10 | T25, T26, T37 |
| T29 / XIAN-65 | Kiểm thử US-03.1 | US-03.1 | Nhạn | 8 | 2 | 25/10 | 25/10 | T08, T15, T26, T35 |
| T39 / XIAN-75 | Kiểm thử US-05.2 | US-05.2 | Kỳ | 4 | 1 | 25/10 | 25/10 | T18, T36 |
| T41 / XIAN-77 | BE Xin đổi bên và phòng về chờ sau ván | US-02.2 | Cường | 12 | 3 | 25/10 | 26/10 | T20, T37 |
| T55 / XIAN-91 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | US-06.3 | Đông | 16 | 3 | 25/10 | 26/10 | T22 |
| T31 / XIAN-67 | BE bạn bè, trạng thái online, mời bạn online vào phòng | US-03.2 | Tùng | 20 | 5 | 26/10 | 28/10 | T22, T35 |
| T42 / XIAN-78 | FE khung chat hai kênh | US-07.1 | Kỳ | 8 | 2 | 26/10 | 26/10 | T25, T37 |
| T48 / XIAN-84 | Kiểm thử US-01.3 | US-01.3 | Thư | 8 | 2 | 26/10 | 26/10 | T26, T37, T44 |
| T30 / XIAN-66 | Kiểm thử US-05.1 | US-05.1 | Thư | 8 | 2 | 27/10 | 27/10 | T25, T26 |
| T38 / XIAN-74 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | US-08.1 | Kỳ | 12 | 3 | 27/10 | 28/10 | T19, T34 |
| T46 / XIAN-82 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | US-02.2 | Nhạn | 8 | 2 | 27/10 | 27/10 | T25, T41 |
| T54 / XIAN-90 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | US-06.2 | Đông | 8 | 2 | 27/10 | 27/10 | T53 |
| T57 / XIAN-93 | FE Cài đặt phòng | US-06.1 | Cường | 4 | 1 | 27/10 | 27/10 | T53 |
| T58 / XIAN-94 | FE danh sách người xem, thao tác ghế và khung camera/mic | US-06.3 | Tình | 20 | 5 | 27/10 | 29/10 | T33, T55 |
| T47 / XIAN-83 | Kiểm thử US-07.1 | US-07.1 | Thư | 8 | 2 | 28/10 | 28/10 | T21, T42, T46 |
| T65 / XIAN-101 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | US-01.4 | Cường | 8 | 2 | 28/10 | 28/10 | T56, T63 |
| T40 / XIAN-76 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | US-03.2 | Cường | 12 | 3 | 29/10 | 30/10 | T31 |
| T43 / XIAN-79 | Kiểm thử US-08.1 | US-08.1 | Thư | 8 | 2 | 29/10 | 29/10 | T38, T63 |
| T52 / XIAN-88 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | US-05.3 | Đông | 12 | 3 | 29/10 | 30/10 | T56 |
| T61 / XIAN-97 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | US-06.2 | Kỳ | 12 | 3 | 29/10 | 30/10 | T54, T57 |
| T27 / XIAN-63 | Kiểm thử US-04.3 | US-04.3 | Tình | 4 | 1 | 30/10 | 30/10 | T22, T25 |
| T45 / XIAN-81 | Kiểm thử US-07.2 | US-07.2 | Thư | 8 | 2 | 30/10 | 30/10 | T21, T42, T58 |
| T68 / XIAN-104 | Kiểm thử US-08.3 | US-08.3 | Nhạn | 8 | 2 | 30/10 | 30/10 | T38, T59, T65 |

### XIAN Sprint 4 · 31/10–04/11 · chưa bắt đầu

Hồi quy 31/10–02/11, kiểm chất lượng 31/10–01/11, đóng gói 03/11 và tổng duyệt 04/11. Tối đa 7 Task/ngày, mỗi người một Task/ngày; phụ thuộc đầu-cuối không trùng ngày. Giữ nguyên thời lượng Task.

11 Task · 100 giờ ước lượng của các Task gắn Sprint.

| Task / Jira | Tên | Story | Người | Giờ | Điểm Jira | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T50 / XIAN-86 | Kiểm thử US-02.2 | US-02.2 | Kỳ | 4 | 1 | 31/10 | 31/10 | T46 |
| T51 / XIAN-87 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | US-00.5 | Thư | 24 | 5 | 31/10 | 02/11 | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| T66 / XIAN-102 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | US-00.5 | Tình | 16 | 3 | 31/10 | 01/11 | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| T67 / XIAN-103 | Kiểm thử US-06.2 | US-06.2 | Nhạn | 8 | 2 | 31/10 | 31/10 | T26, T38, T40, T44, T55, T61, T65 |
| T49 / XIAN-85 | Kiểm thử US-03.2 | US-03.2 | Kỳ | 8 | 2 | 01/11 | 01/11 | T34, T40, T53, T56 |
| T69 / XIAN-105 | Kiểm thử US-01.4 | US-01.4 | Nhạn | 8 | 2 | 01/11 | 01/11 | T23, T26, T32, T37, T38, T40, T44, T52, T61, T65 |
| T60 / XIAN-96 | Kiểm thử US-05.3 | US-05.3 | Tình | 4 | 1 | 02/11 | 02/11 | T25, T52 |
| T62 / XIAN-98 | Kiểm thử US-06.1 | US-06.1 | Nhạn | 8 | 1 | 02/11 | 02/11 | T31, T33, T52, T55, T57 |
| T64 / XIAN-100 | Kiểm thử US-06.3 | US-06.3 | Kỳ | 8 | 2 | 02/11 | 02/11 | T31, T52, T54, T58 |
| T70 / XIAN-106 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | US-00.5 | Tình | 4 | 1 | 03/11 | 03/11 | T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T51, T60, T62, T64, T66, T67, T68, T69 |
| T71 / XIAN-107 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | US-00.5 | Thư | 8 | 1 | 04/11 | 04/11 | T70 |


## 4. Lịch BA và trạng thái

| Mã | Jira | Bắt đầu | Kết thúc dự kiến | Status | Resolution |
|---|---|---|---|---|---|
| EP-00 | XIAN-1 | 2026-10-06 | 2026-10-13 | Done | Done |
| EP-01 | XIAN-2 | 2026-10-07 | 2026-10-14 | Done | Done |
| EP-02 | XIAN-3 | 2026-10-15 | 2026-10-22 | Done | Done |
| EP-03 | XIAN-4 | 2026-10-18 | 2026-10-25 | Done | Done |
| EP-04 | XIAN-5 | 2026-10-07 | 2026-10-14 | Done | Done |
| EP-05 | XIAN-6 | 2026-10-12 | 2026-10-19 | Done | Done |
| EP-06 | XIAN-7 | 2026-10-20 | 2026-10-27 | Done | Done |
| EP-07 | XIAN-8 | 2026-10-18 | 2026-10-25 | Done | Done |
| EP-08 | XIAN-9 | 2026-10-10 | 2026-10-17 | Done | Done |
| US-00.1 | XIAN-10 | 2026-10-08 | 2026-10-11 | Done | Done |
| US-00.2 | XIAN-11 | 2026-10-12 | 2026-10-15 | Done | Done |
| US-00.3 | XIAN-12 | 2026-10-09 | 2026-10-12 | Done | Done |
| US-00.4 | XIAN-13 | 2026-10-09 | 2026-10-12 | Done | Done |
| US-00.5 | XIAN-14 | 2026-10-29 | 2026-11-01 | Done | Done |
| US-01.1 | XIAN-15 | 2026-10-09 | 2026-10-12 | Done | Done |
| US-01.2 | XIAN-16 | 2026-10-12 | 2026-10-15 | Done | Done |
| US-01.3 | XIAN-17 | 2026-10-14 | 2026-10-17 | Done | Done |
| US-01.4 | XIAN-18 | 2026-10-20 | 2026-10-23 | Done | Done |
| US-02.1 | XIAN-19 | 2026-10-17 | 2026-10-20 | Done | Done |
| US-02.2 | XIAN-20 | 2026-10-23 | 2026-10-26 | Done | Done |
| US-03.1 | XIAN-21 | 2026-10-20 | 2026-10-23 | Done | Done |
| US-03.2 | XIAN-22 | 2026-10-24 | 2026-10-27 | Done | Done |
| US-04.1 | XIAN-23 | 2026-10-09 | 2026-10-12 | Done | Done |
| US-04.2 | XIAN-24 | 2026-10-09 | 2026-10-12 | Done | Done |
| US-04.3 | XIAN-25 | 2026-10-12 | 2026-10-15 | Done | Done |
| US-05.1 | XIAN-26 | 2026-10-14 | 2026-10-17 | Done | Done |
| US-05.2 | XIAN-27 | 2026-10-18 | 2026-10-21 | Done | Done |
| US-05.3 | XIAN-28 | 2026-10-27 | 2026-10-30 | Done | Done |
| US-06.1 | XIAN-29 | 2026-10-22 | 2026-10-25 | Done | Done |
| US-06.2 | XIAN-30 | 2026-10-25 | 2026-10-28 | Done | Done |
| US-06.3 | XIAN-31 | 2026-10-23 | 2026-10-26 | Done | Done |
| US-07.1 | XIAN-32 | 2026-10-20 | 2026-10-23 | Done | Done |
| US-07.2 | XIAN-33 | 2026-10-22 | 2026-10-25 | Done | Done |
| US-08.1 | XIAN-34 | 2026-10-18 | 2026-10-21 | Done | Done |
| US-08.2 | XIAN-35 | 2026-10-12 | 2026-10-15 | Done | Done |
| US-08.3 | XIAN-36 | 2026-10-16 | 2026-10-19 | Done | Done |


Các ngày trên là trường kế hoạch, không phải ngày hoàn tất thực tế. 36 mục BA đã Done và không gắn Fix version. Tiến độ sản phẩm được tính từ Task và bằng chứng nghiệm thu.

## 5. Release và workflow

| Release | Bắt đầu | Hạn | Trạng thái | Task |
|---|---|---|---|---|
| v0.1 | 2026-10-10 | 2026-10-16 | Unreleased | 11 |
| v0.2 | 2026-10-17 | 2026-10-23 | Unreleased | 19 |
| v0.3 | 2026-10-24 | 2026-10-30 | Unreleased | 25 |
| v1.0 | 2026-10-31 | 2026-11-04 | Unreleased | 16 |


Release chỉ chứa Task triển khai, hiện 0% hoàn thành. T50 / XIAN-86 kết thúc 31/10 và thuộc v1.0.

Workflow XIAN: To Do → Ready for Code → In Progress → Ready For Test → Done. Transition 5 đặt Resolution = Done; Mở lại (transition 9) đưa Done → To Do và xóa Resolution. Đã lưu và đọc lại cấu hình; chưa chuyển thử Task thật. Workflow dùng chung cho các loại công việc trong XIAN.

## 6. Lịch từng người và số Task mỗi ngày

### Tình

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T01 | 8 | 10/10 | 10/10 |
| T12 | 24 | 11/10 | 13/10 |
| T24 | 32 | 14/10 | 17/10 |
| T16 | 4 | 20/10 | 20/10 |
| T37 | 16 | 22/10 | 23/10 |
| T33 | 24 | 24/10 | 26/10 |
| T58 | 20 | 27/10 | 29/10 |
| T27 | 4 | 30/10 | 30/10 |
| T66 | 16 | 31/10 | 01/11 |
| T60 | 4 | 02/11 | 02/11 |
| T70 | 4 | 03/11 | 03/11 |

### Đông

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T04 | 24 | 11/10 | 13/10 |
| T14 | 12 | 14/10 | 15/10 |
| T59 | 12 | 18/10 | 19/10 |
| T34 | 12 | 20/10 | 21/10 |
| T56 | 24 | 22/10 | 24/10 |
| T55 | 16 | 25/10 | 26/10 |
| T54 | 8 | 27/10 | 27/10 |
| T52 | 12 | 29/10 | 30/10 |

### Tùng

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T05 | 8 | 11/10 | 11/10 |
| T07 | 8 | 12/10 | 12/10 |
| T10 | 8 | 13/10 | 13/10 |
| T09 | 16 | 14/10 | 15/10 |
| T20 | 24 | 16/10 | 18/10 |
| T18 | 24 | 19/10 | 21/10 |
| T22 | 12 | 22/10 | 23/10 |
| T53 | 12 | 24/10 | 25/10 |
| T31 | 20 | 26/10 | 28/10 |

### Cường

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T06 | 24 | 11/10 | 13/10 |
| T35 | 24 | 16/10 | 18/10 |
| T23 | 8 | 19/10 | 19/10 |
| T32 | 12 | 20/10 | 21/10 |
| T63 | 12 | 22/10 | 23/10 |
| T26 | 8 | 24/10 | 24/10 |
| T41 | 12 | 25/10 | 26/10 |
| T57 | 4 | 27/10 | 27/10 |
| T65 | 8 | 28/10 | 28/10 |
| T40 | 12 | 29/10 | 30/10 |

### Nhạn

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T11 | 16 | 11/10 | 12/10 |
| T19 | 24 | 14/10 | 16/10 |
| T17 | 8 | 21/10 | 21/10 |
| T21 | 16 | 22/10 | 23/10 |
| T36 | 8 | 24/10 | 24/10 |
| T29 | 8 | 25/10 | 25/10 |
| T46 | 8 | 27/10 | 27/10 |
| T68 | 8 | 30/10 | 30/10 |
| T67 | 8 | 31/10 | 31/10 |
| T69 | 8 | 01/11 | 01/11 |
| T62 | 8 | 02/11 | 02/11 |

### Kỳ

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T03 | 12 | 18/10 | 19/10 |
| T15 | 8 | 20/10 | 20/10 |
| T08 | 8 | 21/10 | 21/10 |
| T25 | 16 | 22/10 | 23/10 |
| T44 | 8 | 24/10 | 24/10 |
| T39 | 4 | 25/10 | 25/10 |
| T42 | 8 | 26/10 | 26/10 |
| T38 | 12 | 27/10 | 28/10 |
| T61 | 12 | 29/10 | 30/10 |
| T50 | 4 | 31/10 | 31/10 |
| T49 | 8 | 01/11 | 01/11 |
| T64 | 8 | 02/11 | 02/11 |

### Thư

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T02 | 32 | 14/10 | 17/10 |
| T13 | 8 | 22/10 | 22/10 |
| T28 | 8 | 25/10 | 25/10 |
| T48 | 8 | 26/10 | 26/10 |
| T30 | 8 | 27/10 | 27/10 |
| T47 | 8 | 28/10 | 28/10 |
| T43 | 8 | 29/10 | 29/10 |
| T45 | 8 | 30/10 | 30/10 |
| T51 | 24 | 31/10 | 02/11 |
| T71 | 8 | 04/11 | 04/11 |

| Ngày | Task theo kế hoạch |
|---|---|
| 10/10 | 1 |
| 11/10 | 5 |
| 12/10 | 5 |
| 13/10 | 4 |
| 14/10 | 5 |
| 15/10 | 5 |
| 16/10 | 5 |
| 17/10 | 4 |
| 18/10 | 4 |
| 19/10 | 4 |
| 20/10 | 5 |
| 21/10 | 5 |
| 22/10 | 7 |
| 23/10 | 6 |
| 24/10 | 6 |
| 25/10 | 7 |
| 26/10 | 6 |
| 27/10 | 7 |
| 28/10 | 5 |
| 29/10 | 5 |
| 30/10 | 6 |
| 31/10 | 4 |
| 01/11 | 4 |
| 02/11 | 4 |
| 03/11 | 1 |
| 04/11 | 1 |


## 7. Tra cứu công việc chi tiết

Description đầy đủ được giữ tại [danh sách 107 mục Jira](jira/reports/JIRA-MUC-CHI-TIET.md). Bảng dưới dẫn tới từng Task; kế hoạch này chỉ giữ lịch, phân công và phụ thuộc để tránh lặp nội dung.

| Task | Công việc | Jira |
|---|---|---|
| [T01](jira/reports/JIRA-MUC-CHI-TIET.md#t01) | Dựng monorepo, CI, nhật ký và /health | XIAN-37 |
| [T02](jira/reports/JIRA-MUC-CHI-TIET.md#t02) | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | XIAN-38 |
| [T03](jira/reports/JIRA-MUC-CHI-TIET.md#t03) | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | XIAN-39 |
| [T04](jira/reports/JIRA-MUC-CHI-TIET.md#t04) | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | XIAN-40 |
| [T05](jira/reports/JIRA-MUC-CHI-TIET.md#t05) | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | XIAN-41 |
| [T06](jira/reports/JIRA-MUC-CHI-TIET.md#t06) | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | XIAN-42 |
| [T07](jira/reports/JIRA-MUC-CHI-TIET.md#t07) | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | XIAN-43 |
| [T08](jira/reports/JIRA-MUC-CHI-TIET.md#t08) | FE màn Đăng ký 3 bước | XIAN-44 |
| [T09](jira/reports/JIRA-MUC-CHI-TIET.md#t09) | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | XIAN-45 |
| [T10](jira/reports/JIRA-MUC-CHI-TIET.md#t10) | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | XIAN-46 |
| [T11](jira/reports/JIRA-MUC-CHI-TIET.md#t11) | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | XIAN-47 |
| [T12](jira/reports/JIRA-MUC-CHI-TIET.md#t12) | Khung realtime Socket.IO | XIAN-48 |
| [T13](jira/reports/JIRA-MUC-CHI-TIET.md#t13) | Kiểm thử US-01.1 | XIAN-49 |
| [T14](jira/reports/JIRA-MUC-CHI-TIET.md#t14) | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | XIAN-50 |
| [T15](jira/reports/JIRA-MUC-CHI-TIET.md#t15) | FE màn Đăng nhập | XIAN-51 |
| [T16](jira/reports/JIRA-MUC-CHI-TIET.md#t16) | Kiểm thử US-04.2 | XIAN-52 |
| [T17](jira/reports/JIRA-MUC-CHI-TIET.md#t17) | Kiểm thử US-01.2 | XIAN-53 |
| [T18](jira/reports/JIRA-MUC-CHI-TIET.md#t18) | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | XIAN-54 |
| [T19](jira/reports/JIRA-MUC-CHI-TIET.md#t19) | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | XIAN-55 |
| [T20](jira/reports/JIRA-MUC-CHI-TIET.md#t20) | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | XIAN-56 |
| [T21](jira/reports/JIRA-MUC-CHI-TIET.md#t21) | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | XIAN-57 |
| [T22](jira/reports/JIRA-MUC-CHI-TIET.md#t22) | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | XIAN-58 |
| [T23](jira/reports/JIRA-MUC-CHI-TIET.md#t23) | BE đồng hồ thi đấu và hết giờ | XIAN-59 |
| [T24](jira/reports/JIRA-MUC-CHI-TIET.md#t24) | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | XIAN-60 |
| [T25](jira/reports/JIRA-MUC-CHI-TIET.md#t25) | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | XIAN-61 |
| [T26](jira/reports/JIRA-MUC-CHI-TIET.md#t26) | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | XIAN-62 |
| [T27](jira/reports/JIRA-MUC-CHI-TIET.md#t27) | Kiểm thử US-04.3 | XIAN-63 |
| [T28](jira/reports/JIRA-MUC-CHI-TIET.md#t28) | Kiểm thử US-02.1 | XIAN-64 |
| [T29](jira/reports/JIRA-MUC-CHI-TIET.md#t29) | Kiểm thử US-03.1 | XIAN-65 |
| [T30](jira/reports/JIRA-MUC-CHI-TIET.md#t30) | Kiểm thử US-05.1 | XIAN-66 |
| [T31](jira/reports/JIRA-MUC-CHI-TIET.md#t31) | BE bạn bè, trạng thái online, mời bạn online vào phòng | XIAN-67 |
| [T32](jira/reports/JIRA-MUC-CHI-TIET.md#t32) | BE đầu hàng, rời phòng giữa ván, xin hoà | XIAN-68 |
| [T33](jira/reports/JIRA-MUC-CHI-TIET.md#t33) | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | XIAN-69 |
| [T34](jira/reports/JIRA-MUC-CHI-TIET.md#t34) | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | XIAN-70 |
| [T35](jira/reports/JIRA-MUC-CHI-TIET.md#t35) | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | XIAN-71 |
| [T36](jira/reports/JIRA-MUC-CHI-TIET.md#t36) | FE nút Đầu hàng, Xin hoà và khung đề nghị | XIAN-72 |
| [T37](jira/reports/JIRA-MUC-CHI-TIET.md#t37) | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | XIAN-73 |
| [T38](jira/reports/JIRA-MUC-CHI-TIET.md#t38) | FE thiết lập/chơi AI và giao diện sự cố máy cờ | XIAN-74 |
| [T39](jira/reports/JIRA-MUC-CHI-TIET.md#t39) | Kiểm thử US-05.2 | XIAN-75 |
| [T40](jira/reports/JIRA-MUC-CHI-TIET.md#t40) | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | XIAN-76 |
| [T41](jira/reports/JIRA-MUC-CHI-TIET.md#t41) | BE Xin đổi bên và phòng về chờ sau ván | XIAN-77 |
| [T42](jira/reports/JIRA-MUC-CHI-TIET.md#t42) | FE khung chat hai kênh | XIAN-78 |
| [T43](jira/reports/JIRA-MUC-CHI-TIET.md#t43) | Kiểm thử US-08.1 | XIAN-79 |
| [T44](jira/reports/JIRA-MUC-CHI-TIET.md#t44) | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | XIAN-80 |
| [T45](jira/reports/JIRA-MUC-CHI-TIET.md#t45) | Kiểm thử US-07.2 | XIAN-81 |
| [T46](jira/reports/JIRA-MUC-CHI-TIET.md#t46) | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | XIAN-82 |
| [T47](jira/reports/JIRA-MUC-CHI-TIET.md#t47) | Kiểm thử US-07.1 | XIAN-83 |
| [T48](jira/reports/JIRA-MUC-CHI-TIET.md#t48) | Kiểm thử US-01.3 | XIAN-84 |
| [T49](jira/reports/JIRA-MUC-CHI-TIET.md#t49) | Kiểm thử US-03.2 | XIAN-85 |
| [T50](jira/reports/JIRA-MUC-CHI-TIET.md#t50) | Kiểm thử US-02.2 | XIAN-86 |
| [T51](jira/reports/JIRA-MUC-CHI-TIET.md#t51) | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | XIAN-87 |
| [T52](jira/reports/JIRA-MUC-CHI-TIET.md#t52) | BE mất kết nối, ân hạn, đồng bộ lại và server restart | XIAN-88 |
| [T53](jira/reports/JIRA-MUC-CHI-TIET.md#t53) | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | XIAN-89 |
| [T54](jira/reports/JIRA-MUC-CHI-TIET.md#t54) | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | XIAN-90 |
| [T55](jira/reports/JIRA-MUC-CHI-TIET.md#t55) | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | XIAN-91 |
| [T56](jira/reports/JIRA-MUC-CHI-TIET.md#t56) | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | XIAN-92 |
| [T57](jira/reports/JIRA-MUC-CHI-TIET.md#t57) | FE Cài đặt phòng | XIAN-93 |
| [T58](jira/reports/JIRA-MUC-CHI-TIET.md#t58) | FE danh sách người xem, thao tác ghế và khung camera/mic | XIAN-94 |
| [T59](jira/reports/JIRA-MUC-CHI-TIET.md#t59) | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | XIAN-95 |
| [T60](jira/reports/JIRA-MUC-CHI-TIET.md#t60) | Kiểm thử US-05.3 | XIAN-96 |
| [T61](jira/reports/JIRA-MUC-CHI-TIET.md#t61) | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | XIAN-97 |
| [T62](jira/reports/JIRA-MUC-CHI-TIET.md#t62) | Kiểm thử US-06.1 | XIAN-98 |
| [T63](jira/reports/JIRA-MUC-CHI-TIET.md#t63) | BE giữ ván AI 30 phút, Thử lại, khởi động lại | XIAN-99 |
| [T64](jira/reports/JIRA-MUC-CHI-TIET.md#t64) | Kiểm thử US-06.3 | XIAN-100 |
| [T65](jira/reports/JIRA-MUC-CHI-TIET.md#t65) | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | XIAN-101 |
| [T66](jira/reports/JIRA-MUC-CHI-TIET.md#t66) | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | XIAN-102 |
| [T67](jira/reports/JIRA-MUC-CHI-TIET.md#t67) | Kiểm thử US-06.2 | XIAN-103 |
| [T68](jira/reports/JIRA-MUC-CHI-TIET.md#t68) | Kiểm thử US-08.3 | XIAN-104 |
| [T69](jira/reports/JIRA-MUC-CHI-TIET.md#t69) | Kiểm thử US-01.4 | XIAN-105 |
| [T70](jira/reports/JIRA-MUC-CHI-TIET.md#t70) | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | XIAN-106 |
| [T71](jira/reports/JIRA-MUC-CHI-TIET.md#t71) | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | XIAN-107 |


## 8. Kiểm chứng và sử dụng dữ liệu

T51 hồi quy sau triển khai; T70 chờ T51, T66 và toàn bộ QA chuyên đề; T71 tổng duyệt bản phát hành. Mọi tiêu chí bắt buộc cần bằng chứng thực tế. Nếu đầu vào trễ hoặc ước lượng không đủ, cập nhật lịch thay vì tự hạ ngưỡng hoặc ghi PASS cho ca chưa chạy.

CSV là bản xuất đối chiếu **các mục đã tồn tại**, gồm Issue Key, Resolution và định danh tài khoản. Không nhập như các mục mới; không dùng import CSV để ép chuyển trạng thái. Script local không ghi lên Jira.

Để cập nhật nguồn, lấy snapshot Jira mới vào `jira/data/current-jira-snapshot.json`, chạy `python3 jira/tools/sync_plan_from_snapshot.py`, `python3 jira/tools/build_plan.py`, rồi `python3 jira/tools/build_plan.py --check`. Bộ kiểm đối chiếu dữ liệu với snapshot, 268 AC, phụ thuộc, giới hạn ngày, người kiểm độc lập và các đầu ra. Đây là kiểm dữ liệu kế hoạch, chưa phải kiểm phần mềm.

[Báo cáo kiểm tra](jira/reports/KIEM-TRA-KE-HOACH.md) · [Trạng thái hiện hành](jira/reports/CURRENT-JIRA-STATE.md).
