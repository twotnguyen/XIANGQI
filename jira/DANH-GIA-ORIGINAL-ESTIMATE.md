> **Đã áp dụng vào kế hoạch local.** Phần dưới lưu cơ sở đánh giá lúc đề xuất; bảng phân công hiện hành và lịch là [PHAN-CONG-CAN-BANG.md](PHAN-CONG-CAN-BANG.md). Tổng 848 giờ; T49 giữ Kỳ.

# Đề xuất giảm Original Estimate với AI agent — 09/10/2026

**Thay thế hai đề xuất tăng lên 1.840 và 1.000 giờ. Đã áp dụng local, chưa cập nhật Jira.** Mục tiêu là tìm phần tiết kiệm hợp lý từ 920 giờ, không tăng ngân sách và không cắt yêu cầu nghiệm thu.

## Kết quả

**920 → 848 giờ**, giảm **72 giờ (7.8%)**. Giảm 18 Task, giữ 53 Task, không Task nào tăng. Đây là mức ước lượng áp dụng để lập kế hoạch, chưa được xác nhận bằng tốc độ thực tế của nhóm. Không áp một tỷ lệ giảm chung vì có AI.

## Phần công việc được rút ngắn

AI hỗ trợ dựng giao diện từ thành phần chung, thao tác dữ liệu, cấu hình, ca tự kiểm và dữ liệu thử. Giờ giảm đến từ bớt viết mã lặp và tránh làm lại phần đã bàn giao; người nhận vẫn phải hiểu mã, tích hợp, tự kiểm và sửa cục bộ. Không giảm tiêu chí nghiệm thu, bỏ ca lỗi hoặc lấy kết quả AI làm đáp án chuẩn duy nhất.

Điều kiện: thiết kế/hợp đồng dữ liệu rõ; Task trước bàn giao được; có tài khoản, thiết bị và công cụ thử; thành viên dùng được công nghệ phụ trách. Thời gian học công nghệ từ đầu hoặc làm lại kiến trúc không được giả định là miễn phí. AI hỗ trợ tốt không đồng nghĩa mọi Task đều tự động nhanh hơn một tỷ lệ cố định.

## 18 Task đề xuất giảm

| Task | Công việc | Giờ cũ | Giờ đề xuất | Cơ sở giảm và phần vẫn phải làm |
|---|---|---|---|---|
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | 16 | 12 | AI dựng bộ thành phần và các trạng thái theo thiết kế đã chốt; tái dùng thành phần do nhóm dựng theo DESIGN; không thêm thư viện giao diện dựng sẵn. Phần giảm là viết giao diện lặp, vẫn giữ kiểm bàn phím, tương phản và màn hình nhỏ. |
| T08 | FE màn Đăng ký 3 bước | 12 | 8 | Dùng lại biểu mẫu T03 và bộ kiểm tên; AI dựng ba bước, nhập mã và thông báo. Giữ thử đăng ký thật và lỗi; chỉ khả thi khi dịch vụ đã bàn giao ổn. |
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | 16 | 12 | AI hỗ trợ SVG, vị trí quân và phép xoay trên quy ước toạ độ rõ. Vẫn kiểm 32 quân, chữ Hán, hai hướng, kích thước và nhãn trợ năng. |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | 16 | 12 | AI soạn lược đồ, tệp tạo bảng và dữ liệu mẫu từ mô hình chốt; ghép bảng đã có thay vì làm lại. Không bỏ kiểm quyền trực tiếp hoặc dựng từ dữ liệu trống. |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | 24 | 20 | Tái dùng bàn T11 và luật, AI hỗ trợ thao tác con trỏ, dấu nước và âm thanh. Giảm công viết mã lặp; giữ kiểm chuột/cảm ứng, hướng Đen và giảm chuyển động. |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | 16 | 12 | AI dựng form và trạng thái ghế từ thành phần chung, nối hợp đồng phòng đã có. Giữ thử hai phía và huỷ đếm; không xây chat/media trong Task này. |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | 16 | 12 | Tái dùng kiểm quyền, vị trí chơi và xếp chỗ của phòng; AI hỗ trợ tra mã, giữ đích và ca tranh ghế. Giữ kiểm đồng thời, không chỉ kiểm đường thành công. |
| T25 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | 20 | 16 | Ghép bàn tương tác đã có với hợp đồng trạng thái chung; AI hỗ trợ lớp phủ, đồng hồ và nhãn kết quả. T46 làm thao tác sau ván, tránh dựng trùng; vẫn kiểm đồng bộ thật. |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | 24 | 20 | AI hỗ trợ thao tác dữ liệu bạn bè, sinh dữ liệu biên và ca gửi chéo; dùng kết nối và quyền phòng chung. Vẫn kiểm thời hạn, giới hạn và lời mời hai phía. |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | 16 | 12 | Luật và máy tìm nước đã có; AI hỗ trợ ghép dịch vụ ván, lựa chọn phe và ca tự kiểm. Phục hồi/sự cố ở T63, không tính lại; giữ kiểm kết quả máy đến muộn. |
| T38 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | 16 | 12 | Dùng lại bàn, hộp chọn và khung kết quả; AI dựng các trạng thái lượt máy/lỗi. Giữ thử máy thật và chống gửi nước trùng, không viết thuật toán trong FE. |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | 16 | 12 | AI dựng danh sách, tìm kiếm và chuông bằng thành phần chung; dùng cùng kiểu đề nghị. Giữ kiểm hai phía/hết hạn; giả định người làm đã sử dụng được nền FE. |
| T42 | FE khung chat hai kênh | 12 | 8 | AI dựng hai bố cục chat và trạng thái gửi trên cùng thành phần; máy chủ cấp tập tin đúng quyền. Giữ kiểm không chạy mã và không giữ tin cặp cũ. |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | 12 | 8 | Tái dùng biểu mẫu T08/T15 và chuyển hướng T26; AI dựng màn thiết lập và hộp Khách. Giữ Google thật, email trùng, thiết lập bắt buộc và ẩn chức năng đúng quyền. |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | 16 | 12 | Tái dùng kiểm tham gia và giữ chỗ chung; AI hỗ trợ ba chế độ, hiệu lực mã và ca quyền. Vẫn kiểm mã cũ, lời mời cũ và tranh chấp lúc khoá. |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | 12 | 8 | AI dựng truy vấn/dữ liệu danh sách và phát thay đổi, tái dùng xếp chỗ T22. Giữ kiểm tối đa 50 phòng, dữ liệu cũ, tranh ghế và đo cập nhật. |
| T57 | FE Cài đặt phòng | 8 | 4 | Một hộp chọn dùng lại thành phần, dịch vụ chế độ và dữ liệu chia sẻ đã có; AI dựng nhanh các trạng thái. Vẫn kiểm quyền chủ, thiếu ghế, lỗi và mã mới. |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | 16 | 12 | Ghép các lối vào và thanh điều hướng đã có; AI hỗ trợ danh sách và trình bày luật từ nội dung chốt. Không làm lại chuông/hồ sơ; vẫn rà luật, điện thoại và quyền Khách. |


## Các phần giữ nguyên

Giữ toàn bộ Task kiểm thử độc lập, dữ liệu chuẩn, hồi quy, đo chất lượng, đóng gói và tổng duyệt. Những Task 4–8 giờ đã khá sát; không tiếp tục cắt chỉ vì có thể sinh ca tự động. Các ước lượng cũ này vẫn cần theo dõi khi thực hiện, không được hiểu là đã chứng minh đủ.

Giữ lõi luật T05/T07/T10, máy cờ T24/T59, kết nối T12, xác thực T04/T09/T35/T56, media T06/T33/T58 và các phần kết thúc/phục hồi nhạy cảm. AI giúp viết mã nhưng chưa có phép đo chứng minh có thể rút thêm công tích hợp và xác minh. Nếu thực tế hoàn thành sớm thì ghi nhận và cập nhật công còn lại, không cần hạ mọi ước lượng trước.

## Toàn bộ 71 Task

| Task | Công việc | Hiện tại | Đề xuất | Kết luận |
|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | 8 | 8 | Giữ nguyên |
| T02 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | 20 | 20 | Giữ nguyên |
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | 16 | 12 | Giảm 4 giờ |
| T04 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | 24 | 24 | Giữ nguyên |
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | 8 | 8 | Giữ nguyên |
| T06 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | 24 | 24 | Giữ nguyên |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | 8 | 8 | Giữ nguyên |
| T08 | FE màn Đăng ký 3 bước | 12 | 8 | Giảm 4 giờ |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | 16 | 16 | Giữ nguyên |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | 8 | 8 | Giữ nguyên |
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | 16 | 12 | Giảm 4 giờ |
| T12 | Khung realtime Socket.IO | 24 | 24 | Giữ nguyên |
| T13 | Kiểm thử US-01.1 | 8 | 8 | Giữ nguyên |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | 16 | 12 | Giảm 4 giờ |
| T15 | FE màn Đăng nhập | 8 | 8 | Giữ nguyên |
| T16 | Kiểm thử US-04.2 | 4 | 4 | Giữ nguyên |
| T17 | Kiểm thử US-01.2 | 8 | 8 | Giữ nguyên |
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | 24 | 24 | Giữ nguyên |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | 24 | 20 | Giảm 4 giờ |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | 24 | 24 | Giữ nguyên |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | 16 | 12 | Giảm 4 giờ |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | 16 | 12 | Giảm 4 giờ |
| T23 | BE đồng hồ thi đấu và hết giờ | 8 | 8 | Giữ nguyên |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | 32 | 32 | Giữ nguyên |
| T25 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | 20 | 16 | Giảm 4 giờ |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | 8 | 8 | Giữ nguyên |
| T27 | Kiểm thử US-04.3 | 4 | 4 | Giữ nguyên |
| T28 | Kiểm thử US-02.1 | 8 | 8 | Giữ nguyên |
| T29 | Kiểm thử US-03.1 | 8 | 8 | Giữ nguyên |
| T30 | Kiểm thử US-05.1 | 8 | 8 | Giữ nguyên |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | 24 | 20 | Giảm 4 giờ |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | 12 | 12 | Giữ nguyên |
| T33 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | 24 | 24 | Giữ nguyên |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | 16 | 12 | Giảm 4 giờ |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | 24 | 24 | Giữ nguyên |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | 8 | 8 | Giữ nguyên |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | 16 | 16 | Giữ nguyên |
| T38 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | 16 | 12 | Giảm 4 giờ |
| T39 | Kiểm thử US-05.2 | 4 | 4 | Giữ nguyên |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | 16 | 12 | Giảm 4 giờ |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | 12 | 12 | Giữ nguyên |
| T42 | FE khung chat hai kênh | 12 | 8 | Giảm 4 giờ |
| T43 | Kiểm thử US-08.1 | 8 | 8 | Giữ nguyên |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | 12 | 8 | Giảm 4 giờ |
| T45 | Kiểm thử US-07.2 | 8 | 8 | Giữ nguyên |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | 8 | 8 | Giữ nguyên |
| T47 | Kiểm thử US-07.1 | 8 | 8 | Giữ nguyên |
| T48 | Kiểm thử US-01.3 | 8 | 8 | Giữ nguyên |
| T49 | Kiểm thử US-03.2 | 8 | 8 | Giữ nguyên |
| T50 | Kiểm thử US-02.2 | 4 | 4 | Giữ nguyên |
| T51 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | 24 | 24 | Giữ nguyên |
| T52 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | 12 | 12 | Giữ nguyên |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | 16 | 12 | Giảm 4 giờ |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | 12 | 8 | Giảm 4 giờ |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | 16 | 16 | Giữ nguyên |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | 24 | 24 | Giữ nguyên |
| T57 | FE Cài đặt phòng | 8 | 4 | Giảm 4 giờ |
| T58 | FE danh sách người xem, thao tác ghế và khung camera/mic | 20 | 20 | Giữ nguyên |
| T59 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | 12 | 12 | Giữ nguyên |
| T60 | Kiểm thử US-05.3 | 4 | 4 | Giữ nguyên |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | 16 | 12 | Giảm 4 giờ |
| T62 | Kiểm thử US-06.1 | 4 | 4 | Giữ nguyên |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | 12 | 12 | Giữ nguyên |
| T64 | Kiểm thử US-06.3 | 8 | 8 | Giữ nguyên |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | 8 | 8 | Giữ nguyên |
| T66 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | 16 | 16 | Giữ nguyên |
| T67 | Kiểm thử US-06.2 | 8 | 8 | Giữ nguyên |
| T68 | Kiểm thử US-08.3 | 8 | 8 | Giữ nguyên |
| T69 | Kiểm thử US-01.4 | 8 | 8 | Giữ nguyên |
| T70 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | 4 | 4 | Giữ nguyên |
| T71 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | 4 | 4 | Giữ nguyên |


## Phân công đã áp dụng

| Người | Task | Giờ |
|---|---|---|
| Tình | 10 | 140 |
| Đông | 9 | 136 |
| Tùng | 9 | 132 |
| Cường | 10 | 124 |
| Nhạn | 11 | 104 |
| Kỳ | 12 | 108 |
| Thư | 10 | 104 |
| Tổng | 71 | 848 |

T20 chuyển Tùng; T54/T59 chuyển Đông; T49 giữ Kỳ. Phân công và lịch chi tiết ở PHAN-CONG-CAN-BANG.md. Cột giờ cũ trong bảng đánh giá giữ mốc 920 giờ để đối chiếu, không phải giờ hiện hành.

## Lịch và trạng thái áp dụng

Đã cập nhật dữ liệu kế hoạch và CSV sang 848 giờ, đổi người ở T20/T54/T59 và tính lại lịch. Giữ nguyên Description và số lượng mục. Tổng duyệt sáng 04/11; chiều 04/11 dự phòng. Giờ tiết kiệm có thể tạo khoảng trống cho review và sửa lỗi, nhưng đó không phải việc đã được phân công hoặc ước lượng riêng.

Báo cáo này thay kết luận trước về tổng giờ; giữ lịch sử hai số đã bỏ trong dữ liệu đánh giá để tránh dùng nhầm. Đã đối chiếu đủ 71 Task, giờ hiện tại và dấu kiểm Description; tổng giảm 72 giờ, không có thay đổi giờ âm hoặc Task tăng.
