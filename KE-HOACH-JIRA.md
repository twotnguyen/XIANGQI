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

**Mục tiêu**

Dựng bộ khung để nhóm cùng phát triển, chạy và kiểm tra ứng dụng Cờ Tướng Online theo một cách thống nhất.

**Bối cảnh công việc**

Ứng dụng gồm giao diện trình duyệt, máy chủ phòng/ván, bộ luật và máy cờ. Bộ khung giúp các phần này dùng chung cách chạy và kiểm mã.

**Yêu cầu cần đáp ứng**

- Tổ chức một kho mã dùng pnpm, công cụ quản lý các gói phụ thuộc và chạy nhiều phần trong cùng dự án. Các thư mục gồm apps/web cho giao diện, apps/server cho máy chủ, packages/shared cho dữ liệu dùng chung, packages/xiangqi-core cho luật cờ và packages/engine cho máy chọn nước.
- Giao diện dùng React để tạo thành phần màn hình, Vite để chạy và đóng gói giao diện, TypeScript để kiểm tra kiểu dữ liệu; máy chủ dùng NestJS để tổ chức xử lý các yêu cầu. Bật kiểm tra kiểu nghiêm ngặt để phát hiện dữ liệu dùng sai.
- Mỗi đề nghị gộp mã vào nhánh develop phải tự kiểm quy cách mã, kiểu dữ liệu và kiểm thử; một bước lỗi thì không được gộp.
- Nhật ký máy chủ có thời gian, mức lỗi và tên sự kiện, không ghi mật khẩu, mã xác minh email, khoá phiên hoặc nội dung chat. Giữ nhật ký tối đa 14 ngày. Nhật ký dùng dạng JSON, tức bản ghi có các trường tên và giá trị để máy và người có thể tra cứu thống nhất.
- Có địa chỉ /health để kiểm tra tình trạng máy chủ; chuẩn bị chỗ bổ sung trạng thái cơ sở dữ liệu và máy cờ khi chúng được nối vào.
- Tệp .env.example chỉ liệt kê biến cấu hình mẫu; khoá bí mật không vào kho mã, không đưa vào biến bắt đầu bằng VITE_ vì trình duyệt đọc được chúng.

**Việc cần làm**

- Tạo cấu trúc thư mục và lệnh chạy đồng thời giao diện với máy chủ.
- Cấu hình ESLint để kiểm quy cách mã, Prettier để định dạng, bộ kiểm kiểu TypeScript và Vitest để chạy kiểm thử tự động.
- Cấu hình GitHub Actions, dịch vụ tự chạy các bước kiểm khi gửi đề nghị gộp mã, và quy tắc bảo vệ nhánh; thử một thay đổi đúng và một thay đổi cố ý gây lỗi.
- Tạo nhật ký có bộ lọc dữ liệu nhạy cảm và địa chỉ kiểm tra sức khoẻ.
- Viết hướng dẫn cài đặt, chạy dự án và khai báo cấu hình camera/mic giữa môi trường tự chạy và dịch vụ đám mây.

**Kết quả bàn giao**

- Kho mã khởi động được bằng pnpm dev.
- Hướng dẫn cho người mới và tệp cấu hình mẫu.
- Bằng chứng bước kiểm tự động chấp nhận mã đúng, chặn mã lỗi.

**Điều kiện hoàn thành**

- Từ bản sao mới, pnpm install rồi pnpm dev khởi động được hai phần ứng dụng; gọi /health nhận phản hồi thành công.
- Thử đưa bí mật giả vào dữ liệu ghi nhật ký: không xuất hiện nguyên giá trị trong bản ghi.
- Không có khoá thật trong tệp được theo dõi; lỗi kiểm kiểu làm bước kiểm tự động thất bại.

**Phạm vi và phối hợp**

Bàn giao bộ khung cho các chức năng đăng nhập, phòng và bàn cờ. Kết quả kiểm sức khoẻ đầy đủ cần được kiểm lại sau khi nối cơ sở dữ liệu và máy cờ thật.

#### T02 · Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ

**Mục tiêu**

Chuẩn bị cách kiểm thử và dữ liệu chuẩn để cả nhóm đánh giá ứng dụng bằng kết quả quan sát được.

**Bối cảnh công việc**

Người kiểm thử cần dữ liệu, thao tác và kết quả đúng. Riêng luật cờ/máy cờ cần đáp án độc lập, tránh lấy kết quả chương trình làm chuẩn kiểm chính nó.

**Yêu cầu cần đáp ứng**

- Kế hoạch ghi rõ phạm vi kiểm, môi trường, thiết bị, dữ liệu thử, điều kiện bắt đầu và điều kiện kết thúc kiểm thử.
- Mỗi ca có tiền điều kiện, dữ liệu, từng bước thực hiện, kết quả mong đợi và chỗ lưu bằng chứng; yêu cầu có nhiều nhánh phải có nhiều biến thể.
- Quy định ghi lỗi theo mức Nghiêm trọng, Cao, Trung bình, Thấp; bản ghi lỗi phải có cách tái hiện và ảnh hoặc nhật ký phù hợp.
- Chuẩn bị thế cờ bao phủ luật bảy loại quân, chiếu, chiếu hết, hết nước đi, lặp thế và không ăn quân.
- Chuẩn bị bộ chiếu hết một và hai nước bắt buộc có đáp án được xác minh riêng, cùng 50 thế giữa ván phục vụ đo máy cờ.
- Phân biệt ca đã viết với ca đã chạy; kết quả được ghi là đạt, không đạt hoặc bị chặn kèm lý do.

**Việc cần làm**

- Lập danh sách các nhóm tính năng và cách kiểm bằng giao diện, gọi máy chủ trực tiếp hoặc chạy bộ luật.
- Soạn mẫu ca kiểm thử và mẫu báo lỗi dùng thống nhất.
- Viết các ca nền tảng: khởi động, cấu hình, quyền dữ liệu, kết nối và bảo vệ thông tin trong nhật ký.
- Tạo tệp thế cờ, lời giải và nguồn đối chiếu; nhờ người kiểm tra độc lập rà lại các đáp án bắt buộc.
- Xác định cách ghi môi trường và số đo để người khác lặp lại phép thử.
- Bàn giao dữ liệu và hướng dẫn cho người viết máy cờ và các phần kiểm thử chức năng.

**Kết quả bàn giao**

- Kế hoạch kiểm thử và mẫu ca/mẫu lỗi.
- Bộ ca nền tảng.
- Bộ thế luật, chiếu hết và thế giữa ván có đáp án, nguồn và hướng dẫn sử dụng.

**Điều kiện hoàn thành**

- Một người khác đọc mẫu có thể thực hiện ca mà không phải hỏi lại dữ liệu đầu vào hoặc kết quả đúng.
- Mỗi thế chiếu hết bắt buộc có lời giải kiểm lại được và không dùng kết quả máy cờ đang phát triển làm đáp án duy nhất.
- Báo cáo không ghi đạt cho ca chưa thực hiện.

**Phạm vi và phối hợp**

Công việc này chuẩn bị phương pháp và dữ liệu. Người phụ trách từng nhóm chức năng tiếp tục viết biến thể, chạy thử và lưu bằng chứng của nhóm đó.

#### T03 · Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái

**Mục tiêu**

Tạo bộ khung giao diện tiếng Việt và các thành phần dùng chung để mọi màn hình có hình thức, cách báo lỗi và cách thao tác nhất quán.

**Bối cảnh công việc**

Người dùng bắt đầu từ màn đăng nhập hoặc Sảnh, rồi chuyển tới phòng online hay ván với máy. Các phần giao diện cần dùng cùng nút, ô nhập, hộp thoại và cách hiển thị khi đang tải hoặc không có dữ liệu.

**Yêu cầu cần đáp ứng**

- Dùng giao diện Kỳ Đài Cổ Phong: nền nâu trầm, viền đồng thau, chữ vàng ngà và bàn cờ màu gỗ; thống nhất màu, phông chữ, khoảng cách theo thiết kế chung. Bản này chỉ có giao diện đó, không có bộ chọn giao diện khác.
- Khung trang hỗ trợ màn hình rộng từ 360 pixel, có thanh điều hướng và vùng nội dung phù hợp. Pixel là đơn vị điểm ảnh dùng để xác định kích thước hiển thị.
- Tạo nút, ô nhập, hộp thoại, thông báo ngắn, chú thích nút, khung chờ tải, khung trống và khung lỗi dùng lại được.
- Thành phần thể hiện được trạng thái bình thường, đang tải, trống, lỗi và bị vô hiệu khi phù hợp.
- Sảnh có vị trí cho Tự tạo phòng, Vào phòng bằng mã và Đánh với máy; chức năng làm sau được thể hiện đúng bằng “Sắp ra mắt” hoặc ẩn ở thao tác sâu.
- Các thao tác có nhãn rõ ràng, sử dụng bàn phím được và không chỉ dùng màu để truyền đạt trạng thái. Kiểm tương phản và khả năng truy cập theo mức AA cơ bản của chuẩn trợ năng cho web, tức chữ dễ phân biệt với nền, trường nhập có nhãn và thông tin vẫn hiểu được khi không phân biệt màu.

**Việc cần làm**

- Chuyển bảng màu, phông và khoảng cách thành biến giao diện dùng chung.
- Tạo khung bố cục cho máy tính và điện thoại, cùng cơ chế chuyển trang.
- Xây dựng từng thành phần với ví dụ hiển thị đủ trạng thái.
- Gắn khung Sảnh và thanh điều hướng, để phần chức năng thật được nối vào sau.
- Kiểm độ rộng 360 và 1440 pixel, phóng to chữ, di chuyển bằng bàn phím và thông báo lỗi.

**Kết quả bàn giao**

- Bộ thành phần giao diện có ví dụ sử dụng.
- Khung trang và thanh điều hướng.
- Bảng kiểm các trạng thái và kích thước đã kiểm tra.

**Điều kiện hoàn thành**

- Khung trang không gây cuộn ngang ngoài ý muốn ở độ rộng 360 pixel.
- Nút bị vô hiệu không thực hiện hành động, kèm lời giải thích thích hợp.
- Lỗi tải có lời báo và cách thử lại; dữ liệu trống không giống một màn hình bị hỏng.
- Các màn hình mẫu dùng cùng thành phần thay vì tự tạo nhiều kiểu nút và hộp thoại khác nhau.

**Phạm vi và phối hợp**

Bàn giao phần trình bày chung. Luồng đăng ký, quản lý phòng, danh sách phòng và ván với máy sẽ được nối với máy chủ trong phần việc tương ứng.

#### T06 · Spike media LAN/Cloud/HTTPS và thử mô hình phiên

**Mục tiêu**

Thử sớm hạ tầng camera/mic và cơ chế phiên đăng nhập để xác định cách triển khai được trên máy phát triển, mạng nội bộ và Internet.

**Bối cảnh công việc**

Camera/mic dùng LiveKit, một dịch vụ chuyển tiếp hình và tiếng giữa người tham gia. Việc thử được thực hiện bằng phòng và tài khoản mẫu để phát hiện hạn chế trước khi ghép vào ván cờ thật.

**Yêu cầu cần đáp ứng**

- Chạy LiveKit bằng Docker, công cụ khởi động dịch vụ từ cấu hình có sẵn, trên mạng nội bộ; có cấu hình dùng LiveKit Cloud, phiên bản dịch vụ đám mây, khi cần qua Internet.
- Trình duyệt trên nhiều máy phải mở web qua kết nối HTTPS bảo mật để được xin quyền camera/mic; không chạy máy chủ LiveKit trên Render. Render là nơi chạy giao diện và máy chủ ứng dụng dự phòng; máy chủ LiveKit cần các loại cổng mạng riêng mà môi trường Render đã chọn không cung cấp.
- Thử hai người có quyền phát và năm người chỉ nhận; người xem không được phát kể cả gọi trực tiếp.
- Đổi môi trường bằng địa chỉ và khoá cấu hình; không đưa khoá thật vào kho mã.
- Đo thời gian thu hồi quyền, mức dùng tài nguyên máy và hạn mức dịch vụ. Ghi số đo thực tế, không tự đặt ngưỡng đạt cho thời gian thu hồi.
- Thử phiên 30 ngày hoặc 12 giờ/đóng trình duyệt, hạn tính cố định từ đăng nhập; thử danh tính Khách và thu hồi phiên bằng hai trình duyệt.

**Việc cần làm**

- Tạo cấu hình Docker, cấu hình mẫu đám mây và hướng dẫn chứng chỉ HTTPS nội bộ.
- Mở trang thử trên nhiều máy, kiểm gửi/nhận hình tiếng giữa hai người phát với năm người nhận.
- Thử đổi quyền và thu hồi quyền, ghi thời điểm yêu cầu và thời điểm luồng thực sự ngừng.
- Theo dõi tài nguyên và hạn mức trong một phiên thử có ghi thời lượng.
- Tạo tài khoản thử, kiểm hạn phiên cố định và việc đăng nhập/thu hồi trên hai trình duyệt.
- Tổng hợp giới hạn, lỗi cấu hình và hướng xử lý để nhóm thời gian thực và phiên dùng được.

**Kết quả bàn giao**

- Tệp docker-compose, bản cấu hình để Docker khởi động dịch vụ, và cấu hình mẫu không chứa bí mật.
- Hướng dẫn chạy mạng nội bộ, HTTPS và dịch vụ đám mây.
- Báo cáo có thiết bị, môi trường, cách thử, số đo và hạn chế.

**Điều kiện hoàn thành**

- Người khác làm theo hướng dẫn mở được trang thử có camera/mic trên máy thứ hai trong mạng.
- Người xem bị từ chối phát; thu hồi quyền có bằng chứng thời gian thực tế.
- Đổi hoạt động hoặc làm mới khoá phiên không tự dời hạn đăng nhập.
- Báo cáo phân biệt thử kỹ thuật với luồng chưa có ván thật.

**Phạm vi và phối hợp**

Đây là thử khả thi hạ tầng. Xử thua khi đăng nhập thiết bị khác, quyền hình tiếng theo ghế và sự liên tục của ván phải được kiểm lại trên ứng dụng đã tích hợp.

#### T12 · Khung realtime Socket.IO

**Mục tiêu**

Tạo đường kết nối thời gian thực đáng tin cậy giữa trình duyệt và máy chủ để phòng, nước đi và quyền điều khiển luôn thống nhất.

**Bối cảnh công việc**

Khi mạng chập chờn, cùng một thao tác có thể gửi lại hoặc đến từ thẻ cũ. Máy chủ cần biết ai gửi, lệnh đã chạy chưa và người gửi đang nhìn phiên bản trạng thái nào trước khi chấp nhận. Thẻ trình duyệt là một trang đang mở trong cùng cửa sổ hoặc trình duyệt. “Ảnh chụp trạng thái” ở đây là gói dữ liệu hiện tại của phòng, không phải ảnh chụp màn hình; “biên lai” là bản ghi để nhận ra lệnh đã xử lý và trả lại đúng kết quả cũ.

**Yêu cầu cần đáp ứng**

- Dùng Socket.IO, thư viện truyền sự kiện hai chiều, trong NestJS, bộ khung tổ chức máy chủ; kiểm thông tin xác thực phiên do Supabase, dịch vụ tài khoản, cấp cho tài khoản thường và Khách.
- Kết nối không có khoá hợp lệ bị từ chối; chỉ nhận sự kiện của phòng mà danh tính có quyền tham gia.
- Mỗi lệnh có mã nhận diện và phiên bản trạng thái. Gửi trùng cùng mã chỉ có hiệu lực một lần và trả kết quả cũ.
- Lệnh dựa trên phiên bản cũ bị từ chối kèm trạng thái mới nhất.
- Khi nối lại, có ảnh chụp trạng thái đầy đủ để ứng dụng khôi phục phòng, ván, đồng hồ và vai trò khi các phần này được nối vào.
- Thẻ trình duyệt mới cùng phòng tiếp quản, thẻ trình duyệt cũ chỉ đọc và được thông báo; thẻ trình duyệt cũ tự nối lại không giành quyền trở lại. Biên lai lệnh được lưu và xoá sau 24 giờ.

**Việc cần làm**

- Tạo cổng kết nối và bước xác thực trước khi nhận sự kiện.
- Thiết kế cấu trúc lệnh, phản hồi, lỗi và ảnh chụp trạng thái trong packages/shared để các phần dùng chung. Gói packages/shared là nơi lưu các định nghĩa dữ liệu mà nhiều phần ứng dụng cùng sử dụng.
- Tạo lưu biên lai, xử lý gửi trùng và phiên bản cũ.
- Thêm quản lý thẻ trình duyệt điều khiển và sự kiện báo thẻ trình duyệt mất quyền.
- Viết ví dụ sự kiện phòng/ván, phiên, hình tiếng và lỗi máy cờ; giải thích trách nhiệm mỗi bên.
- Thử nối lại, gửi lặp và 50 kết nối mẫu để phát hiện lỗi khung.

**Kết quả bàn giao**

- Khung kết nối thời gian thực có xác thực và chống lệnh trùng.
- Tài liệu sự kiện và mẫu dữ liệu.
- Kiểm thử kết nối, thẻ trình duyệt, biên lai và báo cáo thử tải sơ bộ.

**Điều kiện hoàn thành**

- Khoá phiên sai không mở được kết nối có quyền.
- Gửi một lệnh hai lần chỉ thay đổi trạng thái một lần.
- Lệnh cũ nhận lại trạng thái mới, không ghi đè dữ liệu hiện tại.
- Tab mất quyền tự nối lại vẫn không điều khiển được; biên lai quá hạn được dọn.

**Phạm vi và phối hợp**

Bàn giao hợp đồng giao tiếp cho phòng, ván, phiên và hình tiếng. Số đo kết nối mẫu không thay phép đo ứng dụng thật khi đồng thời có ván online, máy cờ và người xem.

#### T14 · Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu

**Mục tiêu**

Tạo cấu trúc dữ liệu và quyền truy cập để lưu phòng, người tham gia, ván cờ và quan hệ bạn bè một cách nhất quán.

**Bối cảnh công việc**

Dữ liệu trên trình duyệt có thể bị sửa, vì vậy người dùng không được tự ghi kết quả ván hoặc đọc dữ liệu riêng của người khác. Supabase cung cấp cơ sở dữ liệu PostgreSQL; quyền truy cập cần được kiểm cả khi gọi trực tiếp, không chỉ qua giao diện.

**Yêu cầu cần đáp ứng**

- Tạo dữ liệu lời mời kết bạn, quan hệ bạn bè, phòng, thành viên phòng, danh sách người bị chặn, ván và nước đi.
- Tích hợp với bảng hồ sơ, bộ đếm đăng nhập và biên lai lệnh đã được phần đăng ký/thời gian thực tạo, không tạo bản trùng khác cấu trúc.
- Dùng khoá tham chiếu và ràng buộc để tránh người tham gia hoặc nước đi trỏ tới bản ghi không hợp lệ.
- Tên tài khoản lưu đúng chữ người nhập nhưng ràng buộc duy nhất so sánh không phân biệt hoa thường.
- Phân quyền theo từng dòng dữ liệu: trình duyệt chỉ đọc dữ liệu được phép; máy chủ có quyền dịch vụ mới ghi dữ liệu phòng, ván và kết quả.
- Tệp tạo/cập nhật cấu trúc dữ liệu phải chạy được từ cơ sở dữ liệu trống; có dữ liệu mẫu phục vụ demo, không chứa bí mật thật.

**Việc cần làm**

- Vẽ quan hệ các bảng và chỉ rõ nguồn sở hữu của từng nhóm dữ liệu.
- Viết tệp tạo bảng, khoá, chỉ mục và ràng buộc; ghép với các tệp đã có.
- Thiết lập chính sách quyền đọc/ghi cho tài khoản, người ngoài và máy chủ.
- Tạo dữ liệu mẫu có phòng, hai người chơi và người xem để dùng kiểm quyền.
- Dựng lại cơ sở dữ liệu thử từ đầu, kiểm các quan hệ và tên khác hoa thường.
- Gọi trực tiếp bằng quyền trình duyệt để thử ghi kết quả và đọc dữ liệu không thuộc quyền.

**Kết quả bàn giao**

- Tệp tạo/cập nhật cơ sở dữ liệu dùng được từ đầu.
- Sơ đồ dữ liệu và mô tả quyền.
- Dữ liệu mẫu cùng kết quả kiểm quyền trực tiếp.

**Điều kiện hoàn thành**

- Tạo mới từ cơ sở dữ liệu trống không lỗi; đủ bảng và quan hệ cần thiết.
- Không tạo đồng thời được hai tên như Twot và twot.
- Người dùng không tự sửa phòng/ván/kết quả qua quyền công khai của trình duyệt.
- Máy chủ ghi được dữ liệu hợp lệ; truy cập ngoài quyền bị từ chối.

**Phạm vi và phối hợp**

Bàn giao nơi lưu và bảo vệ dữ liệu. Quyết định ai thắng, ai ngồi ghế hay có thể kết bạn vẫn nằm trong chức năng nghiệp vụ của máy chủ.

#### T51 · Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ

**Mục tiêu**

Kiểm tra toàn bộ sản phẩm sau khi ghép các chức năng để phát hiện lỗi xuất hiện giữa các phần.

**Bối cảnh công việc**

Chỉ dùng bản đã hoàn tất mọi phần triển khai. Việc kiểm chuyên đề có thể diễn ra song song nhưng dùng tài khoản và phòng thử riêng; báo cáo tổng hợp không được coi phần chưa kiểm hoặc chưa đo là đã đạt.

**Yêu cầu cần đáp ứng**

- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.
- Kiểm thêm: tình trạng máy chủ, kết nối dữ liệu và máy cờ được báo đúng; nhật ký có thời gian, mức lỗi và sự kiện nhưng không chứa mật khẩu, mã xác minh, thông tin đăng nhập bí mật hoặc nội dung chat. Biên lai chống lặp lệnh bị xoá sau 24 giờ, nhật ký giữ tối đa 14 ngày.
- Mở thêm thẻ cùng tài khoản: thẻ mới tiếp quản, thẻ cũ chỉ đọc kể cả khi tự nối lại. Nối lại phải nhận đủ phòng, ván, đồng hồ và vai trò; không được thao tác bằng quyền cũ.
- Khách đủ 12 giờ khi còn ngồi ghế không bị ngắt giữa ván; sau khi rời và hết phiên thì dữ liệu cá nhân bị xoá. Mất mạng khi đang đếm bắt đầu phải huỷ đếm, giữ ghế 60 giây, không tạo ván hoặc xử thua.
- Người ngồi ghế cuối rời thì phòng đóng, người xem về Sảnh và chat bị xoá. Sau ván giữ đúng ghế, người xem, chế độ, mức giờ và chat; đổi người trong cặp chat riêng không làm người mới đọc được nội dung cũ. Rời ghế thu hồi quyền phát hình tiếng.
- Hộp kết quả có đúng lý do: chiếu hết, hết nước, đầu hàng, hết giờ, mất mạng, lặp thế, thoả thuận hoà, 120 nửa nước không ăn quân, chiếu liên tục hoặc bị gián đoạn. Gián đoạn không ghi thắng, thua hay hoà.

**Việc cần làm**

- Chuẩn bị tài khoản, phòng và thế cờ cho từng luồng; ghi phiên bản bản dựng và môi trường. Chạy từ giao diện thật, quan sát đồng thời ở người chơi và người xem, không thay luồng thật bằng dữ liệu giả.
- Tự động hoá những đoạn lặp được bằng công cụ điều khiển trình duyệt; các đoạn cần email, thiết bị, camera hoặc thao tác mạng thật ghi rõ cách thực hiện thủ công.
- Lưu kết quả từng bước, ghi lỗi với cách tái hiện và ảnh hoặc video. Sau khi sửa, chạy lại tình huống lỗi và luồng liên quan; tránh trộn kết quả từ hai bản phần mềm mà không ghi chú.

**Kết quả bàn giao**

- Báo cáo kiểm tra toàn bộ mười luồng cùng các tình huống tích hợp bổ sung; bộ kiểm tự động cho phần tự động hoá được.
- Danh sách lỗi, kết quả kiểm lại và bằng chứng để người khác tái hiện.

**Điều kiện hoàn thành**

- Mười luồng và các tình huống tích hợp được giao đều có kết quả đạt, không còn lỗi Nghiêm trọng hoặc Cao mở trong phạm vi kiểm.
- Báo cáo phân biệt Đạt, Không đạt và Chưa kiểm được; dữ liệu đo chất lượng, bản đóng gói và lần tổng duyệt cuối vẫn cần kết quả riêng.

**Phạm vi và phối hợp**

Không thay báo cáo đo tải hoặc kiểm chứng máy cờ bằng việc chơi thử thành công. Hoàn tất công việc này chưa tự cho phép phát hành nếu các kiểm tra chuyên đề hoặc đo chất lượng còn chưa đạt.

#### T66 · Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật

**Mục tiêu**

Đo chất lượng vận hành và kiểm chứng các ràng buộc kỹ thuật trên bản tích hợp trước khi phát hành.

**Bối cảnh công việc**

Mỗi kết quả phải gắn với máy, mạng, trình duyệt, bản phần mềm, bộ dữ liệu, ngày và người đo. Có thể tổng hợp bằng chứng đã thực hiện ở phần chuyên môn nhưng phải kiểm tính đầy đủ, cùng phạm vi và khả năng lặp lại; nguyên mẫu không thay được bằng chứng trên sản phẩm thật.

**Yêu cầu cần đáp ứng**

- Tải đồng thời 50 người dùng giả lập và 10 ván: ghi số yêu cầu, lỗi, thời gian nước đi tới đối thủ và người xem, mức dùng bộ xử lý và bộ nhớ. Mục tiêu độ trễ dưới 100 mili giây tại mốc mà ít nhất 95% mẫu không vượt quá; 10 ván chạy cùng lúc không lỗi.
- Máy cờ: bộ 50 thế giữa ván cho mỗi cấp, ghi độ sâu và thời gian; Dễ, Trung bình, Khó lần lượt trong 300, 1.000, 3.000 mili giây ở mốc 95%. Đối chiếu cấp Khó giải đúng toàn bộ bộ chiếu hết ngắn và kết quả đấu máy phân biệt sức chơi.
- Gửi mã xác minh thật đến ba Gmail ngoài nhóm, thử năm thư trong một giờ; ghi thời gian nhận, thư rác và hạn mức. Thử Google với email đã đăng ký bằng mật khẩu phải bị từ chối gộp tài khoản. Gửi trực tiếp yêu cầu đổi email đến dịch vụ xác thực phải bị chặn; chỉ khoá ô email trên màn hình là chưa đạt.
- Kiểm đăng nhập bằng Tên đăng nhập không làm lộ email hoặc việc tên có tồn tại; khoá sau năm lần sai trong 15 phút. Kiểm đăng nhập hai thiết bị xử thua đúng, thu hồi phiên cũ, tạo và huỷ phiên Khách với hạn 12 giờ cùng ngoại lệ đang ngồi ghế.
- Hình tiếng: một phòng hai người phát, năm người chỉ nhận, thử đuổi và thu hồi quyền; thử dịch vụ LiveKit tự chạy và dịch vụ đám mây của cùng nhà cung cấp, chuyển bằng cấu hình. LiveKit là dịch vụ truyền camera và mic. Các máy cùng mạng dùng kết nối web được mã hoá; ghi tài nguyên, thời gian thu hồi và phút sử dụng. Thử tải hình tiếng khoảng ba phòng chỉ ghi số đo, không tự đặt ngưỡng đạt.
- Bảo mật và dữ liệu: máy chủ phân xử luật; người dùng không đọc hoặc ghi trái phép dữ liệu người khác; mật khẩu được băm; khoá bí mật không nằm trong mã gửi trình duyệt; chat có giới hạn tốc độ. Ván online và nước đi lưu bền, ván với máy chỉ trong bộ nhớ; chat xoá khi phòng đóng, biên lai lệnh xoá sau 24 giờ, nhật ký tối đa 14 ngày.
- Thiết bị và giao diện: bản mới Chrome, Edge, Firefox, Safari; rộng từ 360 điểm ảnh và bàn cờ dùng bằng cảm ứng. Kiểm mức cơ bản của WCAG 2.1 AA, tức hướng dẫn trợ năng nội dung web phiên bản 2.1 ở cấp AA: tương phản dễ đọc, nhãn cho điều khiển, dùng bàn phím ở biểu mẫu/hộp thoại và tôn trọng lựa chọn giảm chuyển động. Toàn bộ giao diện tiếng Việt; chat và các tên hiển thị như văn bản, không thực thi mã chèn vào.
- Nhật ký có cấu trúc và báo sức khoẻ dịch vụ, không ghi mật khẩu, mã xác minh, thông tin đăng nhập bí mật hoặc nội dung chat. Camera, mic mặc định tắt, không ghi hoặc lưu; chỉ thu thập email, Tên đăng nhập, Tên hiển thị, mật khẩu băm, bạn bè và ván, không hỏi tuổi.

**Việc cần làm**

- Ghi máy, mạng, trình duyệt, bản phần mềm, người đo, ngày đo và số lượt; kiểm đủ 12 nhóm chất lượng vận hành và 9 nhóm thử khả thi nêu trong các yêu cầu trên.
- Chạy 50 kết nối/10 ván; lưu thời gian từng nước tới đối thủ và người xem, lỗi, tài nguyên. Tính mốc 95% từ dữ liệu thô, không thay bằng trung bình.
- Đối chiếu bộ 50 thế mỗi cấp, chiếu hết và đấu máy; kiểm độc lập báo cáo gửi thư, Google, đổi email trực tiếp, tên đăng nhập, phiên/Khách và media trên môi trường thật.
- Thử giao diện/trợ năng trên trình duyệt và kích thước yêu cầu, kiểm quyền dữ liệu, thời hạn xoá và nhật ký chứa dữ liệu nhạy cảm.
- Tổng hợp bằng chứng theo từng điều kiện; phần chưa đạt giữ nguyên Không đạt/Chưa kiểm được và chặn phát hành. Số đo media chỉ yêu cầu ghi nhận không tự thêm ngưỡng.

**Kết quả bàn giao**

- Kịch bản đo cùng dữ liệu thô, bảng chỉ số, cấu hình và bằng chứng kiểm chứng từng nhóm yêu cầu.
- Danh sách điểm Đạt, Không đạt, Chưa kiểm được và ảnh hưởng tới phát hành.

**Điều kiện hoàn thành**

- Mọi nhóm yêu cầu có bằng chứng đúng phạm vi; tiêu chí bắt buộc chưa đạt phải giữ trạng thái chưa đạt và chặn phát hành.
- Các phép đo chỉ yêu cầu ghi số liệu được báo đầy đủ, không tự biến thành ngưỡng cam kết mới.

**Phạm vi và phối hợp**

Không tuyên bố hệ thống đạt chỉ vì đã viết xong báo cáo. Đây là đo và xác minh; phần sửa lỗi vẫn do công việc sở hữu chức năng thực hiện.

#### T70 · Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo

**Mục tiêu**

Kiểm điều kiện phát hành và chuẩn bị bộ chạy trình diễn mà thành viên khác có thể tự khởi động.

**Bối cảnh công việc**

Chỉ bắt đầu khi kiểm tích hợp, kiểm chuyên đề và đo chất lượng đã hoàn tất với mọi điều kiện bắt buộc đạt, không còn lỗi Nghiêm trọng hoặc Cao. Bản bàn giao phải có thể chạy lại được, có tài khoản và dữ liệu minh hoạ, không phụ thuộc trí nhớ của người đóng gói.

**Yêu cầu cần đáp ứng**

- Kiểm đủ danh sách điều kiện nghiệm thu và các ca kiểm có tiền điều kiện, thao tác, dữ liệu, kết quả mong đợi; tiêu chí có nhiều nhánh phải có trường hợp tương ứng. Có báo cáo kiểm lại cuối từng đợt phát triển và danh sách lỗi còn mở.
- Bộ chạy tại máy trình diễn gồm giao diện web, máy chủ ứng dụng và LiveKit, dịch vụ camera, mic, được chạy bằng Docker là công cụ khởi động dịch vụ từ cấu hình có sẵn. Các máy trong cùng mạng truy cập qua kết nối web được mã hoá để trình duyệt cho dùng camera và mic.
- Viết hướng dẫn cho máy đã có Node, môi trường chạy ứng dụng, và pnpm, công cụ cài các gói phụ thuộc, cùng tệp cấu hình được cấp riêng. Người không tham gia đóng gói phải chạy toàn bộ ứng dụng trong không quá 15 phút.
- Chuẩn bị tài khoản chính thức, tài khoản Google, email nhận mã thật, phiên Khách, phòng mẫu và thế cờ phục vụ trình diễn. Có đường chạy dự phòng: giao diện và máy chủ ứng dụng trên Render, dịch vụ lưu trữ ứng dụng; camera và mic trên LiveKit Cloud, dịch vụ hình tiếng đám mây.
- Hướng dẫn nêu cách chọn môi trường, khởi động, mở địa chỉ truy cập, kiểm dịch vụ chạy và dừng. Không để khoá bí mật hoặc mật khẩu thật trong mã nguồn, ảnh chụp hoặc tài liệu phát công khai.

**Việc cần làm**

- Đối chiếu báo cáo chức năng, kiểm thử và số đo; thiếu bằng chứng hoặc còn điều kiện chưa đạt thì giữ việc phát hành ở trạng thái Chưa thể thực hiện và nêu rõ nguyên nhân.
- Đóng gói đúng bản đã kiểm, ghi phiên bản và cấu hình; tạo dữ liệu mẫu có thể lập lại. Đưa hướng dẫn cho thành viên khác thao tác trên máy sạch đủ điều kiện và bấm giờ, ghi lại chỗ phải hỏi thêm để sửa tài liệu.
- Thử cấu hình dự phòng và chuẩn bị trình tự minh hoạ mười luồng dưới đây để người chạy cuối không phải tra mã kịch bản.
- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.

**Kết quả bàn giao**

- Bản phát hành cùng hướng dẫn chạy, cấu hình mẫu không có bí mật, tài khoản và dữ liệu trình diễn được bàn giao phù hợp.
- Biên bản đủ điều kiện phát hành và bằng chứng người khác khởi động trong 15 phút; hướng dẫn chuyển sang phương án dự phòng.

**Điều kiện hoàn thành**

- Mọi điều kiện bắt buộc đã đạt; bản đóng gói khớp bản đã kiểm và người thử độc lập khởi động thành công trong thời gian yêu cầu.
- Có dữ liệu cho mười luồng: đăng ký email thật và sửa tên; đăng ký Google rồi đăng nhập hai cách; khoá mật khẩu; tạo phòng và mời bạn hoặc Khách; đổi bên, chơi, chat, camera; công khai, khoá và đuổi người xem; chơi ván tiếp; rớt mạng; chơi với máy và đổi phe; đăng nhập thiết bị khác.

**Phạm vi và phối hợp**

Công việc này đóng gói và xác nhận điều kiện phát hành. Tổng duyệt đầy đủ có ghi hình trên máy trình diễn là bước riêng; không coi bản đóng gói chạy được là bằng chứng mọi chức năng đạt.

#### T71 · Tổng duyệt D1–D10 trên bản phát hành và ghi hình

**Mục tiêu**

Tổng duyệt đủ mười luồng sử dụng trên bản phát hành và ghi hình làm bằng chứng bàn giao.

**Bối cảnh công việc**

Sử dụng đúng máy, mạng và bản phần mềm dự kiến trình diễn, sau khi đã đủ điều kiện phát hành. Chuẩn bị các tài khoản, phòng và thế cờ đã đóng gói; người thực hiện ghi rõ phiên bản để người xem biết video tương ứng với bản nào.

**Yêu cầu cần đáp ứng**

- Đăng ký bằng Tên đăng nhập, mật khẩu và Gmail ngoài nhóm; nhận mã xác minh thật, vào Sảnh rồi đổi sang Tên hiển thị tiếng Việt. Kết quả: tài khoản dùng được, tên mới lưu đúng.
- Đăng ký bằng Google, hoàn tất đặt Tên đăng nhập và mật khẩu; đăng xuất rồi lần lượt vào lại bằng mật khẩu và Google. Kết quả: cả hai cách vào đúng tài khoản, không tạo tài khoản trùng.
- Nhập sai mật khẩu năm lần để bị khoá 15 phút; thử cả mật khẩu đúng trong thời gian khoá và thử đăng nhập Google. Kết quả: mật khẩu vẫn bị chặn, Google vào được và không xoá bộ đếm sai.
- Tạo phòng 10 phút, năm chỗ xem; mời một bạn đang trực tuyến vào ghế qua thông báo, đưa mã cho người chưa kết bạn vào xem, rồi dùng đường dẫn mời bằng phiên Khách chưa đăng nhập. Kết quả: mỗi người vào đúng phòng và đúng vai trò, Khách không phải mở đường dẫn lần hai.
- Xin đổi bên, cùng Sẵn sàng, đếm 3–2–1 rồi đi quân bằng bấm và kéo thả; gửi xin hoà và từ chối, chat riêng giữa hai người chơi và chat chung với người xem; bật camera, mic và chia sẻ cho người xem, kết thúc bằng chiếu hết. Kết quả: bàn cờ, đồng hồ, quyền chat, hình tiếng và kết quả thống nhất.
- Mở Công khai để người lạ thấy phòng ở Sảnh và vào xem; khoá phòng rồi dùng mã cũ thử vào; người chơi đuổi một người xem và người đó thử quay lại. Kết quả: người mới không vượt khoá, người bị đuổi bị chặn và mất hình tiếng.
- Sau ván chọn Ở lại phòng, xin đổi bên và bắt đầu ván thứ hai; sau đó chủ phòng rời. Kết quả: mã ván mới, đồng hồ đặt lại, người còn lại nhận quyền chủ phòng và phòng tiếp tục chờ.
- Ngắt mạng một người chơi 30 giây rồi nối lại, sau đó thử mất mạng quá 60 giây. Kết quả: lần đầu tiếp tục đúng thế và thời gian, lần sau xử thua do mất kết nối nếu đồng hồ chưa hết trước.
- Chơi với máy Dễ cầm Đỏ, đầu hàng rồi chọn Ván mới, đổi sang Đen ở cấp Khó. Kết quả: máy đi trước, đúng cấp và phe; trình diễn cấp Khó giải thế chiếu hết có đáp án đã xác minh.
- Đang đấu online trên máy tính, đăng nhập cùng tài khoản ở điện thoại. Kết quả: ván cũ bị xử thua, máy tính bị đăng xuất và điện thoại vào Sảnh.

**Việc cần làm**

- Kiểm môi trường, thiết bị thu hình tiếng và cách ghi màn hình trước khi chạy. Dùng dữ liệu trình diễn thay cho tài khoản cá nhân; tránh quay khoá bí mật, mật khẩu hoặc mã xác minh còn hiệu lực.
- Chạy từng luồng từ bước đầu đến kết quả cuối, quan sát các phía liên quan chứ không chỉ máy của chủ phòng. Ghi hình đủ thao tác và trạng thái kết quả để giảng viên hoặc thành viên mới hiểu điều được chứng minh.
- Ghi bảng kết quả từng luồng, thời điểm tương ứng trong video và điểm còn thiếu. Nếu gặp lỗi, ghi cách tái hiện, chuyển cho người phụ trách phần đó sửa, rồi kiểm lại trên bản đã sửa; ghi rõ video nào đã được thay thế.

**Kết quả bàn giao**

- Video hoặc các đoạn video có chỉ dẫn thứ tự, kèm báo cáo kết quả của cả mười luồng trên máy trình diễn.
- Danh sách lỗi và kết quả chạy lại nếu có, cùng thông tin phiên bản phần mềm và môi trường.

**Điều kiện hoàn thành**

- Cả mười luồng phải chạy đạt và có bằng chứng xem được; không dùng video cũ để chứng minh một bản mới chưa chạy.
- Luồng không chạy được vì lỗi, thiếu thiết bị hoặc dịch vụ ngoài phải được ghi Không đạt hoặc Chưa kiểm được, không đổi thành Đạt để kịp bàn giao.

**Phạm vi và phối hợp**

Đây là tổng duyệt và ghi bằng chứng trên bản phát hành. Không thay các phép đo tải, kiểm bảo mật hay kiểm sức chơi bằng việc video trình diễn chạy thành công.

### EP-01 · Đăng ký và đăng nhập

#### T04 · BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm

**Mục tiêu**

Xây dựng xử lý đăng ký bằng tên tài khoản, mật khẩu và mã xác minh email để người ngoài nhóm cũng đăng ký được tài khoản dùng thật.

**Bối cảnh công việc**

Chỉ tài khoản đã xác minh email và hoàn tất hồ sơ mới được dùng. Lỗi không được xoá tài khoản hoàn tất.

**Yêu cầu cần đáp ứng**

- Tên tài khoản 3–20 ký tự: chữ Latin không dấu, số, gạch dưới; duy nhất không phân biệt hoa thường, từ chối từ cấm ngay bước nhập.
- Mật khẩu tối thiểu 8 ký tự, ô xác nhận phải khớp. Email đã đăng ký báo “Email này đã được đăng ký” và không gửi mã.
- Gắn dịch vụ thư ngoài vào Supabase Auth, hệ thống xác thực. Mã 6 số hiệu lực 3 phút, gửi lại sau 60 giây; giới hạn thử sai gần đúng 5 lần theo dịch vụ, không bảo đảm đếm chính xác từng mã.
- Mã đúng: kiểm lại trùng tên/email, hoàn tất hồ sơ, tên hiển thị bằng tên tài khoản, tự đăng nhập. Tên vừa bị chiếm: quay bước đầu.
- Bản xác thực chưa hoàn tất được dọn khoảng 60–65 phút, không giữ chỗ tên. Đã ghi hồ sơ hoàn tất thì phục hồi, không xoá; chặn sử dụng đến khi phục hồi xong.
- Cấm đổi email qua gọi trực tiếp dịch vụ xác thực. Thử Google không gộp email trùng và thử danh tính Khách, ghi giới hạn.

**Việc cần làm**

- Tạo xử lý ba bước đăng ký và bộ lọc tên dùng chung.
- Cấu hình thư thật với tên người gửi “Cờ Tướng Online”, nội dung tiếng Việt.
- Tạo bảng hồ sơ và xử lý hoàn tất, phục hồi, dọn theo thứ tự an toàn cho cùng danh tính.
- Thử thư tới ba địa chỉ Gmail không thuộc nhóm phát triển và thử gửi năm thư tới năm email khác nhau trong một giờ; lưu thời gian nhận, việc vào thư rác và hạn mức dịch vụ.
- Thử lỗi dịch vụ thư và gọi trực tiếp chức năng đổi email để kiểm quyền ở máy chủ.
- Ghi kết quả thử Google/Khách và giới hạn; chưa coi là nghiệm thu toàn bộ luồng.

**Kết quả bàn giao**

- Chức năng đăng ký phía máy chủ, bảng hồ sơ và tác vụ phục hồi/dọn.
- Bộ lọc tên dùng lại được.
- Báo cáo gửi thư thật, chặn đổi email và thử cấu hình xác thực.

**Điều kiện hoàn thành**

- Tài khoản chưa xác minh không vào ứng dụng; tên khác hoa thường không tạo được hai tài khoản.
- Năm thư gửi được; ghi thời gian nhận thư, mục tiêu không quá một phút.
- Lỗi gửi thư báo “Không gửi được mã, vui lòng thử lại sau”; thử lại không làm tài khoản bị kẹt.
- Chạy đồng thời hoàn tất và dọn không xoá hồ sơ đã hoàn tất.
- Email không đổi được kể cả khi người dùng gửi yêu cầu trực tiếp đến dịch vụ xác thực. Nếu chỉ chặn được ở màn hình mà đường gọi trực tiếp vẫn đổi email, ghi Chưa đạt và nêu giới hạn, không coi là hoàn tất.

**Phạm vi và phối hợp**

Bàn giao cho màn đăng ký; Google và Khách đầy đủ triển khai riêng.

#### T08 · FE màn Đăng ký 3 bước

**Mục tiêu**

Xây dựng màn đăng ký ba bước để người mới tạo tài khoản bằng email thật mà hiểu rõ mình đang ở bước nào và cần sửa lỗi gì.

**Bối cảnh công việc**

Người dùng nhập tên tài khoản và mật khẩu, sau đó email, cuối cùng mã xác minh 6 số nhận qua thư. Giao diện phải phản ánh kết quả máy chủ, không tự báo đăng ký thành công khi email chưa xác minh.

**Yêu cầu cần đáp ứng**

- Bước đầu có tên tài khoản, mật khẩu và xác nhận mật khẩu. Tên dài 3–20 ký tự, chỉ chữ không dấu/số/gạch dưới, không trùng khác hoa thường và không chứa từ cấm; mật khẩu ít nhất 8 ký tự.
- Bước email báo trùng bằng “Email này đã được đăng ký” và không chuyển giả sang nhập mã.
- Bước xác minh có sáu ô nhập mã, đồng hồ 3 phút và nút gửi lại bị khoá 60 giây sau lần gửi.
- Mã sai, hết hạn hoặc bị giới hạn thử phải có lời giải thích và hướng dẫn gửi mã mới.
- Gửi thư lỗi hiện “Không gửi được mã, vui lòng thử lại sau”; trạng thái đang xử lý không cho bấm gửi trùng.
- Hoàn tất thật thì tự đăng nhập, tên hiển thị bằng tên tài khoản; vào Sảnh hoặc tiếp tục đích phòng mời còn chờ khi phần tham gia phòng được nối vào.

**Việc cần làm**

- Dựng ba bước bằng bộ ô nhập, nút và thông báo chung, giữ dữ liệu cần thiết giữa các bước.
- Nối các bước với xử lý đăng ký thật, hiển thị lỗi ngay tại ô có vấn đề.
- Tạo nhập/dán mã sáu số và các bộ đếm dựa trên hạn máy chủ trả về.
- Xử lý tên bị người khác lấy trong lúc chờ mã bằng cách quay về bước tên tài khoản.
- Kiểm đường thành công, sai tên/mật khẩu, email trùng, mã sai/hết hạn và thư lỗi.
- Kiểm trình bày trên điện thoại và cách dùng bàn phím.

**Kết quả bàn giao**

- Màn đăng ký hoàn chỉnh nối máy chủ.
- Thông báo và trạng thái chờ/lỗi/thành công.
- Bằng chứng luồng đăng ký thật.

**Điều kiện hoàn thành**

- Tên chứa từ cấm hoặc mật khẩu không khớp không qua được bước đầu.
- Không thể gửi lại trước 60 giây bằng cách bấm nhanh trên giao diện.
- Mã hợp lệ hoàn tất tài khoản và vào Sảnh; mã sai không được coi là đăng nhập.
- Mất dịch vụ thư không hiện thông báo thành công giả, người dùng có đường thử lại.

**Phạm vi và phối hợp**

Bàn giao màn đăng ký. Luồng mở đường dẫn mời rồi đăng ký cần được kiểm lại cùng chức năng chuyển hướng vào phòng khi chức năng đó hoàn tất.

#### T09 · BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập

**Mục tiêu**

Cho người có tài khoản đăng nhập bằng tên tài khoản và mật khẩu, đồng thời kiểm soát thử sai và thời hạn phiên.

**Bối cảnh công việc**

Người dùng đăng nhập bằng tên. Máy chủ tra email nội bộ, không tiết lộ email hoặc phân biệt rõ tên không tồn tại qua thông báo.

**Yêu cầu cần đáp ứng**

- Chấp nhận tên tài khoản không phân biệt hoa thường; không nhận email làm tên đăng nhập và không trả email tra cứu về trình duyệt.
- Sai tên hoặc mật khẩu đều báo “Sai tên đăng nhập hoặc mật khẩu”, tránh khác biệt phản hồi rõ rệt làm lộ tên tồn tại.
- Đếm thử sai theo tên chuẩn hoá chữ thường, kể cả tên không có thật. Sai 5 lần trong 15 phút thì chặn đăng nhập bằng mật khẩu 15 phút tính từ lần sai thứ năm.
- Trong thời gian chặn, cả mật khẩu đúng cũng bị từ chối và báo “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”.
- Đăng nhập mật khẩu đúng đặt lại bộ đếm. Google không tính vào, không bị chặn bởi bộ đếm và đăng nhập Google không xoá bộ đếm.
- Ghi nhớ đăng nhập giữ phiên 30 ngày; không ghi nhớ thì hết khi đóng trình duyệt hoặc đủ 12 giờ, tuỳ mốc tới trước. Hạn cố định từ đăng nhập, không gia hạn vì hoạt động hay làm mới khoá phiên.

**Việc cần làm**

- Tạo cách tra tài khoản phía máy chủ và gọi xác thực bằng mật khẩu.
- Tạo nơi lưu lần thử sai, kiểm cửa sổ thời gian và thời điểm hết chặn.
- Kết hợp kiểm chặn với xử lý thành công/thất bại, bảo đảm các lần gửi đồng thời không bỏ qua giới hạn.
- Gắn lựa chọn ghi nhớ với hạn phiên cố định.
- Thử tên khác hoa thường, tên giả, sai liên tiếp, đúng khi còn bị chặn và đúng sau hết chặn.
- Ghi kết quả kiểm, không đưa mật khẩu hoặc khoá phiên vào nhật ký.

**Kết quả bàn giao**

- Xử lý đăng nhập và dữ liệu bộ đếm thử sai.
- Cách quản lý hạn phiên.
- Kiểm thử chứng minh tra tên và khoá thử sai đúng.

**Điều kiện hoàn thành**

- Twot và twot dùng cùng tài khoản và cùng bộ đếm.
- Lần sai thứ năm kích hoạt chặn; lần thứ sáu với tên giả có hành vi giống tên thật.
- Đăng nhập đúng sau ba lần sai xoá số lần sai.
- Hoạt động trong ứng dụng không làm hạn 12 giờ/30 ngày trôi về sau.

**Phạm vi và phối hợp**

Bàn giao đăng nhập mật khẩu cho giao diện; kiểm chung với Google và xử lý phiên khi đang chơi được thực hiện khi các luồng đó hoàn tất.

#### T13 · Kiểm thử US-01.1

**Mục tiêu**

Kiểm chứng người dùng đăng ký bằng email thật được, đồng thời các lỗi nhập liệu, gửi thư và phục hồi tài khoản không tạo dữ liệu sai.

**Bối cảnh công việc**

Kiểm đăng ký qua giao diện và máy chủ thật; dùng kiểm dữ liệu và gọi máy chủ trực tiếp cho nhánh không tạo được bằng thao tác thường.

**Yêu cầu cần đáp ứng**

- Thử tên dưới 3 hoặc trên 20 ký tự, ký tự không hợp lệ, từ cấm và tên trùng khác hoa thường; không qua bước đầu. Tên trùng phải báo “Username đã có người dùng”, tức tên đăng nhập đã được sử dụng; lỗi xuất hiện ngay tại ô nhập.
- Thử mật khẩu dưới 8 ký tự, xác nhận không khớp và email đã có tài khoản; email trùng không được gửi mã.
- Thử thư đến Gmail ngoài nhóm, nội dung tiếng Việt, tên gửi “Cờ Tướng Online”; ghi thời gian nhận, mục tiêu không quá một phút. Gửi năm thư tới năm email trong một giờ.
- Kiểm mã đúng, sai, hết 3 phút, giới hạn thử sai và gửi lại trước/sau 60 giây. Cơ chế giới hạn thử sai là gần đúng theo dịch vụ xác thực, không ép đếm đúng từng mã.
- Kiểm bỏ dở được dọn khoảng 60–65 phút; lỗi sau khi hồ sơ hoàn tất phải phục hồi thay vì xoá tài khoản. Khi bản ghi xác thực đang chờ phục hồi, người dùng chưa được vào ứng dụng. Chạy đồng thời hoàn tất, phục hồi và dọn cho cùng tài khoản để xác nhận không xoá nhầm.
- Kiểm tên bị chiếm trong thời gian chờ mã, dịch vụ thư lỗi/hết hạn mức và gọi trực tiếp đổi email. Tên bị chiếm phải báo lỗi và quay về bước nhập tên; lỗi thư báo “Không gửi được mã, vui lòng thử lại sau”. Đổi email bằng yêu cầu trực tiếp phải bị từ chối, không chỉ bị khoá ở giao diện.

**Việc cần làm**

- Chuẩn bị tài khoản có sẵn, email chưa dùng, tên có từ cấm và dữ liệu gây lỗi có thể lặp lại.
- Viết từng ca với thời điểm, đầu vào và kết quả mong đợi, kể cả các mốc biên thời gian.
- Chạy các nhánh từ giao diện; đối chiếu hộp thư và dữ liệu máy chủ.
- Dùng môi trường thử để tạo lỗi giữa ghi hồ sơ và dọn/phục hồi, kiểm không xoá nhầm.
- Ghi đạt/không đạt/bị chặn cùng ảnh, thư nhận và dữ liệu đã che bí mật.
- Gửi lỗi cho người triển khai, kiểm lại đúng nhánh lỗi sau sửa.

**Kết quả bàn giao**

- Bộ ca đăng ký có các biến thể lỗi và biên.
- Báo cáo từng ca cùng bằng chứng.
- Danh sách lỗi và kết quả kiểm lại.

**Điều kiện hoàn thành**

- Luồng đúng tạo hồ sơ hoàn tất, tên hiển thị bằng tên tài khoản, tự đăng nhập vào Sảnh.
- Không có tài khoản trùng tên/email hoặc tài khoản chưa xác minh sử dụng được.
- Lỗi gửi thư được báo thật, gửi lại có thể phục hồi; tài khoản hoàn tất không bị xoá.
- Không đánh dấu đạt nếu không nhận được thư thật hoặc không kiểm được nhánh bắt buộc.

**Phạm vi và phối hợp**

Tự vào phòng mời sau đăng ký được kiểm khi chức năng tham gia phòng hoàn tất; kết quả cục bộ không thay bằng chứng tích hợp.

#### T15 · FE màn Đăng nhập

**Mục tiêu**

Xây dựng màn đăng nhập để người có tài khoản vào ứng dụng bằng tên tài khoản và mật khẩu, hiểu rõ lỗi hoặc thời gian bị chặn.

**Bối cảnh công việc**

Màn này cũng là cửa vào cho người mở đường dẫn mời nhưng chưa đăng nhập. Nó phải nối xử lý đăng nhập thật, giữ lựa chọn ghi nhớ và có vị trí rõ ràng cho Google và chế độ Khách.

**Yêu cầu cần đáp ứng**

- Có ô tên tài khoản, ô mật khẩu với nút hiện/ẩn và lựa chọn “Ghi nhớ đăng nhập” mặc định được chọn.
- Đăng nhập bằng tên, không dùng email thay tên. Sai tên hoặc mật khẩu hiển thị cùng câu “Sai tên đăng nhập hoặc mật khẩu”.
- Khi máy chủ chặn thử sai, hiện “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”; không tự cho vào dù mật khẩu đúng.
- Ghi nhớ tạo phiên 30 ngày; bỏ chọn tạo phiên hết khi đóng trình duyệt hoặc đủ 12 giờ, tuỳ mốc tới trước.
- Có lối vào Google và Khách để nối chức năng tương ứng; liên kết “Quên mật khẩu?” bị vô hiệu kèm “Sắp ra mắt”.
- Người đã đăng nhập mở trang đăng nhập hoặc đăng ký được chuyển về Sảnh. Người vừa đăng nhập thành công giữ đích phòng mời chờ xử lý khi phần vào phòng được nối vào.

**Việc cần làm**

- Tạo bố cục và các ô nhập từ thành phần giao diện chung.
- Nối nút đăng nhập với máy chủ, gửi lựa chọn ghi nhớ và xử lý phản hồi.
- Hiển thị trạng thái đang gửi, lỗi sai thông tin, lỗi bị chặn và lỗi kết nối; chặn bấm gửi trùng trong lúc xử lý.
- Thêm điều hướng người đã đăng nhập và chỗ tích hợp Google/Khách.
- Kiểm mật khẩu hiện/ẩn, thao tác bàn phím, màn hình 360 pixel và thông báo lỗi.
- Thử tên khác hoa thường, bỏ chọn ghi nhớ và truy cập lại trang khi đã có phiên.

**Kết quả bàn giao**

- Màn đăng nhập hoạt động bằng tài khoản thật.
- Thông báo và điều hướng sau đăng nhập.
- Bằng chứng các nhánh chính và trạng thái giao diện.

**Điều kiện hoàn thành**

- Đăng nhập đúng vào Sảnh; sai tên và sai mật khẩu không tạo hai thông báo khác nhau.
- Bị chặn thì giao diện không tự coi đăng nhập thành công.
- Ô ghi nhớ mặc định được chọn và gửi đúng lựa chọn khi bỏ chọn.
- Quên mật khẩu không mở chức năng chưa làm; người đã đăng nhập không mắc ở màn đăng nhập.

**Phạm vi và phối hợp**

Bàn giao giao diện đăng nhập mật khẩu và vị trí nối Google/Khách. Hoạt động đầy đủ của hai lối vào đó được hoàn thiện ở phần xác thực tương ứng.

#### T17 · Kiểm thử US-01.2

**Mục tiêu**

Kiểm chứng đăng nhập bằng mật khẩu, giới hạn thử sai và hạn phiên để người dùng vào đúng tài khoản mà không vượt được các ràng buộc đăng nhập.

**Bối cảnh công việc**

Chạy qua giao diện thật và xử lý máy chủ, đồng thời kiểm các mốc thời gian bằng môi trường thử có kiểm soát. Các trường hợp tên không tồn tại phải có hành vi giống sai mật khẩu của tên có thật.

**Yêu cầu cần đáp ứng**

- Tài khoản viết thường đăng nhập được bằng tên viết hoa cùng mật khẩu đúng; kiểm vào Sảnh ở luồng không có lời mời.
- Sai mật khẩu và tên không tồn tại đều có cùng thông báo, không lộ khác biệt phản hồi rõ rệt. Câu cần đối chiếu là “Sai tên đăng nhập hoặc mật khẩu”.
- Sai lần thứ năm trong 15 phút kích hoạt chặn 15 phút tính từ lần thứ năm; thử đúng mật khẩu trong thời gian chặn vẫn bị từ chối. Thông báo phải là “Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút”.
- Tên không tồn tại cũng bị đếm và chặn; đổi hoa/thường không làm tách bộ đếm.
- Đăng nhập đúng sau ba lần sai đặt bộ đếm về không; hết thời gian chặn thì có thể đăng nhập đúng.
- Ghi nhớ mặc định chọn: hạn cố định 30 ngày. Bỏ chọn: hết khi đóng trình duyệt hoặc 12 giờ; hoạt động không kéo dài hạn.
- Người đã có phiên mở trang đăng nhập hoặc đăng ký được về Sảnh.

**Việc cần làm**

- Chuẩn bị tài khoản thật, tên giả và bộ dữ liệu tên khác hoa thường.
- Viết ca theo thứ tự có ghi rõ thời điểm sai lần đầu, lần thứ năm và hết chặn.
- Chạy sai/đúng và gọi máy chủ trực tiếp để xác minh không chỉ giao diện chặn.
- Kiểm mốc ngay trước/sau hết chặn, mốc phiên 12 giờ/30 ngày và đóng toàn trình duyệt.
- Kiểm tự chuyển Sảnh khi đã đăng nhập; kiểm việc làm mới khoá phiên không gia hạn.
- Ghi bằng chứng đã che mật khẩu/khoá phiên, báo lỗi và chạy lại sau sửa.

**Kết quả bàn giao**

- Bộ ca đăng nhập, khoá thử sai và hạn phiên.
- Báo cáo có thời điểm thử và kết quả thực tế.
- Lỗi có cách tái hiện và kết quả kiểm lại.

**Điều kiện hoàn thành**

- Tên giả và tên thật cùng bị chặn sau đúng điều kiện; không đăng nhập được bằng mật khẩu đúng trước hết chặn.
- Lần đăng nhập đúng hợp lệ xoá bộ đếm.
- Hạn phiên không trôi theo hoạt động.
- Mọi ca chưa thể chạy phải ghi bị chặn với nguyên nhân, không ghi đạt.

**Phạm vi và phối hợp**

Việc Google vẫn vào được mà không xoá bộ đếm và việc đăng nhập xong tự vào phòng mời được kiểm bổ sung khi các luồng liên quan đã tích hợp.

#### T35 · BE đăng ký/đăng nhập Google, onboarding, phiên Khách

**Mục tiêu**

Cho phép đăng ký, đăng nhập bằng Google và tạo phiên chơi Khách có quyền hạn rõ ràng.

**Bối cảnh công việc**

Supabase là dịch vụ quản lý đăng nhập của dự án. Xác thực Google chứng minh người dùng sở hữu email; ứng dụng vẫn yêu cầu hoàn tất tên đăng nhập và mật khẩu trước khi sử dụng tài khoản.

**Yêu cầu cần đáp ứng**

- Email Google chưa có tài khoản phải vào bước thiết lập tên đăng nhập và mật khẩu, không cần mã email. Tên đăng nhập dài 3–20 ký tự, gồm chữ cái Latin không dấu (a–z, A–Z), chữ số hoặc dấu gạch dưới, không phân biệt hoa thường khi kiểm trùng và không chứa từ cấm; mật khẩu ít nhất 8 ký tự.
- Hoàn tất hợp lệ thì tên hiển thị bằng tên đăng nhập, không lấy họ tên Google. Người dùng sau đó đăng nhập được bằng Google hoặc tên đăng nhập/mật khẩu đã đặt.
- Email đã thuộc tài khoản đăng ký bằng mật khẩu thì báo “Email này đã được đăng ký”, không tự gộp tài khoản. Tài khoản Google đã hoàn tất được đăng nhập thẳng vào ứng dụng.
- Bản Google tạm chưa hoàn tất quá 60 phút được dọn bằng kiểm tra mỗi 5 phút; không xoá tài khoản cũ, đã hoàn tất hoặc vừa hoàn tất. Chưa hoàn tất phải bị chặn sử dụng ứng dụng.
- Khách nhập tên 2–20 ký tự có dấu, không cần duy nhất, không chứa từ cấm; luôn có nhãn “(Khách)”. Phiên kéo dài tối đa 12 giờ nhưng không hết trong lúc đang ngồi ghế hoặc trong ván; chỉ được tạo một phòng đang mở.
- Google không bị chặn bởi khoá thử sai mật khẩu và đăng nhập Google thành công không xoá bộ đếm đó. Khách không có quyền kết bạn, nhận/gửi lời mời bạn bè hoặc sửa hồ sơ.

**Việc cần làm**

- Tích hợp Google thật và tạo phiên Khách; kiểm quyền tại máy chủ, dùng bộ lọc tên chung.
- Xây bước hoàn tất tài khoản, dọn bản tạm an toàn và dữ liệu hạn phiên Khách.
- Viết kiểm thử email trùng, tài khoản chưa hoàn tất, thời hạn dọn, tên cấm, đăng nhập kép và bộ đếm sai mật khẩu.

**Kết quả bàn giao**

- Dịch vụ Google/Khách và bằng chứng thử với tài khoản thật.

**Điều kiện hoàn thành**

- Không gộp tài khoản trùng email; Google không xoá khoá mật khẩu; tài khoản chưa hoàn tất không dùng ứng dụng được.

**Phạm vi và phối hợp**

Việc gia hạn ngoại lệ khi đang chơi và xoá dữ liệu khi phiên Khách kết thúc cần phối hợp quản lý phiên, phòng và chat; giao diện được làm riêng.

#### T44 · FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách

**Mục tiêu**

Dựng luồng đăng nhập Google và chơi Khách để người mới hoàn tất thiết lập hoặc vào chơi nhanh.

**Bối cảnh công việc**

Người chọn Google lần đầu vẫn cần đặt tên đăng nhập và mật khẩu. Người chọn Khách chỉ đặt tên tạm, được chơi nhưng không có quyền xã hội và hồ sơ như tài khoản chính thức.

**Yêu cầu cần đáp ứng**

- Đăng nhập và Đăng ký đều có nút Google. Khi máy chủ yêu cầu thiết lập lần đầu, hiện email chỉ đọc, tên đăng nhập và mật khẩu; không có mã xác nhận email và không có nút đóng bỏ qua thiết lập.
- Tên đăng nhập dài 3–20 ký tự gồm chữ cái Latin không dấu (a–z, A–Z), chữ số, dấu gạch dưới; mật khẩu ít nhất 8 ký tự. Hiện lỗi trùng tên hoặc từ cấm tại ô; máy chủ vẫn kiểm lại trước khi hoàn tất.
- Hoàn tất dùng tên hiển thị bằng tên đăng nhập. Email Google đã thuộc tài khoản mật khẩu phải hiện “Email này đã được đăng ký”; không hiển thị như đã tự liên kết thành công.
- Nút Guest mở hộp tên tạm 2–20 ký tự, cho phép dấu tiếng Việt, không cần duy nhất và không chứa từ cấm. Có Vào chơi/Huỷ; vào thành công luôn gắn “(Khách)” cạnh tên.
- Dưới nút Guest có ghi chú “Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ.” Elo là điểm xếp hạng thi đấu.
- Khi chọn Khách từ đường dẫn mời phòng, nhập tên xong tự vào đúng phòng theo ghế/chỗ xem còn lại. Bạn bè bị vô hiệu với giải thích đăng ký để kết bạn; ẩn thẻ Mời bạn bè và chức năng sửa hồ sơ không dành cho Khách.

**Việc cần làm**

- Dựng nút Google, màn hoàn tất thiết lập và hộp tên Khách, gồm trạng thái xử lý và lỗi.
- Nối phản hồi xác thực, điều hướng tới Sảnh hoặc phòng đang chờ và quy tắc ẩn chức năng theo vai trò.
- Thử tên biên, từ cấm, email trùng, đóng giữa thiết lập và mở lời mời trước đăng nhập.

**Kết quả bàn giao**

- Giao diện Google và Khách nối dịch vụ xác thực thật.

**Điều kiện hoàn thành**

- Không bỏ qua thiết lập Google; Khách có nhãn đúng và vào phòng mời không cần mở lại đường dẫn.

**Phạm vi và phối hợp**

Phần này không quyết định thời hạn phiên hoặc quyền trên máy chủ; không làm nâng cấp Khách trực tiếp thành tài khoản chính thức.

#### T48 · Kiểm thử US-01.3

**Mục tiêu**

Kiểm chứng đăng ký/đăng nhập Google và chơi Khách thật, bao gồm giới hạn tên và khoá thử sai mật khẩu.

**Bối cảnh công việc**

Chuẩn bị Google chưa đăng ký, Google đã hoàn tất và email đã tạo tài khoản bằng mật khẩu. Dùng nhiều trình duyệt và tài khoản thử riêng để tránh nhầm dữ liệu giữa các trường hợp.

**Yêu cầu cần đáp ứng**

- Google lần đầu phải tới thiết lập email chỉ đọc, tên đăng nhập và mật khẩu, không yêu cầu mã email. Thử tên trùng, sai định dạng và chứa từ cấm; tên cấm bị từ chối ngay ô nhập và khi gửi trực tiếp lên máy chủ.
- Hoàn tất hợp lệ thì tên hiển thị bằng tên đăng nhập, không lấy họ tên Google. Đăng xuất rồi vào lại bằng Google phải vào ngay; dùng tên đăng nhập/mật khẩu đã đặt cũng phải thành công.
- Google có email thuộc tài khoản mật khẩu phải báo “Email này đã được đăng ký”, không tự gộp. Bỏ dở thiết lập không có cách dùng ứng dụng qua đường dẫn khác; bản tạm quá 60 phút được dọn theo nhịp 5 phút, không xoá người vừa hoàn tất.
- Sai mật khẩu 5 lần làm khoá 15 phút; trong lúc khoá, Google vẫn đăng nhập được nhưng không xoá bộ đếm, mật khẩu đúng vẫn bị chặn đến hết hạn.
- Khách phải có ghi chú không được đánh Xếp hạng và không lưu lịch sử. Thử tên 2–20 ký tự có dấu, tên trùng được phép, tên ngoài độ dài hoặc chứa từ cấm bị từ chối. Tên luôn kèm “(Khách)”.
- Khách đang có một phòng mở không được tạo phòng thứ hai. Mở lời mời lúc chưa đăng nhập rồi chọn Khách phải tự vào đúng phòng theo ghế/chỗ xem còn lại, không mở đường dẫn lần hai.

**Việc cần làm**

- Viết tình huống với dữ liệu email/tên rõ ràng và kết quả mong đợi; không dùng xác thực Google giả làm bằng chứng.
- Chạy luồng thật, kiểm bản tạm và thử yêu cầu vượt giao diện; dùng thời gian kiểm soát được cho bài hết hạn.
- Ghi bằng chứng, lỗi và kết quả kiểm lại sau sửa.

**Kết quả bàn giao**

- Báo cáo kiểm Google, tên Khách, giới hạn tạo phòng và giữ đích lời mời.

**Điều kiện hoàn thành**

- Không tự gộp tài khoản; không vượt bước thiết lập; Google không xoá khoá mật khẩu; tên cấm bị máy chủ chặn.

**Phạm vi và phối hợp**

Ngoại lệ giữ phiên Khách khi đang chơi và xoá dữ liệu khi phiên kết thúc được nghiệm thu sau khi quản lý phiên, phòng và chat tích hợp đầy đủ.

#### T56 · BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất

**Mục tiêu**

Thực thi thời hạn đăng nhập, một vị trí chơi và việc cập nhật hồ sơ tại máy chủ.

**Bối cảnh công việc**

Một tài khoản có thể có nhiều cửa sổ hiển thị nhưng chỉ được chiếm một vị trí chơi. Máy chủ quyết định quyền điều khiển, hạn đăng nhập và hậu quả khi đổi thiết bị; không dựa riêng vào việc nút trên giao diện bị khoá.

**Yêu cầu cần đáp ứng**

- Phiên có Ghi nhớ đăng nhập hết hạn cố định sau 30 ngày; không ghi nhớ thì khi đóng trình duyệt hoặc sau 12 giờ, tuỳ điều kiện nào đến trước. Làm mới thông tin xác thực không gia hạn mốc đã tạo.
- Hết phiên trong ván online: mất quyền điều khiển, yêu cầu đăng nhập lại và giữ ván 60 giây trong khi đồng hồ vẫn chạy. Ván với máy được giữ 30 phút để cùng thiết bị quay lại.
- Đăng nhập từ thiết bị khác khi đang đấu làm ván hiện tại bị xử thua, thiết bị cũ bị đăng xuất, thiết bị mới vào Sảnh. Nếu chỉ ngồi phòng chờ thì rời ghế theo vòng đời phòng, không ghi kết quả thua.
- Chặn ngồi ghế hoặc mở ván với máy thứ hai; mở lời mời không được vượt kiểm tra này. Đăng xuất khi đang đấu phải xác nhận đầu hàng, còn ở phòng chờ thì rời phòng rồi đăng xuất.
- Khách không xuất hiện trong tìm kiếm bạn bè và không nhận lời mời kết bạn. Hồ sơ chính thức cho đổi Tên hiển thị dài 2–30 ký tự, từ chối từ cấm; email chỉ đọc. Hồ sơ Khách chỉ có Đăng xuất.

**Việc cần làm**

- Lưu mốc hết hạn, thiết bị và vị trí chơi đang giữ; xử lý đăng nhập, hết hạn, rời ghế và kết thúc ván nhất quán.
- Cung cấp trạng thái ván đang dở và lý do không được vào chỗ mới để giao diện hiển thị; cập nhật Tên hiển thị phải kiểm lại dữ liệu ở máy chủ.
- Viết kiểm thử thời hạn cố định, đổi thiết bị khi chờ hoặc đang đấu, vào chỗ thứ hai và sửa hồ sơ bằng yêu cầu gửi trực tiếp.

**Kết quả bàn giao**

- Dịch vụ quản lý phiên, vị trí chơi và cập nhật hồ sơ; kiểm thử tự động và kết quả thử hai thiết bị.

**Điều kiện hoàn thành**

- Không có hai vị trí chơi có quyền điều khiển đồng thời; kết quả thua chỉ phát sinh đúng trường hợp đã quy định.
- Hạn phiên không trượt theo hoạt động; dữ liệu hồ sơ sai bị từ chối cả khi bỏ qua giao diện.

**Phạm vi và phối hợp**

Công việc xử lý phía máy chủ. Thông báo, hộp xác nhận và màn hồ sơ được giao cho phần giao diện; phần giữ trạng thái ván phối hợp với xử lý nối lại và ván với máy.

#### T65 · FE Cài đặt hồ sơ, Đăng xuất, banner ván dở

**Mục tiêu**

Tạo màn hồ sơ, thao tác đăng xuất và lối quay lại ván đang dở.

**Bối cảnh công việc**

Người dùng cần phân biệt Tên đăng nhập dùng để vào tài khoản với Tên hiển thị người khác nhìn thấy. Giao diện sử dụng thông tin phiên và hồ sơ từ máy chủ, đồng thời giải thích vì sao không được mở thêm một ván khác.

**Yêu cầu cần đáp ứng**

- Hồ sơ chính thức hiển thị ảnh đại diện bằng chữ cái đầu, Tên đăng nhập, email chỉ đọc và ô Tên hiển thị. Cho lưu tên dài 2–30 ký tự hợp lệ, từ chối từ cấm với lỗi tại ô; không yêu cầu mã xác minh.
- Không có đổi Tên đăng nhập, đổi email, tải ảnh đại diện hoặc bộ chọn giao diện trong màn này. Tên mới hiển thị trên thanh điều hướng và cập nhật trong phòng theo dữ liệu máy chủ.
- Nếu đang có phòng hoặc ván chưa kết thúc, Sảnh hiện “Bạn có ván đang chơi dở — Quay lại” dẫn về đúng nơi. Nút mở chỗ chơi khác không bấm được, có chú thích “Bạn đang ở trong một ván/phòng khác”.
- Đăng xuất khi đang đấu phải nêu hậu quả đầu hàng và có Đồng ý, Huỷ. Huỷ giữ nguyên ván; đồng ý chờ máy chủ xử lý rồi về Đăng nhập. Ở phòng chờ thì rời phòng theo đúng vòng đời và đăng xuất.
- Khách không có phần sửa hồ sơ: Cài đặt chỉ có Đăng xuất; Bạn bè không bấm được với lời nhắc đăng ký tài khoản, mục mời bạn bè bị ẩn nhưng chia sẻ mã và đường dẫn vẫn còn.

**Việc cần làm**

- Xây màn hồ sơ và thông báo ván dở, gồm trạng thái đang tải, đang lưu, thành công và thất bại. Không ghi tên mới như đã lưu nếu máy chủ từ chối.
- Nối thao tác lưu, quay lại và đăng xuất với máy chủ; giữ đúng đường dẫn ván thay vì mở một ván mới.
- Kiểm tên có dấu, độ dài biên, tên bị cấm, lỗi mạng lúc lưu và các hoàn cảnh đăng xuất bằng tài khoản chính thức lẫn Khách.

**Kết quả bàn giao**

- Màn Cài đặt hồ sơ, thông báo quay lại ván và hộp xác nhận đăng xuất tích hợp thật.

**Điều kiện hoàn thành**

- Tên hợp lệ được lưu và hiển thị nhất quán; tên không hợp lệ có thông báo rõ, email không sửa được.
- Quay lại đúng ván; huỷ đăng xuất không làm thay đổi kết quả hoặc mất chỗ chơi.

**Phạm vi và phối hợp**

Máy chủ vẫn kiểm quyền, dữ liệu và thời hạn phiên; giao diện không tự quyết định đầu hàng hay giải phóng vị trí chơi.

#### T69 · Kiểm thử US-01.4

**Mục tiêu**

Kiểm chứng phiên đăng nhập, giới hạn một vị trí chơi và hồ sơ cá nhân.

**Bối cảnh công việc**

Chuẩn bị cùng một tài khoản trên hai thiết bị, tài khoản đối thủ, phiên Khách và ván với máy. Phân biệt mở thêm thẻ trong cùng trình duyệt với đăng nhập từ thiết bị khác. Có dữ liệu thử gần hạn phiên để kiểm thời hạn mà không phải chờ nhiều ngày.

**Yêu cầu cần đáp ứng**

- Hoạt động hoặc làm mới khoá phiên không gia hạn đăng nhập. Hết phiên khi online ngắt quyền, yêu cầu đăng nhập lại, giữ 60 giây và đồng hồ chạy; với máy giữ 30 phút. Đăng nhập lại cùng thiết bị trong hạn tiếp tục được.
- Đăng nhập thiết bị khác trong ván online hoặc với máy: xử thua ngay, thiết bị cũ đăng xuất, thiết bị mới vào Sảnh. Đang phòng chờ thì rời ghế/chuyển chủ theo vòng đời, không tạo thua.
- Đang giữ ghế hoặc ván với máy thì không mở thêm vị trí; Tạo phòng/Vào chơi/Đánh với máy/mã/link khác đều bị máy chủ kiểm. Nút bị vô hiệu báo “Bạn đang ở trong một ván/phòng khác”.
- Sảnh có “Bạn có ván đang chơi dở — Quay lại”, dẫn đúng phòng/ván. Đăng xuất trong ván online có xác nhận đầu hàng: đồng ý kết thúc/rời/đăng xuất, huỷ giữ nguyên; phòng chờ rời rồi đăng xuất, không xử thua.
- Tên hiển thị 2–30 ký tự hợp lệ được lưu không cần mã xác minh, hiện trên thanh điều hướng và trong phòng lần cập nhật kế tiếp. Sai độ dài hoặc từ cấm bị từ chối tại ô, không che bằng dấu sao rồi lưu.
- Hồ sơ có ảnh chữ cái đầu, tên đăng nhập và email chỉ đọc; không đổi tên đăng nhập hoặc chọn giao diện. Đăng xuất tại hồ sơ vẫn theo hậu quả đang đấu/chờ.
- Khách: Bạn bè vô hiệu với “Đăng ký tài khoản để kết bạn”; mục mời bạn ẩn nhưng link/mã còn; cài đặt chỉ Đăng xuất. Khách không xuất hiện khi tìm bạn và không nhận lời mời bạn bè.

**Việc cần làm**

- Chuẩn bị tài khoản trên hai thiết bị, đối thủ và ván với máy; đặt hạn phiên thử gần hết để kiểm các mốc có thể lặp lại.
- Thử hoạt động/làm mới khoá phiên và hết hạn ở online/với máy; đăng nhập lại cùng thiết bị rồi thử thiết bị khác.
- Thử mở vị trí thứ hai bằng mọi đường vào; từ Sảnh bấm Quay lại và kiểm đăng xuất đồng ý/huỷ ở phòng chờ và trong ván.
- Thử tên hiển thị dài 1/2/30/31 ký tự, từ cấm, tài khoản Khách và gọi sửa hồ sơ trực tiếp.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

### EP-02 · Tạo phòng

#### T18 · BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host

**Mục tiêu**

Xây dựng xử lý phòng chờ để người dùng tạo phòng, chọn ghế, cùng sẵn sàng và bắt đầu một ván mới một cách nhất quán.

**Bối cảnh công việc**

Phòng gồm hai ghế và tối đa năm người xem. Người tạo là chủ; máy chủ quản lý ghế và bắt đầu ván.

**Yêu cầu cần đáp ứng**

- Form tạo nhận tên 1–60 ký tự qua lọc từ cấm, mức giờ 5/10/15 phút mặc định 10, số người xem 0–5 mặc định 5. Không đổi mức giờ hoặc trần người xem sau tạo.
- Phòng mới mặc định chỉ vào bằng mã/đường dẫn, chưa công khai; máy chủ sinh mã 8 ký tự và đường dẫn, người tạo ngồi Đỏ.
- Chỉ một người ngồi ghế thì chủ phòng đổi Đỏ/Đen tự do. Khi đủ hai người, đổi phe phải qua chức năng xin đổi bên riêng.
- Mỗi người bật/tắt Sẵn sàng. Hai người cùng sẵn sàng mới đếm 3–2–1; trước tạo ván phải kiểm lại ghế, kết nối và trạng thái sẵn sàng.
- Mất mạng khi đếm thì huỷ, đặt lại sẵn sàng hai bên, giữ ghế 60 giây, không tạo ván hoặc xử thua. Thay người ngồi cũng đặt lại sẵn sàng.
- Chủ phòng rời khi còn người chơi thì chuyển quyền; không còn người ngồi ghế thì đóng phòng, thông báo “Phòng đã đóng” cho người xem. Một chủ phòng ngồi lâu không tự bị đóng. Nếu chủ phòng mất kết nối ở phòng chờ thì giữ ghế 60 giây; hết hạn làm mất ghế, và phòng đóng nếu không còn ai ngồi ghế. Đóng phòng phải phát thông tin để xoá chat và thu hồi quyền hình tiếng.
- Một người không được ngồi ghế ở nhiều nơi; Khách chỉ tạo tối đa một phòng đang mở.

**Việc cần làm**

- Tạo xử lý tạo phòng, mã/đường dẫn và dữ liệu ghế.
- Kiểm dữ liệu đầu vào và vị trí chơi hiện có ở máy chủ.
- Thực hiện đổi ghế đơn, sẵn sàng, đếm ngược và sự kiện bắt đầu ván mới.
- Xử lý thay người, rời phòng, chuyển chủ và đóng phòng.
- Thử hai người gửi sẵn sàng/rời gần nhau, mất mạng trong đếm và thời gian chờ dài.
- Bàn giao sự kiện cho giao diện, ván, chat và thu hồi hình tiếng khi rời ghế.

**Kết quả bàn giao**

- Dịch vụ phòng chờ và sự kiện thay đổi trạng thái.
- Kiểm thử tích hợp các nhánh ghế, đếm và đóng phòng.

**Điều kiện hoàn thành**

- Phòng mới có thông số đúng và chủ ngồi Đỏ; không vượt sức chứa 2 cộng trần người xem.
- Không tạo ván khi thiếu người hoặc mất kết nối trong đếm.
- Chuyển chủ đúng, phòng cuối cùng không còn người chơi được đóng.
- Yêu cầu tạo thêm vị trí chơi hoặc phòng Khách trái giới hạn bị từ chối.

**Phạm vi và phối hợp**

Bàn giao phòng chờ và tín hiệu bắt đầu ván. Xin đổi bên hai người, chế độ công khai/khóa, chat và hình tiếng dùng sự kiện này để bổ sung hành vi của mình.

#### T21 · FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược

**Mục tiêu**

Tạo hộp tạo phòng và màn phòng chờ để người chơi hiểu ai đang ngồi ghế, chọn phe khi một mình và cùng xác nhận bắt đầu.

**Bối cảnh công việc**

Phòng chờ dùng chung địa chỉ phòng với lúc thi đấu nhưng có trạng thái và thao tác khác. Các thay đổi phải hiển thị theo máy chủ cho cả hai người, không tự bắt đầu ván chỉ vì bộ đếm trên trình duyệt hết.

**Yêu cầu cần đáp ứng**

- Hộp tạo có tên phòng, mức giờ 5/10/15 phút mặc định 10 và số người xem 0–5 mặc định 5.
- Tên rỗng, hơn 60 ký tự hoặc chứa từ cấm báo lỗi tại ô, không tạo phòng.
- Tạo thành công vào phòng chờ, hiện chủ phòng ngồi Đỏ, ghế còn lại, mã/đường dẫn và thông số đã chọn.
- Chỉ có một người ngồi ghế thì hiện “Đổi ghế”; đủ hai người thì ẩn thao tác đổi tự do để dùng đề nghị đổi bên riêng.
- Mỗi người thấy trạng thái Sẵn sàng của hai bên theo thời gian thực, có thể bật/tắt của mình.
- Cả hai sẵn sàng hiện 3–2–1 có âm thanh; mất kết nối hoặc thay ghế cập nhật huỷ/đặt lại theo máy chủ.
- Khung chờ tải, lỗi, trống và nút bị vô hiệu phải có lời giải thích; thông số giờ/trần người xem không có chức năng sửa sau tạo.

**Việc cần làm**

- Dựng biểu mẫu bằng thành phần chung và nối xử lý tạo phòng.
- Hiển thị ghế, phe, chủ phòng, thông số và các nút điều khiển theo vai trò.
- Nối sự kiện người vào/rời, đổi ghế và sẵn sàng; không cho giao diện tự cấp ghế.
- Thêm đếm ngược và chỉ chuyển sang bàn đấu khi máy chủ xác nhận ván mới.
- Bố trí vùng gắn chat/hình tiếng ở phòng chờ để các phần đó hoạt động liên tục khi vào ván.
- Kiểm hai cửa sổ với thao tác sẵn sàng, huỷ, đổi ghế và rời.

**Kết quả bàn giao**

- Hộp tạo phòng và màn phòng chờ nối máy chủ thật.
- Các trạng thái giao diện và đếm ngược.
- Bằng chứng thử bằng hai người.

**Điều kiện hoàn thành**

- Form mặc định đúng; dữ liệu sai hiện lỗi và không tạo phòng.
- Hai người thấy cùng ghế và trạng thái sẵn sàng.
- Chủ ở một mình đổi được phe, có người thứ hai thì không còn nút đổi tự do.
- Huỷ đếm không tạo màn ván giả; chuyển chủ hiện đúng sau khi chủ cũ rời.

**Phạm vi và phối hợp**

Bàn giao giao diện nền của phòng chờ. Đề nghị đổi bên, khung chat/hình tiếng và điều khiển người xem được nối ở phần chức năng tương ứng, không dựng giả để coi đã hoàn tất.

#### T28 · Kiểm thử US-02.1

**Mục tiêu**

Kiểm chứng tạo phòng, chọn ghế và bắt đầu ván đúng quy tắc trước khi người dùng chơi trực tuyến.

**Bối cảnh công việc**

Chuẩn bị người tạo phòng, người chơi thứ hai và người xem. Thực hiện qua giao diện thật và đối chiếu trạng thái máy chủ, tránh chỉ thử bằng dữ liệu dựng sẵn.

**Yêu cầu cần đáp ứng**

- Biểu mẫu tạo phòng nhận tên dài 1–60 ký tự, mức giờ 5/10/15 phút mặc định 10, số người xem từ không có đến 5 mặc định 5. Thử tên rỗng, quá dài và chứa từ cấm; các giá trị sai phải bị từ chối tại ô nhập.
- Phòng mới chỉ cho vào bằng mã hoặc đường dẫn, có mã 8 ký tự, người tạo làm chủ và ngồi Đỏ. Tổng sức chứa bằng 2 cộng số chỗ xem, tối đa 7. Sau khi tạo không có chức năng đổi mức giờ hoặc trần người xem.
- Khi chỉ chủ phòng ngồi ghế, đổi Đỏ/Đen tự do. Khi đủ hai người, trạng thái Sẵn sàng hoặc huỷ Sẵn sàng phải cập nhật cho cả phòng; thay người ngồi ghế làm cả hai trở về chưa sẵn sàng.
- Cả hai sẵn sàng thì đếm 3…2…1 kèm âm thanh. Máy chủ kiểm lại ghế, kết nối và trạng thái sẵn sàng rồi mới tạo ván mới; giao diện chuyển sang bàn đấu và đồng hồ Đỏ bắt đầu.
- Chủ phòng rời lúc còn người chơi thứ hai thì người đó nhận quyền chủ phòng. Chủ phòng ngồi chờ lâu một mình không bị tự đóng phòng.

**Việc cần làm**

- Viết tình huống tại các ranh giới độ dài tên, số chỗ xem và hai trường hợp đổi ghế.
- Chạy tạo phòng và bắt đầu ván nhiều lần; đối chiếu mã ván mới và đồng hồ.
- Ghi lỗi cùng dữ liệu tái hiện; kiểm lại sau sửa và phân biệt rõ trường hợp chưa có điều kiện kiểm.

**Kết quả bàn giao**

- Báo cáo kiểm tạo phòng, sức chứa, ghế, sẵn sàng và chuyển chủ phòng.

**Điều kiện hoàn thành**

- Các nhánh nêu trên đạt với máy chủ và giao diện thật, gồm kiểm tên bằng bộ lọc chung.

**Phạm vi và phối hợp**

Nhánh rớt mạng khi đếm và đóng phòng phải xoá chat được kiểm hoàn chỉnh trong đợt hồi quy sau khi chức năng kết nối và chat sẵn sàng.

#### T41 · BE Xin đổi bên và phòng về chờ sau ván

**Mục tiêu**

Xử lý xin đổi bên và vòng đời phòng sau ván để hai người có thể tiếp tục chơi mà không tạo phòng mới.

**Bối cảnh công việc**

Phòng tự tạo có chủ phòng và hai ghế Đỏ/Đen. Khi ván đã kết thúc, phòng trở về chờ ngay; hộp kết quả chỉ là phần hiển thị, không phải trạng thái giữ phòng riêng.

**Yêu cầu cần đáp ứng**

- Khi đang chờ và đủ hai người ngồi ghế, mỗi người được gửi đề nghị đổi bên. Người nhận có 30 giây Đồng ý/Từ chối; người gửi được Rút đề nghị và chỉ có tối đa một đề nghị chờ.
- Đồng ý thì hoán đổi hai ghế và đưa cả hai về chưa sẵn sàng. Từ chối hoặc hết hạn buộc người gửi chờ 60 giây mới gửi lại. Bắt đầu đếm vào ván hoặc thay đổi người ngồi ghế phải huỷ đề nghị chờ.
- Không cho xin đổi bên khi đang đếm 3…2…1 hoặc đang đấu. Khi chỉ còn một người ngồi ghế, dùng đổi ghế tự do; không cần đối thủ duyệt.
- Kết thúc ván, kể cả ván bị gián đoạn do máy chủ khởi động lại, phòng về chờ và xoá trạng thái sẵn sàng. Giữ nguyên ghế/phe, chủ phòng, người xem, chế độ phòng, mức giờ và chat theo cặp hiện tại.
- Hai người sẵn sàng lại thì tạo ván có mã mới và đặt đồng hồ đầy đủ. Một người rời làm trống ghế; nếu là chủ phòng thì chuyển chủ cho người còn lại. Phòng đang khoá vẫn giữ khoá.
- Không tự đóng phòng sau 10 phút hoặc do chờ lâu; chỉ đóng khi không còn người ngồi ghế, đưa người xem về Sảnh và xoá chat phòng.

**Việc cần làm**

- Xây các thao tác gửi/rút/trả lời đổi bên và bộ đếm thời hạn phía máy chủ.
- Kết nối sự kiện kết thúc ván với trạng thái phòng chờ, bảo toàn dữ liệu cần giữ.
- Kiểm đề nghị quá hạn, đổi ghế, đếm bắt đầu, người rời và hai ván liên tiếp.

**Kết quả bàn giao**

- Xử lý đổi bên và phòng sau ván, kèm kiểm thử vòng đời.

**Điều kiện hoàn thành**

- Không còn đề nghị cũ sau đổi thành phần ghế; ván tiếp theo có mã mới; phòng không tự đóng khi còn người chơi.

**Phạm vi và phối hợp**

Không thêm nút tái đấu nhanh; người chơi dùng Sẵn sàng và Xin đổi bên để bắt đầu ván tiếp theo.

#### T46 · FE hộp Xin đổi bên, Ở lại phòng / Rời phòng

**Mục tiêu**

Dựng thao tác Xin đổi bên và lựa chọn sau ván để người chơi tiếp tục trong cùng phòng.

**Bối cảnh công việc**

Phòng đang chờ có thể có một hoặc hai người ngồi ghế. Sau khi kết thúc ván, phòng đã trở lại chờ; hộp kết quả giúp người chơi chọn ở lại hay rời đi.

**Yêu cầu cần đáp ứng**

- Chỉ một người ngồi ghế thì có Đổi ghế tự do. Khi đủ hai người, ẩn Đổi ghế và hiện Xin đổi bên cho hai người chơi; người xem không có các thao tác này.
- Người nhận đề nghị đổi bên thấy Đồng ý/Từ chối và đếm 30 giây. Người gửi thấy đang chờ và Rút đề nghị; không gửi thêm đề nghị khi đang chờ.
- Đồng ý làm đổi ghế và cả hai trở về chưa sẵn sàng theo dữ liệu máy chủ. Từ chối hoặc hết hạn làm nút xin lại bị vô hiệu trong 60 giây, giải thích thời gian còn chờ.
- Ẩn Xin đổi bên trong lúc đếm 3…2…1 hoặc đang đấu. Khi máy chủ huỷ đề nghị vì bắt đầu đếm hay đổi người ngồi ghế, đóng trạng thái chờ ở cả hai phía.
- Hộp kết quả trực tuyến có đúng Ở lại phòng/Rời phòng, kể cả ván bị gián đoạn do máy chủ khởi động lại. Không có Tái đấu/Xem lại và không hiển thị đếm đóng phòng sau 10 phút.
- Ở lại phòng đưa người chơi về giao diện chờ, giữ phe và các thông tin phòng. Rời phòng cập nhật ghế trống và chủ phòng theo phản hồi máy chủ; không tự đổi chế độ khoá.

**Việc cần làm**

- Dựng nút theo số người, hộp nhận đề nghị, trạng thái phía gửi và đồng hồ chờ.
- Nối kết quả đổi bên và lựa chọn sau ván; xử lý cập nhật máy chủ đến trong khi hộp đang mở.
- Thử bằng hai trình duyệt: đồng ý, từ chối, hết hạn, rút, bắt đầu đếm và một người rời.

**Kết quả bàn giao**

- Giao diện đổi bên và kết quả sau ván tích hợp với phòng chờ.

**Điều kiện hoàn thành**

- Hai bên thấy cùng trạng thái ghế/sẵn sàng; không còn đề nghị cũ khi máy chủ đã huỷ; lựa chọn sau ván đúng.

**Phạm vi và phối hợp**

Phần này không tạo cơ chế tái đấu mới và không tự xử thời hạn; máy chủ quản lý đổi ghế, mã ván và vòng đời phòng.

#### T50 · Kiểm thử US-02.2

**Mục tiêu**

Kiểm chứng xin đổi phe và bắt đầu ván tiếp theo trong cùng phòng.

**Bối cảnh công việc**

Chuẩn bị hai người chơi cùng một người xem trong phòng tự tạo. Có thế cờ gần kết thúc để chuyển nhanh từ đang đấu sang chờ; giữ lại thông tin ghế, đồng hồ và người xem nhằm đối chiếu trước và sau thao tác.

**Yêu cầu cần đáp ứng**

- Khi phòng chờ đủ hai người, kể cả sau ván, cả hai có Xin đổi bên; người xem không có. Chỉ một chủ ngồi thì có Đổi ghế tự do; người thứ hai vào thì thay bằng Xin đổi bên, rời thì Đổi ghế xuất hiện lại.
- Gửi đề nghị: người nhận có Đồng ý/Từ chối và hạn 30 giây; người gửi thấy đang chờ và Rút đề nghị. Người gửi không tạo được đề nghị chờ thứ hai.
- Đồng ý hoán đổi Đỏ/Đen, đặt lại Sẵn sàng của cả hai. Từ chối hoặc hết 30 giây thì người gửi phải chờ 60 giây mới gửi lại, giao diện nêu thời gian còn lại.
- Bắt đầu đếm hoặc đổi thành phần ghế tự huỷ đề nghị. Trong đếm 3–2–1 và trong ván không có Xin đổi bên.
- Kết thúc ván phòng tự tạo về chờ ngay, đặt lại Sẵn sàng; kết quả chỉ có Ở lại phòng/Rời phòng, không Tái đấu hoặc Xem lại.
- Hai người Sẵn sàng tạo ván mới với mã mới và đồng hồ đầy đủ theo phòng. Không ai rời sau ván thì quá 10 phút phòng vẫn tồn tại.

**Việc cần làm**

- Tạo phòng có hai người chơi, một người xem; thử trạng thái một ghế rồi đủ hai ghế để đối chiếu hai nút đổi phe.
- Chạy riêng đồng ý, từ chối, hết hạn, rút và bấm trùng; ghi thời điểm 30 giây và 60 giây cùng trạng thái sẵn sàng.
- Gửi đề nghị rồi bắt đầu đếm hoặc cho một người rời, kiểm đề nghị bị huỷ cả hai phía.
- Kết thúc ván, ở lại hơn 10 phút rồi sẵn sàng vào ván mới; đối chiếu mã ván, đồng hồ, ghế và các nút kết quả.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

### EP-03 · Mời vào phòng

#### T22 · BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập

**Mục tiêu**

Cho người dùng vào đúng phòng bằng mã hoặc đường dẫn và tự tiếp tục sau đăng nhập, đồng thời máy chủ xếp vai trò theo chỗ còn trống.

**Bối cảnh công việc**

Người nhận đường dẫn không cần kết bạn với chủ. Giữ đích phòng qua đăng nhập, đăng ký hoặc vào Khách.

**Yêu cầu cần đáp ứng**

- Mã 8 ký tự và đường dẫn cho cùng quyền tham gia; kiểm mã/phòng còn hiệu lực trên máy chủ.
- Còn ghế thì xếp ngay vào ghế trống đúng phe đối diện người đang ngồi.
- Hai ghế kín thì vào làm người xem nếu còn chỗ, báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.”
- Đủ sức chứa hoặc không cho xem và đã kín ghế thì từ chối, báo “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!”.
- Mã sai hoặc phòng đóng báo “Mã phòng không tồn tại hoặc phòng đã đóng”.
- Chưa đăng nhập thì giữ đích phòng; sau xác thực thành công tự thử vào, không yêu cầu bấm đường dẫn lần nữa.
- Trước khi vào phải kiểm vị trí chơi hiện có, khoá phòng và danh sách người bị chặn; người đang chơi không được tạo thêm vị trí. Khi các chức năng khoá/chặn được nối vào, chúng phải áp dụng cho cả mã và đường dẫn.

**Việc cần làm**

- Tạo xử lý tra mã/đường dẫn về phòng và kiểm hiệu lực.
- Xếp ghế hoặc vai trò xem trong một thao tác nhất quán để hai yêu cầu gần nhau không chiếm cùng chỗ.
- Trả vai trò, trạng thái và lời báo phù hợp cho giao diện.
- Thiết kế dữ liệu giữ đích qua đăng nhập/đăng ký/Khách mà không bỏ qua kiểm quyền lúc quay lại.
- Viết thử ghế trống, ghế kín còn xem, đầy, phòng không cho xem và mã sai.
- Thử hai yêu cầu cùng ghế và tình huống phòng đổi trạng thái trong lúc người dùng đăng nhập.

**Kết quả bàn giao**

- Xử lý tham gia bằng mã/đường dẫn.
- Cơ chế giữ đích sau xác thực.
- Kiểm tích hợp phân vai và sức chứa.

**Điều kiện hoàn thành**

- Người chưa kết bạn vẫn vào phòng hợp lệ.
- Chỉ một người nhận ghế cuối khi yêu cầu gần nhau; người còn lại được xếp xem hoặc từ chối đúng sức chứa.
- Hoàn tất đăng nhập quay lại đúng phòng nhưng vẫn kiểm lại phòng/quyền hiện thời.
- Luật phiên được ưu tiên: đăng nhập thiết bị khác đang có ván không bị chuyển thẳng vào phòng mời bỏ qua xử lý ván cũ.

**Phạm vi và phối hợp**

Bàn giao xử lý cho giao diện nhập mã/chia sẻ và lối vào Sảnh. Công khai, khóa và chặn người xem có phần triển khai riêng nhưng phải dùng cùng kiểm quyền tham gia.

#### T26 · FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập

**Mục tiêu**

Cho người dùng chia sẻ phòng bằng đường dẫn hoặc mã và vào đúng phòng sau đăng nhập.

**Bối cảnh công việc**

Người được mời không bắt buộc là bạn của chủ phòng. Hai người ngồi ghế mới thấy nút Chia sẻ phòng; người xem chỉ theo dõi và không có nút này.

**Yêu cầu cần đáp ứng**

- Hộp Chia sẻ phòng hiển thị đường dẫn, mã 8 ký tự và nút Sao chép cho từng nội dung. Mã dùng kiểu chữ có các ký tự rộng bằng nhau để dễ đọc; chưa có mã quét bằng camera.
- Sảnh có ô nhập mã. Khi mở đường dẫn lúc chưa đăng nhập, giữ lại đích đến trong quá trình đăng nhập hoặc đăng ký để tự vào phòng, không bắt mở lời mời lần nữa.
- Dùng kết quả phân chỗ từ máy chủ: còn ghế thì ngồi ghế trống; đủ hai ghế và còn chỗ xem thì vào xem; phòng đầy thì từ chối. Không tự quyết định vai trò dựa vào thông tin cũ trên trình duyệt.
- Khi chuyển sang người xem, báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.” Phòng đầy báo “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!” và có nút “Quay về Sảnh chính”. Mã sai hoặc phòng đóng báo “Mã phòng không tồn tại hoặc phòng đã đóng”.

**Việc cần làm**

- Dựng hộp chia sẻ, thao tác sao chép và ô nhập mã; có phản hồi thành công hoặc lỗi dễ hiểu.
- Nối luồng vào phòng và chuyển hướng sau xác thực; khoá thao tác lặp khi đang xử lý.
- Kiểm đường dẫn trên hai trình duyệt, gồm đăng ký mới, đăng nhập lại, ghế vừa được người khác lấy và phòng không còn mở.

**Kết quả bàn giao**

- Giao diện chia sẻ và vào phòng nối máy chủ thật, xử lý đầy đủ thông báo và đường quay về Sảnh.

**Điều kiện hoàn thành**

- Người chưa kết bạn vào được bằng mã hoặc đường dẫn hợp lệ; vai trò và thông báo khớp sức chứa thực tế.

**Phạm vi và phối hợp**

Phần này phụ trách giao diện đường dẫn và mã; danh sách bạn bè để gửi lời mời trong ứng dụng là phần việc riêng.

#### T29 · Kiểm thử US-03.1

**Mục tiêu**

Kiểm chứng lời mời bằng đường dẫn hoặc mã đưa người dùng vào đúng phòng, đúng vai trò.

**Bối cảnh công việc**

Dùng ít nhất hai tài khoản chưa kết bạn và nhiều cửa sổ trình duyệt. Chuẩn bị phòng còn ghế, phòng đủ ghế còn chỗ xem, phòng đầy, phòng không cho xem và phòng đã đóng.

**Yêu cầu cần đáp ứng**

- Người ngồi ghế mở Chia sẻ phòng phải thấy đường dẫn và mã 8 ký tự cùng nút sao chép. Nội dung sao chép phải dùng được; không có chức năng mã quét bằng camera.
- Người đã đăng nhập mở đường dẫn hoặc nhập mã phải vào được, không bị yêu cầu kết bạn. Khi chủ phòng ngồi Đỏ, người mới vào ghế Đen; đổi chủ phòng sang ghế Đen rồi thử lại để kiểm chiều ngược lại.
- Người chưa đăng nhập mở lời mời phải được dẫn tới đăng nhập hoặc đăng ký; hoàn tất xong tự vào phòng ban đầu. Thử cả người có tài khoản và người tạo tài khoản bằng email mới.
- Đủ hai người chơi nhưng còn chỗ xem thì người mới thành người xem, có thông báo “Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem.”
- Phòng đầy hoặc không cho xem mà đã đủ hai ghế phải hiện “Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!” và nút “Quay về Sảnh chính”. Mã sai hoặc phòng đã đóng phải báo “Mã phòng không tồn tại hoặc phòng đã đóng”.

**Việc cần làm**

- Ghi tiền điều kiện, cách tạo phòng và sức chứa cho từng trường hợp để người khác chạy lại được.
- Thử vào bằng cả đường dẫn và mã, gồm việc phòng đổi số người trong lúc người được mời đang đăng nhập.
- Lưu kết quả, ảnh thông báo và lỗi chuyển hướng; kiểm lại mọi lỗi đã sửa.

**Kết quả bàn giao**

- Bộ tình huống mời bằng đường dẫn/mã và báo cáo kết quả theo từng vai trò.

**Điều kiện hoàn thành**

- Không cần mở lời mời lần hai sau xác thực; máy chủ quyết định ghế hoặc chỗ xem theo trạng thái hiện tại.

**Phạm vi và phối hợp**

Luồng chọn chế độ Khách từ lời mời được kiểm chuyên biệt trong phần kiểm Google và Khách; kiểm lời mời bạn bè trong ứng dụng là phần riêng.

#### T31 · BE bạn bè, trạng thái online, mời bạn online vào phòng

**Mục tiêu**

Xây dựng xử lý phía máy chủ cho kết bạn, trạng thái hoạt động và mời bạn vào phòng.

**Bối cảnh công việc**

Tài khoản chính thức có tên đăng nhập để tìm nhau; Khách không dùng chức năng bạn bè. Lời mời kết bạn và lời mời vào phòng là hai loại khác nhau, có thời hạn và cách lưu riêng.

**Yêu cầu cần đáp ứng**

- Tìm theo phần đầu tên đăng nhập, không phân biệt hoa thường, không trả về Khách. Hỗ trợ gửi, chấp nhận, từ chối, thu hồi lời mời và huỷ kết bạn. Lời mời kết bạn hết hạn sau 30 ngày; giới hạn 200 bạn và 50 lời mời đang chờ gồm gửi và nhận.
- Bị cùng một người từ chối hai lần thì không được gửi lại cho người đó. Hai người gửi lời mời gần như đồng thời chỉ giữ một lời mời; không tự trở thành bạn khi chưa chấp nhận.
- Cung cấp trạng thái Trực tuyến, Đang đấu và Ngoại tuyến. Bạn vừa có kết nối phải hiện Trực tuyến trong không quá 5 giây; có vị trí chơi thì hiện Đang đấu; đóng mọi thẻ trình duyệt thì chuyển Ngoại tuyến sau thời gian nhận biết mất kết nối.
- Người ngồi ghế gửi lời mời phòng cho bạn Trực tuyến. Lời mời tồn tại 30 giây, có Tham gia/Từ chối, không lưu vào chuông thông báo sau hết hạn. Tham gia phải kiểm lại sức chứa, quyền vào phòng và việc người đó đã có vị trí chơi khác.
- Khoá phòng làm lời mời chưa dùng mất hiệu lực. Lời mời kết bạn đang chờ được cung cấp cho danh sách và chuông thông báo.

**Việc cần làm**

- Tạo các thao tác dữ liệu và kiểm quyền tại máy chủ; xử lý yêu cầu đồng thời để không vượt giới hạn hoặc nhân đôi lời mời.
- Phát thay đổi cho các trình duyệt liên quan và cung cấp dữ liệu cho màn Bạn bè, chuông và hộp mời phòng.
- Viết kiểm thử quyền Khách, giới hạn, thời hạn, từ chối lặp, gửi chéo và thu hồi lời mời phòng.

**Kết quả bàn giao**

- Dịch vụ bạn bè, trạng thái hoạt động và lời mời phòng; kiểm thử tự động kèm dữ liệu mẫu.

**Điều kiện hoàn thành**

- Không thể gửi lời mời trái quyền qua yêu cầu trực tiếp; trạng thái hai phía và thời hạn nhất quán.

**Phạm vi và phối hợp**

Không làm nhắn tin riêng giữa bạn bè hoặc thách đấu từ màn Bạn bè trong phiên bản này; giao diện do phần việc khác thực hiện.

#### T40 · FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời

**Mục tiêu**

Dựng màn Bạn bè và lời mời phòng để người dùng tìm bạn, thấy trạng thái và rủ bạn vào chơi.

**Bối cảnh công việc**

Tài khoản chính thức được kết bạn; Khách không có quyền này. Mời vào phòng xuất phát từ hộp Chia sẻ phòng của người đang ngồi ghế, không phải từ màn Bạn bè.

**Yêu cầu cần đáp ứng**

- Màn Bạn bè có tìm theo phần đầu tên đăng nhập; kết quả hiện ảnh đại diện chữ cái, tên hiển thị và tên đăng nhập để phân biệt người trùng tên. Có thao tác gửi lời mời và thu hồi lời mời đã gửi.
- Danh sách bạn hiện Trực tuyến, Đang đấu hoặc Ngoại tuyến bằng cả chữ và dấu nhận biết. Có huỷ kết bạn; thẻ Lời mời đang chờ có Chấp nhận/Từ chối. Chuông điều hướng hiển thị lời mời kết bạn và số đếm.
- Nhắn tin và Thách đấu hiện vô hiệu, giải thích “Sắp ra mắt”. Màn Bạn bè không có nút mời vào phòng.
- Trong hộp Chia sẻ phòng, thẻ Bạn bè chỉ dành cho tài khoản chính thức ngồi ghế. Bạn Trực tuyến có nút Mời; Ngoại tuyến không bấm được và ghi “Ngoại tuyến”; Đang đấu không bấm được, giải thích “Bạn bè đang trong ván khác”.
- Người nhận thấy thông báo “Người chơi [Tên] mời bạn tham gia phòng cờ [Tên phòng]” với Tham gia/Từ chối và đếm 30 giây. Hết hạn hoặc từ chối thì thông báo biến mất, không lưu vào chuông.
- Bấm Tham gia phải dùng kết quả kiểm phòng hiện tại của máy chủ; hiện thông báo phù hợp khi phòng đầy, bị khoá hoặc người nhận đang chơi nơi khác.

**Việc cần làm**

- Dựng danh sách, tìm kiếm, các thao tác và trạng thái tải/rỗng/lỗi; cập nhật khi nhận thay đổi từ máy chủ.
- Nối chuông, thẻ Mời vào phòng và thông báo phía người nhận; ẩn phần bạn bè không dành cho Khách.
- Kiểm hai tài khoản thao tác qua lại, lời mời hết hạn và trạng thái nút theo bạn bè.

**Kết quả bàn giao**

- Giao diện quản lý bạn bè, chuông và mời bạn vào phòng.

**Điều kiện hoàn thành**

- Hai bên thấy kết quả nhất quán, lời mời phòng tự hết sau 30 giây, không có nút hoạt động sai quyền.

**Phạm vi và phối hợp**

Không xây dịch vụ dữ liệu bạn bè, chat riêng hoặc thách đấu; các quyết định quyền và sức chứa lấy từ máy chủ.

#### T49 · Kiểm thử US-03.2

**Mục tiêu**

Kiểm chứng việc kết bạn, trạng thái hoạt động và mời bạn vào phòng.

**Bối cảnh công việc**

Chuẩn bị ít nhất ba tài khoản chính thức, một phiên Khách, phòng còn ghế và phòng đầy. Dùng nhiều trình duyệt để quan sát cả người gửi, người nhận và chủ phòng; dữ liệu giới hạn phải được tạo trước để có thể thử đúng điểm biên.

**Yêu cầu cần đáp ứng**

- Tìm bằng tiền tố tên đăng nhập, không phân biệt hoa thường: kết quả có ảnh đại diện, tên hiển thị, tên đăng nhập và Kết bạn; không có Khách. Gửi lời mời xuất hiện ở mục lời mời và chuông bên nhận.
- Chấp nhận tạo quan hệ ở cả hai phía; từ chối hoặc thu hồi xoá lời mời hai phía; quá 30 ngày tự hết hạn. Huỷ bạn loại nhau khỏi danh sách.
- Kiểm giới hạn 200 bạn và tổng 50 lời mời gửi/nhận đang chờ; vượt giới hạn bị chặn có lý do. Bị cùng một người từ chối hai lần thì không gửi lại được cho người đó.
- Hai người gửi cho nhau gần cùng lúc chỉ tạo một lời mời, không tự thành bạn. Người nhận phải chấp nhận.
- Bạn mở ứng dụng hiện Trực tuyến trong không quá 5 giây; ngồi ghế hiện Đang đấu; đóng mọi thẻ trình duyệt hiện Ngoại tuyến sau thời gian nhận biết mất kết nối. Chuông có số lời mời kết bạn đang chờ.
- Chỉ người ngồi ghế thấy Chia sẻ phòng và mời bạn Trực tuyến; Ngoại tuyến hoặc Đang đấu không mời được, có lý do. Trang Bạn bè không có nút mời vào phòng; Nhắn tin/Thách đấu bị vô hiệu kèm “Sắp ra mắt”.
- Lời mời phòng có tên người gửi/phòng, Tham gia/Từ chối, hạn 30 giây. Đồng ý thì kiểm lại ghế và chỗ xem; hết chỗ báo đầy. Từ chối/hết hạn đóng thông báo, không lưu trong chuông.
- Lời mời gửi trước lúc phòng khoá phải bị từ chối khi dùng sau khoá. Người đang giữ ghế nơi khác không chiếm ghế thứ hai; máy chủ báo “Bạn đang ở trong một ván/phòng khác”.

**Việc cần làm**

- Tạo dữ liệu 199/200 bạn và 49/50 lời mời tổng gửi/nhận, cùng lời mời gần hạn 30 ngày; ghi trạng thái ban đầu để thử đúng biên.
- Dùng hai trình duyệt lần lượt gửi, nhận, từ chối hai lần, thu hồi, gửi ngược chiều đồng thời và huỷ bạn; kiểm dữ liệu cả hai phía.
- Đo đổi trạng thái bạn; từ phòng gửi lời mời rồi chấp nhận, từ chối, để hết 30 giây và thử dùng sau khi khoá phòng.
- Thử tài khoản đang chơi nơi khác, Khách và người xem để kiểm quyền bằng giao diện lẫn yêu cầu máy chủ.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

### EP-04 · Khởi tạo bàn cờ

#### T05 · Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân

**Mục tiêu**

Biểu diễn bàn cờ và sinh nước đi cơ bản của cả bảy loại quân để làm nền cho bộ luật của máy chủ và máy cờ.

**Bối cảnh công việc**

Bàn cờ tướng có 9 cột, 10 hàng giao điểm và hai bên Đỏ/Đen. Bộ phận này xác định quân đi và ăn như thế nào; việc loại nước khiến Tướng mình bị chiếu được hoàn thiện ở phần kiểm an toàn Tướng. Cung là vùng ba cột, ba hàng quanh vị trí xuất phát của Tướng mỗi bên; sông chia hai nửa bàn. Chiếu nghĩa là Tướng đang bị quân đối phương đe doạ ăn theo cách đi của quân đó.

**Yêu cầu cần đáp ứng**

- Biểu diễn vị trí quân, bên tới lượt và dữ liệu cần giữ của một thế cờ; đọc và ghi lại phải không làm đổi thế. Dữ liệu cần giữ gồm cả bộ đếm phục vụ luật kết thúc ván; chuỗi ghi lại phải bảo toàn chúng.
- Tướng đi ngang hoặc dọc đúng một ô trong cung; Sĩ đi chéo đúng một ô trong cung. Không sinh nước ra ngoài bàn hoặc ăn quân cùng bên.
- Tượng đi chéo hai ô, không qua sông; mắt Tượng là giao điểm ở giữa đường chéo, có quân chắn tại đó thì không đi được.
- Xe đi thẳng ngang hoặc dọc qua các ô trống, dừng ở quân đầu tiên. Mã đi hai ô theo một hướng ngang hoặc dọc rồi một ô vuông góc, thành hình chữ L; chân Mã là ô liền kề theo hướng đi hai ô, có quân tại đó thì nước bị chặn.
- Pháo đi không ăn như Xe; khi ăn phải có đúng một quân làm ngòi giữa điểm đầu và mục tiêu.
- Tốt trước khi qua sông chỉ tiến một ô; sau khi qua sông được tiến hoặc đi ngang một ô, không bao giờ đi lùi.

**Việc cần làm**

- Chọn quy ước hàng/cột và biểu diễn bên Đỏ/Đen, viết rõ để giao diện dùng đúng.
- Tạo thế khai cuộc và hàm đọc/ghi chuỗi thế cờ nội bộ.
- Viết riêng hàm sinh nước cho từng loại quân, dùng kiểm tra biên và quân chắn chung.
- Chuẩn bị thế trống, thế bị chắn và thế ăn quân cho từng loại.
- Kiểm quân ở sát biên, sát sông và mép cung để phát hiện sai hướng.
- Bàn giao danh sách nước cơ bản cùng mô tả đầu vào/đầu ra cho phần kiểm Tướng an toàn.

**Kết quả bàn giao**

- Phần biểu diễn bàn cờ và bộ sinh nước cơ bản trong packages/xiangqi-core.
- Kiểm thử tự động cho bảy loại quân.
- Mô tả quy ước toạ độ và chuỗi thế cờ.

**Điều kiện hoàn thành**

- Mỗi loại quân có ít nhất một phép thử quân chắn và một phép thử ăn quân thích hợp.
- Pháo có không ngòi hoặc hai ngòi không ăn được; Mã bị chặn chân và Tượng bị chặn mắt không đi xuyên.
- Đọc lại thế đã ghi khôi phục đúng quân và lượt đi.
- Không sinh nước ra ngoài 90 giao điểm hoặc ăn quân cùng bên.

**Phạm vi và phối hợp**

Kết quả là nước cơ bản theo cách đi của quân, chưa được gọi là toàn bộ nước hợp lệ cho ván thật cho đến khi có bước kiểm tự chiếu và hai Tướng đối mặt.

#### T07 · Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước

**Mục tiêu**

Hoàn thiện nước đi hợp lệ và phát hiện chiếu, chiếu hết, hết nước đi để bộ luật quyết định đúng việc một bên có được đi hay đã thua.

**Bối cảnh công việc**

Biết cách đi của từng quân chưa đủ: một nước nhìn đúng hình vẫn có thể làm Tướng mình bị chiếu hoặc để hai Tướng nhìn thẳng nhau. Máy chủ, giao diện và máy cờ cần dùng chung một cách phân xử. Chiếu là Tướng đang bị đe doạ ăn; chiếu hết là không có nước hợp lệ để thoát nguy cơ đó. Quân bị ghim là quân không thể rời chỗ theo một số hướng vì sẽ để lộ Tướng bị chiếu.

**Yêu cầu cần đáp ứng**

- Loại mọi nước khiến hai Tướng cùng cột không có quân chắn.
- Loại mọi nước khiến Tướng của bên vừa đi bị quân đối phương chiếu, kể cả khi di chuyển quân đang che chắn.
- Nhận biết bên tới lượt hiện bị chiếu hay không.
- Bên đang bị chiếu và không có nước hợp lệ bị xử thua vì chiếu hết.
- Bên không bị chiếu nhưng không còn nước hợp lệ cũng bị xử thua; trong dự án cờ tướng này hết nước đi không được tính hoà.
- Cung cấp các hàm dùng chung để lấy nước hợp lệ, kiểm chiếu và áp dụng nước vào một thế cờ.

**Việc cần làm**

- Dùng bộ sinh nước cơ bản để dựng danh sách ứng viên.
- Thử từng nước trên bản trạng thái phù hợp rồi kiểm an toàn Tướng và hai Tướng đối mặt.
- Viết nhận biết chiếu dựa trên quân thực sự tấn công được, có xét quân chắn.
- Kết hợp tình trạng chiếu và số nước hợp lệ để phân biệt chiếu hết với hết nước đi.
- Viết các thế kiểm: bỏ quân chắn trước Tướng, chặn chiếu, ăn quân chiếu, Tướng thoát chiếu và không có lối thoát.
- Mô tả cách gọi legalMoves để lấy nước hợp lệ, isCheck để hỏi bên tới lượt có bị chiếu không, applyMove để áp dụng nước vào thế cờ, cùng đầu vào và dữ liệu trả về.

**Kết quả bàn giao**

- Bộ lấy nước hợp lệ và phát hiện ba trạng thái chiếu/chiếu hết/hết nước đi.
- Các thế kiểm tự động và giải thích kết quả.
- Giao diện hàm để máy chủ, bàn cờ và máy cờ gọi chung.

**Điều kiện hoàn thành**

- Nước làm hai Tướng đối mặt không xuất hiện trong danh sách hợp lệ.
- Quân bị ghim không được đi để lộ Tướng bị chiếu; nước chặn hoặc ăn quân chiếu được chấp nhận nếu Tướng an toàn.
- Hai thế hết nước đi có và không có chiếu đều cho kết quả thua, với lý do khác nhau.
- Áp dụng một nước không làm sai vị trí các quân còn lại.

**Phạm vi và phối hợp**

Bàn giao phân xử từng thế cờ. Lặp thế, 120 nửa nước không ăn quân và ưu tiên các kết quả được ghép ở phần hoàn thiện luật kết thúc ván. Một nửa nước là một lần đi của một bên; hai bên mỗi bên đi một lần tương đương hai nửa nước.

#### T10 · Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử

**Mục tiêu**

Hoàn chỉnh bộ luật kết thúc ván và kiểm chứng bộ sinh nước để máy chủ và máy cờ dùng được một nguồn luật thống nhất.

**Bối cảnh công việc**

Dự án dùng luật cờ tướng rút gọn: hết nước đi là thua, lặp thế có ngoại lệ chiếu liên tục, và đủ 120 nửa nước không ăn quân có thể hoà. Cần xác định rõ khi nhiều điều kiện xuất hiện cùng lúc. Một nửa nước là một lần đi của một bên; 120 nửa nước tương đương 60 lượt mà mỗi bên đều đã đi một lần. Chiếu là Tướng bị đe doạ ăn; chiếu liên tục là một bên thực hiện nước chiếu trong mọi lần đi của mình thuộc chu kỳ xét.

**Yêu cầu cần đáp ứng**

- Hai thế chỉ giống nhau khi toàn bộ vị trí quân và bên tới lượt giống nhau; chỉ đếm trên nhánh nước đang có hiệu lực.
- Lần xuất hiện thứ ba tạo chu kỳ gồm các nước từ lần xuất hiện thứ nhất đến thứ ba. Một bên chiếu ở mọi nước của mình trong chu kỳ thì bên đó thua; cả hai cùng chiếu liên tục thì hoà; còn lại hoà do lặp thế.
- Đủ 120 nửa nước liên tiếp không ăn quân thì hoà. Chiếu hết ưu tiên cao nhất; hết nước đi và chiếu liên tục gây thắng/thua ưu tiên trước hoà 120 nửa nước.
- Không thêm luật xử riêng đuổi quân liên tục; trường hợp đó dùng luật lặp thế.
- Kiểm số nhánh nước hợp lệ từ khai cuộc: 44 nước đầu, 1.920 chuỗi hai nước, 79.666 chuỗi ba nước; xác minh nguồn chuẩn trước khi dùng. Việc đếm chuỗi là đếm tất cả cách đi hợp lệ liên tiếp của hai bên theo từng độ sâu, không phải cho máy chọn một nước tốt nhất.
- Gói luật có tài liệu cách gọi và độ phủ kiểm thử dòng ít nhất 90%, nghĩa là kiểm thử đã thực thi ít nhất 90% số dòng mã có thể chạy trong gói; tỷ lệ này không tự chứng minh mọi tình huống đều đúng.

**Việc cần làm**

- Thêm lịch sử thế, dấu hiệu nước chiếu và bộ đếm không ăn quân.
- Viết xét lặp thế và xác định bên chiếu trong toàn chu kỳ.
- Ghép thứ tự xét kết thúc, tạo ca cùng lúc chạm mốc không ăn quân với chiếu hết/hết nước/chiếu liên tục.
- Viết phép đếm nhánh nước theo độ sâu để phát hiện sai lệch bộ sinh nước.
- Đối chiếu chuẩn từ nguồn đã xác minh, kiểm việc ghi/đọc thế giữ đúng lượt và bộ đếm.
- Chạy toàn bộ kiểm thử gói, đo độ phủ và ghi cách tái hiện.

**Kết quả bàn giao**

- Gói luật hoàn chỉnh và tài liệu gọi hàm.
- Bộ thế kiểm kết thúc ván và nguồn chuẩn số nhánh.
- Báo cáo kiểm thử, độ phủ.

**Điều kiện hoàn thành**

- Cùng vị trí nhưng khác bên tới lượt không được tính lặp.
- Chu kỳ có một nước không chiếu không bị gán là chiếu liên tục của bên đó.
- Ca nửa nước thứ 120 gây hết nước đi cho kết quả thua, không bị ghi hoà.
- Số nhánh khớp chuẩn đã xác minh và độ phủ các dòng mã được kiểm thử thực thi đạt ít nhất 90%.

**Phạm vi và phối hợp**

Bộ luật phân xử một nước hợp lệ. Máy chủ vẫn phải kiểm đồng hồ trước khi chấp nhận nước; công việc này không thay thế xử lý hết giờ và mạng.

#### T11 · FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng

**Mục tiêu**

Vẽ bàn cờ rõ ràng, đúng quân và tự xoay theo phe để người chơi dùng được trên máy tính và điện thoại.

**Bối cảnh công việc**

Bàn cờ là thành phần hiển thị dùng lại cho phòng online và ván với máy. Nó nhận một thế cờ từ ứng dụng rồi vẽ lại, không tự quyết định nước đi hoặc kết quả.

**Yêu cầu cần đáp ứng**

- Vẽ bằng SVG, dạng hình có thể co giãn: 9 cột và 10 hàng giao điểm, sông và hai cung đầy đủ.
- Thế khai cuộc có đủ 32 quân đúng vị trí; quân Đỏ dùng 帥仕相俥傌炮兵, quân Đen dùng 將士象車馬砲卒.
- Khai cuộc mỗi bên có hàng cuối từ trái sang phải là Xe, Mã, Tượng, Sĩ, Tướng, Sĩ, Tượng, Mã, Xe; hai Pháo ở cột thứ hai và thứ tám trên hàng thứ ba tính từ cuối bên đó; năm Tốt ở các cột một, ba, năm, bảy, chín trên hàng thứ tư. Hai bên bố trí đối xứng qua sông.
- Giữ chữ Hán trên mặt quân, không thêm lựa chọn chữ Việt.
- Người cầm Đỏ thấy Đỏ phía dưới, người cầm Đen thấy Đen phía dưới; hướng nhìn không làm đổi dữ liệu toạ độ của thế cờ.
- Từ chiều rộng 360 pixel, toàn bộ bàn cờ không gây cuộn ngang, quân đủ lớn để chạm.
- Có viền phân biệt phe, nhãn văn bản cho quân và lượt đi để người mù màu hoặc dùng trình đọc màn hình hiểu được.

**Việc cần làm**

- Xác định cách chuyển toạ độ thế cờ thành vị trí vẽ trên bàn.
- Vẽ lưới, cung, sông và quân bằng thành phần nhận dữ liệu đầu vào.
- Thêm biến hướng nhìn để xoay bàn cho người cầm Đen.
- Áp dụng phông chữ Hán, màu và viền theo giao diện chung.
- Thêm tên quân, phe và lượt đi dưới dạng nhãn trợ năng.
- Kiểm khai cuộc và một thế giữa ván trên màn hình nhỏ và lớn.

**Kết quả bàn giao**

- Thành phần bàn cờ nhận thế cờ và hướng nhìn.
- Ví dụ khai cuộc, giữa ván, Đỏ/Đen phía dưới.
- Bằng chứng kiểm kích thước và nhãn trợ năng.

**Điều kiện hoàn thành**

- Đếm được 32 quân khai cuộc, đúng chữ và đúng vị trí.
- Đổi hướng nhìn không đổi thế cờ gốc; quân Đen ở dưới khi chọn phe Đen.
- Độ rộng 360 pixel hiển thị trọn bàn; phông quân tải được.
- Trình đọc màn hình đọc được phe/tên quân và trạng thái lượt; không chỉ dựa màu đỏ/đen.

**Phạm vi và phối hợp**

Bàn giao phần hiển thị. Bấm chuột, kéo thả, dấu ô hợp lệ, âm thanh và giao tiếp máy chủ được bổ sung trong các phần thao tác bàn cờ và ván online.

#### T16 · Kiểm thử US-04.2

**Mục tiêu**

Kiểm chứng bàn cờ được vẽ đúng, xoay đúng phe và đọc được trên điện thoại cũng như với công cụ trợ năng.

**Bối cảnh công việc**

Đây là kiểm tra thành phần hiển thị bàn cờ. Dùng các thế đầu vào cố định để biết chính xác quân nào phải nằm ở đâu; chưa dùng kết quả thao tác đi cờ làm bằng chứng cho chất lượng hiển thị.

**Yêu cầu cần đáp ứng**

- Đối chiếu lưới 9×10 giao điểm, sông, hai cung và đủ 32 quân khai cuộc.
- Kiểm chữ quân Đỏ 帥仕相俥傌炮兵 và Đen 將士象車馬砲卒, đúng loại và đúng vị trí.
- Khai cuộc mỗi bên có hàng cuối từ trái sang phải là Xe, Mã, Tượng, Sĩ, Tướng, Sĩ, Tượng, Mã, Xe; hai Pháo ở cột thứ hai và thứ tám trên hàng thứ ba tính từ cuối bên đó; năm Tốt ở các cột một, ba, năm, bảy, chín trên hàng thứ tư. Hai bên bố trí đối xứng qua sông.
- Kiểm hướng Đỏ phía dưới khi cầm Đỏ, Đen phía dưới khi cầm Đen; đảo hướng chỉ đổi cách nhìn, không đổi dữ liệu thế.
- Ở độ rộng 360 pixel và màn hình máy tính, toàn bàn không cuộn ngang, quân đủ lớn để thao tác chạm.
- Quân có viền phân biệt phe; trình đọc màn hình đọc được tên/phe quân và trạng thái lượt, không phải suy luận bằng màu.
- Lưu bằng chứng theo từng kích thước, hướng nhìn và cách đọc bằng công cụ trợ năng.
- Thử trên Chrome, Firefox, Safari và ít nhất một điện thoại thật; ghi phiên bản trình duyệt, thiết bị và kích thước cho từng lượt, không chỉ thu nhỏ cửa sổ máy tính rồi coi đã kiểm cảm ứng.

**Việc cần làm**

- Tạo ca khai cuộc cùng một thế giữa ván có quân ở bốn góc, mép cung và sát sông.
- Mở thành phần với phe Đỏ rồi Đen, đối chiếu từng giao điểm với thế gốc.
- Chụp toàn bàn ở 360 pixel và màn hình máy tính; kiểm tràn ngang và chữ bị cắt.
- Dùng trình đọc màn hình để duyệt tên quân, phe và lượt đi; xem khi không phân biệt được màu.
- Ghi lỗi sai chữ, sai vị trí, sai hướng hoặc thiếu nhãn kèm thế đầu vào và kích thước.
- Sau sửa, chạy lại ca lỗi và cả hai hướng nhìn để tránh sửa một phe làm hỏng phe kia.

**Kết quả bàn giao**

- Bộ ca kiểm hiển thị bàn cờ.
- Ảnh và ghi nhận kiểm trợ năng.
- Báo cáo đạt/không đạt/bị chặn, lỗi và kiểm lại.

**Điều kiện hoàn thành**

- Tất cả quân khai cuộc đúng vị trí và chữ Hán; không mất chữ vì phông không tải.
- Cầm Đen thấy đúng hướng, dữ liệu không đổi sau xoay.
- Không cuộn ngang tại 360 pixel và không che mất cung/sông/quân.
- Nhãn và viền giúp xác định quân, phe, lượt mà không chỉ nhìn màu.

**Phạm vi và phối hợp**

Không dùng kết quả này để kết luận bấm chuột, kéo thả, nước hợp lệ hoặc đồng bộ mạng đã đúng; những hành vi đó có phần kiểm riêng.

#### T19 · FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh

**Mục tiêu**

Cho người chơi chọn quân và đi bằng bấm chuột/chạm hoặc kéo thả, đồng thời thấy nước hợp lệ và các dấu hiệu diễn biến ván.

**Bối cảnh công việc**

Phần hiển thị bàn cờ đã có. Công việc này nối thao tác với bộ luật dùng chung và phản hồi hình/âm thanh; máy chủ vẫn là nơi quyết định cuối cùng khi chơi online. Chiếu nghĩa là Tướng đang bị đe doạ ăn; cảnh báo giúp người chơi nhận ra mình cần đưa Tướng về trạng thái an toàn.

**Yêu cầu cần đáp ứng**

- Chỉ bên tới lượt được chọn quân của mình; người xem không chọn/kéo được quân.
- Chọn quân hiện vòng chọn, chấm ở ô hợp lệ và vòng cố định quanh quân đối phương ăn được.
- Bấm chuột lại quân, bấm chuột ô không hợp lệ hoặc nhấn Escape huỷ chọn. Bấm chuột ô hợp lệ gửi thao tác đi.
- Kéo thả dùng được cả chuột và cảm ứng; thả sai thì quân trượt về chỗ cũ, không đổi thế.
- Nước gần nhất đánh dấu bốn góc tại ô đầu và ô cuối; người chơi và người xem đều thấy.
- Bị chiếu hiện vòng quanh Tướng, chữ “Đang bị chiếu” và biểu tượng; không nhấp nháy/rung, tối đa một nhịp sáng, bật giảm chuyển động thì bỏ hiệu ứng.
- Có bốn âm khác nhau cho đi, ăn, chiếu, kết thúc, tạo bằng khả năng tổng hợp âm của trình duyệt; nút loa tắt/bật ngay và giữ lựa chọn trong phiên.

**Việc cần làm**

- Thêm trạng thái chọn quân và lấy các ô hợp lệ từ bộ luật.
- Nối thao tác bấm chuột/chạm, huỷ chọn và gửi nước.
- Thêm kéo thả, chuyển toạ độ con trỏ về giao điểm, xử lý thả sai.
- Vẽ dấu nước gần nhất và cảnh báo chiếu với lựa chọn giảm chuyển động.
- Tạo bốn âm bằng Web Audio, là công cụ âm thanh có sẵn trong trình duyệt, và điều khiển loa.
- Dựng chế độ thử hai bên trên một máy, kiểm chuột/cảm ứng và hướng bàn Đen.

**Kết quả bàn giao**

- Bàn cờ tương tác và chế độ thử cục bộ.
- Dấu trạng thái, âm thanh và điều khiển loa.
- Bộ kiểm thao tác hợp lệ, sai và ngoài lượt.

**Điều kiện hoàn thành**

- Các ô được gợi ý đúng bộ luật; người xem/ngoài lượt không đi được.
- Thả ngoài ô hợp lệ không làm đổi quân; Escape huỷ chọn.
- Bật giảm chuyển động loại hiệu ứng chiếu, không mất chữ cảnh báo.
- Tắt loa ngừng toàn bộ âm bàn cờ và chuyển ván trong cùng phiên vẫn giữ lựa chọn.

**Phạm vi và phối hợp**

Bàn giao thao tác và phản hồi. Khi nối online, nước bị máy chủ từ chối phải được đồng bộ lại, không coi thao tác cục bộ là nước đã được chấp nhận.

#### T27 · Kiểm thử US-04.3

**Mục tiêu**

Kiểm chứng người chơi đi cờ bằng chuột hoặc cảm ứng đúng quyền, dễ nhận biết và có âm thanh phù hợp.

**Bối cảnh công việc**

Chuẩn bị hai người chơi và ít nhất một người xem trong phòng thật. Dùng thế cờ có nước đi thường, nước ăn quân và nước chiếu để quan sát đủ các dấu hiệu trên bàn.

**Yêu cầu cần đáp ứng**

- Kiểm chọn quân khi tới lượt: quân có vòng chọn, ô trống hợp lệ có chấm tròn, quân đối phương ăn được có vòng cố định không nhấp nháy. Bấm đích hợp lệ phải đi được.
- Bấm lại quân đang chọn, bấm ô không hợp lệ hoặc nhấn Escape phải bỏ chọn. Kéo thả bằng chuột và chạm giữ trên điện thoại đều hoạt động; thả sai ô thì quân trở về chỗ cũ.
- Khi chưa tới lượt hoặc đang làm người xem, không chọn hay kéo quân được. Cả người chơi và người xem đều thấy bốn góc đánh dấu ô đi và ô đến của nước gần nhất.
- Khi bị chiếu, có vòng quanh Tướng, chữ “Đang bị chiếu” và biểu tượng. Chỉ cho tối đa một nhịp sáng; cảnh báo không rung hay nhấp nháy liên tục; bật giảm chuyển động thì hiệu ứng tắt.
- Đi quân, ăn quân, chiếu và kết thúc ván có bốn âm khác nhau được tạo trong trình duyệt. Nút loa tắt hoặc bật ngay tất cả âm bàn cờ và giữ lựa chọn khi sang ván khác trong cùng phiên trình duyệt.

**Việc cần làm**

- Viết từng tình huống thử với thế cờ ban đầu, người đang tới lượt, thao tác và kết quả mong đợi; tách thao tác chuột và cảm ứng.
- Chạy trên màn hình nhỏ và máy tính, đồng thời quan sát trình duyệt đối thủ và người xem.
- Ghi kết quả đạt, không đạt hoặc chưa thể kiểm; lưu ảnh hoặc video lỗi và kiểm lại sau khi sửa.

**Kết quả bàn giao**

- Bộ tình huống thao tác bàn cờ và kết quả có bằng chứng tái hiện.

**Điều kiện hoàn thành**

- Tất cả tình huống được giao đạt trên phòng tích hợp thật; không bỏ qua nhánh sai quyền hoặc thiết bị cảm ứng.

**Phạm vi và phối hợp**

Kiểm cách tương tác và hiển thị; không thay việc chứng minh toàn bộ luật đi của bảy loại quân trong thư viện luật cờ.

### EP-05 · Hai người đánh cờ online

#### T20 · BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván

**Mục tiêu**

Xây dựng xử lý một ván online để máy chủ nhận nước đi, phân xử đúng luật, phát trạng thái và lưu diễn biến cùng kết quả.

**Bối cảnh công việc**

Khi hai người trong phòng đã sẵn sàng, phòng gửi tín hiệu bắt đầu. Máy chủ tạo ván mới và là nguồn kết quả duy nhất; không tin nước đi hoặc tuyên bố thắng do trình duyệt tự gửi.

**Yêu cầu cần đáp ứng**

- Mỗi lần bắt đầu hợp lệ tạo mã ván mới gắn đúng phòng và hai phe.
- Người gửi phải là người đang có quyền điều khiển, đi đúng lượt và đúng quân; nước phải qua bộ luật chung.
- Từ chối nước sai, ngoài lượt, từ người xem hoặc trạng thái cũ; trả trạng thái máy chủ để giao diện sửa lại.
- Lệnh gửi trùng chỉ áp dụng một lần, dùng cơ chế biên lai của đường kết nối thời gian thực.
- Nước được chấp nhận phải lưu bền và phát cho cả hai người chơi cùng người xem.
- Tự kết thúc khi có chiếu hết, hết nước đi, lặp thế, chiếu liên tục hoặc đủ 120 nửa nước không ăn quân. Một nửa nước là một lần đi của một bên. Chiếu hết ưu tiên cao nhất; hết nước đi và chiếu liên tục gây thắng/thua được xét trước hoà do 120 nửa nước không ăn quân.
- Lưu kết quả, lý do và thời điểm kết thúc; phát sự kiện cho phòng về chờ và giao diện hiện kết quả. Không xử lại kết quả vì phản hồi cũ đến muộn.
- Chiếu là Tướng bị đe doạ ăn; chiếu hết và hết nước hợp lệ đều làm bên tới lượt thua. Lặp cùng thế và cùng bên tới lượt lần thứ ba: bên nào chiếu ở mọi nước của mình từ lần xuất hiện thứ nhất đến thứ ba thì bên đó thua; cả hai cùng chiếu liên tục thì hoà, còn lại hoà do lặp thế.

**Việc cần làm**

- Nhận sự kiện phòng bắt đầu, tạo thế khai cuộc và bản ghi ván.
- Nối xác thực người gửi, phiên bản và chống trùng với hàm phân xử nước.
- Áp dụng nước hợp lệ, ghi dữ liệu và phát trạng thái cho các vai trò trong phòng.
- Nối xét kết thúc tự động và chỗ ghép đồng hồ, đầu hàng, xin hoà, mất kết nối.
- Viết kiểm tích hợp hai người và người xem, gồm gửi nước giả và gửi lặp.
- Đối chiếu dữ liệu lưu với trạng thái đã phát, kiểm ván kết thúc không nhận nước mới.

**Kết quả bàn giao**

- Dịch vụ ván online và sự kiện nước/kết quả.
- Lưu ván, nước đi và kết quả.
- Kiểm thử tích hợp luồng hợp lệ và từ chối.

**Điều kiện hoàn thành**

- Một nước đúng xuất hiện giống nhau ở hai người và người xem, có bản ghi lưu bền.
- Sửa trình duyệt để đi sai hoặc đi hộ đối thủ bị từ chối.
- Gửi cùng lệnh hai lần chỉ có một nước lưu.
- Thế chiếu hết/hết nước tự kết thúc, lý do đúng và không nhận nước tiếp.

**Phạm vi và phối hợp**

Bàn giao lõi ván để nối đồng hồ, các nút đề nghị và phục hồi mạng. Độ trễ thực tế và toàn bộ lý do kết thúc phải được kiểm lại trên ứng dụng đủ các phần này.

#### T23 · BE đồng hồ thi đấu và hết giờ

**Mục tiêu**

Quản lý đồng hồ trên máy chủ để ván online xử thua đúng người hết giờ, kể cả khi trình duyệt chậm hoặc mất mạng.

**Bối cảnh công việc**

Mỗi phòng chọn 5, 10 hoặc 15 phút cho mỗi bên và không cộng giây sau nước đi. Đồng hồ trong trình duyệt chỉ là phần hiển thị; thời gian máy chủ mới quyết định nước còn được đi hay ván đã kết thúc. Ân hạn mất mạng là khoảng 60 giây giữ chỗ cho người mất kết nối quay lại; khoảng này không cộng thêm vào thời gian thi đấu.

**Yêu cầu cần đáp ứng**

- Khởi tạo đủ thời gian cho hai bên theo phòng; khi ván bắt đầu, Đỏ tới lượt và đồng hồ Đỏ chạy.
- Chỉ trừ thời gian bên tới lượt; nước hợp lệ chuyển lượt sang bên kia, không cộng thêm giây.
- Trước xét một nước gửi tới phải tính thời gian đã trôi. Nếu thời gian còn lại bằng 0 hoặc âm thì xử thua do hết giờ, không nhận nước dù nước đó có thể chiếu hết.
- Máy chủ tự kết thúc khi hết giờ, không chờ người chơi gửi thao tác.
- Mất mạng không dừng đồng hồ. Hết giờ trước khi hết ân hạn mất mạng thì kết quả là hết giờ.
- Ảnh chụp trạng thái chứa thời gian còn lại và dữ liệu đủ để giao diện đồng bộ sau nối lại hoặc trở lại thẻ trình duyệt.
- Mỗi ván mới dùng thời gian đầy đủ; không dùng phần còn dư của ván trước.

**Việc cần làm**

- Thêm trạng thái thời gian và mốc tính trên máy chủ cho mỗi ván.
- Nối bước cập nhật thời gian trước xử lý nước và bước đổi lượt sau nước hợp lệ.
- Tạo xử lý tự hết giờ và bảo vệ để kết thúc chỉ có hiệu lực một lần.
- Đưa dữ liệu đồng hồ vào phản hồi và ảnh chụp trạng thái.
- Viết phép thử có đồng hồ kiểm soát cho mốc ngay trước/bằng/sau hết giờ.
- Thử ghép với mất kết nối, gửi trùng nước và tạo ván tiếp theo.

**Kết quả bàn giao**

- Đồng hồ máy chủ tích hợp với ván.
- Dữ liệu đồng bộ cho giao diện.
- Kiểm thử mốc thời gian, đổi lượt và kết thúc.

**Điều kiện hoàn thành**

- Cả ba mức giờ khởi tạo đúng, chỉ một bên bị trừ theo lượt.
- Nước đến khi thời gian còn lại đã bằng không hoặc âm phải bị từ chối; chỉ tạo một kết quả thua do hết giờ.
- Đồng hồ tiếp tục giảm khi người tới lượt mất mạng.
- Giao diện tích hợp lấy lại mốc máy chủ sau thẻ trình duyệt ẩn/nối lại; kiểm sai số hiển thị không quá một giây khi phần giao diện được nối.

**Phạm vi và phối hợp**

Bàn giao thời gian và kết quả hết giờ cho giao diện và xử lý mất mạng. Công việc không thêm cộng giây hay mức giờ không giới hạn cho phòng online.

#### T25 · FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại

**Mục tiêu**

Hoàn thiện màn hình thi đấu để hai người chơi và người xem nhìn cùng một thế cờ, đồng hồ và kết quả.

**Bối cảnh công việc**

Người chơi ngồi ghế Đỏ hoặc Đen; người xem chỉ theo dõi. Máy chủ giữ trạng thái chính thức, trình duyệt có nhiệm vụ hiển thị và gửi thao tác, không tự quyết định nước đi hay kết quả. Một nửa nước là một lần đi quân của một bên; 120 nửa nước là tổng 120 lần đi liên tiếp của hai bên.

**Yêu cầu cần đáp ứng**

- Kết nối bàn cờ với nước đi được máy chủ chấp nhận. Nếu nước bị từ chối, đưa bàn cờ về trạng thái đúng. Người cầm Đen thấy Đen ở dưới; người xem thấy Đỏ ở dưới và không điều khiển quân.
- Hiển thị hai đồng hồ theo mức 5, 10 hoặc 15 phút của phòng; chỉ đồng hồ bên tới lượt chạy, không cộng giây. Khi chuyển lại từ thẻ trình duyệt bị ẩn, đồng hồ lệch máy chủ không quá 1 giây.
- Hiển thị kết quả và lý do bằng tiếng Việt: chiếu hết, hết nước, đầu hàng, hết giờ, mất kết nối, lặp thế, thoả thuận hoà, 120 nửa nước không ăn quân, chiếu liên tục hoặc bị gián đoạn. Gián đoạn do máy chủ khởi động lại không có người thắng, thua hay hoà.
- Sau ván, người chơi có “Ở lại phòng” và “Rời phòng”; người xem không có nút dành cho người chơi. Khi người chơi mất mạng, hiện lớp phủ đếm hạn 60 giây, không đóng được bằng phím Escape; phía đối thủ thấy thời gian chờ còn lại và đồng hồ ván vẫn chạy. Nối lại thành công thì bỏ lớp phủ và đồng bộ bàn cờ, đồng hồ, trò chuyện theo máy chủ.
- Máy chủ khởi động lại: hiển thị “Ván bị gián đoạn” với Ở lại phòng/Rời phòng; phòng về Đang chờ, cả hai chưa sẵn sàng, không có đếm tự đóng phòng sau 10 phút.

**Việc cần làm**

- Nối dữ liệu nước đi, lượt, đồng hồ và kết quả từ máy chủ; xử lý cập nhật mới thay cho trạng thái cũ.
- Dựng lớp phủ nối lại theo thời gian máy chủ cung cấp; phân biệt đang đấu, đang chờ và người xem.
- Kiểm trên màn hình điện thoại rộng 360 điểm ảnh và máy tính; bảo đảm bàn cờ không cuộn ngang, thông báo không che nút Đầu hàng.

**Kết quả bàn giao**

- Màn hình phòng đấu đã nối dịch vụ thật, có trạng thái chờ tải, lỗi và mất kết nối.

**Điều kiện hoàn thành**

- Hai trình duyệt thấy cùng thế cờ và lượt; người xem không đi được quân; nhãn kết quả đúng với dữ liệu máy chủ.

**Phạm vi và phối hợp**

Phần này làm giao diện. Việc máy chủ giữ ghế, xử thua sau mất mạng và phục hồi kết nối được kiểm bằng tình huống mất mạng thật trong công việc kiểm thử kết nối.

#### T30 · Kiểm thử US-05.1

**Mục tiêu**

Kiểm chứng ván trực tuyến được máy chủ phân xử, tính giờ và lưu kết quả chính xác.

**Bối cảnh công việc**

Dùng hai người chơi thật và một người xem. Chuẩn bị các thế cờ sát kết thúc và công cụ thử gửi yêu cầu sai hoặc lặp để kiểm cả hành vi mà giao diện bình thường không cho phép. Một nửa nước là một lần đi quân của một bên; 120 nửa nước là tổng 120 lần đi liên tiếp của hai bên.

**Yêu cầu cần đáp ứng**

- Gửi nước sai luật hoặc khi chưa tới lượt phải bị từ chối; bàn cờ trở về trạng thái máy chủ. Gửi lại cùng yêu cầu đi cờ không được làm quân đi hai lần.
- Mỗi nước được chấp nhận phải lưu trong cơ sở dữ liệu. Khi ván kết thúc, kết quả, lý do và thời điểm cũng được lưu bền, không chỉ hiện trên màn hình.
- Thử cả mức 5, 10 và 15 phút mỗi bên. Chỉ đồng hồ bên tới lượt chạy, không cộng giây; hết giờ thì bên đó thua. Nước đến máy chủ sau khi hết giờ bị từ chối, kể cả là nước có thể thắng.
- Ẩn thẻ trình duyệt hoặc tạo lệch giờ trên thiết bị rồi quay lại; đồng hồ hiển thị phải khớp máy chủ với sai số không quá 1 giây.
- Các thế kết thúc phải tự kết thúc ván: chiếu hết, hết nước, lặp thế, chiếu liên tục và 120 nửa nước không ăn quân. Kiểm ưu tiên thắng/thua trước hoà khi cùng xuất hiện; chiếu hết được ưu tiên cao nhất sau khi nước đã hợp lệ.
- Người xem thấy Đỏ ở dưới, không thao tác quân; khi hết ván thấy kết quả và lý do nhưng không có nút dành riêng cho người chơi.

**Việc cần làm**

- Tạo bộ thế và dữ liệu đồng hồ xác định, ghi rõ kết quả mong đợi trước khi chạy.
- Đối chiếu ba trình duyệt, phản hồi máy chủ và bản ghi nước đi/kết quả.
- Ghi bằng chứng cho lỗi luật, sai thời điểm hoặc dữ liệu thiếu; kiểm lại sau sửa.

**Kết quả bàn giao**

- Báo cáo kiểm tính đúng đắn ván trực tuyến, đồng hồ, lưu nước và kết quả.

**Điều kiện hoàn thành**

- Tất cả tình huống được giao đạt và không có kết quả trùng hoặc nước đi sau hết giờ.

**Phạm vi và phối hợp**

Đo độ trễ dưới tải và kiểm đủ mọi lý do do mất mạng, đầu hàng, xin hoà thuộc các đợt kiểm chuyên biệt và hồi quy tổng.

#### T32 · BE đầu hàng, rời phòng giữa ván, xin hoà

**Mục tiêu**

Xử lý đầu hàng, rời phòng giữa ván và đề nghị hoà trên máy chủ.

**Bối cảnh công việc**

Máy chủ là nơi quyết định kết quả cuối cùng. Người chơi có thể chủ động kết thúc ván, nhưng yêu cầu đến muộn hoặc gửi nhiều lần không được thay đổi kết quả đã chốt.

**Yêu cầu cần đáp ứng**

- Đầu hàng làm người yêu cầu thua và đối thủ thắng. Rời phòng trong lúc đang đấu cũng được tính là đầu hàng rồi mới rời; nếu người rời là chủ phòng, chuyển quyền cho người chơi còn lại.
- Người chơi gửi đề nghị hoà cho đối thủ trong ván. Người nhận có 30 giây để chấp nhận hoặc từ chối; trong khi chờ, bàn cờ và đồng hồ tiếp tục hoạt động.
- Chấp nhận hợp lệ kết thúc ván với lý do thoả thuận hoà. Từ chối hoặc hết hạn buộc người gửi đi thêm 5 nước của chính mình mới được đề nghị lại; cung cấp số nước còn chờ cho giao diện.
- Người gửi được rút đề nghị đang chờ; phía nhận phải nhận thông báo đóng đề nghị. Nếu ván đã kết thúc vì lý do khác, đề nghị tự đóng và phản hồi đến sau không được sửa kết quả.
- Chỉ người đang chơi trong ván có quyền đầu hàng hoặc gửi, rút, trả lời đề nghị tương ứng; người xem không được thực hiện các thao tác này.

**Việc cần làm**

- Tạo các thao tác máy chủ và sự kiện phản hồi cho đầu hàng, rời phòng, gửi/rút/trả lời đề nghị hoà.
- Dùng cùng cơ chế kết thúc và lưu ván hiện có; xử lý tuần tự khi hết giờ, nước kết thúc ván và chấp nhận hoà đến gần nhau.
- Viết kiểm thử từ chối, hết 30 giây, đếm 5 nước, rút đề nghị, quyền người xem và phản hồi sau khi ván đã kết thúc.

**Kết quả bàn giao**

- Xử lý đề nghị trong ván và kiểm thử tự động chứng minh kết quả chỉ được chốt một lần.

**Điều kiện hoàn thành**

- Rời giữa ván có kết quả thua đúng; đề nghị không dừng đồng hồ; yêu cầu muộn không thay đổi kết quả.

**Phạm vi và phối hợp**

Phần này không dựng hộp xác nhận hay khung đề nghị trên màn hình; không thêm xin đi lại hoặc tái đấu.

#### T36 · FE nút Đầu hàng, Xin hoà và khung đề nghị

**Mục tiêu**

Dựng thao tác đầu hàng và xin hoà rõ hậu quả, không gây bấm nhầm hoặc che bàn cờ.

**Bối cảnh công việc**

Người chơi cần xác nhận trước khi tự nhận thua. Đề nghị hoà là cuộc trao đổi giữa hai người đang đấu, trong lúc đó lượt đi và đồng hồ vẫn tiếp tục.

**Yêu cầu cần đáp ứng**

- Nút Đầu hàng mở hộp xác nhận cảnh báo “Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức…”. Đặt tiêu điểm bàn phím ban đầu ở Huỷ; chỉ gửi lệnh khi người chơi đồng ý.
- Rời phòng giữa ván phải cảnh báo được tính là đầu hàng; có Rời phòng và Ở lại. Huỷ hoặc Ở lại không làm thay đổi ván.
- Người gửi Xin hoà thấy trạng thái đang chờ và nút Rút đề nghị. Người nhận thấy Chấp nhận Hoà/Từ chối và đếm lùi 30 giây; khung này không giữ bàn phím hay chặn thao tác trên bàn cờ.
- Bấm dấu đóng hoặc Escape chỉ thu gọn đề nghị, có cách mở lại. Thu gọn không gửi từ chối, không dừng đồng hồ và không kéo dài hạn trả lời.
- Sau từ chối hoặc hết hạn, nút xin lại bị vô hiệu tới khi người gửi đi thêm 5 nước; phần giải thích phải nêu số nước còn chờ. Khi ván kết thúc, đóng đề nghị và bỏ phản hồi muộn.
- Thông báo tạm không được che nút Đầu hàng; người xem không có các thao tác dành cho người chơi.

**Việc cần làm**

- Dựng hộp xác nhận và hai trạng thái người gửi/người nhận; nối với kết quả máy chủ.
- Chặn bấm lặp khi đang gửi; giữ số giây và số nước chờ đồng bộ với trạng thái nhận được.
- Thử bằng bàn phím, điện thoại và hai trình duyệt để kiểm thu gọn, mở lại, huỷ và kết thúc ván.

**Kết quả bàn giao**

- Giao diện đầu hàng, rời phòng và đề nghị hoà đã nối máy chủ.

**Điều kiện hoàn thành**

- Không đầu hàng khi Huỷ; đề nghị không làm ngừng ván; hai bên thấy cùng kết quả xử lý.

**Phạm vi và phối hợp**

Máy chủ quyết định kết quả, hạn và quyền; phần giao diện không tự xử hoà hoặc tự thay đổi bộ đếm nước.

#### T39 · Kiểm thử US-05.2

**Mục tiêu**

Kiểm chứng đầu hàng, rời phòng và xin hoà đúng ý người chơi, không làm thay đổi kết quả ngoài ý muốn.

**Bối cảnh công việc**

Dùng hai người đang đấu và một người xem; chuẩn bị ván gần hết giờ hoặc gần kết thúc để kiểm đề nghị còn đang chờ khi ván chấm dứt.

**Yêu cầu cần đáp ứng**

- Bấm Đầu hàng phải có cảnh báo thua ngay và tiêu điểm ban đầu ở Huỷ. Huỷ giữ ván; Đồng ý làm người đó thua, đối thủ thắng. Rời phòng phải cảnh báo đầu hàng; Rời phòng nhận thua rồi rời, Ở lại giữ nguyên.
- Chủ phòng rời giữa ván phải thua do đầu hàng và chuyển quyền chủ phòng cho người chơi còn lại. Thông báo tạm không che nút Đầu hàng.
- Gửi Xin hoà làm đối thủ thấy khung đếm 30 giây với Chấp nhận Hoà/Từ chối. Thử tiếp tục đi quân và quan sát đồng hồ để chứng minh khung không chặn ván.
- Bấm dấu đóng hoặc Escape chỉ thu gọn khung; mở lại vẫn cùng đề nghị và thời hạn còn lại. Chấp nhận kết thúc hoà; từ chối hoặc hết hạn làm người gửi chờ đúng 5 nước của mình trước lần xin tiếp.
- Kiểm phần giải thích số nước còn chờ ở nút bị vô hiệu. Người gửi rút đề nghị phải làm phía nhận đóng đề nghị.
- Khi ván kết thúc vì lý do khác, đề nghị đang chờ đóng; cố gửi phản hồi cũ sau đó không được đổi kết quả. Người xem không được gửi hay trả lời thay người chơi.

**Việc cần làm**

- Viết từng trường hợp Đồng ý/Huỷ/Từ chối/hết hạn/rút với kết quả mong đợi.
- Thử bằng chuột và bàn phím, quan sát cả hai trình duyệt và kết quả máy chủ.
- Lưu bằng chứng cho thời hạn, số nước chờ và phản hồi muộn; lập lỗi và kiểm lại khi sửa.

**Kết quả bàn giao**

- Bộ tình huống và báo cáo kiểm đầu hàng, rời phòng, xin hoà.

**Điều kiện hoàn thành**

- Mọi nhánh được giao đạt; không có xử thua khi huỷ hoặc sửa kết quả sau khi ván đã kết thúc.

**Phạm vi và phối hợp**

Không kiểm xin đi lại, tái đấu hoặc luật riêng của chế độ xếp hạng vì chưa thuộc phiên bản đang làm.

#### T52 · BE mất kết nối, ân hạn, đồng bộ lại và server restart

**Mục tiêu**

Xử lý mất kết nối ở máy chủ để người chơi có cơ hội quay lại và ván kết thúc đúng lý do.

**Bối cảnh công việc**

Máy chủ giữ trạng thái ván và là nơi quyết định thời gian, lượt đi, kết quả. Giao diện thông báo nối lại đã có phần việc riêng; phần này cung cấp trạng thái chính xác để giao diện hiển thị và phối hợp với quản lý phiên đăng nhập.

**Yêu cầu cần đáp ứng**

- Người chơi mất kết nối trong ván online được ân hạn 60 giây; đồng hồ vẫn chạy. Ở phòng chờ chỉ giữ ghế 60 giây rồi mất ghế, không xử thua. Quay lại trong hạn nhận đúng thế, đồng hồ, vai trò và dữ liệu hiển thị.
- Trong ván đang diễn ra, nếu đồng hồ về 0 trước khi hết ân hạn mất kết nối thì xử thua do hết giờ; nếu ân hạn hết trước thì xử thua do mất kết nối. Cả hai mất mạng thì bên mất kết nối trước thua khi quá hạn. Quy tắc xử thua này không áp dụng cho phòng đang chờ chưa có ván.
- Người xem được giữ chỗ tối đa 5 phút khi mất mạng; quay lại đúng hạn được tiếp tục xem, quá hạn mất chỗ mà không bị xử phạt.
- Máy chủ khởi động lại giữa ván online: ghi nhận ván bị gián đoạn, không thắng, thua hay hoà. Phòng tự tạo trở về chờ, cả hai chưa Sẵn sàng; cho phép Ở lại phòng hoặc Rời phòng và không tự đóng sau 10 phút.

**Việc cần làm**

- Lưu thời điểm mất kết nối, hạn giữ ghế và thời gian còn lại từ cùng nguồn thời gian phía máy chủ. Xử lý đồng hồ hết giờ và sự kiện nối lại theo thứ tự xác định để không kết thúc một ván hai lần.
- Kiểm danh tính và quyền trước khi khôi phục quyền điều khiển; gửi lại toàn bộ trạng thái cần thiết, không chỉ những nước đi bị thiếu. Phối hợp với giới hạn phiên để người đã hết quyền không tiếp tục điều khiển.
- Tạo kiểm thử tự động cho mất mạng ngắn, quá hạn, hết giờ trước, cả hai cùng mất mạng và khởi động lại; lưu kết quả để nhóm kiểm thử chạy lại với thiết bị thật.

**Kết quả bàn giao**

- Mã xử lý mất kết nối, nối lại và gián đoạn phía máy chủ; mô tả dữ liệu bàn giao cho giao diện.
- Các kiểm thử tự động và bằng chứng về thứ tự xử lý thời gian, quyền điều khiển, kết quả ván.

**Điều kiện hoàn thành**

- Chạy thử các tình huống trên cho kết quả duy nhất, đúng hạn và đồng nhất ở mọi người tham gia; không có nước đi được chấp nhận từ người đã mất quyền.
- Dữ liệu nối lại đủ để giao diện tiếp tục ván; gián đoạn máy chủ không bị biến thành chiến thắng hoặc khôi phục một thế cờ không còn lưu.

**Phạm vi và phối hợp**

Chỉ thực hiện xử lý phía máy chủ và dữ liệu đồng bộ. Không xây lại lớp phủ thông báo mất mạng; kiểm nghiệm đầu-cuối trên giao diện thật được thực hiện ở công việc kiểm thử mất kết nối.

#### T60 · Kiểm thử US-05.3

**Mục tiêu**

Kiểm chứng cách xử lý mất mạng và gián đoạn để kết quả ván không sai.

**Bối cảnh công việc**

Dùng hai thiết bị chơi một ván có đồng hồ và ít nhất một người quan sát. Chuẩn bị cách ngắt kết nối từng thiết bị độc lập, đồng hồ ghi thời điểm và quyền khởi động lại máy chủ thử nghiệm; thao tác trên môi trường thử riêng.

**Yêu cầu cần đáp ứng**

- Ngắt mạng một người trong ván: phía đó có lớp phủ nối lại và ân hạn 60 giây, Escape không đóng; đối thủ thấy “Đối thủ đang mất kết nối, thời gian chờ: 60s”. Đồng hồ vẫn chạy.
- Nối lại trong 60 giây: lớp phủ tắt, bàn cờ, đồng hồ và chat khớp máy chủ, ván tiếp tục. Quá hạn: bên mất mạng thua vì mất kết nối.
- Ngắt khi bên đó gần hết giờ: nếu hết giờ trước ân hạn thì lý do thua là hết giờ. Nếu hai người cùng mất mạng nhưng máy chủ vẫn chạy, bên mất kết nối trước thua khi cả hai quá hạn.
- Khởi động lại máy chủ giữa ván: kết quả “Ván bị gián đoạn”, không thắng/thua/hoà; phòng tự tạo về chờ, đặt lại Sẵn sàng, có Ở lại phòng/Rời phòng và không hạn đóng 10 phút.

**Việc cần làm**

- Tạo ván có đủ thời gian; ngắt mạng một người 30 giây rồi nối lại, đối chiếu trạng thái trước và sau.
- Lặp với hơn 60 giây; tạo ván khác có đồng hồ sắp hết để kiểm hết giờ trước ân hạn.
- Ngắt hai người ở hai mốc khác nhau trong khi máy chủ vẫn hoạt động, kiểm chỉ bên mất trước bị xử thua.
- Khởi động lại máy chủ giữa ván, nối lại và thử Ở lại phòng, Sẵn sàng vào ván mới; kết quả cũ phải trung tính.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

### EP-06 · Chế độ phòng và người xem

#### T53 · BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã

**Mục tiêu**

Cho chủ phòng kiểm soát người mới vào bằng ba chế độ và bảo đảm mã mời cũ mất hiệu lực khi cần.

**Bối cảnh công việc**

Phòng có thể Công khai để xuất hiện ở Sảnh, Chỉ vào bằng mã hoặc đường dẫn để mời riêng, hoặc Khoá phòng để chặn người mới. Máy chủ phải thực thi quyền này ở mọi đường vào, kể cả yêu cầu gửi trực tiếp.

**Yêu cầu cần đáp ứng**

- Chỉ chủ phòng được thay đổi chế độ. Chỉ được bật Khoá phòng khi có đủ hai người ngồi ghế; được khoá cả khi đang đấu.
- Khoá phòng chặn người mới và vô hiệu mã, đường dẫn, lời mời chưa dùng. Người đã ở trong phòng vẫn ở lại; người xem hiện có không mất hình tiếng chỉ vì đổi chế độ.
- Người chơi nối lại trong 60 giây và người xem nối lại trong 5 phút vẫn được nhận lại chỗ đã giữ. Quá hạn, họ được xét như người mới và bị chặn nếu phòng còn khoá.
- Mở lại từ Khoá phòng sang Công khai hoặc Chỉ vào bằng mã phải sinh mã và đường dẫn mới; thông tin mời cũ không dùng được. Một người rời ghế không tự mở khoá.

**Việc cần làm**

- Xây thao tác đổi chế độ có kiểm quyền chủ phòng và kiểm lại số người ngồi ghế ngay khi xử lý; không dựa riêng vào điều kiện đã kiểm ở giao diện.
- Cập nhật trạng thái phòng, hiệu lực thông tin mời và thông báo thay đổi cho người trong phòng cùng danh sách Sảnh. Giữ nhất quán khi có người vào cùng lúc với thao tác khoá.
- Viết kiểm thử cho người không có quyền, thiếu ghế, khoá giữa ván, mở lại, dùng mã cũ và nối lại trong hoặc quá hạn.

**Kết quả bàn giao**

- Chức năng đổi chế độ phía máy chủ, thu hồi thông tin mời và dữ liệu cập nhật cho giao diện.
- Bộ kiểm thử tự động với bằng chứng các đường vào đều tuân thủ chế độ.

**Điều kiện hoàn thành**

- Người mới không thể vượt khoá bằng mã, đường dẫn hoặc lời mời cũ; người có quyền nối lại không bị nhầm thành người mới.
- Mở khoá sinh thông tin mời mới và không làm mất trạng thái người đang chơi, đang xem.

**Phạm vi và phối hợp**

Phần này thực thi quy tắc phía máy chủ; hộp cài đặt và danh sách Sảnh do các công việc giao diện sử dụng kết quả bàn giao.

#### T54 · BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem

**Mục tiêu**

Cung cấp danh sách phòng công khai và quyết định đúng vai trò khi người dùng vào từ Sảnh.

**Bối cảnh công việc**

Sảnh giúp người chưa được mời tìm phòng để chơi hoặc xem. Danh sách là ảnh chụp có thể đã cũ khi người dùng bấm, nên máy chủ phải kiểm lại chế độ, ghế và sức chứa tại thời điểm nhận yêu cầu.

**Yêu cầu cần đáp ứng**

- Chỉ liệt kê phòng Công khai, tối đa 50 phòng, sắp phòng vừa mở công khai gần nhất lên đầu. Phòng chỉ vào bằng mã hoặc đang khoá không được xuất hiện.
- Mỗi dòng có tên phòng, chủ phòng và nhãn Khách nếu có, mức giờ, trạng thái đang chờ hoặc đang đấu, số người xem hiện tại và giới hạn. Phòng không cho xem phải thể hiện rõ.
- Phát cập nhật khi phòng mở hoặc rời công khai, đóng, đổi trạng thái hoặc số người; danh sách phía người dùng cập nhật trong không quá 2 giây.
- Vào chơi ưu tiên ghế trống; ghế vừa bị lấy thì chuyển thành người xem nếu còn chỗ và báo “Ghế vừa có người, bạn đang xem trận”. Hết chỗ thì từ chối. Vào xem luôn là người xem, không tự chiếm ghế.
- Khách được sử dụng cả hai lối vào theo cùng quy tắc. Phòng vừa rời Công khai phải từ chối yêu cầu từ danh sách cũ.

**Việc cần làm**

- Tạo dữ liệu danh sách và sự kiện cập nhật dùng chung cho các trình duyệt đang mở Sảnh; chỉ trả dữ liệu cần hiển thị.
- Xử lý yêu cầu vào phòng bằng cách kiểm lại quyền và sức chứa cùng lúc xếp chỗ, tránh hai yêu cầu cùng chiếm ghế hoặc vượt số người xem.
- Viết kiểm thử danh sách rỗng, đủ 50 phòng, đổi chế độ, phòng đóng và tranh chấp ghế; đo thời gian cập nhật trong môi trường trình diễn.

**Kết quả bàn giao**

- Dịch vụ danh sách công khai và thao tác vào chơi, vào xem phía máy chủ.
- Mô tả dữ liệu cùng kiểm thử và số đo thời gian cập nhật.

**Điều kiện hoàn thành**

- Danh sách không lộ phòng riêng hoặc phòng khoá; thứ tự và các cột đúng với trạng thái thật.
- Không vượt sức chứa khi người dùng bấm trên dữ liệu cũ; thông báo và vai trò cuối đúng từng nhánh.

**Phạm vi và phối hợp**

Không xây trang Sảnh trong công việc này. Kết quả là dữ liệu, sự kiện và xử lý vào phòng để giao diện dùng.

#### T55 · BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn

**Mục tiêu**

Quản lý người xem và chuyển chỗ an toàn, đồng thời cho người chơi đuổi người xem gây phiền.

**Bối cảnh công việc**

Một phòng có hai ghế chơi và số chỗ xem đã chọn khi tạo, tối đa năm người xem. Quyền ngồi ghế, xem, phát và nhận hình tiếng phải thay đổi thống nhất, kể cả khi có nhiều thao tác diễn ra gần nhau.

**Yêu cầu cần đáp ứng**

- Theo dõi số người xem hiện tại trên giới hạn đã chọn; người xem mất mạng được giữ chỗ 5 phút, quá hạn mất chỗ nhưng không bị xử thua.
- Chỉ chuyển ghế sang xem hoặc mời người xem xuống ghế khi phòng đang chờ. Người chơi không phải chủ phòng có thể chuyển sang xem nếu còn chỗ; chủ phòng không tự chuyển mình sang xem nhưng được chuyển người chơi kia.
- Chủ phòng mời người xem xuống ghế; người nhận có quyền chấp nhận hoặc từ chối. Lời mời không giữ trước ghế: khi chấp nhận phải kiểm lại ghế, quyền và việc người đó đã chơi ở nơi khác. Người xem không tự ngồi vào ghế trống.
- Thay đổi người ngồi ghế làm mất trạng thái Sẵn sàng. Trong ván đang diễn ra, không cho chuyển chỗ.
- Cả hai người chơi được đuổi người xem; người xem không có quyền đuổi. Người bị đuổi mất chỗ và quyền nhận hình tiếng, bị chặn quay lại đến khi phòng đóng.

**Việc cần làm**

- Xây thao tác đổi vai trò, mời xuống ghế và đuổi có kiểm quyền tại máy chủ. Kiểm sức chứa ngay lúc xử lý, không chỉ lúc tạo lời mời.
- Phát thay đổi danh sách, ghế và quyền cho những phần xử lý chat, camera và mic; gửi thông báo đưa người bị đuổi về Sảnh.
- Kiểm thử phòng đầy, không cho xem, ghế bị lấy trước khi nhận lời, đổi vai trò giữa ván và vào lại sau khi bị đuổi.

**Kết quả bàn giao**

- Chức năng người xem phía máy chủ cùng dữ liệu thông báo cho giao diện và phần camera, mic.
- Kiểm thử tự động về sức chứa, quyền thao tác và hiệu lực chặn.

**Điều kiện hoàn thành**

- Không có thao tác làm vượt số chỗ, tự chiếm ghế hoặc đổi vai trò trái phép; dữ liệu mọi người nhìn thấy thống nhất.
- Người bị đuổi không vào lại bằng mã, đường dẫn, lời mời hoặc Sảnh trong cùng danh tính khi phòng chưa đóng.

**Phạm vi và phối hợp**

Không xây khung danh sách người xem trong phần việc này. Giới hạn đã chấp nhận: một phiên Khách mới là danh tính mới, nên không cam kết chặn tuyệt đối người dùng tạo lại phiên Khách.

#### T57 · FE Cài đặt phòng

**Mục tiêu**

Tạo hộp Cài đặt phòng để chủ phòng chọn cách cho người khác tham gia.

**Bối cảnh công việc**

Người chủ cần hiểu khác nhau giữa công khai, mời bằng mã và khoá phòng. Giao diện phải phản ánh quyết định thật từ máy chủ; việc chọn trên màn hình chưa có nghĩa thay đổi đã thành công.

**Yêu cầu cần đáp ứng**

- Chỉ chủ phòng thấy nút Cài đặt phòng. Hộp có ba lựa chọn: Công khai để xuất hiện ở Sảnh; Chỉ vào bằng mã hoặc đường dẫn; Khoá phòng để chặn người mới.
- Khi chưa đủ hai người ngồi ghế, Khoá phòng không bấm được và có chú thích “Chỉ khoá được khi đã đủ 2 người chơi”. Khi đủ hai người, chủ phòng có thể chọn kể cả trong ván.
- Sau khi mở lại từ trạng thái khoá, hiển thị mã và đường dẫn mới do máy chủ trả về; không tiếp tục đưa mã cũ cho người dùng sao chép.
- Nếu một người rời ghế khi phòng đang khoá, giao diện vẫn hiển thị khoá; không tự chọn chế độ mở. Người xem hiện có vẫn ở phòng.

**Việc cần làm**

- Xây hộp chọn với tên và giải thích ngắn bằng tiếng Việt. Hiển thị lựa chọn hiện tại, trạng thái đang gửi, thành công và lỗi; tránh thao tác lặp khi chưa có phản hồi.
- Nối thao tác chọn với dịch vụ đổi chế độ. Khi bị từ chối do quyền hoặc số ghế vừa thay đổi, giữ trạng thái máy chủ xác nhận và hiển thị lý do.
- Cập nhật thông tin chia sẻ phòng từ phản hồi mới. Kiểm sử dụng bằng chuột, bàn phím và màn hình điện thoại, gồm mở, đóng và vị trí chọn trong hộp.
- Chạy thử bằng tài khoản chủ phòng, người chơi còn lại và người xem; thử khoá lúc thiếu ghế, khi đủ ghế, rồi mở lại và đối chiếu mã.

**Kết quả bàn giao**

- Hộp Cài đặt phòng sử dụng dữ liệu thật và các trạng thái chờ, lỗi, không được thao tác.
- Bằng chứng chạy các tình huống đổi chế độ và hiển thị thông tin mời mới.

**Điều kiện hoàn thành**

- Chỉ đúng người có quyền thấy thao tác; chế độ hiển thị luôn khớp phản hồi máy chủ, không báo thành công giả.
- Có thể thao tác trên điện thoại và bằng bàn phím; chú thích giải thích rõ lý do lựa chọn bị khoá.

**Phạm vi và phối hợp**

Phần giao diện không tự sinh mã, thu hồi lời mời hoặc quyết định quyền vào phòng. Những việc đó do máy chủ thực thi.

#### T58 · FE danh sách người xem, thao tác ghế và khung camera/mic

**Mục tiêu**

Hoàn thiện giao diện người xem và camera, mic trong cả phòng chờ lẫn phòng đang đấu.

**Bối cảnh công việc**

Màn phòng dùng chung thông tin ghế, danh sách người xem và phần hình tiếng. Giao diện phải giúp mỗi vai trò thấy đúng thao tác, đồng thời giữ kết nối hình tiếng khi chuyển từ chờ sang ván.

**Yêu cầu cần đáp ứng**

- Hiển thị Người xem với số hiện có trên sức chứa, tên và thay đổi ngay theo máy chủ. Chỉ hiện thao tác chuyển sang xem, mời xuống ghế hoặc đuổi khi vai trò và trạng thái phòng cho phép.
- Người xem không tự ngồi xuống ghế. Lời mời có Chấp nhận và Từ chối; chấp nhận vẫn có thể thất bại nếu ghế đã bị lấy. Chủ phòng không thấy nút tự chuyển mình sang người xem. Trong ván không cho đổi chỗ.
- Đuổi người xem phải có hộp xác nhận nêu tên, chọn sẵn Huỷ khi thao tác bằng bàn phím. Người bị đuổi được đưa về Sảnh và thấy thông báo rõ.
- Camera và mic mặc định tắt, có hai nút độc lập; mức chia sẻ gồm Không chia sẻ, Chỉ đối thủ, Cả đối thủ và người xem, chọn sẵn Chỉ đối thủ. Một mức áp cho cả hình và tiếng đang bật. Bật, tắt và thay đổi chia sẻ phải có hiệu lực phía người nhận trong không quá 2 giây.
- Người xem chỉ nhận hình tiếng, không có nút phát. Báo lỗi tiếng Việt khi thiết bị thiếu, quyền bị từ chối hoặc dịch vụ lỗi. Ván và chat vẫn tiếp tục; không ghi hoặc lưu hình tiếng.

**Việc cần làm**

- Nối danh sách, thao tác ghế và hộp xác nhận với dịch vụ người xem thật; cập nhật theo phản hồi thay vì tự nhận thao tác đã thành công.
- Nối khung camera, mic với bộ xử lý hình tiếng đã có. Dùng chung khung cho phòng chờ và đang đấu để chuyển màn không cắt luồng.
- Kiểm hai máy phát cùng người xem: đổi mức chia sẻ, tắt riêng mic, đổi vai trò, bị đuổi, mở thẻ khác và làm dịch vụ lỗi; quan sát trạng thái mỗi phía.

**Kết quả bàn giao**

- Khung danh sách người xem và khung camera, mic tích hợp thật, đầy đủ thông báo và trạng thái quyền.
- Bằng chứng thao tác đa thiết bị và dữ liệu bàn giao cho người kiểm thử.

**Điều kiện hoàn thành**

- Giao diện không cung cấp thao tác trái quyền; lỗi được thông báo thật, không làm mất ván hoặc chat.
- Người xem nhận đúng phạm vi chia sẻ; hình tiếng không bị ngắt chỉ vì bắt đầu ván.

**Phạm vi và phối hợp**

Không viết lại dịch vụ cấp quyền camera, mic hay quy tắc xếp chỗ. Phần việc này kết nối và hiển thị các dịch vụ đã bàn giao.

#### T61 · FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng

**Mục tiêu**

Hoàn thiện Sảnh để người dùng hiểu cách bắt đầu chơi, tìm phòng và xem luật.

**Bối cảnh công việc**

Sảnh là màn hình sau đăng nhập và nơi người chơi trở về từ phòng. Dữ liệu phòng công khai đã do máy chủ cung cấp; giao diện cần giải thích rõ phòng nào vào chơi được, phòng nào chỉ xem được và những tính năng chưa triển khai.

**Yêu cầu cần đáp ứng**

- Có bốn lựa chọn: Tự tạo phòng và Đánh với máy hoạt động; Đánh Thường – Ghép ngẫu nhiên và Đánh Hạng không bấm được, có “Sắp ra mắt”. Có ô Vào phòng bằng mã.
- Danh sách công khai hiển thị tên phòng, chủ phòng kèm nhãn Khách nếu có, mức giờ, đang chờ hoặc đang đấu, số người xem trên giới hạn. Không có phòng thì có lời giải thích và nút Tạo phòng.
- Còn ghế thì có Vào chơi; còn chỗ xem thì có Vào xem. Đủ ghế chỉ còn Vào xem nếu được; không cho xem hoặc hết chỗ thì không hiện nút vào xem. Danh sách cập nhật theo máy chủ trong không quá 2 giây.
- Thanh điều hướng có Sảnh, Bạn bè, chuông lời mời và ảnh chữ cái cùng Tên hiển thị mở Cài đặt. Lịch sử, Bảng xếp hạng chưa bấm được; Khách không mở Bạn bè.
- Luật chơi mở rộng hoặc thu gọn ngay tại Sảnh, dùng được bằng bàn phím. Nêu cách đi bảy loại quân, chiếu hết và hết nước đều thua; lặp ba lần hoà, chiếu liên tục bên chiếu thua, cả hai cùng chiếu thì hoà; 120 nửa nước không ăn quân thì hoà. Nêu xin hoà, đầu hàng, hết giờ, mất mạng 60 giây và đuổi quân liên tục xử theo lặp thế; nói rõ đây là bộ luật rút gọn của ứng dụng.
- Cách đi cần giải thích: Tướng đi ngang hoặc dọc một ô trong cung và không đối mặt Tướng kia khi không có quân chắn; Sĩ chéo một ô trong cung; Tượng chéo hai ô, không qua sông và bị chặn mắt; Xe đi thẳng; Mã đi hình chữ L và bị cản chân; Pháo đi như Xe nhưng ăn phải nhảy qua đúng một quân; Tốt trước sông chỉ tiến, qua sông được đi ngang, không lùi.

**Việc cần làm**

- Xây danh sách và trạng thái chờ, trống, lỗi; nối các lối tạo phòng, nhập mã, vào chơi, vào xem và chơi với máy.
- Xử lý phản hồi khi ghế vừa bị lấy, phòng đầy hoặc không còn công khai; không dựa vào dòng cũ để khẳng định đã vào được.
- Kiểm giao diện điện thoại, bàn phím, tài khoản chính thức và Khách; đối chiếu nội dung luật bằng từng tình huống minh hoạ.

**Kết quả bàn giao**

- Sảnh và thanh điều hướng hoàn chỉnh, kết nối dữ liệu thật và phần luật đọc được ngay tại màn hình.

**Điều kiện hoàn thành**

- Mọi lối vào đang hỗ trợ dẫn đúng chức năng; phần chưa làm được ghi rõ, không cho thao tác giả.
- Danh sách, quyền vào và thông báo khớp phản hồi máy chủ; nội dung luật không đánh đồng hết nước với hoà.

**Phạm vi và phối hợp**

Không triển khai ghép ngẫu nhiên, xếp hạng, lịch sử hoặc bảng xếp hạng trong phần việc này.

#### T62 · Kiểm thử US-06.1

**Mục tiêu**

Kiểm chứng ba chế độ vào phòng và hiệu lực của mã mời.

**Bối cảnh công việc**

Chuẩn bị chủ phòng, người chơi thứ hai, người xem đang ở trong phòng và một người bên ngoài. Ghi mã cùng đường dẫn mời trước khi đổi chế độ để thử lại sau khi khoá và mở khoá; không chỉ quan sát giao diện của chủ phòng.

**Yêu cầu cần đáp ứng**

- Người không phải chủ không thấy Cài đặt phòng và gọi trực tiếp đổi chế độ cũng bị từ chối.
- Chưa đủ hai người chơi: Khoá phòng bị vô hiệu, có “Chỉ khoá được khi đã đủ 2 người chơi”. Đủ hai người thì chủ khoá được cả trong ván.
- Khoá chặn mọi người mới, vô hiệu mã/link/lời mời chưa dùng; người xem đang có vẫn ở lại và giữ hình tiếng.
- Người chơi nối lại trong 60 giây, người xem trong 5 phút nhận lại chỗ; quá hạn coi là người mới và bị chặn nếu còn khoá.
- Mở lại sang Công khai hoặc Chỉ vào bằng mã/đường dẫn sinh mã và link mới; bản cũ không dùng được.
- Một người ngồi ghế rời không tự mở khoá. Người mới có mã/link vẫn bị từ chối đến khi chủ mở lại.

**Việc cần làm**

- Ghi mã/link ban đầu và vai trò từng người; thử gọi đổi chế độ bằng người không phải chủ.
- Thử khoá lúc thiếu ghế, đủ ghế và đang ván; dùng thông tin mời cũ từ trình duyệt ngoài phòng.
- Trong phòng khoá, thử nối lại trước/sau hạn 60 giây và 5 phút với đúng vai trò.
- Cho một người rời rồi mở lại; đối chiếu mã mới và thử cả mã cũ lẫn mới.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

#### T64 · Kiểm thử US-06.3

**Mục tiêu**

Kiểm chứng chuyển vai trò người xem, đuổi người xem và thu hồi hình tiếng.

**Bối cảnh công việc**

Chuẩn bị phòng có hai người chơi cùng những người xem, gồm một trường hợp chạm sức chứa. Dùng thiết bị thật có camera và mic để quan sát người bị đuổi có thực sự mất quyền nhận hình tiếng, kể cả khi họ vẫn giữ trang cũ.

**Yêu cầu cần đáp ứng**

- Danh sách hiện “Người xem (x/N)”, trong đó x là số hiện có và N là trần phòng; tên/số cập nhật khi người vào/rời.
- Ở phòng chờ, người chơi không phải chủ tự chuyển sang xem hoặc chủ chuyển người chơi kia nếu còn chỗ. Hết chỗ hoặc không cho xem thì nút vô hiệu với “Phòng không còn chỗ cho người xem”. Đổi thành phần ghế đặt lại Sẵn sàng.
- Chủ mời người xem xuống ghế: Chấp nhận/Từ chối. Chấp nhận phải kiểm ghế, quyền và vị trí chơi hiện tại; ghế đã bị lấy thì giữ người xem, báo lý do. Xuống ghế thành công vẫn phải Sẵn sàng.
- Người xem không tự chiếm ghế; chủ không tự chuyển mình sang xem. Trong ván, mọi đổi ghế/xem đều bị chặn cả khi gửi yêu cầu trực tiếp.
- Người xem mất mạng được giữ chỗ 5 phút; nối lại đúng hạn giữ vai trò, quá hạn mất chỗ và không bị xử thua.
- Cả hai người chơi có quyền đuổi, người xem không có. Hộp xác nhận nêu đúng tên và chọn sẵn Huỷ khi dùng bàn phím; huỷ không đuổi.
- Xác nhận đuổi đưa người đó về Sảnh, báo “Bạn đã bị đuổi khỏi phòng thi đấu”, thu hồi hình tiếng. Đo thời gian thu hồi thực tế, không tự đặt ngưỡng mới.
- Cùng danh tính bị chặn đến khi phòng đóng, kể cả mã/link mới, lời mời hoặc Sảnh; hiện “Bạn đã bị đuổi và chặn tham gia phòng cờ này!”.

**Việc cần làm**

- Tạo phòng còn chỗ, đầy chỗ và không cho xem; kiểm chuyển ghế/xem theo từng vai trò.
- Mời người xem xuống ghế, thử đồng ý/từ chối và cho người khác lấy ghế trước khi đồng ý; kiểm không vượt sức chứa.
- Trong ván gửi yêu cầu đổi chỗ trực tiếp; thử người xem tự ngồi hoặc tự đuổi để kiểm máy chủ chặn.
- Bật hình tiếng, thử huỷ rồi xác nhận đuổi; ghi thời gian mất luồng và thử quay lại bằng mọi lối vào cùng danh tính.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

#### T67 · Kiểm thử US-06.2

**Mục tiêu**

Kiểm chứng Sảnh, danh sách phòng công khai và các lối vào chơi.

**Bối cảnh công việc**

Chuẩn bị tài khoản chính thức, phiên Khách và các phòng công khai, chỉ vào bằng mã, khoá, đầy người xem và không cho xem. Quan sát Sảnh trên hai cửa sổ để đo cập nhật từ thay đổi phía chủ phòng đến danh sách phía người khác.

**Yêu cầu cần đáp ứng**

- Phòng công khai có tên, chủ kèm “(Khách)” nếu có, mức giờ, Đang chờ/Đang đấu và người xem x/N; N bằng không hiện “Không cho xem”. Mới mở công khai gần nhất lên đầu, tối đa 50 phòng.
- Mở/rời công khai, đóng phòng, đổi trạng thái hoặc số người cập nhật danh sách trong không quá 2 giây, không tải lại. Phòng chỉ mã/link hoặc khoá không xuất hiện; không có phòng thì giải thích và có Tạo phòng.
- Còn ghế có Vào chơi; còn chỗ xem có Vào xem. Đủ ghế chỉ còn Vào xem nếu còn chỗ; không cho xem hoặc hết chỗ thì không hiện nút xem.
- Ghế vừa bị lấy khi Vào chơi: còn chỗ thì vào xem và báo “Ghế vừa có người, bạn đang xem trận”; hết chỗ báo đầy. Vào xem không chiếm ghế trống. Phòng vừa rời công khai từ chối yêu cầu từ dòng cũ.
- Tự tạo phòng, Đánh với máy, Vào phòng bằng mã hoạt động; Ghép ngẫu nhiên và Đánh Hạng vô hiệu, ghi “Sắp ra mắt”. Khách dùng được mã/link, Vào chơi/Vào xem và chơi với máy theo luật quyền/sức chứa.
- Thanh điều hướng có Sảnh, Bạn bè, chuông lời mời và ảnh/tên mở cài đặt; Khách không dùng Bạn bè. Lịch sử/Bảng xếp hạng và Quên mật khẩu trên màn đăng nhập vô hiệu, ghi “Sắp ra mắt”.
- Luật chơi mở rộng/thu gọn tại Sảnh bằng bàn phím, không mở trang/hộp mới. Nội dung có cách đi bảy quân; chiếu hết/hết nước đều thua; lặp ba lần hoà trừ chiếu liên tục, một bên chiếu liên tục thua, cả hai chiếu thì hoà; 120 nửa nước không ăn quân hoà.
- Luật còn phải nêu xin hoà, đầu hàng, hết giờ, mất mạng 60 giây, đuổi quân xử theo lặp thế và câu “Đây là bộ luật rút gọn của ứng dụng, không phải toàn bộ luật thi đấu chính thức”.

**Việc cần làm**

- Chuẩn bị các loại phòng, gồm không cho xem, đầy ghế, đầy người xem; kiểm từng cột và nút trên Sảnh của tài khoản thường và Khách.
- Mở 51 phòng mẫu để kiểm giới hạn và thứ tự; đổi công khai, đóng và thay số người, đo cập nhật trên trình duyệt khác.
- Cho hai người tranh ghế cuối; bấm Vào xem lúc ghế trống và dùng dòng cũ sau khi phòng chuyển riêng, kiểm vai trò cuối.
- Kiểm các lối điều hướng, phần chưa làm, trạng thái rỗng và mục luật bằng bàn phím trên màn hình nhỏ.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.

### EP-07 · Chat, camera và mic

#### T33 · BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ

**Mục tiêu**

Bảo đảm camera và micro chỉ truyền cho đúng người được phép, và thu hồi quyền khi người dùng mất vai trò.

**Bối cảnh công việc**

LiveKit là dịch vụ chuyển âm thanh và hình ảnh trực tiếp giữa các trình duyệt. Phần việc này xây xử lý phía máy chủ và giấy phép kết nối có giới hạn quyền; giao diện camera và micro được thực hiện riêng.

**Yêu cầu cần đáp ứng**

- Camera và micro mặc định tắt. Người chơi chọn một mức chia sẻ chung cho cả hai thiết bị đang bật: Không chia sẻ, Chỉ đối thủ, hoặc Cả đối thủ và người xem; mặc định Chỉ đối thủ.
- Bật/tắt hai thiết bị độc lập. Thay đổi chia sẻ phải có hiệu lực trong không quá 2 giây; người không được phép không nhận luồng hình hoặc tiếng, kể cả cố kết nối ngoài giao diện.
- Người xem chỉ được nhận theo lựa chọn của người chơi; giấy phép không được cho phát âm thanh, hình ảnh hoặc dữ liệu riêng. Thu hồi quyền phát/nhận tương ứng khi rời ghế, rời phòng, bị đuổi hoặc thẻ trình duyệt mới tiếp quản.
- Camera và micro dùng được ngay trong phòng chờ, tiếp tục không bị ngắt khi bắt đầu ván. Tab cũ bị tiếp quản phải dừng thiết bị; thẻ trình duyệt mới mặc định tắt.
- Không ghi hình, ghi âm hoặc lưu luồng truyền. Khi dịch vụ lỗi hay hết hạn mức, ván, chat và đồng hồ vẫn tiếp tục, không xử ai thua.
- Hỗ trợ LiveKit tự chạy trong mạng nội bộ và LiveKit Cloud qua cấu hình kết nối; giữ cùng cách kiểm quyền cho cả hai môi trường.

**Việc cần làm**

- Tích hợp cấp giấy phép theo tài khoản, phòng và vai trò hiện tại; kiểm quyền lại khi trạng thái thay đổi.
- Cung cấp thao tác cho giao diện bật/tắt, đổi chia sẻ và nhận lỗi rõ ràng.
- Kiểm máy chủ bằng người chơi/người xem thật, gồm giả yêu cầu phát trái quyền, rời phòng, đổi vai và đổi thẻ trình duyệt.

**Kết quả bàn giao**

- Dịch vụ quyền camera/micro, cách kết nối cho giao diện và bằng chứng kiểm quyền.

**Điều kiện hoàn thành**

- Người không được phép không nhận hoặc phát được luồng; lỗi truyền hình/tiếng không kết thúc ván.

**Phạm vi và phối hợp**

Không dựng khung video hoặc nút giao diện. Thử đầu-cuối trên màn hình thật được thực hiện sau khi phần giao diện hoàn tất.

#### T37 · BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ

**Mục tiêu**

Xây chat phòng có kênh riêng cho hai người chơi và kênh chung, bảo vệ nội dung theo vai trò.

**Bối cảnh công việc**

Chat tồn tại cả khi chờ và khi đang đấu. Một phòng có thể đổi người ngồi ghế; quyền đọc tin phải theo đúng cặp người chơi hiện tại, không chỉ dựa vào việc từng tham gia phòng.

**Yêu cầu cần đáp ứng**

- Hai người ngồi ghế được đọc/gửi Kênh Riêng và Kênh Chung; người xem chỉ được đọc/gửi Kênh Chung. Máy chủ từ chối mọi yêu cầu của người xem tới Kênh Riêng, kể cả yêu cầu gửi trực tiếp.
- Khi thay một người trong cặp ngồi ghế, cả cặp mới chỉ thấy tin riêng từ khi cặp đó hình thành; người rời ghế mất quyền đọc. Cùng hai người đổi phe hoặc chơi ván tiếp vẫn giữ tin riêng.
- Người xem mới vào chỉ thấy tin Kênh Chung từ lúc vào. Chuyển giữa phòng chờ và ván không xoá tin; đóng phòng thì xoá toàn bộ chat phòng.
- Tin nhắn dài tối đa 200 ký tự. Mỗi người gửi tối đa 5 tin trong 10 giây; tin thứ 6 bị chặn với thông báo “Bạn gửi quá nhanh”.
- Thay từ cấm bằng *** trước khi phát cho người nhận. Bộ lọc xử lý chữ hoa/thường, có dấu/không dấu, khoảng trắng/ký tự chen vào và cách thay số 0 cho o, số 1 cho i. Danh sách từ nằm trong tệp cấu hình, áp dụng sau khởi động lại.
- Nội dung phải được hiển thị như văn bản thường, không chạy đoạn mã do người gửi chèn; không ghi nội dung chat vào nhật ký vận hành.

**Việc cần làm**

- Tạo lưu trữ tin theo phòng, kênh và mốc cặp người chơi; cập nhật quyền khi đổi vai trò.
- Tích hợp bộ lọc chung, kiểm độ dài và giới hạn gửi tại máy chủ.
- Viết kiểm thử giả yêu cầu trái quyền, thay người, đổi phe, đóng phòng và các biến thể né bộ lọc.

**Kết quả bàn giao**

- Dịch vụ hai kênh chat, bộ lọc và kiểm thử tự động.

**Điều kiện hoàn thành**

- Người xem không đọc tin riêng; cặp mới không đọc tin cũ; tin quá dài hoặc quá nhanh bị chặn.

**Phạm vi và phối hợp**

Không làm chat riêng giữa bạn bè hay nhãn dán; khung hiển thị chat được thực hiện trong phần giao diện.

#### T42 · FE khung chat hai kênh

**Mục tiêu**

Dựng khung chat để người chơi phân biệt rõ kênh riêng và kênh chung, người xem chỉ thấy phần được phép.

**Bối cảnh công việc**

Cùng một khung chức năng được dùng ở phòng chờ và phòng đang đấu. Máy chủ lọc nội dung và quyết định quyền; giao diện phải phản ánh đúng vai trò và tránh để tin cũ còn hiện sau thay người.

**Yêu cầu cần đáp ứng**

- Trên máy tính, người chơi mặc định chỉ mở Kênh Riêng; có thể mở thêm Kênh Chung để xem hai khung song song hoặc ẩn/hiện từng khung. Ẩn khung không làm thay đổi quyền đọc và gửi.
- Trên điện thoại, hai kênh nằm trong một khung chuyển bằng thẻ chọn kênh, mặc định Kênh Riêng. Người xem chỉ có Kênh Chung, không có lối mở Kênh Riêng.
- Nhãn phải rõ kênh riêng giữa hai người chơi và kênh chung của phòng. Kênh Chung nhắc rằng người chơi cũng đọc và gửi được; tin người chơi có dấu nhận biết vai trò và phe.
- Hiển thị tin như văn bản thường, không chạy thẻ hoặc mã được gửi. Có trạng thái đang gửi, đã gửi, gửi lỗi và Thử lại; chặn nội dung quá 200 ký tự và hiện lỗi gửi quá nhanh từ máy chủ.
- Chuyển từ chờ sang ván không làm mất tin. Cùng cặp đổi phe hoặc chơi tiếp giữ tin riêng; khi đổi cặp, thay tập tin hiển thị theo mốc mới do máy chủ gửi, không giữ lại tin riêng của cặp cũ.
- Người xem mới chỉ thấy tin từ lúc vào. Phòng đóng thì khung không giữ nội dung chat của phòng đã đóng.

**Việc cần làm**

- Dựng bố cục hai khung ở máy tính và hai thẻ chọn kênh trên điện thoại, với trạng thái tải, rỗng và lỗi.
- Nối gửi/nhận tin, quyền theo vai trò và việc thay tập tin khi đổi phòng hoặc đổi cặp.
- Thử bằng người chơi và người xem, tin chứa thẻ mã, gửi lỗi rồi thử lại và chuyển trạng thái phòng.

**Kết quả bàn giao**

- Khung chat dùng chung trong phòng chờ và bàn đấu, nối máy chủ thật.

**Điều kiện hoàn thành**

- Người xem không thấy kênh riêng; bố cục mặc định đúng thiết bị; nội dung không chạy mã và không rò tin cặp cũ.

**Phạm vi và phối hợp**

Không làm nhãn dán hay chat riêng giữa bạn bè; lọc từ cấm và giới hạn gửi cuối cùng vẫn được máy chủ thực thi.

#### T45 · Kiểm thử US-07.2

**Mục tiêu**

Kiểm chứng camera và micro hoạt động đúng quyền, đúng mức chia sẻ và không gây gián đoạn ván.

**Bối cảnh công việc**

Dùng hai máy cho hai người chơi và thêm điện thoại hoặc máy khác làm người xem. Thử trên môi trường cho phép camera/micro, gồm trang web dùng kết nối bảo mật khi truy cập qua mạng nội bộ.

**Yêu cầu cần đáp ứng**

- Vào phòng mới phải thấy camera/micro đều tắt, mức chia sẻ mặc định Chỉ đối thủ. Bật/tắt từng thiết bị độc lập; đối thủ bắt đầu hoặc ngừng nhận trong không quá 2 giây.
- Thử Không chia sẻ, Chỉ đối thủ và Cả đối thủ và người xem. Một mức áp cho cả hai thiết bị đang bật; đổi mức trong ván có hiệu lực không quá 2 giây. Người xem không nhận khi không được cho phép.
- Người xem không có nút phát camera/micro; kiểm cả giấy phép kết nối do máy chủ cấp để chứng minh không được phát hình, tiếng hoặc dữ liệu riêng, không chỉ nhìn nút bị ẩn.
- Từ chối quyền thiết bị hoặc dùng máy không có thiết bị phải có lỗi tiếng Việt và hướng dẫn cấp quyền; ván vẫn tiếp tục. Mở thẻ trình duyệt mới tiếp quản thì thiết bị thẻ trình duyệt cũ tự dừng, thẻ trình duyệt mới mặc định tắt.
- Bật camera/micro ngay trong phòng chờ rồi bắt đầu ván; hình và tiếng không bị ngắt. Kiểm cấu hình không ghi hình, ghi âm hoặc lưu luồng.
- Chủ động làm dịch vụ truyền hình/tiếng lỗi hoặc mất kết nối; phải hiện “Camera/mic tạm thời không dùng được”, chat vẫn gửi được, đồng hồ vẫn chạy, không ai bị xử thua.

**Việc cần làm**

- Viết tình huống cho từng người nhận, mức chia sẻ và trạng thái thiết bị; ghi mốc đổi để đo thời gian.
- Thử giao diện thật và kiểm quyền phía máy chủ; lưu ảnh/video cùng số đo.
- Ghi rõ môi trường, thiết bị và trường hợp chưa thể thử; kiểm lại lỗi sau sửa.

**Kết quả bàn giao**

- Báo cáo kiểm hình/tiếng với số đo, quyền từng vai trò và bằng chứng không ảnh hưởng ván.

**Điều kiện hoàn thành**

- Các nhánh được giao đều đạt; không đánh dấu đạt nếu chỉ thử một người chơi hoặc chỉ kiểm nút giao diện.

**Phạm vi và phối hợp**

Thu hồi luồng khi bị đuổi hoặc đổi từ ghế xuống xem được kiểm thêm cùng chức năng quản lý người xem và hồi quy tổng.

#### T47 · Kiểm thử US-07.1

**Mục tiêu**

Kiểm chứng chat đúng kênh, đúng nội dung được phép và có giới hạn chống gửi quá nhanh.

**Bối cảnh công việc**

Chuẩn bị hai người chơi và người xem; dùng cả máy tính và điện thoại. Mỗi tình huống ghi rõ ai gửi, ai được đọc và thời điểm người xem tham gia.

**Yêu cầu cần đáp ứng**

- Máy tính của người chơi mặc định chỉ Kênh Riêng, mở thêm được Kênh Chung song song và ẩn/hiện từng khung. Điện thoại dùng hai thẻ chọn kênh, mặc định Riêng. Người xem chỉ có Chung; gửi yêu cầu trực tiếp tới kênh riêng cũng phải bị từ chối.
- Người xem mới vào không đọc được tin chung gửi trước lúc vào. Cùng cặp đổi bên hoặc chơi ván tiếp vẫn đọc tin riêng cũ; chuyển giữa chờ và đấu giữ tin và quyền kênh.
- Đóng phòng phải xoá chat phòng. Thử nội dung chứa thẻ hoặc đoạn mã; trên màn hình chỉ là chữ, không được chạy.
- Tin chứa từ cấm bị thay bằng *** trước khi phát. Thử chữ hoa/thường, có dấu/không dấu, chèn khoảng trắng/ký tự và thay 0 cho o, 1 cho i để tránh bỏ sót biến thể.
- Tin đúng 200 ký tự được xử lý; trên 200 bị chặn cả ở giao diện và máy chủ. Gửi 5 tin trong 10 giây rồi gửi tin thứ 6 phải báo “Bạn gửi quá nhanh” và không phát tin đó.
- Thêm từ vào tệp cấu hình rồi khởi động lại dịch vụ để kiểm áp dụng danh sách mới, không cần sửa cơ sở dữ liệu.

**Việc cần làm**

- Viết bộ dữ liệu tin nhắn hợp lệ, biên, từ cấm và nội dung có thể gây chạy mã; xác định người được đọc cho từng tin.
- Chạy đa trình duyệt, thử yêu cầu vượt quyền và đối chiếu dữ liệu sau đóng phòng.
- Lưu kết quả theo từng biến thể, bằng chứng và lỗi; kiểm lại sau khi sửa.

**Kết quả bàn giao**

- Bộ tình huống cùng báo cáo kiểm hai kênh, lọc nội dung và giới hạn gửi.

**Điều kiện hoàn thành**

- Không rò kênh riêng, không chạy mã từ tin nhắn, không phát tin vượt giới hạn.

**Phạm vi và phối hợp**

Nhánh đổi người từ ghế xuống xem và đưa người khác lên ghế được kiểm đầy đủ khi chức năng đổi vai trò hoàn tất trong hồi quy tổng.

### EP-08 · Đánh với máy theo cấp độ

#### T24 · Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng

**Mục tiêu**

Xây dựng máy cờ ba cấp có thể trả nước hợp lệ trong ngân sách thời gian và chạy tách khỏi máy chủ phục vụ người chơi online.

**Bối cảnh công việc**

Máy cờ tự viết dùng chung bộ luật với online. Tìm kiếm chạy riêng để không chiếm đường xử lý các phòng khác.

**Yêu cầu cần đáp ứng**

- Ba cấp Dễ/Trung bình/Khó có mục tiêu độ sâu 2/4/6, ngân sách phản hồi tương ứng 300/1.000/3.000 mili giây. Độ sâu tính theo nửa nước, mỗi nửa nước là một lần đi của một bên. Ngân sách là thời gian được phép tìm nước, không phải thời gian thi đấu của người chơi.
- Dùng thuật toán tìm đối kháng negamax kết hợp cắt tỉa alpha-beta: duyệt nước có lợi và bỏ nhánh đã biết không cần xét. Tìm sâu dần để luôn giữ được kết quả tốt của vòng đã hoàn tất.
- Lượng giá dựa trên giá trị quân và vị trí; sắp xếp nước để tìm hiệu quả, dùng bảng ghi thế đã tính để tránh lặp tính không cần thiết.
- Chạy trong tiến trình hoặc luồng làm việc riêng; máy chủ gọi tìm nước mà vẫn xử lý kết nối và phòng khác.
- Mọi nước trả về phải hợp lệ theo bộ luật. Hết ngân sách trước độ sâu mục tiêu thì dùng nước tốt nhất đã tìm được, không trả nước bịa hoặc chờ vô hạn.
- Đo bản đầu tiên trên bộ thế chuẩn, ghi thời gian, độ sâu thực tế, nước đi, thiết bị và cách chạy; thấy nguy cơ không đạt phải báo người phụ trách, không tự giảm mục tiêu.

**Việc cần làm**

- Tạo giao diện nhận thế, phe và cấp độ, trả nước cùng thông tin đo.
- Viết lượng giá và tìm kiếm, dùng bộ sinh nước hợp lệ.
- Thêm tìm sâu dần, giới hạn thời gian, sắp xếp nước và bảng ghi thế.
- Tách xử lý tìm kiếm khỏi máy chủ chính, nối trạng thái hoạt động cho kiểm sức khoẻ.
- Chạy cùng bộ 50 thế giữa ván đã chuẩn bị ở cả ba cấp và các thế có đáp án bắt buộc để lập số đo ban đầu; lưu cả thời gian từng thế, độ sâu thực tế và nước trả về.
- Kiểm hết thời gian, hết nước, tác vụ lỗi; bàn giao cách gọi và chẩn đoán.

**Kết quả bàn giao**

- Gói máy cờ trong packages/engine gọi được từ máy chủ.
- Bộ kiểm nước hợp lệ và giới hạn thời gian.
- Báo cáo đo đầu tiên phục vụ tối ưu.

**Điều kiện hoàn thành**

- Cả ba cấp chỉ trả nước có trong danh sách hợp lệ.
- Ép ngân sách ngắn vẫn lấy được nước hợp lệ tốt nhất đã lưu khi có nước để đi.
- Tìm kiếm chạy riêng, không khóa đường xử lý chính.
- Báo cáo có thời gian và độ sâu thực, không ghi đạt chỉ vì đã cấu hình độ sâu 6.

**Phạm vi và phối hợp**

Bàn giao máy cờ và số đo đầu cho phần tích hợp, tối ưu và kiểm độc lập. Sức mạnh cấp Khó và ảnh hưởng dưới tải cần được đo đầy đủ sau đó.

#### T34 · BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới

**Mục tiêu**

Xây dựng quản lý ván đấu với máy để người dùng chọn cấp độ, chọn phe và bắt đầu ván mới.

**Bối cảnh công việc**

Người dùng luyện cờ một mình với máy. Thư viện luật và bộ máy chọn nước đã có; phần việc này ghép chúng thành một ván có danh tính, lượt đi và kết quả do máy chủ quản lý.

**Yêu cầu cần đáp ứng**

- Nhận cấp Dễ, Trung bình hoặc Khó và lựa chọn phe Đỏ, Đen hoặc Ngẫu nhiên. Nếu ngẫu nhiên, máy chủ bốc phe với tỷ lệ xấp xỉ 50/50, không tin phe do trình duyệt tự chọn ngoài yêu cầu hợp lệ.
- Người cầm Đỏ đi trước. Người cầm Đen thì máy phải tự đi nước đầu ngay khi ván bắt đầu. Mỗi nước của người và máy đều qua cùng thư viện kiểm luật.
- Không áp đồng hồ thi đấu cho người chơi và không có chức năng xin hoà. Có đầu hàng; đầu hàng kết thúc ván với người chơi thua. Điều kiện kết thúc theo luật cờ chung vẫn được áp dụng.
- Khi ván kết thúc, cung cấp dữ liệu để giao diện hiện Ván mới hoặc Về Sảnh. Ván mới mở lại lựa chọn cấp độ và lựa chọn phe trước đó, cho phép đổi trước khi bắt đầu; tạo mã ván mới, không hồi sinh ván đã xong.
- Giữ riêng lựa chọn Ngẫu nhiên ban đầu và phe thực tế đã bốc để điền đúng khi tạo ván tiếp theo. Trạng thái ván đấu với máy trong phiên bản này chỉ giữ trong bộ nhớ máy chủ, không có lịch sử ván dành cho người dùng.

**Việc cần làm**

- Tạo thao tác bắt đầu ván, nhận nước người, yêu cầu máy tìm nước và chốt kết quả.
- Kết nối việc đầu hàng và tạo ván mới, bảo đảm không gửi nước máy vào ván đã kết thúc.
- Viết kiểm thử cả ba lựa chọn phe, nước đầu của máy, kết thúc và tạo lại ván có mã khác.

**Kết quả bàn giao**

- Dịch vụ ván đấu với máy và kiểm thử tích hợp với thư viện luật, bộ máy chọn nước.

**Điều kiện hoàn thành**

- Đúng lượt đầu theo phe; ván mới có danh tính mới; người dùng không thể điều khiển ván của người khác.

**Phạm vi và phối hợp**

Giữ ván khi mất mạng và xử lý Thử lại sau lỗi máy được thực hiện trong phần ổn định ván đấu với máy; không bổ sung đi lại hoặc gợi ý nước.

#### T38 · FE thiết lập/chơi AI và giao diện sự cố máy cờ

**Mục tiêu**

Dựng giao diện chọn cấp độ, chọn phe và chơi với máy, gồm cách xử lý khi máy cờ gặp sự cố.

**Bối cảnh công việc**

Người chơi luyện cờ một mình. Máy chủ quyết định phe ngẫu nhiên, lượt và trạng thái ván; màn hình cần làm rõ lúc đến lượt người, lúc máy đang suy nghĩ và lúc cần người dùng xử lý lỗi.

**Yêu cầu cần đáp ứng**

- Hộp thiết lập có Dễ/Trung bình/Khó và Đỏ/Đen/Ngẫu nhiên. Cầm Đỏ thì người đi trước; cầm Đen thì máy đi đầu và bàn cờ lật để Đen ở dưới.
- Màn chơi không có đồng hồ thi đấu, Xin hoà, gợi ý nước hay Đi lại. Có Đầu hàng; khi máy suy nghĩ hoặc chưa tới lượt người thì không cho đi quân.
- Kết thúc ván, kể cả đầu hàng, hiện Ván mới và Về Sảnh. Ván mới mở thiết lập điền lại cấp độ và lựa chọn phe trước đó, cho phép đổi rồi bắt đầu ván có mã mới.
- Khi máy cờ lỗi hoặc không trả lời quá 10 giây, hiện “Máy cờ gặp sự cố” và Thử lại. Nếu máy chủ báo chỉ hết thời gian chờ, Thử lại tìm nước trên cùng ván/thế; nếu ván đã bỏ dở, tạo ván mới cùng cấp và phe thực tế đã bốc.
- Không gửi lại nước của người chơi khi thử lại. Chặn bấm trùng lúc đang xử lý. Khi máy chủ khởi động lại làm mất trạng thái ván, hiện “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc chủ động tạo ván mới.

**Việc cần làm**

- Dựng hộp chọn và màn bàn cờ tinh gọn, nối thao tác người chơi với dịch vụ ván máy.
- Dựng các trạng thái đang nghĩ, lỗi, thử lại, kết quả và quay về Sảnh; giữ nhãn lượt và thao tác rõ trên điện thoại.
- Kiểm luồng bình thường bằng máy cờ thật; kiểm hình thức trạng thái lỗi theo dữ liệu phản hồi trước khi thử sự cố thật.

**Kết quả bàn giao**

- Giao diện đấu máy đầy đủ, gồm kết quả và sự cố/Thử lại.

**Điều kiện hoàn thành**

- Đúng người đi đầu và hướng bàn; ván mới dùng lựa chọn được xác nhận; thử lại không nhân đôi nước người.

**Phạm vi và phối hợp**

Giao diện không tự quyết định phục hồi ván. Hành vi sự cố thật được nghiệm thu sau khi phần giữ ván và xử lý lỗi phía máy chủ hoàn tất.

#### T43 · Kiểm thử US-08.1

**Mục tiêu**

Kiểm chứng người dùng chọn cấp độ, chọn phe và chơi ván mới với máy đúng lựa chọn.

**Bối cảnh công việc**

Chuẩn bị tài khoản chính thức và phiên Khách, dùng máy cờ thật với các cấp đã cung cấp. Mỗi trường hợp ghi lựa chọn ban đầu, phe thực tế và danh tính ván để đối chiếu.

**Yêu cầu cần đáp ứng**

- Từ Sảnh mở thiết lập phải có ba cấp Dễ/Trung bình/Khó và ba lựa chọn Đỏ/Đen/Ngẫu nhiên. Thử từng cấp và từng phe, không chỉ giá trị mặc định.
- Chọn Đỏ thì người đi trước. Chọn Đen thì máy tự đi đầu và bàn cờ hiển thị Đen phía dưới. Không cho người đi quân trong lúc chưa tới lượt.
- Chọn Ngẫu nhiên nhiều lần; ghi số lần Đỏ/Đen để kiểm tỷ lệ xấp xỉ 50/50 và xác minh máy chủ là nơi bốc phe. Nêu trước số lần thử và cách đánh giá để kết quả đo có thể lặp lại.
- Màn đấu máy không có đồng hồ, Xin hoà, gợi ý nước đi hoặc Đi lại; có Đầu hàng. Kết thúc tự nhiên và kết thúc do đầu hàng đều có Ván mới/Về Sảnh.
- Ván mới mở hộp thiết lập điền sẵn cấp và lựa chọn phe ván trước, kể cả lựa chọn Ngẫu nhiên. Thử đổi cấp, đổi phe rồi bắt đầu; ván mới phải có mã khác và đúng người đi trước.
- Về Sảnh phải kết thúc luồng kết quả rõ ràng, không tự khôi phục ván đã kết thúc hoặc làm xuất hiện chức năng ngoài phạm vi.

**Việc cần làm**

- Viết các tình huống cho cả ba cấp và ba lựa chọn phe, thêm kết thúc do đầu hàng và kết thúc theo luật.
- Quan sát giao diện và phản hồi máy chủ để xác minh lượt, phe và mã ván; ghi dữ liệu các lần bốc ngẫu nhiên.
- Lưu bằng chứng, phân loại đạt/không đạt/chưa thể kiểm và kiểm lại lỗi sau sửa.

**Kết quả bàn giao**

- Bộ tình huống cùng báo cáo luồng thiết lập, chơi và tạo ván máy mới.

**Điều kiện hoàn thành**

- Đúng lượt đầu, hướng bàn và giá trị điền lại; mỗi ván mới có danh tính riêng.

**Phạm vi và phối hợp**

Không dùng kết quả này để khẳng định máy cấp Khó đủ mạnh hoặc đủ nhanh; chất lượng tìm nước và khôi phục sau sự cố có phần kiểm riêng.

#### T59 · Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh

**Mục tiêu**

Tinh chỉnh sức chơi và đo tốc độ máy cờ để ba cấp có chất lượng kiểm chứng được.

**Bối cảnh công việc**

Bộ máy chọn nước đã có; bộ 50 thế giữa ván và bộ chiếu hết một hoặc hai nước đã có đáp án độc lập. Công việc tập trung vào cách đánh giá thế cờ, lựa chọn nhánh tìm kiếm và đo kết quả trên máy dùng để trình diễn.

**Yêu cầu cần đáp ứng**

- Ba cấp Dễ, Trung bình, Khó có mục tiêu độ sâu tìm kiếm tương ứng 2, 4, 6 nửa nước, mỗi nửa nước là một lần đi của một bên và ngân sách phản hồi 300, 1.000, 3.000 mili giây. Báo cả độ sâu thực tế và thời gian, không chỉ độ sâu đặt trong cấu hình.
- Khi hết thời gian mà chưa đạt độ sâu mục tiêu, trả nước hợp lệ tốt nhất đã tìm được. Máy không được trả nước sai luật hoặc làm luồng xử lý ván online bị chậm do chiếm tài nguyên.
- Cấp Khó phải giải đúng toàn bộ bộ chiếu hết một hoặc hai nước bắt buộc. Đấu tự động 20 ván cho mỗi cặp cấp liền nhau, báo riêng số thắng, hoà, thua; Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván.

**Việc cần làm**

- Điều chỉnh cách chấm điểm thế cờ, thứ tự thử nước và loại nhánh không cần thiết; giữ các kiểm thử luật để việc tăng tốc không làm sai nước.
- Chạy cùng bộ 50 thế ở mỗi cấp trên máy trình diễn. Lưu thời gian từng lần, độ sâu đạt được, nước trả về, cấu hình máy và phiên bản phần mềm.
- Tính mốc thời gian mà ít nhất 95% lượt đo không vượt quá, đối chiếu lần lượt 300, 1.000 và 3.000 mili giây. Chạy lại bộ chiếu hết và các cặp đấu máy, giữ dữ liệu thô để người kiểm thử đối chiếu.

**Kết quả bàn giao**

- Bộ máy cờ đã tinh chỉnh, cấu hình ba cấp và báo cáo tốc độ, độ sâu, độ đúng, sức chơi tương đối.
- Dữ liệu đo từng thế cùng kết quả từng ván đấu máy, đủ để lặp lại trên cùng máy.

**Điều kiện hoàn thành**

- Ngưỡng thời gian, tính hợp lệ, bộ chiếu hết và phân biệt sức chơi có bằng chứng đáp ứng; không chỉ nêu “cảm giác nhanh hơn”.
- Nếu chưa đạt, ghi đúng điểm chưa đạt và tác động để người phụ trách sản phẩm xử lý, không tự hạ mục tiêu hoặc tuyên bố hoàn tất.

**Phạm vi và phối hợp**

Không xây giao diện báo lỗi hoặc tự tạo đáp án để chấm chính mình. Dùng bộ dữ liệu đã chuẩn bị, bàn giao số đo cho kiểm thử độc lập.

#### T63 · BE giữ ván AI 30 phút, Thử lại, khởi động lại

**Mục tiêu**

Giữ và phục hồi trạng thái ván với máy khi người chơi mất kết nối hoặc bộ máy tính nước gặp sự cố.

**Bối cảnh công việc**

Ván với máy chỉ lưu trạng thái đang chơi trong bộ nhớ máy chủ, không tạo lịch sử ván ở phiên bản này. Người chơi cần biết trường hợp nào còn tiếp tục được và trường hợp nào phải bắt đầu ván mới.

**Yêu cầu cần đáp ứng**

- Sau khi mất kết nối hoặc đóng thẻ, giữ ván tối đa 30 phút để người chơi quay lại đúng đường dẫn và thế cờ. Quá hạn thì bỏ trạng thái khỏi bộ nhớ.
- Bộ máy tính nước không phản hồi quá 10 giây hoặc báo lỗi phải trả thông tin sự cố cùng khả năng Thử lại. Nếu chỉ quá thời gian chờ thì tìm lại trên cùng thế; nếu ván đã bị đánh dấu bỏ dở thì tạo ván mới cùng cấp và phe thực tế.
- Bấm Thử lại liên tiếp chỉ được xử lý một lần; không khởi chạy nhiều lượt tính nước hoặc áp hai nước cho cùng lượt.
- Sau khi máy chủ khởi động lại, nếu trạng thái không còn thì báo “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc tạo ván mới; không giả khôi phục.
- Chủ động Rời ván hoặc Đăng xuất cần xác nhận đầu hàng. Đồng ý thì kết thúc, huỷ việc tính nước và giải phóng vị trí chơi; Huỷ thì giữ nguyên.

**Việc cần làm**

- Quản lý thời hạn giữ ván và tác vụ tính nước cùng danh tính người chơi. Kiểm quyền mỗi yêu cầu tiếp tục hoặc thử lại, không chỉ kiểm đường dẫn ván.
- Phân biệt quá thời gian chờ, lỗi tác vụ và ván đã bỏ dở để trả kết quả đủ cho giao diện báo đúng hậu quả.
- Viết kiểm thử ngắt mạng trước, trong và sau lượt máy; quay lại trong hoặc quá hạn; gửi thử lại trùng; rời ván lúc máy đang nghĩ; máy chủ khởi động lại.

**Kết quả bàn giao**

- Xử lý phía máy chủ về giữ ván, thử lại, huỷ tác vụ và giải phóng chỗ chơi.
- Bộ kiểm thử cùng dữ liệu phản hồi cho giao diện sự cố.

**Điều kiện hoàn thành**

- Ván còn hạn được tiếp tục đúng thế; ván mất trạng thái không được tiếp tục bằng dữ liệu đoán.
- Không áp nước trùng, không giữ vị trí chơi sau khi đã đầu hàng; thông báo thử lại phân biệt đúng tiếp tục ván cũ và tạo ván mới.

**Phạm vi và phối hợp**

Không làm lại giao diện thông báo hoặc điều chỉnh sức chơi của máy cờ. Công việc này quản lý vòng đời ván và tác vụ phía máy chủ.

#### T68 · Kiểm thử US-08.3

**Mục tiêu**

Kiểm chứng phục hồi ván với máy và chất lượng ba mức chơi.

**Bối cảnh công việc**

Dùng máy dự kiến trình diễn, bộ 50 thế giữa ván và bộ chiếu hết một hoặc hai nước đã có đáp án kiểm chứng. Chuẩn bị cách ngắt mạng, gây lỗi hoặc trì hoãn bộ máy tính nước, khởi động lại máy chủ; ghi cấu hình máy và bản phần mềm khi đo.

**Yêu cầu cần đáp ứng**

- Đóng thẻ trình duyệt/mất mạng rồi về trong 30 phút: mở đúng ván hoặc nút Quay lại ở Sảnh và tiếp tục thế cũ. Quá hạn xoá trạng thái bộ nhớ, không lưu lịch sử.
- Máy cờ lỗi hoặc không trả lời quá 10 giây hiện “Máy cờ gặp sự cố” và Thử lại. Chỉ quá thời gian chờ thì tìm nước trên cùng thế; ván đã Bỏ dở thì tạo ván mới cùng cấp và phe thực tế, không bốc lại phe ngẫu nhiên.
- Bấm Thử lại liên tiếp chỉ xử lý một lần. Khởi động lại máy chủ thì hiện “Ván không còn trạng thái để tiếp tục”, cho về Sảnh hoặc tạo ván mới, không khôi phục giả.
- Rời ván/Đăng xuất chủ động phải xác nhận đầu hàng; Đồng ý kết thúc, huỷ tác vụ máy và giải phóng vị trí; Huỷ giữ nguyên.
- Đo 50 thế giữa ván ở mỗi cấp trên máy demo: độ sâu mục tiêu Dễ/Trung bình/Khó là 2/4/6; thời gian tại mốc 95% mẫu không vượt quá phải không quá 300/1.000/3.000 mili giây tương ứng. Ghi độ sâu thực, không chỉ cấu hình.
- Cấp Khó giải đúng 100% bộ chiếu hết một và hai nước bắt buộc có đáp án độc lập. Đấu 20 ván mỗi cặp cấp liền nhau: Khó thắng Trung bình và Trung bình thắng Dễ ở đa số ván, ghi thắng/hoà/thua.

**Việc cần làm**

- Chuẩn bị máy demo và bộ thế có đáp án độc lập; ghi bản phần mềm, thiết bị và cấu hình cho mọi phép đo.
- Kiểm mất mạng trước/trong/sau lượt máy, quay lại trước/sau 30 phút; gây lỗi tìm nước và thử bấm Thử lại nhiều lần.
- Khởi động lại máy chủ, rời hoặc đăng xuất khi máy đang nghĩ; kiểm không áp nước cũ hay giữ vị trí sau đầu hàng.
- Chạy 50 thế mỗi cấp, lưu từng thời gian và độ sâu; tính mốc 95%, kiểm chiếu hết bắt buộc và 20 ván mỗi cặp cấp.
- Ghi từng ca là Đạt, Không đạt hoặc Chưa kiểm được cùng dữ liệu, thời điểm và bằng chứng đã che bí mật. Báo lỗi có cách tái hiện; sau sửa chạy lại ca lỗi và các nhánh liên quan.

**Kết quả bàn giao**

- Bộ ca kiểm có bước chạy, dữ liệu và kết quả mong đợi để thành viên khác thực hiện lại được.
- Bảng kết quả thực tế cùng bằng chứng và danh sách lỗi còn mở; các lượt kiểm lại giữ được liên hệ với lỗi ban đầu.

**Điều kiện hoàn thành**

- Mọi tình huống nêu trên có kết quả đúng và bằng chứng lặp lại được; sai quyền, sai kết quả hoặc sai hạn thời gian phải ghi Không đạt, chưa được kết luận hoàn tất.
- Thiếu thiết bị, thiếu dữ liệu hoặc lỗi của phần tích hợp phải ghi rõ là Chưa kiểm được; việc người phụ trách biết vấn đề không thay thế kết quả đạt.

**Phạm vi và phối hợp**

Công việc này chuẩn bị và thực hiện kiểm thử cho phạm vi trên. Người triển khai chức năng chịu trách nhiệm sửa lỗi; kết quả kiểm cục bộ không thay thế việc nghiệm thu toàn bộ sản phẩm.


## 8. Dự phòng và điều kiện đổi kế hoạch

Ngày04/11 không phân Task mới: ưu tiên sửa lỗi và chạy lại các kiểm tra ảnh hưởng trên cùng bản dựng. Nếu việc bắt buộc vẫn FAIL/BLOCKED, báo PO với số đo và tác động; không tự cắt P1 hoặc đổi ngưỡng. Tình kín 56 giờ ở S1 và S2 nên vẫn là điểm tập trung rủi ro; phát hiện trễ phải cập nhật dữ liệu lịch và kiểm lại ngay.

Thời gian chuyển sang FE/data giữ nguyên tổng phạm vi: T33 chuyển 8h UI sang T58; T52 chuyển 4h overlay sang T25; T59 chuyển 4h UI sang T38 và 4h dữ liệu đáp án sang T02. T42/T46/T65 chuyển khỏi Tình. T04 +8h thử auth/phục hồi, T06 +8h thử phiên, T13/T17/T69 mỗi Task +4h kiểm biên: tăng tổng từ 892 lên 920h.

## 9. Chuẩn bị nhập Jira

Components và Labels của 107 mục đã khai báo trong dữ liệu nguồn và CSV. Xem [danh mục và phân loại đầy đủ](jira/COMPONENTS-LABELS.md); tạo/đối chiếu Components trước khi nhập, ánh xạ đủ các cột Components/Labels lặp tên. Nhãn chinh-fe/chinh-be/chinh-qa-devops xác định nhóm chính của Task.

1. Lưu/export bản Jira hiện có và xác định chính xác tập mục cũ cần thay. Tệp này không tự xoá hay nhập dữ liệu.
2. Tạo bốn Sprint theo mục 3 và bốn Fix version; Epic/Story không gán Sprint.
3. Ánh xạ bảy tên Assignee/Reporter sang tài khoản Jira thực tế; kiểm quyền và các trường Time tracking/Story Points dành cho Task. CSV hiện giữ tên người để PO kiểm, chưa có định danh tài khoản Jira.
4. Thử nhập và kiểm trên cấu hình Jira thực tế: UTF-8, ngày dd/MM/yyyy, Original Estimate tính bằng giây; Issue Id/Parent Id ánh xạ quan hệ, Story ánh xạ relates to, các cột Blocked by ánh xạ is blocked by. Không giả định mọi giao diện nhập đều nhận các trường giống nhau.
5. Sau thử nhập, đếm9/27/71, kiểm cha Epic, liên kết Story/phụ thuộc, người làm, Sprint/ngày/điểm/giờ và trạng thái To Do. Nếu trình nhập không nhận liên kết bằng ID nội bộ, lập bảng ID→issue key sau nhập rồi tạo liên kết theo bảng đó.

## 10. Tái tạo và kiểm tra

Nguồn lịch, phân công và phạm vi: `jira/plan-data.json`. Nguồn Description của toàn bộ 107 mục: `jira/descriptions.json`; sửa tệp này rồi sinh lại, không sửa riêng CSV hoặc bản Markdown. Nguồn luật/AC: BA và BACKLOG-P1. Bản đồ nghiệm thu: `jira/AC-TASK-MAP.json`. Chạy `python3 jira/build_plan.py` để sinh lại tệp; `python3 jira/build_plan.py --check` kiểm số lượng, lịch, phụ thuộc, người kiểm độc lập, đầu vào268AC và độ đồng bộ các đầu ra. Không cần thư viện ngoài. Báo cáo: [KIEM-TRA-KE-HOACH](jira/KIEM-TRA-KE-HOACH.md).
