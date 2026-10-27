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
