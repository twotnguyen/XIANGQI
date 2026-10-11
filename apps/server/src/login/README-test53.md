# Kiểm thử phiên HTTP — XIAN-53 / T17

[login.test.ts](login.test.ts) chạy Nest thật, PostgreSQL thật và
[Auth HTTP fixture](../auth/auth-fixture.test-helper.ts) qua adapter SupabaseAuth.
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

Fixture dùng map token với refresh một lần và giữ các bearer đã cấp. Nó không
mô phỏng JWT hết hạn, refresh reuse interval, cookie jar trình duyệt, hành vi
khôi phục phiên khi mở lại trình duyệt hoặc GoTrue thật. Kết quả này chưa chứng
minh reload, đóng trình duyệt, SMTP hay đăng nhập nhiều thiết bị thực tế.

Chạy tuần tự bằng Node 22, chỉ với hai database synthetic đã nêu:

```sh
AUTH_TEST_DATABASE_URL=postgresql://twot@127.0.0.1:55441/xiangqi_auth_test pnpm vitest run apps/server/src/auth/schema.test.ts
LOGIN_TEST_DATABASE_URL=postgresql://login_test_admin@127.0.0.1:55444/xiangqi_login_test pnpm vitest run apps/server/src/login/login.test.ts
```

Các suite từ chối database sai tên/host; khi thiếu biến SQL sẽ báo skip. Không
chạy chúng trên database chia sẻ hoặc database đang phục vụ fixture trình duyệt.

Kiểm tra local ngày 11/10/2026: Auth SQL 30/30 đạt; Login SQL/HTTP 21/21 đạt
trong 122,51 giây. Sau khi tăng ngưỡng sàn lỗi từ 230 ms lên 2.100 ms theo
contract đệm 2,15 giây, chạy riêng ca đo thời gian đạt: median tên có thật
2.155 ms, tên không tồn tại 2.156 ms. ESLint, server typecheck/build và Prettier
đạt. Hai ca biên bổ sung kiểm hành vi đã có trong production; không có thay đổi
module production trong phạm vi test này.
