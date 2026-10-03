# 07 · Hợp đồng nghiệp vụ P1/P2

**Bản hoàn thiện đặc tả 04/10/2026 — chờ Product Owner review bản viết.** Các quyết định nghiệp vụ ngày 04/10 đã được duyệt trực tiếp và ghi tại [BA](../BA-SCOPE-DECISIONS.md). Tài liệu này chi tiết hoá, không bổ sung phân kỳ hay thay thế BA. Tên trường/lệnh là thiết kế kỹ thuật để review, không phải API đã triển khai.

## 1. Cách sử dụng

- Đọc cùng [01](01-yeu-cau-chi-tiet.md), [02](02-luat-co-tuong.md), [03](03-du-lieu.md), [04](04-kien-truc.md) và [08](08-ma-tran-nghiem-thu.md).
- Một US nghiệm thu khi cả AC riêng, quyền, lỗi, điều kiện đồng thời và trạng thái giao diện liên quan đều đạt; một happy path không đủ.
- Các mốc thời gian do máy chủ quyết định. UI chỉ hiển thị thời gian còn lại từ trạng thái máy chủ, không quyết định thắng/thua từ đồng hồ máy khách.
- Phân biệt **phòng** (`WAITING/PLAYING/FINISHED/CLOSED`) với **ván** (`ONGOING/FINISHED/INTERRUPTED/ABANDONED`), **vai trò** (`PLAYER/SPECTATOR`) với **ghế** (`RED/BLACK`). `LOCKED` là riêng tư, không phải trạng thái vòng đời.
- Định nghĩa kết quả và thứ tự ưu tiên ở [02] §3 là nguồn duy nhất. Xử lý một ván tuần tự theo [04]; kết quả đã chốt không bị thay bởi lệnh hoặc tác vụ cũ.

## 2. Quyền và dữ liệu

| Hành động / dữ liệu | Người chơi CASUAL | Host CASUAL | Người xem | Người chơi RANKED | Người ngoài |
|---|---|---|---|---|---|
| Đi quân | Đúng ghế/lượt, ván đang chạy | Như người chơi | Không | Đúng ghế/lượt | Không |
| Sẵn sàng | Ghế của mình, WAITING | Như người chơi | Không | Theo luồng ghép, không tự tạo phòng | Không |
| Đổi riêng tư | Không | Có, LOCKED cần đủ ghế khi bật | Không | Không mở phòng ra công khai | Không |
| Chia sẻ/mời vào phòng | Có theo BA 2.2/2.5 | Có | Không | Không | Không |
| Đuổi người xem | Có | Có | Không | Không có người xem | Không |
| Chuyển ghế/vai | Tự xuống xem nếu còn chỗ, không đang đấu | Mời người xem xuống ghế/chuyển đối thủ khi hợp lệ; không tự xuống xem | Không tự ngồi ghế | Không | Không |
| Nhận bàn cờ/đồng hồ | Có | Có | CASUAL có | Chỉ hai người của ván | Không |
| Kênh Riêng | Chỉ cặp đang ngồi ghế | Không có đặc quyền đọc lịch sử cặp khác | Không | Chỉ hai người | Không |
| Kênh Chung | Có, có thể ẩn | Có | Có từ lúc vào | Không | Không |
| Phát media | Tự chọn; mặc định tắt | Như người chơi | Không | Tự chọn; chỉ chia sẻ cho đối thủ | Không |
| Nhận media | Theo lựa chọn chia sẻ của đối thủ | Không đặc quyền | Chỉ luồng cho phép người xem | Mặc định ẩn/tắt phía nhận | Không |
| Replay/xuất (P2) | Chỉ ván chính mình đã chơi | Host không có quyền với ván người khác | Không | Chỉ ván mình chơi | Không |

Khách P2 được quyền CASUAL/AI theo BA 1.3 nhưng không Bạn bè, RANKED hoặc lịch sử cá nhân. Không suy quyền từ chữ trên giao diện hoặc từ `user_id` client tự gửi. Mỗi thay đổi ghế, tiếp quản phiên, đuổi hoặc huỷ kết bạn phải kiểm lại quyền nhận dữ liệu đang mở.

## 3. Hợp đồng lệnh chung

| Bước | Cam kết |
|---|---|
| Nhận ý định | Danh tính lấy từ phiên xác thực; định danh phòng/ván, `commandId` và `matchVersion` cho lệnh ván theo [04] |
| Kiểm trước | Phiên đang điều khiển, quyền, trạng thái, phiên bản, giới hạn và điều kiện thời gian; không tin client báo đã thắng hoặc đã trả lời |
| Chống trùng | Cùng danh tính và định danh lệnh chỉ có một tác động; gửi lại để lấy kết quả, không tạo thêm ván/nước/tin hoặc trừ lượt |
| Tuần tự | Khoá logic theo danh tính khi chiếm vị trí chơi, theo phòng/ván khi sửa; kiểm lại trạng thái bên trong vùng xử lý tuần tự |
| Ghi và phát | Thay đổi bền cần ghi thành công trước khi phát thành công; lỗi ghi không phát thế giả. Không giữ khoá CSDL khi gọi dịch vụ ngoài |
| Thành công | Trả trạng thái có thẩm quyền và phiên bản mới; UI bỏ trạng thái chờ sau xác nhận |
| Lỗi xác định | Trả lý do tiếng Việt, không đổi nghiệp vụ; UI giữ dữ liệu nhập không nhạy cảm và chỉ cho hành động còn hợp lệ |
| Mất xác nhận | Chưa biết thành công không đồng nghĩa thất bại: lấy trạng thái/biên lai rồi mới quyết định thử lại; không phát lệnh khác tạo tác động trùng |
| Thay đổi quyền trong lúc chờ | Từ chối theo quyền hiện tại, gỡ phần dữ liệu không còn được đọc; không chỉ vô hiệu nút |

**Nhóm kết quả lỗi cần phân biệt khi thiết kế API:** phiên hết/đã bị tiếp quản; không có quyền; phòng đóng/không tồn tại; đầy ghế/chỗ xem; bị đuổi; mã/link đã thu hồi; phiên bản cũ; lệnh không hợp lệ; đề nghị hết hạn; vượt giới hạn; phụ thuộc bận hoặc lỗi. Tên mã ngoài những mã đã có ở [04] được chốt khi thiết kế API; không thay đổi kết quả nghiệp vụ ở đây.

## 4. Tài khoản và phiên

### 4.1 Hoàn tất và phục hồi email

Nguồn: BA 1.1/1.5, [04] §3.1. Hai điều kiện dùng ứng dụng: có `completed_at` **và** không còn `PENDING`.

| Trạng thái quan sát dưới khoá cùng danh tính | Được dùng ứng dụng? | Tác vụ phục hồi |
|---|---|---|
| Chưa có hồ sơ hoàn tất, trong thời hạn bản ghi dở | Không | Giữ để người dùng tiếp tục/gửi lại; không chiếm username trước xác minh |
| Chưa có `completed_at`, quá 60 phút | Không | Dọn hồ sơ dở rồi Auth, chu kỳ 5 phút khi phụ thuộc hoạt động |
| Có `completed_at`, còn `PENDING` | Không | Hoàn tất xoá cờ, **không xoá tài khoản** |
| Có `completed_at`, không `PENDING` | Có | Không đổi hoặc xoá bởi tác vụ dọn |
| Auth công khai tạo không cờ, chưa hoàn tất | Không | Xét thời hạn như bản ghi dở, không dùng thiếu cờ để vượt kiểm tra |
| Google | Chỉ sau hoàn tất onboarding | Không cho tác vụ dọn email xử nhầm |

Giết tiến trình tại từng điểm trước/sau ghi hồ sơ, `completed_at`, xoá cờ; gọi gửi lại/hoàn tất/dọn đồng thời. Kết quả phải là một tài khoản hoàn tất hoặc bản ghi bị chặn và phục hồi được, không tài khoản bị kẹt ngoài mọi nhánh dọn. Trạng thái đăng ký thành công chỉ sau cả hai điều kiện. Không ghi OTP/mật khẩu/token vào nhật ký.

### 4.2 P2: Google, khôi phục, đổi tên và Khách

- Google: xác minh danh tính nhà cung cấp ở máy chủ; chưa hoàn tất onboarding không có hồ sơ ứng dụng được sử dụng. Phải kiểm khả năng **không tự liên kết cùng email** của Supabase trước khi triển khai; nếu không đáp ứng BA 1.2 thì BLOCKED, không tự gộp. Đây là cổng kiểm chứng kỹ thuật, không tự thêm OTP cho Google.
- OTP đổi username và khôi phục mật khẩu phải gắn đúng danh tính/mục đích; xác minh một luồng không cấp quyền đổi dữ liệu ở luồng khác. Username mới được kiểm trong giao dịch cùng việc giữ tên cũ; người dùng vẫn là cùng UUID.
- Khách: phiên máy chủ cấp định danh tạm, không giả làm `profiles.user_id`. Cần lưu phân biệt rõ một bên là `ACCOUNT/GUEST/AI` để `NULL user_id` không nhập nhằng giữa Khách và máy; bản ghi dành cho đối thủ chính thức còn lại không bị xoá khi phiên Khách hết.
- Thiết kế dữ liệu P2 phải mở rộng các tham chiếu Host, thành viên, chặn, bên chơi và người gửi chat cho định danh Khách; **không tạo hồ sơ giả để thoả FK P1**. Các ràng buộc một vị trí chơi/ghế/sức chứa áp cho định danh thật hoặc tạm như nhau. [03] là mô hình nền P1, không được đem FK chỉ-account dùng nguyên cho Khách.
- Nhiều tab/thiết bị: chỉ phiên điều khiển mới gửi lệnh. P2 thêm hộp chọn chuyển media, không xoá quy tắc một phiên đang chơi. Huỷ chuyển media không trả lại quyền đi cờ cho tab cũ.

### 4.3 Chủ động rời khác mất kết nối

| Trạng thái | Rời/Đăng xuất có xác nhận | Mất mạng/đóng tab |
|---|---|---|
| CASUAL/RANKED đang đấu | RESIGN rồi rời; Đăng xuất tiếp tục xoá phiên | Theo ân hạn 60 giây, đồng hồ chạy |
| AI đang đấu | RESIGN, huỷ tác vụ, giải phóng vị trí chơi | Giữ ván 30 phút rồi ABANDONED |
| WAITING/FINISHED | Rời ghế, chuyển Host/đóng phòng nếu cần; không thua | Giữ ghế 60 giây; quá hạn mất ghế, không thua |
| Người xem | Rời chỗ xem, không ảnh hưởng kết quả | Giữ chỗ 5 phút |

Huỷ xác nhận không gửi lệnh. Nếu lệnh đến khi ván đã kết thúc, giữ kết quả có thẩm quyền, không ghi đè thành RESIGN; vẫn giải quyết yêu cầu rời/đăng xuất.

## 5. Phòng, lời mời và trạng thái

**Bảng sau áp cho CASUAL.** RANKED sau ván có nhánh riêng ngay dưới bảng, không được dùng FINISHED → WAITING của CASUAL.

| Từ trạng thái | Sự kiện và điều kiện | Sau xử lý |
|---|---|---|
| Không có phòng | Tạo hợp lệ, không chiếm vị trí chơi khác | WAITING, người tạo Host ghế Đỏ |
| WAITING | Đủ hai ghế và cùng Sẵn sàng | Đếm 3 giây; vẫn kiểm ghế/Sẵn sàng khi hết đếm, rồi PLAYING với Match ID mới |
| WAITING đang đếm | Bỏ Sẵn sàng/đổi người ngồi ghế | Huỷ đếm; không có ván ma |
| PLAYING | Có kết quả hợp lệ | FINISHED, dừng lệnh ván và các đề nghị |
| FINISHED | Một người rời hoặc đổi thành phần ghế | WAITING; reset Sẵn sàng, chuyển Host nếu cần; vô hiệu hẹn giờ FINISHED cũ |
| FINISHED | Đủ điều kiện và hai người Tái đấu (P2) | Cùng phòng, phe đổi, đếm 3 giây, Match ID mới |
| FINISHED | Hết 10 phút và chưa chuyển trạng thái | CLOSED; thành viên về Sảnh |
| WAITING/FINISHED | Người ngồi ghế cuối rời | CLOSED dù còn người xem |
| CLOSED | Lệnh trễ, link/QR/mã cũ, reconnect | Không mở lại phòng, không phát dữ liệu ván cho người không có quyền |

**RANKED sau ván (BA 7.2):** giữ FINISHED và vị trí chơi cho tới khi chính người đó Rời phòng (hoặc bị mất ghế theo ân hạn hiện có); họ chỉ tìm trận mới sau khi đã rời/được giải phóng ghế. Người còn lại vẫn xem kết quả, không chuyển WAITING, không nhận người mới/Sẵn sàng/Tái đấu. Đóng khi cả hai rời hoặc tới hạn 10 phút ban đầu; rời một người không huỷ/reset hạn này.

Riêng tư CASUAL là trục độc lập. LOCKED đủ hai người mới bật được nhưng vẫn giữ khi mất một ghế. Mở lại sinh mã/link mới, bản cũ không hồi sinh; reconnect của thành viên trong hạn dựa danh tính/chỗ được giữ, không coi họ là người mới dùng mã cũ.

**Mã phòng:** giá trị chuẩn đúng 8 ký tự; ví dụ `K7M2XQP4`, dạng hiển thị chia nhóm `K7M2-XQP4`. Không lưu 9 ký tự vào `char(8)`. Bộ phân tích chỉ được nhận dạng định dạng hiển thị do ứng dụng tạo rồi kiểm giá trị chuẩn; không tự sửa một mã sai thành mã phòng khác. Sinh/kiểm duy nhất ở máy chủ, không để client chọn mã thay kiểm quyền.

**Thách đấu P2 (BA 2.7):** mở form tạo phòng hiện có, nhập tên, mặc định 10 phút/CODE_ONLY/2 người xem; cho sửa trong phạm vi CASUAL. Huỷ form không tác động; xác nhận tạo một phòng rồi gửi mời. Bạn vừa bận/từ chối/hết hạn không tự xoá phòng đã tạo.

**Lời mời phòng:** thông báo 30 giây không phải vé giữ ghế. Khi người nhận bấm Tham gia phải kiểm lại trạng thái bạn, vị trí chơi, phòng, chặn, khoá, phiên mã và sức chứa. Lỗi không đưa họ vào một phòng khác. Vào từ Sảnh luôn SPECTATOR; link/mã ưu tiên ghế rồi fallback người xem theo BA 2.8. Lệnh đồng thời không được vượt ghế hoặc trần N.

## 6. Đề nghị và lượt đi

| Loại | Điều kiện / tác động | Khi không thành công |
|---|---|---|
| Xin hòa | CASUAL hoặc RANKED đủ số nước; đồng ý → DRAW_AGREEMENT | Từ chối/hết hạn → tiếp tục, chờ 5 nước của người xin |
| Xin đi lại CASUAL (P2) | Có nước của người xin, còn lượt; đồng ý lùi trước nước gần nhất của họ | Không trừ lượt nếu chưa thực hiện; từ chối/hết hạn chờ 3 nước của người xin |
| Xin đổi bên (P2) | Phòng chờ, hai người còn ghế; đồng ý hoán ghế/reset Sẵn sàng | Từ chối/hết hạn chờ 60 giây; đổi ghế/ván bắt đầu làm mất điều kiện |

Mỗi người một đề nghị chờ (không phải mỗi loại một đề nghị); có Rút. Xin hòa/Xin đi lại không modal, X/Esc thu gọn và có nút mở lại; thời hạn và đồng hồ vẫn chạy. Không khoá nước của người nhận; riêng người xin đi lại không gửi nước mới. Khi chấp nhận, đọc lại con trỏ/phiên bản dưới xử lý tuần tự; nếu đối thủ đã đáp thì lùi hai nửa nước, chưa đáp lùi một. Nước đã lùi còn trong cây dữ liệu nhưng không thuộc nhánh hiệu lực; không hoàn lại đồng hồ. Kết thúc ván ưu tiên chấm dứt mọi đề nghị, phản hồi muộn không hồi sinh.

## 7. Máy cờ

| Tình huống | Trạng thái ván | Thử lại / phục hồi |
|---|---|---|
| Đang xếp hàng ≤ 3 giây | Cùng ván, lượt máy | Chờ, không gửi thêm nước người chơi |
| Hết hạn chờ tiến trình, ENGINE_BUSY | Cùng ván/thế/lượt | Xếp lại tìm nước, không áp lại nước đã đi |
| Hết ngân sách tính cấp độ | Cùng ván | Dùng nước hợp lệ tốt nhất tìm được; không giả vờ đạt độ sâu mục tiêu |
| Lỗi tiến trình hoặc quá hạn phản hồi 10 giây | ABANDONED | Tạo ván mới cùng cấp độ/phe thực tế; giữ ván cũ kết thúc |
| Đi lại khi máy đang tìm (P2) | Cùng ván, lùi nước người chơi | Huỷ tác vụ; kết quả cũ đến muộn bị bỏ |
| Người chơi chủ động rời đã xác nhận | FINISHED/RESIGN | Huỷ tác vụ và giải phóng vị trí chơi |
| Mất kết nối | Giữ 30 phút | Vào lại đúng thế trong hạn; quá hạn ABANDONED |

Kết quả tìm phải đối chiếu Match ID, phiên bản và danh tính công việc; không chỉ kiểm rằng "máy có trả một nước hợp lệ". P1 lưu ván AI trong bộ nhớ, nên không được hứa phục hồi thế sau máy chủ khởi động lại; phần dữ liệu không tồn tại không được tái tạo giả. P2 tài khoản có lưu dữ liệu ván/nhánh như [03], Khách không có lịch sử.

## 8. Đánh Hạng, dữ liệu kết quả và lịch sử (P2)

- Hàng đợi giữ một vé theo danh tính; mất kết nối quá 30 giây tự rút theo BA 1.8; toàn bộ vé mất khi máy chủ khởi động lại. MATCH_FOUND và Huỷ được phân xử tuần tự, một vé không ghép hai người.
- Phe CASUAL ghép ngẫu nhiên theo BA 2.0, Host là người vào hàng đợi trước. RANKED ghép theo BA 7.1/7.2, tuyệt đối không có đường chọn đối thủ.
- Tách hai bộ đếm: ván **đã bắt đầu** theo cặp trong cửa sổ 24 giờ (kể cả INTERRUPTED), và ván RANKED **hoàn tất** theo người (K/đủ năm ván). Không dùng một trường cho hai luật.
- Cập nhật kết quả, Elo trước/sau và thống kê một lần theo Match ID; Replay và widget không thể kích hoạt cập nhật Elo.
- Làm tròn/sàn theo BA 7.1; kiểm K khác nhau, sàn 100, ván 30/31, hoà, thắng và thua. `elo_reached_at` phản ánh lúc đạt Elo hiện tại, không phải lần mở bảng; so bằng cuối bằng user_id.
- Lịch sử chỉ người có quyền, không công khai vì đoán được UUID. Replay, FEN và PGN dùng nhánh hiệu lực; FEN theo con trỏ đang xem, PGN theo cả ván. Bản ghi thiếu nước chưa lưu không được điền bằng nước giả.
- Dữ liệu P2 cần ràng buộc duy nhất cặp hội thoại, bộ đếm đọc theo người và kết quả đã áp dụng để chống ghi lại. Các cột triển khai cụ thể phải thể hiện trong migration ở Giai đoạn 4, không thay phạm vi nghiệp vụ.

## 9. Bạn bè, chat và media

- Lời mời bạn bè có hướng gửi/nhận nhưng cặp quan hệ không có thứ tự. Kiểm giới hạn cả hai đầu trong giao dịch; hai yêu cầu chéo giữ một PENDING, không tự ACCEPTED. Chỉ Từ chối có chủ ý tăng `friend_declines`; thu hồi/hết hạn không tính.
- Hai trăm bạn là số quan hệ ACCEPTED, năm mươi lời mời là tổng gửi + nhận PENDING; chấp nhận cũng kiểm trần bạn cả hai đầu. Giới hạn hết hạn 30 ngày theo thời điểm máy chủ, không số ngày lịch của trình duyệt.
- Thẻ người khác không phải trang hồ sơ công khai; chỉ dữ liệu được BA 5.5 cho phép. Không vì hai người là bạn mà cấp quyền xem Replay của nhau.
- Kênh Riêng đọc theo phiên ngồi ghế/cặp ghế; đổi cặp không mở lịch sử trước đó. Kênh Chung chỉ từ mốc tham gia theo [03]; reconnect trong cùng tư cách không tạo quyền đọc trước mốc.
- Tin nhắn có trạng thái đang gửi/thành công/lỗi; mất ACK đối soát định danh, không nhân đôi. Server lọc trước khi lưu/phát, không lưu nguyên văn từ cấm rồi chỉ che ở client. Sticker là nội dung tin, không đường vượt quyền/giới hạn tốc độ.
- Huỷ kết bạn chặn đọc/gửi 1-1 ngay, kể cả khung chat đang mở; dữ liệu giữ nhưng ẩn. Không xoá lịch sử để thay cho kiểm quyền.
- Badge theo BA 5.2 là số **tin đến** chưa đọc từ bạn hiện tại, không số hội thoại; chỉ đánh dấu đọc khi tin vào vùng nhìn của hội thoại ở tab hoạt động. Đồng bộ qua máy chủ giữa thiết bị, không đánh dấu vì tải nền. Huỷ/kết bạn lại chỉ thay tập hội thoại được tính, giữ nguyên trạng thái từng tin; không reset tất cả thành đã đọc/chưa đọc.
- Media cần cả quyền publish và subscribe. Chuyển từ ghế sang xem phải thu quyền phát và quyền nghe luồng chỉ-đối-thủ; đổi mức chia sẻ phải thay quyền tại LiveKit. Tắt thiết bị ở giao diện không đủ chứng minh quyền đã bị thu.
- Lỗi/cấm thiết bị có thông báo và cách thử lại/cấp quyền, không chặn ván cờ/chat; không tự bật camera/mic sau reconnect/tiếp quản. Không ghi hay lưu media.

## 10. Điều kiện bàn giao sang lập kế hoạch

| Hạng mục | Điều kiện |
|---|---|
| Phạm vi | BA định nghĩa và phân kỳ; không tính P2 vào P1 chỉ vì cùng màn hình |
| Khả năng chia việc | Mỗi US có AC, nguồn BA, quyền và ngoại lệ; còn câu hỏi nghiệp vụ thực sự thì quay về Product Owner |
| Truy vết | Mọi AC và mọi thành phần có mục kiểm tương ứng trong [08]; danh mục kiểm chưa phải kết quả chạy |
| Phê duyệt | Product Owner review bản viết này cùng [01]/[08] trước khi dùng làm baseline mới |
| Rủi ro triển khai | Các cổng [05] có cách đo/bằng chứng; chưa đo phải giữ NOT_RUN/BLOCKED, không hạ ngưỡng |
| Ngoài đợt này | Không đọc/sửa Jira, docs/06, mockup; không mã nguồn, commit/push hoặc tự chuyển giai đoạn |

Đặc tả đủ để phân rã không bảo đảm khối lượng kịp hạn. Công suất, lịch, phân công, key Jira và tiêu chí hội đồng nếu có thuộc đầu vào lập kế hoạch riêng; không suy ra từ tài liệu này.

[01]: 01-yeu-cau-chi-tiet.md
[02]: 02-luat-co-tuong.md
[03]: 03-du-lieu.md
[04]: 04-kien-truc.md
[05]: 05-kiem-thu.md
