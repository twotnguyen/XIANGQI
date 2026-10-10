# DANH MỤC & ĐẶC TẢ CHI TIẾT TOÀN BỘ MÀN HÌNH DỰ ÁN CỜ TƯỚNG ONLINE (XIANGQI)

**Tài liệu:** Kiến trúc Giao diện & Bản đồ Màn hình Chuẩn hóa (UI/UX Screen Inventory)  
**Dự án:** Cờ Tướng Trực Tuyến (`XIANGQI`)  
**Ngày cập nhật:** 10/10/2026 · **Phiên bản:** v1.2.2 (đồng bộ BA Phần 0, gồm từ chối username chứa từ cấm và phòng tự tạo về WAITING sau server khởi động lại; giữ 26 thành phần P1 / 11 P2)
**Nguồn đặc tả:** Khóa cứng phạm vi theo [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md). Phần bổ sung của đợt rà soát 03/10/2026 đã được Product Owner duyệt. Các mã `R01`–`R21`, `ARCH-xx`, `SCR-RULE-xx` là nhãn kế thừa từ bộ tài liệu cũ; luật tương ứng đã viết bằng chữ ngay tại chỗ dùng.

---

> **Vai trò:** bản đồ 37 thành phần giao diện và các trạng thái cho FE/QA. Luật nghiệp vụ theo BA; tiêu chí nghiệm thu theo BACKLOG-P1; lịch và phân công theo KE-HOACH-JIRA. Tệp này không thay thế các nguồn đó.

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
* **URL:** `/login` | **Quyền:** Chưa đăng nhập (đã đăng nhập tự redirect về `/lobby`). Nếu người dùng đến từ link/QR mời phòng thì sau khi đăng nhập hoặc chọn Guest tự chuyển vào đúng phòng, với ưu tiên phiên/vị trí chơi ở BA 1.8: khác thiết bị khi đang chơi thì xử thua/về Sảnh; cùng thiết bị đăng nhập lại trong ân hạn thì tiếp tục ván cũ (BA-SCOPE `Quyết định 2.4`).
* **Bố cục (Layout):** Khung Card chính giữa trên nền giấy ấm (`--color-paper`), hoa văn thủy mặc cờ tướng.
* **Thành phần & Dữ liệu:**
  * Logo Cờ Tướng truyền thống (帥/將) + Tiêu đề *"Kỳ Đài Đăng Nhập"*.
  * Form đăng nhập: Ô `Username:` (viết liền không dấu), Ô `Mật khẩu:` (icon ẩn/hiện mật khẩu).
  * Checkbox `Ghi nhớ đăng nhập`: Mặc định tick (phiên 30 ngày). Bỏ tick: phiên kết thúc khi đóng trình duyệt hoặc sau 12 giờ, tuỳ cái nào đến trước (BA-SCOPE `Quyết định 1.8`).
  * Nút `Đăng nhập` (Primary button). Sai thông tin luôn báo *"Sai tên đăng nhập hoặc mật khẩu"*; sai 5 lần trong 15 phút với cùng username thì chặn 15 phút, báo *"Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút"* (BA Phần 0 mục 0.2).
  * Nút `Đăng nhập bằng Google` (Google OAuth 1 chạm).
  * **Nút `Khách` (Chơi nhanh) — Nằm riêng biệt nổi bật (P1 từ 07/10):**
    * Bấm vào mở `MODAL-GUEST-NAME` nhập tên tạm vào chơi ngay (phiên Khách tối đa 12 giờ, tên gắn nhãn "(Khách)", không cần duy nhất; quyền hạn xem BA-SCOPE `Quyết định 1.3`).
    * **Visual Note ngay dưới nút:** ⚠️ *"Chế độ Khách (Guest) không được tham gia đánh Xếp hạng để tính điểm Elo và không lưu lịch sử ván cờ."*
  * Liên kết phụ: *"Quên mật khẩu?"* là P2, P1 hiển thị vô hiệu với tooltip *"Sắp ra mắt"*; *"Đăng ký tài khoản mới"* (`/register`) hoạt động ở P1.

---

### 2. `SCR-REGISTER` — Trang Đăng Ký Tài Khoản (Wizard 3 Bước Trực Quan)
* **URL:** `/register` | **Quyền:** Khách chưa đăng nhập.
* **Bố cục (Layout):** Card trung tâm kèm thanh tiến trình stepper `1. Tài khoản` $\rightarrow$ `2. Email` $\rightarrow$ `3. Xác thực OTP`.
* **Chi tiết 3 bước:**
  * **Bước 1 (Username & Mật khẩu):**
    * Ô `Username:` (3–20 ký tự, `^[a-zA-Z0-9_]{3,20}$`, kiểm tra trùng lặp debounce 300ms; từ chối username chứa từ cấm ngay bước nhập theo BA 0.17).
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

### 3. `SCR-FORGOT-PASSWORD` — Trang Yêu Cầu Khôi Phục Tài Khoản (P2)
* **URL:** `/forgot-password` | **Quyền:** Tất cả.
* **Thành phần:** Ô nhập `Email đã đăng ký` + Nút `Gửi mã khôi phục` $\rightarrow$ Chuyển sang `/reset-password`. Luôn hiện cùng thông báo *"Nếu email này đã đăng ký, mã khôi phục đã được gửi"*; email chuyển giữa hai màn hình bằng trạng thái ứng dụng, **không đặt lên URL** (BA-SCOPE `Quyết định 1.7`).

---

### 4. `SCR-RESET-PASSWORD` — Trang Khôi Phục Username / Đặt Lại Mật Khẩu (P2)
* **URL:** `/reset-password` | **Quyền:** Người có mã khôi phục hợp lệ.
* **Thành phần:** 6 ô nhập OTP xác thực email theo `Quyết định 1.5`. Xác minh hợp lệ mới hiện Username hiện tại và lựa chọn *Về Đăng nhập* nếu chỉ quên Username (không bắt buộc đổi mật khẩu), hoặc tiếp tục Ô `Mật khẩu mới` + Ô `Xác nhận mật khẩu mới` + Nút `Xác nhận đổi mật khẩu`. Đổi thành công $\rightarrow$ đăng xuất mọi phiên khác, về `/login`. OTP khôi phục không tự đăng nhập ứng dụng; email chuyển bằng trạng thái ứng dụng, không trên URL. Dùng màn hình hiện có, không tăng số thành phần (BA 1.7, PO duyệt P2 05/10).

---

### 5. `SCR-ONBOARDING` — Trang Thiết Lập Tài Khoản Google OAuth
* **URL:** `/onboarding` | **Quyền:** Người dùng vừa bấm Đăng ký qua Google OAuth lần đầu.
* **Thành phần:**
  * Hiển thị Avatar & Email Google (Readonly).
  * Ô `Username:` (bắt buộc đặt tên duy nhất, 3–20 ký tự không dấu; từ chối từ cấm ngay bước nhập, máy chủ kiểm lại trước khi hoàn tất theo BA 0.17).
  * Ô `Mật khẩu dự phòng:` (để sau này có thể đăng nhập bằng `Username + Password` nếu không muốn dùng Google).
  * Miễn mã OTP (vì Google đã xác thực email an toàn).
  * Nút `Hoàn tất thiết lập` $\rightarrow$ Tự động gán `display_name = username` (không dùng Họ tên Google) $\rightarrow$ Chuyển thẳng vào `/lobby`. Màn hình không có nút X; thoát giữa chừng thì chưa có tài khoản ứng dụng hoàn tất, dù có thể tồn tại bản xác thực Google tạm. Dọn bản Google mới chưa hoàn tất theo BA 1.2 (PO chọn A 05/10); chưa hoàn tất không được vào ứng dụng.
  * **Kiểm tra trùng Email:** Nếu Gmail này đã có tài khoản trước đó, hiển thị lỗi rõ ràng: ⚠️ *"Email này đã được đăng ký"* và hướng dẫn quay lại trang đăng nhập.

---

### 6. `SCR-LOBBY` — Trang Sảnh Chính (Lobby Hub)

* **P1 bổ sung đã duyệt 04/10 (BA 10.4):** phần Luật chơi mở rộng/thu gọn trong Sảnh; nội dung theo AC của Story Sảnh trong BACKLOG-P1.md, không trang/modal mới, không tăng số thành phần. Có nhãn và thao tác bàn phím, công bố rõ luật rút gọn.
* **URL:** `/lobby` | **Quyền:** Đã đăng nhập hoặc Khách. Nếu đang có ván/phòng dở, hiện banner *"Bạn có ván đang chơi dở — Quay lại"*; khi đang ngồi ghế ở một phòng, các nút Tạo phòng/Ghép/Tìm trận `DISABLED` kèm tooltip.
* **Bố cục (Layout):** Bốn lựa chọn theo BA 2.0 (PO chốt 05/10/2026):
  1. **ĐÁNH THƯỜNG — Ghép ngẫu nhiên (P2):**
     * Ghép hai người không tính Elo; cố định **15 phút mỗi bên**, không bộ chọn thời gian; tìm tối đa 3 phút, có Huỷ trong lúc tìm; ghép được thì hai bên xác nhận trong 10 giây, đủ hai xác nhận mới đếm 3…2…1…; không xác nhận về Sảnh, đã xác nhận tự tìm tiếp. Không người xem/chia sẻ phòng/Kênh Chung; chat/camera/mic chỉ giữa hai người. Có Xin đi lại/Tái đấu theo BA 2.0, 2.3, 3.2 và 3.6 (PO chốt 05/10). P1 hiển thị `DISABLED` kèm tooltip *"Sắp ra mắt"*.
  2. **ĐÁNH HẠNG (Ranked Mode) — So tài nghiêm ngặt:**
     * Thẻ tóm tắt Rank cá nhân: Huy hiệu Rank, Điểm Elo hiện tại (VD: `1420 Elo`), Thứ hạng hiện tại, Tỷ lệ thắng.
     * Nút lớn: **"Tìm trận Xếp hạng" (Find Ranked Match)** $\rightarrow$ Mở `MODAL-MATCHMAKING`. (Khách bấm vào bị chặn nhắc đăng ký). Người chưa có ván Ranked nào thấy nhãn *"Chưa xếp hạng"*.
     * Bộ nhãn cam kết nghiêm ngặt: 🚫 *Ghép ngẫu nhiên 100%* | 🚫 *Cấm xem (No Spectators)* | 🚫 *Cấm Undo* | ⏱️ *10 phút Rapid*.
  3. **TỰ TẠO PHÒNG (P1) — Mời người vào chơi/xem:**
     * Nút *"Tạo phòng"* mở `MODAL-CREATE-ROOM`; phòng tạo mặc định CODE_ONLY; Host mở PUBLIC qua Cài đặt phòng để hiện ở Sảnh.
     * Ô *"Vào phòng bằng mã"*: mã 8 ký tự (VD: `K7M2-XQP4`); vào theo BA 2.7/2.8, không bắt buộc kết bạn. Chưa đăng nhập phải đăng nhập/đăng ký rồi tự chuyển vào phòng, với ưu tiên phiên/vị trí chơi theo BA 1.8/2.4.
     * Trong phòng, `MODAL-INVITE` cho mời nhanh bạn bè online hoặc sao chép link/mã gửi cho người chưa kết bạn. Sảnh có danh sách phòng PUBLIC còn mở (07/10, BA 0.5): cột Tên phòng · Host · Mức giờ · Trạng thái · Người xem x/N; nút **Vào chơi** khi còn ghế trống và **Vào xem** khi còn chỗ xem; mới nhất lên đầu, cập nhật realtime, tối đa 50 phòng. CODE_ONLY/LOCKED không hiện. Vào xem giữ vai trò SPECTATOR; Vào chơi vào ghế trống, ghế vừa hết thì vào xem nếu còn chỗ; máy chủ kiểm chỗ và quyền theo BA 2.7/2.8.
  4. **ĐÁNH VỚI MÁY (P1) — Rèn luyện:**
     * 3 thẻ cấp độ: 🟢 **Dễ** (depth 2), 🟡 **Trung bình** (depth 4), 🔴 **Khó** (depth 6).
     * Bấm vào cấp độ $\rightarrow$ Mở `MODAL-AI-SETUP` để chọn phe cờ.

---

### 7. `SCR-WAITING-ROOM` — Trang Phòng Chờ Thi Đấu
* **URL:** `/rooms/:id` (khi phòng `status = WAITING`).
* **Bố cục (Layout):** Ở giữa là 2 Ghế đấu lớn; Phía dưới là Cụm nút Sẵn sàng/Đổi bên/Chia sẻ; Phía phải là Khung chat phòng chờ. **Bổ sung 08/10 (BA 0.13):** khung chat phòng chờ có hai kênh theo vai trò như trong ván; có `PANEL-MEDIA` để bật camera/mic ngay trong phòng chờ, không ngắt khi vào ván.
* **Thành phần & Vận hành:**
  * Host mặc định ngồi **ghế ĐỎ**; khi chỉ có một người ngồi ghế, Host bấm nút *"Đổi ghế"* để chuyển sang ghế Đen hoặc đổi qua lại tự do. Người thứ hai ngồi vào ghế thì nút này biến mất, chỉ còn *"Xin đổi bên"*; người thứ hai rời ghế thì nút xuất hiện lại (BA 0.6, PO bổ sung 07/10).
  * Người vào bằng link/mã/lời mời tự động xếp vào ghế còn trống; nếu hết ghế thì vào xem khi còn chỗ. Người bấm **Vào xem từ Sảnh** luôn vào vai trò Người xem ở phòng PUBLIC, kể cả ghế còn trống (BA 2.8); người bấm **Vào chơi** vào ghế trống (BA 0.5). Người ngồi ghế có nút *"Chuyển sang người xem"*; Host có thêm *"Chuyển sang người xem"* (cho người đang ngồi ghế) và *"Mời xuống ghế"* (cho người xem khi còn ghế trống). Người xem phải Chấp nhận lời mời mới xuống ghế, Từ chối thì tiếp tục xem; lời mời không giữ ghế, kiểm lại khi chấp nhận, hết ghế thì thông báo/giữ vai trò xem; xuống ghế vẫn phải Sẵn sàng (BA 2.8, PO duyệt 05/10). Không đổi chỗ khi ván đang diễn ra (BA-SCOPE `Quyết định 2.8`, đã duyệt 03/10).
  * **Sau ván trong phòng tự tạo (07/10, BA 0.7):** phòng về `WAITING` ngay khi ván kết thúc, Sẵn sàng reset, giữ ghế/phe, người xem, chế độ phòng và mức giờ; không hạn đóng 10 phút. Một người rời thì ghế trống, người còn lại giữ ghế và quyền Host; phòng chỉ đóng khi không còn người ngồi ghế. Ghép ngẫu nhiên không mở lời mời/link/mã cho người mới (BA 2.0).
  * Nút *"Xin đổi bên"* (**P1 từ 07/10**, BA 0.6; có mỗi khi phòng `WAITING` đủ hai người, kể cả sau ván; ẩn khi đang đếm 3-2-1; bị từ chối/hết hạn chờ 60 giây mới gửi lại): Gửi `MODAL-SIDE-SWAP-PROMPT` cho đối thủ (hạn 30s). Đồng ý $\rightarrow$ Hoán đổi ghế và **trạng thái Sẵn sàng của cả 2 bên tự động reset về Chưa sẵn sàng (`ready = false`)**.
  * Nút *"Sẵn sàng"* (Ready): Từng bên bấm sẵn sàng. Khi **cả hai cùng sẵn sàng**: Màn hình kích hoạt đếm ngược **3... 2... 1...** kèm âm thanh cờ gỗ rồi tự động chuyển sang `/rooms/:id` (`status = PLAYING`). Phòng tự tạo mất mạng trong lúc đếm bắt đầu ván: huỷ đếm/reset Sẵn sàng cả hai, giữ ghế 60 giây; nối lại cả hai Sẵn sàng để đếm lại, chưa khởi tạo ván không xử thua (BA 2.3, PO duyệt 05/10).
  * Nút *"Chia sẻ phòng"*: Mở `MODAL-INVITE`.
  * Nút *"Cài đặt phòng"* (Chỉ Host thấy): Mở `MODAL-ROOM-SETTINGS`.
  * Xử lý Host rời phòng: Máy chủ **tự động chuyển quyền Host cho người thứ 2** (`Host Transfer`).

---

### 8. `SCR-GAME-ROOM` — Trang Thi Đấu Cờ Tướng Trực Tiếp
* **URL:** `/rooms/:id` (khi phòng `status = PLAYING`; `FINISHED` dành cho ghép ngẫu nhiên/Ranked P2. Phòng tự tạo kết thúc về `WAITING`, hộp kết quả hiển thị trên phòng chờ theo BA 0.7/0.17).
* **RANKED sau ván:** giữ màn kết quả; Rời phòng mới giải phóng vị trí để tìm trận khác. Một người rời không mở phòng chờ cho người còn lại; không Sẵn sàng/Tái đấu/nhận người mới. Hết 10 phút hoặc cả hai rời thì đóng (BA 7.2).
* **Đánh Thường ghép ngẫu nhiên sau ván (P2):** giữ màn kết quả cho người còn lại nếu một người rời; không chuyển về phòng chờ hoặc nhận người mới. Đóng khi cả hai rời hoặc hết 10 phút tính từ kết thúc ván; không đặt lại hạn khi một người rời. Tái đấu chỉ khi cả hai vẫn ở phòng và cùng đồng ý (BA 2.0).
* **Bố cục (Layout 3 cột):**
  * **Cột trái:** Khung Media Face cam 2 người chơi (`PANEL-MEDIA`), Thẻ thông tin người chơi, Đồng hồ đếm lùi thời gian của 2 bên.
  * **Cột giữa:** Bàn cờ SVG 90 giao điểm chuẩn, Dòng trạng thái lượt đi, Cụm công cụ ván cờ.
  * **Cột phải:** Phòng tự tạo có Danh sách người xem (`PANEL-SPECTATORS`) và chat 2 kênh (`PANEL-CHAT`). Ghép ngẫu nhiên và Đánh Hạng chỉ có Kênh Riêng, không người xem.
* **Tương tác bàn cờ:**
  * Bàn cờ SVG 90 giao điểm chuẩn, 100% quân cờ chữ Hán gỗ cổ điển, tọa độ `GR-COORD`. Tự lật bàn cờ khi cầm quân Đen.
  * Hỗ trợ song song 2 cách đi cờ: **Click-to-Move** và **Kéo thả chuột (Drag & Drop)** với hiệu ứng trượt mượt về chỗ cũ nếu thả sai ô.
  * *Bộ 3 hiệu ứng thị giác:* Chấm tròn ô đi hợp lệ; Vòng cố định bao quanh quân đối phương có thể ăn; 4 góc vuông đánh dấu nước vừa đi (`Last Move`); Vòng cảnh báo quanh Tướng bị chiếu kèm chữ "Đang bị chiếu" (`Check`, không nhấp nháy, không rung). Màu và hình dạng cụ thể: `DESIGN.md` §7.4.
  * *Cụm nút công cụ ván cờ:*
    * Nút Mute/Unmute âm thanh Web Audio API.
    * Nút *"Đầu hàng"* $\rightarrow$ Mở `MODAL-CONFIRM-RESIGN`.
    * Nút *"Xin hòa"* $\rightarrow$ Gửi `MODAL-DRAW-PROMPT` cho đối phương (hạn 30s). Bị từ chối thì 5 nước sau mới xin lại được; ở Ranked chỉ bấm được khi mỗi bên đã đi ≥ 20 nước (tooltip nêu lý do khi `DISABLED`).
    * Nút *"Xin đi lại"* (P2): Ranked ẩn hoàn toàn; phòng tự tạo và ghép ngẫu nhiên hiển thị số lượt còn lại (tối đa 3 lần thành công/bên/ván), gửi `MODAL-UNDO-PROMPT`; đối thủ tự chọn Chấp nhận/Từ chối. Áp dụng cùng luật BA 3.2 và 3.6 cho hai luồng (PO chốt 05/10).

---

### 9. `SCR-AI-GAME` — Trang Đấu Cờ Với Máy (AI)
* **URL:** `/ai/:id` | **Quyền:** Người chơi của ván đấu.
* **Bố cục:** Tinh gọn, chỉ gồm Bàn cờ SVG lớn và Thẻ Người chơi vs Thẻ Máy cờ.
* **Quy chuẩn vận hành:**
  * **Đồng hồ thi đấu:** Hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi; máy cờ tính toán phản hồi nhanh theo cấp độ (Khó $\le 3000$ms). Không áp dụng cơ chế chống treo ván R17.
  * **Nút "Đi lại" (Undo):** Bấm lùi ngay **1 cặp nước đi (2 plies: 1 nước máy + 1 nước người)** ngay lập tức không cần máy đồng ý. Hiển thị nhãn *"Lượt đi lại: X/3"*, hết 3 lần nút bị `DISABLED`. Nếu máy đang nghĩ: huỷ tác vụ và chỉ lùi nước vừa đi của người chơi, vẫn tính một lượt (AC-HIS-03-02, P2).
  * Không có nút gợi ý nước đi (No Hint). Không có nút Xin hòa (chỉ có Đầu hàng). Cầm Đen mà người chơi chưa đi nước nào thì nút "Đi lại" `DISABLED` kèm tooltip. P1: ván đang chơi bị mất kết nối được giữ trong bộ nhớ tối đa 30 phút để vào lại `/ai/:id`; quá hạn bỏ trạng thái, không lưu lịch sử. Máy không phản hồi quá 10 giây thì giữ nguyên ván/thế, hiện Thử lại để tính nước tiếp, không gửi lại nước người (PO chốt 09/10). Nếu lỗi thực sự làm ván Bỏ dở, Thử lại tạo ván mới cùng cấp và phe thực tế; máy chủ khởi động lại mất trạng thái thì không giả khôi phục. Lưu ván vào lịch sử là P2; ván AI không tính Elo, ván Khách không lưu.
  * Ván kết thúc mở `MODAL-MATCH-RESULT` với **Ván mới** (mở `MODAL-AI-SETUP` điền sẵn cấp độ và phe vừa chơi, đổi được) và **Về Sảnh** — P1 (BA 0.9). *(P2)* Ván của tài khoản chính thức lưu vào Lịch sử và có nút Xem lại.
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
  * Tab 1: *"Danh sách bạn bè"* (`status = ACCEPTED`): Avatar, Display Name, @username, Điểm Elo, Trạng thái 🟢 *Online* / 🟠 *Đang đấu* / ⚫ *Offline*. Nút *"Thách đấu"* (chỉ sáng khi 🟢 Online; = mở form Tạo phòng, nhập tên, mặc định 10 phút/CODE_ONLY/tối đa 5 người xem (PO chốt 05/10); được chỉnh trong form trước khi xác nhận; xác nhận mới tạo và gửi mời theo BA 2.7). **Ở P1** nút "Thách đấu" và "Nhắn tin" `DISABLED` kèm tooltip *"Sắp ra mắt"*; trang này **không có nút mời vào phòng**; mời bạn bè online chỉ qua `MODAL-INVITE` bên trong phòng. Mở `MODAL-DIRECT-CHAT` bằng nút *"Nhắn tin"* là P2.
  * Tab 2: *"Lời mời kết bạn đang chờ"*: Danh sách yêu cầu gửi đến kèm nút *"Chấp nhận"* và *"Từ chối"*.

---

### 12. `SCR-HISTORY` — Trang Lịch Sử Ván Đấu Cá Nhân
* **URL:** `/history` | **Quyền:** Người dùng đã đăng nhập.
* **Thành phần:** Bộ lọc danh mục (*Tất cả / Đánh Hạng / Đánh Thường / Đấu với Máy*). Danh sách ván cờ hiển thị: Thẻ loại ván, Tên/Avatar đối thủ, Phe cờ, Kết quả (kèm lý do kết thúc), Biến động Elo (nếu có), Nhãn riêng *"Bị gián đoạn"* / *"Bỏ dở"* (không tính thắng/thua/hòa, không đổi Elo; BA-SCOPE `Quyết định 7.3`), Nút 👁️ *"Xem lại ván cờ"* $\rightarrow$ Chuyển sang `/history/:id`.

---

### 13. `SCR-REPLAY` — Trang Xem Lại Ván Cờ Từng Nước Đi
* **Quyền:** Chỉ 2 người chơi của ván xem được, từ Lịch sử; người xem không; không có link chia sẻ; ván Ranked cũng riêng tư. Hiển thị chuỗi nước đi hiệu lực (không hiện nước đã đi lại).
* **URL:** chỉ `/history/:id` (PO chốt phương án A ngày 05/10/2026; BA 6.2); mọi nút Xem lại dẫn tới đường này.
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

**Phiên và thiết bị (MVP, BA 1.8):** hạn cố định từ đăng nhập; mở tab cùng thiết bị tiếp quản, tab cũ tự reconnect vẫn chỉ đọc. Đăng nhập thiết bị khác khi đang chơi xử thua ngay, đăng xuất thiết bị cũ, thiết bị mới vào Sảnh. AI P1 mất trạng thái sau máy chủ khởi động lại thông báo không tiếp tục được; về Sảnh/chủ động tạo mới.

## 4. CHI TIẾT 15 HỘP THOẠI / KHUNG TƯƠNG TÁC

Hai khung Xin hòa/Xin đi lại giữ mã kế thừa `MODAL-*` nhưng **không modal**; các hộp còn lại áp quy tắc modal tương ứng.

1. **`MODAL-GUEST-NAME` (Nhập Tên Khách Tạm Thời):** Mở từ nút Guest tại `SCR-LOGIN`. Nhập Display Name tạm (2–20 ký tự, có dấu tiếng Việt, qua bộ lọc từ cấm, không cần duy nhất). Nhắc nhở cấm đánh Ranked và không lưu lịch sử. Nút *"Vào chơi"* và *"Hủy"*.
2. **`MODAL-CREATE-ROOM` (Thiết Lập Tạo Phòng):** Mở từ `SCR-LOBBY`. Nhập tên phòng (1–60 ký tự, qua bộ lọc từ cấm), chọn thời gian (P1: 5p/10p/15p; P2 thêm Không giới hạn; không cộng giây, không đổi được sau khi tạo), phòng tạo ở `CODE_ONLY`, PUBLIC mở qua Cài đặt phòng; `LOCKED` chỉ bật sau khi đủ hai người chơi (BA 2.7/2.8); chọn **Người xem**: *Không có người xem* hoặc tối đa 1–5 (**mặc định 5**, không đổi sau khi tạo).
3. **`MODAL-INVITE` (Chia Sẻ Phòng Đa Kênh):** Chỉ mở trong phòng tự tạo. Mời nhanh bạn bè online hoặc chia sẻ link/mã cho người chưa kết bạn; không bắt buộc kết bạn khi vào bằng link/mã (BA 2.7). P1 có link/mã; P2 thêm QR tạo đủ 3 hình thức (cùng một quyền vào phòng, không phân biệt xem/chơi); chỉ 2 người chơi thấy nút này. Gồm: Khối hiển thị Mã QR (nút tải/sao chép ảnh), Khối Link URL (Auto-Redirect sau login/guest), Khối Mã 8 ký tự monospace, Tab mời bạn bè Online.
4. **`MODAL-ROOM-SETTINGS` (Cài Đặt Phòng Động):** Chỉ phòng tự tạo: Host đổi giữa `PUBLIC`, `CODE_ONLY` và `LOCKED`; **`LOCKED` chỉ bật được khi đã đủ 2 người chơi** (trước đó nút `DISABLED` kèm tooltip), người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi 60 giây, người xem 5 phút). Khóa chặn người mới, thu hồi mã/link/lời mời chưa dùng, **giữ người xem hiện có**; mở lại sinh mã/link mới. PUBLIC hiện tại Sảnh; CODE_ONLY/LOCKED không hiện; lời gọi từ mục danh sách cũ phải kiểm lại quyền (BA 4.3).
5. **`MODAL-MATCHMAKING` (Hàng Đợi Tìm Trận Ranked):** Radar quét đối thủ theo Elo ($\Delta Elo \le 100$, $\pm 50$ mỗi 10s), đồng hồ đếm giây. Nút *"Hủy tìm trận"* (hủy tự do khi chưa thấy đối thủ; khóa nút khi `MATCH_FOUND`).
6. **`MODAL-AI-SETUP` (Chọn Cấp Độ & Phe Cờ AI):** Mở từ Sảnh. Chọn cấp độ Dễ/Trung bình/Khó. Chọn phe cờ: 🔴 Đỏ (đi trước), ⚫ Đen (đi sau - máy tự đi nước đầu), 🎲 Ngẫu nhiên (50/50).
7. **`MODAL-OTP-USERNAME` (Xác Thực OTP Đổi Username):** Mở từ Cài đặt hồ sơ. Quy trình 4 bước: 1) Bấm đổi $\rightarrow$ 2) Nhập 6 số OTP (hạn 3p, giới hạn nhập sai) $\rightarrow$ 3) Xác thực mở khóa $\rightarrow$ 4) Nhập username mới và xác nhận.
8. **`MODAL-DIRECT-CHAT` (Khung Chat Riêng 1-1 Bạn Bè):** Mở từ `SCR-FRIENDS`. Ràng buộc bạn bè chính thức (`status = ACCEPTED`). Lịch sử tin nhắn, bộ lọc từ cấm `***`, khay 12 sticker cờ tướng.
9. **`MODAL-SIDE-SWAP-PROMPT` (Nhận Đề Nghị Đổi Bên):** Hiện phía người nhận khi đối thủ xin đổi bên trong phòng chờ. Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý"* và *"Từ chối"*.
10. **`MODAL-DRAW-PROMPT` (Nhận Đề Nghị Xin Hòa):** Hiện phía người nhận khi đối thủ xin hòa trong ván. Đồng hồ đếm lùi **30 giây**. Nút *"Chấp nhận Hòa"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
11. **`MODAL-UNDO-PROMPT` (Nhận Đề Nghị Xin Đi Lại):** Hiện phía người nhận khi đối thủ bấm xin đi lại trong phòng tự tạo hoặc ghép ngẫu nhiên (P2, cùng luật BA 3.2/3.6). Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý cho đi lại"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
12. **`MODAL-CONFIRM-RESIGN` (Xác Nhận Đầu Hàng):** Cảnh báo rõ ràng: *"Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức (và bị trừ điểm Elo nếu là ván Ranked)."*
13. **`MODAL-CONFIRM-LEAVE` (Xác Nhận Rời Phòng Khi Đang Đấu):** Cảnh báo: *"Rời phòng lúc này được tính là ĐẦU HÀNG (xử Thua; ở Đánh Hạng còn trừ điểm Elo, Đánh Thường và Đánh với máy không đổi Elo)."* Nút *"Rời phòng"* và *"Ở lại"*.
14. **`MODAL-CONFIRM-KICK` (Xác Nhận Đuổi Người Xem):** Mở khi Host hoặc người chơi còn lại bấm Kick. Thông báo: *"Người này sẽ bị chặn không thể vào lại phòng cho đến khi phòng đóng."*
15. **`MODAL-MATCH-RESULT` (Kết Quả Ván Cờ):** Biểu ngữ Thắng/Thua/Hòa kèm lý do (Checkmate, Stalemate, Resign, Timeout, Disconnect, Inactivity, Draw 3-rep, Draw agreement, Draw no-capture, Perpetual check, Interrupted). Biến động Elo (Ranked). **Gián đoạn do server khởi động lại (BA 0.17, PO duyệt 09/10):** kết quả trung tính, không có người thắng/thua/hoà; phòng tự tạo về `WAITING`, reset Sẵn sàng, vẫn có *Ở lại phòng* / *Rời phòng*, không hạn đóng 10 phút. Cụm nút P1: ván online phòng tự tạo có 🏠 *Ở lại phòng* (phòng đã về `WAITING`, BA 0.7) và 🚪 *Rời phòng*; ván AI có *Ván mới* và *Về Sảnh* (BA 0.9). P2: 🔄 *Tái đấu* (phòng tự tạo và ghép ngẫu nhiên, người đề nghị chọn Giữ phe/Đổi phe, đối thủ đồng ý trong 30 giây; ghép ngẫu nhiên đặt lại 15 phút/bên; Ranked cấm; BA 0.8), 📜 *Xem lại (Replay)*.

---

## 5. CHI TIẾT 4 KHUNG NHÚNG CHỨC NĂNG (EMBEDDED PANELS)

1. **`PANEL-NAVBAR` (Thanh Điều Hướng Header):** Cố định đầu mọi trang. Logo, Điều hướng (Sảnh, Bảng Xếp Hạng, Bạn bè, Lịch sử), Huy hiệu Elo cá nhân, Icon Chuông báo lời mời kết bạn, huy hiệu tổng **tin đến** chưa đọc từ bạn hiện tại (đánh dấu khi tin hiển thị trong vùng nhìn ở tab hoạt động, BA 5.2), Avatar + Tên hiển thị (`Display Name`) kèm menu con Cài đặt hồ sơ.
2. **`PANEL-CHAT` (Khung Chat 2 Kênh & Sticker):** Nằm ở cột phải `SCR-GAME-ROOM`. Chat phòng xoá khi phòng đóng; **ghép ngẫu nhiên Đánh Thường và Đánh Hạng (P2) chỉ có `[Kênh Riêng]`, không Kênh Chung/người xem** (BA 2.0, 5.4, 7.2); `[Kênh Riêng]` chỉ hiện cho 2 người đang ngồi ghế (cặp mới không đọc tin cũ; cùng cặp Đổi bên hoặc chơi ván tiếp trong cùng phòng giữ chat ngay ở P1 theo BA 0.7/0.13; Tái đấu là P2), người xem mới chỉ thấy `[Kênh Chung]` từ lúc vào. **Bố cục phòng tự tạo theo BA 5.3 (PO chốt 05/10/2026):** máy tính mặc định chỉ mở Kênh Riêng; người chơi tự mở thêm Kênh Chung để hiển thị đồng thời hai khung, hoặc ẩn bớt một trong hai rồi mở lại; điện thoại chuyển giữa hai tab trong một khung, mặc định Kênh Riêng. Người xem chỉ có Kênh Chung; ẩn khung không thay đổi quyền đọc/gửi. Bộ lọc từ cấm `***`. Khay 12 Sticker cờ tướng 1 chạm (P2).
3. **`PANEL-MEDIA` (Khung Camera Face Cam & Micro LiveKit SFU):** Nằm ở cột trái `SCR-GAME-ROOM` và trong `SCR-WAITING-ROOM` (BA 0.13). Lỗi dịch vụ media: ván tiếp tục, hiện "Camera/mic tạm thời không dùng được" (BA 0.14). 2 video trực tiếp SFU của 2 người chơi. Nút Bật/Tắt độc lập Cam & Mic (kèm 3 mức chia sẻ **chung cho camera và mic đang bật**: Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem; ghép ngẫu nhiên và Ranked chỉ có 2 mức đầu). Phòng tự tạo chọn sẵn **Chỉ đối thủ**, camera/mic mặc định Tắt; muốn người xem thấy/nghe phải chủ động chọn chia sẻ cả người xem (BA 4.1, PO duyệt 05/10). Ở Ranked hình/tiếng đối thủ mặc định ẩn, có nút *"Hiện"* và *"Tắt ngay"*. Người xem tuyệt đối cấm bật cam/mic (chỉ xem/nghe). Ván Ranked mở tự do cho 2 người chơi giao lưu.
4. **`PANEL-SPECTATORS` (Danh Sách Người Xem Trong Phòng Tự Tạo):** Nằm ở cột phải `SCR-GAME-ROOM` (ghép ngẫu nhiên và Ranked không có người xem). Tiêu đề: *"Người xem (X / N)"* (N = số người xem tối đa của phòng: 1–5). Cả Chủ phòng và người chơi còn lại đều thấy và có quyền bấm nút *"Kick"* cạnh tên mỗi người xem.

---

## 6. CHI TIẾT 3 LỚP PHỦ HỆ THỐNG & CẢNH BÁO BẮT BUỘC (SYSTEM OVERLAYS)

1. **`ALERT-INACTIVITY-BANNER` (Cảnh Báo Chống Treo Ván R17):** Banner cam nổi bật ngay trên bàn cờ ván không giới hạn giờ khi quá 3 phút không đi cờ. **Không trap focus, không che bàn cờ, không che nút Đầu hàng (`SCR-RULE-07`)**. Đếm ngược **30 giây** (không nhấp nháy, theo `DESIGN.md` §4) + Nút *"Tôi còn đây"*. Hết 30s im lặng $\rightarrow$ Xử thua `INACTIVITY`.
2. **`OVERLAY-RECONNECTING` (Lớp Phủ Mất Kết Nối Toàn Cục):** Phủ mờ toàn màn hình khi đứt kết nối Socket.IO. Không đóng được bằng Esc (`SCR-RULE-02`). **Nội dung theo vai trò (rà soát cuối):** (a) *người chơi đang đấu online*: đếm ngược ân hạn **60 giây**, nối lại thì tự tắt, quá 60s xử thua `DISCONNECT`, đồng hồ ván vẫn chạy (hết giờ trước thì `TIMEOUT`); (b) *người chơi ở phòng chờ hoặc phòng đã kết thúc*: giữ ghế 60 giây rồi mất ghế, **không** xử thua; (c) *người xem*: giữ chỗ 5 phút rồi mất chỗ, không xử thua; (d) *ván với máy*: giữ ván 30 phút, không xử thua. Quy tắc gốc: BA-SCOPE `Quyết định 8.3`.
3. **`MODAL-MEDIA-TAB-SWITCH` (Cảnh Báo Độc Quyền Thiết Bị Media Đa Tab):** Popup cảnh báo khi mở 2 tab cùng lúc và bấm bật mic/cam ở tab thứ hai (`ARCH-11`). Nút *"Chuyển thiết bị sang tab này"* (thu hồi tab cũ) và nút *"Hủy bỏ"*.

---

## 7. BẢNG MA TRẬN 37 THÀNH PHẦN TOÀN DIỆN

**Ưu tiên (đã duyệt 03/10, cập nhật 07/10):** P1 = MVP hạn kế hoạch hiện hành 04/11/2026 (đồng bộ Jira ngày 10/10; mốc gốc 05/11) (**26 thành phần**, gồm `SCR-ONBOARDING` do PO kéo lên 04/10/2026, `MODAL-GUEST-NAME` và `MODAL-SIDE-SWAP-PROMPT` lên P1 ngày 07/10), P2 = làm sau (**11 thành phần**). Cách phân kỳ và lý do: BA-SCOPE `Phần 11`. Màn hình P2 vẫn giữ nguyên đặc tả bên trên.

**Quy tắc hiển thị tính năng P2 bên trong thành phần P1 (rà soát cuối):**
* **Lối vào cấp điều hướng chính** (thẻ Đánh Thường ghép ngẫu nhiên và Đánh Hạng ở Sảnh, mục Lịch sử và Bảng xếp hạng ở thanh điều hướng, liên kết *Quên mật khẩu?* ở màn đăng nhập (PO duyệt 04/10/2026; nút Khách hoạt động ở P1 từ 07/10), nút Nhắn tin và Thách đấu ở Bạn bè; **nút Đăng nhập/Đăng ký bằng Google hoạt động ở P1**, PO quyết định 04/10/2026) hiển thị `DISABLED` kèm tooltip *"Sắp ra mắt"*.
* **Chức năng nằm sâu trong màn hình P1** (Mã QR, Sticker, Xin đi lại, Tái đấu, Xem lại ở kết quả ván, đi lại với máy, Lưu lịch sử, widget AI) **ẩn hoàn toàn** ở P1, không để nút xám.
* `MODAL-MATCH-RESULT` ở P1 chỉ có *Ở lại phòng*/*Rời phòng* (online) hoặc *Ván mới*/*Về Sảnh* (AI); không hiện Tái đấu và Xem lại.

| STT | Mã Thành Phần | Tên Gọi Nghiệp Vụ | Phân Loại | Vị Trí / URL | Ưu tiên |
|:---:|---|---|:---:|---|:---:|
| 1 | `SCR-LOGIN` | Đăng nhập hệ thống & nút Khách | Routed Page | `/login` | **P1** |
| 2 | `SCR-REGISTER` | Đăng ký tài khoản (Wizard 3 bước OTP 3 phút) | Routed Page | `/register` | **P1** |
| 3 | `SCR-FORGOT-PASSWORD` | Yêu cầu khôi phục Username/mật khẩu | Routed Page | `/forgot-password` | P2 |
| 4 | `SCR-RESET-PASSWORD` | Khôi phục Username/đặt lại mật khẩu | Routed Page | `/reset-password` | P2 |
| 5 | `SCR-ONBOARDING` | Đăng ký Google OA tạo Username + Password | Routed Page | `/onboarding` | **P1** |
| 6 | `SCR-LOBBY` | P1: Tự tạo phòng, Máy; Thường/Hạng hiển thị vô hiệu, thuộc P2 | Routed Page | `/lobby` | **P1** |
| 7 | `SCR-WAITING-ROOM` | Phòng chờ, đổi ghế solo, đếm 3s, nhượng Host | Routed Page | `/rooms/:id` (`WAITING`) | **P1** |
| 8 | `SCR-GAME-ROOM` | Bàn cờ SVG thi đấu, 2 cách đi, đồng hồ, thao tác | Routed Page | `/rooms/:id` (`PLAYING`) | **P1** |
| 9 | `SCR-AI-GAME` | P1: bàn cờ đấu máy, không giới hạn giờ; P2: Undo 3 lần | Routed Page | `/ai/:id` | **P1** |
| 10 | `SCR-LEADERBOARD` | Bảng Xếp Hạng Top 50 & Dòng ghim rank cá nhân | Routed Page | `/leaderboard` | P2 |
| 11 | `SCR-FRIENDS` | P1: bạn bè, Online/Offline, mời vào phòng; P2: Thách đấu/Nhắn tin | Routed Page | `/friends` | **P1** |
| 12 | `SCR-HISTORY` | Lịch sử ván đấu cá nhân (lọc Rank/Casual/Máy) | Routed Page | `/history` | P2 |
| 13 | `SCR-REPLAY` | Xem lại ván cờ từng nước, bảng biên bản, auto-play | Routed Page | `/history/:id` | P2 |
| 14 | `SCR-ACCESS-DENIED` | Màn hình từ chối truy cập (Phòng đầy, Cấm xem) | Routed Page | `/access-denied` | **P1** |
| 15 | `SCR-PROFILE-SETTINGS` | P1: Display Name, Đăng xuất, email chỉ đọc; P2: đổi Username qua OTP | Routed Page | `/settings` | **P1** |
| 16 | `MODAL-GUEST-NAME` | Nhập Tên hiển thị tạm thời cho Khách (2-20 ký tự) | Modal Dialog | Nổi trên `SCR-LOGIN` | **P1** (07/10) |
| 17 | `MODAL-CREATE-ROOM` | P1: tạo phòng, 5/10/15 phút; P2: Không giới hạn | Modal Dialog | Mở từ `SCR-LOBBY` | **P1** |
| 18 | `MODAL-INVITE` | P1: link, mã 8 ký tự, mời bạn bè; P2: mã QR | Modal Dialog | Mở từ phòng chờ/thi đấu | **P1** |
| 19 | `MODAL-ROOM-SETTINGS` | Đổi chế độ phòng động (Khóa phòng giữ khách cũ) | Modal Dialog | Mở bởi Host | **P1** |
| 20 | `MODAL-MATCHMAKING` | Hàng đợi tìm trận Ranked ngẫu nhiên (Hủy tự do) | Modal Dialog | Mở từ `SCR-LOBBY` | P2 |
| 21 | `MODAL-AI-SETUP` | Chọn cấp độ AI (Dễ/Trung bình/Khó) & Phe cờ (Đỏ/Đen/Random)| Modal Dialog | Mở từ `SCR-LOBBY` | **P1** |
| 22 | `MODAL-OTP-USERNAME` | Xác thực OTP 4 bước Đổi Username trong Hồ sơ | Modal Dialog | Mở từ `SCR-PROFILE-SETTINGS`| P2 |
| 23 | `MODAL-DIRECT-CHAT` | Khung Chat riêng 1-1 giữa Bạn bè chính thức (R21) | Floating/Modal | Nổi góc phải hoặc từ Bạn bè | P2 |
| 24 | `MODAL-SIDE-SWAP-PROMPT`| Nhận đề nghị đổi phe cờ Đỏ/Đen (hạn 30s) | Modal Prompt | Mở phía đối thủ phòng chờ | **P1** (07/10) |
| 25 | `MODAL-DRAW-PROMPT` | Nhận đề nghị xin hòa cờ trong ván (hạn 30s) | Non-modal Prompt | Mở phía đối thủ trong ván | **P1** |
| 26 | `MODAL-UNDO-PROMPT` | Nhận đề nghị xin đi lại (hạn 30s, trần 3 lần) | Non-modal Prompt | Mở phía đối thủ trong ván | P2 |
| 27 | `MODAL-CONFIRM-RESIGN` | Xác nhận đầu hàng ván cờ (cảnh báo thua ngay) | Modal Dialog | Mở khi bấm Đầu hàng | **P1** |
| 28 | `MODAL-CONFIRM-LEAVE` | Xác nhận rời phòng khi đang đấu (xử thua) | Modal Dialog | Mở khi bấm Rời phòng | **P1** |
| 29 | `MODAL-CONFIRM-KICK` | Xác nhận đuổi người xem (chặn vào lại đến đóng phòng)| Modal Dialog | Mở khi bấm Kick người xem | **P1** |
| 30 | `MODAL-MATCH-RESULT` | P1: kết quả và Ở lại/Rời hoặc Ván mới/Về Sảnh; P2: Elo, Tái đấu, Replay | Modal Dialog | Tự mở khi ván kết thúc | **P1** |
| 31 | `PANEL-NAVBAR` | Thanh điều hướng Header toàn cục + Icon thông báo | Embedded Panel| Cố định đầu mọi trang | **P1** |
| 32 | `PANEL-CHAT` | P1: chat 2 kênh, bộ lọc từ cấm; P2: 12 sticker | Embedded Panel| Cột phải `SCR-GAME-ROOM` | **P1** |
| 33 | `PANEL-MEDIA` | Face cam & Mic LiveKit SFU 2 người chơi (3 mức chia sẻ) | Embedded Panel| Cột trái `SCR-GAME-ROOM` | **P1** |
| 34 | `PANEL-SPECTATORS` | Danh sách người xem (tối đa N, 1–5) + nút Kick cho 2 bên | Embedded Panel| Cột phải `SCR-GAME-ROOM` | **P1** |
| 35 | `ALERT-INACTIVITY-BANNER`| Cảnh báo chống treo ván R17 đếm 30s không modal | System Alert | Banner nổi trên bàn cờ | P2 |
| 36 | `OVERLAY-RECONNECTING` | Lớp phủ mất kết nối Socket.IO ân hạn 60s | System Overlay| Phủ mờ toàn màn hình | **P1** |
| 37 | `MODAL-MEDIA-TAB-SWITCH`| Cảnh báo độc quyền thiết bị Mic/Cam đa tab | System Dialog | Nổi khi tranh chấp thiết bị | P2 |

---

## 8. KIỂM CHỨNG TÍNH KHÉP KÍN (CLOSED-LOOP VERIFICATION)

Ma trận điều kiện và kết quả **năm trạng thái của từng thành phần** (bản cũ ở `docs/08` đã xoá 07/10) được thay bằng truy vết thành phần → User Story trong [BACKLOG-P1.md](BACKLOG-P1.md); năm trạng thái bắt buộc vẫn là điều kiện trong Definition of Done. Bảng danh mục không phải bằng chứng đã dựng/kiểm thử giao diện. Mockup không được sửa trong đợt này; nếu khác đặc tả thì chỉ dùng tham khảo, không dùng nghiệm thu.
1. Mỗi quyết định nghiệp vụ trong [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md) có ít nhất một màn hình, modal hoặc khung nhúng phục vụ (đối chiếu qua ma trận 37 thành phần ở §7).
2. Mọi nút bấm và hành động có đích đến rõ ràng, không có ngõ cụt.
3. Mọi modal hai chiều (Đổi bên, Xin hòa, Xin đi lại) có đủ hai phía: Người gửi (đang chờ, có nút Rút đề nghị) và Người nhận (đếm ngược 30 giây, Đồng ý/Từ chối).
4. Không có dữ liệu mồ côi: Display Name đổi tự do ở Hồ sơ; Username đổi qua OTP (P2); Email khoá cứng; ván AI của tài khoản chính thức lưu Lịch sử và Replay ở P2, P1 chỉ giữ trong bộ nhớ theo BA 6.3; không có trang hồ sơ công khai nên mọi nơi hiện tên người khác chỉ mở thẻ tóm tắt.
5. Số lượng: 15 màn hình + 15 modal + 4 khung nhúng + 3 lớp phủ = **37**; `/rooms/:id` dùng chung cho `SCR-WAITING-ROOM` và `SCR-GAME-ROOM` nên chỉ có **14 URL** phân biệt.
