# EPIC-01: Authentication & Identity Management (Quản Lý Danh Tính & Xác Thực)

- **Epic Key:** `XQ-EPIC-01`
- **Mục tiêu sản phẩm:** Cung cấp giải pháp xác thực bảo mật, đa kênh (Email/Password, Google OAuth, Chế độ Khách), xác minh danh tính qua mã OTP 6 số theo chuẩn Supabase Auth, thiết lập cơ sở dữ liệu kỳ thủ đồng bộ toàn hệ thống.
- **Sprint dự kiến:** Sprint 1 (Tuần 1 - Tuần 2)
- **Màn hình liên quan:** `SCR-LOGIN`, `SCR-REGISTER`, `SCR-FORGOT-PASSWORD`, `SCR-RESET-PASSWORD`, `SCR-ONBOARDING`, `MODAL-GUEST-NAME`.

---

## 1. Danh Sách User Stories & Story Points

| Jira Key | Tên User Story | Loại | Story Points | Ưu tiên | Màn hình Mockup |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`XQ-STORY-101`** | Đăng ký tài khoản Wizard 3 bước & Xác thực Email OTP | Story | 5 | P0 (Bắt buộc) | `SCR-REGISTER.html` |
| **`XQ-STORY-102`** | Đăng nhập bằng Email/Username + Mật khẩu & Quản lý JWT | Story | 3 | P0 (Bắt buộc) | `SCR-LOGIN.html` |
| **`XQ-STORY-103`** | Đăng nhập Google OAuth & Màn hình Onboarding lần đầu | Story | 5 | P1 (Quan trọng) | `SCR-ONBOARDING.html` |
| **`XQ-STORY-104`** | Đăng nhập nhanh chế độ Khách (Guest Player) | Story | 2 | P0 (Bắt buộc) | `MODAL-GUEST-NAME` |
| **`XQ-STORY-105`** | Quên mật khẩu & Đặt lại mật khẩu mới qua Email OTP | Story | 3 | P1 (Quan trọng) | `SCR-FORGOT-PASSWORD.html`, `SCR-RESET-PASSWORD.html` |

**Tổng Story Points Epic-01:** **18 SP**

---

## 2. Đặc Tả Chi Tiết Từng User Story

### `XQ-STORY-101`: Đăng ký tài khoản Wizard 3 bước & Xác thực Email OTP
- **Mô tả (User Voice):**
  > Là một **Kỳ thủ mới**, tôi muốn **đăng ký tài khoản qua quy trình 3 bước trực quan và xác minh Email bằng OTP 6 số**, để **sở hữu tài khoản định danh an toàn, lưu giữ được điểm Elo và lịch sử thi đấu**.
- **Tiêu chí chấp nhận (Acceptance Criteria - AC):**
  1. **Bước 1 (Thông tin đăng nhập):**
     - Username: Độ dài 3–20 ký tự, chỉ chứa chữ cái, số và gạch dưới `^[a-zA-Z0-9_]+$`. Kiểm tra trùng lặp thời gian thực (`debounce 300ms`).
     - Mật khẩu: Tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt. Có nút bật/tắt ẩn hiện mật khẩu.
     - Xác nhận mật khẩu: Phải khớp 100% với mật khẩu đã nhập.
  2. **Bước 2 (Thông tin liên hệ & Cam kết):**
     - Email: Định dạng RFC 5322 hợp lệ. Kiểm tra không được trùng với tài khoản đã tồn tại.
     - Checkbox Điều khoản: Bắt buộc chọn đồng ý mới kích hoạt nút "Gửi Mã Xác Thực OTP".
  3. **Bước 3 (Xác thực OTP Supabase):**
     - Lưới 6 ô nhập mã số, tự động nhảy focus sang ô kế tiếp khi gõ, tự động dán (paste) chuỗi 6 số.
     - Bộ đếm ngược hết hạn OTP: **3 phút (180 giây)**.
     - Bộ đếm ngược gửi lại mã: Khóa nút "Gửi lại" trong **60 giây**.
     - Giới hạn bảo mật: Nhập sai quá **5 lần** -> Hủy mã, buộc yêu cầu gửi mã mới.
  4. **Khởi tạo dữ liệu người dùng (Phương án C):**
     - Sau khi verify OTP thành công: Tự động khởi tạo `display_name = username`.
     - Email được gán cờ `READONLY` vĩnh viễn trong database.
     - Mức Elo khởi tạo mặc định: **1200**.
- **Technical Sub-tasks:**
  - `BE-101.1`: Tạo endpoint `POST /api/auth/register-intent` (Validate username, email, generate Supabase OTP).
  - `BE-101.2`: Tạo endpoint `POST /api/auth/verify-otp-register` (Verify OTP, insert user vào table `users` và `user_profiles`).
  - `FE-101.1`: Lập trình Component Form Stepper 3 bước dựa trên `SCR-REGISTER.html`.
  - `FE-101.2`: Xử lý logic 6 ô OTP auto-focus, paste event và đếm ngược timer.

---

### `XQ-STORY-102`: Đăng nhập Email/Username + Mật khẩu & Quản lý JWT
- **Mô tả (User Voice):**
  > Là một **Kỳ thủ đã có tài khoản**, tôi muốn **đăng nhập bằng Username hoặc Email kèm Mật khẩu**, để **truy cập vào Sảnh cờ và tiếp tục chơi game**.
- **Tiêu chí chấp nhận (Acceptance Criteria - AC):**
  1. Cho phép nhập trường định danh linh hoạt: Có thể là **Username** hoặc **Email**.
  2. Kiểm tra mật khẩu mã hóa (Argon2 / Bcrypt).
  3. Cấp phát cặp JWT:
     - `accessToken`: Thời hạn 15 phút, lưu trong memory state client.
     - `refreshToken`: Thời hạn 7 ngày, lưu trong HTTP-Only Secure Cookie (chống tấn công XSS).
  4. Lưu thông tin hồ sơ rút gọn (`id`, `username`, `display_name`, `avatar_url`, `elo`) vào state client để hiển thị trên Navbar.
  5. Đăng nhập thành công -> Điều hướng trực tiếp vào `SCR-LOBBY.html` (hoặc chuyển tiếp về URL phòng nếu truy cập từ link mời trước đó).
- **Technical Sub-tasks:**
  - `BE-102.1`: Endpoint `POST /api/auth/login` (Xử lý định danh kép Username/Email, cấp JWT).
  - `BE-102.2`: Endpoint `POST /api/auth/refresh-token` và Middleware bảo vệ Route.
  - `FE-102.1`: Form đăng nhập kết nối API, lưu state phiên đăng nhập.

---

### `XQ-STORY-103`: Đăng nhập Google OAuth & Màn hình Onboarding lần đầu
- **Mô tả (User Voice):**
  > Là một **Kỳ thủ muốn đăng nhập nhanh**, tôi muốn **sử dụng tài khoản Google để đăng nhập bằng 1 chạm**, để **không cần ghi nhớ thêm tài khoản mới**.
- **Tiêu chí chấp nhận (Acceptance Criteria - AC):**
  1. Tích hợp Supabase Google OAuth Provider.
  2. Luồng đăng nhập lần đầu (First-time OAuth):
     - Supabase trả về Email và Full Name từ Google.
     - Hệ thống phát hiện chưa có hồ sơ nội bộ -> Chuyển hướng bắt buộc vào màn hình `SCR-ONBOARDING.html`.
     - Kỳ thủ **bắt buộc nhập một Username duy nhất** (3–20 ký tự) và **Mật khẩu dự phòng** (để có thể đăng nhập bằng username nếu sau này không dùng Google).
     - `display_name` khởi tạo mặc định bằng Google Name hoặc Username.
  3. Luồng đăng nhập từ lần thứ hai trở đi:
     - Nhận diện `user_id` đã có hồ sơ -> Cấp JWT và đưa thẳng vào Sảnh cờ `SCR-LOBBY.html`.
- **Technical Sub-tasks:**
  - `BE-103.1`: Callback handler Google OAuth (`GET /api/auth/google/callback`).
  - `BE-103.2`: Endpoint `POST /api/auth/complete-onboarding` lưu username và mật khẩu dự phòng.
  - `FE-103.1`: Giao diện Onboarding theo chuẩn `SCR-ONBOARDING.html`.

---

### `XQ-STORY-104`: Đăng nhập nhanh chế độ Khách (Guest Player)
- **Mô tả (User Voice):**
  > Là một **Người chơi vãng lai**, tôi muốn **chơi thử ngay lập tức mà không cần tạo tài khoản email**, để **trải nghiệm bàn cờ và giao lưu nhanh với bạn bè**.
- **Tiêu chí chấp nhận (Acceptance Criteria - AC):**
  1. Khi bấm nút "Chơi Nhanh Dưới Dạng Khách" tại `SCR-LOGIN.html`:
     - Bật hộp thoại `MODAL-GUEST-NAME`.
     - Cho phép nhập Tên hiển thị (2–20 ký tự, không chứa từ tục tĩu/ký tự cấm). Có gợi ý tự sinh: `Khach_XXXX`.
  2. Cảnh báo quyền hạn rõ ràng:
     - Hiển thị badge: *"Tài khoản Khách không được lưu điểm Elo và không được tham gia Đánh Xếp Hạng (Ranked)"*.
  3. Lưu trạng thái:
     - Tạo `guest_id` định dạng `guest_<uuid>` lưu vào Session/LocalStorage.
     - Cấp token Guest với scope quyền hạn giới hạn (chỉ được vào phòng Casual hoặc Đấu Máy).
     - Chuyển hướng vào `SCR-LOBBY.html` với badge "⚡ Khách".
- **Technical Sub-tasks:**
  - `BE-104.1`: Endpoint `POST /api/auth/guest-session` (Tạo phiên tạm, không ghi user vĩnh viễn vào auth core).
  - `FE-104.1`: Modal popup nhập tên khách, xử lý gán cờ `is_guest: true`.

---

### `XQ-STORY-105`: Khôi phục & Đặt lại mật khẩu qua Email OTP
- **Mô tả (User Voice):**
  > Là một **Kỳ thủ quên mật khẩu**, tôi muốn **yêu cầu mã OTP qua Email đã đăng ký để tạo mật khẩu mới**, để **khôi phục lại quyền truy cập tài khoản của mình**.
- **Tiêu chí chấp nhận (Acceptance Criteria - AC):**
  1. **Màn hình yêu cầu OTP (`SCR-FORGOT-PASSWORD.html`):**
     - Nhập Email đã liên kết với tài khoản.
     - Kiểm tra nếu Email không tồn tại: Trả về thông báo chung để chống rò rỉ enumeration user (*"Nếu email tồn tại trong hệ thống, mã OTP đã được gửi"*).
     - Khóa nút gửi lại 60 giây.
  2. **Màn hình đặt lại mật khẩu (`SCR-RESET-PASSWORD.html`):**
     - Nhập mã OTP 6 số.
     - Nhập mật khẩu mới và xác nhận mật khẩu mới.
     - Hiển thị thanh đo độ mạnh mật khẩu (Yếu / Trung Bình / Mạnh / Rất Mạnh).
     - Đặt lại thành công -> Hủy toàn bộ Refresh Token cũ trên các thiết bị khác -> Chuyển về màn hình Đăng nhập kèm thông báo thành công.
- **Technical Sub-tasks:**
  - `BE-105.1`: Endpoint `POST /api/auth/forgot-password` (Gửi OTP khôi phục qua email).
  - `BE-105.2`: Endpoint `POST /api/auth/reset-password` (Verify OTP, cập nhật mật khẩu đã hash, thu hồi session cũ).
  - `FE-105.1`: Giao diện Quên & Đặt lại mật khẩu tương ứng mockup HTML.

---

## 3. Bảng Phân Rã Chi Tiết Từng Engineering Task (WBS)

### Phân rã Task cho `XQ-STORY-101` (Đăng ký tài khoản Wizard 3 bước)

| Mã Task Jira | Loại | Vai trò đảm nhiệm | Ước lượng (Hours) | Mô tả chi tiết kỹ thuật bàn giao |
| :--- | :---: | :---: | :---: | :--- |
| **`XQ-TASK-1011`** | Sub-task | Database Engineer | 4h | **Thiết kế Schema CSDL & Migration:**<br>• Tạo bảng `users` (id UUID, email unique, password_hash, status, created_at).<br>• Tạo bảng `user_profiles` (user_id FK, username unique, display_name, avatar_url, elo default 1200).<br>• Tạo unique index cho `username` và `email`. Viết migration Prisma. |
| **`XQ-TASK-1012`** | Sub-task | Backend (NestJS) | 6h | **API Khởi tạo đăng ký & Gửi OTP:**<br>• Endpoint `POST /api/auth/register-intent`.<br>• ValidationPipe kiểm tra regex username, format email, độ mạnh mật khẩu.<br>• Kiểm tra trùng username/email trong DB.<br>• Gọi Supabase Auth Admin API để sinh và gửi OTP 6 số về Email. |
| **`XQ-TASK-1013`** | Sub-task | Backend (NestJS) | 5h | **API Xác thực OTP & Kích hoạt tài khoản:**<br>• Endpoint `POST /api/auth/verify-register-otp`.<br>• Kiểm tra mã OTP qua Supabase Auth.<br>• Đếm số lần sai (max 5 lần hủy mã), kiểm tra TTL 3 phút.<br>• Transaction tạo record `users` + `user_profiles` với `display_name = username` (Phương án C). Cấp cặp token JWT. |
| **`XQ-TASK-1014`** | Sub-task | Frontend (React) | 8h | **Xây dựng Stepper Wizard 3 bước:**<br>• Tạo Component `RegisterWizard` dựa trên `SCR-REGISTER.html`.<br>• Xử lý chuyển bước có animation trượt ngang.<br>• Validation client-side với React Hook Form + Zod.<br>• Debounce 300ms kiểm tra trùng username qua API. |
| **`XQ-TASK-1015`** | Sub-task | Frontend (React) | 6h | **Component Nhập OTP 6 số & Bộ đếm thời gian:**<br>• Tạo Component `OtpInputGroup` (6 ô số riêng biệt, auto-focus ô kế tiếp, paste chuỗi 6 số tự động chia ô, backspace quay lại ô trước).<br>• Logic đếm lùi 3:00 hết hạn mã và đếm lùi 60s nút gửi lại mã. |
| **`XQ-TASK-1016`** | Sub-task | QA / Tester | 4h | **Kiểm thử tích hợp & Edge Cases Đăng ký:**<br>• Viết test suite e2e bằng Playwright.<br>• Kiểm thử các trường hợp: Trùng username, trùng email, OTP hết hạn sau 3 phút, nhập sai 5 lần bị khóa mã, dán chuỗi OTP từ clipboard. |

---

### Phân rã Task cho `XQ-STORY-102` (Đăng nhập Email/Username & Quản lý JWT)

| Mã Task Jira | Loại | Vai trò đảm nhiệm | Ước lượng (Hours) | Mô tả chi tiết kỹ thuật bàn giao |
| :--- | :---: | :---: | :---: | :--- |
| **`XQ-TASK-1021`** | Sub-task | Backend (NestJS) | 6h | **API Đăng nhập linh hoạt (Dual Identifier) & Hash Verify:**<br>• Endpoint `POST /api/auth/login`.<br>• Tự nhận diện input là Email hay Username để truy vấn DB.<br>• Xác thực mật khẩu qua Argon2/Bcrypt.<br>• Sinh Access Token (15m, payload: sub, username, role) và Refresh Token (7d). |
| **`XQ-TASK-1022`** | Sub-task | Backend (NestJS) | 5h | **Quản lý Refresh Token & Auth Guard:**<br>• Cấu hình gắn Refresh Token vào HTTP-Only, Secure, SameSite Cookie.<br>• Endpoint `POST /api/auth/refresh-token` cấp lại access token mới khi token cũ hết hạn.<br>• Viết `JwtAuthGuard` bảo vệ các private route. |
| **`XQ-TASK-1023`** | Sub-task | Frontend (React) | 6h | **Giao diện Đăng nhập & Auth Context:**<br>• Xây dựng `LoginPage` theo chuẩn `SCR-LOGIN.html`.<br>• Nút bật/tắt hiển thị mật khẩu.<br>• Tạo `AuthContext` lưu giữ trạng thái user, tự động gắn Header `Authorization: Bearer <token>` qua Axios interceptor, tự bắt lỗi 401 gọi refresh token. |
| **`XQ-TASK-1024`** | Sub-task | QA / Tester | 4h | **Kiểm thử bảo mật phiên đăng nhập:**<br>• Test đăng nhập sai mật khẩu quá 5 lần.<br>• Test tính an toàn của cookie HTTP-Only (không thể đọc qua Javascript console `document.cookie`).<br>• Test refresh token tự động khi access token 15 phút hết hạn. |

---

### Phân rã Task cho `XQ-STORY-103` (Google OAuth & Onboarding lần đầu)

| Mã Task Jira | Loại | Vai trò đảm nhiệm | Ước lượng (Hours) | Mô tả chi tiết kỹ thuật bàn giao |
| :--- | :---: | :---: | :---: | :--- |
| **`XQ-TASK-1031`** | Sub-task | Backend (NestJS) | 6h | **Tích hợp Supabase Google OAuth Callback:**<br>• Cấu hình Google Cloud Console & Supabase Auth Provider.<br>• Endpoint `GET /api/auth/google/callback`.<br>• Kiểm tra: Nếu user đã có username trong `user_profiles` -> Đăng nhập thành công, trả JWT. Nếu chưa có -> Trả về token tạm `onboarding_token` (TTL 10m). |
| **`XQ-TASK-1032`** | Sub-task | Backend (NestJS) | 4h | **API Hoàn tất Onboarding Google OAuth:**<br>• Endpoint `POST /api/auth/complete-onboarding`.<br>• Verify `onboarding_token`.<br>• Nhận `username` duy nhất và `backup_password`. Băm mật khẩu và cập nhật `user_profiles`. |
| **`XQ-TASK-1033`** | Sub-task | Frontend (React) | 6h | **Tích hợp Nút Google OAuth & Màn hình Onboarding:**<br>• Gắn sự kiện `supabase.auth.signInWithOAuth({ provider: 'google' })` vào nút Google tại `SCR-LOGIN.html`.<br>• Xây dựng `OnboardingPage` theo `SCR-ONBOARDING.html` (Điền sẵn email/name Google, yêu cầu nhập username & mật khẩu dự phòng). |
| **`XQ-TASK-1034`** | Sub-task | QA / Tester | 4h | **Kiểm thử luồng Google OAuth:**<br>• Test đăng nhập Google lần đầu bắt buộc qua Onboarding.<br>• Test đăng nhập Google lần 2 đưa thẳng vào Sảnh.<br>• Test dùng username + mật khẩu dự phòng vừa tạo để đăng nhập thường tại `SCR-LOGIN.html`. |

---

### Phân rã Task cho `XQ-STORY-104` (Đăng nhập nhanh chế độ Khách)

| Mã Task Jira | Loại | Vai trò đảm nhiệm | Ước lượng (Hours) | Mô tả chi tiết kỹ thuật bàn giao |
| :--- | :---: | :---: | :---: | :--- |
| **`XQ-TASK-1041`** | Sub-task | Backend (NestJS) | 4h | **API Cấp quyền Phiên Khách (Guest Session):**<br>• Endpoint `POST /api/auth/guest-session`.<br>• Nhận `display_name` (kiểm tra từ tục tĩu/filter).<br>• Sinh token Guest với payload: `{ sub: 'guest_<uuid>', role: 'GUEST', is_guest: true }`. Không tạo record trong bảng `users` chính thức. |
| **`XQ-TASK-1042`** | Sub-task | Frontend (React) | 4h | **Modal Nhập Tên Khách & Gắn Cờ Quyền Hạn:**<br>• Xây dựng `ModalGuestName` popup nhúng trong `SCR-LOGIN.html`.<br>• Tự sinh tên gợi ý dạng `Khach_8832` nếu người dùng không nhập.<br>• Hiển thị banner cảnh báo không tích điểm Elo.<br>• Lưu cờ `is_guest: true` vào client state, hiển thị pill "⚡ Khách" trên Navbar. |
| **`XQ-TASK-1043`** | Sub-task | QA / Tester | 3h | **Kiểm thử phân quyền chế độ Khách:**<br>• Kiểm tra tài khoản Khách vào được phòng Đánh Thường (Casual) và Đấu Máy (AI).<br>• Kiểm tra tài khoản Khách bị chặn khi bấm nút "Đánh Xếp Hạng" (bật cảnh báo yêu cầu đăng ký). |

---

### Phân rã Task cho `XQ-STORY-105` (Quên & Đặt lại mật khẩu qua OTP)

| Mã Task Jira | Loại | Vai trò đảm nhiệm | Ước lượng (Hours) | Mô tả chi tiết kỹ thuật bàn giao |
| :--- | :---: | :---: | :---: | :--- |
| **`XQ-TASK-1051`** | Sub-task | Backend (NestJS) | 4h | **API Yêu cầu OTP Khôi phục Mật khẩu:**<br>• Endpoint `POST /api/auth/forgot-password`.<br>• Kiểm tra email, gửi Supabase OTP reset password.<br>• Áp dụng Rate Limit: Tối đa 1 yêu cầu / 60 giây / 1 địa chỉ email. |
| **`XQ-TASK-1052`** | Sub-task | Backend (NestJS) | 5h | **API Xác thực OTP & Đổi mật khẩu mới:**<br>• Endpoint `POST /api/auth/reset-password`.<br>• Verify OTP 6 số.<br>• Hash mật khẩu mới và cập nhật CSDL.<br>• Hủy (revoke) toàn bộ Refresh Token cũ trên tất cả các thiết bị đang đăng nhập của user này. |
| **`XQ-TASK-1053`** | Sub-task | Frontend (React) | 6h | **Giao diện Quên Mật Khẩu & Đặt Lại Mật Khẩu:**<br>• Xây dựng `ForgotPasswordPage` theo `SCR-FORGOT-PASSWORD.html`.<br>• Xây dựng `ResetPasswordPage` theo `SCR-RESET-PASSWORD.html` với thanh đo Password Strength 4 mức (Yếu / Trung bình / Mạnh / Rất mạnh). |
| **`XQ-TASK-1054`** | Sub-task | QA / Tester | 4h | **Kiểm thử luồng khôi phục mật khẩu:**<br>• Test nhận mã OTP qua mail ảo/MailHog.<br>• Test đổi pass thành công, dùng pass cũ đăng nhập (phải báo lỗi).<br>• Test token cũ trên thiết bị khác bị logout ngay lập tức. |

---

## 4. Tổng Kết Phân Bổ Nguồn Lực EPIC-01

- **Tổng số User Stories:** 5 Stories
- **Tổng số Technical Tasks:** 22 Tasks
- **Tổng số giờ ước lượng (Total Estimated Hours):** **112 giờ** (tương đương 14 Man-Days, phân bổ cho 1 Backend Dev, 1 Frontend Dev, 1 QA Tester trong Sprint 1 kéo dài 2 tuần).
- **Phân bổ theo vai trò:**
  - 🛠️ **Backend:** 9 tasks (~44h)
  - 🎨 **Frontend:** 8 tasks (~46h)
  - 🗄️ **Database:** 1 task (~4h)
  - 🧪 **QA / Automation:** 4 tasks (~18h)

---

## 5. Definition of Done (DoD) Của EPIC-01
- [ ] 100% Endpoint API có unit test và integration test (tỷ lệ bao phủ code coverage $\ge 80\%$).
- [ ] Mật khẩu được mã hóa an toàn bằng Argon2/Bcrypt, không có log plaintext mật khẩu hoặc mã OTP trong server console.
- [ ] Hoàn thành kiểm thử e2e luồng Đăng ký -> Xác thực OTP -> Tự động chuyển vào Sảnh.
- [ ] Kiểm thử responsive trên các kích thước Desktop (1920x1080), Tablet (768px), Mobile (390px).
- [ ] Toàn bộ chuỗi văn bản thông báo lỗi hỗ trợ tiếng Việt chuẩn.
