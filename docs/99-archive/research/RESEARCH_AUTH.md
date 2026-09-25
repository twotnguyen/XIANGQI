# Nghiên cứu xác thực: Supabase Auth với username, Google và SPA + BFF

> Tài liệu nghiên cứu đầu vào, không phải hợp đồng thực thi cuối. Đọc docs/specs/05-AUTH.md hoặc docs/specs/06-MEDIA.md từ repo root; các lựa chọn khác trong nghiên cứu không tự mở rộng phạm vi.
**Ngày kiểm tra:** 2026-09-12. **Phạm vi:** đặc tả kỹ thuật cho đồ án; chưa phải mã triển khai. Các API và giới hạn của Supabase cần được kiểm tra lại ở thời điểm thực hiện vì `@supabase/ssr` hiện vẫn được Supabase ghi nhận là beta.

## Quyết định kiến trúc duy nhất

Chọn **SPA React/TypeScript ở Vercel** (khi triển khai; local là `http://localhost:<web-port>`) và **BFF/game server TypeScript ở Render** (local là `http://localhost:<api-port>`). Trình duyệt dùng Supabase Auth với publishable key và **phiên bearer JWT lưu trong browser storage do Supabase client quản lý**. Mọi API nghiệp vụ (tài khoản game, phòng, bạn bè, nước cờ, chat, media-token) đều đi từ SPA sang BFF bằng `Authorization: Bearer <access token>`.

Không dùng cookie phiên đăng nhập, cookie chia sẻ Vercel--Render, Vercel rewrite proxy, hoặc session tự phát minh. Đây là lựa chọn đơn giản và phù hợp hai origin khác nhau: cookie từ Render sẽ là cookie cross-site/third-party khi SPA ở Vercel gọi API, dễ lỗi theo chính sách trình duyệt. Supabase JS mặc định lưu session bền vững ở local storage; đây là mô hình SPA mà lựa chọn này chấp nhận. [Supabase JavaScript Auth overview](https://supabase.com/docs/reference/javascript/auth)

Hệ quả bảo mật bắt buộc:

- BFF chỉ chấp nhận `Authorization: Bearer`; không đọc access/refresh token từ URL query, body hay cookie.
- Vì thông tin xác thực **không tự động được trình duyệt gửi như cookie**, không áp dụng double-submit CSRF token cho API bearer này. BFF vẫn bật CORS allowlist chính xác cho origin local và Vercel, chỉ cho các phương thức/header cần thiết, không dùng `*`, và không bật credentials.
- Cần phòng XSS nghiêm ngặt vì script độc hại cùng origin có thể đọc browser storage: CSP không cho inline/eval tùy tiện, không render HTML chat do người dùng cung cấp, escape/sanitize nội dung, không đặt token trong log/analytics/error report, không thêm SDK bên thứ ba không cần thiết.
- Chỉ publishable/anon key và URL Supabase được xuất hiện ở SPA. `sb_secret_...` (hoặc legacy `service_role`) chỉ nằm trong biến môi trường Render/local server, không có tiền tố build-time/public. Secret key bỏ qua RLS và Supabase yêu cầu chỉ dùng trong môi trường server tin cậy. [Supabase Users docs](https://supabase.com/docs/guides/auth/users)
- SPA không ghi trực tiếp các bảng game bằng Supabase REST. RLS vẫn bật ở tất cả bảng public, nhưng BFF là điểm kiểm tra quyền và trạng thái ván chính thức. Điều này cũng giúp thu hồi phiên có hiệu lực ngay ở API của ứng dụng.

### Thành phần và khóa

| Thành phần | Được giữ | Tuyệt đối không giữ |
| --- | --- | --- |
| SPA Vercel / browser | Supabase URL, publishable key, access token và refresh token do Supabase client lưu | service/secret key, danh sách email, mật khẩu, bảng username--email |
| BFF Render | Supabase URL, publishable key cho `getUser`, secret/service key cho tác vụ admin và lookup; `APP_ORIGIN` allowlist | refresh token của người dùng lưu lâu dài, mật khẩu sau khi chuyển tiếp xác thực |
| Supabase Auth | hash mật khẩu, identities, session/refresh-token theo Auth | bảng public vô tình lộ email |
| PostgreSQL public | `profiles` và dữ liệu game; `username_normalized` duy nhất, `id` tham chiếu `auth.users(id)` | email sao chép vào bảng public hoặc `raw_user_meta_data` dùng làm quyền |

Supabase nói rõ schema `auth` không được Auto API expose; dữ liệu người dùng cho ứng dụng cần đặt trong bảng `public` và bảo vệ bằng RLS. [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)

## Mô hình dữ liệu và invariants

`public.profiles` là định danh game, tối thiểu có `id uuid primary key references auth.users(id) on delete cascade`, `username nullable`, `username_normalized nullable`, `display_name`, `created_at`, `updated_at`. Có unique partial constraint/collation phù hợp trên `username_normalized where username_normalized is not null` (chọn ASCII chữ thường, số, `_`, 3--20 ký tự ở bản đầu; không cho đổi username ở MVP). `username` là tên đăng nhập; `display_name` là tên hiển thị, không dùng để đăng nhập. Giá trị `null` chỉ tồn tại trong vài phút onboarding Google và bị BFF chặn khỏi mọi endpoint game.

Tạo profile bằng trigger `AFTER INSERT ON auth.users`, dùng `SECURITY DEFINER SET search_path = ''`, đọc username ban đầu từ `new.raw_user_meta_data`. Nếu đó là email signup, trigger kiểm tra/chuyển lowercase và insert username; nếu Google account mới chưa có username, trigger insert profile với username `null`. Constraint unique là nguồn sự thật khi hai người đăng ký trùng lúc. Supabase đưa chính mẫu `public.profiles` tham chiếu `auth.users` và trigger tạo profile, đồng thời cảnh báo trigger lỗi sẽ chặn đăng ký nên migration này phải được test kỹ. [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)

Không dùng `user_metadata` để quyết định quyền hoặc làm nguồn username về sau: Supabase ghi rõ metadata người dùng có thể bị người dùng sửa và không dùng được cho RLS/authorization. Sau lúc trigger tạo profile, mọi truy vấn username lấy từ `public.profiles`; thay đổi display name không được ghi đè username. [Supabase Users docs](https://supabase.com/docs/guides/auth/users)

Hai bảng server-only hỗ trợ kiểm soát phiên:

- `auth_session_revocations(session_id uuid primary key, user_id uuid, revoked_at, reason)`; BFF kiểm trước khi thực hiện bất kỳ mutation game nào. Không cấp SELECT/INSERT cho `anon` hay `authenticated`.
- `auth_user_revocations(user_id uuid primary key, revoke_before timestamptz, reason)`; dùng cho “logout all”/reset mật khẩu. BFF từ chối JWT có `iat` không mới hơn `revoke_before`, kể cả session id đó chưa từng gọi API trước đây.
- `auth_audit_events(id, user_id nullable, action, session_id nullable, ip_hash, user_agent_hash, created_at, metadata_sanitized)`; không chứa access token, refresh token hoặc mật khẩu.

## Luồng chính xác

### 1. Đăng ký username + email + mật khẩu

1. SPA kiểm tra format username/mật khẩu, hiển thị Turnstile/hCaptcha nếu đã bật, rồi gọi trực tiếp `supabase.auth.signUp({ email, password, options: { data: { signup_username: normalized, signup_display_name: displayName }, emailRedirectTo: APP_ORIGIN + '/auth/confirm', captchaToken } })`. Không có endpoint nào cho SPA kiểm tra “username/email có tồn tại không”. Đây không làm lộ bảng username--email: browser chỉ gửi email của chính mình cho Supabase Auth.
2. Auth tạo `auth.users`; trigger tạo chính xác một `profiles` row hoặc làm cả đăng ký lỗi nếu username bị đụng. SPA luôn hiển thị thông điệp chung “Nếu đăng ký hợp lệ, hãy kiểm tra email”; không tiết lộ email đã tồn tại hoặc username trùng. Supabase cũng chủ đích làm mờ phản hồi khi email đã có tài khoản để tránh enumeration. [signUp reference](https://supabase.com/docs/reference/javascript/auth-signup)
3. BFF không nhận mật khẩu ở luồng đăng ký và không có quyền client-side để tra mapping username--email. Supabase Auth CAPTCHA/rate limit bảo vệ endpoint trực tiếp; profile trigger + unique constraint giữ invariant username.
4. Supabase phải bật **Confirm Email**. Khi bật, người dùng không có session đăng nhập ngay sau đăng ký; email xác minh là bước bắt buộc. [General configuration](https://supabase.com/docs/guides/auth/general-configuration)
5. Xác nhận email dùng redirect URL đã allowlist đúng tuyệt đối: SPA `/auth/confirm` nhận `code`, gọi `supabase.auth.exchangeCodeForSession(code)` với PKCE verifier Supabase client đã lưu, rồi gọi `/me`. PKCE code chỉ sống 5 phút và dùng một lần; lỗi/hết hạn dẫn người dùng tới gửi lại email. [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)

Lưu ý triển khai: `signUp` hỗ trợ email verification với PKCE khi autoconfirm tắt và có `options.data`/`emailRedirectTo`; không bật autoconfirm để “đơn giản hóa” vì yêu cầu cần email xác minh. [signUp reference](https://supabase.com/docs/reference/javascript/auth-signup)

### 2. Đăng nhập bằng username + mật khẩu (không lộ ánh xạ)

1. SPA gửi username + password + captcha token (nếu cấu hình) tới **BFF** `POST /auth/password/login`, qua HTTPS. Endpoint không trả email, profile, hay phân biệt username không tồn tại với mật khẩu sai.
2. BFF chuẩn hóa username; dùng secret/service-key database client để lấy `profiles.id` từ username, rồi `auth.admin.getUserById(id)` ở server để nhận email nội bộ. Không gửi email về browser và không tạo RPC public trả email. Nếu lookup không có, BFF vẫn trả cùng thông báo/nhịp xử lý thất bại tổng quát.
3. BFF gọi `auth.signInWithPassword({email, password, options:{captchaToken}})`. Đây là API chính thức chỉ nhận email/phone + password, nên lớp username resolver là cần thiết. [signInWithPassword reference](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
4. Nếu thành công, BFF trả `session: {access_token, refresh_token}` qua JSON **chỉ trong HTTPS response**; SPA gọi `supabase.auth.setSession(session)` ngay, sau đó dùng access token gửi Bearer đến BFF. Không đặt token vào URL, local app state persistence riêng, console, log hoặc analytics. BFF không giữ refresh token.
5. BFF trả lỗi tổng quát `INVALID_CREDENTIALS` cho lookup/sign-in lỗi; `429` có thông báo đợi rồi thử lại. Chỉ session hợp lệ mới cho phép `/me` trả username/display name.

Đây là đánh đổi cố ý của SPA: token có mặt ở JavaScript để client Supabase tự refresh. Không thay token JSON bằng một cookie Render vì SPA Vercel gọi Render cross-site sẽ phụ thuộc third-party cookie. Supabase ghi rõ HTTP-only cookie chỉ khả thi cho ứng dụng truyền thống server-only; rich client JavaScript không thể tự đọc/refresh phiên đó. [User sessions](https://supabase.com/docs/guides/auth/sessions)

### 3. Google OAuth dùng PKCE

1. Google Cloud tạo OAuth Web client. Thêm **Authorized JavaScript origins** cho local/Vercel SPA; thêm **Authorized redirect URI** là callback Supabase `/auth/v1/callback`, không phải callback SPA. Bật Google provider trong Supabase, đặt Client ID/Secret chỉ tại Supabase. [Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
2. SPA khởi tạo `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: APP_ORIGIN + '/auth/callback' } })` bằng client cấu hình `flowType: 'pkce'`, `detectSessionInUrl: false`. Supabase client giữ PKCE verifier/state trong browser storage.
3. Trình duyệt đi Google → Supabase callback → URL allowlist `/auth/callback?code=...`. Trang callback chỉ đọc code, gọi `exchangeCodeForSession(code)`, xóa URL bằng `history.replaceState`, rồi gọi BFF `/me`. Không chấp nhận `next` từ query; điều hướng cố định tới `/` hoặc onboarding.
4. Nếu Auth trả user không có profile username (tài khoản Google mới), đưa tới `/onboarding/username`: người dùng chọn username/display name; BFF xác thực bearer, tạo profile bằng RPC/server transaction có unique constraint. Chỉ sau khi thành công mới được vào lobby. Nếu profile đã có, vào lobby ngay.

Supabase ghi cho PKCE rằng callback nhận `code` và bắt buộc exchange code lấy session; code có thời hạn 5 phút, dùng đúng một lần. `redirectTo` phải nằm allowlist Auth. [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

### 4. Xác minh email và khôi phục mật khẩu

- **Xác minh:** chọn template/link Supabase PKCE chuẩn; redirect chỉ tới `http://localhost:<web-port>/auth/confirm` hoặc origin Vercel production đã đăng ký. Không tạo redirect động từ request. `emailRedirectTo` bị bỏ qua nếu URL không nằm allowlist. [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Users docs](https://supabase.com/docs/guides/auth/users)
- **Quên mật khẩu:** SPA chỉ nhận email, luôn hiện “Nếu email có tài khoản, hãy kiểm tra hộp thư”. Gọi trực tiếp `resetPasswordForEmail(email, { redirectTo: APP_ORIGIN + '/auth/recovery', captchaToken })`; browser lưu PKCE verifier cần thiết cho callback. Callback PKCE đổi code lấy session, hiển thị form mật khẩu mới, rồi `updateUser({password})`; sau đó gọi `/auth/logout-all` và bắt người dùng đăng nhập lại. Không có endpoint recovery bằng username vì username resolver phải không tiết lộ email.
- Email link/OTP mặc định có thời hạn 24 giờ theo Supabase JS docs; UI phải xử lý link đã dùng/hết hạn bằng nút gửi lại. Link scanner có thể tiêu thụ link đơn dụng; Supabase khuyến nghị có landing page trên domain của mình với nút người dùng bấm rồi mới theo link gốc nếu vấn đề này xảy ra. [JavaScript Auth overview](https://supabase.com/docs/reference/javascript/auth), [Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- Local/demo: dùng email test đã authorize hoặc SMTP test. Nếu cho người ngoài đăng ký/demo public, cấu hình custom SMTP; SMTP mặc định chỉ phục vụ thử nghiệm, có giới hạn rất thấp và có thể chỉ gửi tới thành viên team. [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

### 5. Liên kết Google và email/password

Mặc định Supabase **tự liên kết** identity Google với user hiện hữu nếu email giống nhau và điều kiện an toàn email được thỏa; không tự viết logic "tìm email rồi merge user". Điều này tránh pre-account takeover. Nếu user email/password xác minh `a@example.com` rồi bấm Google cùng email, session phải dẫn về cùng `auth.users.id`/profile; test bắt buộc. [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)

Bổ sung màn hình Settings “Liên kết Google” sau khi đăng nhập: chỉ bắt đầu `linkIdentity({provider:'google'})` trong session hiện hữu, bật **Allow manual linking** trên Supabase và dùng OAuth PKCE callback. Manual linking hiện được tài liệu ghi beta. Không cho unlink identity cuối cùng; Supabase yêu cầu tài khoản còn tối thiểu hai identity để unlink. [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)

Không tự link Google có email khác chỉ vì username/display name giống nhau. Trong onboarding Google, profile là game handle, không phải bằng chứng sở hữu email. Không đổi/quản lý mật khẩu tự viết: Supabase cho phép thêm password vào OAuth account qua `updateUser({password})`, nhưng UX đó cần re-authentication khi triển khai phần cài đặt sau. [Identity linking FAQ](https://supabase.com/docs/guides/auth/auth-identity-linking)

## Xác thực request, refresh và thu hồi session

### BFF middleware

Với mỗi API cần đăng nhập:

1. Parse chính xác `Authorization: Bearer <token>`; từ chối token thiếu/sai định dạng.
2. Gọi `supabase.auth.getUser(token)` ở server. Đây là network request đến Auth nên user trả về xác thực được; không dùng `getSession()` hoặc chỉ decode JWT làm căn cứ quyền. [getUser reference](https://supabase.com/docs/reference/javascript/auth-getuser)
3. Đọc `sub`, `session_id` và `iat` từ token **sau** xác thực; tra `auth_session_revocations` theo `session_id` và `auth_user_revocations` theo user. Nếu session bị đánh dấu hoặc `iat` không mới hơn `revoke_before`, trả 401 và yêu cầu client sign out.
4. Nạp profile theo `user.id`; yêu cầu profile tồn tại với mọi endpoint game. Kiểm tiếp membership/room role trên server; `user_metadata` không phải quyền.

Browser client bật auto refresh theo mặc định. Refresh token chỉ dùng một lần, Supabase cấp cặp access/refresh token mới khi refresh. Access token thường 5 phút--1 giờ, và Supabase khuyến nghị mặc định một giờ, không giảm dưới 5 phút cho đa số app. [User sessions](https://supabase.com/docs/guides/auth/sessions)

### Đăng xuất và “revoke ngay” trong ứng dụng

- **Đăng xuất thiết bị này:** SPA gọi BFF `POST /auth/logout` với Bearer. BFF xác thực token, insert/upsert `session_id` vào `auth_session_revocations`, hủy socket/game presence của session đó, trả 204. Sau đó SPA gọi `supabase.auth.signOut({scope:'local'})`, xóa local session và quay lại login. Thứ tự BFF trước tránh mất thông tin `session_id`.
- **Đăng xuất mọi thiết bị/đổi mật khẩu:** SPA gọi BFF `POST /auth/logout-all`; BFF upsert `auth_user_revocations.revoke_before = now()` và hủy socket của user, sau đó client gọi `signOut({scope:'global'})`. Global signout xóa refresh tokens của các session; access token đã phát hành vẫn chỉ hết hiệu lực ở `exp`, nên cutoff `iat` app-side giữ hiệu lực ngay đối với BFF, kể cả session chưa từng gọi BFF. [Signing out](https://supabase.com/docs/guides/auth/signout), [User sessions](https://supabase.com/docs/guides/auth/sessions)
- BFF không coi revocation table là thay thế Supabase signout: nó chỉ bảo vệ API/game của app trong cửa sổ access-token. Không cấp browser direct-write database permissions để access token cũ có đường ghi khác.
- Khi nhận `401`, SPA gọi `signOut({scope:'local'})`, dọn state/socket và hiện login. Không tự retry password request. Khi nhiều tab refresh cạnh tranh, dựa vào Supabase client; không tự viết refresh endpoint.

Supabase xác nhận revoke/signout xóa refresh tokens nhưng access JWT đã cấp tồn tại đến expiration. Với thao tác nhạy cảm, docs đề xuất kiểm `session_id` với `auth.sessions`; revocation table app-side áp dụng cùng nguyên lý cho BFF và không cần browser có service secret. [User sessions](https://supabase.com/docs/guides/auth/sessions), [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)

## Cấu hình local trước, Vercel/Render sau

| Hạng mục | Local | Production |
| --- | --- | --- |
| SPA origin | `http://localhost:<web-port>` | `https://<app>.vercel.app` hoặc custom domain HTTPS |
| BFF origin | `http://localhost:<api-port>` | `https://<api>.onrender.com` hoặc custom API domain HTTPS |
| Auth Site URL | local web URL trong project local/dev riêng | exact production web origin trong production project |
| Auth Redirect URLs | exact local `/auth/confirm`, `/auth/recovery`, `/auth/callback` | exact production paths; không dùng wildcard rộng |
| Google JS origin | exact local origin | exact production web origin |
| Google redirect URI | callback Supabase local (`127.0.0.1:54321` nếu dùng CLI) | callback hiển thị trên trang Google provider của Supabase |
| BFF CORS | chỉ local SPA origin | chỉ production SPA origin |

Dùng Supabase project riêng cho local/dev và production nếu có thể; không dùng wildcard redirect URL như `https://**` trong production. Google/Supabase đều yêu cầu cấu hình callback hợp lệ; Supabase nhấn mạnh redirect URI chính xác và HTTPS production. [Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google), [Redirect URI guidance](https://supabase.com/docs/guides/auth/oauth-server/getting-started)

## Cấu hình chống lạm dụng và giới hạn

- Bật Confirm Email, Google provider, PKCE, CAPTCHA (ưu tiên Cloudflare Turnstile hoặc hCaptcha), và rate limit BFF cho username login/onboarding. Đăng ký và recovery trực tiếp được Supabase CAPTCHA/rate-limit bảo vệ. Supabase hỗ trợ CAPTCHA ở sign-up, sign-in và password reset. [CAPTCHA guide](https://supabase.com/docs/guides/auth/auth-captcha)
- Tôn trọng 429. Auth mặc định giới hạn signup/signin theo IP, xác minh và token endpoint; email mặc định rất thấp (hiện tài liệu nêu 2 email/giờ khi không dùng custom SMTP). Đây là lý do demo nhiều người phải chuẩn bị SMTP test/custom, không phải bug ứng dụng. [Rate limits](https://supabase.com/docs/guides/auth/rate-limits)
- Password policy: tối thiểu 12 ký tự, không tự hash (Supabase xử lý password), dùng generic error. Không log input request của các endpoint auth.
- Chỉ gồm HTTPS production, HSTS ở custom domain nếu có, CSP, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `frame-ancestors 'none'` trừ khi có nhu cầu nhúng.

## Tiêu chí kiểm chứng cho issue triển khai

1. Đăng ký username hợp lệ tạo đúng một `profiles` row; hai đăng ký cùng normalized username chỉ một thành công; email chưa xác minh không vào lobby.
2. Login username đúng tạo session; username sai và mật khẩu sai cùng phản hồi công khai; browser/network không nhận email; publishable-key client không SELECT được mapping username--email.
3. Google lần đầu bắt chọn username; Google cùng email đã xác minh dẫn vào cùng profile; Google email khác không merge; manual link/unlink tuân điều kiện identity.
4. OAuth, confirm email và recovery dùng PKCE code một lần; redirect ngoài allowlist/open redirect bị từ chối; URL callback được dọn code trước khi app tiếp tục.
5. API BFF thiếu/bearer giả/revoked trả 401; token hợp lệ có `session_id` revoked không thể tạo phòng/đi nước/chat; logout local/global dọn SPA state và socket.
6. CORS chỉ chấp nhận đúng origin; request cross-origin không có bearer bị từ chối; app không dựa cookie/`credentials: include`; kiểm thử CSP/XSS tối thiểu không rò token trong console/log.
7. CAPTCHA/rate limit/recovery email 429 được hiển thị; local SMTP test hoạt động; production checklist dùng custom SMTP trước khi mở người dùng thật.

## Nguồn chính thức

- [Supabase Auth sessions](https://supabase.com/docs/guides/auth/sessions) — access/refresh-token, phạm vi signout, window access JWT và ghi chú HTTP-only cookie.
- [Supabase Server-Side Auth advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — cơ chế PKCE/session cookie khi dùng SSR; dùng làm đối chứng cho quyết định SPA bearer hiện tại.
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google) — cấu hình Google callback và code exchange PKCE.
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking) — tự/manual linking và điều kiện unlink.
- [Supabase managing user data](https://supabase.com/docs/guides/auth/managing-user-data) — profile table, trigger, RLS, access-token deletion caveat.
- [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits) và [SMTP](https://supabase.com/docs/guides/auth/auth-smtp) — giới hạn/điều kiện gửi email.
