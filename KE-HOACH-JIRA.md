# KẾ HOẠCH JIRA — Cờ Tướng Online (XIAN)

> **Phiên bản 2.0 · Lập lại 09/10/2026.** Nhóm xác nhận chưa triển khai. Ngày 09/10 dành cho BA/kế hoạch; ngày công đầu tiên 10/10. **Giữ 9 Epic, 27 Story, 71 Task; hạn demo 05/11.** Lịch là ước lượng có điều kiện kiểm chứng, không phải cam kết các gate đã đạt.

> Nguồn: [BA](BA-SCOPE-DECISIONS.md), [backlog](BACKLOG-P1.md), [bản đồ nghiệm thu](jira/TRUY-VET-AC.md). Tệp nhập: [xian-import.csv](jira/xian-import.csv); bản đầy đủ: [JIRA-MUC-CHI-TIET](jira/JIRA-MUC-CHI-TIET.md). Chưa nhập hoặc xoá dữ liệu Jira.

## 1. Nguyên tắc và thay đổi so với kế hoạch cũ

- 8 giờ/người/ngày, làm cả cuối tuần; một Task một người, không làm hai Task cùng thời điểm; 4 giờ/nửa ngày. Không đưa 8→12 giờ vào lịch cơ sở.
- Epic/Story là sản phẩm BA theo hướng dẫn giảng viên; Task thường cùng có cha Epic, liên kết Story. Không đổi thành Sub-task, không thêm Epic P2 vào 107 mục nhập.
- Từng Task nằm trọn trong một Sprint. Một Story có thể trải nhiều Sprint để có đủ phần triển khai và kiểm tích hợp; thay quy tắc cũ ép toàn bộ Task của Story vào cùng Sprint.
- Tình giữ lõi luật, realtime, máy cờ và backend media/phục hồi. Chuyển giao diện thường lệ sang FE và chuẩn bị đáp án thử sang Tester; không bỏ chức năng.
- T33 không phải chờ FE T25; T52 không phải chờ FE T25; T59 không phải chờ FE T38: hợp đồng bàn giao ở T12, đầu-cuối được kiểm tại T45/T60/T68. Những phụ thuộc thực còn lại vẫn phải hoàn tất trước khi bắt đầu.
- T51 chạy **đầy đủ** sau tất cả triển khai, song song QA chuyên đề bằng tài khoản/phòng thử riêng. T70 phải chờ T51, T66 và toàn bộ 20 QA, mọi tiêu chí bắt buộc PASS.
- Lỗi sửa và kiểm lại trong Task sở hữu; 04/11 là dự phòng, không có Task cơ sở. Giữ đúng số Epic/Story/Task; không tạo thêm issue loại này để chứa TC hoặc công việc quản lý.

| Chỉ số kiểm trên dữ liệu | Kết quả |
|---|---|
| Epic / Story / Task | 9 / 27 / 71 |
| Giờ / điểm | 920 giờ / 205 điểm |
| Task QA chuyên đề / Task khác | 20 / 51 |
| AC / NFR / Gate / Demo | 268 / 12 / 9 / 10 |
| Phụ thuộc trực tiếp sau bỏ cạnh bắc cầu | 186 |
| Task chạy đồng thời cao nhất | 7 |
| Trùng người / sai thứ tự / thiếu tham chiếu | 0 / 0 / 0 |
| Hoàn tất cơ sở | 03/11 chiều |
| Dự phòng | 04/11 cả ngày |
| Demo | 05/11/2026 |


Các kiểm tra trên chỉ chứng minh lịch đáp ứng các ràng buộc đã mô hình hoá. Chúng không chứng minh ước lượng hoặc giải pháp kỹ thuật chắc chắn đúng. Chọn mức song song 7 theo trần BA; không giữ tuyên bố cũ tối đa 5.

## 2. Cấu trúc và nguồn lực

| Epic | Nội dung | Story | Task |
|---|---|---|---|
| EP-00 | Nền tảng kỹ thuật và chất lượng | 5 | 10 |
| EP-01 | Đăng ký và đăng nhập | 4 | 12 |
| EP-02 | Tạo phòng | 2 | 6 |
| EP-03 | Mời vào phòng | 2 | 6 |
| EP-04 | Khởi tạo bàn cờ | 3 | 7 |
| EP-05 | Hai người đánh cờ online | 3 | 9 |
| EP-06 | Chế độ phòng và người xem | 3 | 9 |
| EP-07 | Chat, camera và mic | 2 | 5 |
| EP-08 | Đánh với máy theo cấp độ | 3 | 7 |


| Người | S1 giờ | S2 giờ | S3 giờ | S4 giờ | Tổng | Còn trong công suất 208h |
|---|---|---|---|---|---|---|
| Tình | 56 | 56 | 48 | 4 | 164 | 44 |
| Đông | 40 | 32 | 24 | 0 | 96 | 112 |
| Tùng | 16 | 56 | 28 | 16 | 116 | 92 |
| Cường | 24 | 56 | 36 | 0 | 116 | 92 |
| Nhạn | 40 | 40 | 56 | 24 | 160 | 48 |
| Kỳ | 36 | 32 | 56 | 20 | 144 | 64 |
| Thư | 32 | 8 | 56 | 28 | 124 | 84 |


Công suất 10/10–04/11 là 26 ngày × 8 giờ = 208 giờ/người, toàn nhóm 1.456 giờ. Tình 164 giờ, giữ 100% công suất kỹ thuật theo BA, không tự trừ vai trò PO/SM. Giờ trống phục vụ review, sửa lỗi và kiểm lại; không phải toàn bộ đều chuyển được sang đường công việc của người khác.

## 3. Sprint và kết quả bàn giao

### XIAN Sprint 1 · 10/10–16/10 · v0.1

Khung ứng dụng, đăng ký OTP, lõi luật và bàn cờ tương tác; thử media/xác thực/phiên sớm. Chưa tuyên bố nghiệm thu toàn bộ đăng nhập có Google.

**17 Task · 244 giờ · 53 điểm.**

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | US-00.1 | Tình | 8 | 2 | 10/10 sáng | 10/10 chiều | — |
| T02 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | US-00.4 | Thư | 20 | 5 | 10/10 sáng | 12/10 sáng | — |
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | US-00.1 | Kỳ | 16 | 3 | 11/10 sáng | 12/10 chiều | T01 |
| T04 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | US-01.1 | Đông | 24 | 5 | 11/10 sáng | 13/10 chiều | T01 |
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | US-04.1 | Tình | 8 | 2 | 11/10 sáng | 11/10 chiều | T01 |
| T06 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | US-00.4 | Cường | 24 | 5 | 11/10 sáng | 13/10 chiều | T01 |
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | US-04.2 | Nhạn | 16 | 3 | 11/10 sáng | 12/10 chiều | T01 |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | US-04.1 | Tình | 8 | 2 | 12/10 sáng | 12/10 chiều | T05 |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | US-04.1 | Tình | 8 | 2 | 13/10 sáng | 13/10 chiều | T07 |
| T16 | Kiểm thử US-04.2 | US-04.2 | Thư | 4 | 1 | 13/10 sáng | 13/10 sáng | T11 |
| T08 | FE màn Đăng ký 3 bước | US-01.1 | Kỳ | 12 | 3 | 14/10 sáng | 15/10 sáng | T03, T04 |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | US-01.2 | Tùng | 16 | 3 | 14/10 sáng | 15/10 chiều | T04 |
| T12 | Khung realtime Socket.IO | US-00.3 | Tình | 24 | 5 | 14/10 sáng | 16/10 chiều | T01 |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | US-00.2 | Đông | 16 | 3 | 14/10 sáng | 15/10 chiều | T04 |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | US-04.3 | Nhạn | 24 | 5 | 14/10 sáng | 16/10 chiều | T10, T11 |
| T13 | Kiểm thử US-01.1 | US-01.1 | Thư | 8 | 2 | 15/10 chiều | 16/10 sáng | T08 |
| T15 | FE màn Đăng nhập | US-01.2 | Kỳ | 8 | 2 | 16/10 sáng | 16/10 chiều | T03, T09 |

### XIAN Sprint 2 · 17/10–23/10 · v0.2

Tạo/vào phòng, ván online cơ bản, Google/Khách, máy cờ có baseline; hoàn thiện các backend phòng/chat. Một số AC liên chức năng chờ S3–S4.

**18 Task · 280 giờ · 62 điểm.**

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T17 | Kiểm thử US-01.2 | US-01.2 | Nhạn | 8 | 2 | 17/10 sáng | 17/10 chiều | T15 |
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | US-02.1 | Tùng | 24 | 5 | 17/10 sáng | 19/10 chiều | T12, T14 |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | US-05.1 | Tình | 24 | 5 | 17/10 sáng | 19/10 chiều | T10, T12, T14 |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | US-01.3 | Cường | 24 | 5 | 17/10 sáng | 19/10 chiều | T09, T14 |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | US-02.1 | Nhạn | 16 | 3 | 20/10 sáng | 21/10 chiều | T03, T18 |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | US-03.1 | Tùng | 16 | 3 | 20/10 sáng | 21/10 chiều | T18, T09 |
| T23 | BE đồng hồ thi đấu và hết giờ | US-05.1 | Cường | 8 | 2 | 20/10 sáng | 20/10 chiều | T20 |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | US-08.2 | Tình | 32 | 8 | 20/10 sáng | 23/10 chiều | T10 |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | US-07.1 | Đông | 16 | 3 | 20/10 sáng | 21/10 chiều | T18, T35 |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | US-01.3 | Kỳ | 12 | 3 | 20/10 sáng | 21/10 sáng | T15, T35 |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | US-05.2 | Cường | 12 | 3 | 21/10 sáng | 22/10 sáng | T20 |
| T25 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | US-05.1 | Kỳ | 20 | 5 | 21/10 chiều | 23/10 chiều | T19, T23 |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | US-03.1 | Nhạn | 8 | 2 | 22/10 sáng | 22/10 chiều | T21, T22 |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | US-06.1 | Tùng | 16 | 3 | 22/10 sáng | 23/10 chiều | T22 |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | US-06.3 | Đông | 16 | 3 | 22/10 sáng | 23/10 chiều | T22 |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | US-02.2 | Cường | 12 | 3 | 22/10 chiều | 23/10 chiều | T20, T37 |
| T29 | Kiểm thử US-03.1 | US-03.1 | Thư | 8 | 2 | 23/10 sáng | 23/10 chiều | T26, T35, T08, T15 |
| T48 | Kiểm thử US-01.3 | US-01.3 | Nhạn | 8 | 2 | 23/10 sáng | 23/10 chiều | T44, T37, T26 |

### XIAN Sprint 3 · 24/10–30/10 · v0.3

Hoàn tất mọi phần triển khai P1: phiên, bạn bè, media, AI, Sảnh/người xem, phục hồi; chạy QA chuyên đề đã đủ đầu vào.

**26 Task · 304 giờ · 69 điểm.**

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T27 | Kiểm thử US-04.3 | US-04.3 | Thư | 4 | 1 | 24/10 sáng | 24/10 sáng | T25, T22 |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | US-08.1 | Tùng | 16 | 3 | 24/10 sáng | 25/10 chiều | T20, T24 |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | US-05.2 | Kỳ | 8 | 2 | 24/10 sáng | 24/10 chiều | T25, T32 |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | US-06.2 | Cường | 12 | 3 | 24/10 sáng | 25/10 sáng | T53 |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | US-01.4 | Đông | 24 | 5 | 24/10 sáng | 26/10 chiều | T18, T20, T35 |
| T57 | FE Cài đặt phòng | US-06.1 | Nhạn | 8 | 2 | 24/10 sáng | 24/10 chiều | T53 |
| T59 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | US-08.3 | Tình | 12 | 3 | 24/10 sáng | 25/10 sáng | T24, T02 |
| T28 | Kiểm thử US-02.1 | US-02.1 | Thư | 8 | 2 | 24/10 chiều | 25/10 sáng | T26, T37, T25 |
| T42 | FE khung chat hai kênh | US-07.1 | Nhạn | 12 | 3 | 25/10 sáng | 26/10 sáng | T25, T37 |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | US-02.2 | Kỳ | 8 | 2 | 25/10 sáng | 25/10 chiều | T25, T41 |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | US-03.2 | Cường | 24 | 5 | 25/10 chiều | 28/10 sáng | T22, T35 |
| T33 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | US-07.2 | Tình | 24 | 5 | 25/10 chiều | 28/10 sáng | T06, T22, T35 |
| T39 | Kiểm thử US-05.2 | US-05.2 | Thư | 4 | 1 | 25/10 chiều | 25/10 chiều | T36, T18 |
| T50 | Kiểm thử US-02.2 | US-02.2 | Thư | 4 | 1 | 26/10 sáng | 26/10 sáng | T46 |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | US-06.2 | Kỳ | 16 | 3 | 26/10 sáng | 27/10 chiều | T54, T57 |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | US-08.3 | Tùng | 12 | 3 | 26/10 sáng | 27/10 sáng | T34, T35 |
| T38 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | US-08.1 | Nhạn | 16 | 3 | 26/10 chiều | 28/10 sáng | T19, T34 |
| T47 | Kiểm thử US-07.1 | US-07.1 | Thư | 8 | 2 | 26/10 chiều | 27/10 sáng | T42, T46, T21 |
| T30 | Kiểm thử US-05.1 | US-05.1 | Thư | 8 | 2 | 27/10 chiều | 28/10 sáng | T25, T26 |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | US-01.4 | Kỳ | 8 | 2 | 28/10 sáng | 28/10 chiều | T56, T63 |
| T43 | Kiểm thử US-08.1 | US-08.1 | Thư | 8 | 2 | 28/10 chiều | 29/10 sáng | T38, T63 |
| T52 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | US-05.3 | Tình | 12 | 3 | 28/10 chiều | 29/10 chiều | T56 |
| T58 | FE danh sách người xem, thao tác ghế và khung camera/mic | US-06.3 | Nhạn | 20 | 5 | 28/10 chiều | 30/10 chiều | T55, T33 |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | US-03.2 | Kỳ | 16 | 3 | 29/10 sáng | 30/10 chiều | T31 |
| T68 | Kiểm thử US-08.3 | US-08.3 | Thư | 8 | 2 | 29/10 chiều | 30/10 sáng | T59, T38, T65 |
| T60 | Kiểm thử US-05.3 | US-05.3 | Thư | 4 | 1 | 30/10 chiều | 30/10 chiều | T52, T25 |

### XIAN Sprint 4 · 31/10–04/11 · v1.0

Hồi quy đầy đủ và QA còn lại trên bản tích hợp, đo NFR/gate, đóng gói và tổng duyệt 03/11; 04/11 dự phòng.

**10 Task · 92 giờ · 21 điểm.**

| Task | Tên | Story | Người | Giờ | Điểm | Bắt đầu | Kết thúc | Phụ thuộc |
|---|---|---|---|---|---|---|---|---|
| T51 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | US-00.5 | Thư | 24 | 5 | 31/10 sáng | 02/11 chiều | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| T62 | Kiểm thử US-06.1 | US-06.1 | Kỳ | 4 | 1 | 31/10 sáng | 31/10 sáng | T57, T31, T33, T52, T55 |
| T66 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | US-00.5 | Tùng | 16 | 3 | 31/10 sáng | 01/11 chiều | T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65 |
| T67 | Kiểm thử US-06.2 | US-06.2 | Nhạn | 8 | 2 | 31/10 sáng | 31/10 chiều | T61, T55, T38, T26, T40, T44, T65 |
| T45 | Kiểm thử US-07.2 | US-07.2 | Kỳ | 8 | 2 | 31/10 chiều | 01/11 sáng | T58, T21, T42 |
| T49 | Kiểm thử US-03.2 | US-03.2 | Nhạn | 8 | 2 | 01/11 sáng | 01/11 chiều | T40, T53, T56, T34 |
| T64 | Kiểm thử US-06.3 | US-06.3 | Kỳ | 8 | 2 | 01/11 chiều | 02/11 sáng | T58, T52, T31, T54 |
| T69 | Kiểm thử US-01.4 | US-01.4 | Nhạn | 8 | 2 | 02/11 sáng | 02/11 chiều | T65, T52, T23, T38, T61, T32, T37, T44, T40, T26 |
| T70 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | US-00.5 | Tình | 4 | 1 | 03/11 sáng | 03/11 sáng | T51, T66, T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T60, T62, T64, T67, T68, T69 |
| T71 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | US-00.5 | Thư | 4 | 1 | 03/11 chiều | 03/11 chiều | T70 |


## 4. R1 — ngày Epic/Story và nghiệm thu sản phẩm

Mọi Epic/Story bắt đầu **09/10**. Story mặc định có hạn ngày Task đầu tiên bắt đầu và phải được PO duyệt trước giờ bắt đầu Task đó; US-08.3 và US-00.5 giữ ngoại lệ tới ngày Task cuối để đóng hồ sơ kiểm chứng. **Các ngưỡng AC đã chốt trước thi công, không chờ số đo để hạ tiêu chuẩn.** Epic có hạn theo Story muộn nhất. Mọi mục nhập To Do; không tự đánh dấu Done dựa trên ngày kế hoạch.

| Story | Hạn BA theo R1 | Thi công | Sprint có Task |
|---|---|---|---|
| US-00.1 | 10/10 | 10/10 → 12/10 | S1 |
| US-00.2 | 14/10 | 14/10 → 15/10 | S1 |
| US-00.3 | 14/10 | 14/10 → 16/10 | S1 |
| US-00.4 | 10/10 | 10/10 → 13/10 | S1 |
| US-00.5 | 03/11 | 31/10 → 03/11 | S4 |
| US-01.1 | 11/10 | 11/10 → 16/10 | S1 |
| US-01.2 | 14/10 | 14/10 → 17/10 | S1, S2 |
| US-01.3 | 17/10 | 17/10 → 23/10 | S2 |
| US-01.4 | 24/10 | 24/10 → 02/11 | S3, S4 |
| US-02.1 | 17/10 | 17/10 → 25/10 | S2, S3 |
| US-02.2 | 22/10 | 22/10 → 26/10 | S2, S3 |
| US-03.1 | 20/10 | 20/10 → 23/10 | S2 |
| US-03.2 | 25/10 | 25/10 → 01/11 | S3, S4 |
| US-04.1 | 11/10 | 11/10 → 13/10 | S1 |
| US-04.2 | 11/10 | 11/10 → 13/10 | S1 |
| US-04.3 | 14/10 | 14/10 → 24/10 | S1, S3 |
| US-05.1 | 17/10 | 17/10 → 28/10 | S2, S3 |
| US-05.2 | 21/10 | 21/10 → 25/10 | S2, S3 |
| US-05.3 | 28/10 | 28/10 → 30/10 | S3 |
| US-06.1 | 22/10 | 22/10 → 31/10 | S2, S3, S4 |
| US-06.2 | 24/10 | 24/10 → 31/10 | S3, S4 |
| US-06.3 | 22/10 | 22/10 → 02/11 | S2, S3, S4 |
| US-07.1 | 20/10 | 20/10 → 27/10 | S2, S3 |
| US-07.2 | 25/10 | 25/10 → 01/11 | S3, S4 |
| US-08.1 | 24/10 | 24/10 → 29/10 | S3 |
| US-08.2 | 20/10 | 20/10 → 23/10 | S2 |
| US-08.3 | 30/10 | 24/10 → 30/10 | S3 |


Story BA Done không được dùng làm chỉ số chức năng hoàn thành. Chức năng chỉ được nghiệm thu khi mọi AC trong bản đồ đã PASS; QA Task sớm chỉ chịu phần được giao. Story Points chỉ nhập vào Task, tiếp tục quy đổi từ giờ theo thang cũ; không nhập tổng điểm vào Story/Epic.

## 5. Cổng kỹ thuật và thứ tự nghiệm thu

| Gate | Thử/đo sớm | Nghiệm thu thật / đối soát |
|---|---|---|
| SMTP | T04 · 13/10 | T13: email ngoài nhóm, 5 thư/giờ, lỗi dịch vụ; T66 đối soát |
| EMAIL | T04 · 13/10 | Gọi API trực tiếp; đổi được email thì BLOCKED; T66 đối soát |
| AUTH-USERNAME | T09 · 15/10 | T17: đăng nhập/khoá mật khẩu; nhánh Google tại T48 |
| GOOGLE / GUEST | T04 thử cấu hình · 13/10 | T35 triển khai thật; T48 nghiệm thu; các nhánh ghế/phiên ở T51/T69 |
| SESSION | T06 thử mô hình · 13/10 | T56 trên ván thật, T69 kiểm phiên/đăng xuất; không dùng mô phỏng thay PASS |
| MEDIA | T06 LAN/Cloud/HTTPS · 13/10 | T33 + T58, T45 và T64 nghiệm thu quyền thật |
| ENGINE | T24 baseline · 23/10 | T59 tinh chỉnh/đo 25/10; T68 kiểm độc lập |
| REALTIME | T12 thử socket nền · 16/10 | T66: 50 người/10 ván tích hợp thật; không đạt chặn T70 |


Ba quyết định PO ngày 09/10 đã ghi vào AC hiện có: username từ cấm ở bước nhập; thắng/thua ưu tiên trước hoà 120; server restart phòng tự tạo về WAITING. Giữ 268 mã AC; các biến thể TC bổ sung không tạo issue Jira mới.

## 6. Lịch từng người và mức song song

### Tình

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T01 | 8 | 10/10 sáng | 10/10 chiều |
| T05 | 8 | 11/10 sáng | 11/10 chiều |
| T07 | 8 | 12/10 sáng | 12/10 chiều |
| T10 | 8 | 13/10 sáng | 13/10 chiều |
| T12 | 24 | 14/10 sáng | 16/10 chiều |
| T20 | 24 | 17/10 sáng | 19/10 chiều |
| T24 | 32 | 20/10 sáng | 23/10 chiều |
| T59 | 12 | 24/10 sáng | 25/10 sáng |
| T33 | 24 | 25/10 chiều | 28/10 sáng |
| T52 | 12 | 28/10 chiều | 29/10 chiều |
| T70 | 4 | 03/11 sáng | 03/11 sáng |

### Đông

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T04 | 24 | 11/10 sáng | 13/10 chiều |
| T14 | 16 | 14/10 sáng | 15/10 chiều |
| T37 | 16 | 20/10 sáng | 21/10 chiều |
| T55 | 16 | 22/10 sáng | 23/10 chiều |
| T56 | 24 | 24/10 sáng | 26/10 chiều |

### Tùng

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T09 | 16 | 14/10 sáng | 15/10 chiều |
| T18 | 24 | 17/10 sáng | 19/10 chiều |
| T22 | 16 | 20/10 sáng | 21/10 chiều |
| T53 | 16 | 22/10 sáng | 23/10 chiều |
| T34 | 16 | 24/10 sáng | 25/10 chiều |
| T63 | 12 | 26/10 sáng | 27/10 sáng |
| T66 | 16 | 31/10 sáng | 01/11 chiều |

### Cường

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T06 | 24 | 11/10 sáng | 13/10 chiều |
| T35 | 24 | 17/10 sáng | 19/10 chiều |
| T23 | 8 | 20/10 sáng | 20/10 chiều |
| T32 | 12 | 21/10 sáng | 22/10 sáng |
| T41 | 12 | 22/10 chiều | 23/10 chiều |
| T54 | 12 | 24/10 sáng | 25/10 sáng |
| T31 | 24 | 25/10 chiều | 28/10 sáng |

### Nhạn

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T11 | 16 | 11/10 sáng | 12/10 chiều |
| T19 | 24 | 14/10 sáng | 16/10 chiều |
| T17 | 8 | 17/10 sáng | 17/10 chiều |
| T21 | 16 | 20/10 sáng | 21/10 chiều |
| T26 | 8 | 22/10 sáng | 22/10 chiều |
| T48 | 8 | 23/10 sáng | 23/10 chiều |
| T57 | 8 | 24/10 sáng | 24/10 chiều |
| T42 | 12 | 25/10 sáng | 26/10 sáng |
| T38 | 16 | 26/10 chiều | 28/10 sáng |
| T58 | 20 | 28/10 chiều | 30/10 chiều |
| T67 | 8 | 31/10 sáng | 31/10 chiều |
| T49 | 8 | 01/11 sáng | 01/11 chiều |
| T69 | 8 | 02/11 sáng | 02/11 chiều |

### Kỳ

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T03 | 16 | 11/10 sáng | 12/10 chiều |
| T08 | 12 | 14/10 sáng | 15/10 sáng |
| T15 | 8 | 16/10 sáng | 16/10 chiều |
| T44 | 12 | 20/10 sáng | 21/10 sáng |
| T25 | 20 | 21/10 chiều | 23/10 chiều |
| T36 | 8 | 24/10 sáng | 24/10 chiều |
| T46 | 8 | 25/10 sáng | 25/10 chiều |
| T61 | 16 | 26/10 sáng | 27/10 chiều |
| T65 | 8 | 28/10 sáng | 28/10 chiều |
| T40 | 16 | 29/10 sáng | 30/10 chiều |
| T62 | 4 | 31/10 sáng | 31/10 sáng |
| T45 | 8 | 31/10 chiều | 01/11 sáng |
| T64 | 8 | 01/11 chiều | 02/11 sáng |

### Thư

| Task | Giờ | Bắt đầu | Kết thúc |
|---|---|---|---|
| T02 | 20 | 10/10 sáng | 12/10 sáng |
| T16 | 4 | 13/10 sáng | 13/10 sáng |
| T13 | 8 | 15/10 chiều | 16/10 sáng |
| T29 | 8 | 23/10 sáng | 23/10 chiều |
| T27 | 4 | 24/10 sáng | 24/10 sáng |
| T28 | 8 | 24/10 chiều | 25/10 sáng |
| T39 | 4 | 25/10 chiều | 25/10 chiều |
| T50 | 4 | 26/10 sáng | 26/10 sáng |
| T47 | 8 | 26/10 chiều | 27/10 sáng |
| T30 | 8 | 27/10 chiều | 28/10 sáng |
| T43 | 8 | 28/10 chiều | 29/10 sáng |
| T68 | 8 | 29/10 chiều | 30/10 sáng |
| T60 | 4 | 30/10 chiều | 30/10 chiều |
| T51 | 24 | 31/10 sáng | 02/11 chiều |
| T71 | 4 | 03/11 chiều | 03/11 chiều |

| Ngày | Sáng | Chiều |
|---|---|---|
| 10/10 | 2 | 2 |
| 11/10 | 6 | 6 |
| 12/10 | 6 | 5 |
| 13/10 | 4 | 3 |
| 14/10 | 5 | 5 |
| 15/10 | 5 | 5 |
| 16/10 | 4 | 3 |
| 17/10 | 4 | 4 |
| 18/10 | 3 | 3 |
| 19/10 | 3 | 3 |
| 20/10 | 6 | 6 |
| 21/10 | 6 | 6 |
| 22/10 | 6 | 6 |
| 23/10 | 7 | 7 |
| 24/10 | 7 | 7 |
| 25/10 | 7 | 7 |
| 26/10 | 7 | 7 |
| 27/10 | 6 | 5 |
| 28/10 | 5 | 4 |
| 29/10 | 4 | 4 |
| 30/10 | 3 | 3 |
| 31/10 | 4 | 4 |
| 01/11 | 4 | 4 |
| 02/11 | 3 | 2 |
| 03/11 | 1 | 1 |
| 04/11 | 0 | 0 |


## 7. Mô tả từng Task

### EP-00 · Nền tảng kỹ thuật và chất lượng

#### T01 · Dựng monorepo, CI, nhật ký và /health

**Mục tiêu:** Dựng monorepo, CI, nhật ký và /health — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành.
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Tạo pnpm workspace: {{apps/web}} (React + Vite + TS), {{apps/server}} (NestJS), {{packages/shared}}, {{packages/xiangqi-core}}, {{packages/engine}}
- Cấu hình ESLint, Prettier, TypeScript strict, Vitest; GitHub Actions chạy lint + typecheck + test cho mọi PR vào {{develop}}; bật bảo vệ nhánh
- Server: logger JSON (thời gian, mức, mã sự kiện, lọc mật khẩu/OTP/token/chat), endpoint {{/health}}; {{.env.example}} đủ biến (gồm {{LIVEKIT_URL}}, {{LIVEKIT_API_KEY}}, {{LIVEKIT_API_SECRET}} để chuyển giữa LiveKit tự chạy và LiveKit Cloud)
**Đầu ra:** Repo chạy được bằng {{pnpm dev}}, CI xanh trên PR mẫu, README mục "Chạy dự án".
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.1.1, AC-00.1.2, AC-00.1.3. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 8 giờ · 2 Story Points · 10/10 sáng → 10/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T02 · Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ

**Mục tiêu:** Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm.
**Đầu vào (phải xong trước):** Không có.
**Việc cần làm:**
- Viết kế hoạch kiểm thử, mẫu TC có bước/dữ liệu/kết quả mong đợi và biến thể cho AC nhiều nhánh; xác định môi trường, mức lỗi, nơi ghi bằng chứng.
- Viết TC cho phần nền tảng; chuẩn bị bộ thế luật và bộ chiếu hết 1–2 nước có đáp án xác minh độc lập, tập 50 thế giữa ván. Phần chuẩn bị dữ liệu 4 giờ chuyển từ T59, không giao người viết engine tự làm đáp án.
- Từng QA Task viết tiếp TC cho AC được giao; chưa coi 268 AC là 268 TC đã thực thi.
**Đầu ra:** Kế hoạch kiểm thử, mẫu TC, TC nền tảng và bộ dữ liệu luật/chiếu hết có nguồn đáp án.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.4.1. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 20 giờ · 5 Story Points · 10/10 sáng → 12/10 sáng · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái

**Mục tiêu:** Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái — phục vụ US-00.1 Khung dự án, CI và nhật ký vận hành.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- Áp design token Kỳ Đài Cổ Phong (DESIGN.md) thành biến CSS; layout chung, router các trang P1, trang Sảnh khung (nút Tạo phòng, Vào phòng bằng mã, Đánh với máy)
- Thành phần dùng chung: Button, Input, Modal, Toast, Tooltip, Skeleton, EmptyState, ErrorState với đủ 5 trạng thái
- Thanh điều hướng {{PANEL-NAVBAR}} khung (mục chưa làm hiện "Sắp ra mắt")
**Đầu ra:** Bộ thành phần giao diện và khung trang để các Task FE sau dùng lại.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 16 giờ · 3 Story Points · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T06 · Spike media LAN/Cloud/HTTPS và thử mô hình phiên

**Mục tiêu:** Spike media LAN/Cloud/HTTPS và thử mô hình phiên — phục vụ US-00.4 Kế hoạch kiểm thử và kiểm chứng sớm.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- Dành 16 giờ cho LiveKit Docker và Cloud: hai người phát, năm người chỉ nhận; thử thu hồi quyền, đổi môi trường bằng biến, HTTPS trên nhiều máy LAN; ghi CPU/RAM, thời gian thu hồi, hạn mức.
- Dành 8 giờ kiểm mô hình hạn phiên cố định, Khách và thu hồi phiên trên hai trình duyệt bằng dữ liệu thử. Ghi khả năng/giới hạn để T12/T56 dùng; chưa coi là PASS ca xử thua ván thật.
- Bàn giao docker-compose, hướng dẫn HTTPS, mẫu cấu hình không chứa bí mật và báo cáo spike.
**Đầu ra:** docker-compose, hướng dẫn HTTPS/LAN/Cloud và báo cáo thử media/phiên.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 24 giờ · 5 Story Points · 11/10 sáng → 13/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T12 · Khung realtime Socket.IO

**Mục tiêu:** Khung realtime Socket.IO — phục vụ US-00.3 Khung realtime.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- Cổng Socket.IO trong NestJS: xác thực JWT Supabase (người dùng và Khách), room theo {{roomId}}
- Phong bì lệnh có {{commandId}} + phiên bản trạng thái; lưu biên lai chống trùng (migration bảng {{command_receipts}} trong Task này); gửi ảnh chụp trạng thái khi nối lại
- Tiếp quản tab: tab mới giành quyền, tab cũ chỉ đọc; *công bố hợp đồng sự kiện phòng/ván trong {{packages/shared}}*
- Bàn giao hợp đồng realtime cho phòng/ván, phiên, media và lỗi AI trong packages/shared. Thử tải socket sơ bộ 50 kết nối để phát hiện lỗi kiến trúc; số đo này không thay GATE-REALTIME đầy đủ T66.
**Đầu ra:** Khung realtime + tài liệu hợp đồng sự kiện để Story phòng và Story ván làm độc lập.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.3.1, AC-00.3.2, AC-00.3.3. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 24 giờ · 5 Story Points · 14/10 sáng → 16/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu

**Mục tiêu:** Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu — phục vụ US-00.2 Cơ sở dữ liệu và phân quyền P1.
**Đầu vào (phải xong trước):** T04.
**Việc cần làm:**
- Thiết kế các bảng P1 còn lại: {{friend_requests}}, {{friendships}}, {{rooms}}, {{room_members}}, {{room_blocks}}, {{matches}}, {{match_moves}} (bảng {{profiles}}, {{login_attempts}} do Task đăng ký/đăng nhập tạo; {{command_receipts}} do Task realtime tạo)
- Viết migration Supabase + RLS: client chỉ đọc dữ liệu được phép; ván/phòng/kết quả chỉ máy chủ ghi
- Chỉ mục duy nhất username theo chữ thường; script dữ liệu mẫu (tài khoản demo)
**Đầu ra:** Migration chạy lại được từ đầu, sơ đồ dữ liệu (ảnh/markdown) trong repo.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.2.1, AC-00.2.2, AC-00.2.3. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Đông · 16 giờ · 3 Story Points · 14/10 sáng → 15/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T51 · Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ

**Mục tiêu:** Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo.
**Đầu vào (phải xong trước):** T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65.
**Việc cần làm:**
- Chỉ bắt đầu sau khi mọi Task triển khai hoàn tất trên một bản tích hợp. Chạy các luồng D1–D10 đầy đủ và hồi quy các AC chức năng, đặc biệt những AC được hoãn từ kiểm cục bộ.
- Có thể chạy song song QA chuyên đề cuối trên các tài khoản/phòng thử riêng; không phụ thuộc các QA đó phải xong trước khi bắt đầu. T70 vẫn phải chờ tất cả QA và T66 đạt.
- Lưu kết quả theo từng AC/biến thể TC, ghi lỗi và kiểm lại; bằng chứng NFR/đóng gói/demo cuối được bổ sung từ T66/T70/T71. Không gọi phần chưa đo là PASS.
**Đầu ra:** Báo cáo hồi quy chức năng/D1–D10 đầy đủ, bằng chứng các AC tích hợp được giao.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.1.4, AC-00.1.5, AC-00.1.6, AC-00.3.4, AC-00.3.5, AC-00.5.1, AC-01.1.6, AC-01.2.1, AC-01.3.12, AC-01.3.13, AC-02.1.9, AC-02.1.12, AC-02.2.9, AC-02.2.11, AC-05.1.10, AC-07.1.4, AC-07.2.6. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 24 giờ · 5 Story Points · 31/10 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T66 · Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật

**Mục tiêu:** Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo.
**Đầu vào (phải xong trước):** T08, T26, T36, T38, T40, T42, T44, T46, T52, T58, T59, T61, T65.
**Việc cần làm:**
- Chạy 50 client/10 ván trên bản tích hợp; ghi p95 độ trễ, lỗi, CPU/RAM. Media ~3 phòng chỉ ghi số đo theo BA, không tự thêm ngưỡng đạt.
- Kiểm đủ 12 NFR và 9 gate với ngày đo, cấu hình máy, bộ dữ liệu, số lượt, người đo và đường dẫn bằng chứng; bổ sung thiếu sót từ báo cáo T04/T06/T09/T12/T24/T35/T56/T59.
- Bất kỳ tiêu chí bắt buộc chưa đạt giữ FAIL/BLOCKED và chặn T70; việc hoàn tất báo cáo không biến số đo thất bại thành PASS.
**Đầu ra:** Báo cáo 12 NFR/9 gate kèm số đo thật và trạng thái PASS/FAIL/BLOCKED.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.5.3, AC-00.5.4, AC-05.1.1, AC-08.2.3. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 31/10 sáng → 01/11 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T70 · Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo

**Mục tiêu:** Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo.
**Đầu vào (phải xong trước):** T51, T66, T13, T16, T17, T27, T28, T29, T30, T39, T43, T45, T47, T48, T49, T50, T60, T62, T64, T67, T68, T69.
**Việc cần làm:**
- Chỉ bắt đầu khi T51, T66 và toàn bộ QA chuyên đề đã hoàn tất và các tiêu chí bắt buộc PASS; không còn lỗi Nghiêm trọng/Cao.
- Đóng gói local: web/server, Docker LiveKit, HTTPS LAN; tài khoản/phòng mẫu, cấu hình Render + LiveKit Cloud dự phòng; không chứa bí mật.
- Người không tham gia đóng gói làm theo README chạy được trong 15 phút. Nếu cổng chưa đạt, giữ BLOCKED và dùng 04/11 sửa/kiểm lại; không tự phát hành.
**Đầu ra:** Bản v1.0 qua mọi cổng, hồ sơ nghiệm thu, hướng dẫn khởi chạy và phương án demo dự phòng.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.4.2, AC-00.4.3, AC-00.5.5, AC-00.5.6. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 4 giờ · 1 Story Points · 03/11 sáng → 03/11 sáng · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T71 · Tổng duyệt D1–D10 trên bản phát hành và ghi hình

**Mục tiêu:** Tổng duyệt D1–D10 trên bản phát hành và ghi hình — phục vụ US-00.5 Nghiệm thu tổng, NFR và đóng gói demo.
**Đầu vào (phải xong trước):** T70.
**Việc cần làm:**
- Chạy đủ D1–D10 trên máy demo thật, bản đã qua T70; ghi hình và báo cáo 10/10 kịch bản.
- Nếu lỗi, ghi vào Task sở hữu và dùng ngày 04/11 để sửa/kiểm lại. Không đổi FAIL/BLOCKED thành PASS để giữ lịch.
**Đầu ra:** Video tổng duyệt và kết quả D1–D10 trên bản phát hành.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-00.5.2. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 03/11 chiều → 03/11 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-01 · Đăng ký và đăng nhập

#### T04 · BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm

**Mục tiêu:** BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- API đăng ký 3 bước; kiểm username duy nhất không phân biệt hoa thường và từ cấm ngay bước nhập, email trùng, mật khẩu; tạo bộ lọc dùng chung cho onboarding/tên phòng/tên Khách/chat.
- Cấu hình SMTP ngoài; OTP 6 số/3 phút, gửi lại sau 60 giây; đo email ngoài nhóm và 5 thư/giờ. GATE-EMAIL gọi API trực tiếp; chặn UI đơn thuần không đạt.
- Migration profiles; kiểm trùng lại bước cuối; tự đăng nhập. Tuần tự hoá hoàn tất/phục hồi/dọn: hồ sơ đã hoàn tất không bị xoá nhầm do còn PENDING; bản chưa hoàn tất dọn khoảng 60–65 phút.
- Dùng 8 giờ bổ sung thử cấu hình Google không tự gộp email và phiên ẩn danh trên tài khoản thử; ghi giới hạn/phương án vào báo cáo. Đây là thử nền tảng, GATE-GOOGLE/GUEST đầy đủ vẫn nghiệm thu T35/T48.
**Đầu ra:** API đăng ký, migration profiles, SMTP thật, báo cáo SMTP/EMAIL và thử cấu hình Google/Khách.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Đông · 24 giờ · 5 Story Points · 11/10 sáng → 13/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T08 · FE màn Đăng ký 3 bước

**Mục tiêu:** FE màn Đăng ký 3 bước — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email.
**Đầu vào (phải xong trước):** T03, T04.
**Việc cần làm:**
- Màn {{SCR-REGISTER}} 3 bước: username/mật khẩu → email → 6 ô OTP có đếm 3 phút và nút Gửi lại (đếm 60 giây)
- Hiển thị lỗi tại ô, đủ 5 trạng thái; chuyển vào Sảnh hoặc phòng mời đang chờ sau khi xong
**Đầu ra:** Màn Đăng ký hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 12 giờ · 3 Story Points · 14/10 sáng → 15/10 sáng · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập

**Mục tiêu:** BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai.
**Đầu vào (phải xong trước):** T04.
**Việc cần làm:**
- API đăng nhập bằng username (tra email phía máy chủ, không trả về client), không phân biệt hoa thường, câu báo lỗi chung
- Migration bảng {{login_attempts}}; bộ đếm thử sai theo username chuẩn hoá (kể cả username không tồn tại): 5 lần/15 phút → chặn 15 phút; đăng nhập mật khẩu đúng thì đặt lại, đăng nhập Google *không* đặt lại (BA 0.15)
- Ghi nhớ đăng nhập: 30 ngày hoặc phiên trình duyệt/12 giờ; GATE-AUTH-USERNAME
**Đầu ra:** API đăng nhập + bảng {{login_attempts}} + báo cáo GATE-AUTH-USERNAME.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 14/10 sáng → 15/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T13 · Kiểm thử US-01.1

**Mục tiêu:** Kiểm thử US-01.1 — phục vụ US-01.1 Đăng ký bằng Username + Mật khẩu + OTP email.
**Đầu vào (phải xong trước):** T08.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-01.1.1, AC-01.1.2, AC-01.1.3, AC-01.1.4, AC-01.1.5, AC-01.1.7, AC-01.1.8, AC-01.1.9, AC-01.1.10, AC-01.1.11, AC-01.1.12, AC-01.1.13. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 15/10 chiều → 16/10 sáng · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T15 · FE màn Đăng nhập

**Mục tiêu:** FE màn Đăng nhập — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai.
**Đầu vào (phải xong trước):** T03, T09.
**Việc cần làm:**
- Màn {{SCR-LOGIN}}: username, mật khẩu, Ghi nhớ đăng nhập (mặc định tick), nút Google và Guest hiển thị (hoạt động ở US-01.3), "Quên mật khẩu?" {{DISABLED}}
- Hiện thông báo khoá thử sai; đã đăng nhập vào {{/login}} thì về Sảnh
**Đầu ra:** Màn Đăng nhập hoạt động với API thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 16/10 sáng → 16/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T17 · Kiểm thử US-01.2

**Mục tiêu:** Kiểm thử US-01.2 — phục vụ US-01.2 Đăng nhập bằng Username + Mật khẩu và khoá thử sai.
**Đầu vào (phải xong trước):** T15.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-01.2.2, AC-01.2.3, AC-01.2.4, AC-01.2.5, AC-01.2.6, AC-01.2.7, AC-01.2.8. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 17/10 sáng → 17/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách

**Mục tiêu:** BE đăng ký/đăng nhập Google, onboarding, phiên Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách.
**Đầu vào (phải xong trước):** T09, T14.
**Việc cần làm:**
- Google OAuth trên Supabase: email chưa có → onboarding đặt username + mật khẩu; email đã có → báo trùng, không tự liên kết (GATE-GOOGLE); dọn bản tạm 60 phút
- Phiên Khách (đăng nhập ẩn danh, GATE-GUEST): tên tạm qua bộ lọc, nhãn "(Khách)", hạn 12 giờ (không hết khi đang ngồi ghế), xoá dữ liệu khi hết hạn; khoá thử sai không áp cho Google
- Dùng bộ lọc chung T04 để từ chối username chứa từ cấm tại onboarding; GATE-GOOGLE/GUEST chạy thật, không coi spike cấu hình là nghiệm thu tính năng.
**Đầu ra:** API Google + Khách + báo cáo GATE-GOOGLE, GATE-GUEST.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 24 giờ · 5 Story Points · 17/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách

**Mục tiêu:** FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách.
**Đầu vào (phải xong trước):** T15, T35.
**Việc cần làm:**
- Nút Google ở Đăng nhập/Đăng ký, màn {{SCR-ONBOARDING}} (không có nút X)
- Nút Guest + {{MODAL-GUEST-NAME}}, nhãn "(Khách)", vào phòng từ link mời bằng Khách
**Đầu ra:** Luồng Google và Khách hoạt động trên giao diện.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 12 giờ · 3 Story Points · 20/10 sáng → 21/10 sáng · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T48 · Kiểm thử US-01.3

**Mục tiêu:** Kiểm thử US-01.3 — phục vụ US-01.3 Đăng ký/đăng nhập bằng Google và chế độ Khách.
**Đầu vào (phải xong trước):** T44, T37, T26.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-01.2.9, AC-01.3.1, AC-01.3.2, AC-01.3.3, AC-01.3.4, AC-01.3.5, AC-01.3.6, AC-01.3.7, AC-01.3.8, AC-01.3.9, AC-01.3.10, AC-01.3.11, AC-01.3.14, AC-01.3.15. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 23/10 sáng → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất

**Mục tiêu:** BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất.
**Đầu vào (phải xong trước):** T18, T20, T35.
**Việc cần làm:**
- Hạn phiên cố định (không gia hạn khi làm mới token), hết hạn trong ván: ân hạn 60 giây / ván AI 30 phút
- Một vị trí chơi: chặn ngồi ghế/ván thứ hai; đăng nhập thiết bị khác khi đang ván → xử thua, đăng xuất thiết bị cũ (GATE-SESSION)
- Đăng xuất chủ động: đang ván → đầu hàng có xác nhận; ở phòng chờ → rời phòng; banner ván dở
- Giới hạn của Khách: không xuất hiện trong tìm kiếm bạn bè, không nhận lời mời bạn bè
- API cập nhật Display Name 2–30 ký tự qua bộ lọc, email chỉ đọc; hồ sơ Khách chỉ Đăng xuất. Phối hợp T65 và kiểm API trực tiếp.
**Đầu ra:** Quản lý phiên phía máy chủ + test tích hợp + báo cáo GATE-SESSION.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Đông · 24 giờ · 5 Story Points · 24/10 sáng → 26/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở

**Mục tiêu:** FE Cài đặt hồ sơ, Đăng xuất, banner ván dở — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất.
**Đầu vào (phải xong trước):** T56, T63.
**Việc cần làm:**
- {{SCR-PROFILE-SETTINGS}}: Display Name (2–30, lọc từ cấm), email chỉ đọc, avatar chữ cái, Đăng xuất có xác nhận
- Banner "Bạn có ván đang chơi dở — Quay lại", tooltip nút bị khoá do đang ở ván khác
- Với Khách: mục Bạn bè {{DISABLED}}, tab mời bạn bè ẩn, Cài đặt chỉ có Đăng xuất
**Đầu ra:** Giao diện hồ sơ và phiên.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 28/10 sáng → 28/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T69 · Kiểm thử US-01.4

**Mục tiêu:** Kiểm thử US-01.4 — phục vụ US-01.4 Phiên đăng nhập, hồ sơ và Đăng xuất.
**Đầu vào (phải xong trước):** T65, T52, T23, T38, T61, T32, T37, T44, T40, T26.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-01.4.1, AC-01.4.2, AC-01.4.3, AC-01.4.4, AC-01.4.5, AC-01.4.6, AC-01.4.7, AC-01.4.8, AC-01.4.9, AC-01.4.10, AC-01.4.11, AC-01.4.12, AC-01.4.13, AC-01.4.14, AC-01.4.15, AC-01.4.16, AC-01.4.17. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 02/11 sáng → 02/11 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-02 · Tạo phòng

#### T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host

**Mục tiêu:** BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván.
**Đầu vào (phải xong trước):** T12, T14.
**Việc cần làm:**
- API tạo phòng (tên, mức giờ 5/10/15, số người xem 0–5), mã 8 ký tự, link mời; Host ngồi Đỏ; phòng mặc định CODE_ONLY
- Ghế, Đổi ghế tự do khi một người ngồi ghế, Sẵn sàng, đếm 3-2-1 (huỷ khi mất kết nối), phát sự kiện bắt đầu ván theo hợp đồng
- Chuyển Host, đóng phòng khi không còn người ngồi ghế, giới hạn 1 phòng cho Khách
**Đầu ra:** Dịch vụ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 24 giờ · 5 Story Points · 17/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược

**Mục tiêu:** FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván.
**Đầu vào (phải xong trước):** T03, T18.
**Việc cần làm:**
- {{MODAL-CREATE-ROOM}} (kiểm tra trường), trang phòng chờ: hai ghế, Đổi ghế (khi một người), Sẵn sàng, đếm 3-2-1 có âm thanh
- Hiển thị Host, trạng thái realtime, đủ 5 trạng thái
**Đầu ra:** Màn Tạo phòng và phòng chờ nối với API thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 20/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T28 · Kiểm thử US-02.1

**Mục tiêu:** Kiểm thử US-02.1 — phục vụ US-02.1 Tạo phòng, ghế và bắt đầu ván.
**Đầu vào (phải xong trước):** T26, T37, T25.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-02.1.1, AC-02.1.2, AC-02.1.3, AC-02.1.4, AC-02.1.5, AC-02.1.6, AC-02.1.7, AC-02.1.8, AC-02.1.10, AC-02.1.11, AC-02.1.13. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 24/10 chiều → 25/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T41 · BE Xin đổi bên và phòng về chờ sau ván

**Mục tiêu:** BE Xin đổi bên và phòng về chờ sau ván — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván.
**Đầu vào (phải xong trước):** T20, T37.
**Việc cần làm:**
- Xin đổi bên khi phòng chờ có đủ 2 người: 30 giây, đồng ý → hoán đổi + reset Sẵn sàng, từ chối → chờ 60 giây, 1 đề nghị chờ, tự huỷ khi đếm hoặc đổi ghế
- Sau ván: phòng về WAITING ngay, giữ ghế/người xem/chế độ/mức giờ, không hạn đóng 10 phút
**Đầu ra:** API đổi bên và vòng đời sau ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 12 giờ · 3 Story Points · 22/10 chiều → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng

**Mục tiêu:** FE hộp Xin đổi bên, Ở lại phòng / Rời phòng — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván.
**Đầu vào (phải xong trước):** T25, T41.
**Việc cần làm:**
- Nút Xin đổi bên, {{MODAL-SIDE-SWAP-PROMPT}}, trạng thái chờ + Rút đề nghị, nút Đổi ghế ẩn khi đủ 2 người
- Hộp kết quả: Ở lại phòng / Rời phòng
**Đầu ra:** Giao diện đổi bên và sau ván.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 25/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T50 · Kiểm thử US-02.2

**Mục tiêu:** Kiểm thử US-02.2 — phục vụ US-02.2 Xin đổi bên và ở lại phòng sau ván.
**Đầu vào (phải xong trước):** T46.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-02.2.1, AC-02.2.2, AC-02.2.3, AC-02.2.4, AC-02.2.5, AC-02.2.6, AC-02.2.7, AC-02.2.8, AC-02.2.10, AC-02.2.12, AC-02.2.13, AC-02.2.14. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 26/10 sáng → 26/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-03 · Mời vào phòng

#### T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập

**Mục tiêu:** BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng.
**Đầu vào (phải xong trước):** T18, T09.
**Việc cần làm:**
- API vào phòng bằng mã/link: xếp ghế trống, hết ghế làm người xem nếu còn chỗ, đầy thì từ chối
- Lưu đích chuyển hướng khi chưa đăng nhập để tự vào phòng sau đăng nhập/đăng ký
**Đầu ra:** API vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 20/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập

**Mục tiêu:** FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập — phục vụ US-03.1 Mời bằng link/mã và vào phòng.
**Đầu vào (phải xong trước):** T21, T22.
**Việc cần làm:**
- {{MODAL-INVITE}} phần link + mã (Sao chép), ô nhập mã ở Sảnh, tự chuyển vào phòng sau đăng nhập
- {{SCR-ACCESS-DENIED}} cho phòng đầy/mã sai
**Đầu ra:** Luồng mời bằng link/mã chạy với API thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 22/10 sáng → 22/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T29 · Kiểm thử US-03.1

**Mục tiêu:** Kiểm thử US-03.1 — phục vụ US-03.1 Mời bằng link/mã và vào phòng.
**Đầu vào (phải xong trước):** T26, T35, T08, T15.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-03.1.1, AC-03.1.2, AC-03.1.3, AC-03.1.4, AC-03.1.5, AC-03.1.6, AC-03.1.7. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 23/10 sáng → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng

**Mục tiêu:** BE bạn bè, trạng thái online, mời bạn online vào phòng — phục vụ US-03.2 Bạn bè và mời bạn online.
**Đầu vào (phải xong trước):** T22, T35.
**Việc cần làm:**
- Tìm theo tiền tố username, lời mời kết bạn (gửi, nhận, thu hồi, hết hạn 30 ngày, giới hạn 200/50, bị từ chối 2 lần), huỷ kết bạn; Khách bị loại
- Trạng thái Online/Đang đấu/Offline realtime, chuông lời mời
- Mời bạn online vào phòng: pop-up 30 giây, Tham gia dùng API vào phòng, thu hồi khi phòng khoá
**Đầu ra:** API bạn bè, trạng thái, lời mời vào phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 24 giờ · 5 Story Points · 25/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời

**Mục tiêu:** FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời — phục vụ US-03.2 Bạn bè và mời bạn online.
**Đầu vào (phải xong trước):** T31.
**Việc cần làm:**
- {{SCR-FRIENDS}} (tìm kiếm, hai tab, Nhắn tin/Thách đấu {{DISABLED}}), chuông ở thanh điều hướng
- Tab mời bạn bè trong {{MODAL-INVITE}} theo trạng thái, pop-up lời mời phía người nhận; ẩn với Khách
**Đầu ra:** Giao diện bạn bè và mời online.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 16 giờ · 3 Story Points · 29/10 sáng → 30/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T49 · Kiểm thử US-03.2

**Mục tiêu:** Kiểm thử US-03.2 — phục vụ US-03.2 Bạn bè và mời bạn online.
**Đầu vào (phải xong trước):** T40, T53, T56, T34.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-03.2.1, AC-03.2.2, AC-03.2.3, AC-03.2.4, AC-03.2.5, AC-03.2.6, AC-03.2.7, AC-03.2.8, AC-03.2.9, AC-03.2.10, AC-03.2.11, AC-03.2.12, AC-03.2.13, AC-03.2.14, AC-03.2.15, AC-03.2.16, AC-03.2.17, AC-03.2.18, AC-03.2.19, AC-03.2.20, AC-03.2.21. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 01/11 sáng → 01/11 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-04 · Khởi tạo bàn cờ

#### T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân

**Mục tiêu:** Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân — phục vụ US-04.1 Lõi luật cờ dùng chung.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- Biểu diễn bàn cờ 9×10 và thế cờ; tuần tự hoá/đọc lại thế cờ (chuỗi kiểu FEN nội bộ)
- Sinh nước đi và ăn quân cho từng loại quân: Tướng và Sĩ (trong cung), Tượng (đi chéo 2 ô, bị chặn mắt, không qua sông), Xe (đi thẳng), Mã (bị cản chân), Pháo (đi như Xe, *ăn phải nhảy qua đúng một ngòi*), Tốt (chưa qua sông chỉ tiến, qua sông được đi ngang, không lùi)
- Unit test riêng cho từng loại quân, mỗi loại ít nhất một thế bị chặn và một thế ăn quân
**Đầu ra:** Hàm sinh nước giả hợp lệ (chưa xét tự chiếu) cho 7 loại quân trong {{packages/xiangqi-core}}.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 8 giờ · 2 Story Points · 11/10 sáng → 11/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước

**Mục tiêu:** Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước — phục vụ US-04.1 Lõi luật cờ dùng chung.
**Đầu vào (phải xong trước):** T05.
**Việc cần làm:**
- Lọc nước giả hợp lệ: loại nước làm hai Tướng đối mặt không có quân chắn và nước để Tướng mình bị chiếu
- Hàm kiểm tra đang bị chiếu; xác định chiếu hết ({{CHECKMATE}}) và hết nước không bị chiếu ({{STALEMATE}} — bên hết nước thua)
- API công khai {{legalMoves(position)}}, {{isCheck(position)}}, {{applyMove(position, move)}} để giao diện, máy chủ và máy cờ dùng chung
**Đầu ra:** Bộ sinh nước hợp lệ hoàn chỉnh và nhận biết chiếu/chiếu hết/hết nước.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 8 giờ · 2 Story Points · 12/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử

**Mục tiêu:** Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử — phục vụ US-04.1 Lõi luật cờ dùng chung.
**Đầu vào (phải xong trước):** T07.
**Việc cần làm:**
- Lịch sử thế cờ trên nhánh nước hiệu lực (thế giống nhau = cùng vị trí mọi quân *và* cùng bên tới lượt; chu kỳ = các nước từ lần xuất hiện thứ 1 đến lần thứ 3 — BA 0.12): lặp 3 lần → hoà, chiếu liên tục → bên chiếu thua (cả hai cùng chiếu → hoà), 120 nửa nước không ăn quân → hoà, chiếu hết được ưu tiên hơn mọi kết quả hoà
- Perft độ sâu 2 và 3 từ thế khai cuộc, đối chiếu số đã công bố
- Viết tài liệu ngắn cho API; đo độ phủ unit test của cả gói
- Bổ sung ca BA 0.17: chiếu hết ưu tiên cao nhất; STALEMATE/PERPETUAL_CHECK trước DRAW_NO_CAPTURE. Xác minh chuẩn perft và lưu nguồn đáp án trước khi dùng.
**Đầu ra:** Gói {{packages/xiangqi-core}} hoàn chỉnh, có tài liệu và độ phủ ≥ 90%.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-04.1.1, AC-04.1.2, AC-04.1.3, AC-04.1.4, AC-04.1.5, AC-04.1.6, AC-04.1.7, AC-04.1.8, AC-04.1.9, AC-04.1.10, AC-04.1.11. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 8 giờ · 2 Story Points · 13/10 sáng → 13/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng

**Mục tiêu:** FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ.
**Đầu vào (phải xong trước):** T01.
**Việc cần làm:**
- Vẽ bàn cờ SVG 9×10, sông, cung; 32 quân chữ Hán theo DESIGN.md §7; lật bàn khi cầm Đen
- Co giãn từ 360 px, quân đủ lớn để chạm; nhãn trợ năng cho quân và lượt đi
**Đầu ra:** Component {{<Board>}} hiển thị từ một thế cờ cho trước.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 11/10 sáng → 12/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T16 · Kiểm thử US-04.2

**Mục tiêu:** Kiểm thử US-04.2 — phục vụ US-04.2 Khởi tạo và hiển thị bàn cờ.
**Đầu vào (phải xong trước):** T11.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-04.2.1, AC-04.2.2, AC-04.2.3, AC-04.2.4. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 13/10 sáng → 13/10 sáng · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh

**Mục tiêu:** FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh.
**Đầu vào (phải xong trước):** T10, T11.
**Việc cần làm:**
- Chọn quân bằng click/chạm, kéo thả chuột và cảm ứng, trượt về khi thả sai; chấm ô hợp lệ, vòng quân ăn được (lấy từ {{xiangqi-core}})
- Đánh dấu nước vừa đi (4 góc), cảnh báo chiếu không nhấp nháy, tôn trọng giảm chuyển động
- 4 âm thanh Web Audio API + nút tắt tiếng giữ trong phiên
**Đầu ra:** Bàn cờ chơi được hai bên trên một máy (chế độ thử).
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 24 giờ · 5 Story Points · 14/10 sáng → 16/10 chiều · XIAN Sprint 1.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T27 · Kiểm thử US-04.3

**Mục tiêu:** Kiểm thử US-04.3 — phục vụ US-04.3 Đi cờ bằng click/kéo thả và âm thanh.
**Đầu vào (phải xong trước):** T25, T22.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-04.3.1, AC-04.3.2, AC-04.3.3, AC-04.3.4, AC-04.3.5, AC-04.3.6, AC-04.3.7, AC-04.3.8, AC-04.3.9, AC-04.3.10. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 24/10 sáng → 24/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-05 · Hai người đánh cờ online

#### T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván

**Mục tiêu:** BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván.
**Đầu vào (phải xong trước):** T10, T12, T14.
**Việc cần làm:**
- Dịch vụ ván: tạo ván từ sự kiện phòng (theo hợp đồng ở US-00.3), giữ trạng thái, nhận ý định đi cờ, phân xử bằng {{xiangqi-core}}
- Phát nước đi tới hai người chơi và người xem; tự kết thúc ván theo luật; lưu {{matches}}, {{match_moves}}
- Từ chối nước sai luật/không đúng lượt, đồng bộ lại client
**Đầu ra:** Dịch vụ ván online có API socket và test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 24 giờ · 5 Story Points · 17/10 sáng → 19/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T23 · BE đồng hồ thi đấu và hết giờ

**Mục tiêu:** BE đồng hồ thi đấu và hết giờ — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván.
**Đầu vào (phải xong trước):** T20.
**Việc cần làm:**
- Đồng hồ máy chủ theo mức giờ phòng, chỉ chạy bên tới lượt, không cộng giây; tính giờ trước khi xét nước
- Hết giờ → kết thúc {{TIMEOUT}}; gửi thời gian còn lại trong ảnh chụp
**Đầu ra:** Đồng hồ tích hợp trong dịch vụ ván.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 8 giờ · 2 Story Points · 20/10 sáng → 20/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T25 · FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại

**Mục tiêu:** FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván.
**Đầu vào (phải xong trước):** T19, T23.
**Việc cần làm:**
- Nối bàn cờ, đồng hồ máy chủ, nước đi, kết quả và lý do tiếng Việt với API/sự kiện đã có.
- Thêm lớp phủ nối lại và thông báo đối thủ mất kết nối theo hợp đồng T12 (4 giờ UI chuyển từ T52). Mô phỏng chỉ để xây UI; ca mất mạng thật nghiệm thu tại T60 sau T52.
- Kết quả phòng tự tạo có Ở lại phòng/Rời phòng, kể cả INTERRUPTED theo BA 0.17; người xem không có nút của người chơi.
**Đầu ra:** Giao diện phòng đấu và lớp phủ nối lại; nghiệm thu mất mạng thật ở T60.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 20 giờ · 5 Story Points · 21/10 chiều → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T30 · Kiểm thử US-05.1

**Mục tiêu:** Kiểm thử US-05.1 — phục vụ US-05.1 Ván online: đi cờ, đồng hồ và kết thúc ván.
**Đầu vào (phải xong trước):** T25, T26.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-05.1.2, AC-05.1.3, AC-05.1.4, AC-05.1.5, AC-05.1.6, AC-05.1.7, AC-05.1.8, AC-05.1.9, AC-05.1.11, AC-05.1.12, AC-05.1.13. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 27/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T32 · BE đầu hàng, rời phòng giữa ván, xin hoà

**Mục tiêu:** BE đầu hàng, rời phòng giữa ván, xin hoà — phục vụ US-05.2 Đầu hàng và xin hoà.
**Đầu vào (phải xong trước):** T20.
**Việc cần làm:**
- Đầu hàng ({{RESIGN}}), rời phòng giữa ván = đầu hàng, chuyển Host
- Xin hoà: đề nghị 30 giây, chấp nhận → {{DRAW_AGREEMENT}}, từ chối/hết hạn → chờ 5 nước, rút đề nghị, đóng khi ván kết thúc
**Đầu ra:** API đề nghị trong ván + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 12 giờ · 3 Story Points · 21/10 sáng → 22/10 sáng · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị

**Mục tiêu:** FE nút Đầu hàng, Xin hoà và khung đề nghị — phục vụ US-05.2 Đầu hàng và xin hoà.
**Đầu vào (phải xong trước):** T25, T32.
**Việc cần làm:**
- {{MODAL-CONFIRM-RESIGN}}, {{MODAL-CONFIRM-LEAVE}} (focus ở Huỷ)
- Khung Xin hoà không modal (thu gọn, mở lại, đếm 30 giây), nút {{DISABLED}} có tooltip số nước còn chờ
**Đầu ra:** Giao diện đầu hàng và xin hoà.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 24/10 sáng → 24/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T39 · Kiểm thử US-05.2

**Mục tiêu:** Kiểm thử US-05.2 — phục vụ US-05.2 Đầu hàng và xin hoà.
**Đầu vào (phải xong trước):** T36, T18.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-05.2.1, AC-05.2.2, AC-05.2.3, AC-05.2.4, AC-05.2.5, AC-05.2.6, AC-05.2.7, AC-05.2.8, AC-05.2.9. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 25/10 chiều → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T52 · BE mất kết nối, ân hạn, đồng bộ lại và server restart

**Mục tiêu:** BE mất kết nối, ân hạn, đồng bộ lại và server restart — phục vụ US-05.3 Mất kết nối và nối lại.
**Đầu vào (phải xong trước):** T56.
**Việc cần làm:**
- Ân hạn 60 giây người chơi, đồng hồ tiếp tục; ưu tiên TIMEOUT nếu hết giờ trước, DISCONNECT khi hết ân hạn; hai bên rớt mạng xử bên mất trước.
- Nối lại gửi snapshot đầy đủ và phối hợp quản lý phiên T56; giữ chỗ người xem theo BA. UI lớp phủ đã giao T25 theo contract T12.
- Server restart: ván online INTERRUPTED trung tính, phòng tự tạo WAITING/reset Sẵn sàng, Ở lại/Rời theo BA 0.17; không dùng lại FINISHED 10 phút cho phòng tự tạo.
**Đầu ra:** Backend nối lại/gián đoạn và snapshot, kết nối UI T25.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 12 giờ · 3 Story Points · 28/10 chiều → 29/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T60 · Kiểm thử US-05.3

**Mục tiêu:** Kiểm thử US-05.3 — phục vụ US-05.3 Mất kết nối và nối lại.
**Đầu vào (phải xong trước):** T52, T25.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-05.3.1, AC-05.3.2, AC-05.3.3, AC-05.3.4, AC-05.3.5, AC-05.3.6. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 4 giờ · 1 Story Points · 30/10 chiều → 30/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-06 · Chế độ phòng và người xem

#### T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã

**Mục tiêu:** BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED.
**Đầu vào (phải xong trước):** T22.
**Việc cần làm:**
- Chuyển PUBLIC / CODE_ONLY / LOCKED (chỉ Host); LOCKED chỉ bật khi đủ 2 người chơi và giữ khoá khi thiếu ghế
- Khoá: chặn người mới, vô hiệu link/mã/lời mời chưa dùng; mở lại sinh mã/link mới; người đang trong phòng giữ quyền nối lại
**Đầu ra:** API chế độ phòng + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 22/10 sáng → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem

**Mục tiêu:** BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem — phục vụ US-06.2 Sảnh và danh sách phòng công khai.
**Đầu vào (phải xong trước):** T53.
**Việc cần làm:**
- Danh sách phòng PUBLIC: cột theo BA 0.5, mới nhất trước, tối đa 50, đẩy cập nhật realtime khi phòng đổi trạng thái/số người/chế độ
- "Vào chơi" (ghế vừa hết → người xem nếu còn chỗ) và "Vào xem"; Khách được dùng
**Đầu ra:** API danh sách Sảnh + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Cường · 12 giờ · 3 Story Points · 24/10 sáng → 25/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn

**Mục tiêu:** BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn — phục vụ US-06.3 Người xem và đuổi người xem.
**Đầu vào (phải xong trước):** T22.
**Việc cần làm:**
- Vai trò người xem, sức chứa X/N, giữ chỗ 5 phút khi mất kết nối
- Chuyển ghế ↔ người xem, Host mời xuống ghế (chấp nhận/từ chối, không giữ ghế), không đổi chỗ khi đang ván
- Đuổi người xem (cả hai người chơi), chặn đến khi phòng đóng, phát sự kiện đuổi cho Task media
**Đầu ra:** API người xem + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Đông · 16 giờ · 3 Story Points · 22/10 sáng → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T57 · FE Cài đặt phòng

**Mục tiêu:** FE Cài đặt phòng — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED.
**Đầu vào (phải xong trước):** T53.
**Việc cần làm:**
- {{MODAL-ROOM-SETTINGS}} (chỉ Host), LOCKED {{DISABLED}} khi chưa đủ 2 người chơi, hiển thị mã/link mới sau khi mở lại
**Đầu ra:** Giao diện Cài đặt phòng.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 24/10 sáng → 24/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T58 · FE danh sách người xem, thao tác ghế và khung camera/mic

**Mục tiêu:** FE danh sách người xem, thao tác ghế và khung camera/mic — phục vụ US-06.3 Người xem và đuổi người xem.
**Đầu vào (phải xong trước):** T55, T33.
**Việc cần làm:**
- Danh sách người xem, ngồi ghế/xuống xem, mời xuống ghế, đuổi và thông báo quyền theo API T55.
- Nhận 8 giờ giao diện từ T33: PANEL-MEDIA dùng ở phòng chờ và phòng đấu, hai nút camera/mic độc lập, ba mức chia sẻ, lỗi quyền/thiết bị/dịch vụ và chế độ chỉ nhận của người xem.
- Không ngắt media khi bắt đầu ván; nối API/adapter T33 thật. Task thuộc US-06.3 và hỗ trợ AC US-07.2; T45 nghiệm thu media, T64 nghiệm thu người xem.
**Đầu ra:** PANEL-SPECTATORS và PANEL-MEDIA tích hợp thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 20 giờ · 5 Story Points · 28/10 chiều → 30/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng

**Mục tiêu:** FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng — phục vụ US-06.2 Sảnh và danh sách phòng công khai.
**Đầu vào (phải xong trước):** T54, T57.
**Việc cần làm:**
- Sảnh đầy đủ: bốn lựa chọn (hai lựa chọn P2 {{DISABLED}} "Sắp ra mắt"), mục Luật chơi mở rộng/thu gọn theo AC, danh sách phòng PUBLIC với nút Vào chơi/Vào xem, trạng thái EMPTY
- Hoàn thiện thanh điều hướng theo AC
**Đầu ra:** Màn Sảnh hoàn chỉnh.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 16 giờ · 3 Story Points · 26/10 sáng → 27/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T62 · Kiểm thử US-06.1

**Mục tiêu:** Kiểm thử US-06.1 — phục vụ US-06.1 Cài đặt phòng: PUBLIC / CODE_ONLY / LOCKED.
**Đầu vào (phải xong trước):** T57, T31, T33, T52, T55.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-06.1.1, AC-06.1.2, AC-06.1.3, AC-06.1.4, AC-06.1.5, AC-06.1.6, AC-06.1.7. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 4 giờ · 1 Story Points · 31/10 sáng → 31/10 sáng · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T64 · Kiểm thử US-06.3

**Mục tiêu:** Kiểm thử US-06.3 — phục vụ US-06.3 Người xem và đuổi người xem.
**Đầu vào (phải xong trước):** T58, T52, T31, T54.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-06.3.1, AC-06.3.2, AC-06.3.3, AC-06.3.4, AC-06.3.5, AC-06.3.6, AC-06.3.7, AC-06.3.8, AC-06.3.9, AC-06.3.10, AC-06.3.11, AC-06.3.12, AC-06.3.13, AC-06.3.14. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 01/11 chiều → 02/11 sáng · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T67 · Kiểm thử US-06.2

**Mục tiêu:** Kiểm thử US-06.2 — phục vụ US-06.2 Sảnh và danh sách phòng công khai.
**Đầu vào (phải xong trước):** T61, T55, T38, T26, T40, T44, T65.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-06.2.1, AC-06.2.2, AC-06.2.3, AC-06.2.4, AC-06.2.5, AC-06.2.6, AC-06.2.7, AC-06.2.8, AC-06.2.9, AC-06.2.10, AC-06.2.11, AC-06.2.12, AC-06.2.13, AC-06.2.14, AC-06.2.15, AC-06.2.16. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 8 giờ · 2 Story Points · 31/10 sáng → 31/10 chiều · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-07 · Chat, camera và mic

#### T33 · BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ

**Mục tiêu:** BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ — phục vụ US-07.2 Camera, mic và mức chia sẻ.
**Đầu vào (phải xong trước):** T06, T22, T35.
**Việc cần làm:**
- Tích hợp LiveKit, cấp token theo vai trò, bật/tắt và ba mức chia sẻ, camera/mic mặc định tắt; không ghi/lưu media.
- Thu hồi quyền khi đổi vai trò, bị đuổi hoặc tab khác tiếp quản; lỗi media không tác động ván/đồng hồ/chat. Hợp đồng từ T12 cho phép làm độc lập FE phòng đấu.
- Bàn giao API/adapter và kiểm thử quyền media; 8 giờ khung giao diện chuyển sang T58. Ca đầu-cuối có giao diện thật nghiệm thu T45.
**Đầu ra:** API/adapter media, quyền token và bằng chứng kiểm quyền; UI do T58 bàn giao.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 24 giờ · 5 Story Points · 25/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ

**Mục tiêu:** BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ — phục vụ US-07.1 Hai kênh chat và bộ lọc.
**Đầu vào (phải xong trước):** T18, T35.
**Việc cần làm:**
- Kênh Riêng (chỉ hai người chơi, mốc theo cặp) và Kênh Chung (người xem thấy từ lúc vào); hoạt động cả ở phòng chờ lẫn trong ván (BA 0.13); xoá chat khi phòng đóng
- Bộ lọc từ cấm (chuẩn hoá dấu, hoa/thường, ký tự chèn, {{0→o}}, {{1→i}}), tệp cấu hình danh sách; 200 ký tự, 5 tin/10 giây
**Đầu ra:** Dịch vụ chat + test.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Đông · 16 giờ · 3 Story Points · 20/10 sáng → 21/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T42 · FE khung chat hai kênh

**Mục tiêu:** FE khung chat hai kênh — phục vụ US-07.1 Hai kênh chat và bộ lọc.
**Đầu vào (phải xong trước):** T25, T37.
**Việc cần làm:**
- {{PANEL-CHAT}} dùng chung cho phòng chờ và phòng thi đấu: máy tính mặc định chỉ Kênh Riêng, mở thêm Kênh Chung; điện thoại dùng tab; người xem chỉ Kênh Chung; hiển thị văn bản thuần
**Đầu ra:** Khung chat hai kênh.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 12 giờ · 3 Story Points · 25/10 sáng → 26/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T45 · Kiểm thử US-07.2

**Mục tiêu:** Kiểm thử US-07.2 — phục vụ US-07.2 Camera, mic và mức chia sẻ.
**Đầu vào (phải xong trước):** T58, T21, T42.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-07.2.1, AC-07.2.2, AC-07.2.3, AC-07.2.4, AC-07.2.5, AC-07.2.7, AC-07.2.8, AC-07.2.9, AC-07.2.10, AC-07.2.11, AC-07.2.12, AC-07.2.13. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Kỳ · 8 giờ · 2 Story Points · 31/10 chiều → 01/11 sáng · XIAN Sprint 4.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T47 · Kiểm thử US-07.1

**Mục tiêu:** Kiểm thử US-07.1 — phục vụ US-07.1 Hai kênh chat và bộ lọc.
**Đầu vào (phải xong trước):** T42, T46, T21.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-07.1.1, AC-07.1.2, AC-07.1.3, AC-07.1.5, AC-07.1.6, AC-07.1.7, AC-07.1.8, AC-07.1.9, AC-07.1.10, AC-07.1.11, AC-07.1.12, AC-07.1.13, AC-07.1.14. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 26/10 chiều → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

### EP-08 · Đánh với máy theo cấp độ

#### T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng

**Mục tiêu:** Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng — phục vụ US-08.2 Máy cờ ba cấp độ.
**Đầu vào (phải xong trước):** T10.
**Việc cần làm:**
- Negamax + alpha-beta, tìm sâu dần, bảng chuyển vị đơn giản, sắp xếp nước; hàm lượng giá vật chất + vị trí
- Chạy ở tiến trình/worker riêng; ngân sách 300 / 1.000 / 3.000 ms theo cấp; luôn trả nước hợp lệ tốt nhất đã tìm được
- Đo lần đầu thời gian/độ sâu trên bộ dữ liệu T02 ngay S2; ghi baseline và báo PO nếu có nguy cơ không đạt. T59 tinh chỉnh, T68 kiểm độc lập; không đợi S4 mới thử engine.
**Đầu ra:** Gói {{packages/engine}} + tiến trình máy cờ gọi được từ server.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-08.2.1, AC-08.2.2. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 32 giờ · 8 Story Points · 20/10 sáng → 23/10 chiều · XIAN Sprint 2.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới

**Mục tiêu:** BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới — phục vụ US-08.1 Thiết lập và chơi ván với máy.
**Đầu vào (phải xong trước):** T20, T24.
**Việc cần làm:**
- API ván với máy: tạo ván {{/ai/:id}} theo cấp và phe (Ngẫu nhiên do máy chủ bốc), máy đi trước khi người cầm Đen
- Đầu hàng, kết thúc, Ván mới (giữ cấp/phe để điền sẵn), không đồng hồ, không xin hoà
**Đầu ra:** Dịch vụ ván với máy + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 16 giờ · 3 Story Points · 24/10 sáng → 25/10 chiều · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T38 · FE thiết lập/chơi AI và giao diện sự cố máy cờ

**Mục tiêu:** FE thiết lập/chơi AI và giao diện sự cố máy cờ — phục vụ US-08.1 Thiết lập và chơi ván với máy.
**Đầu vào (phải xong trước):** T19, T34.
**Việc cần làm:**
- Hộp chọn cấp/phe, màn chơi với máy, máy đi trước khi người cầm Đen, đầu hàng và Ván mới điền lại cấp/phe đã chọn.
- Thêm giao diện Máy cờ gặp sự cố/Thử lại và phân biệt cùng ván với tạo ván mới theo BA 6.1 (4 giờ UI chuyển từ T59). T68 kiểm hành vi lỗi/phục hồi thật sau T63.
- Kiểm trạng thái chờ/tắt thao tác khi máy nghĩ; không thêm Undo/Hint P2.
**Đầu ra:** Giao diện AI đầy đủ, gồm sự cố/Thử lại, kết nối backend thật.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Nhạn · 16 giờ · 3 Story Points · 26/10 chiều → 28/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T43 · Kiểm thử US-08.1

**Mục tiêu:** Kiểm thử US-08.1 — phục vụ US-08.1 Thiết lập và chơi ván với máy.
**Đầu vào (phải xong trước):** T38, T63.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-08.1.1, AC-08.1.2, AC-08.1.3, AC-08.1.4, AC-08.1.5, AC-08.1.6, AC-08.1.7. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 28/10 chiều → 29/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T59 · Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh

**Mục tiêu:** Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó.
**Đầu vào (phải xong trước):** T24, T02.
**Việc cần làm:**
- Tinh chỉnh lượng giá/cắt tỉa và đo p95 ngân sách 300/1.000/3.000 ms trên máy demo; độ sâu mục tiêu 2/4/6, hết ngân sách dùng nước tốt nhất đã tìm.
- Dùng bộ dữ liệu T02: cấp Khó giải 100% thế chiếu hết bắt buộc; đấu máy với máy 20 ván/cặp, báo tỷ lệ và điều kiện đo.
- Chỉ còn 12 giờ kỹ thuật engine: 4 giờ chuẩn bị đáp án chuyển T02, 4 giờ UI lỗi chuyển T38. Không giảm yêu cầu; không đạt thì BLOCKED, không tự hạ ngưỡng.
**Đầu ra:** Engine tinh chỉnh và báo cáo GATE-ENGINE trên bộ dữ liệu T02.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tình · 12 giờ · 3 Story Points · 24/10 sáng → 25/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại

**Mục tiêu:** BE giữ ván AI 30 phút, Thử lại, khởi động lại — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó.
**Đầu vào (phải xong trước):** T34, T35.
**Việc cần làm:**
- Giữ ván AI 30 phút khi mất kết nối, vào lại {{/ai/:id}}
- Máy cờ không trả lời quá 10 giây: Thử lại (cùng thế hoặc ván mới theo BA 6.1), chặn bấm trùng; khởi động lại máy chủ → thông báo không tiếp tục được; Rời ván/Đăng xuất = đầu hàng có xác nhận
**Đầu ra:** Xử lý ổn định ván AI + test tích hợp.
**Cách kiểm và điều kiện PASS:** Kiểm bàn giao kỹ thuật của Task; AC tính năng được xác nhận tại các Task trong bản đồ nghiệm thu. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Tùng · 12 giờ · 3 Story Points · 26/10 sáng → 27/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.

#### T68 · Kiểm thử US-08.3

**Mục tiêu:** Kiểm thử US-08.3 — phục vụ US-08.3 Ổn định ván với máy và hoàn thiện cấp Khó.
**Đầu vào (phải xong trước):** T59, T38, T65.
**Việc cần làm:**
- Viết tiền điều kiện, bước, dữ liệu và kết quả mong đợi cho từng AC được giao trong bản đồ nghiệm thu; mỗi nhánh lỗi/biên có biến thể TC.
- Chạy toàn bộ TC được giao trên tích hợp thật, lưu PASS/FAIL/BLOCKED và bằng chứng; sửa lỗi thuộc Task triển khai, kiểm lại sau sửa.
- Đối chiếu số đo GATE-ENGINE; BLOCKED không phải PASS và chặn phát hành.
**Đầu ra:** Kết quả TC trên Jira.
**Cách kiểm và điều kiện PASS:** AC được giao: AC-08.3.1, AC-08.3.2, AC-08.3.3, AC-08.3.4, AC-08.3.5, AC-08.3.6, AC-08.3.7, AC-08.3.8, AC-08.3.9. PASS khi toàn bộ AC được giao có TC/biến thể đạt và bằng chứng; FAIL/BLOCKED giữ nguyên, không được chuyển thành PASS chỉ vì PO xác nhận đã biết. Task kiểm cục bộ không xác nhận các AC đang giao cho Task tích hợp khác. Xem jira/TRUY-VET-AC.md.
**Lịch:** Thư · 8 giờ · 2 Story Points · 29/10 chiều → 30/10 sáng · XIAN Sprint 3.
**Tham chiếu:** BACKLOG-P1.md (AC), BA-SCOPE-DECISIONS.md Phần 0 (luật), jira/TRUY-VET-AC.md (nơi nghiệm thu). TC chi tiết được viết trong Task; không có bằng chứng PASS trước khi thực thi.


## 8. Dự phòng và điều kiện đổi kế hoạch

Ngày04/11 không phân Task mới: ưu tiên sửa lỗi và chạy lại các kiểm tra ảnh hưởng trên cùng bản dựng. Nếu việc bắt buộc vẫn FAIL/BLOCKED, báo PO với số đo và tác động; không tự cắt P1 hoặc đổi ngưỡng. Tình kín 56 giờ ở S1 và S2 nên vẫn là điểm tập trung rủi ro; phát hiện trễ phải cập nhật dữ liệu lịch và kiểm lại ngay.

Thời gian chuyển sang FE/data giữ nguyên tổng phạm vi: T33 chuyển 8h UI sang T58; T52 chuyển 4h overlay sang T25; T59 chuyển 4h UI sang T38 và 4h dữ liệu đáp án sang T02. T42/T46/T65 chuyển khỏi Tình. T04 +8h thử auth/phục hồi, T06 +8h thử phiên, T13/T17/T69 mỗi Task +4h kiểm biên: tăng tổng từ 892 lên 920h.

## 9. Chuẩn bị nhập Jira

1. Lưu/export bản Jira hiện có và xác định chính xác tập mục cũ cần thay. Tệp này không tự xoá hay nhập dữ liệu.
2. Tạo bốn Sprint theo mục 3 và bốn Fix version; Epic/Story không gán Sprint.
3. Ánh xạ bảy tên Assignee/Reporter sang tài khoản Jira thực tế; kiểm quyền và các trường Time tracking/Story Points dành cho Task. CSV hiện giữ tên người để PO kiểm, chưa có định danh tài khoản Jira.
4. Thử nhập và kiểm trên cấu hình Jira thực tế: UTF-8, ngày dd/MM/yyyy, Original Estimate tính bằng giây; Issue Id/Parent Id ánh xạ quan hệ, Story ánh xạ relates to, các cột Blocked by ánh xạ is blocked by. Không giả định mọi giao diện nhập đều nhận các trường giống nhau.
5. Sau thử nhập, đếm9/27/71, kiểm cha Epic, liên kết Story/phụ thuộc, người làm, Sprint/ngày/điểm/giờ và trạng thái To Do. Nếu trình nhập không nhận liên kết bằng ID nội bộ, lập bảng ID→issue key sau nhập rồi tạo liên kết theo bảng đó.

## 10. Tái tạo và kiểm tra

Nguồn lịch/nội dung Task: `jira/plan-data.json`. Nguồn luật/AC: BA và BACKLOG-P1. Bản đồ nghiệm thu: `jira/AC-TASK-MAP.json`. Chạy `python3 jira/build_plan.py` để sinh lại tệp; `python3 jira/build_plan.py --check` kiểm số lượng, lịch, phụ thuộc, người kiểm độc lập, đầu vào268AC và độ đồng bộ các đầu ra. Không cần thư viện ngoài. Báo cáo: [KIEM-TRA-KE-HOACH](jira/KIEM-TRA-KE-HOACH.md).
