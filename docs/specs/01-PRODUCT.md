# Đặc tả sản phẩm đã chốt

Trạng thái: yêu cầu sẵn sàng lập trình. Nguồn: [nhật ký phỏng vấn](../planning/PHONG_VAN_YEU_CAU.md). Các quy tắc ghi **Thiết kế** do agent quyết định theo ủy quyền câu 24; các mục **Yêu cầu** đến từ người dùng. Tài liệu này thay thế giả định của bản phân tích gốc.

## Mục tiêu và ranh giới

**Yêu cầu:** Đồ án chạy đủ chức năng để chấm điểm, có nền tảng duy trì sau khi nộp. Còn khoảng hai tháng từ thời điểm phỏng vấn, ưu tiên hoàn thành sớm. Local đầy đủ trước; chuẩn bị triển khai Vercel/Render. AI tự viết là nội dung chính khi bảo vệ.

**Thiết kế:** Website tiếng Việt; không app native. Không Elo/bảng xếp hạng, giải đấu, thanh toán, chat riêng ngoài phòng, ghi âm/ghi hình, tự huấn luyện neural network, hoặc chống engine-cheating. Không mua dịch vụ tự động. Không tự giảm yêu cầu thành demo giả.

## Danh mục yêu cầu

| ID | Nội dung bắt buộc |
|---|---|
| R01 | Username/password; email đăng ký, xác minh, khôi phục; Google login |
| R02 | Hồ sơ tên hiển thị; kết bạn, online, lời mời chơi trong ứng dụng |
| R03 | Tạo phòng, hai ghế, ready, link và mã mời chơi |
| R04 | PUBLIC/CODE_ONLY/LOCKED, tối đa 5 người xem, kiểm tra quyền và thu hồi |
| R05 | Bàn gỗ, quân chữ Hán, đủ luật di chuyển/an toàn tướng |
| R06 | Online authoritative, lưu bền vững, chống trùng, resync |
| R07 | Luật giản lược: hết nước thua; lặp cùng vị trí/lượt ba lần hòa |
| R08 | Không giới hạn hoặc 5/10/15 phút mỗi bên; mặc định không giới hạn |
| R09 | Mất mạng 60 giây; đồng hồ chạy; lỗi server/cả hai offline không chọn người thắng |
| R10 | Chat PLAYERS và SPECTATORS riêng về cả đọc/gửi |
| R11 | Camera và mic độc lập, mỗi người tự chọn OFF/OPPONENT_ONLY/OPPONENT_AND_SPECTATORS |
| R12 | AI tự viết TypeScript; Dễ/Trung bình/Khó với ngân sách 300/1000/3000 ms |
| R13 | Đầu hàng, xin hòa, đi lại online có chấp nhận; undo AI; không hoàn thời gian |
| R14 | Tái đấu đổi bên; lịch sử ván và xem lại từng nước |
| R15 | Máy tính và điện thoại; chat/media thu gọn trên điện thoại |
| R16 | Local thật, hướng dẫn triển khai online, test hồi quy/tải/media và hồ sơ bảo vệ |

## Tài khoản và bạn bè

**Thiết kế:** Username chuẩn hóa lowercase ASCII `[a-z0-9_]{3,24}`, duy nhất, bất biến sau chọn. Tên hiển thị Unicode 1–40 ký tự, sửa được; mặc định username. Mật khẩu 10–128 ký tự, cho paste/password manager. Email tối đa 254 ký tự, được Supabase xác minh; không lộ trong profile/search.

Tài khoản thường chưa xác minh chỉ được màn nhắc xác minh, gửi lại email, logout. Google lần đầu hoàn tất chọn username trước khi tham gia phòng. Email đã xác minh giống nhau được xử lý theo cơ chế liên kết danh tính của Supabase, không tự merge từ email client gửi. Không đổi email/username trong bản này; quên mật khẩu vẫn bắt buộc.

Bạn bè: gửi, hủy yêu cầu đã gửi, chấp nhận/từ chối yêu cầu nhận, hủy kết bạn. Một quan hệ không hướng cho mỗi cặp; gửi chéo trả yêu cầu hiện có để người nhận chấp nhận, không tự chấp nhận. Chỉ mời trực tiếp bạn đã chấp nhận; người chưa kết bạn vẫn nhận được link/mã. Tìm prefix username từ 3 ký tự, tối đa 20 kết quả; không liệt kê email. Presence hiển thị online nếu còn socket được xác thực; heartbeat 10 giây, hết lease 30 giây. Bạn bè chỉ biết online/offline, không biết phòng riêng.

## Phòng và mời

**Yêu cầu:** Hai người chơi, tối đa 5 người xem. **Thiết kế:** Một tài khoản chỉ thuộc một phòng tại một thời điểm; tạo ván AI yêu cầu đã rời phòng online, tạo phòng online yêu cầu không có ván AI ACTIVE; chuyển phòng phải rời phòng trước. Nhiều tab không tạo thêm ghế. Một tab điều khiển/người chơi; tab sau chỉ đọc, nút tiếp quản đổi control lease và đóng media tab cũ. Chủ phòng mặc định đỏ, đối thủ đen; bắt đầu khi cả hai ready.

Tên phòng 1–60 ký tự. PUBLIC xuất hiện sảnh; CODE_ONLY và LOCKED ẩn. PUBLIC cho tài khoản hoàn tất onboarding xem khi còn chỗ. CODE_ONLY cần mã xem. LOCKED không có người xem; lời mời chơi vẫn dùng được khi ghế trống. Người xem không tự chuyển thành đối thủ; phải rời và dùng lời mời chơi.

Mã chia sẻ gồm 8 ký tự ngẫu nhiên từ `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, duy nhất giữa mã còn hiệu lực; lưu HMAC-SHA256 bằng secret server. Role PLAY hoặc WATCH được lưu server. Link dùng token ngẫu nhiên 32 bytes base64url trong fragment, client gửi POST để đổi lấy membership. Không đưa JWT đăng nhập vào link. Mã/token hết hạn sau 24 giờ hoặc khi thu hồi/đóng phòng. PLAY dùng một lần, chấp nhận ghế cuối trong transaction; WATCH dùng nhiều lần trong trần 5 ghế. Lời mời trực tiếp hết hạn 10 phút, chỉ người nhận được dùng. Ready/đổi ghế làm mất ready cũ nếu cần.

Chuyển PUBLIC → CODE_ONLY hoặc sang LOCKED: thu hồi toàn bộ người xem hiện tại. Đổi mã xem cũng thu hồi membership xem. Client nhận thông báo, rời socket rooms và media. PUBLIC từ chế độ khác không tự nhận lại người cũ. Người xem mất kết nối giữ ghế 15 giây; reconnect phải kiểm tra lại quyền/epoch.

Chủ rời WAITING đóng phòng và thu hồi mời. Đang PLAYING không được kick đối thủ/sửa đồng hồ/đóng ván để ép kết quả. Nút rời khi đang chơi giải thích: xác nhận rời chủ động là đầu hàng; đóng tab/mất mạng theo R09. Phòng FINISHED giữ 10 phút cho replay/chat/tái đấu, sau đó CLOSED; chủ rời sau ván đóng phòng. Không chuyển quyền chủ.

## Luật, thời gian và thao tác ván

Bộ luật `xiangqi-simple-v1`: bàn 9×10 giao điểm, đỏ đi trước, đúng cản mã/mắt tượng/ngòi pháo/cung/sông/tướng đối mặt/tự chiếu. Chiếu hết và hết nước hợp lệ đều thua; không có nước ăn tướng thông thường. Lặp tính loại+bên+ô của mọi quân và lượt, không tính ID quân. Vị trí đầu đếm lần 1, lần thứ ba hòa; không phân xử riêng chiếu dai/đuổi dai. Hiển thị “Luật giản lược” và giải thích trước khi chơi.

Áp dụng đồng hồ cho cả online và AI; không cộng giây. Cấu hình khóa khi bắt đầu. Chọn bên đỏ/đen ở AI; AI đỏ đi đầu. Phần xử lý nguyên tử, ưu tiên deadline, undo và restart nằm trong [state machine](03-STATE-MACHINES.md).

Đầu hàng chỉ khi ACTIVE. Xin hòa chỉ online, một yêu cầu chung DRAW/UNDO đang chờ mỗi ván, hết hạn 30 giây; nước đi mới làm yêu cầu cũ hết hiệu lực. AI hòa theo luật lặp, không có nút xin hòa.

Undo: quay về ngay trước nước gần nhất do người xin thực hiện, nghĩa là lùi 1 ply nếu đối thủ chưa đi, 2 ply nếu đã đáp lại. Online cần đối thủ chấp nhận, có ít nhất một nước của người xin trên nhánh hiện tại; một lần đề nghị/10 giây/người. AI không cần chấp nhận, hủy job đang tính; nếu người chưa đi nước nào thì tắt nút. Undo giữ thời gian còn lại sau khi trừ thời gian đã dùng, version luôn tăng. Ván đã kết thúc không undo được.

Tái đấu: online hai bên đồng ý trong phòng FINISHED, tạo match ID mới, đổi bên, giữ time control, giữ người xem hiện có nếu vẫn đủ quyền; media reset OFF và chat mới. AI nút “Chơi lại” tạo ván mới, giữ level/time, đổi bên theo lựa chọn. Ván INTERRUPTED không tiếp tục, có thể tạo ván mới. Lịch sử chỉ tài khoản người chơi của ván được truy cập sau ván; người xem chỉ có replay ván hiện tại trong phòng còn được phép. Không public lịch sử theo username.

## Chat và media

Chat riêng hai người chơi và chat riêng tối đa 5 người xem. Không đọc chéo, kể cả chủ phòng; server chọn kênh theo role, kiểm tra cả live/history. Text 1–1000 ký tự, 5 tin/10 giây, retry idempotent; 50 tin/trang, giữ 30 ngày. Không tệp/emoji picker riêng; Unicode text được phép. Người xem mới đọc được lịch sử kênh SPECTATORS của match hiện tại khi đang có quyền.

Media từng player có hai policy độc lập; mặc định cả hai OFF ở mỗi ván và sau reload/tái kết nối mất media. Bật là thao tác của chính người phát; người nhận có nút bật âm thanh nếu browser chặn autoplay. Không có yêu cầu cả hai đồng ý; đối thủ có thể tắt nghe tại máy mình. WATCH chỉ subscribe, không phát mic/camera/chat vào kênh PLAYERS.

Người phát công khai mic nhưng riêng camera: người xem chỉ có tiếng. Trường hợp ngược lại chỉ có hình. Thu hẹp policy phải chặn track tại hạ tầng media; server từ chối claim quyền thay đối thủ. Nêu rõ phần mic có thể thu cả âm thanh phát ra loa của đối thủ; echo cancellation và tai nghe giảm rò âm học, không thể dùng quyền mạng để loại âm thanh đã bị mic thu lại. Đây là giới hạn thiết bị, không tự đổi quyền chia sẻ đã chốt.

## AI và nghiệm thu học thuật

AI tự viết, không dùng engine nước đi/thư viện luật thay phần thuật toán. Dùng module luật chung. Baseline minimax; cải tiến alpha-beta, move ordering, iterative deepening; đánh giá vật chất/vị trí/độ linh hoạt/an toàn tướng. Không bắt buộc transposition table hoặc quiescence cho bản đầu; chỉ thêm nếu số đo chứng minh cần, kèm test lặp phụ thuộc lịch sử.

Cấp độ: EASY depth cap 2, 300 ms; MEDIUM cap 4, 1000 ms; HARD cap 6, 3000 ms. Đây là cấu hình khởi đầu do thiết kế chọn; issue benchmark được phép điều chỉnh cap/weight trong cùng ngân sách nếu có báo cáo. Không hứa Elo. Mỗi kết quả có move, nodes, completedDepth, elapsedMs, score, PV, aborted. Timeout có nước hợp lệ dự phòng. Hai job tối đa, hàng đợi tối đa 8; AI thinking và queued hiển thị khác nhau. Đồng hồ máy vẫn tính cả thời gian chờ.

## Chất lượng và bàn giao

Desktop 1366×768 và 1920×1080, mobile 390×844 và 360×800. Chrome/Edge desktop, Chrome Android, Safari iPhone hiện hành khi kiểm thử; ghi phiên bản thực tế. CI có Chromium/WebKit, kiểm thử thiết bị thật media riêng. UI tiếng Việt, quân Hán bằng font tự host có license; chữ và trạng thái không chỉ biểu đạt qua màu.

Mốc local: các chức năng thật, Supabase local qua Docker/CLI; Google cần mạng/provider cấu hình, không giả OAuth. Mốc online: frontend Vercel, game server Render, Supabase cloud, media hosting phù hợp. Tài khoản ngoài và credentials là đầu vào triển khai; thiếu chúng không ngăn lập trình/test local phần độc lập và không được đánh dấu smoke online PASS.

Mục tiêu thử: 10 phòng × 7 thành viên, 2 job AI, p95 command xử lý <100 ms, roundtrip <500 ms khi RTT <100 ms, resync <5 giây sau mạng ổn định. Tải media 1 phòng đủ 2 phát+5 xem được nghiệm thu riêng; chưa hứa 10 phòng video đồng thời. Có báo cáo môi trường và kết quả đo; thất bại phải xử lý/ghi blocker, không thay chỉ tiêu để che lỗi.
