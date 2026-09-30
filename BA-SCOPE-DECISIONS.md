# BIÊN BẢN CHỐT YÊU CẦU NGHIỆP VỤ & PHẠM VI SẢN PHẨM (BA SCOPE FREEZE)

> **Dự án:** Cờ Tướng Online (XIANGQI)  
> **Đại diện Product Owner:** Twot  
> **Đại diện Phân tích Nghiệp vụ (BA):** Hermes Agent  
> **Cập nhật lần cuối:** 29/09/2026  

Tài liệu này ghi nhận chính thức các quyết định điều chỉnh, bổ sung hoặc giữ nguyên tính năng sau quá trình rà soát giữa BA và Product Owner nhằm chốt cứng phạm vi triển khai (Scope Freeze).

---

## PHẦN 1: TÀI KHOẢN & ĐĂNG NHẬP (Yêu cầu 1)

### Quyết định 1.1: Luồng Đăng ký tài khoản hệ thống (Wizard 3 bước: Username+Mật khẩu $\rightarrow$ Email $\rightarrow$ OTP xác minh)
* **Lựa chọn đã chốt:** **[REG-FLOW] Đăng ký theo quy trình phân bước trực quan kèm xác minh OTP Email**
* **Mô tả nghiệp vụ:**
  * Tại màn hình Đăng ký (`SCR-REGISTER`), giao diện hiển thị 2 khung nhập liệu ban đầu:
    * `Username:` (Tên đăng nhập: duy nhất toàn hệ thống, 3–20 ký tự, viết liền không dấu `^[a-zA-Z0-9_]{3,20}$`).
    * `Mật khẩu:` (Tối thiểu 8 ký tự, có ô xác nhận lại mật khẩu).
  * **Quy trình 3 bước hoàn tất đăng ký:**
    1. **Bước 1 (Nhập Username & Mật khẩu):** Người dùng điền đầy đủ và bấm nút **"Xác nhận / Tiếp tục"**. Hệ thống kiểm tra tính duy nhất (UNIQUE) của `username`.
    2. **Bước 2 (Nhập Email):** Giao diện chuyển tiếp mượt mà sang khung nhập `Email:`. Người dùng điền địa chỉ email chính chủ và bấm **"Xác nhận Email"**.
    3. **Bước 3 (Xác thực Email qua mã OTP):** Hệ thống kích hoạt Supabase Auth gửi mã OTP 6 chữ số đến địa chỉ email vừa nhập, đồng thời hiển thị khung nhập mã OTP. Người dùng kiểm tra hòm thư (check mail), lấy mã và nhập vào hệ thống để xác nhận email vừa nhập là chính xác và đang hoạt động. Xác thực OTP thành công $\rightarrow$ Tài khoản chuyển sang trạng thái `ACTIVE`, tự động đăng nhập và đưa vào sảnh chính.

---

### Quyết định 1.2: Đăng ký qua Google OAuth & Thiết lập kép Username + Password (Không cần OTP)
* **Lựa chọn đã chốt:** **[REG-GOOGLE] Nút Google OAuth nằm ngay dưới khung đăng ký; thiết lập Username+Password để đăng nhập kép; miễn xác thực OTP**
* **Mô tả nghiệp vụ:**
  * Ngay bên dưới khung đăng ký bằng `Username / Mật khẩu`, hệ thống bố trí nút bấm nổi bật: **"Đăng ký bằng Google" (Google OAuth)**.
  * **Quy trình đăng ký 1 chạm:**
    1. Người dùng bấm nút và chọn tài khoản Gmail đã có sẵn trên thiết bị/trình duyệt của mình.
    2. Sau khi xác thực danh tính với Google thành công, giao diện chuyển tiếp ngay sang màn hình nhập:
       * `Username:` (Tên tài khoản duy nhất, 3–20 ký tự).
       * `Mật khẩu:` (Mật khẩu cá nhân, tối thiểu 8 ký tự).
    3. **Miễn xác thực Email bằng OTP:** Do địa chỉ email đã được Google xác thực an toàn tuyệt đối, hệ thống **không yêu cầu nhập mã OTP email** trong luồng này.
    4. Người dùng xác nhận $\rightarrow$ Hoàn tất tạo tài khoản thành công.
  * **Mục đích:** Thiết lập sẵn cả 2 phương thức đăng nhập độc lập (người dùng có thể đăng nhập bằng Google OAuth hoặc đăng nhập bằng `Username + Mật khẩu` ở các lần sau nếu không muốn dùng Google).
  * **Quy tắc kiểm tra trùng Email khi Đăng ký Google OA:**
    * Nếu tài khoản Gmail người dùng vừa chọn **ĐÃ ĐƯỢC ĐĂNG KÝ TRƯỚC ĐÓ** trên hệ thống $\rightarrow$ Hệ thống hiển thị thông báo lỗi rõ ràng: ⚠️ *"Email này đã được đăng ký"*. (Người dùng muốn đăng nhập thì quay về màn hình Đăng nhập để đăng nhập).

---

### Quyết định 1.3: Chế độ Khách (Guest Mode) & Cơ chế Nâng cấp tài khoản
* **Lựa chọn đã chốt:** **[GUEST-FLOW] Nút "Guest" riêng biệt tại màn hình Đăng nhập kèm cảnh báo cấm Ranked; Nâng cấp bằng cách Đăng xuất**
* **Mô tả nghiệp vụ:**
  * Tại màn hình Đăng nhập (`SCR-LOGIN`), hệ thống bố trí một nút riêng biệt nổi bật: **"Guest"** (hoặc *"Chơi nhanh với tư cách Khách"*).
  * **Hiển thị ghi chú trực quan (Visual Note):** Ngay dưới nút "Guest", hiển thị dòng chữ cảnh báo rõ ràng:
    > ⚠️ *"Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."*
  * **Quyền hạn của Khách:** Bấm nút $\rightarrow$ Chỉ cần nhập Tên hiển thị tạm thời (2–20 ký tự) là vào chơi phòng cờ thường (Casual), đánh với AI hoặc làm khán giả xem cờ ngay lập tức mà không cần tạo tài khoản.
  * **Cơ chế Nâng cấp lên tài khoản chính thức:** Khi kỳ thủ đang chơi ở chế độ Khách muốn tạo tài khoản chính thức để lưu thành tích và leo Rank $\rightarrow$ Kỳ thủ bấm **"Đăng xuất"** để thoát phiên tạm thời, sau đó quay ra màn hình Đăng ký tạo tài khoản mới bình thường.

---

### Quyết định 1.4: Phân định rạch ròi Username vs Display Name & Luồng Khởi tạo Tên hiển thị (Phương án C - Đăng ký siêu tốc)
* **Lựa chọn đã chốt:** **[NAME-SPLIT-OPTION-C] Tách riêng Username & Display Name; Mặc định khởi tạo `Display Name = Username`; Đổi tên hiển thị tự do trong Cài đặt hồ sơ không cần OTP**
* **Mô tả nghiệp vụ:**
  1. **Phân định 2 khái niệm định danh:**
     * **`Username` (Tên tài khoản / Tên đăng nhập):**
       * Dùng để đăng nhập vào hệ thống cùng với Mật khẩu.
       * Quy tắc: Bắt buộc duy nhất (UNIQUE) toàn hệ thống, 3–20 ký tự, viết liền không dấu, không khoảng trắng (`^[a-zA-Z0-9_]{3,20}$`).
       * Bảo mật đổi tên: Bắt buộc phải trải qua quy trình 4 bước xác thực mã OTP gửi về Email (`Quyết định 1.6`).
       * Tần suất: Cho phép đổi liên tục không giới hạn số lần (không cooldown) để thuận lợi cho dev và test.
     * **`Display Name` (Tên hiển thị trong game):**
       * Dùng để hiển thị trên bàn cờ thi đấu, khung webcam đối thủ, danh sách bạn bè, bảng xếp hạng và hồ sơ cá nhân.
       * Quy tắc: Hỗ trợ tiếng Việt có dấu, có khoảng trắng, ký tự đặc biệt thông dụng (VD: *"Nguyễn Ngọc Tình"*), độ dài 2–30 ký tự.
  2. **Cơ chế Khởi tạo Tên hiển thị (Phương án C — Tối ưu đăng ký siêu tốc):**
     * **Khi tạo tài khoản mới thành công (cả Đăng ký thường 3 bước lẫn qua Google OAuth):**
       * Hệ thống **tự động gán mặc định `display_name = username`** (hoặc nếu là Google OAuth thì có thể gán Full Name từ tài khoản Google).
       * Không bắt người dùng phải qua thêm màn hình nhập liệu rườm rà nào, người dùng được đưa thẳng vào Sảnh chính ngay lập tức để trải nghiệm game.
  3. **Nơi người dùng nhập / thay đổi Display Name:**
     * Khi đã vào game, nếu người dùng muốn đặt tên tiếng Việt có dấu cho trang trọng:
       1. Người dùng bấm vào **Avatar cá nhân** ở góc trên thanh điều hướng $\rightarrow$ Chọn **Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`)**.
       2. Tại khung **"Thông tin cá nhân"**, tìm ô **`Tên hiển thị (Display Name):`** và gõ tên tiếng Việt mong muốn (VD: *Nguyễn Ngọc Tình*).
       3. Bấm nút **"Lưu thay đổi"** $\rightarrow$ Hệ thống cập nhật tức thì.
       4. **Quy tắc bảo mật:** Việc đổi Display Name là **HOÀN TOÀN TỰ DO VÀ KHÔNG CẦN MÃ OTP**.
  4. **Đối với Chế độ Khách (Guest Mode):**
     * Tại màn hình Đăng nhập, khi bấm nút **"Guest"** $\rightarrow$ Hệ thống mở popup nhỏ yêu cầu nhập: `Tên hiển thị tạm thời:` (2–20 ký tự, hỗ trợ tiếng Việt có dấu) để hiển thị trong phòng cờ giao lưu.

---

### Quyết định 1.5: Quy chuẩn Thời hạn mã OTP & Chống dò mã (Security Rules)
* **Lựa chọn đã chốt:** **[OTP-RULES] Hạn 3 phút; Hủy mã nếu sai quá 5 lần**
* **Mô tả nghiệp vụ:**
  * **Thời hạn hiệu lực của mã OTP:** Mã OTP 6 chữ số chỉ có giá trị trong vòng **3 phút (180 giây)** kể từ khi gửi. Quá 3 phút mã sẽ tự động hết hạn và bị vô hiệu hóa.
  * **Giới hạn số lần nhập sai (Chống dò mã / Anti-Brute-Force):** Nếu người dùng nhập sai mã OTP liên tiếp **quá 5 lần** $\rightarrow$ Hệ thống lập tức hủy mã OTP hiện tại, khóa phiên xác thực đó và bắt buộc người dùng bấm "Gửi lại mã mới".
  * **Đồng hồ đếm lùi gửi lại:** Nút "Gửi lại mã OTP" áp dụng bộ đếm lùi **60 giây** để chống hành vi bấm spam gửi mail liên tục làm nghẽn máy chủ.

---

### Quyết định 1.6: Quy trình 4 bước đổi Username qua OTP & Cố định Email (Immutable Email)
* **Lựa chọn đã chốt:** **[USER-OTP-FLOW] 4 bước đổi Username qua OTP Supabase; Cấm tuyệt đối đổi Email**
* **Mô tả quy trình 4 bước:**
  1. **Bước 1 (Chọn chức năng):** Tại Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`), người dùng bấm nút **"Đổi Username"** $\rightarrow$ Hệ thống gửi mã OTP 6 số về email và mở modal nhập mã OTP (`SCR-OTP-MODAL`).
  2. **Bước 2 (Nhập OTP):** Người dùng kiểm tra email nhận mã, nhập mã OTP vào modal (thời hạn 3 phút, sai quá 5 lần hủy mã).
  3. **Bước 3 (Xác thực & Mở khóa):** Hệ thống xác thực OTP thành công $\rightarrow$ Mở khóa cho phép nhập liệu ô `Username` mới.
  4. **Bước 4 (Đổi & Xác nhận):** Người dùng nhập `username` mới mong muốn (unique, 3–20 ký tự) và bấm **"Xác nhận thay đổi"** $\rightarrow$ Cập nhật thành công.
* **Bảo toàn dữ liệu tuyệt đối (Data Integrity):** Toàn bộ lịch sử ván cờ, điểm Elo, tin nhắn chat và danh sách bạn bè đều gắn với `user_id` (UUID bất biến). Đổi Username bảo toàn nguyên vẹn 100% dữ liệu.
* **Chính sách đối với Email:** Trường `email` hiển thị khóa cứng hoàn toàn (`READONLY` / `DISABLED`), tuyệt đối không cho phép đổi nhằm bảo vệ danh tính gốc Supabase Auth và là đích nhận OTP bất biến.

## PHẦN 2: TẠO PHÒNG, PHÒNG CHỜ & MỜI BẠN (Yêu cầu 2 & 3)

### Quyết định 2.0: Kiến trúc 3 Chế độ chơi tại Màn hình Sảnh chính (Lobby Hub)
* **Lựa chọn đã chốt:** **[LOBBY-MODES] Màn hình Sảnh chính phân chia rõ rệt 3 Chế độ chơi: Đánh Thường, Đánh Hạng & Đánh Với Máy**
* **Mô tả nghiệp vụ:**
  * Tại Màn hình Sảnh chính (`SCR-LOBBY`), người chơi được tiếp cận 3 phân vùng chế độ chơi rõ ràng:
  
  1. **Chế độ 1: ĐÁNH THƯỜNG (Casual Mode) — Giao lưu, tập luyện & giải trí:**
     * **Ghép trận ngẫu nhiên (Casual Quick Match):** Người dùng bấm nút "Ghép ngẫu nhiên", máy chủ tự động tìm kiếm người chơi khác trong hệ thống cũng đang chọn ghép ngẫu nhiên để tạo phòng giao lưu tức thì (không tính điểm Elo).
     * **Tạo phòng thi đấu (Custom Room / Solo):** Người dùng tự thiết lập phòng để mời bạn bè vào solo so tài (hỗ trợ đầy đủ các kênh chia sẻ: Link URL, Mã QR, Mã phòng 8 ký tự, mời bạn bè đang Online).
     * **Danh sách phòng đang có (Lobby Room List):** Hiển thị danh sách các phòng cờ đang hoạt động để người khác bấm vào làm Khán giả xem cờ.
       * *Điều kiện hiển thị nghiêm ngặt:* **Chỉ các phòng được thiết lập ở chế độ CÔNG KHAI (`PUBLIC`)** (bao gồm cả phòng ghép ngẫu nhiên và phòng solo để công khai) thì mới xuất hiện trong danh sách này để người khác vào xem. Các phòng cài đặt chế độ `CODE_ONLY` (Cần mã) hoặc `LOCKED` (Khóa) tuyệt đối không hiển thị ở Sảnh.

  2. **Chế độ 2: ĐÁNH HẠNG (Ranked Mode) — So tài nghiêm ngặt leo Rank Elo:**
     * **Ghép ngẫu nhiên 100% (Pure Matchmaking):** Dựa trên thuật toán cân bằng điểm Elo FIDE ($\Delta Elo \le 100$). Người chơi bấm "Tìm trận Xếp hạng" là máy chủ tự ghép ngẫu nhiên, **tuyệt đối không cho phép tự chọn đối thủ, không cho mời bạn bè vào đánh rank** để chống gian lận "bơm điểm Elo".
     * **TUYỆT ĐỐI KHÔNG CHO NGƯỜI KHÁC VÀO XEM (NO SPECTATORS):** Ván cờ Xếp hạng được khóa kín hoàn toàn giữa 2 kỳ thủ. Phòng cờ Ranked không xuất hiện trong danh sách phòng ở Sảnh, không cho phép bất kỳ ai vào xem làm khán giả, bảo đảm sự tập trung và bảo mật chiến thuật tuyệt đối.
     * **TUYỆT ĐỐI CẤM XIN ĐI LẠI (NO UNDO):** "Bút sa gà chết", nút xin đi lại bị vô hiệu hóa/ẩn hoàn toàn.
     * **Quy tắc nghiêm ngặt khác:** Thời gian cố định 10 phút Rapid mỗi bên; xử lý bỏ cuộc (Rage Quit) quá 60s bị xử thua phạt trừ Elo; Khách (Guest) không được tham gia.

  3. **Chế độ 3: ĐÁNH VỚI MÁY (AI Mode) — Rèn luyện kỳ nghệ đơn phương:**
     * Người chơi chọn thi đấu theo từng cấp độ khó: **Dễ (Easy)**, **Trung bình (Medium)**, **Khó (Hard)**.
     * Tự do chọn cầm quân Đỏ hoặc Đen, cho phép Undo lùi nước cờ tự do không cần xin phép, toàn bộ ván đấu được lưu vào Lịch sử hồ sơ cá nhân và có thể xem lại (Replay) từng nước.

---

### Quyết định 2.1: Giữ nguyên cơ chế thời gian cố định (Không cộng giây)
* **Lựa chọn đã chốt:** **[3A] Thời gian cố định (Fixed Clock), không áp dụng luật cộng giây (No Increment)**
* **Mô tả nghiệp vụ:**
  * Giữ nguyên 4 chế độ thời gian thi đấu cố định:
    1. *Không giới hạn thời gian (Mặc định)* — Kích hoạt cơ chế chống treo ván `R17` (sau 3 phút hỏi, sau 30s xử thua nếu im lặng).
    2. *5 phút mỗi bên (Chớp nhoáng / Blitz)*.
    3. *10 phút mỗi bên (Nhanh / Rapid)*.
    4. *15 phút mỗi bên (Tiêu chuẩn / Standard)*.
  * Khi hết giờ (`clock <= 0`), máy chủ tự động kết thúc ván và xử thua bên hết giờ (`TIMEOUT`).
  * **Lý do kỹ thuật & tiến độ:** Giúp logic đồng hồ đếm lùi trên máy chủ và việc bù trừ độ trễ mạng (Network Latency Compensation) ở client luôn đơn giản, chính xác tuyệt đối, tránh tranh cãi về thời gian khi thi đấu.

---

### Quyết định 2.2: Bổ sung Mã QR (QR Code) chia sẻ phòng thi đấu
* **Lựa chọn đã chốt:** **[4B] Thêm Mã QR (QR Code) song song với Link mời và Mã phòng 8 ký tự**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn (`SCR-INVITE-MODAL`) và Màn hình phòng chờ (`SCR-WAITING-ROOM`), bổ sung khối hiển thị **Mã QR trực quan**.
  * Mã QR mã hóa đường link mời phòng chứa token bảo mật (URL có dạng `https://domain/rooms/join?token=...&scope=WATCH` hoặc `scope=PLAY`).
  * Người chơi có thể dùng camera điện thoại hoặc ứng dụng quét mã (Zalo, Camera native) quét mã QR để mở thẳng trình duyệt web vào phòng cờ.
  * Hỗ trợ nút **"Tải ảnh QR"** hoặc **"Sao chép QR"** để người chơi gửi nhanh vào các nhóm chat.
* **Lợi ích thực tế:** Tăng tính tiện lợi tối đa cho người dùng di động, tăng điểm trải nghiệm người dùng (UX) khi demo đồ án.

---

### Quyết định 2.3: Cơ chế Ghế ngồi, Đổi bên linh hoạt, Bắt đầu 3.. 2.. 1.. & Chuyển quyền Chủ phòng (Host Transfer)
* **Lựa chọn đã chốt:** **[ROOM-FLOW] Quản lý ghế đơn/đôi linh hoạt; Đổi bên reset Ready; Đếm ngược 3s tự động vào ván; Nhượng quyền Host khi Host rời**
* **Mô tả nghiệp vụ:**
  1. **Quy tắc Ghế ngồi khi Tạo phòng:**
     * Khi tạo phòng thành công, Chủ phòng (Host) mặc định tự động ngồi vào **ghế ĐỎ** (cầm quân Đỏ, bên đi trước).
     * **Đổi ghế tự do khi một mình:** Trong thời gian chờ người thứ 2 vào phòng, Chủ phòng có toàn quyền bấm chuyển sang ghế Đen hoặc bấm đổi qua lại giữa 2 ghế Đỏ $\leftrightarrow$ Đen bao nhiêu lần tùy thích.
     * **Người thứ 2 vào phòng:** Hệ thống tự động xếp người thứ 2 vào **ghế còn trống** (nếu Host đang ngồi Đỏ thì người 2 vào Đen; nếu Host đang ngồi Đen thì người 2 vào Đỏ).
  2. **Cơ chế Xin đổi bên khi đã đủ 2 người (Side Swap):**
     * Khi cả 2 ghế đã có người, bất kỳ kỳ thủ nào cũng có thể bấm nút **"Xin đổi bên"**.
     * Hệ thống gửi thông báo xác nhận đến đối thủ với thời hạn chờ 30 giây.
     * Nếu đối thủ đồng ý: Hai kỳ thủ hoán đổi ghế Đỏ $\leftrightarrow$ Đen cho nhau.
     * **Quy tắc bảo vệ (Ready Reset):** Ngay khi đổi bên thành công, trạng thái "Sẵn sàng" của cả hai đấu thủ sẽ **tự động chuyển về trạng thái Chưa sẵn sàng (`ready = false`)**, buộc hai bên phải xác nhận lại phe cờ của mình trước khi bắt đầu.
  3. **Cơ chế Sẵn sàng (Ready) & Đếm ngược tự động vào ván cờ:**
     * Chủ phòng khi vào phòng có thể bấm **"Sẵn sàng"** trước hoặc bấm hủy sẵn sàng để chờ người thứ 2 vào.
     * Người thứ 2 vào phòng có thể trao đổi qua khung chat, bấm xin đổi bên... Khi đã sẵn sàng thi đấu thì bấm nút **"Sẵn sàng"**.
     * **Khi CẢ HAI BÊN CÙNG SẴN SÀNG (`ready_red = true` VÀ `ready_black = true`):**
       * Hệ thống tự động kích hoạt hiệu ứng đếm ngược: **3... 2... 1...** kèm âm thanh cờ gỗ.
       * Hết 3 giây đếm ngược, máy chủ chính thức khởi tạo hiệp đấu mới (`Match ID`), chuyển giao diện sang phòng thi đấu cờ trực tiếp (`SCR-GAME-ROOM`), đồng hồ thi đấu bắt đầu tính giờ cho bên quân Đỏ.
  4. **Xử lý khi Chủ phòng (Host) rời phòng chờ (`status = WAITING`):**
     * **Chuyển quyền Chủ phòng (Host Transfer):** Nếu trong phòng đang có người chơi thứ 2, máy chủ **tự động nhượng quyền Chủ phòng (Host) cho người chơi thứ 2**. Người chơi thứ 2 trở thành Host mới, giữ nguyên phòng để tiếp tục chờ kỳ thủ khác vào chơi.
     * *Khi nào phòng mới đóng?* Chỉ khi trong phòng không còn người chơi nào khác (hoặc chỉ còn khán giả) mà Host rời đi thì phòng mới tự động đóng (`status = CLOSED`).

---

### Quyết định 2.4: Luồng Tham gia phòng qua Link URL / Mã QR (Redirect tự động sau Đăng nhập / Guest)
* **Lựa chọn đã chốt:** **[JOIN-REDIRECT] Tự động chuyển tiếp vào phòng sau khi Đăng nhập / Chọn Guest**
* **Mô tả nghiệp vụ:**
  * Khi người dùng nhấp vào Link mời hoặc quét Mã QR trên thiết bị:
    * **Trường hợp 1 (Đã đăng nhập):** Hệ thống lập tức đưa thẳng người dùng vào phòng thi đấu (vào ghế chơi nếu phòng còn chỗ, hoặc vào làm khán giả xem).
    * **Trường hợp 2 (Chưa đăng nhập):** Hệ thống hiển thị màn hình Đăng nhập / Đăng ký kèm nút **"Guest" (Chơi nhanh)**.
    * **Tự động chuyển tiếp (Auto-Redirect):** Ngay sau khi người dùng đăng nhập thành công (hoặc bấm chọn chơi nhanh bằng Guest) $\rightarrow$ Hệ thống tự động điều hướng thẳng vào đúng phòng cờ mục tiêu ban đầu, **tuyệt đối không bắt người dùng phải bấm link hoặc quét lại mã QR lần thứ 2**.

---

### Quyết định 2.5: Mời bạn bè trực tiếp trong game (Chỉ mời bạn bè Online)
* **Lựa chọn đã chốt:** **[INVITE-ONLINE-ONLY] Nút "Mời" chỉ kích hoạt với bạn bè đang Online; Pop-up 30s**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn bè (`SCR-INVITE-MODAL`), danh sách bạn bè hiển thị rõ trạng thái:
    * 🟢 **Bạn bè đang Online:** Nút **"Mời"** sáng màu và cho phép bấm gửi lời mời.
    * ⚫ **Bạn bè đang Offline:** **Không cho phép gửi lời mời**, nút "Mời" bị ẩn hoặc ở trạng thái vô hiệu hóa kèm nhãn *"Ngoại tuyến"*.
  * **Cơ chế hiển thị lời mời cho người nhận:**
    * Khi được mời, trên màn hình của bạn bè đang online sẽ lập tức xuất hiện một pop-up thông báo nổi ở góc:
      > ✉️ *"Kỳ thủ [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* kèm 2 nút: **[Tham gia]** và **[Từ chối]**.
    * Pop-up có thời hạn đếm lùi **30 giây**, nếu người nhận không bấm thì pop-up sẽ tự động biến mất và lời mời hết hiệu lực.

---

### Quyết định 2.6: Tự động chuyển thành Khán giả (Fallback to Spectator) khi phòng đã đủ 2 người chơi
* **Lựa chọn đã chốt:** **[AUTO-SPECTATOR] Tự động chuyển vai trò Khán giả nếu ghế đấu đã kín (< 5 khán giả)**
* **Mô tả nghiệp vụ:**
  * Khi một người dùng truy cập phòng (qua Link mời, Mã phòng hoặc Mã QR):
    * Nếu 2 ghế đấu đã đủ người, nhưng phòng vẫn còn chỗ xem (số khán giả hiện tại $< 5$ người) $\rightarrow$ Máy chủ tự động cấp quyền vào phòng với vai trò **Khán giả (`role = SPECTATOR`)** và hiển thị thông báo nhẹ:
      > ℹ️ *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Khán giả."*
    * Nếu phòng đã đạt trần sức chứa tối đa **7 người (2 người chơi + 5 khán giả)** $\rightarrow$ Máy chủ từ chối tiếp nhận và thông báo lỗi rõ ràng: ⚠️ *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"*.

## PHẦN 3: BÀN CỜ & LUẬT THI ĐẤU (Yêu cầu 4 & 5)

### Quyết định 3.1: Thuần chữ Hán truyền thống cho mặt quân cờ
* **Lựa chọn đã chốt:** **[5A] Giữ nguyên 100% quân cờ chữ Hán truyền thống (No Latin/Vietnamese letters)**
* **Mô tả nghiệp vụ:**
  * Giữ nguyên thiết kế quân cờ gỗ khắc chữ Hán cổ điển theo 7 cặp quân:
    * Đỏ (Red): 帥 (Tướng), 仕 (Sĩ), 相 (Tượng), 俥 (Xe), 傌 (Mã), 炮 (Pháo), 兵 (Binh).
    * Đen (Black): 將 (Tướng), 士 (Sĩ), 象 (Tượng), 車 (Xe), 馬 (Mã), 砲 (Pháo), 卒 (Tốt).
  * Không đưa tùy chọn chữ Tiếng Việt vào mặt quân cờ để giữ vững phong cách thẩm mỹ cổ điển trang nhã và đồng nhất bộ SVG nguyên mẫu.
  * Hỗ trợ chuẩn trợ năng `DT-21` (WCAG 2.1 AA): Đi kèm viền bao quanh phân biệt bên, nhãn văn bản trạng thái hiển thị rõ ràng cho người dùng khiếm thị/mù màu.

---

### Quyết định 3.2: Giới hạn tối đa 3 lần Xin đi lại (Undo) trong một ván
* **Lựa chọn đã chốt:** **[6B] Giới hạn tối đa 3 lần được chấp thuận Undo mỗi bên trong một ván đấu**
* **Mô tả nghiệp vụ:**
  * Mỗi đấu thủ chỉ được đối thủ đồng ý đi lại tối đa **3 lần** trong suốt thời gian diễn ra ván cờ.
  * Hệ thống ghi nhận số lần undo thành công trong trạng thái ván (`undo_count_red`, `undo_count_black`).
  * Khi một bên đã dùng hết 3 lần, nút **"Xin đi lại"** của bên đó sẽ chuyển sang trạng thái `DISABLED` kèm tooltip: *"Bạn đã sử dụng hết 3 lượt xin đi lại trong ván này"*.
  * **Trường hợp đề nghị bị từ chối:** Nếu đối phương bấm từ chối hoặc hết thời hạn chờ 30 giây không trả lời, lượt đó **không bị trừ** vào hạn mức 3 lần (chỉ tính khi undo thực sự thành công).
* **Lợi ích thực tế:**
  * Triệt tiêu hành vi quấy rối, spam đề nghị undo làm gián đoạn tâm lý của đối thủ.
  * Bảo đảm tính nghiêm túc và nhịp độ thi đấu của ván cờ.

---

### Quyết định 3.3: Quy chuẩn vận hành trận đấu Online thời gian thực (Chi tiết Yêu cầu 5)
* **Lựa chọn đã chốt:** **[MATCH-CORE] 7 Trụ cột Vận hành Trận đấu Online qua Socket.IO có Thẩm quyền Máy chủ**
* **Mô tả nghiệp vụ:**
  1. **Thẩm quyền máy chủ tuyệt đối (`R06`):** Client chỉ gửi ý định đi cờ (`commandId`, `matchVersion`). Máy chủ kiểm tra 100% tính hợp lệ: cản chân Mã, mắt Tượng, ngòi Pháo, an toàn Tướng (cấm 2 tướng nhìn nhau, cấm tự chiếu). Lưu biên lai lệnh `room_command_receipts` chống trùng lệnh.
  2. **Bộ luật phân định Thắng / Thua / Hòa (`R07` / `DEC-019`):**
     * *Chiếu hết (`CHECKMATE`):* Thua.
     * *Bị vây khốn / Hết nước đi (`STALEMATE`):* Thua (`GR-END-01`).
     * *Lặp thế cờ 3 lần (`DRAW_REPETITION`):* Hòa tự động (`GR-END-02`, chỉ tính trên nhánh nước đi hiệu lực sau khi undo).
     * *Đầu hàng (`RESIGN`):* Thua ngay.
     * *Xin hòa (`DRAW_AGREEMENT`):* Đợi đối phương xác nhận trong 30s.
  3. **Đồng hồ thi đấu & Xử lý hết giờ (`R08`):** Chạy trên máy chủ (Casual: Không giới hạn, 5p, 10p, 15p; Ranked: cố định 10p Rapid). Không cộng giây. Hết giờ xử thua (`TIMEOUT`). Ưu tiên tính giờ trước khi xét duyệt nước đi (`ARCH-04`).
  4. **Mất kết nối & Xử lý Rage Quit (`R09` / `EC-03`):** Ân hạn 60s. Quá 60s xử thua (`DISCONNECT`). Trong ván Ranked bị phạt trừ Elo bình thường, đối thủ được cộng Elo. Lỗi sập server toàn cục xử hòa `INTERRUPTED` giữ nguyên Elo (`ARCH-10`).
  5. **Chống treo ván (`R17`):** Ván không giới hạn giờ, sau 3 phút không đi cờ $\rightarrow$ hiện prompt hỏi $\rightarrow$ đếm lùi 30 giây $\rightarrow$ xử thua nếu im lặng (`INACTIVITY`).
  6. **Thao tác trong ván & Undo (`R13` / `EC-01`):** Ván Ranked **tuyệt đối cấm Undo**. Phòng thường cho phép Undo tối đa 3 lần thành công/bên/ván. Dùng cây nước đi `match_moves` lùi con trỏ `current_move_id`, không hoàn lại thời gian đã trôi.
  7. **Tái đấu đổi bên (`R14`):** Kết thúc ván, phòng giữ trạng thái `FINISHED` trong 10 phút. Cả hai cùng đồng ý Tái đấu $\rightarrow$ tạo ván mới (`new Match ID`) và tự động hoán đổi bên Đỏ $\leftrightarrow$ Đen.

---

### Quyết định 3.4: Cơ chế tương tác bàn cờ (Click & Drag-Drop), Hiệu ứng thị giác và Âm thanh Web Audio API (Chi tiết Yêu cầu 4)
* **Lựa chọn đã chốt:** **[BOARD-INTERACTION] Hỗ trợ song song 2 cơ chế đi cờ (Click-to-Move & Kéo thả Drag-Drop); Hiệu ứng thị giác chỉ dẫn đầy đủ; Tích hợp âm thanh Web Audio API kèm nút Mute**
* **Mô tả nghiệp vụ:**
  1. **Thao tác điều khiển quân cờ linh hoạt (Hỗ trợ 2 phương thức):**
     * **Phương thức 1 (Click-to-Move):**
       * Click chuột (hoặc chạm cảm ứng) vào quân cờ của mình $\rightarrow$ Quân cờ được chọn hiển thị vòng sáng (Active ring).
       * Bàn cờ lập tức kích hoạt hiển thị các chấm tròn màu xanh mờ tại tất cả các giao điểm được phép đi tới.
       * Click vào một giao điểm hợp lệ $\rightarrow$ Quân cờ di chuyển và hạ cờ tại ô đích.
       * Hủy chọn: Click lại chính quân cờ đó, hoặc click vào một ô trống bất kỳ không hợp lệ, hoặc bấm phím `Escape`.
     * **Phương thức 2 (Kéo thả Drag & Drop):**
       * Nhấp giữ chuột (hoặc chạm giữ tay trên màn hình điện thoại) để kéo quân cờ bay theo con trỏ chuột/ngón tay.
       * Thả quân cờ vào giao điểm hợp lệ $\rightarrow$ Hạ cờ thành công.
       * Thả vào vị trí không hợp lệ $\rightarrow$ Quân cờ tự động trượt mượt mà (smooth snap-back animation) quay trở về vị trí xuất phát ban đầu.
  2. **Hiệu ứng thị giác chỉ dẫn trên bàn cờ (Visual Guides):**
     * *Gợi ý nước đi hợp lệ:* Khi một quân cờ được chọn, hiển thị các chấm tròn nhỏ (màu xanh mờ) tại tất cả các giao điểm mà quân đó ĐƯỢC PHÉP ĐI. Nếu ô đích đang có quân cờ của đối thủ có thể ăn được, hiển thị vòng tròn viền đỏ nhấp nháy bao quanh quân cờ đối phương đó.
     * *Đánh dấu nước đi vừa diễn ra (Last Move Highlight):* Hiển thị viền màu vàng/cam nhạt tại ô xuất phát và ô đích của nước cờ vừa đi gần nhất để cả người chơi và khán giả dễ dàng theo dõi diễn biến ván đấu.
     * *Cảnh báo Chiếu tướng (Check Highlight):* Khi một bên bị Chiếu tướng, ô của quân Tướng bị chiếu sẽ phát sáng viền đỏ rực cảnh báo nguy hiểm kèm hiệu ứng rung nhẹ (pulse animation).
  3. **Hệ thống Âm thanh cờ tướng (Web Audio API):**
     * Tích hợp bộ âm thanh trực tiếp qua Web Audio API (tạo âm sắc cờ gỗ tự nhiên, nhẹ, không phụ thuộc vào việc tải file MP3 nặng từ server):
       1. 🔊 **Tiếng gõ cờ (`Move sound`):** Âm thanh tiếng gỗ cộp đanh giòn khi hạ quân cờ xuống mặt bàn gỗ.
       2. 💥 **Tiếng ăn quân (`Capture sound`):** Âm thanh va chạm gỗ mạnh mẽ, dứt khoát khi bắt quân đối phương.
       3. ⚠️ **Tiếng chuông Chiếu tướng (`Check alert`):** Âm thanh cảnh báo sắc gọn báo hiệu Tướng đang bị uy hiếp.
       4. 🎺 **Tiếng còi kết thúc ván (`End Game sound`):** Âm hưởng chiến thắng hoặc thất bại khi có kết quả ván đấu.
     * **Nút Bật / Tắt âm thanh (Mute / Unmute Toggle):** Bố trí một biểu tượng loa nhỏ ngay góc trên của bàn cờ thi đấu, cho phép kỳ thủ bật hoặc tắt âm thanh bất kỳ lúc nào với 1 chạm.

---

## PHẦN 4: CHẾ ĐỘ PHÒNG & NGƯỜI XEM (Yêu cầu 6)

### Quyết định 4.1: Quyền hạn Khán giả — Tuyệt đối không cấp quyền phát Micro/Camera
* **Lựa chọn đã chốt:** **[7A] Khán giả chỉ Xem/Nghe (Subscribe-only) và Chat Text tại Kênh Chung**
* **Mô tả nghiệp vụ:**
  * Khán giả (Spectator) khi vào phòng chỉ đóng vai trò người tiêu thụ luồng (Consumer/Subscriber):
    * Được xem Face cam và nghe giọng nói của 2 đấu thủ (nếu đấu thủ chọn mức chia sẻ *"Cả đối thủ và người xem"*).
    * Được gửi và nhận tin nhắn văn bản tại **Kênh Chung (`ROOM_PUBLIC`)**.
    * **Tuyệt đối không có tính năng bật Micro hoặc Camera:** Giao diện của Khán giả không xuất hiện các nút bật mic/cam, và máy chủ LiveKit không cấp quyền phát (Publish permission) cho token của Khán giả (`canPublish: false`, `canPublishData: false`).
* **Lý do nghiệp vụ & kỹ thuật:**
  * Giữ không gian thi đấu tĩnh lặng, tập trung cho 2 đấu thủ cờ tướng; ngăn chặn triệt để hành vi "nhắc cờ", bình luận khiêu khích hoặc bật tiếng ồn gây rối bằng giọng nói.
  * Tối ưu hóa tối đa băng thông máy chủ LiveKit SFU (chỉ cần chuyển tiếp 2 luồng phát của đấu thủ tới tối đa 5 khán giả).

---

### Quyết định 4.2: Quyền "Đuổi người xem" (Kick Spectator) — Trao quyền cho CẢ HAI ĐẤU THỦ
* **Lựa chọn đã chốt:** **[8B] Cả Chủ phòng (Host) và Đấu thủ 2 đều có quyền Đuổi người xem; Chặn đến khi phòng đóng**
* **Mô tả nghiệp vụ:**
  * Trong phòng thi đấu thường (Casual), tại Danh sách khán giả (`SCR-SPECTATOR-LIST` ở thanh bên), **cả Chủ phòng (Host) và Đấu thủ 2** đều nhìn thấy nút **"Kick"** (hoặc biểu tượng gạch đỏ) bên cạnh tên mỗi khán giả.
  * Khi một trong hai đấu thủ bấm nút "Kick" một khán giả quấy rối:
    1. Hệ thống hiển thị modal xác nhận (`SCR-CONFIRM-KICK`): *"Bạn có chắc chắn muốn đuổi khán giả [Tên] ra khỏi phòng thi đấu không?"*.
    2. Sau khi xác nhận: Máy chủ lập tức ngắt kết nối Socket.IO, hủy token LiveKit của khán giả đó, đẩy văng ra Sảnh chính kèm thông báo: *"Bạn đã bị đuổi khỏi phòng thi đấu"*.
    3. Ghi nhận bản ghi vào bảng `room_blocks (room_id, blocked_user_id, created_at)`.
    4. **Thời hạn chặn:** Người bị đuổi bị chặn vĩnh viễn không thể quay lại phòng này (kể cả có link mời mới hay mã 8 số) cho đến khi phòng cờ kết thúc chu kỳ sống và đóng hoàn toàn (`status = CLOSED`).
* **Lợi ích thực tế:** Trao quyền bình đẳng cho cả 2 đấu thủ tự bảo vệ không gian tập trung của mình trước các hành vi quấy rối, chat toxic của khán giả.

---

### Quyết định 4.3: Đổi chế độ phòng trong lúc chơi & Xem cờ Thời gian thực 100% (Không Delay)
* **Lựa chọn đã chốt:** **[ROOM-PRIVACY-REALTIME] Đổi chế độ phòng linh hoạt (giữ khán giả cũ, chặn người mới, cho phép kick); Khán giả xem thời gian thực 100% không delay**
* **Mô tả nghiệp vụ:**
  1. **Đổi chế độ phòng trong lúc đang chơi (Dynamic Privacy Change):**
     * Trong menu Cài đặt phòng (`SCR-ROOM-SETTINGS`), Chủ phòng có toàn quyền chuyển đổi linh hoạt giữa 3 chế độ (`PUBLIC`, `CODE_ONLY`, `LOCKED`) bất kỳ lúc nào kể cả khi ván cờ đang diễn ra.
     * Khi Chủ phòng chuyển sang **`LOCKED` (Khóa phòng):**
       * Phòng cờ lập tức bị ẩn hoàn toàn khỏi danh sách phòng tại Sảnh chính.
       * Máy chủ chặn toàn bộ các yêu cầu tham gia mới từ bên ngoài.
       * **Xử lý khán giả hiện tại:** **Khán giả đang có sẵn trong phòng vẫn được giữ lại tiếp tục theo dõi ván cờ bình thường**. Nếu đấu thủ muốn loại bỏ ai thì có thể dùng tính năng "Kick" để đuổi đích danh người đó.
  2. **Khán giả xem cờ Thời gian thực 100% (Không áp dụng Spectator Delay):**
     * Nước đi trên bàn cờ được đồng bộ tức thời đến màn hình của khán giả qua Socket.IO (độ trễ dưới 100ms).
     * Không áp dụng cơ chế hoãn giờ (delay 5–10s) vì phòng Casual chủ yếu phục vụ giao lưu bạn bè học hỏi; ván Đánh Hạng (Ranked) đã cấm tuyệt đối 100% khán giả nên không phát sinh rủi ro gian lận rank.

## PHẦN 5: CHAT & MEDIA (Yêu cầu 7)

### Quyết định 5.1: Bổ sung bộ Sticker / Biểu tượng cảm xúc nhanh trong Chat
* **Lựa chọn đã chốt:** **[9B] Thêm khay Sticker / Emoticon cảm xúc nhanh (12 biểu tượng)**
* **Mô tả nghiệp vụ:**
  * Tại khung chat của cả Kênh Riêng (`PLAYERS_PRIVATE`), Kênh Chung (`ROOM_PUBLIC`) và Chat riêng 1-1, bổ sung nút mở khay **"Cảm xúc nhanh"**.
  * Cung cấp sẵn bộ 12 biểu tượng tương tác tức thì mang tính giải trí và đặc trưng cờ tướng:
    1. 👏 *Nước cờ hay (Vỗ tay)*
    2. ❤️ *Thả tim / Yêu thích*
    3. 🤔 *Đang suy ngẫm kỹ*
    4. 😅 *Toát mồ hôi / Nguy hiểm*
    5. 😭 *Khóc ròng / Mất quân oan*
    6. 🍵 *Uống trà / Bình tĩnh hạ cờ*
    7. ⚡ *Nhanh tay lên nào*
    8. 🤐 *Cạn lời / Đứng hình*
    9. 👍 *Đồng ý / Chấp nhận*
    10. 🤝 *Giao lưu vui vẻ*
    11. 🏳️ *Đầu hàng tâm phục*
    12. 🔥 *Trận đấu kịch tính*
  * Người chơi hoặc khán giả chỉ cần bấm 1 chạm để gửi ngay mà không mất thời gian gõ chữ.
* **Cơ chế kỹ thuật:** Tin nhắn dạng shortcode (VD: `:tea:`, `:clap:`), lưu chuỗi trong bảng `chat_messages`, giao diện render icon SVG mượt mà.

---

### Quyết định 5.2: Bổ sung tính năng Chat riêng ngoài phòng thi đấu (Direct Messaging / 1-1 Chat)
* **Lựa chọn đã chốt:** **[9C - Bổ sung / R21] Nhắn tin riêng 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ (`status = ACCEPTED`)**
* **Mô tả nghiệp vụ:**
  * Cho phép hai người dùng đã kết bạn chính thức trò chuyện nhắn tin riêng 1-1 mọi lúc ngoài phòng đấu.
  * Hỗ trợ lưu trữ lịch sử tin nhắn, chỉ báo tin nhắn chưa đọc (Unread badge) trên thanh điều hướng, phân quyền RLS an toàn trong CSDL (`direct_conversations`, `direct_messages`).

---

### Quyết định 5.3: Quy tắc Tab Chat mặc định & Bộ lọc từ ngữ thô tục (Bad Word Filter)
* **Lựa chọn đã chốt:** **[CHAT-FILTER-TAB] 2 Đấu thủ mặc định mở Kênh Riêng; Khán giả chỉ thấy Kênh Chung; Bộ lọc che từ cấm bằng dấu sao `***`**
* **Mô tả nghiệp vụ:**
  1. **Quy tắc Tab Chat mặc định khi vào phòng thi đấu:**
     * **Đối với 2 Đấu thủ (Players):** Giao diện khung chat bên cạnh bàn cờ **mặc định mở sẵn tab `[Kênh Riêng]`** (`PLAYERS_PRIVATE`) để 2 kỳ thủ chào hỏi, giao lưu trực tiếp. Hai đấu thủ có thể bấm tab `[Kênh Chung]` (`ROOM_PUBLIC`) nếu muốn trò chuyện với khán giả, và có công tắc "Ẩn kênh chung" để tập trung.
     * **Đối với Khán giả (Spectators):** Khán giả không có quyền xem hay gửi tin vào Kênh Riêng, nên giao diện khung chat của khán giả **chỉ hiển thị duy nhất tab `[Kênh Chung]`**.
  2. **Bộ lọc từ ngữ thô tục / xúc phạm (Bad Word Filter):**
     * Tích hợp bộ lọc từ ngữ nhạy cảm, thô tục và công kích cá nhân phổ biến (tiếng Việt & tiếng Anh).
     * Mọi tin nhắn gửi đi ở bất kỳ kênh nào (Kênh riêng, Kênh chung, Chat 1-1 bạn bè) nếu chứa từ ngữ trong danh sách đen sẽ **tự động được máy chủ và client che bằng các ký tự dấu sao `***`** (ví dụ: *"đánh cờ như ***"*).
     * Bảo đảm không gian văn hóa cờ tướng lành mạnh, văn minh, tránh các sự cố phản cảm khi biểu diễn đồ án trước hội đồng.

---

### Quyết định 5.4: Camera, Mic & Chat trong Ván Đánh Hạng (Ranked Media Policy)
* **Lựa chọn đã chốt:** **[RANKED-MEDIA] Mở đầy đủ cả Camera, Mic và Chat Text cho 2 kỳ thủ; Tùy 2 bên tự quyết định Bật/Tắt**
* **Mô tả nghiệp vụ:**
  * Trong ván Đánh Hạng (Ranked), do đã khóa kín 100% người xem (không có khán giả), ván đấu chỉ có duy nhất 2 đấu thủ.
  * **Hệ thống cho phép mở cả Camera, Mic và Chat Text:**
    * Hai kỳ thủ được toàn quyền tự do bấm Bật hoặc Tắt Camera và Mic của mình để nhìn mặt giao lưu đối thủ nếu muốn (mặc định vào phòng vẫn là TẮT để bảo đảm quyền riêng tư ban đầu).
    * Khung chat hiển thị Kênh Riêng duy nhất giữa 2 người, hỗ trợ nhắn tin và gửi 12 sticker cảm xúc nhanh kèm bộ lọc từ cấm `***`.

## PHẦN 6: CHƠI VỚI MÁY AI (Yêu cầu 8)

### Quyết định 6.1: Không triển khai tính năng Gợi ý nước đi (No Hint)
* **Lựa chọn đã chốt:** **[10A] Không làm tính năng Gợi ý nước đi (No Move Hinting)**
* **Mô tả nghiệp vụ:**
  * Giữ đúng phạm vi thi đấu đối kháng thuần túy giữa người và máy.
  * Engine AI chỉ tính toán nước đi cho bên quân cờ do máy điều khiển theo 3 cấp độ đã định hình:
    * *Dễ (Easy):* Depth 2, thời gian phản hồi $\le 300$ ms.
    * *Trung bình (Medium):* Depth 4, thời gian phản hồi $\le 1000$ ms.
    * *Khó (Hard):* Depth 6, thời gian phản hồi $\le 3000$ ms.
  * **Lý do:** Giữ kiến trúc giao diện đơn giản, tập trung toàn lực cho AI vượt qua Cổng kiểm định chất lượng sống còn (`Quality Gate ST04.3` / `TK04.3.1`) và cơ chế cô lập tiến trình (`ARCH-16`).

---

### Quyết định 6.2: Lưu trữ đầy đủ các ván đấu với AI vào Lịch sử người dùng
* **Lựa chọn đã chốt:** **[11B] Lưu ván đấu AI vào Lịch sử & Hỗ trợ Replay xem lại**
* **Mô tả nghiệp vụ:**
  * Khi người dùng có tài khoản thi đấu với máy và kết thúc ván (Thắng, Thua, Hòa, Đầu hàng):
    1. Ván cờ được lưu chính thức vào bảng CSDL `matches` và cây nước đi `match_moves`.
    2. Bổ sung trường đánh dấu `match_type = 'AI'` và `ai_difficulty = 'EASY' | 'MEDIUM' | 'HARD'`.
    3. Tại màn hình Lịch sử ván đấu (`SCR-MATCH-HISTORY`), ván đấu hiển thị nhãn nổi bật:
       * 🤖 `[Đấu với Máy - Dễ]` / `[Đấu với Máy - Trung bình]` / `[Đấu với Máy - Khó]`.
    4. Người chơi có thể bấm vào xem lại (**Replay**) từng nước cờ, phân tích sai lầm để tự nâng cao trình độ.
* **Lợi ích thực tế:**
  * Giúp kỳ thủ theo dõi được tiến trình rèn luyện cờ của bản thân theo thời gian.
  * Tận dụng tối đa giao diện Replay (`SCR-REPLAY`) đã được thiết kế sẵn.

---

### Quyết định 6.3: Quy tắc Vận hành Ván cờ Đấu với Máy (Chọn phe, Giới hạn 3 lần Undo lùi 2 nước & Không giới hạn thời gian)
* **Lựa chọn đã chốt:** **[AI-MATCH-RULES] Tự chọn phe Đỏ/Đen/Ngẫu nhiên; Trần tối đa 3 lần Undo lùi 1 cặp nước đi; Không giới hạn thời gian thi đấu**
* **Mô tả nghiệp vụ:**
  1. **Lựa chọn phe cờ khi bắt đầu ván (`SCR-AI-GAME`):**
     * Trước khi vào trận, người chơi được lựa chọn 1 trong 3 phương án:
       * 🔴 **Cầm quân Đỏ:** Đi trước (người chơi đi nước khai cuộc đầu tiên).
       * ⚫ **Cầm quân Đen:** Đi sau (máy cờ cầm Đỏ sẽ tự động tính toán và đi nước cờ đầu tiên ngay khi vào bàn cờ, sau đó lật bàn cờ để Đen ở dưới).
       * 🎲 **Ngẫu nhiên:** Máy chủ tự động bốc thăm ngẫu nhiên tỷ lệ 50/50.
  2. **Cơ chế Xin đi lại (Undo) giới hạn tối đa 3 lần:**
     * Nhằm rèn luyện tính cẩn trọng khi đi cờ và chống lạm dụng "thử lại vô hạn", hệ thống áp dụng trần **tối đa 3 lần Undo trong một ván đấu với máy**.
     * **Cơ chế lùi nước đi chuẩn xác:** Khi người chơi bấm nút "Đi lại":
       * Máy chủ tự động lùi **1 cặp nước đi (2 plies: gồm 1 nước vừa đi của máy + 1 nước vừa đi của người chơi)** để trả lại quyền đi cho người chơi mà không cần máy "đồng ý".
       * (Nếu máy đang suy nghĩ nước đi mà người chơi bấm Undo, máy hủy tác vụ tìm kiếm hiện tại và lùi lại nước đi trước đó của người chơi).
     * Bàn cờ hiển thị bộ đếm trực quan: *"Lượt đi lại: X/3"*. Khi người chơi dùng hết 3 lượt, nút "Đi lại" sẽ chuyển sang trạng thái vô hiệu hóa (`DISABLED`).
  3. **Đồng hồ thi đấu — Không giới hạn thời gian (Thư thái rèn luyện):**
     * Ván đấu với máy hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi.
     * Người chơi có thể tự do suy ngẫm từng nước cờ mà không lo bị áp lực đồng hồ đếm lùi, không bị xử thua do hết giờ (`TIMEOUT`) và không áp dụng cơ chế cảnh báo chống treo ván `R17`.
     * *Phía máy cờ:* Vẫn tuân thủ nghiêm ngặt ngân sách thời gian tối đa theo từng cấp độ (Dễ $\le 300$ms, Trung bình $\le 1000$ms, Khó $\le 3000$ms).

---

## PHẦN 7: HỆ THỐNG XẾP HẠNG ELO & GHÉP TRẬN TỰ ĐỘNG (Yêu cầu 9)

### Quyết định 7.1: Hệ thống Xếp Hạng Chuẩn Elo, Hàng Đợi Ghép Trận Tự Động & Bảng Xếp Hạng Leaderboard Top 50
* **Lựa chọn đã chốt:** **[12C - Bổ sung chính thức] Triển khai Hệ thống Điểm Elo Chuẩn FIDE, Hàng Đợi Ghép Trận Ngẫu Nhiên 100%, Leaderboard Top 50 Ghim Thứ Hạng Cá Nhân & Quy Tắc Đầu Hàng Nghiêm Ngặt**
* **Mô tả nghiệp vụ:**
  1. **Hệ thống Điểm Elo Chuẩn Quốc Tế:**
     * Điểm Elo khởi tạo mặc định cho mọi tài khoản mới: `1200 Elo`.
     * Công thức tính điểm Elo sau mỗi ván đấu xếp hạng:
       $$E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$$
       $$R'_A = R_A + K \times (S_A - E_A)$$
       Trong đó: $R_A, R_B$ là Elo hiện tại; $S_A \in \{1 \text{ (Thắng)}, 0.5 \text{ (Hòa)}, 0 \text{ (Thua)}\}$.
     * Hệ số $K-factor$: $K = 32$ cho 30 ván đầu tiên (giai đoạn định vị trình độ), $K = 16$ cho các ván tiếp theo.
     * Cấp bậc danh hiệu kỳ thủ (Rank Tiers):
       * *Kỳ thủ mới (Novice):* < 1200
       * *Sơ cấp (Junior):* 1200 – 1399
       * *Trung cấp (Intermediate):* 1400 – 1599
       * *Cao cấp (Advanced):* 1600 – 1799
       * *Kiện tướng (Master):* 1800 – 1999
       * *Đại sư (Grandmaster):* $\ge 2000$
  2. **Cơ chế Hàng đợi Ghép trận Xếp hạng tự động (Ranked Matchmaking Queue):**
     * Tại Sảnh chính, người chơi bấm nút **"Tìm trận Xếp hạng"**.
     * Hệ thống đưa người chơi vào hàng đợi `MatchmakingQueue` trên máy chủ.
     * Thuật toán tìm kiếm đối thủ cân tài cân sức: Tìm kỳ thủ có chênh lệch $\Delta Elo \le 100$ điểm. Nếu sau mỗi 10 giây chưa tìm thấy, tự động mở rộng biên độ thêm $\pm 50$ điểm.
     * **Cơ chế Hủy tìm trận (Cancel Matchmaking):**
       * *Khi chưa tìm thấy đối thủ:* Người chơi có thể bấm nút **"Hủy tìm trận"** bất kỳ lúc nào $\rightarrow$ Hệ thống lập tức rút người chơi ra khỏi hàng đợi mà không bị trừ điểm Elo hay bất kỳ hình phạt nào.
       * *Khi vừa tìm thấy đối thủ & phòng đang khởi tạo (`MATCH_FOUND`):* Nút Hủy bị khóa/vô hiệu hóa, cả 2 kỳ thủ được đưa thẳng vào bàn cờ thi đấu.
     * Khi ghép thành công: Máy chủ tự động tạo phòng cờ chuyên biệt loại `RANKED`, thời gian mặc định 10 phút mỗi bên, ngẫu nhiên chọn bên Đỏ/Đen và đưa cả 2 kỳ thủ vào thi đấu ngay lập tức.
  3. **Quy tắc Phạt điểm Elo khi ĐẦU HÀNG (Resign) — Xử phạt công bằng:**
     * Bất kể kỳ thủ bấm nút "Đầu hàng" ở nước cờ thứ mấy (kể cả ngay nước 1 hay nước 3), hệ thống lập tức xử bên đầu hàng là **THUA** và **bị trừ điểm Elo bình thường theo công thức FIDE**.
     * Đối thủ được xử là **THẮNG** và **được cộng điểm Elo tương ứng**.
     * *Lý do:* Triệt tiêu hành vi cố tình hủy trận né đối thủ mạnh hoặc phá hoại hàng đợi ghép trận.
  4. **Bảng Xếp Hạng Kỳ Thủ (Leaderboard Top 50 + Dòng Ghim Cá Nhân):**
     * Màn hình `SCR-LEADERBOARD`: Hiển thị danh sách **Top 50 kỳ thủ** có điểm Elo cao nhất toàn server, danh hiệu rank, số trận thắng/thua/hòa và tỷ lệ thắng.
     * **Dòng ghim vị trí cá nhân cố định (Sticky User Row):** Dưới đáy bảng luôn có một hàng cố định hiển thị: *Thứ hạng hiện tại của chính bạn (VD: Hạng #142 - Elo 1280 - Cấp Trung cấp)* giúp người dùng ngay lập tức biết được vị thế của mình trên bảng tổng sắp mà không phải cuộn tìm kiếm.
  5. **Quyết định về Giải đấu (Tournaments):**
     * **BỎ HOÀN TOÀN HỆ THỐNG GIẢI ĐẤU (OUT-OF-SCOPE):** Không làm tính năng giải đấu (chia bảng, nhánh đấu Knockout) để giữ phạm vi tập trung cao độ vào thi đấu đối kháng trực tiếp và xếp hạng 1-1 theo Elo.

---

## PHẦN 8: CÁC QUY TẮC RÀNG BUỘC NGOẠI LỆ (EDGE CASES)

### Quyết định 8.1: Quy tắc chặt chẽ cho Ván Xếp Hạng (Ranked Match)
* **Lựa chọn đã chốt:** **[EC-01] Ván Ranked nghiêm ngặt: Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách KHÔNG ĐƯỢC tham gia; Thời gian 10 phút Rapid; Cho phép 2 kỳ thủ tự bật Camera/Mic/Chat**
* **Mô tả nghiệp vụ:**
  * **Ghép ngẫu nhiên 100%:** Người chơi không được quyền chọn đối thủ hay mời phòng, máy chủ phân xử ghép ngẫu nhiên theo thuật toán Elo.
  * **Tuyệt đối KHÔNG CHO NGƯỜI KHÁC VÀO XEM (No Spectators):** Khóa hoàn toàn luồng người xem. Không ai có thể vào phòng xem ván Ranked dưới bất kỳ hình thức nào. Phòng không hiển thị ở Sảnh.
  * **Tuyệt đối CẤM XIN ĐI LẠI (No Undo):** Nút "Xin đi lại" bị ẩn hoặc vô hiệu hóa (`DISABLED`) vĩnh viễn. "Bút sa gà chết" nhằm bảo đảm tính công bằng tuyệt đối cho thứ hạng kỳ thủ.
  * **Hỗ trợ Camera, Mic và Chat Text giữa 2 đấu thủ:** Cho phép 2 kỳ thủ tự quyết định Bật/Tắt Camera và Mic để giao lưu trực tiếp trong lúc so tài (Quyết định 5.4).
  * **Khách (Guest) không được tham gia:** Chỉ các tài khoản chính thức đã đăng ký mới được quyền bấm "Tìm trận Xếp hạng".
  * **Thời gian thi đấu mặc định 10 phút:** Ngân sách thời gian cố định **10 phút mỗi bên (Rapid chuẩn cờ quốc tế)**, không áp dụng luật cộng giây.

---

### Quyết định 8.2: Quy tắc Chat riêng 1-1 ngoài phòng thi đấu
* **Lựa chọn đã chốt:** **[EC-02] Chỉ cho phép nhắn tin 1-1 giữa những người ĐÃ LÀ BẠN BÈ (`status = 'ACCEPTED'`)**
* **Mô tả nghiệp vụ:**
  * Người dùng chỉ có thể mở cuộc hội thoại chat riêng 1-1 với những kỳ thủ đã nằm trong danh sách Bạn bè chính thức.
  * Nếu truy cập hồ sơ của người lạ (chưa kết bạn), giao diện chỉ hiển thị nút **"Kết bạn"**, không hiển thị nút "Nhắn tin". Sau khi đối phương chấp nhận lời mời kết bạn, nút "Nhắn tin" mới được kích hoạt.
  * **Lợi ích:** Ngăn chặn triệt để hành vi spam tin nhắn rác, quấy rối danh tính hoặc gửi tin nhắn khiêu khích ngoài phòng đấu từ các tài khoản lạ.

---

### Quyết định 8.3: Xử lý Ngắt kết nối / Bỏ cuộc (Rage Quit) trong ván Xếp hạng
* **Lựa chọn đã chốt:** **[EC-03] Ân hạn 60 giây; Xử thua và phạt trừ điểm Elo bình thường nếu bỏ chạy**
* **Mô tả nghiệp vụ:**
  * Khi một đấu thủ trong ván Ranked bị ngắt kết nối (mất mạng hoặc cố tình tắt trình duyệt):
    * Hệ thống kích hoạt bộ đếm thời gian ân hạn **60 giây**. Bàn cờ hiển thị chỉ báo: *"Đối thủ đang mất kết nối, thời gian chờ: 60s"*.
    * Nếu trong vòng 60s đấu thủ kết nối lại: Ván cờ tiếp tục bình thường từ trạng thái hiện tại.
    * Nếu quá 60s không kết nối lại: Máy chủ tự động kết thúc ván đấu, xử thua bên mất kết nối với lý do `DISCONNECT`, trừ điểm Elo như một trận thua và cộng điểm Elo thắng cho đối thủ còn lại.
  * **Trường hợp lỗi hạ tầng / Server sập:** Nếu cả hai đấu thủ cùng mất kết nối đồng thời (máy chủ khởi động lại hoặc rớt mạng diện rộng), ván cờ chuyển sang trạng thái `INTERRUPTED` (`ARCH-10`) và **giữ nguyên điểm Elo của cả hai bên**, không xử phạt ai.

---

## PHẦN 9: TIỆN ÍCH HỖ TRỢ DEMO BẢO VỆ ĐỒ ÁN & TÍNH NĂNG MỞ RỘNG (STRETCH GOALS / PRIORITY 2)
*(Ghi nhận làm mục tiêu mở rộng: Nhóm sẽ tiến hành triển khai vào cuối Sprint 4 nếu còn dư thời gian)*

### Quyết định 9.1: Tiện ích Sao chép thế cờ FEN & Tải biên bản ván đấu PGN
* **Lựa chọn đã chốt:** **[13B - Stretch P2] Xuất dữ liệu thế cờ FEN & Tải file PGN tại màn hình Replay**
* **Mô tả nghiệp vụ:** Nút "Sao chép FEN" (Copy FEN chuỗi thế cờ hiện tại) và "Tải biên bản PGN" (Download file `.pgn` danh sách nước đi) phục vụ người chơi cờ chuyên sâu phân tích trên các engine bên ngoài.

---

### Quyết định 9.2: Bảng thông số tính toán AI thời gian thực (AI Debug Metrics Widget)
* **Lựa chọn đã chốt:** **[P2 - Demo Tool] Widget hiển thị chỉ số tính toán của thuật toán AI**
* **Mô tả nghiệp vụ:**
  * Khi người chơi thi đấu với AI, ở góc màn hình có một widget thu nhỏ hiển thị các chỉ số nhảy số trực tiếp:
    * *Số thế cờ đã duyệt (Nodes evaluated):* ví dụ `48,210 nodes`.
    * *Độ sâu tìm kiếm thực tế (Search Depth):* `Depth 4/4` (hoặc `Depth 6/6`).
    * *Thời gian tính toán (Compute Latency):* `320 ms`.
    * *Nước cờ dự tính tối ưu (Principal Variation / PV):* ví dụ `C2.5`.
  * **Ý nghĩa thực tế:** Bằng chứng thuyết phục 100% trước Hội đồng chấm thi rằng nhóm **tự viết thuật toán Minimax / Alpha-Beta thuần túy**, xóa tan hoàn toàn nghi vấn "gọi API dịch vụ cờ bên ngoài".

---

### Quyết định 9.3: Công cụ giả lập kịch bản mạng dành cho Demo (Demo Admin Network Controls)
* **Lựa chọn đã chốt:** **[P2 - Demo Tool] Thanh công cụ phím tắt giả lập rớt mạng và khôi phục ván**
* **Mô tả nghiệp vụ:**
  * Bổ sung phím tắt hoặc panel ẩn dành cho Admin/Tester khi demo đồ án:
    * Nút *"Mô phỏng Đấu thủ 1 mất mạng"* $\rightarrow$ Ngắt ngay lập tức Socket của Client 1 để kích hoạt bộ đếm ân hạn 60s trên màn hình Client 2.
    * Nút *"Tái kết nối tức thì"* $\rightarrow$ Bật lại kết nối và kích hoạt snapshot đồng bộ bàn cờ.
  * **Ý nghĩa thực tế:** Giúp buổi bảo vệ đồ án diễn ra mượt mà, chủ động biểu diễn được cơ chế chịu lỗi (Fault-tolerance) ngay cả khi Wi-Fi phòng hội đồng chập chờn.

---

## BẢNG TỔNG HỢP TOÀN BỘ QUYẾT ĐỊNH KHÓA PHẠM VI (SCOPE FREEZE MATRIX)

| STT | Nghiệp Vụ Cốt Lõi | Quyết Định Đã Chốt | Phân Loại & Thứ Tự Ưu Tiên |
|:---:|---|---|:---:|
| 1 | **Chế độ Khách (Guest Mode)** | **[1B] Nút "Guest" nổi bật tại Login kèm ghi chú cấm tham gia Ranked Elo** | **Chính thức (Core P1)** |
| 2 | Kích hoạt Email | **[2B] Tự động kích hoạt tài khoản ngay** (Email dùng để quên mật khẩu) | **Chính thức (Core P1)** |
| 3 | **Đổi Username / Cố định Email** | **[1C] Đổi Username không giới hạn tần suất (Quy trình 4 bước qua OTP Supabase); Cấm đổi Email** | **Chính thức (Core P1)** |
| 4 | **Google OAuth Onboarding** | **[1D] Tạo tài khoản qua Google OAuth kết hợp thiết lập Username + Password** để đăng nhập kép linh hoạt | **Chính thức (Core P1)** |
| 5 | Đồng hồ thi đấu | **[3A] Giữ nguyên 4 mức giờ cố định**, không áp dụng luật cộng giây | **Chính thức (Core P1)** |
| 6 | Chia sẻ phòng đấu | **[4B] Thêm Mã QR (QR Code)** trực quan bên cạnh Link mời và Mã 8 ký tự | **Chính thức (Core P1)** |
| 7 | Chữ trên quân cờ | **[5A] Giữ nguyên 100% quân chữ Hán** cổ điển, kết hợp viền trợ năng DT-21 | **Chính thức (Core P1)** |
| 8 | Giới hạn Undo phòng thường | **[6B] Giới hạn tối đa 3 lần Undo thành công / bên / ván** (chống spam) | **Chính thức (Core P1)** |
| 9 | Quyền Khán giả | **[7A] Khán giả chỉ Xem/Nghe + Chat Kênh Chung**, tuyệt đối không cấp quyền phát Mic/Cam | **Chính thức (Core P1)** |
| 10 | Đuổi người xem | **[8A] Chặn cho đến khi phòng đóng** (`status = CLOSED`) | **Chính thức (Core P1)** |
| 11 | Tương tác Chat | **[9B] Bổ sung khay 12 Sticker cảm xúc nhanh** (vỗ tay 👏, uống trà 🍵, cạn lời 🤐...) | **Chính thức (Core P1)** |
| 12 | **Chat riêng ngoài phòng** | **[9C / EC-02] Nhắn tin 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ**, lưu lịch sử, unread badge | **Chính thức (Core P1)** |
| 13 | Gợi ý nước khi đấu AI| **[10A] Không làm gợi ý nước đi (No Hint)**, tập trung chất lượng AI 3 cấp | **Chính thức (Core P1)** |
| 14 | Lưu lịch sử ván AI | **[11B] Lưu đầy đủ ván AI vào Hồ sơ**, hỗ trợ xem lại (Replay) từng nước cờ | **Chính thức (Core P1)** |
| 15 | **Hệ thống Xếp hạng Elo** | **[12C] Điểm Elo chuẩn FIDE, Bảng xếp hạng Top 100, Ghép trận tự động Matchmaking** | **Chính thức (Core P1)** |
| 16 | **Quy tắc ván Ranked** | **[EC-01] Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách không được đấu; 10 phút Rapid** | **Chính thức (Core P1)** |
| 17 | **Rage Quit ván Ranked** | **[EC-03] Ân hạn 60s, quá hạn xử thua trừ Elo bình thường; sập server không đổi Elo** | **Chính thức (Core P1)** |
| 18 | Xuất FEN / PGN | **[13B] Nút Copy FEN và Download PGN** tại màn hình Replay | **Mở rộng (Stretch P2)** |
| 19 | **AI Debug Metrics** | **[P2 - Tool] Widget hiển thị số node, depth, thời gian tính của thuật toán AI** | **Mở rộng (Stretch P2)** |
| 20 | **Demo Admin Controls** | **[P2 - Tool] Phím tắt giả lập rớt mạng 60s và khôi phục phục vụ bảo vệ đồ án** | **Mở rộng (Stretch P2)** |
