# DANH MỤC & ĐẶC TẢ CHI TIẾT TOÀN BỘ MÀN HÌNH DỰ ÁN CỜ TƯỚNG ONLINE (XIANGQI)

**Tài liệu:** Kiến trúc Giao diện & Bản đồ Màn hình Chuẩn hóa (UI/UX Screen Inventory)  
**Dự án:** Cờ Tướng Trực Tuyến (`XIANGQI`)  
**Ngày cập nhật:** 03/10/2026 · **Phiên bản:** v1.1.0 (Scope Freeze, đã rà soát đồng bộ)  
**Căn cứ pháp lý:** Khóa cứng phạm vi theo [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md). Phần bổ sung của đợt rà soát 03/10/2026 đã được Product Owner duyệt. Các mã `R01`–`R21`, `ARCH-xx`, `SCR-RULE-xx` là nhãn kế thừa từ bộ tài liệu cũ; luật tương ứng đã viết bằng chữ ngay tại chỗ dùng.

---

## 1. TỔNG QUAN PHÂN TẦNG KIẾN TRÚC GIAO DIỆN

Hệ thống giao diện được thiết kế theo triết lý Cờ Tướng Cổ Điển (Design Tokens chuẩn gỗ `--color-wood`, giấy cổ `--color-paper`, mực đen `--color-ink`), tuân thủ chuẩn trợ năng **WCAG 2.1 AA**, chia thành **4 Lớp Kiến Trúc Khép Kín (Tổng cộng 37 thành phần = 15 + 15 + 4 + 3)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│       LỚP 1: 15 MÀN HÌNH ĐỊNH TUYẾN (ROUTED PAGES) · 14 URL            │
│  /login · /register · /forgot-password · /reset-password · /onboarding │
│  /lobby · /rooms/:id (WAITING + PLAYING = 2 màn, 1 URL) · /ai/:id      │
│  /leaderboard · /friends · /history · /history/:id · /settings         │
│  /access-denied                                                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ kích hoạt theo tương tác
┌──────────────────────────────────▼─────────────────────────────────────┐
│             LỚP 2: 15 CỬA SỔ MODAL TƯƠNG TÁC (INTERACTIVE MODALS)      │
│  Guest · Create Room · Invite · Room Settings · Matchmaking · AI Setup │
│  OTP Username · Direct Chat · Side Swap · Draw · Undo · Resign         │
│  Leave Match · Confirm Kick · Match Result                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ nằm trong các màn hình
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    LỚP 3: 4 KHUNG NHÚNG CHỨC NĂNG (EMBEDDED PANELS)    │
│  PANEL-NAVBAR · PANEL-CHAT · PANEL-MEDIA · PANEL-SPECTATORS            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ kích hoạt theo sự kiện máy chủ
┌──────────────────────────────────▼─────────────────────────────────────┐
│              LỚP 4: 3 LỚP PHỦ HỆ THỐNG & CẢNH BÁO (SYSTEM OVERLAYS)    │
│  ALERT-INACTIVITY-BANNER · OVERLAY-RECONNECTING · MODAL-MEDIA-SWITCH   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. NĂM TRẠNG THÁI BẮT BUỘC CHO MỌI MÀN HÌNH (`SCR-RULE-01`)
Mọi màn hình và khung dữ liệu bắt buộc phải được thiết kế và xử lý đầy đủ **5 trạng thái giao diện**:
1. **`SUCCESS` (Thành công):** Dữ liệu tải đầy đủ, tương tác mượt mà.
2. **`LOADING / SKELETON` (Đang tải):** Khung xương nhấp nháy mờ giữ chỗ, không giật layout, không để màn hình trắng trơn.
3. **`EMPTY` (Rỗng):** Hiển thị hình minh họa cờ tướng mờ, giải thích rõ nguyên nhân (ví dụ: *"Bạn chưa có ván cờ nào"*) kèm nút hành động (ví dụ: *"Chơi ván đầu tiên ngay"*).
4. **`ERROR` (Lỗi):** Báo lỗi tiếng Việt dễ hiểu, có nút *"Thử lại"* (Retry).
5. **`DISABLED` (Vô hiệu):** Nút/chức năng bị xám mờ bắt buộc phải có tooltip giải thích rõ lý do (ví dụ: *"Bạn đã dùng hết 3 lượt xin đi lại"*).

**Các quy tắc giao diện `SCR-RULE` đang dùng** (định nghĩa ở đây là duy nhất):
* `SCR-RULE-01`: đủ 5 trạng thái ở trên.
* `SCR-RULE-02`: hộp thoại thường đóng được bằng X, `Esc`, bấm ra ngoài; riêng `OVERLAY-RECONNECTING` và `SCR-ONBOARDING` không đóng tuỳ ý; khung đề nghị không modal theo `SCR-RULE-06`, không áp quy tắc đóng modal này.
* `SCR-RULE-03`: hộp xác nhận nguy hiểm đặt focus mặc định ở nút *Huỷ*.
* `SCR-RULE-04`: nút đang xử lý bị chặn bấm hai lần, hiện chữ *"Đang xử lý…"*.
* `SCR-RULE-05`: toast không bao giờ che nút Đầu hàng.
* `SCR-RULE-06`: khung Xin hòa/Xin đi lại là **không modal**, không giữ focus; X/Esc thu gọn, có nút mở lại, hạn và đồng hồ vẫn chạy. Từ chối là hành động riêng (BA 3.6, duyệt 04/10). Mã `MODAL-DRAW-PROMPT`/`MODAL-UNDO-PROMPT` giữ nguyên để bảo toàn tham chiếu, không diễn tả cơ chế focus.
* `SCR-RULE-07`: cảnh báo chống treo ván không modal, không che bàn cờ và nút Đầu hàng.

---

## 3. CHI TIẾT 15 TRANG ĐỊNH TUYẾN ĐỘC LẬP (ROUTED PAGES)

### 1. `SCR-LOGIN` — Trang Đăng Nhập
* **URL:** `/login` | **Quyền:** Chưa đăng nhập (đã đăng nhập tự redirect về `/lobby`). Nếu người dùng đến từ link/QR mời phòng thì sau khi đăng nhập hoặc chọn Guest tự chuyển vào đúng phòng (BA-SCOPE `Quyết định 2.4`).
* **Bố cục (Layout):** Khung Card chính giữa trên nền giấy ấm (`--color-paper`), hoa văn thủy mặc cờ tướng.
* **Thành phần & Dữ liệu:**
  * Logo Cờ Tướng truyền thống (帥/將) + Tiêu đề *"Kỳ Đài Đăng Nhập"*.
  * Form đăng nhập: Ô `Username:` (viết liền không dấu), Ô `Mật khẩu:` (icon ẩn/hiện mật khẩu).
  * Checkbox `Ghi nhớ đăng nhập`: Mặc định tick (phiên 30 ngày). Bỏ tick: phiên kết thúc khi đóng trình duyệt hoặc sau 12 giờ, tuỳ cái nào đến trước (BA-SCOPE `Quyết định 1.8`).
  * Nút `Đăng nhập` (Primary button).
  * Nút `Đăng nhập bằng Google` (Google OAuth 1 chạm).
  * **Nút `Guest` (Chơi nhanh) — Nằm riêng biệt nổi bật:**
    * Bấm vào mở `MODAL-GUEST-NAME` nhập tên tạm vào chơi ngay (phiên Khách tối đa 12 giờ, tên gắn nhãn "(Khách)", không cần duy nhất; quyền hạn xem BA-SCOPE `Quyết định 1.3`).
    * **Visual Note ngay dưới nút:** ⚠️ *"Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."*
  * Liên kết phụ: *"Quên mật khẩu?"* (`/forgot-password`), *"Đăng ký tài khoản mới"* (`/register`).

---

### 2. `SCR-REGISTER` — Trang Đăng Ký Tài Khoản (Wizard 3 Bước Trực Quan)
* **URL:** `/register` | **Quyền:** Khách chưa đăng nhập.
* **Bố cục (Layout):** Card trung tâm kèm thanh tiến trình stepper `1. Tài khoản` $\rightarrow$ `2. Email` $\rightarrow$ `3. Xác thực OTP`.
* **Chi tiết 3 bước:**
  * **Bước 1 (Username & Mật khẩu):**
    * Ô `Username:` (3–20 ký tự, `^[a-zA-Z0-9_]{3,20}$`, kiểm tra trùng lặp debounce 300ms).
    * Ô `Mật khẩu:` (tối thiểu 8 ký tự) + Ô `Xác nhận mật khẩu`.
    * Nút *"Tiếp tục"* $\rightarrow$ Chuyển Bước 2. Phía dưới có nút *"Đăng ký bằng Google"*.
  * **Bước 2 (Nhập Email):**
    * Ô `Email chính chủ:`.
    * Nút *"Xác nhận Email"* $\rightarrow$ Kích hoạt Supabase Auth gửi OTP 6 số và chuyển Bước 3. Nút *"Quay lại"*.
  * **Bước 3 (Xác thực Email qua mã OTP):**
    * Dòng thông báo: *"Mã OTP 6 số đã được gửi đến email [user-email]."*
    * 6 ô nhập mã OTP đơn lẻ, tự động nhảy tiêu điểm khi gõ.
    * Đồng hồ đếm lùi thời hạn mã: **3 phút (180 giây)**.
    * Nút *"Gửi lại mã OTP"* (kèm bộ đếm lùi 60 giây chống spam).
    * **Xử lý bảo mật:** Nhập sai nhiều lần bị giới hạn (mục tiêu 5 lần, theo BA-SCOPE `Quyết định 1.5`) $\rightarrow$ khóa form và bắt buộc chờ hoặc bấm gửi lại mã mới.
    * Tài khoản chỉ được tạo khi OTP đúng; bỏ dở thì không có tài khoản và username không bị giữ. Email đã đăng ký ở Bước 2 $\rightarrow$ báo *"Email này đã được đăng ký"*.
    * Nhập đúng OTP $\rightarrow$ Tài khoản chuyển sang `ACTIVE`, tự động gán `display_name = username` (Phương án C), tự động đăng nhập và đưa vào `/lobby`.

---

### 3. `SCR-FORGOT-PASSWORD` — Trang Quên Mật Khẩu
* **URL:** `/forgot-password` | **Quyền:** Tất cả.
* **Thành phần:** Ô nhập `Email đã đăng ký` + Nút `Gửi mã khôi phục` $\rightarrow$ Chuyển sang `/reset-password`. Luôn hiện cùng thông báo *"Nếu email này đã đăng ký, mã khôi phục đã được gửi"*; email chuyển giữa hai màn hình bằng trạng thái ứng dụng, **không đặt lên URL** (BA-SCOPE `Quyết định 1.7`).

---

### 4. `SCR-RESET-PASSWORD` — Trang Đặt Lại Mật Khẩu
* **URL:** `/reset-password` | **Quyền:** Người có mã khôi phục hợp lệ.
* **Thành phần:** 6 ô nhập mã OTP xác thực email (quy tắc OTP như `Quyết định 1.5`: 3 phút, giới hạn nhập sai, gửi lại sau 60 giây) + Ô `Mật khẩu mới` + Ô `Xác nhận mật khẩu mới` + Nút `Xác nhận đổi mật khẩu`. Đổi thành công $\rightarrow$ đăng xuất mọi phiên khác, về `/login`.

---

### 5. `SCR-ONBOARDING` — Trang Thiết Lập Tài Khoản Google OAuth
* **URL:** `/onboarding` | **Quyền:** Người dùng vừa bấm Đăng ký qua Google OAuth lần đầu.
* **Thành phần:**
  * Hiển thị Avatar & Email Google (Readonly).
  * Ô `Username:` (bắt buộc đặt tên duy nhất, 3–20 ký tự không dấu).
  * Ô `Mật khẩu dự phòng:` (để sau này có thể đăng nhập bằng `Username + Password` nếu không muốn dùng Google).
  * Miễn mã OTP (vì Google đã xác thực email an toàn).
  * Nút `Hoàn tất thiết lập` $\rightarrow$ Tự động gán `display_name = username` (không dùng Họ tên Google) $\rightarrow$ Chuyển thẳng vào `/lobby`. Màn hình không có nút X; thoát giữa chừng thì chưa có tài khoản.
  * **Kiểm tra trùng Email:** Nếu Gmail này đã có tài khoản trước đó, hiển thị lỗi rõ ràng: ⚠️ *"Email này đã được đăng ký"* và hướng dẫn quay lại trang đăng nhập.

---

### 6. `SCR-LOBBY` — Trang Sảnh Chính (Lobby Hub)

* **P1 bổ sung đã duyệt 04/10 (BA 10.4):** phần Luật chơi mở rộng/thu gọn trong Sảnh; nội dung từ docs/02, không trang/modal mới, không tăng số thành phần. Có nhãn và thao tác bàn phím, công bố rõ luật rút gọn.
* **URL:** `/lobby` | **Quyền:** Đã đăng nhập hoặc Khách. Nếu đang có ván/phòng dở, hiện banner *"Bạn có ván đang chơi dở — Quay lại"*; khi đang ngồi ghế ở một phòng, các nút Tạo phòng/Ghép/Tìm trận `DISABLED` kèm tooltip.
* **Bố cục (Layout):** Phân chia 3 phân vùng chế độ chơi rõ ràng:
  1. **ĐÁNH THƯỜNG (Casual Mode) — Trọng tâm giao lưu:**
     * Nút *"Ghép ngẫu nhiên"* (Casual Quick Match): Ghép nhanh giao lưu không tính Elo. Chọn 1 trong 4 mức giờ trước khi ghép (chỉ ghép cùng mức giờ), chờ tối đa 60 giây, có ghi chú *"Ván ghép ngẫu nhiên hiển thị công khai ở Sảnh"* (BA-SCOPE `Quyết định 2.0`).
     * Nút *"Tạo phòng"* (Custom Solo): Mở `MODAL-CREATE-ROOM`.
     * Ô *"Vào phòng bằng mã"*: Nhập mã 8 ký tự (VD: `K7M2-XQP4`) $\rightarrow$ Tham gia tức thì.
     * *Danh sách phòng đang có (Lobby Room List):*
       * Chỉ hiển thị các phòng ở chế độ **`PUBLIC` (Công khai)**.
       * Cột thông tin: Tên phòng, Chủ phòng, Mức giờ, Số người (`X/Y`, Y = 2 + số người xem tối đa của phòng, không quá 7), Nút *"Vào xem"* (luôn vào vai Người xem).
  2. **ĐÁNH HẠNG (Ranked Mode) — So tài nghiêm ngặt:**
     * Thẻ tóm tắt Rank cá nhân: Huy hiệu Rank, Điểm Elo hiện tại (VD: `1420 Elo`), Thứ hạng hiện tại, Tỷ lệ thắng.
     * Nút lớn: **"Tìm trận Xếp hạng" (Find Ranked Match)** $\rightarrow$ Mở `MODAL-MATCHMAKING`. (Khách bấm vào bị chặn nhắc đăng ký). Người chưa có ván Ranked nào thấy nhãn *"Chưa xếp hạng"*.
     * Bộ nhãn cam kết nghiêm ngặt: 🚫 *Ghép ngẫu nhiên 100%* | 🚫 *Cấm xem (No Spectators)* | 🚫 *Cấm Undo* | ⏱️ *10 phút Rapid*.
  3. **ĐÁNH VỚI MÁY (AI Mode) — Rèn luyện kỳ nghệ:**
     * 3 thẻ cấp độ: 🟢 **Dễ** (depth 2), 🟡 **Trung bình** (depth 4), 🔴 **Khó** (depth 6).
     * Bấm vào cấp độ $\rightarrow$ Mở `MODAL-AI-SETUP` để chọn phe cờ.

---

### 7. `SCR-WAITING-ROOM` — Trang Phòng Chờ Thi Đấu
* **URL:** `/rooms/:id` (khi phòng `status = WAITING`).
* **Bố cục (Layout):** Ở giữa là 2 Ghế đấu lớn; Phía dưới là Cụm nút Sẵn sàng/Đổi bên/Chia sẻ; Phía phải là Khung chat phòng chờ.
* **Thành phần & Vận hành:**
  * Host mặc định ngồi **ghế ĐỎ**; khi chỉ có một mình, Host bấm nút *"Đổi ghế"* để chuyển sang ghế Đen hoặc đổi qua lại tự do.
  * Người thứ 2 vào phòng tự động xếp vào ghế còn trống. Người ngồi ghế có nút *"Chuyển sang người xem"*; Host có thêm *"Chuyển sang người xem"* (cho người đang ngồi ghế) và *"Mời xuống ghế"* (cho người xem khi còn ghế trống). Không đổi chỗ khi ván đang diễn ra (BA-SCOPE `Quyết định 2.8`, đã duyệt 03/10).
  * Trong **CASUAL**, khi một người rời lúc phòng `FINISHED`, phòng quay về `WAITING`; người còn lại giữ ghế và quyền Host (BA-SCOPE `Quyết định 2.3` mục 8).
  * Nút *"Xin đổi bên"*: Gửi `MODAL-SIDE-SWAP-PROMPT` cho đối thủ (hạn 30s). Đồng ý $\rightarrow$ Hoán đổi ghế và **trạng thái Sẵn sàng của cả 2 bên tự động reset về Chưa sẵn sàng (`ready = false`)**.
  * Nút *"Sẵn sàng"* (Ready): Từng bên bấm sẵn sàng. Khi **cả hai cùng sẵn sàng**: Màn hình kích hoạt đếm ngược **3... 2... 1...** kèm âm thanh cờ gỗ rồi tự động chuyển sang `/rooms/:id` (`status = PLAYING`).
  * Nút *"Chia sẻ phòng"*: Mở `MODAL-INVITE`.
  * Nút *"Cài đặt phòng"* (Chỉ Host thấy): Mở `MODAL-ROOM-SETTINGS`.
  * Xử lý Host rời phòng: Máy chủ **tự động chuyển quyền Host cho người thứ 2** (`Host Transfer`).

---

### 8. `SCR-GAME-ROOM` — Trang Thi Đấu Cờ Tướng Trực Tiếp
* **URL:** `/rooms/:id` (khi phòng `status = PLAYING` hoặc `FINISHED`).
* **RANKED sau ván:** giữ màn kết quả; Rời phòng mới giải phóng vị trí để tìm trận khác. Một người rời không mở phòng chờ cho người còn lại; không Sẵn sàng/Tái đấu/nhận người mới. Hết 10 phút hoặc cả hai rời thì đóng (BA 7.2).
* **Bố cục (Layout 3 cột):**
  * **Cột trái:** Khung Media Face cam 2 người chơi (`PANEL-MEDIA`), Thẻ thông tin người chơi, Đồng hồ đếm lùi thời gian của 2 bên.
  * **Cột giữa:** Bàn cờ SVG 90 giao điểm chuẩn, Dòng trạng thái lượt đi, Cụm công cụ ván cờ.
  * **Cột phải:** Danh sách người xem (`PANEL-SPECTATORS` ở phòng thường), Khung chat 2 kênh (`PANEL-CHAT`).
* **Tương tác bàn cờ:**
  * Bàn cờ SVG 90 giao điểm chuẩn, 100% quân cờ chữ Hán gỗ cổ điển, tọa độ `GR-COORD`. Tự lật bàn cờ khi cầm quân Đen.
  * Hỗ trợ song song 2 cách đi cờ: **Click-to-Move** và **Kéo thả chuột (Drag & Drop)** với hiệu ứng trượt mượt về chỗ cũ nếu thả sai ô.
  * *Bộ 3 hiệu ứng thị giác:* Chấm tròn ô đi hợp lệ; Vòng cố định bao quanh quân đối phương có thể ăn; 4 góc vuông đánh dấu nước vừa đi (`Last Move`); Vòng cảnh báo quanh Tướng bị chiếu kèm chữ "Đang bị chiếu" (`Check`, không nhấp nháy, không rung). Màu và hình dạng cụ thể: `DESIGN.md` §7.4.
  * *Cụm nút công cụ ván cờ:*
    * Nút Mute/Unmute âm thanh Web Audio API.
    * Nút *"Đầu hàng"* $\rightarrow$ Mở `MODAL-CONFIRM-RESIGN`.
    * Nút *"Xin hòa"* $\rightarrow$ Gửi `MODAL-DRAW-PROMPT` cho đối phương (hạn 30s). Bị từ chối thì 5 nước sau mới xin lại được; ở Ranked chỉ bấm được khi mỗi bên đã đi ≥ 20 nước (tooltip nêu lý do khi `DISABLED`).
    * Nút *"Xin đi lại"* (Undo): Ván Ranked bị ẩn hoàn toàn (CẤM UNDO); Phòng thường hiển thị số lượt còn lại (tối đa 3 lần thành công/bên/ván), gửi `MODAL-UNDO-PROMPT`.

---

### 9. `SCR-AI-GAME` — Trang Đấu Cờ Với Máy (AI)
* **URL:** `/ai/:id` | **Quyền:** Người chơi của ván đấu.
* **Bố cục:** Tinh gọn, chỉ gồm Bàn cờ SVG lớn và Thẻ Người chơi vs Thẻ Máy cờ.
* **Quy chuẩn vận hành:**
  * **Đồng hồ thi đấu:** Hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi; máy cờ tính toán phản hồi nhanh theo cấp độ (Khó $\le 3000$ms). Không áp dụng cơ chế chống treo ván R17.
  * **Nút "Đi lại" (Undo):** Bấm lùi ngay **1 cặp nước đi (2 plies: 1 nước máy + 1 nước người)** ngay lập tức không cần máy đồng ý. Hiển thị nhãn *"Lượt đi lại: X/3"*, hết 3 lần nút bị `DISABLED`. Nếu máy đang nghĩ: huỷ tác vụ và chỉ lùi nước vừa đi của người chơi, vẫn tính một lượt (AC-HIS-03-02, P2).
  * Không có nút gợi ý nước đi (No Hint). Không có nút Xin hòa (chỉ có Đầu hàng). Cầm Đen mà người chơi chưa đi nước nào thì nút "Đi lại" `DISABLED` kèm tooltip. Ván bỏ dở được giữ 30 phút (vào lại `/ai/:id`), quá hạn lưu là "Bỏ dở". Ván AI không tính Elo; ván của Khách không lưu.
  * Ván cờ (của tài khoản chính thức) kết thúc tự động lưu vào Lịch sử ván và mở `MODAL-MATCH-RESULT` có nút xem lại (Replay).
  * *(Stretch P2):* Widget nhỏ hiển thị thông số AI Debug (số node duyệt, depth, độ trễ tính toán ms).

---

### 10. `SCR-LEADERBOARD` — Trang Bảng Xếp Hạng Người Chơi
* **URL:** `/leaderboard` | **Quyền:** Tất cả người dùng.
* **Thành phần:**
  * Bảng danh sách vinh danh **Top 50 người chơi** có điểm Elo cao nhất toàn server (#1 đến #50, Top 3 có cúp Vàng/Bạc/Đồng, Avatar, Display Name, Danh hiệu Rank, Elo, Thắng/Thua/Hòa, Tỷ lệ thắng).
  * **Dòng ghim vị trí cá nhân cố định (Sticky User Row):** Luôn ghim ở đáy bảng, hiển thị vị trí hiện tại của chính người dùng (VD: *Hạng #142 - Avatar - Display Name - 1280 Elo - Cấp Trung cấp*). Chỉ tài khoản có ≥ 5 ván Ranked hoàn tất mới lên bảng; người chưa đủ thấy *"Chưa xếp hạng — cần thêm X ván"*. Đồng điểm: nhiều thắng hơn xếp trước, rồi đạt mức Elo sớm hơn. Bấm tên một người mở thẻ tóm tắt có nút *Kết bạn* (không có trang hồ sơ công khai).

---

### 11. `SCR-FRIENDS` — Trang Quản Lý Bạn Bè & Thách Đấu
* **URL:** `/friends` | **Quyền:** Người dùng đã đăng nhập.
* **Thành phần:**
  * Ô tìm kiếm người dùng theo `username` $\rightarrow$ Nút *"Kết bạn"*. Khách không dùng được màn hình này. Giới hạn 200 bạn, 50 lời mời chờ; bị cùng một người từ chối 2 lần thì không gửi lại được (BA-SCOPE `Quyết định 5.5`).
  * Tab 1: *"Danh sách bạn bè"* (`status = ACCEPTED`): Avatar, Display Name, @username, Điểm Elo, Trạng thái 🟢 *Online* / 🟠 *Đang đấu* / ⚫ *Offline*. Nút *"Thách đấu"* (chỉ sáng khi 🟢 Online; = mở form Tạo phòng, nhập tên, mặc định 10 phút/CODE_ONLY/2 người xem; xác nhận mới tạo và gửi mời theo BA 2.7). **Ở P1** nút "Thách đấu" và "Nhắn tin" `DISABLED` kèm tooltip *"Sắp ra mắt"*; trang này **không có nút mời vào phòng**; mời bạn bè online chỉ qua `MODAL-INVITE` bên trong phòng. Mở `MODAL-DIRECT-CHAT` bằng nút *"Nhắn tin"* là P2.
  * Tab 2: *"Lời mời kết bạn đang chờ"*: Danh sách yêu cầu gửi đến kèm nút *"Chấp nhận"* và *"Từ chối"*.

---

### 12. `SCR-HISTORY` — Trang Lịch Sử Ván Đấu Cá Nhân
* **URL:** `/history` | **Quyền:** Người dùng đã đăng nhập.
* **Thành phần:** Bộ lọc danh mục (*Tất cả / Đánh Hạng / Đánh Thường / Đấu với Máy*). Danh sách ván cờ hiển thị: Thẻ loại ván, Tên/Avatar đối thủ, Phe cờ, Kết quả (kèm lý do kết thúc), Biến động Elo (nếu có), Nhãn riêng *"Bị gián đoạn"* / *"Bỏ dở"* (không tính thắng/thua/hòa, không đổi Elo; BA-SCOPE `Quyết định 7.3`), Nút 👁️ *"Xem lại ván cờ"* $\rightarrow$ Chuyển sang `/history/:id`.

---

### 13. `SCR-REPLAY` — Trang Xem Lại Ván Cờ Từng Nước Đi
* **Quyền:** Chỉ 2 người chơi của ván xem được, từ Lịch sử; người xem không; không có link chia sẻ; ván Ranked cũng riêng tư. Hiển thị chuỗi nước đi hiệu lực (không hiện nước đã đi lại).
* **URL:** `/history/:id` hoặc `/rooms/:id/replay/:matchId`.
* **Bố cục (Layout):** Nửa trái là Bàn cờ SVG; Nửa phải là Bảng biên bản danh sách toàn bộ nước đi chuẩn cờ tướng (VD: `1. Pháo 2 bình 5 - Mã 8 tiến 7`).
* **Công cụ Replay:** Các nút tua `|<<`, `<`, `>`, `>>|`, nút `▶️ Tự động phát` (1.5s/nước), click trực tiếp vào dòng nước cờ để nhảy thế cờ. *(Stretch P2: Nút Sao chép FEN & Tải file PGN)*.

---

### 14. `SCR-ACCESS-DENIED` — Trang Báo Lỗi Từ Chối Truy Cập
* **URL:** `/access-denied` (hoặc hiển thị toàn màn hình khi có sự cố truy cập).
* **Các kịch bản hiển thị:**
  * ⚠️ *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* (sức chứa = 2 người chơi + số người xem tối đa của phòng)
  * ⚠️ *"Ván thi đấu Xếp hạng không cho phép người xem vào xem!"*
  * ⚠️ *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"*
  * Nút hành động duy nhất: *"Quay về Sảnh chính"* (`/lobby`).

---

### 15. `SCR-PROFILE-SETTINGS` — Trang Cài Đặt Hồ Sơ & Đổi Username
* **URL:** `/settings` | **Quyền:** Đã đăng nhập (Yêu cầu phiên hợp lệ).
* **Bố cục (Layout):** Header cố định, Card thông tin người chơi cá nhân, Form chỉnh sửa hồ sơ.
* **Thành phần & Dữ liệu:**
  * Avatar chữ cái đầu/hình đại diện, Display Name, Username (`@username`), Email liên kết, Điểm Elo hiện tại.
  * Form cập nhật Display Name (đổi tự do, không cần OTP).
  * Nút `🔑 Đổi Username Qua OTP`: Mở `MODAL-OTP-USERNAME` để thực hiện quy trình 4 bước xác thực OTP qua email. Username cũ bị khoá 30 ngày sau khi đổi (BA-SCOPE `Quyết định 1.4`).
  * **P1:** chỉ Kỳ Đài Cổ Phong, ẩn bộ chọn. **P2:** Kỳ Đài Cổ Phong / Giấy Sáng / Theo hệ thống (mặc định Kỳ Đài Cổ Phong), theo BA 10.3 và DESIGN §2.3.
  * Avatar luôn tự sinh từ chữ cái đầu Display Name (không tải ảnh lên).
  * Không có chức năng xoá tài khoản trong ứng dụng ở giai đoạn này (đã duyệt 03/10).
  * Nút `Đăng Xuất` (`SCR-LOGIN`).

---

## 4. CHI TIẾT 15 HỘP THOẠI / KHUNG TƯƠNG TÁC

Hai khung Xin hòa/Xin đi lại giữ mã kế thừa `MODAL-*` nhưng **không modal**; các hộp còn lại áp quy tắc modal tương ứng.

1. **`MODAL-GUEST-NAME` (Nhập Tên Khách Tạm Thời):** Mở từ nút Guest tại `SCR-LOGIN`. Nhập Display Name tạm (2–20 ký tự, có dấu tiếng Việt, qua bộ lọc từ cấm, không cần duy nhất). Nhắc nhở cấm đánh Ranked và không lưu lịch sử. Nút *"Vào chơi"* và *"Hủy"*.
2. **`MODAL-CREATE-ROOM` (Thiết Lập Tạo Phòng):** Mở từ `SCR-LOBBY`. Nhập tên phòng (1–60 ký tự, qua bộ lọc từ cấm), chọn thời gian (Không giới hạn, 5p, 10p, 15p - không cộng giây; không đổi được sau khi tạo), chọn chế độ (`PUBLIC` hoặc `CODE_ONLY`; `LOCKED` không chọn được lúc tạo; ý nghĩa ở BA-SCOPE `Quyết định 2.7`), chọn **Người xem**: *Không có người xem* hoặc tối đa 1–5 (**mặc định 5**, không đổi sau khi tạo).
3. **`MODAL-INVITE` (Chia Sẻ Phòng Đa Kênh):** Mở từ phòng chờ/thi đấu. Một lần bấm tạo đủ 3 hình thức (cùng một quyền vào phòng, không phân biệt xem/chơi); chỉ 2 người chơi thấy nút này. Gồm: Khối hiển thị Mã QR (nút tải/sao chép ảnh), Khối Link URL (Auto-Redirect sau login/guest), Khối Mã 8 ký tự monospace, Tab mời bạn bè Online.
4. **`MODAL-ROOM-SETTINGS` (Cài Đặt Phòng Động):** Chủ phòng đổi giữa `PUBLIC`, `CODE_ONLY`, `LOCKED`; **`LOCKED` chỉ bật được khi đã đủ 2 người chơi** (trước đó nút `DISABLED` kèm tooltip), người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi 60 giây, người xem 5 phút). Đổi sang `LOCKED`: Ẩn sảnh, chặn người mới, **giữ nguyên người xem đang có trong phòng**.
5. **`MODAL-MATCHMAKING` (Hàng Đợi Tìm Trận Ranked):** Radar quét đối thủ theo Elo ($\Delta Elo \le 100$, $\pm 50$ mỗi 10s), đồng hồ đếm giây. Nút *"Hủy tìm trận"* (hủy tự do khi chưa thấy đối thủ; khóa nút khi `MATCH_FOUND`).
6. **`MODAL-AI-SETUP` (Chọn Cấp Độ & Phe Cờ AI):** Mở từ Sảnh. Chọn cấp độ Dễ/Trung bình/Khó. Chọn phe cờ: 🔴 Đỏ (đi trước), ⚫ Đen (đi sau - máy tự đi nước đầu), 🎲 Ngẫu nhiên (50/50).
7. **`MODAL-OTP-USERNAME` (Xác Thực OTP Đổi Username):** Mở từ Cài đặt hồ sơ. Quy trình 4 bước: 1) Bấm đổi $\rightarrow$ 2) Nhập 6 số OTP (hạn 3p, giới hạn nhập sai) $\rightarrow$ 3) Xác thực mở khóa $\rightarrow$ 4) Nhập username mới và xác nhận.
8. **`MODAL-DIRECT-CHAT` (Khung Chat Riêng 1-1 Bạn Bè):** Mở từ `SCR-FRIENDS`. Ràng buộc bạn bè chính thức (`status = ACCEPTED`). Lịch sử tin nhắn, bộ lọc từ cấm `***`, khay 12 sticker cờ tướng.
9. **`MODAL-SIDE-SWAP-PROMPT` (Nhận Đề Nghị Đổi Bên):** Hiện phía người nhận khi đối thủ xin đổi bên trong phòng chờ. Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý"* và *"Từ chối"*.
10. **`MODAL-DRAW-PROMPT` (Nhận Đề Nghị Xin Hòa):** Hiện phía người nhận khi đối thủ xin hòa trong ván. Đồng hồ đếm lùi **30 giây**. Nút *"Chấp nhận Hòa"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
11. **`MODAL-UNDO-PROMPT` (Nhận Đề Nghị Xin Đi Lại):** Hiện phía người nhận khi đối thủ bấm xin đi lại trong phòng thường. Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý cho đi lại"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
12. **`MODAL-CONFIRM-RESIGN` (Xác Nhận Đầu Hàng):** Cảnh báo rõ ràng: *"Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức (và bị trừ điểm Elo nếu là ván Ranked)."*
13. **`MODAL-CONFIRM-LEAVE` (Xác Nhận Rời Phòng Khi Đang Đấu):** Cảnh báo: *"Rời phòng lúc này được tính là ĐẦU HÀNG (xử Thua; ở Đánh Hạng còn trừ điểm Elo, Đánh Thường và Đánh với máy không đổi Elo)."* Nút *"Rời phòng"* và *"Ở lại"*.
14. **`MODAL-CONFIRM-KICK` (Xác Nhận Đuổi Người Xem):** Mở khi Host hoặc người chơi còn lại bấm Kick. Thông báo: *"Người này sẽ bị chặn không thể vào lại phòng cho đến khi phòng đóng."*
15. **`MODAL-MATCH-RESULT` (Kết Quả Ván Cờ):** Biểu ngữ Thắng/Thua/Hòa kèm lý do (Checkmate, Stalemate, Resign, Timeout, Disconnect, Inactivity, Draw 3-rep, Draw agreement, Draw no-capture, Perpetual check, Interrupted). Biến động Elo (Ranked). Cụm nút: 🔄 *Tái đấu (tự hoán bên Đỏ/Đen; không có ở ván Ranked)*, 📜 *Xem lại (Replay)*, 🚪 *Rời phòng*.

---

## 5. CHI TIẾT 4 KHUNG NHÚNG CHỨC NĂNG (EMBEDDED PANELS)

1. **`PANEL-NAVBAR` (Thanh Điều Hướng Header):** Cố định đầu mọi trang. Logo, Điều hướng (Sảnh, Bảng Xếp Hạng, Bạn bè, Lịch sử), Huy hiệu Elo cá nhân, Icon Chuông báo lời mời kết bạn, huy hiệu tổng **tin đến** chưa đọc từ bạn hiện tại (đánh dấu khi tin hiển thị trong vùng nhìn ở tab hoạt động, BA 5.2), Avatar + Tên hiển thị (`Display Name`) kèm menu con Cài đặt hồ sơ.
2. **`PANEL-CHAT` (Khung Chat 2 Kênh & Sticker):** Nằm ở cột phải `SCR-GAME-ROOM`. Chat phòng xoá khi phòng đóng; **phòng Đánh Hạng (P2) chỉ có `[Kênh Riêng]`, không có `[Kênh Chung]` và người xem** (BA 5.4, 7.2); `[Kênh Riêng]` chỉ hiện cho 2 người đang ngồi ghế (người đổi chỗ sau không đọc tin cũ), người xem mới chỉ thấy `[Kênh Chung]` từ lúc vào. 2 tab: `[Kênh Riêng]` (chỉ 2 người chơi, mặc định mở cho người chơi) và `[Kênh Chung]` (cả người chơi và người xem, người xem chỉ thấy tab này). Công tắc ẩn Kênh Chung. Bộ lọc từ cấm `***`. Khay 12 Sticker cờ tướng 1 chạm.
3. **`PANEL-MEDIA` (Khung Camera Face Cam & Micro LiveKit SFU):** Nằm ở cột trái `SCR-GAME-ROOM`. 2 video trực tiếp SFU của 2 người chơi. Nút Bật/Tắt độc lập Cam & Mic (kèm 3 mức chia sẻ **chung cho camera và mic đang bật**: Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem; Ranked chỉ có 2 mức đầu). Ở Ranked hình/tiếng đối thủ mặc định ẩn, có nút *"Hiện"* và *"Tắt ngay"*. Người xem tuyệt đối cấm bật cam/mic (chỉ xem/nghe). Ván Ranked mở tự do cho 2 người chơi giao lưu.
4. **`PANEL-SPECTATORS` (Danh Sách Người Xem Trong Phòng Thường):** Nằm ở cột phải `SCR-GAME-ROOM` (phòng Ranked cấm xem 100% nên không có). Tiêu đề: *"Người xem (X / N)"* (N = số người xem tối đa của phòng: 1–5). Cả Chủ phòng và người chơi còn lại đều thấy và có quyền bấm nút *"Kick"* cạnh tên mỗi người xem.

---

## 6. CHI TIẾT 3 LỚP PHỦ HỆ THỐNG & CẢNH BÁO BẮT BUỘC (SYSTEM OVERLAYS)

1. **`ALERT-INACTIVITY-BANNER` (Cảnh Báo Chống Treo Ván R17):** Banner cam nổi bật ngay trên bàn cờ ván không giới hạn giờ khi quá 3 phút không đi cờ. **Không trap focus, không che bàn cờ, không che nút Đầu hàng (`SCR-RULE-07`)**. Đếm ngược **30 giây** (không nhấp nháy, theo `DESIGN.md` §4) + Nút *"Tôi còn đây"*. Hết 30s im lặng $\rightarrow$ Xử thua `INACTIVITY`.
2. **`OVERLAY-RECONNECTING` (Lớp Phủ Mất Kết Nối Toàn Cục):** Phủ mờ toàn màn hình khi đứt kết nối Socket.IO. Không đóng được bằng Esc (`SCR-RULE-02`). **Nội dung theo vai trò (rà soát cuối):** (a) *người chơi đang đấu online*: đếm ngược ân hạn **60 giây**, nối lại thì tự tắt, quá 60s xử thua `DISCONNECT`, đồng hồ ván vẫn chạy (hết giờ trước thì `TIMEOUT`); (b) *người chơi ở phòng chờ hoặc phòng đã kết thúc*: giữ ghế 60 giây rồi mất ghế, **không** xử thua; (c) *người xem*: giữ chỗ 5 phút rồi mất chỗ, không xử thua; (d) *ván với máy*: giữ ván 30 phút, không xử thua. Quy tắc gốc: BA-SCOPE `Quyết định 8.3`.
3. **`MODAL-MEDIA-TAB-SWITCH` (Cảnh Báo Độc Quyền Thiết Bị Media Đa Tab):** Popup cảnh báo khi mở 2 tab cùng lúc và bấm bật mic/cam ở tab thứ hai (`ARCH-11`). Nút *"Chuyển thiết bị sang tab này"* (thu hồi tab cũ) và nút *"Hủy bỏ"*.

---

## 7. BẢNG MA TRẬN 37 THÀNH PHẦN TOÀN DIỆN

**Ưu tiên (đã duyệt 03/10):** P1 = làm trong MVP 2 tuần (23 thành phần), P2 = làm sau (14 thành phần). Cách phân kỳ và lý do: BA-SCOPE `Phần 11`. Màn hình P2 vẫn giữ nguyên đặc tả bên trên.

**Quy tắc hiển thị tính năng P2 bên trong thành phần P1 (rà soát cuối):**
* **Lối vào cấp điều hướng chính** (thẻ Đánh Hạng ở Sảnh, mục Lịch sử và Bảng xếp hạng ở thanh điều hướng, nút Khách và Google ở đăng nhập, nút Nhắn tin và Thách đấu ở Bạn bè) hiển thị `DISABLED` kèm tooltip *"Sắp ra mắt"*.
* **Chức năng nằm sâu trong màn hình P1** (Mã QR, Sticker, Xin đi lại, Xin đổi bên, Tái đấu, Xem lại ở kết quả ván, đi lại với máy, Lưu lịch sử, widget AI) **ẩn hoàn toàn** ở P1, không để nút xám.
* Ngoại lệ duy nhất cho quy tắc "nút dẫn tới màn P2": `MODAL-MATCH-RESULT` ở P1 chỉ có *Rời phòng* (không hiện Xem lại).

| STT | Mã Thành Phần | Tên Gọi Nghiệp Vụ | Phân Loại | Vị Trí / URL | Ưu tiên |
|:---:|---|---|:---:|---|:---:|
| 1 | `SCR-LOGIN` | Đăng nhập hệ thống & Nút Guest có note cấm Rank | Routed Page | `/login` | **P1** |
| 2 | `SCR-REGISTER` | Đăng ký tài khoản (Wizard 3 bước OTP 3 phút) | Routed Page | `/register` | **P1** |
| 3 | `SCR-FORGOT-PASSWORD` | Quên mật khẩu hệ thống | Routed Page | `/forgot-password` | P2 |
| 4 | `SCR-RESET-PASSWORD` | Đặt mật khẩu mới qua mã OTP email | Routed Page | `/reset-password` | P2 |
| 5 | `SCR-ONBOARDING` | Đăng ký Google OA tạo Username + Password | Routed Page | `/onboarding` | P2 |
| 6 | `SCR-LOBBY` | Sảnh chính (3 Chế độ: Thường, Hạng, Máy) | Routed Page | `/lobby` | **P1** |
| 7 | `SCR-WAITING-ROOM` | Phòng chờ, đổi ghế solo, đếm 3s, nhượng Host | Routed Page | `/rooms/:id` (`WAITING`) | **P1** |
| 8 | `SCR-GAME-ROOM` | Bàn cờ SVG thi đấu, 2 cách đi, đồng hồ, thao tác | Routed Page | `/rooms/:id` (`PLAYING`) | **P1** |
| 9 | `SCR-AI-GAME` | Bàn cờ đấu với Máy, không giới hạn giờ, Undo 3 lần | Routed Page | `/ai/:id` | **P1** |
| 10 | `SCR-LEADERBOARD` | Bảng Xếp Hạng Top 50 & Dòng ghim rank cá nhân | Routed Page | `/leaderboard` | P2 |
| 11 | `SCR-FRIENDS` | Quản lý bạn bè, Online/Offline, Thách đấu trực tiếp | Routed Page | `/friends` | **P1** |
| 12 | `SCR-HISTORY` | Lịch sử ván đấu cá nhân (lọc Rank/Casual/Máy) | Routed Page | `/history` | P2 |
| 13 | `SCR-REPLAY` | Xem lại ván cờ từng nước, bảng biên bản, auto-play | Routed Page | `/history/:id` | P2 |
| 14 | `SCR-ACCESS-DENIED` | Màn hình từ chối truy cập (Phòng đầy, Cấm xem) | Routed Page | `/access-denied` | **P1** |
| 15 | `SCR-PROFILE-SETTINGS` | Cài đặt hồ sơ cá nhân & Đổi Username qua OTP | Routed Page | `/settings` | **P1** |
| 16 | `MODAL-GUEST-NAME` | Nhập Tên hiển thị tạm thời cho Khách (2-20 ký tự) | Modal Dialog | Nổi trên `SCR-LOGIN` | P2 |
| 17 | `MODAL-CREATE-ROOM` | Thiết lập Tạo phòng thi đấu (4 mức thời gian) | Modal Dialog | Mở từ `SCR-LOBBY` | **P1** |
| 18 | `MODAL-INVITE` | Chia sẻ phòng: Mã QR, Link URL, Mã 8 ký tự, Bạn bè | Modal Dialog | Mở từ phòng chờ/thi đấu | **P1** |
| 19 | `MODAL-ROOM-SETTINGS` | Đổi chế độ phòng động (Khóa phòng giữ khách cũ) | Modal Dialog | Mở bởi Host | **P1** |
| 20 | `MODAL-MATCHMAKING` | Hàng đợi tìm trận Ranked ngẫu nhiên (Hủy tự do) | Modal Dialog | Mở từ `SCR-LOBBY` | P2 |
| 21 | `MODAL-AI-SETUP` | Chọn cấp độ AI (Dễ/Trung bình/Khó) & Phe cờ (Đỏ/Đen/Random)| Modal Dialog | Mở từ `SCR-LOBBY` | **P1** |
| 22 | `MODAL-OTP-USERNAME` | Xác thực OTP 4 bước Đổi Username trong Hồ sơ | Modal Dialog | Mở từ `SCR-PROFILE-SETTINGS`| P2 |
| 23 | `MODAL-DIRECT-CHAT` | Khung Chat riêng 1-1 giữa Bạn bè chính thức (R21) | Floating/Modal | Nổi góc phải hoặc từ Bạn bè | P2 |
| 24 | `MODAL-SIDE-SWAP-PROMPT`| Nhận đề nghị đổi phe cờ Đỏ/Đen (hạn 30s) | Modal Prompt | Mở phía đối thủ phòng chờ | P2 |
| 25 | `MODAL-DRAW-PROMPT` | Nhận đề nghị xin hòa cờ trong ván (hạn 30s) | Non-modal Prompt | Mở phía đối thủ trong ván | **P1** |
| 26 | `MODAL-UNDO-PROMPT` | Nhận đề nghị xin đi lại (hạn 30s, trần 3 lần) | Non-modal Prompt | Mở phía đối thủ trong ván | P2 |
| 27 | `MODAL-CONFIRM-RESIGN` | Xác nhận đầu hàng ván cờ (cảnh báo thua ngay) | Modal Dialog | Mở khi bấm Đầu hàng | **P1** |
| 28 | `MODAL-CONFIRM-LEAVE` | Xác nhận rời phòng khi đang đấu (xử thua) | Modal Dialog | Mở khi bấm Rời phòng | **P1** |
| 29 | `MODAL-CONFIRM-KICK` | Xác nhận đuổi người xem (chặn vào lại đến đóng phòng)| Modal Dialog | Mở khi bấm Kick người xem | **P1** |
| 30 | `MODAL-MATCH-RESULT` | Báo kết quả ván cờ, Elo, Tái đấu hoán bên, Replay | Modal Dialog | Tự mở khi ván kết thúc | **P1** |
| 31 | `PANEL-NAVBAR` | Thanh điều hướng Header toàn cục + Icon thông báo | Embedded Panel| Cố định đầu mọi trang | **P1** |
| 32 | `PANEL-CHAT` | Khung chat 2 kênh, bộ lọc từ cấm `***`, 12 sticker | Embedded Panel| Cột phải `SCR-GAME-ROOM` | **P1** |
| 33 | `PANEL-MEDIA` | Face cam & Mic LiveKit SFU 2 người chơi (3 mức chia sẻ) | Embedded Panel| Cột trái `SCR-GAME-ROOM` | **P1** |
| 34 | `PANEL-SPECTATORS` | Danh sách người xem (tối đa N, 1–5) + nút Kick cho 2 bên | Embedded Panel| Cột phải `SCR-GAME-ROOM` | **P1** |
| 35 | `ALERT-INACTIVITY-BANNER`| Cảnh báo chống treo ván R17 đếm 30s không modal | System Alert | Banner nổi trên bàn cờ | P2 |
| 36 | `OVERLAY-RECONNECTING` | Lớp phủ mất kết nối Socket.IO ân hạn 60s | System Overlay| Phủ mờ toàn màn hình | **P1** |
| 37 | `MODAL-MEDIA-TAB-SWITCH`| Cảnh báo độc quyền thiết bị Mic/Cam đa tab | System Dialog | Nổi khi tranh chấp thiết bị | P2 |

---

## 8. KIỂM CHỨNG TÍNH KHÉP KÍN (CLOSED-LOOP VERIFICATION)

Ma trận điều kiện và kết quả **năm trạng thái của từng thành phần**, cùng truy vết toàn bộ P1/P2, nằm ở [docs/08-ma-tran-nghiem-thu.md](docs/08-ma-tran-nghiem-thu.md). Bảng danh mục không phải bằng chứng đã dựng/kiểm thử giao diện. Mockup không được sửa trong đợt này; nếu khác đặc tả thì chỉ dùng tham khảo, không dùng nghiệm thu.
1. Mỗi quyết định nghiệp vụ trong [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) có ít nhất một màn hình, modal hoặc khung nhúng phục vụ (đối chiếu qua ma trận 37 thành phần ở §7).
2. Mọi nút bấm và hành động có đích đến rõ ràng, không có ngõ cụt.
3. Mọi modal hai chiều (Đổi bên, Xin hòa, Xin đi lại) có đủ hai phía: Người gửi (đang chờ, có nút Rút đề nghị) và Người nhận (đếm ngược 30 giây, Đồng ý/Từ chối).
4. Không có dữ liệu mồ côi: Display Name đổi tự do ở Hồ sơ; Username đổi qua OTP; Email khoá cứng; ván AI của tài khoản chính thức lưu Lịch sử và Replay; không có trang hồ sơ công khai nên mọi nơi hiện tên người khác chỉ mở thẻ tóm tắt.
5. Số lượng: 15 màn hình + 15 modal + 4 khung nhúng + 3 lớp phủ = **37**; `/rooms/:id` dùng chung cho `SCR-WAITING-ROOM` và `SCR-GAME-ROOM` nên chỉ có **14 URL** phân biệt.
