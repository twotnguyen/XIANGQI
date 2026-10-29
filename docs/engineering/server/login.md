# Đăng nhập bằng Username — XIAN-45 / T09

`POST /auth/login` nhận `{ username, password, remember? }`; `remember` mặc định
`true`. Username được chuẩn hoá chữ thường để tra tài khoản và dùng chung bộ đếm.
Email chỉ dùng nội bộ, không nằm trong phản hồi đăng nhập hoặc thông tin phiên.

Sai tên và sai mật khẩu cùng trả `LOGIN_INVALID`. Năm lần sai trong cửa sổ
15 phút chặn đến 15 phút sau lần sai thứ năm; yêu cầu trong thời gian chặn không
kéo dài hạn. Đăng nhập đúng xoá bộ đếm. Lỗi dịch vụ xác thực không được tính là
mật khẩu sai. Phục hồi đăng ký dùng cùng bộ đếm, với tài khoản do draft phía máy
chủ xác định; trình duyệt không được chọn danh tính phục hồi.

Mỗi phiên có capability ngẫu nhiên 256 bit, chỉ lưu SHA-256 trong database.
Hạn cố định là 30 ngày khi ghi nhớ hoặc 12 giờ khi không ghi nhớ. Cookie
`xiangqi_session` và `xiangqi_refresh` dùng `HttpOnly`, `SameSite=Lax`, `Path=/`
và `Secure` trong production. Không ghi nhớ dùng session cookie, không có
`Max-Age`/`Expires`. Việc đóng trình duyệt còn cần nghiệm thu trên trình duyệt
thật, đặc biệt khi bật khôi phục phiên trình duyệt.

`POST /auth/refresh` nhận refresh token từ cookie hoặc body cho client API;
capability phải còn hiệu lực trước khi gọi Auth, và danh tính/hạn phải được kiểm
lại sau khi gọi. Làm mới token không tạo phiên ứng dụng mới hoặc đổi hạn.
`GET /auth/session` và `POST /auth/logout` yêu cầu bearer cùng capability cookie
hoặc header `X-Xiangqi-Session`; đăng xuất thu hồi capability. Tất cả phản hồi
phiên có `Cache-Control: no-store`. Origin ngoài danh sách CORS bị từ chối với
các phương thức thay đổi dữ liệu. Header capability có mặt luôn được kiểm,
không được bỏ qua để dùng cookie khác.

### Đường kiểm tra phiên khi reload

Tra capability dùng một truy vấn JOIN `app_sessions` với account/profile.
Bearer kiểm cấu trúc capability rồi xác minh chữ ký JWT ES256 cục bộ bằng JWKS
công khai của project (`<url>/auth/v1/.well-known/jwks.json`), kiểm issuer
`<url>/auth/v1`, audience/role `authenticated`, hạn và claim bắt buộc. Sau bước
xác minh/tải khóa, một truy vấn DB kiểm thu hồi, hạn phiên, tài khoản đã xác nhận,
hoàn tất và email/danh tính hiện hành; không dùng snapshot trước đó. Nếu JWT lỗi,
vẫn kiểm phiên DB trước khi trả lỗi để giữ ưu tiên phiên hết hạn/đã thu hồi.
Refresh vẫn kiểm DB trước và sau lời gọi provider, đối chiếu ID, email đã xác
nhận và trạng thái đăng ký từ `user`; không gọi thêm `getUser` cho token vừa cấp.
Bearer không có fallback HS256, alg none hay userinfo. Khoá JWKS dùng cache mặc
định của jose (10 phút); không cache token, kết quả xác minh hoặc quyền.
Khi khóa đã có và JWT còn hạn, Auth API lỗi không chặn phiên DB hợp lệ; khóa chưa
có/hết cache mà tải thất bại thì từ chối. Thu hồi appSession có hiệu lực qua DB;
thu hồi bearer/key riêng trên provider không được phát hiện tức thì: phụ thuộc
hạn JWT và cache khóa ở Supabase Edge/server. Đây là chính sách tối ưu đã được
người dùng chấp thuận; không thay thế logout/thu hồi phiên DB. Controller tái sử dụng actor
đã kiểm, guard gắn actor vào request để API phiên/hồ sơ dùng lại; không cache
giữa các request, không đổi role database và không gia hạn `expiresAt`.

Reload frontend vẫn phải chờ `/auth/refresh` trước khi mở trang cần đăng nhập.
Không dùng dữ liệu localStorage làm bằng chứng phiên hợp lệ.

### Email tùy chọn (29/10/2026)

`POST /auth/register/skip` nhận username/password/passwordConfirmation và capability
draft nếu bỏ qua ở bước OTP. Server kiểm lại username, chỉ hủy draft chưa xác minh
thuộc capability đó, tạo profile hoàn tất và cấp phiên. Không coi đóng tab là bỏ qua.
Supabase password vẫn dùng credential email kỹ thuật `<uuid>@username.xiangqi.invalid`
được cấp bằng Admin API; việc xác nhận credential này không chứng minh email liên hệ.
Marker `xiangqi_auth.username_accounts` tồn tại trước khi cấp phiên. Tài khoản thường
và Google cũ không bị chuyển đổi. Bỏ qua không làm giảm quyền thành viên.

`GET /account/email` trả email liên hệ, trạng thái xác minh và yêu cầu đang chờ;
`POST /account/email/send`, `/resend`, `/verify` chỉ nhận user từ SessionGuard.
OTP thêm email có 6 số, hạn 180 giây, gửi lại sau 60 giây, tối đa 5 lần nhập sai,
HMAC lưu trong DB và ràng buộc user/email/thời điểm gửi; không lưu hoặc log mã thô.
Chỉ OTP đúng mới cập nhật email liên hệ và khóa duy nhất trong `account_origins`,
giữ nguyên credential Auth/user_id/JWT/appSession. Email đã xác minh không đổi được;
Google không tự liên kết vào tài khoản mật khẩu có cùng email liên hệ.

Migration `20261029000001_username_account_email.sql` (sau migrations 1–5) là điều kiện
khởi động login runtime mới. Rollback đi kèm từ chối khi đã có tài khoản username-only.
Gửi email thật cần nhóm `SMTP_*` ở server; thiếu cấu hình trả 503, không giả thành công
và không ngăn đăng ký bỏ qua email. Frontend tải trạng thái email riêng sau auth,
không dùng trạng thái cảnh báo email để cấp hoặc thu hồi quyền chơi.

SMTP chạy sau khi transaction lưu challenge đã commit, ngoài khóa actor và không giữ
kết nối DB; mail chậm không được chặn nước đi của người chơi. Nếu gửi lỗi, chỉ xóa
challenge còn khớp hash, giữ cooldown và không xóa challenge mới hơn.

Kiểm chứng tích hợp: giao diện đăng ký bỏ qua email tạo tài khoản thật, đăng xuất/
đăng nhập bằng username thành công và Hồ sơ hiển thị cảnh báo thiếu email. Luồng OTP
đã chạy qua store/service với DB thật và bộ thu thư thử: từ chối mã sai và dùng lại mã,
xác minh đúng tài khoản, giữ nguyên credential và các phiên ứng dụng. Reload Hồ sơ
hiển thị email đã xác minh và bỏ cảnh báo. Tài khoản thử đã xóa; chưa xác nhận thư
đến hộp thư SMTP thật. Typecheck nguồn server, các màn hình auth/profile và test
liên quan đạt dưới Node 22; chưa chạy bộ test tự động.

Cấu hình triển khai:

Áp dụng migration `20261011000003_username_login.sql` sau migration đăng ký,
sau khi kiểm thử, kiểm dữ liệu và chuẩn bị khôi phục. Đặt
`AUTH_REGISTRATION_ENABLED=true` và `AUTH_LOGIN_ENABLED=true` để mở runtime.
Runtime dùng pool riêng cho đăng ký và đăng nhập/phiên để callback đăng ký
không chờ chính pool đang giữ khoá. Cả hai pool dùng TLS xác minh chứng chỉ trên
Supabase, kiểm kết nối khi khởi động và đóng cùng lifecycle ứng dụng. Mỗi pool
gắn listener lỗi ngay khi tạo: lỗi client rảnh chỉ ghi `registration_pool_failed`
không kèm thông điệp, payload hay chuỗi kết nối, và pool vẫn phục vụ truy vấn sau đó.
Pool đăng nhập/phiên tạo bằng `createLoginPool`: mỗi kết nối vật lý mới chạy
`SET ROLE app_server` trong `onConnect` một lần; store không đặt hay reset role theo
từng truy vấn. Pool quản trị của fixture giữ quyền đặc quyền để chuẩn bị dữ liệu.

Kiểm thử SQL chỉ nhận database cô lập `xiangqi_login_test` trên localhost hoặc
host `postgres`. CI dùng PostgreSQL 17.6 riêng cho đăng ký, realtime và login;
không chạy fixture tạo/reset schema trên dữ liệu thật. Bộ kiểm thử local kiểm
HTTP Nest, adapter Auth HTTP giả và PostgreSQL thật. Tên có thật và tên không tồn tại đều gọi password grant (tên không tồn tại dùng
email ngẫu nhiên ở miền example.invalid, không gửi thư). Password grant có
ngân sách 2 giây; lỗi mật khẩu hoặc dịch vụ được đệm đến ít nhất 2,15 giây
bên trong khoá username để gửi đồng thời không làm lộ nhánh tra cứu. Adapter
huỷ HTTP khi hết ngân sách; timeout không tăng bộ đếm. Các kết quả khác có
sàn 250ms. Đo trên fixture không chứng minh thời gian dịch vụ Auth thật.

Google/Guest, ưu tiên phiên nhiều thiết bị, đăng xuất khi đang chơi và kiểm
reload/đóng trình duyệt xuyên suốt được kiểm cùng các phần tích hợp tương ứng;
không được coi là đã đạt chỉ vì kiểm thử module này thành công.

## Kiểm thử phiên HTTP — XIAN-53 / T17

[login.test.ts](../../../tests/server/account/login/login.test.ts) chạy Nest thật, PostgreSQL thật và
[Auth HTTP fixture](../../../tests/server/account/auth/auth-fixture.test-helper.ts) qua adapter SupabaseAuth.
Database local riêng là `xiangqi_login_test` tại cổng 55444; bộ Auth chạy trước
trên `xiangqi_auth_test` tại cổng 55441. Không dùng dữ liệu hoặc gửi thư thật.

Chuỗi HTTP kiểm đăng nhập, chuyển tiếp hai cookie vào refresh, xoay access/refresh
token, đọc danh tính với bearer cùng capability, đăng xuất và xác nhận thu hồi
trong SQL qua một SessionService mới. Cookie không ghi nhớ không có Max-Age;
cookie đăng xuất có Max-Age=0. Cookie được chuyển tiếp bằng jar trong test HTTP,
không phải bằng cơ chế tự lưu cookie của trình duyệt.

Hai ca biên kiểm riêng hạn 12 giờ và 30 ngày. Đồng hồ được tiêm vào service và
đối chiếu `created_at`/`expires_at` đã lưu trong SQL; chỉ Date được giả lập để
cookie writer dùng cùng thời điểm. Timer, mạng HTTP và PostgreSQL vẫn chạy thật;
không đổi đồng hồ PostgreSQL hay đồng hồ hệ điều hành. Refresh giữa hạn và trước
hạn 1 ms giữ nguyên capability, danh tính và hạn SQL. Tại đúng hạn và sau hạn
1 ms, HTTP trả 401 trước khi gọi provider, không cấp cookie mới. Provider được
đặt lỗi 503 ở hai thời điểm này để phát hiện việc gọi nhầm qua biên hết hạn.

Cookie ghi nhớ có Max-Age 2.592.000 giây lúc phát hành, giảm còn 1.296.000 giây
sau 15 ngày và không được kéo dài qua hạn ứng dụng. Cookie không ghi nhớ không
có Max-Age hoặc Expires. Cả hai cookie có HttpOnly, SameSite=Lax và Path=/.
Secure=false chỉ phục vụ loopback HTTP của test này; kiểm Secure production nằm
trong các test cookie riêng.

Fixture dùng map token với refresh một lần và giữ các bearer đã cấp. Access token
là JWT ES256 thật, ký bằng khoá sinh một lần cho mỗi fixture và công bố qua JWKS
HTTP cục bộ; `exp` tính theo đồng hồ thật, không theo `now` được tiêm vào. Nó không
mô phỏng refresh reuse interval, cookie jar trình duyệt, hành vi khôi phục phiên
khi mở lại trình duyệt hoặc GoTrue thật. Kết quả này chưa chứng minh reload, đóng
trình duyệt, SMTP hay đăng nhập nhiều thiết bị thực tế.

Chạy tuần tự bằng Node 22, chỉ với hai database synthetic đã nêu:

```sh
AUTH_TEST_DATABASE_URL=postgresql://twot@127.0.0.1:55441/xiangqi_auth_test pnpm vitest run tests/server/account/auth/schema.test.ts
LOGIN_TEST_DATABASE_URL=postgresql://login_test_admin@127.0.0.1:55444/xiangqi_login_test pnpm vitest run tests/server/account/login/login.test.ts
```

Các suite từ chối database sai tên/host; khi thiếu biến SQL sẽ báo skip. Không
chạy chúng trên database chia sẻ hoặc database đang phục vụ fixture trình duyệt.

Kiểm tra local ngày 11/10/2026: Auth SQL 30/30 đạt; Login SQL/HTTP 21/21 đạt
trong 122,51 giây. Sau khi tăng ngưỡng sàn lỗi từ 230 ms lên 2.100 ms theo
contract đệm 2,15 giây, chạy riêng ca đo thời gian đạt: median tên có thật
2.155 ms, tên không tồn tại 2.156 ms. ESLint, server typecheck/build và Prettier
đạt. Hai ca biên bổ sung kiểm hành vi đã có trong production; không có thay đổi
module production trong phạm vi test này.

## Đổi và khôi phục mật khẩu — YC1 P1

Migration `20261030000001_password_recovery.sql` thêm challenge khôi phục và
`app_sessions.password_change_hash`; phải áp dụng sau migration email tùy chọn.
Rollback chỉ xóa các bằng chứng thao tác này, không đổi credentials hoặc danh tính.

| Endpoint | Bằng chứng / dữ liệu | Kết quả |
|---|---|---|
| `POST /account/password/change` | Bearer + appSession; `currentPassword`, `newPassword`, `passwordConfirmation` | Kiểm mật khẩu cũ, đổi cùng user_id, thu hồi phiên khác; giữ capability và hạn của phiên thực hiện, thay refresh cookie |
| `POST /auth/password/recovery` | `username` | Tra email liên hệ đã xác minh; gửi OTP, trả `requestId`, `expiresAt`, `resendAt`, không trả email |
| `POST /auth/password/recovery/resend` | `requestId` | Gửi lại sau 60 giây, vô hiệu mã/quyền reset trước |
| `POST /auth/password/recovery/verify` | `requestId`, `otp` | Mã đúng cấp `resetToken` chỉ dùng đặt mật khẩu; không cấp phiên ứng dụng |
| `POST /auth/password/recovery/reset` | `requestId`, `resetToken`, `newPassword`, `passwordConfirmation` | Tiêu thụ quyền một lần, thu hồi phiên cũ, đổi mật khẩu, xóa cookie; về Login |

Username không tồn tại, thiếu email hoặc email chỉ pending cùng trả
`PASSWORD_RECOVERY_UNAVAILABLE`. Không cho client chọn email hoặc user_id.
Mật khẩu tối thiểu 8 ký tự, không trim; sai mật khẩu cũ không thu hồi phiên.
Khóa thử sai đăng nhập không bị xóa bởi đổi/reset mật khẩu hoặc Google.

Recovery dùng SMTP đã cấu hình để gửi đến contact email, không gửi tới credential
kỹ thuật. OTP 6 số có hạn 180 giây; HMAC ràng buộc purpose/user/request/email/sent_at,
giới hạn 5 lần sai lưu trong SQL. Request/reset capability ngẫu nhiên 256 bit chỉ
lưu SHA-256; bảng FORCE RLS, chỉ app_server có quyền. Trình duyệt giữ ngữ cảnh
recovery trong bộ nhớ, không URL/storage; reload phải yêu cầu mã mới.

`PasswordStore.withUser` tuần tự hóa bằng khóa password rồi khóa username giống
đăng nhập. Auth HTTP không giữ transaction/khóa actor; transaction ngắn kiểm lại
phiên và trạng thái trước ghi. SMTP chạy ngoài cả khóa password/username/actor.
Lỗi SMTP chỉ bỏ challenge còn khớp hash, giữ cooldown.

Auth và Postgres không có transaction chung. Khi Auth báo lỗi ghi không rõ kết
quả, service đối soát bằng password grant với mật khẩu mới. Đổi từ Hồ sơ lưu HMAC
của đúng thao tác đã xác thực trên phiên hiện tại: nếu ghi credentials thành công
nhưng cấp token lỗi, gửi lại đúng ba trường được tiếp tục, không dùng mật khẩu cũ
đã hết hiệu lực làm điều kiện mới. Không lưu mật khẩu thô, không kéo dài hạn; xóa
checkpoint khi cấp token và kiểm phiên cuối thành công. Phiên hết hạn/thu hồi vẫn
bị từ chối. Reset tiêu thụ quyền và thu hồi phiên trước remote write; nếu không
đối soát được thì báo lỗi, phải xin OTP mới, không để grant cũ dùng lại.

Kiểm chứng local dùng Nest/PostgreSQL thật và adapter SupabaseAuth qua Auth HTTP
fixture. Trình duyệt 360 px đã chạy recovery → OTP → reset → Login và đổi mật khẩu
Hồ sơ → reload vẫn là cùng thành viên; sai mật khẩu/xác nhận lệch không thành công.
Đây chưa phải bằng chứng Google OAuth, GoTrue hoặc thư đến hộp thư SMTP thật.

## Vòng đời phiên, thiết bị và đăng xuất (YC1)

- Thiết bị là cookie `xiangqi_device`: token opaque 32 byte base64url, HttpOnly,
  Max-Age 400 ngày. Server chỉ lưu `app_sessions.device_hash` (SHA-256 của token),
  không lưu fingerprint. Cookie không cấp quyền đăng nhập và được giữ sau logout để nhận diện trình duyệt.
- `POST /auth/login` đọc hoặc cấp cookie thiết bị, gọi Auth trước, sau đó trong
  username lock gọi `SessionService.issue(userId, remember, store, deviceToken)`.
- Thiết bị khác phiên gần nhất: `issue` chuẩn bị phiên thay thế rồi gọi
  `SessionSeatPort.endSeats` dưới username lock. Cùng transaction phòng xử lý
  RESIGN/rời ghế, thu hồi phiên cũ và INSERT phiên mới; lỗi INSERT rollback cả ván,
  ghế và thu hồi phiên. Phòng chờ rời ghế nhưng không ghi kết quả thua.
- `POST /auth/logout` nhận body `{ confirm?: boolean }`. Khi đang PLAYING và chưa có
  `confirm: true`, server trả 409 `LOGOUT_CONFIRM_REQUIRED` và không thu hồi phiên.
  Khi có xác nhận, port xử lý ghế và thu hồi phiên trong cùng lock.
- `RoomSessionSeats` (`apps/server/src/game/room/session-seat-port.ts`) chạy qua
  `RoomTransactions.withRoom` với actor là user; SQL nằm ở `session-seat-store.ts`.
  Logout gửi `sessionHash`: phiên phải còn hiệu lực dưới actor lock, nếu không trả
  401 `SESSION_EXPIRED`. Được gắn bằng `sessions.attachSeats` trong `game.runtime.ts`;
  không gắn port thì logout chỉ thu hồi phiên.
- Ván AI kết thúc qua `AiSessionTermination`: actor vẫn là member, không scrub PII.
  Lấy snapshot RESIGN dưới actor lock và owner gate, ghi kết quả qua `AiHistoryStore`
  trong cùng transaction, giải phóng reservation. Chỉ sau COMMIT mới hủy job/drop
  RAM; rollback giữ nguyên ván. Nhánh Khách vẫn không ghi lịch sử.
- `displaced: true` chỉ khi có ghế PLAYER/AI thực sự bị kết thúc, không phải mọi
  thay đổi thiết bị. Login và Google trả cờ này; frontend bỏ đích lời mời, về Sảnh.
  Không giữ ghế thì lời mời đang chờ vẫn được tiếp tục.
- Đăng ký/Google/login cùng đọc/cấp cookie thiết bị. Google cấp phiên dưới cùng
  username lock nhưng không xóa bộ đếm thử sai. Lookup thiết bị ưu tiên phiên chưa
  thu hồi để hai lần login cùng timestamp không chọn nhầm thiết bị cũ.
- Frontend hỏi xác nhận khi biết đang đấu; nếu vị trí cũ, HTTP 409
  `LOGOUT_CONFIRM_REQUIRED` mở xác nhận từ server và giữ phiên. Xác nhận một ván AI
  cũ không được dùng làm đồng ý đầu hàng ván online khác.

Kiểm chứng local: `tests/server/game/account-session.test.ts` chạy native Nest,
Socket.IO, room/AI runtime và PostgreSQL thật. Các ca online/AI kiểm kết quả RESIGN,
thu hồi socket/API, cùng thiết bị tiếp tục trong ân hạn (online 60 giây, AI 30 phút),
đổi mật khẩu khi đang chơi giữ ván/hạn, recovery chỉ gây mất kết nối và giữ grace.
Trigger lỗi INSERT phiên thay thế kiểm rollback cả online và AI/RAM. Bộ
`room/session-seat.test.ts` kiểm WAITING không ghi thua và recheck hết hạn/tài khoản
dưới khóa. Ranh giới provider của các fixture này là synthetic, không Google thật.

Smoke ngoài vitest đã chạy Nest + PostgreSQL + SupabaseAuth HTTP fixture +
Socket.IO: tạo phòng 200 → login thiết bị mới 200/displaced → API cũ 401, API mới
200 → socket cũ bị đóng → phòng chờ cũ CLOSED → logout 200 → API mới 401.
Socket cũ mất quyền lệnh ngay qua DB; đóng transport idle được phát hiện ở nhịp
kiểm phiên production 10 giây (test 1 giây), không phải cam kết đóng TCP tức thì.

Vị trí Hồ sơ/Sảnh đọc reservation AI đang giữ (không chờ ván có bản ghi history);
trả `playing-ai` với roomId null để banner dẫn đúng `/ai/:id` và chặn tạo vị trí
chơi thứ hai. Membership chỉ xem không bị coi là ghế đang chơi.
