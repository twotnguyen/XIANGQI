# DANH MỤC & ĐẶC TẢ CHI TIẾT TOÀN BỘ MÀN HÌNH DỰ ÁN CỜ TƯỚNG ONLINE (XIANGQI)

**Tài liệu:** Kiến trúc Giao diện & Bản đồ Màn hình Chuẩn hóa (UI/UX Screen Inventory)  
**Dự án:** Cờ Tướng Trực Tuyến (`XIANGQI`)  
**Ngày cập nhật:** 30/10/2026 · **Phiên bản:** v1.2.5 — BA 0.20/0.21: QR bỏ; P1 thêm các phần phòng/xã hội và khôi phục/đổi Username, media giữa tab, theme. **37 P1 / 0 P2** theo BA 0.27 (trước đó 32/5), tổng 37; đặc tả đích, không phải bằng chứng đã dựng/nghiệm thu.
**Nguồn đặc tả:** Khóa cứng phạm vi theo [BA-SCOPE-DECISIONS.md](../product/BA-SCOPE-DECISIONS.md). Phần bổ sung của đợt rà soát 03/10/2026 đã được Product Owner duyệt. Các mã `R01`–`R21`, `ARCH-xx`, `SCR-RULE-xx` là nhãn kế thừa từ bộ tài liệu cũ; luật tương ứng đã viết bằng chữ ngay tại chỗ dùng.

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
* **URL:** `/login` | **Quyền:** Chưa đăng nhập (đã đăng nhập tự redirect về `/lobby`). Nếu người dùng đến từ link mời phòng thì sau khi đăng nhập hoặc chọn Guest tự chuyển vào đúng phòng, với ưu tiên phiên/vị trí chơi ở BA 1.8: khác thiết bị khi đang chơi thì xử thua/về Sảnh; cùng thiết bị đăng nhập lại trong ân hạn thì tiếp tục ván cũ (BA-SCOPE `Quyết định 2.4`).
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
  * Liên kết **"Quên mật khẩu?" hoạt động ở P1** từ 30/10, mở `/forgot-password` nhập username theo BA 0.18/1.7; "Đăng ký tài khoản mới" mở `/register`.

---

### 2. `SCR-REGISTER` — Trang Đăng Ký Tài Khoản (Wizard 3 Bước Trực Quan)
* **URL:** `/register` | **Quyền:** Khách chưa đăng nhập.
* **Bố cục (Layout):** Card trung tâm kèm thanh tiến trình stepper `1. Tài khoản` $\rightarrow$ `2. Email` $\rightarrow$ `3. Xác thực OTP`.
* **Chi tiết 3 bước:**
  * **Bước 1 (Username & Mật khẩu):**
    * Ô `Username:` (3–20 ký tự, `^[a-zA-Z0-9_]{3,20}$`, kiểm tra trùng lặp debounce 300ms; từ chối username chứa từ cấm ngay bước nhập theo BA 0.17).
    * Ô `Mật khẩu:` (tối thiểu 8 ký tự) + Ô `Xác nhận mật khẩu`.
    * Nút *"Tiếp tục"* $\rightarrow$ Chuyển Bước 2. Phía dưới có nút *"Đăng ký bằng Google"*.
  * **Bước 2 (Email tùy chọn, cập nhật 29/10):**
    * Ô `Email chính chủ:`.
    * Nút *"Xác nhận Email"* $\rightarrow$ Kích hoạt Supabase Auth gửi OTP 6 số và chuyển Bước 3. Nút *"Quay lại"*.
    * Nút **"Bỏ qua email, vào Sảnh"** tạo tài khoản với username/mật khẩu đã nhập, không bắt buộc email.
  * **Bước 3 (Xác thực Email qua mã OTP):**
    * Dòng thông báo: *"Mã OTP 6 số đã được gửi đến email [user-email]."*
    * 6 ô nhập mã OTP đơn lẻ, tự động nhảy tiêu điểm khi gõ.
    * Đồng hồ đếm lùi thời hạn mã: **3 phút (180 giây)**.
    * Nút *"Gửi lại mã OTP"* (kèm bộ đếm lùi 60 giây chống spam).
    * **Xử lý bảo mật:** Nhập sai nhiều lần bị giới hạn (mục tiêu 5 lần, theo BA-SCOPE `Quyết định 1.5`) $\rightarrow$ khóa form và bắt buộc chờ hoặc bấm gửi lại mã mới.
    * Có nút **"Bỏ qua email, vào Sảnh"** tại bước OTP. Chỉ bỏ dở/đóng tab thì chưa hoàn tất; chủ động bỏ qua sẽ hoàn tất tài khoản nhưng chưa xác minh email. Email đã đăng ký ở Bước 2 vẫn báo *"Email này đã được đăng ký"*.
    * Nhập đúng OTP $\rightarrow$ Tài khoản chuyển sang `ACTIVE`, tự động gán `display_name = username` (Phương án C), tự động đăng nhập và đưa vào `/lobby`.

---

### 3. `SCR-FORGOT-PASSWORD` — Trang Quên Mật Khẩu (P1)
* **URL:** `/forgot-password` | **Quyền:** Chưa có phiên thành viên, không cần biết mật khẩu.
* **Thành phần:** Quên mật khẩu P1 vẫn nhập **Username**, chỉ OTP tới email verified đúng tài khoản; thiếu email/pending/không tồn tại báo theo BA 0.18, lỗi SMTP báo thật. Gửi thành công mới sang reset; không email/token trên URL. **Tìm Username qua email cũng P1 theo 0.21**, có ngữ cảnh riêng trên bề mặt Auth hiện có: phản hồi chung, OTP đúng mới hiện tên rồi về Login, không thay form/reset bằng quyền tìm tên.

---

### 4. `SCR-RESET-PASSWORD` — Trang Xác Minh OTP / Đặt Lại Mật Khẩu (P1)
* **URL:** `/reset-password` | **Quyền:** Ngữ cảnh yêu cầu khôi phục hợp lệ; chưa có quyền ứng dụng.
* **Thành phần:** reset mật khẩu: OTP 6 số/180 giây, resend 60 giây; đúng mã mới nhập mật khẩu mới/xác nhận ≥8 ký tự, khớp. Thành công thu hồi phiên cũ/quyền đã dùng, về Login, không tự vào app. Sai/hết hạn/khác mục đích không đổi. **Khôi phục Username P1** chỉ hiện tên sau OTP và về Login; quyền tìm tên không thay quyền reset.

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
  1. **ĐÁNH THƯỜNG — Ghép ngẫu nhiên (P1 theo 0.27):**
     * Ghép hai người không tính Elo; cố định **15 phút mỗi bên**, không bộ chọn thời gian; tìm tối đa 2 phút, có Huỷ trong lúc tìm; ghép được thì hai bên xác nhận trong 30 giây (Xác nhận/Từ chối), đủ hai xác nhận mới đếm 3…2…1…; không xác nhận về Sảnh, đã xác nhận tự tìm tiếp. Không người xem/chia sẻ phòng/Kênh Chung; chat/camera/mic chỉ giữa hai người. Có Xin đi lại/Tái đấu theo BA 2.0, 2.3, 3.2 và 3.6 (PO chốt 05/10). Hoạt động ở P1 theo BA 0.27 (không còn `DISABLED` + "Sắp ra mắt"). *(BA 0.36)*
  2. **ĐÁNH HẠNG (Ranked Mode) — So tài nghiêm ngặt:**
     * Thẻ tóm tắt Rank cá nhân: Huy hiệu Rank, Điểm Elo hiện tại (VD: `1420 Elo`), Thứ hạng hiện tại, Tỷ lệ thắng.
     * Nút lớn: **"Tìm trận Xếp hạng" (Find Ranked Match)** $\rightarrow$ Mở `MODAL-MATCHMAKING`. (Khách bấm vào bị chặn nhắc đăng ký). Người chưa có ván Ranked nào thấy nhãn *"Chưa xếp hạng"*.
     * Bộ nhãn cam kết nghiêm ngặt: 🚫 *Ghép ngẫu nhiên 100%* | 🚫 *Cấm xem (No Spectators)* | 🚫 *Cấm Undo* | ⏱️ *10 phút Rapid*.
  3. **TỰ TẠO PHÒNG (P1) — Mời người vào chơi/xem:**
     * Nút *"Tạo phòng"* mở `MODAL-CREATE-ROOM`; không nhập tên phòng. Chọn ngay `CODE_ONLY` (mặc định) hoặc `PUBLIC` trong form; Host vẫn đổi được quyền truy cập qua Cài đặt phòng sau khi tạo.
     * Ô *"Vào phòng bằng mã"*: mã 8 số (VD: `7052 1348`); vào theo BA 2.7/2.8, không bắt buộc kết bạn. Chưa đăng nhập phải đăng nhập/đăng ký rồi tự chuyển vào phòng, với ưu tiên phiên/vị trí chơi theo BA 1.8/2.4.
     * Trong phòng, `MODAL-INVITE` cho mời nhanh bạn bè online hoặc sao chép link/mã gửi cho người chưa kết bạn. Sảnh có danh sách phòng PUBLIC còn mở (07/10, BA 0.5): cột Tên phòng · Host · Mức giờ · Trạng thái · Người xem x/N; nút **Vào chơi** khi còn ghế trống và **Vào xem** khi còn chỗ xem; mới nhất lên đầu, cập nhật realtime, tối đa 50 phòng. CODE_ONLY/LOCKED không hiện. Vào xem giữ vai trò SPECTATOR; Vào chơi vào ghế trống, ghế vừa hết thì vào xem nếu còn chỗ; máy chủ kiểm chỗ và quyền theo BA 2.7/2.8.
  4. **ĐÁNH VỚI MÁY (P1) — Rèn luyện:**
     * 3 thẻ cấp độ: 🟢 **Dễ** (depth 2), 🟡 **Trung bình** (depth 4), 🔴 **Khó** (depth 6).
     * Bấm vào cấp độ $\rightarrow$ Mở `MODAL-AI-SETUP` để chọn phe cờ.

---

### 7. `SCR-WAITING-ROOM` — Trang Phòng Chờ Thi Đấu
* **URL:** `/rooms/:id` (khi phòng `status = WAITING`).
* **Bố cục (Layout):** Ở giữa là 2 Ghế đấu lớn; Phía dưới là cụm nút Sẵn sàng (người chơi thứ hai)/Bắt đầu (Host)/Đổi bên/Nhường Host/Chia sẻ; Phía phải là Khung chat phòng chờ. **Bổ sung 08/10 (BA 0.13):** khung chat phòng chờ có hai kênh theo vai trò như trong ván; có `PANEL-MEDIA` để bật camera/mic ngay trong phòng chờ, không ngắt khi vào ván.
* **Thành phần & Vận hành:**
  * Host mặc định ngồi **ghế ĐỎ**; khi chỉ có một người ngồi ghế, Host bấm nút *"Đổi ghế"* để chuyển sang ghế Đen hoặc đổi qua lại tự do. Người thứ hai ngồi vào ghế thì nút này biến mất, chỉ còn *"Xin đổi bên"*; người thứ hai rời ghế thì nút xuất hiện lại (BA 0.6, PO bổ sung 07/10).
  * Người vào bằng link/mã/lời mời tự động xếp vào ghế còn trống; nếu hết ghế thì vào xem khi còn chỗ. Người bấm **Vào xem từ Sảnh** luôn vào vai trò Người xem ở phòng PUBLIC, kể cả ghế còn trống (BA 2.8); người bấm **Vào chơi** vào ghế trống (BA 0.5). Người ngồi ghế có nút *"Chuyển sang người xem"*; Host có thêm *"Chuyển sang người xem"* (cho người đang ngồi ghế) và *"Mời xuống ghế"* (cho người xem khi còn ghế trống). Người xem phải Chấp nhận lời mời mới xuống ghế, Từ chối thì tiếp tục xem; lời mời không giữ ghế, kiểm lại khi chấp nhận, hết ghế thì thông báo/giữ vai trò xem; xuống ghế vẫn phải Sẵn sàng (BA 2.8, PO duyệt 05/10). Không đổi chỗ khi ván đang diễn ra (BA-SCOPE `Quyết định 2.8`, đã duyệt 03/10).
  * **Sau ván trong phòng tự tạo (07/10, BA 0.7):** phòng về `WAITING` ngay khi ván kết thúc, Sẵn sàng reset, giữ ghế/phe, người xem, chế độ phòng và mức giờ; không hạn đóng 10 phút. Một người rời thì ghế trống, người còn lại giữ ghế và quyền Host; phòng chỉ đóng khi không còn người ngồi ghế. Ghép ngẫu nhiên không mở lời mời/link/mã cho người mới (BA 2.0).
  * Nút *"Xin đổi bên"* (**P1 từ 07/10**, BA 0.6; có mỗi khi phòng `WAITING` đủ hai người, kể cả sau ván; ẩn khi đang đếm 3-2-1; bị từ chối/hết hạn chờ 60 giây mới gửi lại): Gửi `MODAL-SIDE-SWAP-PROMPT` cho đối thủ (hạn 30s). Đồng ý $\rightarrow$ Hoán đổi ghế và **trạng thái Sẵn sàng của cả 2 bên tự động reset về Chưa sẵn sàng (`ready = false`)**.
  * Nút *"Sẵn sàng"* (Ready): (BA 0.29) Người chơi thứ hai bấm Sẵn sàng; Host không có Sẵn sàng mà có nút *"Bắt đầu"*, chỉ sáng khi đối thủ đã Sẵn sàng. Khi **Host bấm Bắt đầu**: Màn hình kích hoạt đếm ngược **3... 2... 1...** kèm âm thanh cờ gỗ rồi tự động chuyển sang `/rooms/:id` (`status = PLAYING`). Phòng tự tạo mất mạng trong lúc đếm bắt đầu ván: huỷ đếm/reset Sẵn sàng của đối thủ, giữ ghế 60 giây; nối lại thì đối thủ Sẵn sàng và Host bấm Bắt đầu để đếm lại, chưa khởi tạo ván không xử thua (BA 2.3, PO duyệt 05/10).
  * Nút *"Chia sẻ phòng"*: Mở `MODAL-INVITE`.
  * Nút *"Cài đặt phòng"* (Chỉ Host thấy): Mở `MODAL-ROOM-SETTINGS`.
  * Xử lý Host rời phòng: Máy chủ **tự động chuyển quyền Host cho người thứ 2** (`Host Transfer`). Host còn có nút *"Nhường Host"* (BA 0.29): chỉ khi phòng chờ đủ hai người, xác nhận rồi chuyển ngay.

---

### 8. `SCR-GAME-ROOM` — Trang Thi Đấu Cờ Tướng Trực Tiếp
* **URL:** `/rooms/:id` (khi phòng `status = PLAYING`; `FINISHED` dành cho ghép ngẫu nhiên/Ranked (P1 theo 0.27). Phòng tự tạo kết thúc về `WAITING`, hộp kết quả hiển thị trên phòng chờ theo BA 0.7/0.17).
* **RANKED sau ván:** giữ màn kết quả; Rời phòng mới giải phóng vị trí để tìm trận khác. Một người rời không mở phòng chờ cho người còn lại; không Sẵn sàng/Tái đấu/nhận người mới. Hết 10 phút hoặc cả hai rời thì đóng (BA 7.2).
* **Đánh Thường ghép ngẫu nhiên sau ván (P1 theo 0.27):** giữ màn kết quả cho người còn lại nếu một người rời; không chuyển về phòng chờ hoặc nhận người mới. Đóng khi cả hai rời hoặc hết 10 phút tính từ kết thúc ván; không đặt lại hạn khi một người rời. Tái đấu chỉ khi cả hai vẫn ở phòng và cùng đồng ý (BA 2.0).
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
    * Nút *"Xin đi lại"* (P1 theo 0.22/0.27): Ranked ẩn hoàn toàn; phòng tự tạo và ghép ngẫu nhiên hiển thị số lượt còn lại (tối đa 3 lần thành công/bên/ván), gửi `MODAL-UNDO-PROMPT`; đối thủ tự chọn Chấp nhận/Từ chối. Áp dụng cùng luật BA 3.2 và 3.6 cho hai luồng (PO chốt 05/10).

---

### 9. `SCR-AI-GAME` — Trang Đấu Cờ Với Máy (AI)
* **URL:** `/ai/:id` | **Quyền:** Người chơi của ván đấu.
* **Bố cục:** Tinh gọn, chỉ gồm Bàn cờ SVG lớn và Thẻ Người chơi vs Thẻ Máy cờ.
* **Quy chuẩn vận hành:**
  * **Đồng hồ thi đấu:** Hoàn toàn **không giới hạn thời gian (No Time Limit)** đối với người chơi; máy cờ tính toán phản hồi nhanh theo cấp độ (Khó $\le 3000$ms). Không áp dụng cơ chế chống treo ván R17.
  * **Đi lại AI — P1 theo BA0.22, chỉ thành viên:** tối đa3 lần thành công/ván, hiện "Lượt đi lại: X/3"; máy đã đi lùi2 plies, đang nghĩ hủy/fence worker và lùi1 nước người. Chưa có nước người/hết quota/đã kết thúc/tab chỉ đọc thì disabled có lý do; Khách không có quyền Undo ở UI/API.
  * Không có hint hoặc Xin hòa; có Đầu hàng. Mất mạng/đóng tab giữ ACTIVE trong RAM30phút; quá hạn thành viên lưu Bỏ dở/nhánh hiệu lực, Khách không lưu. Worker không phản hồi quá10giây giữ ván/thế và Thử lại cùng thế; ABANDONED thật Retry tạo ID mới cùng cấp/phe thực tế. Restart không khôi phục giả ACTIVE đã mất.
  * Kết quả có **Ván mới / Về Sảnh**; Ván mới mở setup điền cấp/lựa chọn phe ban đầu, đổi được; thành viên có Xem lại khi bản lưu sẵn sàng. History/Replay/export AI đã P1 theo0.22; không mở cho Khách.
  * **Widget AI XIAN-136 P1 theo BA0.26:** mọi môi trường, chỉ chủ ván thành viên; thu gọn mặc định, nodes/depth/thời gian từ worker thật; chỉ hiện “Nước máy vừa đi” sau áp thành công, không PV tương lai. Khách/người khác không telemetry qua API/socket. Offline cho xong tối đa nước máy đang chờ; grace30phút tính từ mất controller, tab chỉ đọc có cảnh báo/đường tiếp quản, không reset hạn. [Đặc tả YC8](../product/P1-YC8-DAU-VOI-MAY.md).

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
  * Ô tìm kiếm theo `username` → nút "Kết bạn"; Khách không dùng màn hình này. Giới hạn 200 bạn, 50 tổng lời mời chờ gửi+nhận; bị cùng người từ chối 2 lần thì chặn gửi theo chiều đó, chiều ngược vẫn được gửi; kết bạn thành công reset bộ đếm cặp về 0 (BA 5.5, 0.19 Q1). Presence: mất mọi kết nối đã được server nhận biết thì hiện Offline kể cả còn giữ vị trí trong ân hạn, không cho nhận mời để chiếm thêm ghế (0.19 Q7).
  * Tab 1: **Danh sách bạn bè** accepted: Avatar, Display Name, @username và Online/Đang đấu/Offline (Elo theo Ranked, P1 theo 0.27). **P1:** Nhắn tin mở DM chỉ giữa bạn accepted; lịch sử bền, hủy bạn thu hồi quyền/ẩn lịch sử, refriend hiện lại. **Thách đấu** chỉ khi bạn Online/người gửi đủ quyền/hết cooldown: mở lại form tạo phòng **không tên**, mặc định **10 phút/CODE_ONLY/5 người xem**, được chỉnh hợp lệ. Hủy không tạo/gửi; xác nhận mới tạo rồi gửi lời mời cho bạn đích, dùng cooldown/popup của BA 0.19. Gửi thất bại/bạn bận/từ chối/hết hạn sau tạo không tự đóng phòng. Không có nút mời vào phòng đang có tại Friends.
  * Tab 2: **"Lời mời kết bạn đang chờ"**: danh sách yêu cầu đến kèm Chấp nhận/Từ chối, yêu cầu đã gửi có Thu hồi. Bấm chuông ở navbar chuyển `/friends` và tự chọn tab này, dùng chung danh sách/hành động/số đếm; không thêm dropdown riêng (PO chốt 30/10, BA 0.19 Q8).

---

### 12. `SCR-HISTORY` — Trang Lịch Sử Ván Đấu Cá Nhân
* **URL:** `/history` | **Quyền:** Người dùng đã đăng nhập.
* **Thành phần:** Bộ lọc danh mục (*Tất cả / Đánh Hạng / Đánh Thường / Đấu với Máy*). Danh sách ván cờ hiển thị: Thẻ loại ván, Tên/Avatar đối thủ, Phe cờ, Kết quả (kèm lý do kết thúc), Biến động Elo (nếu có), Nhãn riêng *"Bị gián đoạn"* / *"Bỏ dở"* (không tính thắng/thua/hòa, không đổi Elo; BA-SCOPE `Quyết định 7.3`), Nút 👁️ *"Xem lại ván cờ"* $\rightarrow$ Chuyển sang `/history/:id`.

---

### 13. `SCR-REPLAY` — Trang Xem Lại Ván Cờ Từng Nước Đi
* **Quyền:** Chỉ 2 người chơi của ván xem được, từ Lịch sử; người xem không; không có link chia sẻ; ván Ranked cũng riêng tư. Hiển thị chuỗi nước đi hiệu lực (không hiện nước đã đi lại).
* **URL:** chỉ `/history/:id` (PO chốt phương án A ngày 05/10/2026; BA 6.2); mọi nút Xem lại dẫn tới đường này.
* **Bố cục (Layout):** Nửa trái là Bàn cờ SVG; Nửa phải là Bảng biên bản danh sách toàn bộ nước đi chuẩn cờ tướng (VD: `1. Pháo 2 bình 5 - Mã 8 tiến 7`).
* **Công cụ Replay:** Các nút tua `|<<`, `<`, `>`, `>>|`, nút `▶️ Tự động phát` (1.5s/nước), click trực tiếp vào dòng nước cờ để nhảy thế cờ. *(P1 theo 0.22: nút Sao chép FEN & Tải file PGN)*.

---

### 14. `SCR-ACCESS-DENIED` — Trang Báo Lỗi Từ Chối Truy Cập
* **URL:** `/access-denied` (hoặc hiển thị toàn màn hình khi có sự cố truy cập).
* **Các kịch bản hiển thị:**
  * ⚠️ *"Phòng thi đấu đã đầy người, vui lòng chọn phòng khác!"* (sức chứa = 2 người chơi + số người xem tối đa của phòng)
  * ⚠️ *"Ván thi đấu Xếp hạng không cho phép người xem vào xem!"*
  * ⚠️ *"Bạn đã bị đuổi và chặn tham gia phòng cờ này!"*
  * Nút hành động duy nhất: *"Quay về Sảnh chính"* (`/lobby`).
  * **Ngoại lệ chuyển phòng xem (PO chốt 30/10, BA 0.19 Q5):** đang xem A mà muốn sang B, B đầy/khóa/lỗi thì giữ A và hiện lỗi tại chỗ; không chuyển toàn màn hình làm rời A. Chỉ hoàn tất rời A sau khi nhận được chỗ hợp lệ ở B bằng xử lý nguyên tử.

---

### 15. `SCR-PROFILE-SETTINGS` — Trang Cài Đặt Hồ Sơ & Đổi Username
* **URL:** `/settings` | **Quyền:** Đã đăng nhập (Yêu cầu phiên hợp lệ).
* **Bố cục (Layout):** Header cố định, Card thông tin người chơi cá nhân, Form chỉnh sửa hồ sơ.
* **Thành phần & Dữ liệu:**
  * Avatar chữ cái đầu/hình đại diện, Display Name, Username (`@username`), Email liên kết, Điểm Elo hiện tại.
  * **Email tùy chọn (29/10):** chưa có email thì hiện cảnh báo và form nhập email; đang chờ xác minh thì hiện email đích, OTP 6 số, hạn 180 giây và gửi lại sau 60 giây. Mã đúng gắn email vào cùng tài khoản, giữ phiên và dữ liệu; email đã xác minh chỉ đọc. Toàn ứng dụng có thông báo không modal dẫn về `/settings`, ẩn sau khi server xác nhận thành công. Không hiển thị email định danh kỹ thuật, không coi lỗi tải trạng thái là đã xác minh.
  * Form cập nhật Display Name (đổi tự do, không cần OTP).
  * **P1 — Đổi Username qua OTP:** `MODAL-OTP-USERNAME`, email verified của chính tài khoản; chưa có dẫn thêm/xác minh. Giữ tên cũ 30 ngày, UUID/dữ liệu/Display Name và mọi phiên hợp lệ/hạn cũ; không gián đoạn ván (BA 0.21).
  * **P1 — Đổi mật khẩu:** form ngay trong Hồ sơ gồm **Mật khẩu hiện tại / Mật khẩu mới / Xác nhận mật khẩu mới**. Server kiểm mật khẩu cũ và hai ô mới; thành công giữ phiên thực hiện với hạn cũ, đăng xuất phiên khác; không cần email/OTP. Khách không có chức năng này. Không thêm modal/trang độc lập; chi tiết theo BA 0.18/1.9 và đặc tả YC1.
  * **P1:** bộ chọn Kỳ Đài Cổ Phong/Giấy Sáng/Theo hệ thống, mặc định Kỳ Đài Cổ Phong. Lưu theo tài khoản/đồng bộ lựa chọn giữa thiết bị; Theo hệ thống dùng OS từng thiết bị, explicit không bị OS ghi đè; giữ màu bàn/phông (BA 0.21, DESIGN §2.3).
  * Avatar luôn tự sinh từ chữ cái đầu Display Name (không tải ảnh lên).
  * Không có chức năng xoá tài khoản trong ứng dụng ở giai đoạn này (đã duyệt 03/10).
  * Nút `Đăng Xuất` (`SCR-LOGIN`).

---

**Phiên và thiết bị (MVP, BA 1.8):** hạn cố định từ đăng nhập; mở tab cùng thiết bị tiếp quản, tab cũ tự reconnect vẫn chỉ đọc. Đăng nhập thiết bị khác khi đang chơi xử thua ngay, đăng xuất thiết bị cũ, thiết bị mới vào Sảnh. AI P1 mất trạng thái sau máy chủ khởi động lại thông báo không tiếp tục được; về Sảnh/chủ động tạo mới. *(Luật tạm tắt khi phát triển, bật lại trước nghiệm thu: BA 0.28.)*

## 4. CHI TIẾT 15 HỘP THOẠI / KHUNG TƯƠNG TÁC

Hai khung Xin hòa/Xin đi lại giữ mã kế thừa `MODAL-*` nhưng **không modal**; các hộp còn lại áp quy tắc modal tương ứng.

1. **`MODAL-GUEST-NAME` (Nhập Tên Khách Tạm Thời):** Mở từ nút Guest tại `SCR-LOGIN`. Nhập Display Name tạm (2–20 ký tự, có dấu tiếng Việt, qua bộ lọc từ cấm, không cần duy nhất). Nhắc nhở cấm đánh Ranked và không lưu lịch sử. Nút *"Vào chơi"* và *"Hủy"*.
2. **`MODAL-CREATE-ROOM` (Thiết Lập Tạo Phòng):** Mở từ Sảnh hoặc Thách đấu P1. Không nhập tên; server đặt `Phòng <mã 8 chữ số>`. Thành viên có Không giới hạn/5/10/15 (**mặc định Không giới hạn**, BA 0.20); Khách có 5/10/15 (**mặc định 10**); Thách đấu mặc định **10**. Không cộng giây/đổi mức sau tạo. Quyền CODE_ONLY (**mặc định**) hoặc PUBLIC; LOCKED chỉ qua Cài đặt khi đủ hai ghế. Người xem 0–5 (**mặc định 5**, không đổi sau tạo). Hủy form Thách đấu không tạo/gửi.
3. **`MODAL-INVITE` (Chia Sẻ Phòng Đa Kênh):** Chỉ người ngồi ghế trong phòng tự tạo mở được. P1 có link/mã 8 số tabular và tab mời bạn bè Online; Guest ẩn tab bạn, không QR. Cooldown 10 giây theo toàn người gửi, dùng chung người nhận/phòng/tab; hiển thị lý do và thời gian còn lại. Người nhận thấy **nhiều popup đồng thời**, mỗi popup có **tên người thực sự gửi**, tên phòng, Tham gia/Từ chối và deadline gốc 30 giây. X/Esc = Từ chối popup đang tương tác, không thu gọn/không đóng tất cả; phản hồi màn hình người gửi và chờ ít nhất 10 giây từ phản hồi đó mới gửi lại. Không lưu room invite trong chuông; hết hạn tự nhiên không giả là Từ chối. Người gửi rời ghế/hủy kết bạn vẫn giữ invite đến hạn, trừ khi phòng khóa/đóng hoặc mất quyền vào hiện tại. Người nhận đang xem A thì chỉ rời A sau khi chuyển/nhận chỗ B thành công; B đầy/khóa/lỗi giữ A và báo lỗi tại chỗ. Không coi precheck slot là giữ chỗ. Các popup độc lập, dùng được từ 360px (BA 0.19 Q2–Q6).
4. **`MODAL-ROOM-SETTINGS` (Cài Đặt Phòng Động):** Chỉ phòng tự tạo: Host đổi giữa `PUBLIC`, `CODE_ONLY` và `LOCKED`; **`LOCKED` chỉ bật được khi đã đủ 2 người chơi** (trước đó nút `DISABLED` kèm tooltip), người đang có ghế/đang xem mất mạng vẫn vào lại được (người chơi 60 giây, người xem 5 phút). Khóa chặn người mới, thu hồi mã/link/lời mời chưa dùng, **giữ người xem hiện có**; mở lại sinh mã/link mới. PUBLIC hiện tại Sảnh; CODE_ONLY/LOCKED không hiện; lời gọi từ mục danh sách cũ phải kiểm lại quyền (BA 4.3).
5. **`MODAL-MATCHMAKING` (Hàng Đợi Tìm Trận Ranked):** Radar quét đối thủ theo Elo ($\Delta Elo \le 100$, $\pm 50$ mỗi 10s), đồng hồ đếm giây. Nút *"Hủy tìm trận"* (hủy tự do khi chưa thấy đối thủ; khóa nút khi `MATCH_FOUND`).
6. **`MODAL-AI-SETUP` (Chọn Cấp Độ & Phe Cờ AI):** Mở từ Sảnh. Chọn cấp độ Dễ/Trung bình/Khó. Chọn phe cờ: 🔴 Đỏ (đi trước), ⚫ Đen (đi sau - máy tự đi nước đầu), 🎲 Ngẫu nhiên (50/50).
7. **`MODAL-OTP-USERNAME` (Xác Thực OTP Đổi Username):** Mở từ Cài đặt hồ sơ. Quy trình 4 bước: 1) Bấm đổi $\rightarrow$ 2) Nhập 6 số OTP (hạn 3p, giới hạn nhập sai) $\rightarrow$ 3) Xác thực mở khóa $\rightarrow$ 4) Nhập username mới và xác nhận.
8. **`MODAL-DIRECT-CHAT` — P1:** mở từ Bạn bè/badge DM, chỉ accepted friends; lịch sử bền cuộn nội bộ, filter/rate hiện hành. Read khi tin trong viewport/tab hoạt động; tải nền không read, đồng bộ thiết bị. Unfriend thu hồi đọc/gửi/ẩn lịch sử và bỏ khỏi badge nhưng giữ read state; refriend hiện lại. **Đủ12 sticker P1 theo BA0.24**, không mở DM cho Khách.
9. **`MODAL-SIDE-SWAP-PROMPT` (Nhận Đề Nghị Đổi Bên):** Hiện phía người nhận khi đối thủ xin đổi bên trong phòng chờ. Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý"* và *"Từ chối"*.
10. **`MODAL-DRAW-PROMPT` (Nhận Đề Nghị Xin Hòa):** Hiện phía người nhận khi đối thủ xin hòa trong ván. Đồng hồ đếm lùi **30 giây**. Nút *"Chấp nhận Hòa"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
11. **`MODAL-UNDO-PROMPT` (Nhận Đề Nghị Xin Đi Lại):** Hiện phía người nhận khi đối thủ bấm xin đi lại trong phòng tự tạo hoặc ghép ngẫu nhiên (P1 theo 0.27, cùng luật BA 3.2/3.6). Đồng hồ đếm lùi **30 giây**. Nút *"Đồng ý cho đi lại"* và *"Từ chối"*. **Không giữ focus**, bàn cờ tiếp tục thao tác theo quyền lượt; X/Esc thu gọn, có nút mở lại, không tạm dừng đồng hồ/hạn; theo `SCR-RULE-06`.
12. **`MODAL-CONFIRM-RESIGN` (Xác Nhận Đầu Hàng):** Cảnh báo rõ ràng: *"Bạn có chắc chắn muốn đầu hàng? Bạn sẽ bị xử THUA ngay lập tức (và bị trừ điểm Elo nếu là ván Ranked)."*
13. **`MODAL-CONFIRM-LEAVE` (Xác Nhận Rời Phòng Khi Đang Đấu):** Cảnh báo: *"Rời phòng lúc này được tính là ĐẦU HÀNG (xử Thua; ở Đánh Hạng còn trừ điểm Elo, Đánh Thường và Đánh với máy không đổi Elo)."* Nút *"Rời phòng"* và *"Ở lại"*.
14. **`MODAL-CONFIRM-KICK` (Xác Nhận Đuổi Người Xem):** Mở khi Host hoặc người chơi còn lại bấm Kick. Thông báo: *"Người này sẽ bị chặn không thể vào lại phòng cho đến khi phòng đóng."*
15. **`MODAL-MATCH-RESULT` (Kết Quả Ván Cờ):** Thắng/Thua/Hòa và lý do tiếng Việt; Elo chỉ Ranked (P1 theo 0.27). Restart online theo BA0.17/YC5, custom về WAITING/reset Ready với kết quả gián đoạn trung tính. **P1 custom:** Ở lại/Rời, Tái đấu Giữ/Đổi phe cho hai thành viên đủ quyền; Đồng ý trong30giây, kiểm lại cặp/ghế rồi đếm3giây vào ván mới không Ready lại; giữ phòng/mức giờ/quyền/người xem/chat. Không dùng thì Ready/Xin đổi bên. **AI:** Ván mới/Về Sảnh; Retry sự cố theo YC8 không đồng nghĩa Ván mới. **Xem lại P1 custom/AI:** chỉ thành viên có quyền khi bản lưu sẵn sàng, không Khách. **P2:** Tái đấu Casual reset15phút/bên, Ranked không Tái đấu. Đề nghị cũ/thay ghế không hồi sinh ván.

---

## 5. CHI TIẾT 4 KHUNG NHÚNG CHỨC NĂNG (EMBEDDED PANELS)

1. **`PANEL-NAVBAR` (Thanh Điều Hướng Header):** cố định đầu trang; Logo, Sảnh/Bảng Xếp Hạng/Bạn bè/Lịch sử, Elo theo phân kỳ, Avatar/Display Name mở cài đặt. Chuông có số đếm pending friend request → `/friends` tab lời mời theo BA 0.19. **Badge DM P1** theo BA 0.20 đếm incoming chưa đọc từ bạn hiện tại, mở hội thoại; tách số đếm/đích của chuông kết bạn và phản hồi mời phòng.
2. **`PANEL-CHAT` (Khung Chat2 kênh & Sticker):** phòng đóng xóa chat. Casual/Ranked (P1 theo 0.27) chỉ Riêng; custom có Riêng cho hai ghế, Chung cho mọi người trong phòng. Cặp mới không đọc chat riêng cũ, cùng cặp đổi bên/chơi tiếp/Tái đấu custom giữ chat. Người xem chỉ Chung từ lúc vào. Desktop mặc định Riêng, mở/ẩn thêm Chung; mobile chuyển tab. Filter `***`; **12 sticker P1 cho cả thành viên/Khách đúng vai trò**, một sticker là một tin theo rate hiện hành; không gửi lệnh ván từ cảm xúc. DM P1 bền, chỉ accepted friends, không xóa theo phòng (BA0.24).
3. **`PANEL-MEDIA` (Khung Camera Face Cam & Micro LiveKit SFU):** Nằm ở cột trái `SCR-GAME-ROOM` và trong `SCR-WAITING-ROOM` (BA 0.13). Lỗi dịch vụ media: ván tiếp tục, hiện "Camera/mic tạm thời không dùng được" (BA 0.14). 2 video trực tiếp SFU của 2 người chơi. Nút Bật/Tắt độc lập Cam & Mic (kèm 3 mức chia sẻ **chung cho camera và mic đang bật**: Không chia sẻ / Chỉ đối thủ / Cả đối thủ và người xem; ghép ngẫu nhiên và Ranked chỉ có 2 mức đầu). Phòng tự tạo chọn sẵn **Chỉ đối thủ**, camera/mic mặc định Tắt; muốn người xem thấy/nghe phải chủ động chọn chia sẻ cả người xem (BA 4.1, PO duyệt 05/10). Ở Ranked hình/tiếng đối thủ mặc định ẩn, có nút *"Hiện"* và *"Tắt ngay"*. Người xem tuyệt đối cấm bật cam/mic (chỉ xem/nghe). Ván Ranked mở tự do cho 2 người chơi giao lưu.
4. **`PANEL-SPECTATORS` (Danh Sách Người Xem Trong Phòng Tự Tạo):** Nằm ở cột phải `SCR-GAME-ROOM` (ghép ngẫu nhiên và Ranked không có người xem). Tiêu đề: *"Người xem (X / N)"* (N = số người xem tối đa của phòng: 1–5). Cả Chủ phòng và người chơi còn lại đều thấy và có quyền bấm nút *"Kick"* cạnh tên mỗi người xem.

**Mời người xem xuống ghế — BA0.24:** Host ở WAITING/còn ghế, một pending/phòng, hạn30giây không giữ chỗ. Khung nonmodal chỉ Chấp nhận/Từ chối và đếm ngược; không X/Esc riêng, không trap focus. Sau Từ chối/hết hạn, cooldown10giây Host–phòng chung người nhận/tab; hiển thị lý do/hạn còn lại. Người chơi đủ quyền tự xuống xem nhưng hết chỗ/N=0 thấy nút disabled có lý do; Host không có nút tự xuống.

---

## 6. CHI TIẾT 3 LỚP PHỦ HỆ THỐNG & CẢNH BÁO BẮT BUỘC (SYSTEM OVERLAYS)

1. **`ALERT-INACTIVITY-BANNER` (Cảnh Báo Chống Treo Ván R17):** Banner cam nổi bật ngay trên bàn cờ ván không giới hạn giờ khi quá 3 phút không đi cờ. **Không trap focus, không che bàn cờ, không che nút Đầu hàng (`SCR-RULE-07`)**. Đếm ngược **30 giây** (không nhấp nháy, theo `DESIGN.md` §4) + Nút *"Tôi còn đây"*. Hết 30s im lặng $\rightarrow$ Xử thua `INACTIVITY`.
2. **`OVERLAY-RECONNECTING` (Lớp Phủ Mất Kết Nối Toàn Cục):** Phủ mờ toàn màn hình khi đứt kết nối Socket.IO. Không đóng được bằng Esc (`SCR-RULE-02`). **Nội dung theo vai trò (rà soát cuối):** (a) *người chơi đang đấu online*: đếm ngược ân hạn **60 giây**, nối lại thì tự tắt, quá 60s xử thua `DISCONNECT`, đồng hồ ván vẫn chạy (hết giờ trước thì `TIMEOUT`); (b) *người chơi ở phòng chờ hoặc phòng đã kết thúc*: giữ ghế 60 giây rồi mất ghế, **không** xử thua; (c) *người xem*: giữ chỗ 5 phút rồi mất chỗ, không xử thua; (d) *ván với máy*: giữ ván 30 phút, không xử thua. Quy tắc gốc: BA-SCOPE `Quyết định 8.3`.
3. **`MODAL-MEDIA-TAB-SWITCH` — P1:** tab thứ hai cùng thiết bị chủ động bật khi tranh mic/cam → Chuyển thiết bị sang tab này / Hủy bỏ. Chuyển thu hồi quyền phát/dừng track cũ, tab cũ chỉ đọc; tab mới bật theo quyền. Hủy/reconnect không tự chiếm; giữ tiếp quản thường với tab mới mặc định Tắt, không lách luật thiết bị khác (BA 0.21).

---

## 7. BẢNG MA TRẬN 37 THÀNH PHẦN TOÀN DIỆN

**Ưu tiên hiện hành BA 0.27:** **37 P1 / 0 P2**, tổng 37 (BA 0.21 trước đó: 32/5). OTP Username và chuyển media tab chuyển P1; tìm Username dùng bề mặt Auth hiện có, theme nằm ở Hồ sơ. Không tự thêm trang/đổi lịch/Jira hoặc coi danh mục là bằng chứng triển khai.

**Biến thể giao diện bổ sung theo BA 0.28–0.36 (không thêm mã thành phần mới; thiết kế khi dựng):**
* `SCR-LOGIN` + `SCR-FORGOT-PASSWORD`: link *Quên tên đăng nhập?* mở tab thứ hai (0.28).
* `SCR-REGISTER`: khung xác nhận khi *Bỏ qua* email/OTP (0.28).
* `SCR-WAITING-ROOM` / `PANEL-SPECTATORS`: nút *Bắt đầu* (Host), *Sẵn sàng* (đối thủ), *Nhường Host*, *Mời rời ghế*, hàng yêu cầu *Xin ngồi ghế*, danh sách tên người xem cho mọi người (0.29, 0.33).
* `SCR-LOBBY`: ô nhập mã có giới hạn thử sai; bộ lọc *Đang chờ* / *Còn chỗ xem* (0.30, 0.33).
* `SCR-GAME-ROOM`: nút *Hủy ván* cạnh *Đầu hàng* khi chưa có nước (khung xác nhận như Đầu hàng); quân hiện ngay không dấu chờ; chấm báo tin chưa xem trên nút/tab Chat (0.31, 0.32, 0.34).
* `MODAL-MATCHMAKING`: trạng thái *Đang tìm* (2 phút), *Hộp xác nhận 30 giây* (Xác nhận/Từ chối, không tên/Elo đối thủ), *Chờ đối thủ xác nhận*, *Hết thời gian* (0.36).
* `SCR-LOBBY` banner ván dở: nút *Bỏ ván* cho ván AI (0.35).
* `MODAL-MATCH-RESULT`: thêm kết quả trung tính *Ván bị hủy* (0.32) và Elo trước/sau (YC9 mục 8).


**Quy tắc hiển thị tính năng P2 bên trong thành phần P1 — ĐÃ THAY bởi BA 0.27 (không còn tính năng P2, không còn “Sắp ra mắt”):**
* **Lối vào hoạt động (0.27):** Ghép ngẫu nhiên, Đánh Hạng và Bảng xếp hạng là P1, không còn `DISABLED` + “Sắp ra mắt”; Khách chỉ bị chặn Đánh Hạng/Bảng xếp hạng kèm tooltip giải thích. History custom/AI P1 theo 0.22; Nhắn tin/Thách đấu P1 theo 0.20, phụ thuộc quyền/quan hệ/presence/cooldown.
* **Hiển thị Elo (PO chốt 31/10, YC9 mục 8):** `MODAL-MATCH-RESULT` ván Ranked hiện Elo trước/sau và ±; `SCR-HISTORY` có cột biến động Elo cho ván Ranked; thẻ đối thủ trong phòng Ranked hiện Elo và tier; Hồ sơ cá nhân và `PANEL-NAVBAR` hiện Elo, tier, hạng của chính mình (Khách không thấy).
* **Chức năng nằm sâu:** phần Ranked/Casual của Undo, Tái đấu, History và thống kê hiển thị theo quyền ở P1; không giả số liệu Ranked. Sticker, Undo custom/AI, History/Replay/export, widget AI theo BA 0.20–0.26.
* Kết quả custom P1 có Ở lại/Rời và Tái đấu chọn phe cho cặp đủ quyền; AI Ván mới/Về Sảnh. Xem lại custom/AI của thành viên đã P1 khi bản lưu sẵn sàng, Khách không có quyền; QR bị bỏ cả hai phân kỳ.

| STT | Mã Thành Phần | Tên Gọi Nghiệp Vụ | Phân Loại | Vị Trí / URL | Ưu tiên |
|:---:|---|---|:---:|---|:---:|
| 1 | `SCR-LOGIN` | Đăng nhập hệ thống & nút Khách | Routed Page | `/login` | **P1** |
| 2 | `SCR-REGISTER` | Đăng ký tài khoản (Wizard 3 bước OTP 3 phút) | Routed Page | `/register` | **P1** |
| 3 | `SCR-FORGOT-PASSWORD` | Quên mật khẩu bằng username, gửi OTP tới email đã xác minh | Routed Page | `/forgot-password` | **P1** |
| 4 | `SCR-RESET-PASSWORD` | OTP hợp lệ rồi đặt mật khẩu mới, về đăng nhập | Routed Page | `/reset-password` | **P1** |
| 5 | `SCR-ONBOARDING` | Đăng ký Google OA tạo Username + Password | Routed Page | `/onboarding` | **P1** |
| 6 | `SCR-LOBBY` | P1: Tự tạo phòng, Máy; Thường/Hạng hoạt động theo BA 0.27 | Routed Page | `/lobby` | **P1** |
| 7 | `SCR-WAITING-ROOM` | Phòng chờ, đổi ghế solo, Sẵn sàng/Bắt đầu, đếm 3s, Nhường Host | Routed Page | `/rooms/:id` (`WAITING`) | **P1** |
| 8 | `SCR-GAME-ROOM` | Bàn cờ SVG thi đấu, 2 cách đi, đồng hồ, thao tác | Routed Page | `/rooms/:id` (`PLAYING`) | **P1** |
| 9 | `SCR-AI-GAME` | P1: đấu máy3 cấp, không giới hạn giờ, Undo tối đa3 lần chỉ thành viên theo BA0.22 | Routed Page | `/ai/:id` | **P1** |
| 10 | `SCR-LEADERBOARD` | Bảng Xếp Hạng Top 50 & Dòng ghim rank cá nhân | Routed Page | `/leaderboard` | **P1 theo 0.27** |
| 11 | `SCR-FRIENDS` | P1: bạn bè/presence, Nhắn tin/DM và Thách đấu | Routed Page | `/friends` | **P1** |
| 12 | `SCR-HISTORY` | P1: lịch sử custom/AI riêng thành viên; Ranked/thống kê Ranked P1 theo 0.27 | Routed Page | `/history` | **P1 theo0.22** |
| 13 | `SCR-REPLAY` | P1: xem lại custom/AI riêng người chơi, biên bản/tự phát/FEN/PGN | Routed Page | `/history/:id` | **P1 theo0.22** |
| 14 | `SCR-ACCESS-DENIED` | Màn hình từ chối truy cập (Phòng đầy, Cấm xem) | Routed Page | `/access-denied` | **P1** |
| 15 | `SCR-PROFILE-SETTINGS` | P1: Display Name, email/xác minh, mật khẩu, Đổi Username OTP, theme đồng bộ tài khoản, Đăng xuất | Routed Page | `/settings` | **P1** |
| 16 | `MODAL-GUEST-NAME` | Nhập Tên hiển thị tạm thời cho Khách (2-20 ký tự) | Modal Dialog | Nổi trên `SCR-LOGIN` | **P1** (07/10) |
| 17 | `MODAL-CREATE-ROOM` | P1: tạo phòng Không giới hạn/5/10/15; Thách đấu dùng lại form | Modal Dialog | Mở từ Sảnh/Bạn bè | **P1** |
| 18 | `MODAL-INVITE` | P1: link, mã 8 số, mời bạn bè | Modal Dialog | Mở từ phòng chờ/thi đấu | **P1** |
| 19 | `MODAL-ROOM-SETTINGS` | Đổi chế độ phòng động (Khóa phòng giữ khách cũ) | Modal Dialog | Mở bởi Host | **P1** |
| 20 | `MODAL-MATCHMAKING` | Hàng đợi tìm trận Ranked ngẫu nhiên (Hủy tự do) | Modal Dialog | Mở từ `SCR-LOBBY` | **P1 theo 0.27** |
| 21 | `MODAL-AI-SETUP` | Chọn cấp độ AI (Dễ/Trung bình/Khó) & Phe cờ (Đỏ/Đen/Random)| Modal Dialog | Mở từ `SCR-LOBBY` | **P1** |
| 22 | `MODAL-OTP-USERNAME` | OTP 4 bước Đổi Username, giữ tên cũ/phiên/dữ liệu | Modal Dialog | Từ Hồ sơ | **P1** |
| 23 | `MODAL-DIRECT-CHAT` | Chat 1-1 bạn bè, lịch sử bền, read/unread đồng bộ | Floating/Modal | Từ Bạn bè/badge DM | **P1** |
| 24 | `MODAL-SIDE-SWAP-PROMPT`| Nhận đề nghị đổi phe cờ Đỏ/Đen (hạn 30s) | Modal Prompt | Mở phía đối thủ phòng chờ | **P1** (07/10) |
| 25 | `MODAL-DRAW-PROMPT` | Nhận đề nghị xin hòa cờ trong ván (hạn 30s) | Non-modal Prompt | Mở phía đối thủ trong ván | **P1** |
| 26 | `MODAL-UNDO-PROMPT` | Nhận đề nghị xin đi lại (hạn 30s, trần 3 lần) | Non-modal Prompt | Mở phía đối thủ trong ván | **P1 theo 0.22/0.27** |
| 27 | `MODAL-CONFIRM-RESIGN` | Xác nhận đầu hàng ván cờ (cảnh báo thua ngay) | Modal Dialog | Mở khi bấm Đầu hàng | **P1** |
| 28 | `MODAL-CONFIRM-LEAVE` | Xác nhận rời phòng khi đang đấu (xử thua) | Modal Dialog | Mở khi bấm Rời phòng | **P1** |
| 29 | `MODAL-CONFIRM-KICK` | Xác nhận đuổi người xem (chặn vào lại đến đóng phòng)| Modal Dialog | Mở khi bấm Kick người xem | **P1** |
| 30 | `MODAL-MATCH-RESULT` | P1: kết quả, Ở lại/Rời/Tái đấu custom hoặc Ván mới/Về Sảnh AI, Xem lại khi bản lưu sẵn sàng; Elo (Ranked)/Tái đấu Casual P1 theo 0.27 | Modal Dialog | Khi ván kết thúc | **P1** |
| 31 | `PANEL-NAVBAR` | Thanh điều hướng Header toàn cục + Icon thông báo | Embedded Panel| Cố định đầu mọi trang | **P1** |
| 32 | `PANEL-CHAT` | P1: chat2 kênh, filter và12 sticker cho thành viên/Khách theo vai trò (BA0.24) | Embedded Panel | Cột phải `SCR-GAME-ROOM` | **P1** |
| 33 | `PANEL-MEDIA` | Face cam & Mic LiveKit SFU 2 người chơi (3 mức chia sẻ) | Embedded Panel| Cột trái `SCR-GAME-ROOM` | **P1** |
| 34 | `PANEL-SPECTATORS` | Danh sách tên người xem (tối đa N, 1–5) cho mọi người trong phòng + nút Kick cho 2 bên; Host thấy yêu cầu Xin ngồi ghế và nút Mời rời ghế (BA 0.33) | Embedded Panel| Cột phải `SCR-GAME-ROOM` | **P1** |
| 35 | `ALERT-INACTIVITY-BANNER` | P1: không đi 3 phút → cảnh báo 30 giây; tối đa hai lần Tôi còn đây | System Alert | Không modal/không che bàn/Đầu hàng | **P1** |
| 36 | `OVERLAY-RECONNECTING` | Lớp phủ mất kết nối Socket.IO ân hạn 60s | System Overlay| Phủ mờ toàn màn hình | **P1** |
| 37 | `MODAL-MEDIA-TAB-SWITCH` | Chuyển/Hủy thiết bị Mic/Cam giữa tab; thu hồi track/quyền cũ | System Dialog | Khi tranh thiết bị chủ động | **P1** |

---

## 8. KIỂM CHỨNG TÍNH KHÉP KÍN (CLOSED-LOOP VERIFICATION)

Ma trận điều kiện và kết quả **năm trạng thái của từng thành phần** (bản cũ ở `docs/08` đã xoá 07/10) được thay bằng truy vết thành phần → User Story trong [BACKLOG-P1.md](../product/BACKLOG-P1.md); năm trạng thái bắt buộc vẫn là điều kiện trong Definition of Done. Bảng danh mục không phải bằng chứng đã dựng/kiểm thử giao diện. Mockup không được sửa trong đợt này; nếu khác đặc tả thì chỉ dùng tham khảo, không dùng nghiệm thu.
1. Mỗi quyết định nghiệp vụ trong [BA-SCOPE-DECISIONS.md](../product/BA-SCOPE-DECISIONS.md) có ít nhất một màn hình, modal hoặc khung nhúng phục vụ (đối chiếu qua ma trận 37 thành phần ở §7).
2. Mọi nút bấm và hành động có đích đến rõ ràng, không có ngõ cụt.
3. Mọi modal hai chiều (Đổi bên, Xin hòa, Xin đi lại) có đủ hai phía: Người gửi (đang chờ, có nút Rút đề nghị) và Người nhận (đếm ngược 30 giây, Đồng ý/Từ chối).
4. Bảo toàn danh tính: đổi Display Name tự do, Đổi Username OTP **P1** giữ UUID/dữ liệu/mọi phiên hợp lệ/hạn cũ theo0.21; email verified bất biến. History/Replay/lưu terminal AI thành viên đã P1 theo0.22; ACTIVE trong RAM, restart không khôi phục giả. Không hồ sơ công khai; thẻ tóm tắt theo phân kỳ.
5. Số lượng: 15 màn hình + 15 modal + 4 khung nhúng + 3 lớp phủ = **37**; `/rooms/:id` dùng chung cho `SCR-WAITING-ROOM` và `SCR-GAME-ROOM` nên chỉ có **14 URL** phân biệt.
