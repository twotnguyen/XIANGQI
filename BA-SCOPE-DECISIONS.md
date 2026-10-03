# BIÊN BẢN CHỐT YÊU CẦU NGHIỆP VỤ & PHẠM VI SẢN PHẨM (BA SCOPE FREEZE)

> **Dự án:** Cờ Tướng Online (XIANGQI)  
> **Đại diện Product Owner:** Twot  
> **Đại diện Phân tích Nghiệp vụ (BA):** Hermes Agent  
> **Cập nhật lần cuối:** 03/10/2026 (rà soát đồng bộ Giai đoạn 1 — xem ghi chú bên dưới)  

Tài liệu này ghi nhận chính thức các quyết định điều chỉnh, bổ sung hoặc giữ nguyên tính năng sau quá trình rà soát giữa BA và Product Owner nhằm chốt cứng phạm vi triển khai (Scope Freeze).

> **Ghi chú rà soát 03/10/2026.** Product Owner uỷ quyền cho agent tự xử lý mâu thuẫn và chỗ mơ hồ của Giai đoạn 1. Các quyết định thêm hoặc sửa trong đợt này đã được Product Owner **duyệt toàn bộ ngày 03/10/2026** (gồm nhóm 1–8 và loạt trả lời nhóm B). Riêng các con số tạm (120 nửa nước không ăn quân, luật đuổi quân liên tục, quy mô 50 người dùng đồng thời) được xác nhận lại ở Giai đoạn 2.
>
> **Giai đoạn 2 (từ 03/10/2026):** chi tiết hoá yêu cầu, luật cờ, dữ liệu, kiến trúc và kiểm thử nằm ở thư mục [`docs/`](docs/README.md). `docs/` **không thay đổi phạm vi** ở tài liệu này; hai nơi mâu thuẫn thì tài liệu này thắng và phải báo người dùng.
>
> **Hai quy ước đọc tài liệu:**
> 1. Các mã như `R06`, `R17`, `DEC-019`, `ARCH-04`, `GR-END-01`, `EC-0x`, `DT-21`… là **nhãn kế thừa** từ bộ tài liệu cũ đã xoá. Chúng không còn là nguồn tra cứu; luật tương ứng đã được viết đầy đủ bằng chữ trong chính mục chứa nhãn.
> 2. Tên công nghệ, tên bảng, tên trường dữ liệu (Socket.IO, LiveKit, Supabase, `room_blocks`, `commandId`…) chỉ là **minh hoạ kế thừa**, không phải quyết định công nghệ. Công nghệ chốt ở Giai đoạn 2.

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
  * **Thời điểm tạo tài khoản:** Tài khoản **dùng được** (có hồ sơ và đăng nhập được) chỉ có **sau khi OTP xác thực thành công và hoàn tất bước cuối**. Trước đó người dùng chưa có hồ sơ và không đăng nhập được; **hệ thống xác thực (Supabase) có thể giữ tạm một bản ghi xác thực chưa xác nhận** (Product Owner chọn Phương án B ngày 03/10/2026), được dọn sau khoảng 1 giờ (tối đa khoảng 65 phút) để email không bị kẹt; username **không bị giữ chỗ** khi người dùng bỏ dở giữa chừng (đóng tab, hết hạn OTP). Máy chủ kiểm tra lại tính duy nhất của `username` và `email` ở bước cuối; nếu username đã bị người khác lấy trong lúc chờ thì báo lỗi và quay về Bước 1.
  * **Email đã tồn tại:** Ở Bước 2, nếu email đã có tài khoản thì hiển thị ⚠️ *"Email này đã được đăng ký"* (cùng thông báo với luồng Google) và không gửi OTP.

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
  * **Bỏ dở giữa chừng:** Tài khoản Google chỉ được tạo khi người dùng bấm **"Hoàn tất thiết lập"** ở `SCR-ONBOARDING`. Nếu thoát giữa chừng thì không có tài khoản nào được tạo; lần sau bấm "Đăng ký bằng Google" sẽ bắt đầu lại từ màn hình thiết lập. Màn hình `/onboarding` không đóng tuỳ ý được (không có nút X).
  * **Không tự liên kết tài khoản:** Hệ thống **không** tự gộp tài khoản Google với tài khoản Username + Mật khẩu đã có cùng email; trường hợp đó luôn báo "Email này đã được đăng ký". Mọi tài khoản (kể cả tạo bằng Google) đều có mật khẩu, nên luồng Quên mật khẩu (`Quyết định 1.7`) dùng được cho mọi tài khoản.
  * **Đăng nhập Google với email chưa đăng ký (đã duyệt 03/10):** Bấm "Đăng nhập bằng Google" bằng email chưa có tài khoản thì chuyển sang màn hình thiết lập Username + Mật khẩu như luồng đăng ký Google (không báo lỗi).

---

### Quyết định 1.3: Chế độ Khách (Guest Mode) & Cơ chế Nâng cấp tài khoản
* **Lựa chọn đã chốt:** **[GUEST-FLOW] Nút "Guest" riêng biệt tại màn hình Đăng nhập kèm cảnh báo cấm Ranked; Nâng cấp bằng cách Đăng xuất**
* **Mô tả nghiệp vụ:**
  * Tại màn hình Đăng nhập (`SCR-LOGIN`), hệ thống bố trí một nút riêng biệt nổi bật: **"Guest"** (hoặc *"Chơi nhanh với tư cách Khách"*).
  * **Hiển thị ghi chú trực quan (Visual Note):** Ngay dưới nút "Guest", hiển thị dòng chữ cảnh báo rõ ràng:
    > ⚠️ *"Lưu ý: Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."*
  * **Quyền hạn của Khách:** Bấm nút $\rightarrow$ Chỉ cần nhập Tên hiển thị tạm thời (2–20 ký tự) là vào chơi phòng cờ thường (Casual), đánh với AI hoặc làm người xem theo dõi cờ ngay lập tức mà không cần tạo tài khoản.
  * **Cơ chế Nâng cấp lên tài khoản chính thức:** Khi người chơi đang chơi ở chế độ Khách muốn tạo tài khoản chính thức để lưu thành tích và Đánh Hạng $\rightarrow$ Người chơi bấm **"Đăng xuất"** để thoát phiên tạm thời, sau đó quay ra màn hình Đăng ký tạo tài khoản mới bình thường.
  * **Quy tắc chi tiết cho Khách (`GUEST`):**
    * *Phiên:* Phiên Khách tồn tại tối đa **12 giờ** kể từ lúc vào, chỉ trong trình duyệt đang dùng (không có "Ghi nhớ đăng nhập"). **Ngoại lệ (đã duyệt 03/10):** phiên Khách **không hết** khi đang ngồi ghế hoặc đang trong ván, chỉ hết sau khi rời. Khi hết phiên hoặc đăng xuất: xoá tên, chat và dữ liệu cá nhân của Khách; **giữ lại bản ghi ván** cho đối thủ chính thức, hiển thị tên chung là "Khách". Phiên Khách mới là một danh tính mới.
    * *Tên:* Tên hiển thị tạm **không cần duy nhất**. Giao diện luôn gắn nhãn **"(Khách)"** cạnh tên để không thể giả danh người dùng thật. Tên đi qua cùng bộ lọc từ cấm với Display Name (`Quyết định 5.3`).
    * *Được làm:* Đánh Thường (ghép ngẫu nhiên, tạo phòng, vào phòng bằng mã/link/QR), làm Người xem, Đánh Với Máy, chat phòng (cả hai kênh theo vai trò), gửi sticker, bật camera/mic khi ngồi ghế đấu.
    * *Không được làm:* Đánh Hạng; có Elo hoặc lên bảng xếp hạng; kết bạn, nhận/gửi lời mời bạn bè, chat 1-1; đổi username, email, mật khẩu.
    * *Giới hạn chống spam:* Mỗi Khách chỉ có **tối đa 1 phòng đang mở** do mình tạo cùng lúc; chat bị giới hạn tốc độ như người dùng thường (`Quyết định 5.3`). Khách **có tính** vào trần 5 người xem như mọi người xem khác.
    * *"Không lưu lịch sử" (phần ván có Khách hiện ở lịch sử đối thủ chính thức: đã duyệt 03/10):* Ván có Khách **không xuất hiện trong Lịch sử và không có Replay phía Khách**; ván Đánh Với Máy của Khách không lưu. Nếu đối thủ là tài khoản chính thức thì ván vẫn xuất hiện trong Lịch sử của họ (đối thủ hiển thị là "<Tên> (Khách)"); không ảnh hưởng Elo vì chỉ có ván Casual.

---

### Quyết định 1.4: Phân định rạch ròi Username vs Display Name & Luồng Khởi tạo Tên hiển thị (Phương án C - Đăng ký siêu tốc)
* **Lựa chọn đã chốt:** **[NAME-SPLIT-OPTION-C] Tách riêng Username & Display Name; Mặc định khởi tạo `Display Name = Username`; Đổi tên hiển thị tự do trong Cài đặt hồ sơ không cần OTP**
* **Mô tả nghiệp vụ:**
  1. **Phân định 2 khái niệm định danh:**
     * **`Username` (Tên tài khoản / Tên đăng nhập):**
       * Dùng để đăng nhập vào hệ thống cùng với Mật khẩu.
       * Quy tắc: Bắt buộc duy nhất (UNIQUE) toàn hệ thống, 3–20 ký tự, viết liền không dấu, không khoảng trắng (`^[a-zA-Z0-9_]{3,20}$`). **Không phân biệt hoa thường (đã duyệt 03/10):** `Twot` và `twot` là cùng một tên; lưu đúng chữ người dùng gõ nhưng kiểm tra trùng, đăng nhập và tìm bạn đều so sánh bằng chữ thường.
       * Bảo mật đổi tên: Bắt buộc phải trải qua quy trình 4 bước xác thực mã OTP gửi về Email (`Quyết định 1.6`).
       * Tần suất: Cho phép đổi liên tục không giới hạn số lần (không cooldown) để thuận lợi cho dev và test.
       * **Giữ chỗ username cũ (đã duyệt 03/10):** Sau khi đổi, username cũ **bị khoá 30 ngày**: không ai đăng ký được, chỉ chủ cũ đổi lại được. Quy tắc này chặn việc chiếm tên cũ để mạo danh. Username đang bị khoá vẫn hiển thị "đã có người dùng" khi kiểm tra trùng.
     * **`Display Name` (Tên hiển thị trong game):**
       * Dùng để hiển thị trên bàn cờ thi đấu, khung webcam đối thủ, danh sách bạn bè, bảng xếp hạng và hồ sơ cá nhân.
       * Quy tắc: Hỗ trợ tiếng Việt có dấu, có khoảng trắng, ký tự đặc biệt thông dụng (VD: *"Nguyễn Ngọc Tình"*), độ dài 2–30 ký tự.
       * Display Name **không cần duy nhất**, nhưng phải qua bộ lọc từ cấm (`Quyết định 5.3`); nếu chứa từ cấm thì từ chối lưu (không che bằng `***` như trong chat). Đã có `@username` hiển thị kèm ở hồ sơ và danh sách bạn bè để phân biệt hai người trùng Display Name.
       * **Ảnh đại diện:** Giai đoạn này **không có tải ảnh lên**. Avatar luôn là hình tự sinh từ chữ cái đầu của Display Name.
  2. **Cơ chế Khởi tạo Tên hiển thị (Phương án C — Tối ưu đăng ký siêu tốc):**
     * **Khi tạo tài khoản mới thành công (cả Đăng ký thường 3 bước lẫn qua Google OAuth):**
       * Hệ thống **tự động gán mặc định `display_name = username`** ở **mọi** luồng (kể cả Google OAuth — không dùng Full Name từ Google, để hai luồng giống nhau).
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
* **Lựa chọn đã chốt:** **[OTP-RULES] Hạn 3 phút; giới hạn nhập sai theo cơ chế của hệ thống xác thực, mục tiêu 5 lần** (Phương án B, Product Owner duyệt 03/10/2026)
* **Mô tả nghiệp vụ:**
  * **Thời hạn hiệu lực của mã OTP:** Mã OTP 6 chữ số chỉ có giá trị trong vòng **3 phút (180 giây)** kể từ khi gửi. Quá 3 phút mã sẽ tự động hết hạn và bị vô hiệu hóa.
  * **Giới hạn số lần nhập sai (Chống dò mã / Anti-Brute-Force):** **Mục tiêu:** tối đa **5 lần** nhập sai cho mỗi lần gửi mã, sau đó phải chờ hoặc bấm "Gửi lại mã mới". **Cách thực thi dựa vào giới hạn tốc độ xác minh của chính hệ thống xác thực (Supabase)**, nên là **gần đúng, không bảo đảm đếm chính xác từng mã** (đây là sai khác đã được Product Owner chấp nhận khi chọn Phương án B). Giao diện vẫn báo rõ khi bị giới hạn và hướng dẫn gửi mã mới.
  * **Đồng hồ đếm lùi gửi lại:** Nút "Gửi lại mã OTP" áp dụng bộ đếm lùi **60 giây** để chống hành vi bấm spam gửi mail liên tục làm nghẽn máy chủ.

---

### Quyết định 1.6: Quy trình 4 bước đổi Username qua OTP & Cố định Email (Immutable Email)
* **Lựa chọn đã chốt:** **[USER-OTP-FLOW] 4 bước đổi Username qua OTP Supabase; Cấm tuyệt đối đổi Email**
* **Mô tả quy trình 4 bước:**
  1. **Bước 1 (Chọn chức năng):** Tại Cài đặt hồ sơ (`SCR-PROFILE-SETTINGS`), người dùng bấm nút **"Đổi Username"** $\rightarrow$ Hệ thống gửi mã OTP 6 số về email và mở modal nhập mã OTP (`MODAL-OTP-USERNAME`).
  2. **Bước 2 (Nhập OTP):** Người dùng kiểm tra email nhận mã, nhập mã OTP vào modal (thời hạn 3 phút, giới hạn nhập sai theo `Quyết định 1.5`).
  3. **Bước 3 (Xác thực & Mở khóa):** Hệ thống xác thực OTP thành công $\rightarrow$ Mở khóa cho phép nhập liệu ô `Username` mới.
  4. **Bước 4 (Đổi & Xác nhận):** Người dùng nhập `username` mới mong muốn (unique, 3–20 ký tự) và bấm **"Xác nhận thay đổi"** $\rightarrow$ Cập nhật thành công.
* **Bảo toàn dữ liệu tuyệt đối (Data Integrity):** Toàn bộ lịch sử ván cờ, điểm Elo, tin nhắn chat và danh sách bạn bè đều gắn với `user_id` (UUID bất biến). Đổi Username bảo toàn nguyên vẹn 100% dữ liệu.
* **Chính sách đối với Email:** Trường `email` hiển thị khóa cứng hoàn toàn (`READONLY` / `DISABLED`), tuyệt đối không cho phép đổi nhằm bảo vệ danh tính gốc Supabase Auth và là đích nhận OTP bất biến.

---

### Quyết định 1.7: Quên mật khẩu & Đặt lại mật khẩu
* **Lựa chọn đã chốt:** **[PWD-RESET] Đặt lại mật khẩu bằng OTP gửi về email; áp dụng cho mọi tài khoản**
* **Mô tả nghiệp vụ:**
  1. Ở `SCR-FORGOT-PASSWORD` người dùng nhập email. Hệ thống **luôn** trả cùng một thông báo *"Nếu email này đã đăng ký, mã khôi phục đã được gửi"*, không tiết lộ email có tồn tại hay không.
  2. Mã OTP 6 chữ số dùng **đúng quy tắc của `Quyết định 1.5`** (hạn 3 phút, giới hạn nhập sai theo `Quyết định 1.5`, gửi lại sau 60 giây).
  3. Ở `SCR-RESET-PASSWORD` nhập OTP + mật khẩu mới (tối thiểu 8 ký tự) + xác nhận. Email được chuyển giữa hai màn hình bằng trạng thái của ứng dụng, **không đặt email lên URL**.
  4. Đổi thành công: mọi phiên đăng nhập khác của tài khoản bị đăng xuất; người dùng phải đăng nhập lại bằng mật khẩu mới.
  5. Tài khoản tạo bằng Google cũng có mật khẩu (`Quyết định 1.2`) nên dùng được luồng này.

---

### Quyết định 1.8: Phiên đăng nhập & nhiều thiết bị
* **Lựa chọn đã chốt:** **[SESSION] Ghi nhớ 30 ngày hoặc hết khi đóng trình duyệt; một người chỉ ngồi một ghế tại một thời điểm**
* **Mô tả nghiệp vụ:**
  * *Phiên:* Tick **"Ghi nhớ đăng nhập"** (mặc định tick) $\rightarrow$ phiên giữ **30 ngày**. Bỏ tick $\rightarrow$ phiên kết thúc khi đóng trình duyệt hoặc sau **12 giờ**, tuỳ cái nào đến trước. Phiên Khách xem `Quyết định 1.3`.
  * *Một tài khoản, một vị trí chơi:* Một tài khoản chỉ được **ngồi ghế đấu ở một phòng/ván** tại một thời điểm (kể cả ván với máy). Khi đang trong phòng chờ có ghế, đang trong ván, hoặc đang trong hàng đợi, các nút "Tìm trận", "Tạo phòng", "Ghép ngẫu nhiên", vào ván khác bị `DISABLED` kèm tooltip *"Bạn đang ở trong một ván/phòng khác"*.
  * *Nhiều tab:* Mở thêm tab vào cùng phòng thì tab mới **tiếp quản**, tab cũ nhận thông báo *"Phiên này đã được mở ở tab khác"* và chuyển sang chỉ đọc. **Camera/mic ở P1 (rà soát cuối):** khi tab mới tiếp quản, camera/mic của tab cũ **tự dừng**; tab mới mặc định tắt và người dùng tự bật lại. Hộp thoại chọn thiết bị `MODAL-MEDIA-TAB-SWITCH` là P2.
  * *Nhiều thiết bị:* Đăng nhập thêm ở thiết bị khác được xử lý **như mở thêm tab**: thiết bị vào sau tiếp quản, thiết bị cũ nhận thông báo và chuyển sang chỉ đọc. Một tài khoản chỉ có **một phiên đang chơi**.
  * *Đang trong hàng đợi:* Người đang tìm trận (Casual hoặc Ranked) hiển thị là 🟠 *"Đang đấu"* (không nhận lời mời hay Thách đấu); nếu mất kết nối quá **30 giây** thì tự rút khỏi hàng đợi.
  * *Ván dở:* Nếu có ván hoặc phòng đang dở, Sảnh hiển thị banner **"Bạn có ván đang chơi dở — Quay lại"**.

## PHẦN 2: TẠO PHÒNG, PHÒNG CHỜ & MỜI BẠN (Yêu cầu 2 & 3)

### Quyết định 2.0: Kiến trúc 3 Chế độ chơi tại Màn hình Sảnh chính (Lobby Hub)
* **Lựa chọn đã chốt:** **[LOBBY-MODES] Màn hình Sảnh chính phân chia rõ rệt 3 Chế độ chơi: Đánh Thường, Đánh Hạng & Đánh Với Máy**
* **Mô tả nghiệp vụ:**
  * Tại Màn hình Sảnh chính (`SCR-LOBBY`), người chơi được tiếp cận 3 phân vùng chế độ chơi rõ ràng:
  
  1. **Chế độ 1: ĐÁNH THƯỜNG (Casual Mode) — Giao lưu, tập luyện & giải trí:**
     * **Ghép trận ngẫu nhiên (Casual Quick Match):** Người dùng bấm nút "Ghép ngẫu nhiên", máy chủ tự động tìm kiếm người chơi khác trong hệ thống cũng đang chọn ghép ngẫu nhiên để tạo phòng giao lưu tức thì (không tính điểm Elo).
       * **Quy tắc ghép Casual:** Người dùng chọn **một trong 4 mức giờ** trước khi bấm "Ghép ngẫu nhiên" và chỉ được ghép với người chọn cùng mức giờ; không xét Elo. Phe Đỏ/Đen bốc thăm ngẫu nhiên; người **vào hàng đợi trước** là Chủ phòng. Ghép xong hai người vào phòng chờ ở trạng thái Sẵn sàng và đếm ngược 3 giây (ai bấm huỷ Sẵn sàng thì dừng đếm).
       * **Chờ tối đa 60 giây:** Quá 60 giây chưa ghép được thì tự rút khỏi hàng đợi và báo *"Chưa tìm được đối thủ. Hãy thử lại, tạo phòng hoặc đánh với máy"*; không phạt.
       * **Công khai mặc định:** Phòng ghép ngẫu nhiên mặc định `PUBLIC` (đúng như điều kiện hiển thị bên dưới). Nút "Ghép ngẫu nhiên" có dòng ghi chú *"Ván ghép ngẫu nhiên hiển thị công khai ở Sảnh"*; Chủ phòng đổi được sang `CODE_ONLY`/`LOCKED` trong Cài đặt phòng.
     * **Tạo phòng thi đấu (Custom Room / Solo):** Người dùng tự thiết lập phòng để mời bạn bè vào solo so tài (hỗ trợ đầy đủ các kênh chia sẻ: Link URL, Mã QR, Mã phòng 8 ký tự, mời bạn bè đang Online).
     * **Danh sách phòng đang có (Lobby Room List):** Hiển thị danh sách các phòng cờ đang hoạt động để người khác bấm vào làm Người xem theo dõi cờ.
       * *Điều kiện hiển thị nghiêm ngặt:* **Chỉ các phòng được thiết lập ở chế độ CÔNG KHAI (`PUBLIC`)** (bao gồm cả phòng ghép ngẫu nhiên và phòng solo để công khai) thì mới xuất hiện trong danh sách này để người khác vào xem. Các phòng cài đặt chế độ `CODE_ONLY` (Cần mã) hoặc `LOCKED` (Khóa) tuyệt đối không hiển thị ở Sảnh.

  2. **Chế độ 2: ĐÁNH HẠNG (Ranked Mode) — So tài nghiêm ngặt Đánh Hạng Elo:**
     * **Ghép ngẫu nhiên 100% (Pure Matchmaking):** Dựa trên thuật toán cân bằng điểm Elo FIDE ($\Delta Elo \le 100$). Người chơi bấm "Tìm trận Xếp hạng" là máy chủ tự ghép ngẫu nhiên, **tuyệt đối không cho phép tự chọn đối thủ, không cho mời bạn bè vào đánh rank** để chống gian lận "bơm điểm Elo". Quy tắc hàng đợi và chống gian lận bổ sung xem `Quyết định 7.2`.
     * **TUYỆT ĐỐI KHÔNG CHO NGƯỜI KHÁC VÀO XEM (NO SPECTATORS):** Ván cờ Xếp hạng được khóa kín hoàn toàn giữa 2 người chơi. Phòng cờ Ranked không xuất hiện trong danh sách phòng ở Sảnh, không cho phép bất kỳ ai vào xem làm người xem, bảo đảm sự tập trung và bảo mật chiến thuật tuyệt đối.
     * **TUYỆT ĐỐI CẤM XIN ĐI LẠI (NO UNDO):** "Bút sa gà chết", nút xin đi lại bị vô hiệu hóa/ẩn hoàn toàn.
     * **Quy tắc nghiêm ngặt khác:** Thời gian cố định 10 phút Rapid mỗi bên; xử lý bỏ cuộc (Rage Quit) quá 60s bị xử thua phạt trừ Elo; Khách (Guest) không được tham gia.

  3. **Chế độ 3: ĐÁNH VỚI MÁY (AI Mode) — Rèn luyện kỳ nghệ đơn phương:**
     * Người chơi chọn thi đấu theo từng cấp độ khó: **Dễ (Easy)**, **Trung bình (Medium)**, **Khó (Hard)**.
     * Tự do chọn cầm quân Đỏ hoặc Đen; cho phép Đi lại **tối đa 3 lần/ván, không cần máy đồng ý** (`Quyết định 6.3` là nguồn luật, đã sửa lại chỗ trước đây ghi "tự do"); toàn bộ ván đấu của tài khoản chính thức được lưu vào Lịch sử hồ sơ cá nhân và có thể xem lại (Replay) từng nước. Ván Đánh Với Máy **không tính Elo**.

---

### Quyết định 2.1: Giữ nguyên cơ chế thời gian cố định (Không cộng giây)
* **Lựa chọn đã chốt:** **[3A] Thời gian cố định (Fixed Clock), không áp dụng luật cộng giây (No Increment)**
* **Mô tả nghiệp vụ:**
  * Giữ nguyên 4 chế độ thời gian thi đấu cố định:
    1. *Không giới hạn thời gian (Mặc định)* — Kích hoạt cơ chế chống treo ván `R17` (sau 3 phút hỏi, sau 30s xử thua nếu im lặng).
    2. *5 phút mỗi bên (Chớp nhoáng / Blitz)*.
    3. *10 phút mỗi bên (Nhanh / Rapid)*.
    4. *15 phút mỗi bên (Tiêu chuẩn / Standard)*.
  * **Phân kỳ (xem `Phần 11`):** ở P1 chỉ có 5/10/15 phút (mặc định 10 phút); mức "Không giới hạn" (mặc định ghi ở trên) và cơ chế chống treo ván là P2.
  * **Phạm vi của "4 mức":** 4 mức này **chỉ dành cho Đánh Thường**. Đánh Hạng cố định 10 phút/bên (`Quyết định 8.1`) là **ngoại lệ riêng**, không phải mức để chọn; Đánh Với Máy không giới hạn thời gian (`Quyết định 6.3`).
  * Khi hết giờ (`clock <= 0`), máy chủ tự động kết thúc ván và xử thua bên hết giờ (`TIMEOUT`).
  * **Lý do kỹ thuật & tiến độ:** Giúp logic đồng hồ đếm lùi trên máy chủ và việc bù trừ độ trễ mạng (Network Latency Compensation) ở client luôn đơn giản, chính xác tuyệt đối, tránh tranh cãi về thời gian khi thi đấu.

---

### Quyết định 2.2: Bổ sung Mã QR (QR Code) chia sẻ phòng thi đấu
* **Lựa chọn đã chốt:** **[4B] Thêm Mã QR (QR Code) song song với Link mời và Mã phòng 8 ký tự**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn (`MODAL-INVITE`) và Màn hình phòng chờ (`SCR-WAITING-ROOM`), bổ sung khối hiển thị **Mã QR trực quan**.
  * Mã QR mã hóa đường link mời phòng chứa token bảo mật (URL có dạng `https://domain/rooms/join?token=...`). **Đã duyệt 03/10:** link, Mã 8 ký tự và Mã QR là **ba cách vào cùng một quyền**; không có link riêng cho "xem" hay "chơi" (xem `Quyết định 2.8`).
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
     * Khi cả 2 ghế đã có người, bất kỳ người chơi nào cũng có thể bấm nút **"Xin đổi bên"**.
     * Hệ thống gửi thông báo xác nhận đến đối thủ với thời hạn chờ 30 giây.
     * Nếu đối thủ đồng ý: Hai người chơi hoán đổi ghế Đỏ $\leftrightarrow$ Đen cho nhau.
     * **Quy tắc bảo vệ (Ready Reset):** Ngay khi đổi bên thành công, trạng thái "Sẵn sàng" của cả hai người chơi sẽ **tự động chuyển về trạng thái Chưa sẵn sàng (`ready = false`)**, buộc hai bên phải xác nhận lại phe cờ của mình trước khi bắt đầu.
  3. **Cơ chế Sẵn sàng (Ready) & Đếm ngược tự động vào ván cờ:**
     * Chủ phòng khi vào phòng có thể bấm **"Sẵn sàng"** trước hoặc bấm hủy sẵn sàng để chờ người thứ 2 vào.
     * Người thứ 2 vào phòng có thể trao đổi qua khung chat, bấm xin đổi bên... Khi đã sẵn sàng thi đấu thì bấm nút **"Sẵn sàng"**.
     * **Khi CẢ HAI BÊN CÙNG SẴN SÀNG (`ready_red = true` VÀ `ready_black = true`):**
       * Hệ thống tự động kích hoạt hiệu ứng đếm ngược: **3... 2... 1...** kèm âm thanh cờ gỗ.
       * Hết 3 giây đếm ngược, máy chủ chính thức khởi tạo hiệp đấu mới (`Match ID`), chuyển giao diện sang phòng thi đấu cờ trực tiếp (`SCR-GAME-ROOM`), đồng hồ thi đấu bắt đầu tính giờ cho bên quân Đỏ.
  4. **Xử lý khi Chủ phòng (Host) rời phòng chờ (`status = WAITING`):**
     * **Chuyển quyền Chủ phòng (Host Transfer):** Nếu trong phòng đang có người chơi thứ 2, máy chủ **tự động nhượng quyền Chủ phòng (Host) cho người chơi thứ 2**. Người chơi thứ 2 trở thành Host mới, giữ nguyên phòng để tiếp tục chờ người chơi khác vào chơi.
     * *Khi nào phòng mới đóng?* Chỉ khi trong phòng không còn người chơi nào khác (hoặc chỉ còn người xem) mà Host rời đi thì phòng mới tự động đóng (`status = CLOSED`).
  5. **Host khi ván đang diễn ra (`status = PLAYING`):** Vai trò Host chỉ liên quan Cài đặt phòng, nên Host mất kết nối tạm thời **không** làm đổi Host. Nếu Host rời phòng hoặc bị xử thua vì quá ân hạn (`Quyết định 8.3`), quyền Host chuyển cho người chơi còn lại. Host rời giữa ván được tính **Đầu hàng** như mọi người chơi.
  6. **Đổi chỗ giữa ghế và người xem (đã duyệt 03/10):** xem `Quyết định 2.8`.
  7. **Tái đấu giữ phòng:** Tái đấu (`R14`) tạo `Match ID` mới **trong cùng phòng**, nên danh sách chặn (`room_blocks`), danh sách người xem và chế độ phòng giữ nguyên. Chỉ áp dụng cho Đánh Thường (Ranked không có Tái đấu, xem `Quyết định 7.2`). **Đã duyệt 03/10:** cả hai bấm Tái đấu thì vào thẳng ván mới sau 3 giây, không cần bấm Sẵn sàng.
  8. **Sau ván (đã duyệt 03/10):** Khi một người ngồi ghế rời lúc phòng `FINISHED`, phòng quay về `WAITING`; người còn lại giữ ghế và quyền Host (nếu người rời là Host thì quyền Host chuyển cho người còn lại); người mới vào theo `Quyết định 2.8`. Mất kết nối ở `WAITING`: giữ ghế 60 giây.

---

### Quyết định 2.4: Luồng Tham gia phòng qua Link URL / Mã QR (Redirect tự động sau Đăng nhập / Guest)
* **Lựa chọn đã chốt:** **[JOIN-REDIRECT] Tự động chuyển tiếp vào phòng sau khi Đăng nhập / Chọn Guest**
* **Mô tả nghiệp vụ:**
  * Khi người dùng nhấp vào Link mời hoặc quét Mã QR trên thiết bị:
    * **Trường hợp 1 (Đã đăng nhập):** Hệ thống lập tức đưa thẳng người dùng vào phòng thi đấu (vào ghế chơi nếu phòng còn chỗ, hoặc vào làm người xem theo dõi).
    * **Trường hợp 2 (Chưa đăng nhập):** Hệ thống hiển thị màn hình Đăng nhập / Đăng ký kèm nút **"Guest" (Chơi nhanh)**.
    * **Tự động chuyển tiếp (Auto-Redirect):** Ngay sau khi người dùng đăng nhập thành công (hoặc bấm chọn chơi nhanh bằng Guest) $\rightarrow$ Hệ thống tự động điều hướng thẳng vào đúng phòng cờ mục tiêu ban đầu, **tuyệt đối không bắt người dùng phải bấm link hoặc quét lại mã QR lần thứ 2**.

---

### Quyết định 2.5: Mời bạn bè trực tiếp trong game (Chỉ mời bạn bè Online)
* **Lựa chọn đã chốt:** **[INVITE-ONLINE-ONLY] Nút "Mời" chỉ kích hoạt với bạn bè đang Online; Pop-up 30s**
* **Mô tả nghiệp vụ:**
  * Tại Modal mời bạn bè (`MODAL-INVITE`, chỉ người ngồi ghế của phòng mới mở được), danh sách bạn bè hiển thị rõ trạng thái:
    * 🟢 **Bạn bè đang Online:** Nút **"Mời"** sáng màu và cho phép bấm gửi lời mời.
    * ⚫ **Bạn bè đang Offline:** **Không cho phép gửi lời mời**, nút "Mời" bị ẩn hoặc ở trạng thái vô hiệu hóa kèm nhãn *"Ngoại tuyến"*.
    * 🟠 **Bạn bè đang trong ván/phòng khác ("Đang đấu"):** coi như không mời được; nút "Mời" `DISABLED` kèm tooltip *"Bạn bè đang trong ván khác"*. Khách không gửi/nhận được lời mời bạn bè (có thể chia sẻ link/QR/mã).
  * **Cơ chế hiển thị lời mời cho người nhận:**
    * Khi được mời, trên màn hình của bạn bè đang online sẽ lập tức xuất hiện một pop-up thông báo nổi ở góc:
      > ✉️ *"Người chơi [Tên Host] mời bạn tham gia phòng cờ [Tên phòng]"* kèm 2 nút: **[Tham gia]** và **[Từ chối]**.
    * Pop-up có thời hạn đếm lùi **30 giây**, nếu người nhận không bấm thì pop-up sẽ tự động biến mất và lời mời hết hiệu lực.

---

### Quyết định 2.6: Tự động chuyển thành Người xem (Fallback to Spectator) khi phòng đã đủ 2 người chơi
* **Lựa chọn đã chốt:** **[AUTO-SPECTATOR] Tự động chuyển vai trò Người xem nếu ghế đấu đã kín (còn chỗ xem, theo số người xem tối đa của phòng)**
* **Mô tả nghiệp vụ:**
  * Khi một người dùng truy cập phòng (qua Link mời, Mã phòng hoặc Mã QR):
    * Nếu 2 ghế đấu đã đủ người, nhưng phòng vẫn còn chỗ xem (số người xem hiện tại thấp hơn số người xem tối đa của phòng, `Quyết định 2.8`) $\rightarrow$ Máy chủ tự động cấp quyền vào phòng với vai trò **Người xem (`role = SPECTATOR`)** và hiển thị thông báo nhẹ:
      > ℹ️ *"Ghế đấu đã đủ 2 người, bạn đang tham gia phòng với vai trò Người xem."*
    * Nếu phòng đã đạt sức chứa (**2 người chơi + số người xem tối đa của phòng**, tối đa 4 người; phòng tạo ở chế độ "Không có người xem" thì chỉ 2 người) $\rightarrow$ Máy chủ từ chối tiếp nhận và thông báo lỗi rõ ràng: ⚠️ *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"*.

---

### Quyết định 2.7: Thông số tạo phòng & ý nghĩa 3 chế độ riêng tư
* **Lựa chọn đã chốt:** **[ROOM-SPEC] Tạo phòng gồm tên + mức giờ + chế độ riêng tư; định nghĩa rõ `PUBLIC` / `CODE_ONLY` / `LOCKED`**
* **Mô tả nghiệp vụ:**
  1. **Trường khi tạo phòng (`MODAL-CREATE-ROOM`):** Tên phòng (1–60 ký tự, qua bộ lọc từ cấm), mức giờ (4 mức, `Quyết định 2.1`), chế độ riêng tư (`PUBLIC` hoặc `CODE_ONLY`; `LOCKED` không chọn được lúc tạo, xem `Quyết định 2.8`), số người xem tối đa (**Không có người xem**, hoặc 1–2; **mặc định 2**; không đổi sau khi tạo). Phe mặc định của Host là Đỏ (`Quyết định 2.3`). Mức giờ **không đổi được** sau khi tạo phòng. Mã phòng 8 ký tự do máy chủ sinh.
  2. **Ý nghĩa 3 chế độ:**

| Chế độ | Hiện ở Sảnh | Người mới vào bằng | Ghi chú |
|---|:---:|---|---|
| `PUBLIC` | Có | Sảnh, mã 8 ký tự, link/QR, lời mời bạn bè | Mặc định của phòng ghép ngẫu nhiên |
| `CODE_ONLY` | Không | Mã 8 ký tự, link/QR, lời mời bạn bè | Phải có mã hoặc link |
| `LOCKED` | Không | **Không ai mới vào được**, kể cả có mã/link/QR | Chỉ bật được khi đã đủ 2 người chơi; người đang trong phòng giữ nguyên (`Quyết định 4.3`) |

  3. **Danh sách phòng ở Sảnh:** Sắp xếp phòng mới nhất lên đầu, hiển thị tối đa 50 phòng, tự làm mới; mỗi dòng gồm tên phòng, Chủ phòng, mức giờ, số người (`X/Y`, Y = 2 + số người xem tối đa của phòng, không quá 4), nút "Vào xem".
  4. **Thách đấu bạn bè** (`SCR-FRIENDS`) = tạo nhanh một phòng Casual rồi gửi lời mời theo `Quyết định 2.5`.

---

### Quyết định 2.8 (đã duyệt 03/10): Vào phòng, ghế ngồi và người xem
* **Lựa chọn đã chốt:** **[ROOM-ACCESS] Một lời mời = ba cách vào cùng quyền; ghế trống thì vào ghế, hết ghế thì làm người xem; Host sắp xếp ghế/người xem; `LOCKED` chỉ bật khi đủ 2 người chơi**
* **Mô tả nghiệp vụ:**
  1. **Thiết lập khi tạo phòng:** Người tạo chọn *Không có người xem* hoặc số người xem tối đa 1–2 (**mặc định 2**; yêu cầu cốt lõi của Product Owner 03/10: tối đa 2 người xem; nâng trần lên 5 là việc mở rộng sau). Sức chứa phòng = 2 + số này (tối đa 4). Không đổi sau khi tạo.
  2. **Mời người vào:** Bấm "Chia sẻ phòng" tạo cùng lúc **3 hình thức**: Link, Mã 8 ký tự, Mã QR. Cả ba cho **cùng một quyền**, không phân biệt xem/chơi. Chỉ 2 người chơi thấy nút Chia sẻ.
  3. **Người mới vào đâu:** Ghế đấu còn trống thì vào **ngay ghế đó**. Hai ghế đã kín thì vào làm **Người xem** nếu còn chỗ (`Quyết định 2.6`); hết chỗ thì báo phòng đầy. Vào từ danh sách phòng ở Sảnh (nút "Vào xem") thì **luôn** vào vai Người xem.
  4. **Đổi chỗ giữa ghế và người xem** (chỉ khi phòng `WAITING` hoặc `FINISHED`, **không đổi chỗ khi ván đang diễn ra**):
     * Người ngồi ghế tự bấm *"Chuyển sang người xem"*. **Điều kiện (rà soát cuối):** chỉ khi phòng còn chỗ xem (số người xem hiện tại thấp hơn số người xem tối đa của phòng). Phòng "Không có người xem" hoặc đã đủ người xem thì nút `DISABLED` kèm tooltip *"Phòng không còn chỗ cho người xem"*; không bao giờ vượt trần. Không có thao tác hoán đổi trực tiếp.
     * Host bấm *"Chuyển sang người xem"* cho một người đang ngồi ghế, hoặc *"Mời xuống ghế"* cho một người xem khi còn ghế trống (cùng điều kiện còn chỗ xem cho thao tác đầu).
     * **Đổi người ngồi ghế (rà soát cuối):** Mỗi khi thành phần người ngồi ghế thay đổi (kể cả khi phòng đang `FINISHED`), phòng chuyển về `WAITING` và trạng thái *Sẵn sàng* của cả hai bên **reset về chưa sẵn sàng**; sau đó theo `Quyết định 2.3` (Sẵn sàng + đếm ngược 3 giây).
     * Người xem không tự ngồi vào ghế trống (tránh tranh ghế).
     * **Host luôn là người đang ngồi ghế**: Host không tự chuyển mình sang người xem (nút bị ẩn). Muốn nhường phòng thì Host rời phòng để quyền Host chuyển cho người còn lại (`Quyết định 2.3` mục 4).
  5. **Khoá phòng (`LOCKED`):** Chỉ bật được khi đã đủ 2 người chơi (trước đó nút `DISABLED` kèm tooltip *"Chỉ khoá được khi đã đủ 2 người chơi"*). Khoá rồi thì **không ai mới vào được**, dù có link, mã hay QR. Người đang có ghế hoặc đang xem mà mất mạng vẫn vào lại được (người chơi trong 60 giây theo `Quyết định 8.3`, người xem trong 5 phút); quá hạn thì coi như người mới.
  6. **Ví dụ minh hoạ** (A, B, C, D là người trong nhóm, E là người ngoài; mục tiêu A đấu C): A tạo phòng và gửi link/mã cho nhóm. B vào trước nên được xếp ngay vào ghế đấu, nhưng B chỉ muốn xem nên chọn chuyển sang người xem (hoặc A chuyển B). C vào thì ngồi ghế đấu, hai bên Sẵn sàng và đấu. D vào lúc đang đấu nên làm người xem cùng B. A thấy đủ người thì khoá phòng; E có link hay mã cũng không vào được. Đấu xong, A rời: phòng vẫn mở, C thành Host, C mời B xuống ghế để đấu tiếp (`Quyết định 2.3` mục 8).

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
  * Mỗi người chơi chỉ được đối thủ đồng ý đi lại tối đa **3 lần** trong suốt thời gian diễn ra ván cờ.
  * Hệ thống ghi nhận số lần undo thành công trong trạng thái ván (`undo_count_red`, `undo_count_black`).
  * Khi một bên đã dùng hết 3 lần, nút **"Xin đi lại"** của bên đó sẽ chuyển sang trạng thái `DISABLED` kèm tooltip: *"Bạn đã sử dụng hết 3 lượt xin đi lại trong ván này"*.
  * **Trường hợp đề nghị bị từ chối:** Nếu đối phương bấm từ chối hoặc hết thời hạn chờ 30 giây không trả lời, lượt đó **không bị trừ** vào hạn mức 3 lần (chỉ tính khi undo thực sự thành công).
  * **Đã duyệt 03/10:** phạm vi lùi và quy tắc chống spam xem `Quyết định 3.6`.
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
     * *Lặp thế cờ 3 lần (`DRAW_REPETITION`):* Hòa tự động (`GR-END-02`, chỉ tính trên nhánh nước đi hiệu lực sau khi undo). Ngoại lệ (đã duyệt 03/10): lặp do chiếu liên tục và hòa do không ăn quân, xem `Quyết định 3.5`.
     * *Đầu hàng (`RESIGN`):* Thua ngay.
     * *Xin hòa (`DRAW_AGREEMENT`):* Đợi đối phương xác nhận trong 30s.
  3. **Đồng hồ thi đấu & Xử lý hết giờ (`R08`):** Chạy trên máy chủ (Casual: Không giới hạn, 5p, 10p, 15p; Ranked: cố định 10p Rapid). Không cộng giây. Hết giờ xử thua (`TIMEOUT`). Ưu tiên tính giờ trước khi xét duyệt nước đi (`ARCH-04`).
  4. **Mất kết nối & Xử lý Rage Quit (`R09` / `EC-03`):** Ân hạn 60s. Quá 60s xử thua (`DISCONNECT`). Trong ván Ranked bị phạt trừ Elo bình thường, đối thủ được cộng Elo. Lỗi sập server toàn cục: ván `INTERRUPTED` (**không có người thắng và không phải hòa**) giữ nguyên Elo (`ARCH-10`; xem `Quyết định 7.3`).
  5. **Chống treo ván (`R17`):** Ván không giới hạn giờ, sau 3 phút không đi cờ $\rightarrow$ hiện prompt hỏi $\rightarrow$ đếm lùi 30 giây $\rightarrow$ xử thua nếu im lặng (`INACTIVITY`). **Đã chốt (rà soát cuối):** mục tiêu là phát hiện người bỏ đi, nên áp dụng cho **bên đang tới lượt**. Bấm *"Tôi còn đây"* đặt lại bộ đếm 3 phút, nhưng **tối đa 2 lần liên tiếp mà chưa có nước đi mới**; lần thứ 3 không còn nút, hết 30 giây là xử thua.
  6. **Thao tác trong ván & Undo (`R13` / `EC-01`):** Ván Ranked **tuyệt đối cấm Undo**. Phòng thường cho phép Undo tối đa 3 lần thành công/bên/ván. Dùng cây nước đi `match_moves` lùi con trỏ `current_move_id`, không hoàn lại thời gian đã trôi.
  7. **Tái đấu đổi bên (`R14`):** Kết thúc ván, phòng giữ trạng thái `FINISHED` trong 10 phút. Cả hai cùng đồng ý Tái đấu $\rightarrow$ tạo ván mới (`new Match ID`) và tự động hoán đổi bên Đỏ $\leftrightarrow$ Đen. Chỉ áp dụng cho Đánh Thường; phòng Đánh Hạng không có Tái đấu (đã duyệt 03/10, `Quyết định 7.2`).

---

### Quyết định 3.4: Cơ chế tương tác bàn cờ (Click & Drag-Drop), Hiệu ứng thị giác và Âm thanh Web Audio API (Chi tiết Yêu cầu 4)
* **Lựa chọn đã chốt:** **[BOARD-INTERACTION] Hỗ trợ song song 2 cơ chế đi cờ (Click-to-Move & Kéo thả Drag-Drop); Hiệu ứng thị giác chỉ dẫn đầy đủ; Tích hợp âm thanh Web Audio API kèm nút Mute**
* **Mô tả nghiệp vụ:**
  1. **Thao tác điều khiển quân cờ linh hoạt (Hỗ trợ 2 phương thức):**
     * **Phương thức 1 (Click-to-Move):**
       * Click chuột (hoặc chạm cảm ứng) vào quân cờ của mình $\rightarrow$ Quân cờ được chọn hiển thị vòng sáng (Active ring).
       * Bàn cờ lập tức kích hoạt hiển thị các chấm tròn gợi ý (màu và hình dạng theo `DESIGN.md` §7.4) tại tất cả các giao điểm được phép đi tới.
       * Click vào một giao điểm hợp lệ $\rightarrow$ Quân cờ di chuyển và hạ cờ tại ô đích.
       * Hủy chọn: Click lại chính quân cờ đó, hoặc click vào một ô trống bất kỳ không hợp lệ, hoặc bấm phím `Escape`.
     * **Phương thức 2 (Kéo thả Drag & Drop):**
       * Nhấp giữ chuột (hoặc chạm giữ tay trên màn hình điện thoại) để kéo quân cờ bay theo con trỏ chuột/ngón tay.
       * Thả quân cờ vào giao điểm hợp lệ $\rightarrow$ Hạ cờ thành công.
       * Thả vào vị trí không hợp lệ $\rightarrow$ Quân cờ tự động trượt mượt mà (smooth snap-back animation) quay trở về vị trí xuất phát ban đầu.
  2. **Hiệu ứng thị giác chỉ dẫn trên bàn cờ (Visual Guides):**
     * *Gợi ý nước đi hợp lệ:* Khi một quân cờ được chọn, hiển thị các chấm tròn nhỏ tại tất cả các giao điểm mà quân đó ĐƯỢC PHÉP ĐI. Nếu ô đích đang có quân cờ của đối thủ có thể ăn được, hiển thị vòng tròn viền **cố định (không nhấp nháy)** bao quanh quân cờ đối phương đó.
     * *Đánh dấu nước đi vừa diễn ra (Last Move Highlight):* Đánh dấu bằng 4 góc vuông tại ô xuất phát và ô đích của nước cờ vừa đi gần nhất để cả người chơi và người xem dễ dàng theo dõi diễn biến ván đấu.
     * *Cảnh báo Chiếu tướng (Check Highlight):* Khi một bên bị Chiếu tướng, ô của quân Tướng bị chiếu sẽ hiện vòng cảnh báo quanh Tướng kèm dòng chữ "Đang bị chiếu" và biểu tượng cảnh báo. **Quyết định 03/10:** không nhấp nháy, không rung, không lặp vô hạn (theo `DESIGN.md` §4); tối đa một nhịp sáng lên duy nhất khi vừa bị chiếu, và tắt hẳn khi người dùng bật giảm chuyển động. **Màu, hình dạng, độ dày của mọi dấu hiệu trên bàn cờ chỉ định nghĩa ở `DESIGN.md` §7.4**, BA chỉ quy định ý nghĩa.
  3. **Hệ thống Âm thanh cờ tướng (Web Audio API):**
     * Tích hợp bộ âm thanh trực tiếp qua Web Audio API (tạo âm sắc cờ gỗ tự nhiên, nhẹ, không phụ thuộc vào việc tải file MP3 nặng từ server):
       1. 🔊 **Tiếng gõ cờ (`Move sound`):** Âm thanh tiếng gỗ cộp đanh giòn khi hạ quân cờ xuống mặt bàn gỗ.
       2. 💥 **Tiếng ăn quân (`Capture sound`):** Âm thanh va chạm gỗ mạnh mẽ, dứt khoát khi bắt quân đối phương.
       3. ⚠️ **Tiếng chuông Chiếu tướng (`Check alert`):** Âm thanh cảnh báo sắc gọn báo hiệu Tướng đang bị uy hiếp.
       4. 🎺 **Tiếng còi kết thúc ván (`End Game sound`):** Âm hưởng chiến thắng hoặc thất bại khi có kết quả ván đấu.
     * **Nút Bật / Tắt âm thanh (Mute / Unmute Toggle):** Bố trí một biểu tượng loa nhỏ ngay góc trên của bàn cờ thi đấu, cho phép người chơi bật hoặc tắt âm thanh bất kỳ lúc nào với 1 chạm.

---

### Quyết định 3.5 (đã duyệt 03/10): Luật bổ sung — chiếu liên tục, không ăn quân, giới hạn xin hòa
* **Phạm vi bộ luật:** Dự án dùng **bộ luật rút gọn** do chính tài liệu này định nghĩa (luật di chuyển chuẩn cờ tướng + các luật kết thúc ván ở `Quyết định 3.3` và 3.5). Giai đoạn 2 đối chiếu với luật cờ tướng chính thức, ghi lại mọi điểm khác biệt, và chốt chu kỳ lặp cùng thứ tự ưu tiên khi nhiều kết quả xảy ra cùng lúc (chiếu hết thắng mọi kết quả hòa).
* **Lựa chọn đã chốt:** **[RULES-EXTRA] Chiếu liên tục xử thua bên chiếu; hòa khi 120 nửa nước không ăn quân; hạn chế xin hòa lặp**
* **Mô tả nghiệp vụ:**
  1. **Chiếu liên tục (perpetual check):** Khi một thế cờ lặp lần thứ 3 mà **mọi nước đi của một bên trong chu kỳ lặp đều là nước chiếu** (bên kia không chiếu) thì **bên chiếu liên tục bị xử THUA** (lý do `PERPETUAL_CHECK`). Nếu **cả hai bên** cùng chiếu liên tục thì xử Hòa.
  2. **Đuổi quân liên tục (perpetual chase):** **Không xử riêng ở Giai đoạn 1.** Lặp thế do đuổi quân được xử Hòa theo quy tắc lặp 3 lần. Luật đuổi quân chi tiết (nếu cần) quyết ở Giai đoạn 2; ghi nhận là rủi ro về công bằng Đánh Hạng.
  3. **Hòa do không ăn quân:** Sau **120 nửa nước liên tiếp** (mỗi bên 60 nước) không có nước ăn quân thì xử Hòa tự động (`DRAW_NO_CAPTURE`). Con số cuối cùng được xác nhận lại ở Giai đoạn 2.
  4. **Xin hòa (`DRAW_AGREEMENT`):** Hạn trả lời 30 giây. Bên bị từ chối **không được xin hòa lại trong 5 nước kế tiếp của chính mình**; nút `DISABLED` kèm tooltip nêu số nước còn phải chờ. Quy tắc riêng cho Đánh Hạng xem `Quyết định 7.2`.
  5. **Lý do kết thúc ván** hiển thị ở `MODAL-MATCH-RESULT` gồm: `CHECKMATE`, `STALEMATE`, `RESIGN`, `TIMEOUT`, `DISCONNECT`, `INACTIVITY`, `DRAW_REPETITION`, `DRAW_AGREEMENT`, `DRAW_NO_CAPTURE`, `PERPETUAL_CHECK`, `INTERRUPTED`.

### Quyết định 3.6 (đã duyệt 03/10): Đề nghị trong ván — phạm vi Xin đi lại và chống spam
* **Lựa chọn đã chốt:** **[PROPOSALS] Lùi về trước nước gần nhất của người xin; mỗi người một đề nghị đang chờ; từ chối/hết hạn thì chờ 3 nước**
* **Mô tả nghiệp vụ:**
  1. **Xin đi lại ở Đánh Thường lùi bao nhiêu:** Lùi về **trước nước gần nhất của người xin**. Nếu đối thủ đã đi tiếp thì lùi **2 nước**, nếu chưa thì lùi **1 nước**. Chỉ xin được sau khi người xin đã đi ít nhất 1 nước. Trong lúc chờ trả lời, người xin **không đi được nước mới**. Đồng hồ **không hoàn lại**.
  2. **Một đề nghị đang chờ:** Mỗi người chỉ có **1 đề nghị đang chờ** cùng lúc (Xin hòa, Xin đi lại, Xin đổi bên) và được **rút lại** bất cứ lúc nào.
  3. **Chờ trước khi gửi lại:** Đề nghị bị từ chối hoặc hết hạn 30 giây thì người gửi phải chờ **3 nước của mình** mới gửi lại **cùng loại** (Xin hòa giữ mức 5 nước của `Quyết định 3.5`). Xin đổi bên chờ **60 giây**.
  4. Lượt Xin đi lại chỉ bị trừ khi đối thủ đồng ý (`Quyết định 3.2`).

---

## PHẦN 4: CHẾ ĐỘ PHÒNG & NGƯỜI XEM (Yêu cầu 6)

### Quyết định 4.1: Quyền hạn Người xem — Tuyệt đối không cấp quyền phát Micro/Camera
* **Lựa chọn đã chốt:** **[7A] Người xem chỉ Xem/Nghe (Subscribe-only) và Chat Text tại Kênh Chung**
* **Mô tả nghiệp vụ:**
  * Người xem (Spectator) khi vào phòng chỉ đóng vai trò người tiêu thụ luồng (Consumer/Subscriber):
    * Được xem Face cam và nghe giọng nói của 2 người chơi (nếu người chơi chọn mức chia sẻ *"Cả đối thủ và người xem"*).
    * Được gửi và nhận tin nhắn văn bản tại **Kênh Chung (`ROOM_PUBLIC`)**.
    * **Tuyệt đối không có tính năng bật Micro hoặc Camera:** Giao diện của Người xem không xuất hiện các nút bật mic/cam, và máy chủ LiveKit không cấp quyền phát (Publish permission) cho token của Người xem (`canPublish: false`, `canPublishData: false`).
  * **Ba mức chia sẻ camera/mic của người chơi** (chọn riêng từng người, mặc định **Tắt**): **(1) Không chia sẻ** · **(2) Chỉ đối thủ** · **(3) Cả đối thủ và người xem**. Phòng Ranked không có người xem nên chỉ có mức (1) và (2). Media chỉ được truyền trực tiếp, **không ghi hình, không ghi âm, không lưu**.
* **Lý do nghiệp vụ & kỹ thuật:**
  * Giữ không gian thi đấu tĩnh lặng, tập trung cho 2 người chơi cờ tướng; ngăn chặn triệt để hành vi "nhắc cờ", bình luận khiêu khích hoặc bật tiếng ồn gây rối bằng giọng nói.
  * Tối ưu hóa tối đa băng thông máy chủ LiveKit SFU (chỉ cần chuyển tiếp 2 luồng phát của người chơi tới tối đa 2 người xem).

---

### Quyết định 4.2: Quyền "Đuổi người xem" (Kick Spectator) — Trao quyền cho CẢ HAI NGƯỜI CHƠI
* **Lựa chọn đã chốt:** **[8B] Cả Chủ phòng (Host) và người chơi còn lại (không phải Host) đều có quyền Đuổi người xem; Chặn đến khi phòng đóng**
* **Mô tả nghiệp vụ:**
  * Trong phòng thi đấu thường (Casual), tại Danh sách người xem (`PANEL-SPECTATORS` ở thanh bên), **cả Chủ phòng (Host) và người chơi còn lại (không phải Host)** đều nhìn thấy nút **"Kick"** (hoặc biểu tượng gạch đỏ) bên cạnh tên mỗi người xem.
  * Khi một trong hai người chơi bấm nút "Kick" một người xem quấy rối:
    1. Hệ thống hiển thị modal xác nhận (`MODAL-CONFIRM-KICK`): *"Bạn có chắc chắn muốn đuổi người xem [Tên] ra khỏi phòng thi đấu không?"*.
    2. Sau khi xác nhận: Máy chủ lập tức ngắt kết nối Socket.IO, hủy token LiveKit của người xem đó, đẩy văng ra Sảnh chính kèm thông báo: *"Bạn đã bị đuổi khỏi phòng thi đấu"*.
    3. Ghi nhận bản ghi vào bảng `room_blocks (room_id, blocked_user_id, created_at)`.
    4. **Thời hạn chặn:** Người bị đuổi bị chặn vĩnh viễn không thể quay lại phòng này (kể cả có link mời mới hay mã 8 số) cho đến khi phòng cờ kết thúc chu kỳ sống và đóng hoàn toàn (`status = CLOSED`).
* **Giới hạn (đã duyệt 03/10):** Người bị đuổi có thể quay lại bằng một **phiên Khách mới** (danh tính mới) nếu phòng chưa khoá; không chặn tuyệt đối được. Đây là giới hạn chấp nhận được; khoá phòng (`Quyết định 2.8`) để chặn hẳn.
* **Lợi ích thực tế:** Trao quyền bình đẳng cho cả 2 người chơi tự bảo vệ không gian tập trung của mình trước các hành vi quấy rối, chat toxic của người xem.

---

### Quyết định 4.3: Đổi chế độ phòng trong lúc chơi & Xem cờ Thời gian thực 100% (Không Delay)
* **Lựa chọn đã chốt:** **[ROOM-PRIVACY-REALTIME] Đổi chế độ phòng linh hoạt (giữ người xem cũ, chặn người mới, cho phép kick); Người xem theo dõi thời gian thực 100% không delay**
* **Mô tả nghiệp vụ:**
  1. **Đổi chế độ phòng trong lúc đang chơi (Dynamic Privacy Change):**
     * Trong menu Cài đặt phòng (`MODAL-ROOM-SETTINGS`), Chủ phòng có toàn quyền chuyển đổi linh hoạt giữa 3 chế độ (`PUBLIC`, `CODE_ONLY`, `LOCKED`) bất kỳ lúc nào kể cả khi ván cờ đang diễn ra. Riêng `LOCKED` chỉ bật được khi phòng đã đủ 2 người chơi (`Quyết định 2.8`).
     * Khi Chủ phòng chuyển sang **`LOCKED` (Khóa phòng):** (chỉ bật được khi đã đủ 2 người chơi; người đang có ghế/đang xem mất mạng vẫn vào lại được, xem `Quyết định 2.8` mục 5)
       * Phòng cờ lập tức bị ẩn hoàn toàn khỏi danh sách phòng tại Sảnh chính.
       * Máy chủ chặn toàn bộ các yêu cầu tham gia mới từ bên ngoài.
       * **Thu hồi mã/link/QR:** Mọi link, QR, mã 8 ký tự và lời mời bạn bè **chưa được dùng** bị vô hiệu ngay. Khi Host đổi lại `PUBLIC`/`CODE_ONLY`, hệ thống **sinh mã và link mới**; bản cũ không dùng lại được. Người đang trong phòng giữ nguyên quyền xem/nghe, nên không bị thu token media. Người đã rời phòng muốn vào lại phải qua mã/link mới.
       * **Xử lý người xem hiện tại:** **Người xem đang có sẵn trong phòng vẫn được giữ lại tiếp tục theo dõi ván cờ bình thường**. Nếu người chơi muốn loại bỏ ai thì có thể dùng tính năng "Kick" để đuổi đích danh người đó.
  2. **Người xem theo dõi cờ Thời gian thực 100% (Không áp dụng Spectator Delay):**
     * Nước đi trên bàn cờ được đồng bộ tức thời đến màn hình của người xem qua Socket.IO (độ trễ dưới 100ms).
     * Không áp dụng cơ chế hoãn giờ (delay 5–10s) vì phòng Casual chủ yếu phục vụ giao lưu bạn bè học hỏi; ván Đánh Hạng (Ranked) đã cấm tuyệt đối 100% người xem nên không phát sinh rủi ro gian lận rank.

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
  * Người chơi hoặc người xem chỉ cần bấm 1 chạm để gửi ngay mà không mất thời gian gõ chữ.
* **Cơ chế kỹ thuật:** Tin nhắn dạng shortcode (VD: `:tea:`, `:clap:`), lưu chuỗi trong bảng `chat_messages`, giao diện render icon SVG mượt mà.

---

### Quyết định 5.2: Bổ sung tính năng Chat riêng ngoài phòng thi đấu (Direct Messaging / 1-1 Chat)
* **Lựa chọn đã chốt:** **[9C - Bổ sung / R21] Nhắn tin riêng 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ (`status = ACCEPTED`)**
* **Mô tả nghiệp vụ:**
  * Cho phép hai người dùng đã kết bạn chính thức trò chuyện nhắn tin riêng 1-1 mọi lúc ngoài phòng đấu.
  * Hỗ trợ lưu trữ lịch sử tin nhắn, chỉ báo tin nhắn chưa đọc (Unread badge) trên thanh điều hướng, phân quyền RLS an toàn trong CSDL (`direct_conversations`, `direct_messages`).

---

### Quyết định 5.3: Quy tắc Tab Chat mặc định & Bộ lọc từ ngữ thô tục (Bad Word Filter)
* **Lựa chọn đã chốt:** **[CHAT-FILTER-TAB] 2 Người chơi mặc định mở Kênh Riêng; Người xem chỉ thấy Kênh Chung; Bộ lọc che từ cấm bằng dấu sao `***`**
* **Mô tả nghiệp vụ:**
  1. **Quy tắc Tab Chat mặc định khi vào phòng thi đấu:**
     * **Đối với 2 Người chơi (Players):** Giao diện khung chat bên cạnh bàn cờ **mặc định mở sẵn tab `[Kênh Riêng]`** (`PLAYERS_PRIVATE`) để 2 người chơi chào hỏi, giao lưu trực tiếp. Hai người chơi có thể bấm tab `[Kênh Chung]` (`ROOM_PUBLIC`) nếu muốn trò chuyện với người xem, và có công tắc "Ẩn kênh chung" để tập trung.
     * **Đối với Người xem (Spectators):** Người xem không có quyền xem hay gửi tin vào Kênh Riêng, nên giao diện khung chat của người xem **chỉ hiển thị duy nhất tab `[Kênh Chung]`**.
  2. **Bộ lọc từ ngữ thô tục / xúc phạm (Bad Word Filter):**
     * Tích hợp bộ lọc từ ngữ nhạy cảm, thô tục và công kích cá nhân phổ biến (tiếng Việt & tiếng Anh).
     * Mọi tin nhắn gửi đi ở bất kỳ kênh nào (Kênh riêng, Kênh chung, Chat 1-1 bạn bè) nếu chứa từ ngữ trong danh sách đen sẽ **tự động được máy chủ và client che bằng các ký tự dấu sao `***`** (ví dụ: *"đánh cờ như ***"*).
     * Bảo đảm không gian văn hóa cờ tướng lành mạnh, văn minh, tránh các sự cố phản cảm khi biểu diễn đồ án trước hội đồng.
     * **Danh sách và cách lọc:** Danh sách từ cấm do **nhóm dự án duy trì** trong một tệp cấu hình riêng (không sửa trực tiếp trong cơ sở dữ liệu). Khi so khớp, hệ thống chuẩn hoá trước: bỏ dấu tiếng Việt, đưa về chữ thường, bỏ khoảng trắng và ký tự đặc biệt chèn giữa chữ, đổi các ký tự thay thế phổ biến (ví dụ `0`→`o`, `1`→`i`). Bộ lọc này dùng chung cho tin nhắn chat, Display Name, tên Khách và tên phòng (Display Name/tên phòng bị **từ chối** thay vì che `***`).
     * **Giới hạn chat:** Mỗi tin tối đa **200 ký tự**; tối đa **5 tin trong 10 giây** mỗi người, vượt thì báo *"Bạn gửi quá nhanh"*. Chat phòng **xoá khi phòng đóng**, không lưu sau đó. **Đã duyệt 03/10:** Kênh Riêng chỉ hiện cho 2 người đang ngồi ghế, người đổi chỗ sau không đọc được tin cũ; người xem mới chỉ thấy tin Kênh Chung từ lúc vào. Chat 1-1 giữa bạn bè lưu theo `Quyết định 5.5` (huỷ kết bạn thì ẩn, kết bạn lại thì hiện lại).

---

### Quyết định 5.4: Camera, Mic & Chat trong Ván Đánh Hạng (Ranked Media Policy)
* **Lựa chọn đã chốt:** **[RANKED-MEDIA] Mở đầy đủ cả Camera, Mic và Chat Text cho 2 người chơi; Tùy 2 bên tự quyết định Bật/Tắt**
* **Mô tả nghiệp vụ:**
  * Trong ván Đánh Hạng (Ranked), do đã khóa kín 100% người xem (không có người xem), ván đấu chỉ có duy nhất 2 người chơi.
  * **Hệ thống cho phép mở cả Camera, Mic và Chat Text:**
    * Hai người chơi được toàn quyền tự do bấm Bật hoặc Tắt Camera và Mic của mình để nhìn mặt giao lưu đối thủ nếu muốn (mặc định vào phòng vẫn là TẮT để bảo đảm quyền riêng tư ban đầu).
    * Khung chat hiển thị Kênh Riêng duy nhất giữa 2 người, hỗ trợ nhắn tin và gửi 12 sticker cảm xúc nhanh kèm bộ lọc từ cấm `***`.

  * **Bảo vệ người nhận (người lạ trong Ranked):** Hình và tiếng của đối thủ ở phía người nhận **mặc định ẨN** trong ván Đánh Hạng cho đến khi người nhận bấm *"Hiện hình/tiếng đối thủ"*; mọi lúc đều có nút **"Tắt ngay"** để ẩn lại tức thì. Ở Đánh Thường mặc định hiện. Đây là cách xử lý nội dung không phù hợp trong phạm vi này, vì **không có chức năng Báo cáo vi phạm hay quản trị viên** (`Phần 10`).

---

### Quyết định 5.5: Hệ thống Bạn bè & Thông báo
* **Lựa chọn đã chốt:** **[FRIENDS] Kết bạn hai chiều theo username; trạng thái online/đang đấu; không có chức năng Chặn riêng**
* **Mô tả nghiệp vụ:**
  1. **Tìm & gửi lời mời:** Chỉ tài khoản chính thức mới có Bạn bè. Tìm theo `username` (tiền tố, không phân biệt hoa thường). Kết bạn là **hai chiều**: gửi lời mời $\rightarrow$ bên kia **Chấp nhận** hoặc **Từ chối**. Người gửi có thể thu hồi lời mời. Lời mời chờ tự hết hạn sau **30 ngày**.
  2. **Giới hạn:** Tối đa **200 bạn** và **50 lời mời đang chờ** mỗi tài khoản. Nếu một người bị **cùng một người nhận từ chối 2 lần** thì không gửi lại được lời mời cho người đó (chống quấy rối); đây là cách thay cho chức năng Chặn.
  3. **Huỷ kết bạn:** Hai bên mất quyền nhắn tin 1-1 ngay. Lịch sử tin nhắn **được giữ nhưng ẩn**, hiện lại nếu kết bạn lại.
  4. **Trạng thái:** 🟢 Online (có kết nối hoạt động) · 🟠 Đang đấu (đang ngồi ghế trong ván/phòng) · ⚫ Offline. Chỉ trạng thái 🟢 mới nhận được lời mời vào phòng (`Quyết định 2.5`).
  5. **Thông báo:** Icon chuông liệt kê lời mời kết bạn đang chờ; huy hiệu **tin chưa đọc** hiện trên mục Bạn bè. Lời mời vào phòng là pop-up 30 giây, không lưu lại trong chuông.
  6. **Hồ sơ người khác:** Không có trang hồ sơ công khai riêng. Bấm vào tên một người ở bảng xếp hạng, kết quả tìm kiếm hoặc thẻ đối thủ chỉ hiện thẻ tóm tắt (Avatar, Display Name, `@username`, Elo, cấp bậc, thắng/thua/hòa) cùng nút **"Kết bạn"**; nút "Nhắn tin" chỉ hiện khi đã là bạn (`Quyết định 8.2`).

## PHẦN 6: CHƠI VỚI MÁY AI (Yêu cầu 8)

### Quyết định 6.1: Không triển khai tính năng Gợi ý nước đi (No Hint)
* **Lựa chọn đã chốt:** **[10A] Không làm tính năng Gợi ý nước đi (No Move Hinting)**
* **Mô tả nghiệp vụ:**
  * Giữ đúng phạm vi thi đấu đối kháng thuần túy giữa người và máy.
  * Engine AI chỉ tính toán nước đi cho bên quân cờ do máy điều khiển theo 3 cấp độ đã định hình:
    * *Dễ (Easy):* Depth 2, thời gian phản hồi $\le 300$ ms.
    * *Trung bình (Medium):* Depth 4, thời gian phản hồi $\le 1000$ ms.
    * *Khó (Hard):* Depth 6, thời gian phản hồi $\le 3000$ ms.
  * **Lý do:** Giữ kiến trúc giao diện đơn giản, tập trung toàn lực cho AI vượt qua cổng kiểm định chất lượng (tiêu chí đo cụ thể chốt ở Giai đoạn 2) và chạy ở tiến trình tách biệt khỏi máy chủ chính.
  * **Mục tiêu cảm nhận (không ràng buộc, đo ở Giai đoạn 2):** Dễ — người mới học cờ thắng được; Trung bình — người chơi phổ thông thắng khoảng một nửa số ván; Khó — người chơi phổ thông hiếm khi thắng.
  * **Khi máy không kịp (đã chốt, rà soát cuối):** Hết ngân sách thời gian mà chưa đạt độ sâu mục tiêu thì máy đi **nước tốt nhất đã tìm được đến lúc đó** (tìm sâu dần, luôn có ít nhất một nước hợp lệ). Nếu tiến trình máy cờ **lỗi hoặc không phản hồi sau 10 giây**: ván chuyển "Bỏ dở", báo *"Máy cờ gặp sự cố"* kèm nút *Thử lại*. Con số đo thực tế để Giai đoạn 2.

---

### Quyết định 6.2: Lưu trữ đầy đủ các ván đấu với AI vào Lịch sử người dùng
* **Lựa chọn đã chốt:** **[11B] Lưu ván đấu AI vào Lịch sử & Hỗ trợ Replay xem lại**
* **Mô tả nghiệp vụ:**
  * Khi người dùng có tài khoản thi đấu với máy và kết thúc ván (Thắng, Thua, Hòa, Đầu hàng):
    1. Ván cờ được lưu chính thức vào bảng CSDL `matches` và cây nước đi `match_moves`.
    2. Bổ sung trường đánh dấu `match_type = 'AI'` và `ai_difficulty = 'EASY' | 'MEDIUM' | 'HARD'`.
    3. Tại màn hình Lịch sử ván đấu (`SCR-HISTORY`), ván đấu hiển thị nhãn nổi bật:
       * 🤖 `[Đấu với Máy - Dễ]` / `[Đấu với Máy - Trung bình]` / `[Đấu với Máy - Khó]`.
    4. Người chơi có thể bấm vào xem lại (**Replay**) từng nước cờ, phân tích sai lầm để tự nâng cao trình độ.
* **Lợi ích thực tế:**
  * Giúp người chơi theo dõi được tiến trình rèn luyện cờ của bản thân theo thời gian.
  * Tận dụng tối đa giao diện Replay (`SCR-REPLAY`) đã được thiết kế sẵn.
* **Quyền xem lại, áp dụng mọi chế độ (đã duyệt 03/10):** Chỉ **2 người chơi của ván** xem lại từ Lịch sử; người xem không xem lại được; **không có link chia sẻ**; ván Ranked cũng riêng tư như vậy. Replay hiển thị chuỗi nước đi **hiệu lực**, không hiện các nước đã đi lại.

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
     * **Trường hợp chưa có nước nào của người chơi:** Nếu người chơi cầm Đen và máy mới đi đúng 1 nước (hoặc ván chưa có nước nào của người chơi), nút "Đi lại" `DISABLED` kèm tooltip *"Chưa có nước nào của bạn để đi lại"*. Chỉ khi người chơi đã đi ít nhất 1 nước mới bấm được. Không đi lại được sau khi ván đã kết thúc.
     * **Mỗi lần Đi lại thành công mới trừ 1 lượt** (kể cả trường hợp huỷ lúc máy đang nghĩ và chỉ lùi 1 nước của người chơi).
  3. **Đồng hồ thi đấu — Không giới hạn thời gian (Thư thái rèn luyện):**
     * Ván đấu với máy hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi.
     * Người chơi có thể tự do suy ngẫm từng nước cờ mà không lo bị áp lực đồng hồ đếm lùi, không bị xử thua do hết giờ (`TIMEOUT`) và không áp dụng cơ chế cảnh báo chống treo ván `R17`.
     * *Phía máy cờ:* Vẫn tuân thủ nghiêm ngặt ngân sách thời gian tối đa theo từng cấp độ (Dễ $\le 300$ms, Trung bình $\le 1000$ms, Khó $\le 3000$ms).
  4. **Hòa, đầu hàng, bỏ dở:**
     * Ván với máy **không có nút Xin hòa**; hòa chỉ xảy ra theo `Quyết định 3.5` (lặp thế, 120 nửa nước không ăn quân). Người chơi có nút **Đầu hàng**.
     * Mất kết nối hoặc đóng tab giữa ván: ván được **giữ 30 phút** để vào lại cùng đường dẫn `/ai/:id` (Sảnh có banner "ván đang chơi dở"). Quá 30 phút ván tự lưu vào Lịch sử với kết quả **"Bỏ dở"** (không tính thắng/thua). Ván của Khách không lưu (`Quyết định 1.3`).

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
     * Hệ số $K-factor$: $K = 32$ cho 30 ván đầu tiên (giai đoạn định vị trình độ), $K = 16$ cho các ván tiếp theo. Chỉ **ván Đánh Hạng đã hoàn tất** mới được đếm vào 30 ván; ván Đánh Thường, Đánh Với Máy và ván `INTERRUPTED` không đếm, không đổi Elo. Elo **tối thiểu 100** (không xuống dưới).
     * Cấp bậc danh hiệu người chơi (Rank Tiers):
       * *Người mới (Novice):* < 1200
       * *Sơ cấp (Junior):* 1200 – 1399
       * *Trung cấp (Intermediate):* 1400 – 1599
       * *Cao cấp (Advanced):* 1600 – 1799
       * *Kiện tướng (Master):* 1800 – 1999
       * *Đại sư (Grandmaster):* $\ge 2000$
       * **Chưa xếp hạng:** Tài khoản chưa có ván Đánh Hạng nào hiển thị nhãn *"Chưa xếp hạng"* (Elo 1200 vẫn dùng để ghép trận). Cấp *"Người mới"* chỉ xuất hiện khi Elo giảm xuống dưới 1200.
  2. **Cơ chế Hàng đợi Ghép trận Xếp hạng tự động (Ranked Matchmaking Queue):**
     * Tại Sảnh chính, người chơi bấm nút **"Tìm trận Xếp hạng"**.
     * Hệ thống đưa người chơi vào hàng đợi `MatchmakingQueue` trên máy chủ.
     * Thuật toán tìm kiếm đối thủ cân tài cân sức: Tìm người chơi có chênh lệch $\Delta Elo \le 100$ điểm. Nếu sau mỗi 10 giây chưa tìm thấy, tự động mở rộng biên độ thêm $\pm 50$ điểm.
     * **Cơ chế Hủy tìm trận (Cancel Matchmaking):**
       * *Khi chưa tìm thấy đối thủ:* Người chơi có thể bấm nút **"Hủy tìm trận"** bất kỳ lúc nào $\rightarrow$ Hệ thống lập tức rút người chơi ra khỏi hàng đợi mà không bị trừ điểm Elo hay bất kỳ hình phạt nào.
       * *Khi vừa tìm thấy đối thủ & phòng đang khởi tạo (`MATCH_FOUND`):* Nút Hủy bị khóa/vô hiệu hóa, cả 2 người chơi được đưa thẳng vào bàn cờ thi đấu.
     * Khi ghép thành công: Máy chủ tự động tạo phòng cờ chuyên biệt loại `RANKED`, thời gian mặc định 10 phút mỗi bên, ngẫu nhiên chọn bên Đỏ/Đen và đưa cả 2 người chơi vào thi đấu ngay lập tức.
  3. **Quy tắc Phạt điểm Elo khi ĐẦU HÀNG (Resign) — Xử phạt công bằng:**
     * Bất kể người chơi bấm nút "Đầu hàng" ở nước cờ thứ mấy (kể cả ngay nước 1 hay nước 3), hệ thống lập tức xử bên đầu hàng là **THUA** và **bị trừ điểm Elo bình thường theo công thức FIDE**.
     * Đối thủ được xử là **THẮNG** và **được cộng điểm Elo tương ứng**.
     * *Lý do:* Triệt tiêu hành vi cố tình hủy trận né đối thủ mạnh hoặc phá hoại hàng đợi ghép trận.
  4. **Bảng Xếp Hạng Người Chơi (Leaderboard Top 50 + Dòng Ghim Cá Nhân):**
     * Màn hình `SCR-LEADERBOARD`: Hiển thị danh sách **Top 50 người chơi** có điểm Elo cao nhất toàn server, danh hiệu rank, số trận thắng/thua/hòa và tỷ lệ thắng.
     * **Dòng ghim vị trí cá nhân cố định (Sticky User Row):** Dưới đáy bảng luôn có một hàng cố định hiển thị: *Thứ hạng hiện tại của chính bạn (VD: Hạng #142 - Elo 1280 - Cấp Trung cấp)* giúp người dùng ngay lập tức biết được vị thế của mình trên bảng tổng sắp mà không phải cuộn tìm kiếm.
     * **Điều kiện lên bảng:** Chỉ tài khoản có **ít nhất 5 ván Đánh Hạng hoàn tất** mới được xếp hạng và hiện trong bảng. Người chưa đủ thì dòng ghim ghi *"Chưa xếp hạng — cần thêm X ván"*. Khách không có mặt trên bảng.
     * **Đồng điểm:** Xếp theo Elo giảm dần; bằng Elo thì bên có nhiều ván thắng hơn xếp trước; vẫn bằng thì bên đạt mức Elo đó sớm hơn xếp trước. Không có reset theo mùa.
  5. **Quyết định về Giải đấu (Tournaments):**
     * **BỎ HOÀN TOÀN HỆ THỐNG GIẢI ĐẤU (OUT-OF-SCOPE):** Không làm tính năng giải đấu (chia bảng, nhánh đấu Knockout) để giữ phạm vi tập trung cao độ vào thi đấu đối kháng trực tiếp và xếp hạng 1-1 theo Elo.

---

### Quyết định 7.2: Hàng đợi Ranked khi ít người, chống bơm Elo, xin hòa & Tái đấu trong Ranked
* **Lựa chọn đã chốt:** **[RANKED-GUARD] Trần chờ 60 giây; một cặp tối đa 3 ván/24 giờ; xin hòa chỉ sau 20 nước mỗi bên; không Tái đấu**
* **Mô tả nghiệp vụ:**
  1. **Trần chờ hàng đợi:** Biên độ Elo mở thêm ±50 mỗi 10 giây (`Quyết định 7.1`) và **dừng ở 60 giây** (biên độ cuối ±400). **Khi hai người có biên độ khác nhau**, ghép được nếu chênh lệch Elo nằm trong biên độ **lớn hơn** của hai người (người chờ lâu hơn). Cặp đã chạm trần 3 ván/24 giờ bị bỏ qua âm thầm và hệ thống tiếp tục tìm đối thủ khác, không báo lý do. Quá 60 giây không ghép được thì tự rút khỏi hàng đợi, báo *"Chưa tìm được đối thủ phù hợp, hãy thử lại sau"*, không phạt, **không ghép với máy**.
  2. **Mất hàng đợi:** Hàng đợi chỉ nằm trong bộ nhớ máy chủ. Khi máy chủ khởi động lại, hàng đợi mất; giao diện báo *"Hàng đợi đã bị huỷ, hãy tìm lại"*, không phạt.
  3. **Chống bơm Elo bằng nhiều tài khoản:** Hai tài khoản **không bị ghép với nhau quá 3 ván Đánh Hạng trong 24 giờ**. Hệ thống **không** chặn theo địa chỉ IP hay thiết bị vì buổi demo và lớp học dùng chung một mạng.
  4. **Xin hòa trong Ranked (đã duyệt 03/10):** Cho phép (hạn 30 giây), nhưng chỉ bấm được khi **mỗi bên đã đi ít nhất 20 nước**; trước đó nút `DISABLED` kèm tooltip *"Chỉ xin hòa được sau 20 nước mỗi bên"*. Hòa tính Elo theo $S = 0.5$.
  5. **Không Tái đấu trong Ranked (đã duyệt 03/10):** `MODAL-MATCH-RESULT` của ván Ranked **không có nút Tái đấu**. Phòng Ranked đóng khi cả hai rời; muốn đấu tiếp phải "Tìm trận Xếp hạng" lại.
  6. **Rời phòng giữa ván Ranked** được tính **Đầu hàng** (`MODAL-CONFIRM-LEAVE`), thua và trừ Elo như `Quyết định 7.1`.

### Quyết định 7.3 (đã duyệt 03/10): Phân loại kết quả ván và thống kê
* **Lựa chọn đã chốt:** **[RESULT-TYPES] `INTERRUPTED` và "Bỏ dở" hiện trong Lịch sử nhưng không tính thắng/thua/hòa, không đổi Elo**

| Kết quả | Hiện ở Lịch sử | Tính thắng/thua/hòa và tỷ lệ thắng | Đổi Elo | Đếm vào 30 ván đầu và 5 ván lên bảng | Xem lại |
|---|:---:|:---:|:---:|:---:|:---:|
| Thắng / Thua (mọi lý do kết thúc) | Có | Có | Ranked: có; Casual, AI: không | Ranked: có | Có |
| Hòa | Có | Có | Ranked: có ($S = 0.5$) | Ranked: có | Có |
| `INTERRUPTED` (nhãn "Bị gián đoạn") | Có | Không | Không | Không | Có |
| Bỏ dở ván AI (nhãn "Bỏ dở") | Có | Không | Không (AI không tính Elo) | Không | Có |

* **Bảng xếp hạng** và thẻ tóm tắt người dùng chỉ lấy thắng/thua/hòa của **ván Ranked**. Lịch sử cá nhân hiển thị tất cả loại.

---

## PHẦN 8: CÁC QUY TẮC RÀNG BUỘC NGOẠI LỆ (EDGE CASES)

### Quyết định 8.1: Quy tắc chặt chẽ cho Ván Xếp Hạng (Ranked Match)
* **Lựa chọn đã chốt:** **[EC-01] Ván Ranked nghiêm ngặt: Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách KHÔNG ĐƯỢC tham gia; Thời gian 10 phút Rapid; Cho phép 2 người chơi tự bật Camera/Mic/Chat**
* **Mô tả nghiệp vụ:**
  * **Ghép ngẫu nhiên 100%:** Người chơi không được quyền chọn đối thủ hay mời phòng, máy chủ phân xử ghép ngẫu nhiên theo thuật toán Elo.
  * **Tuyệt đối KHÔNG CHO NGƯỜI KHÁC VÀO XEM (No Spectators):** Khóa hoàn toàn luồng người xem. Không ai có thể vào phòng xem ván Ranked dưới bất kỳ hình thức nào. Phòng không hiển thị ở Sảnh.
  * **Tuyệt đối CẤM XIN ĐI LẠI (No Undo):** Nút "Xin đi lại" bị ẩn hoặc vô hiệu hóa (`DISABLED`) vĩnh viễn. "Bút sa gà chết" nhằm bảo đảm tính công bằng tuyệt đối cho thứ hạng người chơi.
  * **Hỗ trợ Camera, Mic và Chat Text giữa 2 người chơi:** Cho phép 2 người chơi tự quyết định Bật/Tắt Camera và Mic để giao lưu trực tiếp trong lúc so tài (Quyết định 5.4).
  * **Khách (Guest) không được tham gia:** Chỉ các tài khoản chính thức đã đăng ký mới được quyền bấm "Tìm trận Xếp hạng".
  * **Thời gian thi đấu mặc định 10 phút:** Ngân sách thời gian cố định **10 phút mỗi bên (Rapid chuẩn cờ quốc tế)**, không áp dụng luật cộng giây.

---

### Quyết định 8.2: Quy tắc Chat riêng 1-1 ngoài phòng thi đấu
* **Lựa chọn đã chốt:** **[EC-02] Chỉ cho phép nhắn tin 1-1 giữa những người ĐÃ LÀ BẠN BÈ (`status = 'ACCEPTED'`)**
* **Mô tả nghiệp vụ:**
  * Người dùng chỉ có thể mở cuộc hội thoại chat riêng 1-1 với những người chơi đã nằm trong danh sách Bạn bè chính thức.
  * Nếu truy cập hồ sơ của người lạ (chưa kết bạn), giao diện chỉ hiển thị nút **"Kết bạn"**, không hiển thị nút "Nhắn tin". Sau khi đối phương chấp nhận lời mời kết bạn, nút "Nhắn tin" mới được kích hoạt.
  * **Lợi ích:** Ngăn chặn triệt để hành vi spam tin nhắn rác, quấy rối danh tính hoặc gửi tin nhắn khiêu khích ngoài phòng đấu từ các tài khoản lạ.

---

### Quyết định 8.3: Xử lý Ngắt kết nối / Bỏ cuộc (Rage Quit) trong ván Xếp hạng
* **Lựa chọn đã chốt:** **[EC-03] Ân hạn 60 giây; Xử thua và phạt trừ điểm Elo bình thường nếu bỏ chạy**
* **Mô tả nghiệp vụ:**
  * Khi một người chơi trong ván bị ngắt kết nối (mất mạng hoặc cố tình tắt trình duyệt). Quy tắc ân hạn 60 giây dưới đây áp dụng cho **cả Đánh Hạng và Đánh Thường**; khác biệt duy nhất là Đánh Thường không đổi Elo:
    * Hệ thống kích hoạt bộ đếm thời gian ân hạn **60 giây**. Bàn cờ hiển thị chỉ báo: *"Đối thủ đang mất kết nối, thời gian chờ: 60s"*.
    * Nếu trong vòng 60s người chơi kết nối lại: Ván cờ tiếp tục bình thường từ trạng thái hiện tại.
    * Nếu quá 60s không kết nối lại: Máy chủ tự động kết thúc ván đấu, xử thua bên mất kết nối với lý do `DISCONNECT`, trừ điểm Elo như một trận thua và cộng điểm Elo thắng cho đối thủ còn lại.
  * **Hành vi theo vai trò (rà soát cuối):** Ân hạn 60 giây và xử thua chỉ áp dụng cho **người chơi đang trong ván online**. Người chơi ở phòng `WAITING`/`FINISHED` chỉ giữ ghế 60 giây rồi mất ghế (không xử thua). Người xem giữ chỗ 5 phút. Ván với máy giữ 30 phút (`Quyết định 6.3`).
  * **Đồng hồ trong lúc chờ:** Đồng hồ ván **vẫn chạy bình thường** trong 60 giây ân hạn. Nếu bên đang tới lượt là bên mất kết nối và **hết giờ trước** khi hết ân hạn thì xử `TIMEOUT`; nếu ân hạn hết trước thì xử `DISCONNECT`.
  * **Trường hợp lỗi hạ tầng / Server sập:** Ván chuyển sang `INTERRUPTED` (`ARCH-10`) và **giữ nguyên điểm Elo của cả hai bên** **chỉ khi máy chủ tự ghi nhận sự cố của chính nó** (khởi động lại, mất kết nối cơ sở dữ liệu). Nếu máy chủ vẫn chạy bình thường mà hai người chơi cùng mất kết nối thì **không phải `INTERRUPTED`**: mỗi bên có ân hạn 60 giây riêng; nếu cả hai cùng quá hạn thì **bên mất kết nối trước bị xử thua** (`DISCONNECT`), bên còn lại thắng. Cách này chặn việc hai người cùng rút mạng để né mất Elo.

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
    * Nút *"Mô phỏng Người chơi 1 mất mạng"* $\rightarrow$ Ngắt ngay lập tức Socket của Client 1 để kích hoạt bộ đếm ân hạn 60s trên màn hình Client 2.
    * Nút *"Tái kết nối tức thì"* $\rightarrow$ Bật lại kết nối và kích hoạt snapshot đồng bộ bàn cờ.
  * **Ý nghĩa thực tế:** Giúp buổi bảo vệ đồ án diễn ra mượt mà, chủ động biểu diễn được cơ chế chịu lỗi (Fault-tolerance) ngay cả khi Wi-Fi phòng hội đồng chập chờn.
  * **Không có vai trò Admin:** Công cụ này **không gắn với vai trò người dùng**. Nó chỉ xuất hiện khi môi trường chạy được bật cờ "chế độ demo" trong cấu hình; ở môi trường chính thức bị tắt hoàn toàn và máy chủ từ chối các lệnh giả lập.

---

## PHẦN 10: RÀNG BUỘC CHUNG & NGOÀI PHẠM VI

### Quyết định 10.1: Ràng buộc chung của sản phẩm
* **Lựa chọn đã chốt:** **[GLOBAL-CONSTRAINTS] Quy mô đồ án, web responsive, tiếng Việt, không lưu media**
* **Mô tả:**
  * **Nguồn lực và hạn chót (Product Owner cung cấp 03/10/2026):** nhóm **7 người**, hạn nộp/demo khoảng **2 tuần** (đến khoảng 17/10/2026). Vì vậy phạm vi làm trước được giới hạn ở P1 theo `Phần 11`.
  * **Quy mô thiết kế:** Hướng tới tối đa khoảng **50 người dùng đồng thời và 10 phòng/ván cùng lúc**. Con số đo được chốt ở Giai đoạn 2.
  * **Thiết bị:** Ứng dụng web chạy trên bản mới của Chrome, Edge, Firefox, Safari. Giao diện **responsive từ 360 px** (vì Mã QR hướng tới điện thoại); bàn cờ chơi được bằng cảm ứng.
  * **Ngôn ngữ:** Chỉ tiếng Việt.
  * **Dữ liệu cá nhân:** Chỉ lưu email, username, Display Name, mật khẩu (băm), Elo, lịch sử ván, bạn bè, tin nhắn. Camera/mic **không ghi, không lưu**. Không hỏi tuổi.

### Quyết định 10.2: Cố ý KHÔNG làm trong phạm vi này
* **Lựa chọn đã chốt:** **[OUT-OF-SCOPE] Danh sách loại trừ tường minh**
* **Danh sách:** giải đấu · gợi ý nước đi khi đánh với máy · cộng giây sau mỗi nước · đổi chữ Hán sang chữ Việt · đổi email · **xoá tài khoản** (đã duyệt 03/10; nếu cần, xử lý thủ công theo yêu cầu, chưa có chức năng trong ứng dụng) · **báo cáo vi phạm, quản trị viên, khoá/cấm tài khoản** · **chặn người dùng riêng** (đã có cách thay thế ở `Quyết định 5.5`) · **tải ảnh đại diện** · **trang hồ sơ công khai riêng** · **đa ngôn ngữ** · **điều khoản sử dụng và chính sách quyền riêng tư** (rủi ro đã ghi nhận) · luật đuổi quân liên tục chi tiết (để Giai đoạn 2) · **đổi mật khẩu khi đang đăng nhập** (dùng Quên mật khẩu, `Quyết định 1.7`) · **bảng xếp hạng theo tuần/ngày hoặc theo mùa** (chỉ một bảng toàn thời gian, `Quyết định 7.1`).

---

## PHẦN 11: PHÂN KỲ PHẠM VI — P1 (MVP 2 TUẦN) VÀ P2 (LÀM SAU)

> Danh sách P1/P2 do agent đề xuất theo uỷ quyền của Product Owner ngày 03/10/2026 và **đã được Product Owner duyệt cùng ngày**, với một điều chỉnh: **mời bạn bè đang online vào phòng phải có ở P1** (nên hệ thống bạn bè tối thiểu thuộc P1). Product Owner có thể kéo bất kỳ mục nào từ P2 lên P1.
>
> **Tiêu chí hoàn thành P1 (Product Owner, 03/10/2026):** demo chạy được **8 mục tiêu cốt lõi từ đầu đến cuối** (end-to-end).

* **Căn cứ:** Product Owner (03/10/2026) xác định 8 mục tiêu cốt lõi cho nhóm 7 người trong khoảng 2 tuần, và cho phép agent tự chuyển các mục còn lại xuống P2. **P1** = những gì cần để 8 mục tiêu chạy được trọn vẹn. **P2** = mọi thứ còn lại; vẫn là đặc tả đã duyệt, **các luật P2 giữ nguyên hiệu lực khi được làm**, chỉ chưa làm trong 2 tuần này.
* **8 mục tiêu cốt lõi (nguyên văn ý Product Owner) và nơi định nghĩa:**

| # | Mục tiêu cốt lõi | Quyết định / thành phần phục vụ |
|---|---|---|
| 1 | Giao diện đăng ký / đăng nhập | 1.1 (đăng ký 3 bước OTP), đăng nhập Username + Mật khẩu, 1.8 (phiên); `SCR-LOGIN`, `SCR-REGISTER`, `SCR-PROFILE-SETTINGS` (chỉ Display Name và Đăng xuất) |
| 2 | Tạo phòng chơi game | 2.7, 2.8; `MODAL-CREATE-ROOM`, `SCR-WAITING-ROOM` |
| 3 | Mời bạn vào phòng (ngay trong game, gửi link, mã phòng) | 2.2 (Link + Mã 8 ký tự), 2.4 (tự chuyển vào phòng sau đăng nhập), 2.5 (**mời bạn bè đang online**), 5.5 (hệ thống bạn bè tối thiểu: tìm theo username, kết bạn hai chiều, trạng thái online/đang đấu, chuông lời mời kết bạn); `MODAL-INVITE`, `SCR-FRIENDS`. Nhắn tin 1-1 và Thách đấu là P2 |
| 4 | Khởi tạo bàn cờ | 3.1, 3.4 (bàn cờ SVG, quân chữ Hán, click/kéo thả, âm thanh) |
| 5 | Hai người đánh cờ qua mạng | 3.3, 3.5, 8.3 (phần mất kết nối), đồng hồ 5/10/15 phút (mặc định 10), Đầu hàng, Xin hòa; `SCR-GAME-ROOM`, `OVERLAY-RECONNECTING`, `MODAL-MATCH-RESULT` |
| 6 | Công khai (mọi người xem) / khoá không cho ai vào / khoá nhưng có mã vào xem; **tối đa 2 người xem** | 2.7 (`PUBLIC`, `CODE_ONLY` = có mã mới vào, `LOCKED` = không ai vào), 2.8, 4.2 (đuổi), 4.3; `PANEL-SPECTATORS`, `SCR-ACCESS-DENIED` |
| 7 | Chat 2 người + camera + mic; kênh chat người xem tách riêng | 4.1, 5.3 (2 kênh, giới hạn chat, bộ lọc từ cấm), 5.4 (3 mức chia sẻ); `PANEL-CHAT`, `PANEL-MEDIA` |
| 8 | Đánh với máy theo cấp độ | 6.1, 6.3 (3 cấp, chọn phe); `SCR-AI-GAME`, `MODAL-AI-SETUP` |

* **Làm sau (P2), đã chuyển khỏi P1:** Đánh Hạng toàn bộ (Elo, ghép trận Ranked, bảng xếp hạng, quy tắc Ranked, `Quyết định 7.1`, `7.2`, `8.1`, phần Ranked của `8.3`) · Ghép ngẫu nhiên Casual · chế độ Khách (1.3) · Google OAuth (1.2) · Quên/đặt lại mật khẩu (1.7) · Đổi username (1.6) · Chat 1-1 giữa bạn bè và Thách đấu (5.2, 8.2, nút "Nhắn tin"/"Thách đấu" ở `SCR-FRIENDS`) · Sticker (5.1) · Mã QR (2.2 phần QR) · Xin đi lại ở Đánh Thường (3.2, 3.6 phần đi lại) và đi lại với máy (6.3 phần Undo) · Xin đổi bên · Tái đấu · mức giờ "Không giới hạn" và cảnh báo chống treo ván · Lịch sử ván, Replay, FEN/PGN, lưu ván AI (6.2, 9.1) · widget AI, công cụ demo (9.2, 9.3) · `MODAL-MEDIA-TAB-SWITCH` · nâng trần người xem lên 5.
* **Quy tắc hiển thị tính năng P2 trong màn hình P1:** xem `DANH-MUC` §7 (lối vào điều hướng chính `DISABLED` + "Sắp ra mắt"; chức năng nằm sâu thì ẩn hẳn).
* **Hệ quả cho P1:**
  * Sảnh chỉ có: Tạo phòng, Vào phòng bằng mã, Danh sách phòng công khai, Đánh với máy. Thẻ **Đánh Hạng hiển thị `DISABLED`** kèm tooltip *"Sắp ra mắt"* (đúng `SCR-RULE-01`).
  * Đăng nhập chỉ Username + Mật khẩu; người dùng chưa có tài khoản vào link mời phải đăng ký trước (không có Khách ở P1).
  * Ván Đánh Thường **không có Elo** và ván có tài khoản **chưa lưu Lịch sử** ở P1; màn hình Lịch sử, Replay, Bảng xếp hạng chưa làm (màn hình Bạn bè **có** ở P1).
  * `MODAL-MATCH-RESULT` ở P1 chỉ có *Rời phòng* (không Tái đấu, không Xem lại).
* **Bạn bè ở P1 (tối thiểu):** `SCR-FRIENDS` có tìm kiếm, gửi/nhận lời mời, danh sách bạn kèm trạng thái. **Không có nút mời trên trang này**: ở P1 chỉ mời bạn bè online **trong một phòng**, qua `MODAL-INVITE` do người đang ngồi ghế của phòng đó thực hiện (không tự tạo phòng, vì tạo phòng rồi mời là Thách đấu, P2). Nút "Nhắn tin" và "Thách đấu" `DISABLED` kèm tooltip *"Sắp ra mắt"*; huy hiệu tin chưa đọc chưa có.
* **Ưu tiên theo thành phần:** xem cột "Ưu tiên" ở `DANH-MUC` §7 (23 thành phần P1, 14 thành phần P2).
* **Rủi ro đã ghi nhận:** 8 mục tiêu này vẫn gồm hai hạng mục khó (camera/mic qua LiveKit và máy cờ tự viết). Với 7 người trong 2 tuần nên chạy song song các nhóm việc từ đầu và có phương án dự phòng (ví dụ máy cờ chỉ làm cấp Dễ trước).

---

## BẢNG TỔNG HỢP TOÀN BỘ QUYẾT ĐỊNH KHÓA PHẠM VI (SCOPE FREEZE MATRIX)

| STT | Nghiệp Vụ Cốt Lõi | Quyết Định Đã Chốt | Phân Loại & Thứ Tự Ưu Tiên |
|:---:|---|---|:---:|
| 1 | **Chế độ Khách (Guest Mode)** | **[1B] Nút "Guest" nổi bật tại Login kèm ghi chú cấm tham gia Ranked Elo** | **P2 — làm sau MVP** |
| 2 | Kích hoạt Email | **[2B] Tài khoản chỉ được tạo/kích hoạt sau khi xác thực OTP email lúc đăng ký** (không có bước kích hoạt thứ hai; Email cũng dùng cho OTP đổi Username và quên mật khẩu) | **P1 — MVP 2 tuần** |
| 3 | **Đổi Username / Cố định Email** | **[1C] Đổi Username không giới hạn tần suất (Quy trình 4 bước qua OTP Supabase); Cấm đổi Email** | **P2 — làm sau MVP** |
| 4 | **Google OAuth Onboarding** | **[1D] Tạo tài khoản qua Google OAuth kết hợp thiết lập Username + Password** để đăng nhập kép linh hoạt | **P2 — làm sau MVP** |
| 5 | Đồng hồ thi đấu | **[3A] Giữ nguyên 4 mức giờ cố định (chỉ Đánh Thường; Ranked cố định 10 phút là ngoại lệ)**, không áp dụng luật cộng giây | **P1 — MVP 2 tuần** (5/10/15 phút; "Không giới hạn" là P2) |
| 6 | Chia sẻ phòng đấu | **[4B] Thêm Mã QR (QR Code)** trực quan bên cạnh Link mời và Mã 8 ký tự | **P1** (Link + Mã); **P2** (Mã QR) |
| 7 | Chữ trên quân cờ | **[5A] Giữ nguyên 100% quân chữ Hán** cổ điển, kết hợp viền trợ năng DT-21 | **P1 — MVP 2 tuần** |
| 8 | Giới hạn Undo phòng thường | **[6B] Giới hạn tối đa 3 lần Undo thành công / bên / ván** (chống spam) | **P2 — làm sau MVP** |
| 9 | Quyền Người xem | **[7A] Người xem chỉ Xem/Nghe + Chat Kênh Chung**, tuyệt đối không cấp quyền phát Mic/Cam | **P1 — MVP 2 tuần** |
| 10 | Đuổi người xem | **[8B] Cả hai người chơi đều được đuổi; chặn cho đến khi phòng đóng** (`status = CLOSED`) (đồng bộ với `Quyết định 4.2`) | **P1 — MVP 2 tuần** |
| 11 | Tương tác Chat | **[9B] Bổ sung khay 12 Sticker cảm xúc nhanh** (vỗ tay 👏, uống trà 🍵, cạn lời 🤐...) | **P2 — làm sau MVP** |
| 12 | **Chat riêng ngoài phòng** | **[9C / EC-02] Nhắn tin 1-1 chỉ giữa những người ĐÃ LÀ BẠN BÈ**, lưu lịch sử, unread badge | **P2 — làm sau MVP** |
| 13 | Gợi ý nước khi đấu AI| **[10A] Không làm gợi ý nước đi (No Hint)**, tập trung chất lượng AI 3 cấp | **P1 — MVP 2 tuần** |
| 14 | Lưu lịch sử ván AI | **[11B] Lưu đầy đủ ván AI vào Hồ sơ**, hỗ trợ xem lại (Replay) từng nước cờ | **P2 — làm sau MVP** |
| 15 | **Hệ thống Xếp hạng Elo** | **[12C] Điểm Elo chuẩn FIDE, Bảng xếp hạng Top 50 (đồng bộ với `Quyết định 7.1`), Ghép trận tự động Matchmaking** | **P2 — làm sau MVP** |
| 16 | **Quy tắc ván Ranked** | **[EC-01] Ghép ngẫu nhiên 100%; CẤM XEM (No Spectators); CẤM UNDO; Khách không được đấu; 10 phút Rapid** | **P2 — làm sau MVP** |
| 17 | **Rage Quit ván Ranked** | **[EC-03] Ân hạn 60s, quá hạn xử thua trừ Elo bình thường; sập server không đổi Elo** | **P2 — làm sau MVP** |
| 18 | Xuất FEN / PGN | **[13B] Nút Copy FEN và Download PGN** tại màn hình Replay | **Mở rộng (Stretch P2)** |
| 19 | **AI Debug Metrics** | **[P2 - Tool] Widget hiển thị số node, depth, thời gian tính của thuật toán AI** | **Mở rộng (Stretch P2)** |
| 20 | **Demo Admin Controls** | **[P2 - Tool] Phím tắt giả lập rớt mạng 60s và khôi phục phục vụ bảo vệ đồ án** (chỉ bật bằng cờ chế độ demo, không có vai trò Admin) | **Mở rộng (Stretch P2)** |
| 21 | **Quên / đặt lại mật khẩu & Phiên đăng nhập** | **[PWD-RESET] + [SESSION]** `Quyết định 1.7, 1.8` | **P1** (phiên); **P2** (quên mật khẩu) |
| 22 | **Hệ thống Bạn bè & Thông báo** | **[FRIENDS]** `Quyết định 5.5` (nền cho chat 1-1, mời vào phòng, Thách đấu) | **P1** (kết bạn, trạng thái, mời bạn bè online); **P2** (chat 1-1, Thách đấu) |
| 23 | **Luật cờ bổ sung & Hàng đợi/chống gian lận Ranked** (đã duyệt) | **[RULES-EXTRA] + [RANKED-GUARD] + [ROOM-SPEC]** `Quyết định 3.5, 7.2, 2.7` | **P1** (3.5, 2.7); **P2** (7.2) |
| 24 | **Ràng buộc chung & Danh sách loại trừ** (đã duyệt) | **[GLOBAL-CONSTRAINTS] + [OUT-OF-SCOPE]** `Quyết định 10.1, 10.2` | **P1 — MVP 2 tuần** |
| 25 | **Vào phòng, ghế/người xem, đề nghị trong ván, kết quả ván** (đã duyệt 03/10) | **[ROOM-ACCESS] + [PROPOSALS] + [RESULT-TYPES]** `Quyết định 2.8, 3.6, 7.3` (kèm sửa 1.2, 1.3, 1.4, 2.3, 4.3, 5.3, 6.2) | **P1** (2.8; Xin hòa trong 3.6); **P2** (7.3, Xin đi lại, Đổi bên) |
