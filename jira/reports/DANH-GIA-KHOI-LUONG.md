# Đánh giá nội dung 71 Task — giờ và người đồng bộ 10/10/2026

Đánh giá tương đối theo nội dung trước khi phân người; xét phạm vi đầu ra, độ khó xử lý, số phần phải tích hợp và gánh nặng kiểm chứng/rủi ro. Không tính từ Original Estimate hay số AC. Không phải thước đo năng suất cá nhân hoặc giờ thực tế.

Đơn vị tải dưới đây là nhận định tương đối để phân công, không phải giờ, Story Points trên Jira hoặc thước đo năng lực. Không lấy giờ hay số tiêu chí nghiệm thu làm công thức tính. Giờ và người lấy theo Jira hiện tại (880 giờ), lý do đánh giá tải tương đối giữ từ đợt 09/10; điều này không xác nhận các ước lượng đã chính xác.

| Mức tải | Cách hiểu |
|---|---|
| 2 | Nhẹ: phạm vi hẹp, tái dùng nhiều, ít nhánh liên chức năng. |
| 3 | Vừa: một luồng rõ, có nhiều trạng thái/biên cần xử lý hoặc kiểm. |
| 5 | Nặng: nhiều nhánh, dữ liệu/quyền hoặc nhiều thiết bị; cần tích hợp/kiểm chứng đáng kể. |
| 8 | Rất nặng: nhiều cơ chế liên kết, tình huống đồng thời hoặc dữ liệu/đáp án phức tạp. |
| 13 | Trọng yếu: thuật toán/dịch vụ khó hoặc trách nhiệm xuyên toàn sản phẩm; bất định và phạm vi lớn. |


Mỗi lý do xét đầu ra, nhánh xử lý, phần cần phối hợp và trách nhiệm kiểm chứng. T10 có ít giờ nhưng nhiều quy tắc kết thúc ván; T15 chủ yếu dùng lại thành phần biểu mẫu đăng nhập. T68/T69 có phạm vi kiểm rộng dù chỉ 8 giờ mỗi Task: cần chuẩn bị dữ liệu và môi trường trước, ghi nhận thời gian thực và cập nhật lịch nếu vượt dự kiến. Không coi điểm tải là bằng chứng chắc chắn không quá tải.

| Task | Công việc | Người | Giờ dự kiến | Đơn vị tải | Cơ sở đánh giá |
|---|---|---|---|---|---|
| T01 | Dựng monorepo, CI, nhật ký và /health | Tình | 8 | 5 | Hạ tầng chung, chạy nhiều phần và phát hiện mã lỗi; cần bàn giao cách chạy ổn định cho cả nhóm. |
| T02 | Kế hoạch kiểm thử, TC nền tảng và dữ liệu chuẩn luật/máy cờ | Thư | 32 | 8 | Không chỉ viết mẫu kiểm thử: phải xác minh đáp án luật, bộ chiếu hết và 50 thế, làm nền cho mọi đợt nghiệm thu. |
| T03 | Khung giao diện chung: theme, layout, router, thành phần 5 trạng thái | Kỳ | 12 | 5 | Nhiều thành phần giao diện dùng lại, năm trạng thái, màn hình nhỏ và trợ năng; sai nền gây sửa nhiều màn. |
| T04 | BE đăng ký, SMTP, phục hồi tài khoản và thử xác thực sớm | Đông | 24 | 8 | Ba bước xác thực, thư ngoài, giành tên đồng thời, dọn/phục hồi an toàn và thử trực tiếp dịch vụ tài khoản. |
| T05 | Lõi luật cờ (1/3): bàn cờ và nước đi, ăn quân của 7 loại quân | Tùng | 8 | 5 | Bảy loại quân có ngoại lệ khác nhau, biểu diễn trạng thái dùng chung; 8 giờ không phản ánh hết độ khó luật. |
| T06 | Spike media LAN/Cloud/HTTPS và thử mô hình phiên | Cường | 24 | 8 | Hai môi trường truyền hình/tiếng, nhiều thiết bị, quyền phát/thu hồi và thử phiên; rủi ro cấu hình cao. |
| T07 | Lõi luật cờ (2/3): nước hợp lệ, chiếu, chiếu hết, hết nước | Tùng | 8 | 5 | Phải loại nước tự chiếu và hai Tướng đối mặt, phân biệt chiếu hết/hết nước; ảnh hưởng mọi ván. |
| T08 | FE màn Đăng ký 3 bước | Kỳ | 8 | 3 | Biểu mẫu ba bước có bộ đếm và lỗi; xử lý chủ yếu theo phản hồi máy chủ đã có hợp đồng. |
| T09 | BE đăng nhập username, khoá thử sai, ghi nhớ đăng nhập | Tùng | 16 | 5 | Bảo mật đăng nhập, bộ đếm theo tên chuẩn hóa, hạn cố định và ngoại lệ Google; nhiều biên thời gian. |
| T10 | Lõi luật cờ (3/3): luật kết thúc ván, perft, độ phủ kiểm thử | Tùng | 8 | 8 | Chu kỳ lặp, chiếu liên tục và ưu tiên kết quả phải đúng trên mọi nhánh; thêm đối chiếu số chuỗi nước độc lập. |
| T11 | FE bàn cờ SVG: vẽ, quân, lật bàn, responsive, nhãn trợ năng | Nhạn | 16 | 5 | Vẽ đúng tọa độ/quân, lật phe, co giãn và nhãn trợ năng; cần kiểm hình học và thiết bị. |
| T12 | Khung realtime Socket.IO | Tình | 24 | 8 | Nền truyền tin cho nhiều chức năng: xác thực, chống trùng, phiên bản, nối lại và chuyển quyền giữa các thẻ. |
| T13 | Kiểm thử US-01.1 | Thư | 8 | 5 | Email và dịch vụ thật, lỗi giữa hai bước lưu, dọn đồng thời, giành tên và kiểm quyền trực tiếp; không chỉ thử biểu mẫu. |
| T14 | Lược đồ CSDL P1, RLS, migration, dữ liệu mẫu | Đông | 12 | 5 | Nhiều bảng liên hệ, ràng buộc duy nhất và phân quyền dữ liệu; phải chạy được từ cơ sở dữ liệu trống. |
| T15 | FE màn Đăng nhập | Kỳ | 8 | 2 | Màn nhập liệu tập trung, dùng khung và phản hồi xác thực có sẵn; ít trạng thái liên phòng hơn màn đấu. |
| T16 | Kiểm thử US-04.2 | Tình | 4 | 2 | Phạm vi hiển thị bàn cờ xác định; vẫn cần thiết bị thật và trợ năng, không coi là chỉ nhìn ảnh. |
| T17 | Kiểm thử US-01.2 | Nhạn | 8 | 3 | Bộ đếm sai, tên không tồn tại và hạn phiên cần dữ liệu/thời gian kiểm soát được; phạm vi một luồng đăng nhập. |
| T18 | BE tạo phòng, mã/link, ghế, Đổi ghế tự do, Sẵn sàng, đếm 3-2-1, chuyển Host | Tùng | 24 | 8 | Vòng đời phòng, ghế, sẵn sàng, đếm ngược, mất kết nối và chuyển chủ; nhiều người có thể thao tác cùng lúc. |
| T19 | FE đi cờ click/kéo thả, gợi ý ô, đánh dấu, âm thanh | Nhạn | 24 | 8 | Hai cách đi quân và cảm ứng, tọa độ bàn lật, chọn/hủy, âm thanh và giảm chuyển động; giao diện tương tác khó. |
| T20 | BE ván online: tạo ván, phân xử nước đi, kết thúc ván, lưu ván | Tùng | 24 | 8 | Quyền và luật trên máy chủ, lưu nước bền, chống trùng và kết quả duy nhất; nền cho toàn bộ ván trực tuyến. |
| T21 | FE hộp Tạo phòng và phòng chờ: ghế, Sẵn sàng, đếm ngược | Nhạn | 16 | 5 | Ghế và sẵn sàng cập nhật nhiều phía, hủy đếm và thông báo; không chỉ là biểu mẫu tạo phòng. |
| T22 | BE vào phòng bằng link/mã, xếp ghế/người xem, chuyển hướng sau đăng nhập | Tùng | 12 | 5 | Ghế/chỗ xem thay đổi đồng thời, tiếp tục sau xác thực, kiểm quyền/mã/chặn; liên quan nhiều đường vào. |
| T23 | BE đồng hồ thi đấu và hết giờ | Cường | 8 | 5 | Đúng thứ tự hết giờ và nước đi, đồng bộ khi trình duyệt chậm, chạy liên tục khi mất mạng; sai dẫn tới xử thua sai. |
| T24 | Máy cờ 3 cấp: negamax + alpha-beta, tìm sâu dần, tiến trình riêng | Tình | 32 | 13 | Thuật toán tìm kiếm, cắt tỉa, lượng giá, tách xử lý và ba ngân sách thời gian; mức bất định kỹ thuật rất cao. |
| T25 | FE phòng đấu, đồng hồ, kết quả và lớp phủ nối lại | Kỳ | 16 | 8 | Ghép nước đi, đồng hồ, kết quả và lớp phủ nối lại theo từng vai trò; nhiều trạng thái bất đồng bộ. |
| T26 | FE Chia sẻ phòng, nhập mã ở Sảnh, tự vào phòng sau đăng nhập | Cường | 8 | 3 | Sao chép và nhập mã, giữ đích qua xác thực, hiển thị kết quả phân chỗ; dựa trên dịch vụ phòng có sẵn. |
| T27 | Kiểm thử US-04.3 | Tình | 4 | 3 | Nhiều thao tác chuột/cảm ứng, âm thanh và quyền điều khiển; cần quan sát nhiều trình duyệt nhưng ít dữ liệu bền. |
| T28 | Kiểm thử US-02.1 | Thư | 8 | 3 | Kiểm các biên tạo phòng, ghế và đếm bắt đầu với nhiều người; có kịch bản xác định. |
| T29 | Kiểm thử US-03.1 | Nhạn | 8 | 3 | Ma trận đăng nhập/đăng ký, mã/link và sức chứa; phải giữ đúng phòng nhưng không đo hiệu năng toàn hệ thống. |
| T30 | Kiểm thử US-05.1 | Thư | 8 | 5 | Gửi lệnh sai/trùng, kiểm dữ liệu bền, đồng hồ và mọi kiểu kết thúc; cần thế cờ và kiểm phía máy chủ. |
| T31 | BE bạn bè, trạng thái online, mời bạn online vào phòng | Tùng | 20 | 8 | Quan hệ bạn bè, lời mời chéo, hạn mức/thời hạn, hiện diện và mời phòng; nhiều trạng thái liên tài khoản. |
| T32 | BE đầu hàng, rời phòng giữa ván, xin hoà | Cường | 12 | 5 | Đầu hàng và đề nghị hòa có hạn, đếm nước chờ, phản hồi muộn và tranh chấp với kết thúc ván. |
| T33 | BE LiveKit: token, quyền phát/nhận, thu hồi và mức chia sẻ | Tình | 24 | 13 | Quyền truyền hình/tiếng thực sự trên dịch vụ ngoài, thay vai/thẻ, thu hồi và lỗi độc lập với ván; rủi ro tích hợp cao. |
| T34 | BE ván với máy: tạo ván, chọn phe, đầu hàng, Ván mới | Đông | 12 | 5 | Điều phối lượt người/máy, phe thực tế và lựa chọn ngẫu nhiên, kết thúc/tạo mới; không tự xây thuật toán tìm kiếm. |
| T35 | BE đăng ký/đăng nhập Google, onboarding, phiên Khách | Cường | 24 | 8 | Google, thiết lập bắt buộc, email trùng, dọn bản tạm, Khách và hạn phiên; nhiều nhánh bảo mật và phục hồi. |
| T36 | FE nút Đầu hàng, Xin hoà và khung đề nghị | Nhạn | 8 | 3 | Hai phía đề nghị hòa, thu gọn/mở lại và xác nhận an toàn; tái dùng khung hộp thoại và dữ liệu máy chủ. |
| T37 | BE hai kênh chat, bộ lọc từ cấm, giới hạn tốc độ | Tình | 16 | 8 | Quyền đọc theo cặp, lịch sử theo mốc, lọc biến thể và tốc độ gửi; rủi ro rò nội dung khi đổi vai. |
| T38 | FE thiết lập/chơi AI và giao diện sự cố máy cờ | Kỳ | 12 | 5 | Ghép bàn cờ với máy, giữ lựa chọn, lỗi/thử lại và chống bấm trùng; tận dụng bàn cờ dùng chung. |
| T39 | Kiểm thử US-05.2 | Kỳ | 4 | 3 | Đồng ý/hủy, thời hạn đề nghị, năm nước chờ và phản hồi muộn; cần quan sát hai phía cùng lúc. |
| T40 | FE màn Bạn bè, chuông, tab mời bạn bè, pop-up lời mời | Cường | 12 | 5 | Nhiều danh sách, chuông, thao tác quan hệ và lời mời đếm thời gian; cập nhật trực tiếp từ dịch vụ bạn bè. |
| T41 | BE Xin đổi bên và phòng về chờ sau ván | Cường | 12 | 5 | Đổi phe theo đề nghị, giữ/reset dữ liệu sau ván, chuyển chủ và chế độ khóa; cần thống nhất vòng đời phòng. |
| T42 | FE khung chat hai kênh | Kỳ | 8 | 5 | Bố cục hai thiết bị, quyền đọc và thay cặp, lỗi gửi/thử lại, an toàn văn bản; có nhiều trạng thái dữ liệu. |
| T43 | Kiểm thử US-08.1 | Thư | 8 | 3 | Ma trận ba cấp/ba phe, lần bốc ngẫu nhiên, đầu hàng và ván mới; không bao gồm chứng minh sức mạnh máy. |
| T44 | FE nút Google, Onboarding, hộp tên Khách, ẩn chức năng cho Khách | Kỳ | 8 | 5 | Google thiết lập bắt buộc, lỗi trùng email, Khách, ẩn quyền và quay lại lời mời; rộng hơn một biểu mẫu. |
| T45 | Kiểm thử US-07.2 | Thư | 8 | 5 | Thiết bị thật, quyền dịch vụ và ba mức chia sẻ, nhiều người nhận và đo hai giây; cần tái tạo sự cố. |
| T46 | FE hộp Xin đổi bên, Ở lại phòng / Rời phòng | Nhạn | 8 | 3 | Đề nghị hai phía và thời hạn, ở lại/rời phòng; dùng trạng thái máy chủ, không quyết luật kết quả. |
| T47 | Kiểm thử US-07.1 | Thư | 8 | 5 | Thử vượt quyền, nhiều biến thể né bộ lọc, mã chèn, dữ liệu bị xóa và thay kênh; cần cả kiểm trực tiếp máy chủ. |
| T48 | Kiểm thử US-01.3 | Thư | 8 | 5 | Google thật và bản tạm, khóa mật khẩu, quyền Khách, link mời; cần dữ liệu độc lập và thử nhiều tài khoản. |
| T49 | Kiểm thử US-03.2 | Kỳ | 8 | 5 | Nhiều loại lời mời, giới hạn, trạng thái thời gian thực và phòng đổi quyền; số nhánh lớn dù cùng một nhóm chức năng. |
| T50 | Kiểm thử US-02.2 | Kỳ | 4 | 3 | Đổi phe và chơi tiếp qua hai ván với bộ đếm, reset và dữ liệu giữ lại; cần kiểm nhiều phía. |
| T51 | Hồi quy tích hợp toàn bộ chức năng và D1–D10 vòng đầy đủ | Thư | 24 | 13 | Mười chuỗi đầu-cuối và lỗi xuyên chức năng, tự động hóa, dữ liệu riêng và kiểm lại; trách nhiệm tích hợp toàn sản phẩm. |
| T52 | BE mất kết nối, ân hạn, đồng bộ lại và server restart | Đông | 12 | 8 | Nhiều hạn mất mạng, thứ tự hết giờ, cả hai rớt mạng và máy chủ khởi động lại; kết quả phải nhất quán. |
| T53 | BE chế độ PUBLIC / CODE_ONLY / LOCKED, thu hồi mã | Tùng | 12 | 5 | Ba chế độ, mã/lời mời thu hồi và quyền người cũ nối lại; có nhiều điều kiện an ninh theo thời gian. |
| T54 | BE danh sách phòng PUBLIC realtime, Vào chơi/Vào xem | Đông | 8 | 3 | Danh sách và phân chỗ dựa trên dịch vụ phòng, xử lý dữ liệu cũ; phạm vi hẹp hơn tạo/phục hồi phòng. |
| T55 | BE người xem, chuyển ghế ↔ xem, mời xuống ghế, đuổi và chặn | Đông | 16 | 5 | Đổi vai, giữ chỗ, mời xuống ghế và chặn quay lại; phải thu hồi quyền hình/tiếng khi đuổi. |
| T56 | BE phiên cố định, một vị trí chơi, thiết bị khác xử thua, đăng xuất | Đông | 24 | 13 | Phiên/tài khoản/thiết bị và một vị trí chơi xuyên cả phòng chờ, ván người và ván máy; hậu quả sai rất lớn. |
| T57 | FE Cài đặt phòng | Cường | 4 | 2 | Một hộp chọn ba chế độ, trạng thái nút và mã mới; có thể tái dùng thành phần giao diện sẵn có. |
| T58 | FE danh sách người xem, thao tác ghế và khung camera/mic | Tình | 20 | 8 | Hai mảng người xem và camera/mic, quyền theo vai, lỗi thiết bị, thời gian chia sẻ; tích hợp rộng và cần máy thật. |
| T59 | Tinh chỉnh máy cờ và đo GATE-ENGINE trên dữ liệu đã xác minh | Đông | 12 | 8 | Tinh chỉnh tốc độ/sức chơi trên 50 thế, đáp án chiếu hết và đấu máy; không chắc đạt chỉ bằng chỉnh cấu hình. |
| T60 | Kiểm thử US-05.3 | Tình | 4 | 5 | Chủ động cắt mạng/khởi động lại, tranh chấp với hết giờ và hai bên cùng mất mạng; ca ít nhưng khó tái hiện đúng. |
| T61 | FE Sảnh: bốn lựa chọn, Luật chơi, danh sách phòng, thanh điều hướng | Kỳ | 12 | 5 | Danh sách cập nhật, nhiều đường vào, luật chơi và thanh điều hướng theo quyền; nhiều điểm nối giao diện. |
| T62 | Kiểm thử US-06.1 | Nhạn | 8 | 3 | Ma trận chế độ/mã mới-cũ và quyền nối lại; cần đồng hồ kiểm soát và người chơi/người xem. |
| T63 | BE giữ ván AI 30 phút, Thử lại, khởi động lại | Cường | 12 | 8 | Hủy tác vụ máy, giữ 30 phút, thử lại cùng thế/tạo mới và bấm trùng; nhiều nhánh lỗi bất đồng bộ. |
| T64 | Kiểm thử US-06.3 | Kỳ | 8 | 5 | Nhiều vai trò, ghế bị lấy, giữ chỗ, đuổi và thu hồi hình tiếng; kiểm cả quyền máy chủ và giao diện. |
| T65 | FE Cài đặt hồ sơ, Đăng xuất, banner ván dở | Cường | 8 | 3 | Hồ sơ là biểu mẫu nhỏ nhưng đăng xuất/Quay lại cần đúng hậu quả theo loại ván và Khách. |
| T66 | Đo tải, NFR và đối soát bằng chứng chín cổng kỹ thuật | Tình | 16 | 13 | Tải 50 người/10 ván, chín phép kiểm kỹ thuật và toàn bộ chất lượng; cần số đo, dữ liệu thô và đối soát bằng chứng. |
| T67 | Kiểm thử US-06.2 | Nhạn | 8 | 5 | Sảnh tích hợp phòng, tài khoản, bạn bè, máy cờ và luật; nhiều đường vào và trạng thái cũ cần kiểm chéo. |
| T68 | Kiểm thử US-08.3 | Nhạn | 8 | 8 | Phục hồi/lỗi máy cờ, 50 thế mỗi cấp, chiếu hết xác minh và đấu máy; chuẩn bị/chạy/đối chiếu lớn hơn 8 giờ đơn thuần. |
| T69 | Kiểm thử US-01.4 | Nhạn | 8 | 8 | Ma trận thiết bị, hạn phiên, vị trí chơi, đăng xuất, Khách và hồ sơ; nhiều nhánh liên chức năng, phải kiểm quyền trực tiếp. |
| T70 | Kiểm cổng phát hành, đóng gói v1.0 và hướng dẫn demo | Tình | 4 | 5 | Đóng gói hai môi trường, chạy trên máy sạch và kiểm cổng bằng chứng; phạm vi vận hành, cần người phụ trách kỹ thuật. |
| T71 | Tổng duyệt D1–D10 trên bản phát hành và ghi hình | Thư | 8 | 5 | Tổng duyệt mười luồng trên bản phát hành thật và ghi hình; có chuẩn bị thiết bị/tài khoản, không chỉ ghi video. |


Khi bắt đầu triển khai, cập nhật đánh giá bằng khối lượng thực còn lại, vướng mắc và mức sẵn sàng của đầu vào. Nếu cần đổi ước lượng, tính lại lịch và ngày dự phòng; không giữ các con số chỉ để bảng nhìn cân bằng.
