# Nhật ký chốt yêu cầu và chuẩn bị bộ issue

Trạng thái: phỏng vấn đã hoàn tất; xem docs/README.md (tương đối từ repo root) để biết trạng thái bàn giao hiện tại.

## Mục tiêu đã xác nhận

- Triển khai đầy đủ các chức năng của dự án cờ tướng đã thảo luận.
- Công việc hiện tại là hỏi rõ yêu cầu, sau đó soạn các issue Markdown chi tiết.
- Người dùng sẽ tự mở task khác và dùng model 5.6 sol để thực hiện theo tài liệu.
- Chưa triển khai ứng dụng trong giai đoạn này.

## Tài liệu đầu vào

- `../../DU_AN_CO_TUONG_ONLINE.md`: bản đề xuất ban đầu; các giả định trong đó chưa được xem là quyết định của người dùng.
- Workspace hiện chỉ có tài liệu phân tích, chưa có mã nguồn ứng dụng.

## Các quyết định cần làm rõ

- Đích bàn giao: đồ án demo hay sản phẩm mở cho người dùng thực; ranh giới tính năng mở rộng.
- Nền tảng, công nghệ bắt buộc, thời hạn, ngân sách và môi trường triển khai.
- Luật cờ, AI, đồng hồ, hòa, mất mạng, tái đấu và lịch sử.
- Tài khoản, bạn bè/lời mời, ghế chơi, người xem, mã phòng.
- Quyền chat/media, giao diện, ngôn ngữ và thiết bị hỗ trợ.
- Tiêu chí nghiệm thu, mức tải, quyền quyết định của agent và cách bàn giao từng issue.

## Nhật ký

### Câu 1 — Đích bàn giao

**Người dùng xác nhận:** Đồ án chạy đầy đủ chức năng để trình diễn/chấm điểm, nhưng có thể duy trì và phát triển để công khai cho người dùng thật, tiếp tục vận hành sau khi nộp.

**Hệ quả lập kế hoạch:** Ưu tiên hoàn thành chức năng và bằng chứng nghiệm thu đồ án; giữ kiến trúc, dữ liệu và cấu hình triển khai có thể tiếp tục phát triển. Chưa suy ra rằng mọi tính năng vận hành công khai hoặc các phần mở rộng trong tài liệu ban đầu đều bắt buộc trước khi nộp.

**Còn mở:** Các ràng buộc chấm điểm/công nghệ, phạm vi trước khi nộp, thời hạn, ngân sách và các chính sách nghiệp vụ.


## Bộ tài liệu dự kiến sau khi chốt

- Đặc tả quyết định chính thức, thay thế các giả định đã giải quyết.
- Hợp đồng dữ liệu/API/event và quy tắc nghiệp vụ dùng chung.
- Mỗi issue một file: mục tiêu, phạm vi, phụ thuộc, tệp/module, đầu vào/đầu ra, bước làm, test cụ thể, tiêu chí hoàn thành.
- Mục lục thứ tự thực hiện và bảng truy vết yêu cầu → issue → nghiệm thu.
- Hướng dẫn và prompt mở đầu cho task thực thi, quy tắc cập nhật tiến độ/tiếp tục khi đổi phiên.

### Câu 2 — Ràng buộc công nghệ

**Người dùng xác nhận:** Được tự chọn công nghệ; người dùng nghiêng về Supabase để đơn giản hóa CSDL.

**Định hướng:** Chọn Supabase PostgreSQL cho thiết kế tiếp theo. Đề xuất thêm Supabase Auth để giảm phần xác thực tự viết; đây là đề xuất của agent, chưa phải xác nhận riêng của người dùng. Backend vẫn chịu trách nhiệm xác nhận luật/nước đi và điều phối AI. Chưa quyết định dùng Supabase Realtime thay Socket.IO.

**Nguồn đã kiểm tra:**
- https://supabase.com/docs/guides/database/overview — PostgreSQL được quản lý.
- https://supabase.com/docs/guides/auth — Auth tích hợp database/RLS.
- https://supabase.com/docs/guides/realtime/authorization — quyền Broadcast/Presence.

**Ảnh hưởng tới tài liệu cũ:** Khi đặc tả được chốt, cần cập nhật phần auth/session và DB để không triển khai đồng thời hai hệ thống xác thực.

**Câu tiếp theo:** Deadline nộp/demo, để quyết định ưu tiên và ranh giới công việc trước khi nộp.

### Câu 3 — Thời hạn và ưu tiên

**Người dùng xác nhận:** Còn 2 tháng đến khi nộp, muốn hoàn thành càng sớm càng tốt.

**Hệ quả lập kế hoạch:** Ưu tiên đường triển khai ngắn đến bản đủ chức năng, dùng thành phần có sẵn khi phù hợp, dành thời gian còn lại cho kiểm thử/hoàn thiện. Không tự cắt chức năng bắt buộc để đạt tốc độ; không coi ước lượng 8–10 tuần trong tài liệu cũ là lịch bắt buộc. Chưa cam kết ngày hoàn thành trước khi chốt phạm vi.

**Câu tiếp theo — kiểm tra đánh đổi tốc độ/AI:** Chốt dùng engine có sẵn hay tự xây AI, vì đây là quyết định ảnh hưởng lớn đến thời gian và khả năng giải thích khi bảo vệ.

### Câu 4 — AI và đánh đổi tốc độ

**Người dùng xác nhận:** Muốn tự viết AI để trình bày thuật toán như một phần chính khi bảo vệ đồ án.

**Quyết định:** Chức năng đấu máy dùng AI tự phát triển, không dùng Pikafish/engine có sẵn làm bộ tính nước thay thế. Các đề xuất tích hợp Pikafish trong tài liệu ban đầu bị thay thế ở phạm vi sản phẩm.

**Hệ quả:** Tách issue cho tìm kiếm, hàm lượng giá, cấp độ, deadline/hủy tác vụ và thí nghiệm đánh giá. Cần tài liệu giải thích thuật toán, số liệu thực nghiệm và ví dụ phục vụ bảo vệ. Mong muốn làm nhanh không được dùng để cắt phần AI tự viết.

**Pressure pass:** Người dùng đã chọn giá trị học thuật của AI thay cho phương án tích hợp engine nhanh hơn. Chưa chốt ngôn ngữ AI; cần xác định năng lực/ngôn ngữ người dùng muốn đọc hiểu khi bảo vệ.

### Câu 5 — Ngôn ngữ và quyền quyết định kỹ thuật

**Người dùng xác nhận:** Ngôn ngữ nào cũng được, ưu tiên phương án tối ưu; giao agent lựa chọn.

**Diễn giải công khai của agent:** Cân bằng thời gian hoàn thành, khả năng giải thích thuật toán và hiệu năng đo được; không mặc định chỉ tối ưu tốc độ tính toán.

**Lựa chọn thiết kế ban đầu của agent:** TypeScript cho web/backend/module luật và AI; AI tìm kiếm trong worker thread thuộc tiến trình AI riêng để tránh nghẽn xử lý ván. Tái sử dụng cùng module luật thay vì duy trì hai bản luật ở hai ngôn ngữ. Không tuyên bố TypeScript nhanh nhất; nghiệm thu theo benchmark, deadline, độ sâu/nodes và chất lượng nước đi. Chỉ xem xét đổi ngôn ngữ phần tìm kiếm nếu số đo cho thấy không đạt mục tiêu sau tối ưu thuật toán.

**Còn mở:** Ngân sách hosting, thiết bị/môi trường demo; tiếp theo chốt ngân sách để xác định phương án chạy backend/AI và media.

### Câu 6 — Môi trường triển khai

**Người dùng xác nhận:** Chạy local trước, hoặc dùng Render và Vercel.

**Hệ quả:** Ưu tiên mốc đầy đủ chức năng ở local; có nhóm issue triển khai online, dự kiến frontend Vercel/backend Render sau khi kiểm tra khả năng nền tảng. Đây chưa phải xác nhận ngân sách trả phí hoặc gói dịch vụ. Supabase vẫn là lựa chọn CSDL đã nêu; chưa suy ra yêu cầu chạy toàn bộ hệ thống offline.

**Cần bảo toàn:** Media phải có kiểm thử hai mạng/TURN ở mốc online; không coi thử hai tab local là nghiệm thu kết nối Internet.

**Câu tiếp theo:** Xác định giới hạn người xem công khai so với phòng vào bằng mã, một điểm mơ hồ từ đề gốc ảnh hưởng trực tiếp đến quyền và test sức chứa.

### Câu 7 — Sức chứa người xem

**Người dùng xác nhận:** Giới hạn áp dụng cho mọi phòng; tăng từ 2 lên tối đa 5 người xem.

**Quyết định:** 2 ghế chơi + tối đa 5 ghế xem cho PUBLIC và CODE_ONLY. LOCKED vẫn không cho người xem vào theo yêu cầu khóa hoàn toàn ban đầu. Không có chế độ công khai không giới hạn.

**Thay thế tài liệu ban đầu:** Mọi con số 2 người xem/4 thành viên tối đa cần đổi thành 5 người xem/7 thành viên khi soạn đặc tả và issue. Với giả định thử tải 10 phòng, tải thành viên tương ứng là 70, chưa phải mục tiêu tải đã được người dùng xác nhận. Kiểm thử sức chứa dùng 5 người xem được nhận, người xem thứ 6 bị từ chối và tình huống tranh ghế đồng thời.

**Còn mở kế tiếp:** Người xem có nhận camera/mic của người chơi không. Không suy ra câu trả lời từ giới hạn mới.

### Câu 8 — Người xem và camera/mic

**Người dùng xác nhận:** Người xem chỉ thấy bàn cờ và chat riêng theo mặc định. Có thể xem camera/nghe cuộc nói chuyện nếu hai người chơi bật cho người xem; người chơi có thể chỉ chia sẻ với đối thủ hoặc tắt.

**Phạm vi bổ sung bắt buộc:** Media có khả năng phục vụ tối đa 5 người xem khi được phép. Giả định cũ media chỉ giữa hai người chơi không còn đủ. Khi soạn kiến trúc phải đánh giá phân phối media, quyền subscribe/publish và thu hồi quyền, tránh mặc định mesh một-một đáp ứng phần mới.

**Chưa chốt:** Mỗi người tự cấp quyền riêng cho stream của mình hay cần cả hai đồng ý trước khi mở media cho người xem; camera/mic có lựa chọn độc lập không; phạm vi đồng ý qua tái kết nối/tái đấu.

**Câu tiếp theo:** Tình huống A muốn chia sẻ với người xem, B chỉ muốn đối thủ thấy/nghe; chốt kết quả mong muốn trước chọn kiến trúc.

### Câu 9 — Quyền chia sẻ media theo người phát

**Người dùng xác nhận:** Nếu A cho phép người xem còn B chỉ chia sẻ cho đối thủ, người xem vẫn thấy/nghe riêng A. Mỗi người tự quyết quyền camera/mic của mình, không ai bật thay đối thủ.

**Quyết định nghiệp vụ:** Quyền media thuộc từng người phát, không cần biểu quyết đồng thuận cả hai. Người xem chỉ được subscribe luồng mà chủ luồng cho phép. Chủ phòng không có quyền nâng mức chia sẻ hoặc bật thiết bị của đối thủ. Kịch bản A-public/B-opponent-only là tiêu chí kiểm thử bắt buộc.

**Điểm tiếp theo cần chốt:** Camera và mic có lựa chọn phạm vi độc lập hay dùng chung một lựa chọn. Ví dụ camera chỉ đối thủ nhưng mic cho cả người xem.

### Câu 10 — Camera và mic độc lập

**Người dùng xác nhận:** Camera và mic có chế độ chia sẻ độc lập; mỗi mục gồm Tắt / Chỉ đối thủ / Đối thủ và người xem.

**Quyết định:** Mỗi người chơi sở hữu hai chính sách riêng: cameraAudience và microphoneAudience, mỗi chính sách có OFF / OPPONENT_ONLY / OPPONENT_AND_SPECTATORS. Không dùng một cờ publicMedia chung. Cho phép camera riêng đối thủ và mic cho người xem, cũng như tổ hợp ngược lại.

**Yêu cầu cho issue:** Xác thực quyền publish/subscribe theo người phát và loại track; thay đổi quyền phải được thực thi tại lớp phân phối media, không chỉ ẩn UI. OFF dừng phát track tương ứng. Thu hẹp phạm vi ngăn nhận media tiếp theo ở đối tượng mất quyền. Không tuyên bố có thể thu hồi media đã được nhận trước đó.

**Tiếp theo:** Chốt bộ luật, gồm mức tuân thủ luật lặp/chiếu dai/đuổi dai; đây là quyết định còn mở ảnh hưởng trực tiếp module luật, AI và nghiệm thu.

### Câu 11 — Bộ luật giản lược

**Người dùng xác nhận:** Dùng luật giản lược cho đồ án: đúng luật di chuyển, chiếu hết hoặc không còn nước hợp lệ thì thua. Sau khi được giải thích, người dùng đồng ý tự động hòa khi cùng thế cờ và cùng bên đến lượt xuất hiện lần thứ ba.

**Quyết định:** Bộ luật ứng dụng không tuyên bố tuân thủ đầy đủ WXF. Không phân xử riêng chiếu dai/đuổi dai; các trường hợp lặp áp dụng quy tắc hòa đã chọn. Dùng chung quy tắc cho online và AI.

**Chi tiết đặc tả do agent xác định từ quyết định:** Khóa vị trí gồm loại/bên/vị trí các quân còn trên bàn và bên đến lượt; không gồm ID quân, góc nhìn, timestamp hoặc số thứ tự nước. Đếm vị trí ban đầu là lần xuất hiện đầu tiên. Các lần xuất hiện không cần liên tiếp. Lưu/phục hồi đủ lịch sử đếm qua reconnect/restart; AI phải xét lịch sử lặp khi tìm kiếm. Hiển thị tên bộ luật và điều kiện hòa cho người chơi.

**Trạng thái phỏng vấn:** Đã chốt mục tiêu, thời hạn, CSDL, AI tự viết, local trước, sức chứa, media và luật lặp. Còn các lựa chọn sản phẩm quan trọng: đồng hồ, vòng đời ván/mất mạng, tài khoản/lời mời, chat, lịch sử/tái đấu, giao diện và ranh giới bàn giao. Chưa sẵn sàng chuyển thực thi.

### Câu 12 — Đồng hồ ván cờ

**Người dùng xác nhận:** Đồng ý lựa chọn không giới hạn hoặc 5 / 10 / 15 phút mỗi bên, mặc định không giới hạn; hết thời gian thì thua.

**Quyết định:** Thời gian là ngân sách cho cả ván của từng bên, không phải giới hạn mỗi nước. Không đề xuất cộng giây sau nước đi trong phiên bản này. Cấu hình được chốt trước khi bắt đầu; server là nguồn thời gian và kết quả chính thức. UI chỉ hiển thị đếm ngược từ trạng thái server.

**Chưa chốt:** Đồng hồ và kết quả khi mất mạng; phạm vi cho ván AI sẽ ghi rõ trong đặc tả thống nhất.

**Câu tiếp theo:** Chính sách mất mạng — khoảng chờ nối lại, đồng hồ có tiếp tục chạy, kết quả sau hạn.

### Câu 13 — Mất mạng trong ván online

**Người dùng xác nhận:** Đồng ý toàn bộ chính sách đã đề xuất.

**Quyết định:**
- Giữ ghế 60 giây để nối lại.
- Khi có đồng hồ, thời gian của bên đến lượt vẫn chạy; hết giờ thì thua.
- Hết 60 giây chưa trở lại, nếu đối thủ vẫn online thì bên mất mạng thua.
- Nếu cả hai mất mạng hoặc máy chủ gặp lỗi, đánh dấu gián đoạn, không tùy tiện chọn bên thắng.

**Yêu cầu đặc tả/kiểm thử:** Phân biệt lỗi server với mất kết nối một client; xử lý deadline và ghi kết quả nguyên tử, không kết thúc ván hai lần khi hết giờ và hết hạn reconnect gần nhau. Khi cả hai offline, không tạo kết quả thắng/thua do các timer mất mạng; chi tiết thời điểm chuyển INTERRUPTED và ưu tiên sự kiện sẽ được thống nhất trong state machine.

**Tiếp theo:** Phương thức tài khoản/xác thực, để chốt sử dụng Supabase Auth và luồng UI/API.

### Câu 14 — Đăng nhập username và Google

**Người dùng xác nhận:** Thêm đăng nhập Google ngay trong bản đồ án; tài khoản thông thường đăng nhập bằng username + mật khẩu.

**Quyết định:** Username/password và Google là hai luồng bắt buộc. Không thay yêu cầu username bằng form email/password. Tên đăng nhập duy nhất và tên hiển thị cần được định nghĩa riêng trong đặc tả.

**Chưa chốt:** Đăng ký thông thường có bắt buộc email cho xác minh/khôi phục không; quy tắc tài khoản Google lần đầu chọn username và liên kết danh tính. Chưa xem đề xuất xác minh email/quên mật khẩu trước đó là đã được chấp nhận vì người dùng đã đổi phương thức đăng nhập.

**Cần nghiên cứu khi chốt kiến trúc:** Cách tích hợp username/password với Supabase Auth mà không công khai bảng ánh xạ username-email hoặc quản lý mật khẩu trùng lặp; xử lý Google callback và liên kết tài khoản theo khả năng/giới hạn chính thức của Supabase. Không tự giả định Supabase Auth nhận username như email trực tiếp.

### Câu 15 — Email cho tài khoản username/password

**Người dùng xác nhận:** Đồng ý yêu cầu email khi đăng ký để xác minh và lấy lại mật khẩu; vẫn đăng nhập bằng username.

**Quyết định:** Đăng ký thông thường gồm username + email + mật khẩu; có xác minh email và khôi phục mật khẩu qua email. Google login vẫn bắt buộc. Không đổi form đăng nhập thông thường thành email/password.

**Cần xử lý trong đặc tả:** Quy tắc username duy nhất/chuẩn hóa, tên hiển thị riêng, onboarding Google, chống lộ email khi tra username, và liên kết danh tính an toàn. Đây là chi tiết kỹ thuật cần nghiên cứu và đặc tả, không phải lý do xây hai hệ thống mật khẩu.

**Tiếp theo:** Phạm vi kết bạn phục vụ mời trong game — chỉ tìm tài khoản/mời hay có quan hệ bạn bè hai chiều và danh sách online.

### Câu 16 — Hệ thống kết bạn

**Câu hỏi đã đưa ra:** Có hệ thống kết bạn (gửi/chấp nhận, danh sách bạn, online để mời) hay chỉ tìm username rồi mời; agent đề xuất có hệ thống kết bạn.

**Người dùng trả lời:** “okii”.

**Diễn giải đã thông báo công khai:** Người dùng đồng ý đề xuất có hệ thống kết bạn.

**Phạm vi bắt buộc:** Gửi/chấp nhận lời mời kết bạn, danh sách bạn, trạng thái online và mời bạn vào phòng. Link/mã mời từ yêu cầu gốc vẫn giữ. Những hành vi từ chối/hủy yêu cầu, hủy kết bạn cần đặc tả như phần vòng đời quan hệ; không tự suy ra cần chat riêng ngoài phòng hoặc mạng xã hội.

**Còn mở:** Các tiện ích trong/sau ván (đầu hàng, xin hòa, tái đấu, lịch sử, xin đi lại) và phạm vi chấm điểm/xếp hạng; UI và quyền mặc định cần được chốt trước bàn giao issue.

### Câu 17 — Thao tác trong/sau ván và đi lại

**Đề xuất đã đưa ra:** Đầu hàng; xin hòa cần đối thủ đồng ý; tái đấu đổi bên; lịch sử ván xem lại từng nước. Hỗ trợ xin đi lại: online cần đối thủ chấp nhận; AI lùi về trước lượt gần nhất của người chơi.

**Người dùng trả lời:** “okiii”.

**Diễn giải đã thông báo công khai:** Đồng ý toàn bộ nhóm, gồm cả xin đi lại.

**Phạm vi bắt buộc:** Đầu hàng, đề nghị/chấp nhận/từ chối hòa, tái đấu đổi bên, lịch sử và replay, đề nghị/chấp nhận/từ chối đi lại online, undo AI đến trước lượt gần nhất của người chơi.

**Chi tiết phải đặc tả:** Số ply bị lùi khi đối thủ đã đi; thời gian không được tự động hoàn lại nếu chưa chốt chính sách; tái lập bộ đếm lặp theo nhánh hiệu lực; phiên bản đồng bộ tăng đơn điệu dù lịch sử nước đi bị lùi; kết quả AI đang chạy phải bị hủy/loại; không sửa lịch sử ván kết thúc. Cần chốt chính sách đồng hồ khi undo ở một câu riêng có ví dụ.

### Câu 18 — Đồng hồ khi đi lại

**Người dùng xác nhận:** Đồng ý không hoàn lại thời gian đã dùng khi đi lại; chỉ khôi phục bàn cờ và lượt. Trong lúc chờ chấp nhận, đồng hồ bên đến lượt vẫn chạy bình thường.

**Quyết định:** Khi chấp nhận undo, server tính đủ thời gian đã trôi đến thời điểm xử lý, giữ ngân sách còn lại của từng bên rồi chuyển bên chạy đồng hồ theo vị trí được khôi phục. Không phục hồi snapshot thời gian cũ. Hết giờ trước khi chấp nhận kết thúc ván, yêu cầu undo không hồi sinh ván đã kết thúc.

**Câu tiếp theo:** Định hướng giao diện để đặc tả UI nhất quán cho agent thực thi; chưa chốt phong cách từ tài liệu ban đầu.

### Câu 19 — Phong cách giao diện

**Người dùng xác nhận:** Phong cách cờ tướng truyền thống với bàn gỗ, quân chữ Hán.

**Quyết định:** Đây là định hướng thị giác chính cho đặc tả UI; không dùng đề xuất giao diện hiện đại làm mặc định. Quân chữ Hán là cách hiển thị được chọn; chưa thêm tùy chọn đổi quân sang chữ Việt như một tính năng bắt buộc. Cần thiết kế màu đỏ/đen, dấu chọn/nước đi/chiếu và bố cục chat/media không che bàn, vẫn bảo đảm khả năng đọc và thao tác.

**Câu tiếp theo:** Thiết bị phải nghiệm thu: chỉ desktop/laptop hay cả điện thoại trên trình duyệt. Không tự coi giả định responsive trong tài liệu ban đầu là người dùng đã chốt.

### Câu 20 — Thiết bị hỗ trợ

**Người dùng xác nhận:** Hỗ trợ cả máy tính và điện thoại qua trình duyệt theo đề xuất.

**Quyết định:** Web responsive cho desktop/laptop và điện thoại; chat/camera thu gọn trên điện thoại để ưu tiên bàn cờ. Không suy ra yêu cầu app native. Kiểm thử UI và thao tác cảm ứng, cùng quyền thiết bị/media trên các trình duyệt mục tiêu được đặc tả trong kế hoạch.

**Trạng thái:** Các tính năng chơi và trải nghiệm chính đã rõ. Cần chốt ranh giới “toàn bộ”: các tính năng mở rộng như xếp hạng/giải đấu/thanh toán trước đây được ghi ngoài phạm vi, không tự thêm vào bản đồ án.

### Câu 21 — Camera/mic trực tiếp, không ghi cuộc gọi

**Người dùng xác nhận:** Chỉ cần camera/mic trực tiếp.

**Quyết định:** Không ghi âm, ghi hình, lưu file cuộc gọi, phát lại hoặc tải cuộc gọi. Media trực tiếp với quyền theo từng người phát và từng loại track vẫn thuộc phạm vi bắt buộc. Không gán tính năng ghi cuộc gọi vào roadmap tương lai khi chưa được yêu cầu.

**Làm rõ:** Lịch sử xem lại nước cờ đã được chấp nhận là dữ liệu ván, không phải video cuộc gọi.

**Còn mở về ranh giới:** Câu hỏi gộp trước đó về Elo/giải đấu/thanh toán chưa được người dùng trả lời; không xem câu trả lời chỉ cần media trực tiếp là xác nhận các phần này.

### Câu 22 — Bảng xếp hạng/Elo

**Đề xuất đã đưa ra:** Chưa đưa bảng xếp hạng hoặc điểm Elo vào bản đồ án để ưu tiên chức năng đã chốt.

**Người dùng trả lời:** “Okii”.

**Diễn giải đã thông báo:** Đồng ý chưa làm bảng xếp hạng/Elo.

**Quyết định phạm vi:** Không tạo issue triển khai Elo/bảng xếp hạng trong đợt này. Giải đấu/thanh toán cũng không có yêu cầu bổ sung nên không tự thêm; không tuyên bố người dùng đã xác nhận riêng hai mục đó.

**Câu tiếp theo:** Cấp độ và thời gian suy nghĩ AI tự viết. Giả định ban đầu ba cấp chưa được chốt trực tiếp; cần định nghĩa trải nghiệm trước benchmark và phân rã issue thuật toán.

### Câu 23 — Cấp độ AI và thời gian suy nghĩ

**Người dùng xác nhận:** Đồng ý 3 cấp Dễ / Trung bình / Khó với ngân sách suy nghĩ ban đầu khoảng 0,3 / 1 / 3 giây mỗi nước; sức mạnh được đo và điều chỉnh qua thí nghiệm, không chỉ dựa vào thời gian.

**Quyết định:** AI tự viết có 3 cấp và ngân sách mục tiêu 300 / 1000 / 3000 ms cho tìm kiếm. Đây là ngân sách tính toán, không bảo đảm tổng độ trễ mạng/UI bằng con số đó. Đặc tả cần giới hạn tìm kiếm theo thời gian còn lại của máy, có nước hợp lệ dự phòng và hủy job khi ván/phiên bản thay đổi.

**Kiểm chứng bắt buộc trong bộ issue:** Thống kê nodes, độ sâu hoàn thành, thời gian, kết quả tập thế cờ và đấu đối kháng có kiểm soát. Không tự gán Elo hoặc tuyên bố mức khó ngang engine chuyên dụng.

**Câu tiếp theo:** Quyền tự quyết các chi tiết chưa được chốt để hoàn tất đặc tả mà không kéo dài phỏng vấn cho từng tình huống nhỏ. Những điểm làm thay đổi phạm vi/chi phí/quyền riêng tư vẫn phải nêu rõ.

### Câu 24 — Quyền tự quyết và kết thúc phỏng vấn

**Người dùng xác nhận:** Đồng ý để agent chốt chi tiết còn lại theo hướng đơn giản, nhất quán, dễ kiểm thử; ghi rõ vào đặc tả. Hỏi lại nếu có thay đổi lớn về phạm vi, chi phí hoặc quyền riêng tư.

**Kết quả:** Kết thúc phỏng vấn thông thường. Bộ issue triển khai đủ chức năng đã chốt; quyết định thiết kế còn lại do agent ghi rõ trong đặc tả chính thức. Không tự mua dịch vụ, tạo tài nguyên trả phí, hay triển khai ứng dụng trong task lập kế hoạch này.

**Tiêu chí sẵn sàng:** Không còn lựa chọn nghiệp vụ lớn bỏ ngỏ; có hợp đồng chung, issue có phụ thuộc/đầu ra/test; kiểm tra bao phủ toàn bộ yêu cầu; điều kiện hạ tầng bên ngoài được phân biệt với thiếu đặc tả.
