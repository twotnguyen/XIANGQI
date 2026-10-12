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

Áp dụng migration `20261011000003_username_login.sql` sau migration đăng ký,
sau khi kiểm thử, kiểm dữ liệu và chuẩn bị khôi phục. Đặt
`AUTH_REGISTRATION_ENABLED=true` và `AUTH_LOGIN_ENABLED=true` để mở runtime.
Runtime dùng pool riêng cho đăng ký và đăng nhập/phiên để callback đăng ký
không chờ chính pool đang giữ khoá. Cả hai pool dùng TLS xác minh chứng chỉ trên
Supabase, kiểm kết nối khi khởi động và đóng cùng lifecycle ứng dụng.

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
