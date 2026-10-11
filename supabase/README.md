# Database đăng ký email — XIAN-40

Migration `20261011000001_email_registration.sql` nâng cấp schema đã audit, không tạo lại database. Migration thêm trạng thái hoàn tất trên `profiles`, ledger riêng cho đăng ký đang chờ, chỉ mục username không phân biệt hoa/thường và trigger chặn đổi email. Các profile cũ có username hợp lệ và email đã xác minh được giữ hoạt động; danh tính cũ chưa xác minh không được tự nhận là tài khoản tạm của server để xóa.

Trước khi áp dụng trên XIANGQI, đọc lại schema/grant/function đang có, kiểm tra username trùng khi chuyển về chữ thường, sao lưu dữ liệu và các function bị thay thế. Chạy kiểm thử cô lập và review diff trước khi áp dụng. Không chạy `tests/auth-baseline.sql` trên Supabase: fixture này xóa và tạo lại schema test.

## Kiểm thử SQL cô lập

Cần PostgreSQL local và Node 22. Lệnh sau dùng database riêng `xiangqi_auth_test`; thay tên role trong URL bằng role local của bạn. Không chạy hai bản suite đồng thời trên cùng database.

```sh
mkdir -p .local/goal/auth-pg
initdb -D .local/goal/auth-pg/data -A trust --no-locale -E UTF8
pg_ctl -D .local/goal/auth-pg/data -l .local/goal/auth-pg/server.log -o '-h 127.0.0.1 -p 55440' start
createdb -h 127.0.0.1 -p 55440 xiangqi_auth_test
AUTH_TEST_DATABASE_URL='postgresql://LOCAL_ROLE@127.0.0.1:55440/xiangqi_auth_test' pnpm test apps/server/src/auth
pg_ctl -D .local/goal/auth-pg/data stop
```

Suite từ chối URL ngoài host local/host CI `postgres`, hoặc tên database khác. Khi thiếu `AUTH_TEST_DATABASE_URL`, suite SQL được báo skip; unit test vẫn chạy. HTTP integration dùng Nest thật, SQL thật và Auth HTTP fixture local, chưa chứng minh gửi thư hoặc xác minh OTP trên Supabase thật.

## Runtime và khôi phục

Store giữ advisory lock theo session trong lúc gọi Auth API. Kết nối runtime phải dùng direct PostgreSQL hoặc session pooler; transaction pooler không bảo đảm đúng lock và `SET ROLE`. Mỗi query chạy với role `app_server`; view riêng `xiangqi_auth.accounts` do `postgres` sở hữu chỉ đưa ra id, email, thời điểm xác minh, user metadata và thời điểm tạo. Không cấp cho ứng dụng quyền vào schema Auth, password hoặc app metadata. Runtime xác minh TLS bằng CA công khai Supabase trong `certs/prod-ca-2021.crt`; DIRECT_URL không có query parameter để thư viện không ghi đè host, port hoặc cấu hình TLS đã xác minh. Certificate lấy từ [liên kết SSL trên dashboard Supabase](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt), có hiệu lực đến 26/04/2031; cần cập nhật khi nhà cung cấp thay CA. Không ghi chuỗi kết nối vào log.

Trên PostgreSQL 17, nếu login `postgres` chưa được `SET ROLE app_server`, migration thêm membership do chính `postgres` cấp với SET=true, INHERIT=false, ADMIN=false và ghi marker riêng. Membership của Supabase đã có được giữ nguyên. Rollback chỉ thu hồi dòng membership do migration tạo, khôi phục ba quyền UPDATE cột profile cũ, rồi đối chiếu metadata trước/sau. Migration kiểm quyền cần thiết và từ chối nếu grant không có hiệu lực.

Rollback trong `rollback/20261011000001_email_registration.sql` khôi phục các function/constraint đã audit và chỉ cho phép trước khi có đăng ký mới. Sau khi nhận đăng ký, script từ chối nếu việc bỏ cột/schema có thể làm mất trạng thái; cần review bản sao lưu và lập phương án bảo toàn dữ liệu mới. Không xóa ledger hoặc profile để làm rollback qua.

`profiles.id` là cột tự sinh từ `user_id`; câu INSERT chỉ ghi `user_id`, fixture giữ đúng định nghĩa generated của database đã audit. Nếu OTP đã xác minh nhưng ghi profile/hoàn tất bị lỗi, retry cùng capability đăng ký phải xác thực lại mật khẩu bằng Supabase và đối chiếu đúng danh tính/email đã xác minh trước khi phục hồi. Token phiên chỉ trả sau khi profile và cờ pending đã hoàn tất. Phản hồi xác minh không rõ kết quả có đường kiểm tra lại, kể cả khi hạn OTP đã qua; tài khoản chưa xác minh vẫn phải dùng OTP đúng hạn. Mật khẩu chỉ nằm trong bộ nhớ giao diện/yêu cầu xác thực, không lưu vào ledger.

Luồng bảo trì chạy khi server khởi động và mỗi 5 phút. Đăng ký tạm do server sở hữu đủ 60 phút được thu hồi; profile đã hoàn tất nhưng còn cờ pending được phục hồi, luôn giữ profile. Thất bại Auth API được thử lại ở lần bảo trì sau.

## Mẫu email xác thực

Mẫu trong `templates/confirm-sign-up.html` dùng `{{ .Token }}`. Subject: **Cờ Tướng Online — Mã xác thực đăng ký**; sender name: **Cờ Tướng Online**. Cấu hình Supabase cần bật Confirm Email, OTP 6 chữ số/hết hạn 180 giây, mật khẩu tối thiểu 8 ký tự và khoảng gửi lại tối thiểu 60 giây. Nội dung mẫu nêu hiệu lực 3 phút và nhắc không chia sẻ mã. SMTP credentials chỉ nằm trong cấu hình riêng, không đưa vào template hoặc repo.
