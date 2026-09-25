# Supabase Auth: username, Google, email và phiên

Đây là hợp đồng triển khai chính thức; [nghiên cứu](../planning/RESEARCH_AUTH.md) cung cấp nguồn nhưng có ví dụ/đề xuất rộng hơn, không override tài liệu này.

## Browser Auth và BFF

SPA dùng supabase-js `flowType:'pkce'`, `persistSession:true`, `autoRefreshToken:true`, `detectSessionInUrl:false`. Token do SDK quản lý trong browser storage; không sao chép sang store persistence khác, URL hay log. BFF không giữ refresh token. Auth page không nhúng script bên thứ ba ngoài provider challenge nếu người dùng đã cấu hình.

Supabase password API nhận email/phone, không username. POST `/api/v1/auth/login` nhận username/password; server lookup `profiles.user_id` theo normalized username, gọi admin.getUserById để lấy email nội bộ rồi dùng một Auth client mới cho từng request với persistSession:false, autoRefreshToken:false, detectSessionInUrl:false (không dùng singleton sign-in) gọi signInWithPassword. Trả session tối thiểu access_token/refresh_token/expires_in; client setSession rồi GET /me. Không trả mapping email khi chưa xác thực, không public RPC resolve username. Token JWT/session của chính tài khoản có thể chứa email chính họ, không tuyên bố login response tuyệt đối không có email encoded. Lỗi sai username/password chung `UNAUTHENTICATED` + “Thông tin đăng nhập không đúng”. Không log body.

Nguồn: [signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [sessions](https://supabase.com/docs/guides/auth/sessions).

## Đăng ký, xác minh và recovery

Signup/recovery/resend đi **trực tiếp Supabase SDK từ browser** để giữ PKCE verifier ở đúng browser. Không xây BFF register/recover rồi exchange code ở browser khác verifier.

Signup `signUp({email,password,options:{data:{signup_username,signup_display_name},emailRedirectTo: APP_ORIGIN+'/auth/callback'}})`. Trigger AFTER INSERT auth.users (SECURITY DEFINER, search_path rỗng) tạo profiles: username từ signup metadata được kiểm tra format/unique, Google chưa có username thì null. Trigger không lấy role từ metadata. Metadata về sau thay đổi không cập nhật username/quyền. Sai format/conflict trả lỗi đăng ký tổng quát kèm hướng dẫn chọn username khác/gửi lại; không cấp endpoint liệt kê email. Google onboarding `POST /auth/complete-profile` khóa profile, chỉ set username một lần; displayName PATCH /me.

Confirm Email bật. Callback `/auth/callback` exchangeCodeForSession đúng một lần rồi replaceState xóa code; profile null → `/onboarding`; đủ profile → `/lobby`. Nếu link mở browser khác thiếu verifier: thông báo xác minh/đăng nhập lại hoặc gửi lại từ browser hiện tại, không bỏ PKCE. Có test reload callback đã dùng và lỗi expired. [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [profile trigger](https://supabase.com/docs/guides/auth/managing-user-data).

Quên mật khẩu nhập email; SDK resetPasswordForEmail redirect `/auth/reset-password`. Callback exchange code rồi hiển thị form đổi mật khẩu, updateUser password, gọi BFF logout ALL, signOut global và quay về login. Nếu logout BFF lỗi, chưa báo hoàn thành thu hồi phiên; có retry. Resend dùng SDK `resend({type:'signup',email,options:{emailRedirectTo:APP_ORIGIN+'/auth/callback'}})`. Cả recovery/resend thông báo chung, tôn trọng 429. Password tối thiểu 10 ký tự theo product, không tự đổi thành 12 vì nghiên cứu có đề xuất khác.

Google `signInWithOAuth` redirect `/auth/callback`, Supabase callback mới là Google Authorized redirect URI. Config exact local/prod URL allowlists. Supabase auto identity linking cho email đã xác minh; kiểm thử cùng user_id. Không thêm manual link/unlink UI trong phạm vi này, không tự merge email khác. Tài khoản chỉ Google không bắt buộc có mật khẩu trong phạm vi này; UI ghi “Đăng nhập bằng Google” nếu chưa từng tạo password. Không tự thêm flow đặt mật khẩu/identity vào bản này. Recovery được nghiệm thu cho tài khoản có password; Google-only vẫn đăng nhập Google. [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

## Xác thực và thu hồi

Server xác thực JWT bằng getClaims/JWKS verify chính thức (issuer, audience authenticated, exp, sub); không chỉ decode. Handshake và GET /me dùng getUser để lấy trạng thái tài khoản/email; game command dùng claims đã verify + session active check trong DB. Tạo hàm private `is_auth_session_active(session_id uuid, user_id uuid)` SECURITY DEFINER chỉ server role EXECUTE, tìm đúng auth.sessions.id/user_id. BFF gọi function bằng pg với role app_server được cấp EXECUTE, không gọi RPC Data API. Role này không được SELECT trực tiếp auth.sessions hoặc sửa auth tables. Không expose auth.sessions hoặc function qua Data API. Test revoked refresh session ngay cả JWT còn exp. [Sessions: session_id check](https://supabase.com/docs/guides/auth/sessions), [getClaims](https://supabase.com/docs/reference/javascript/auth-getclaims).

`POST /auth/logout {scope:CURRENT|ALL}`: server dùng admin.signOut(jwt, local|global), chỉ báo success khi Auth đã revoke; đánh dấu private.revoked_sessions với session_id hiện tại cho CURRENT; ALL đóng tất cả socket/media của user và query session check chặn những session Auth đã revoke. Revoked-session row giữ ít nhất max(24 giờ, thời hạn JWT cấu hình + 60 giây clock skew) rồi chỉ xóa khi session Auth không tồn tại. Session-active check vẫn bắt buộc ở mỗi command. Không dựa duy nhất iat cutoff vì refresh tạo iat mới; không dựa client tự gọi signOut để bảo vệ server. Sau success client gọi SDK signOut scope phù hợp best-effort và luôn clear UI/session local kể cả lần gọi Auth thứ hai báo phiên đã bị thu hồi. [Admin signout](https://supabase.com/docs/reference/javascript/auth-admin-signout).

Server kiểm active session + profile verified/onboarding + membership ở mỗi command, HTTP history và media token. Socket heartbeat kiểm lại session, token expired disconnect; reconnect dùng token SDK refresh. Logout immediate đóng kết nối đã lập của session. Khóa tài khoản provider có thể khiến getUser thất bại; không cache vô hạn. Auth service unavailable fail closed, 503 và UI retry; không coi là mất trận ngay trước chính sách grace.

## Local và deploy

Local Supabase CLI mail inbox để xác minh/recovery thật, không auto-confirm fixture người dùng production. Test fixtures dùng admin setup riêng trong project test. Google thật cần OAuth client do người dùng cấu hình; test callback mock trong CI được gắn nhãn, smoke Google thật là gate riêng.

BFF CORS allowlist APP_ORIGIN, bearer only, không credentials cookie. Cross-origin cookie CSRF không áp dụng; XSS/Origin/rate limit vẫn phải kiểm. Login 5 lần/phút/IP+username normalized; signup/recovery dùng Supabase rate limits, CAPTCHA khi public cấu hình. Local không bắt mua CAPTCHA. Custom SMTP cần khi demo cho nhiều người ngoài team; [SMTP mặc định có giới hạn](https://supabase.com/docs/guides/auth/auth-smtp). Không gọi Auth admin bằng key publishable hoặc đặt secret trên Vercel frontend.

## Constraint SQL bắt buộc

```sql
CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,24}$');
UNIQUE (username);
```

Lưu trực tiếp dạng lowercase canonical trong cột username; CHECK regex loại chữ hoa ở DB, không chỉ normalize ở UI. PostgreSQL UNIQUE cho phép nhiều NULL onboarding. Hai signup Alice/alice đều được normalize thành alice trước insert; chỉ một thành công.
