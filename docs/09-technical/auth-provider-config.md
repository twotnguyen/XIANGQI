# XÁC THỰC EMAIL — TẬN DỤNG SUPABASE AUTH

**Cập nhật:** 2026-09-22 · **Trạng thái:** Đã đối chiếu khả năng nền tảng; chưa xác minh cấu hình dự án đang chạy.
**Căn cứ:** DEC-025 chọn Supabase Auth; PO nhắc “về phần này tôi thấy supabase đã hỗ trợ rồi” khi BA hỏi hạn link và tần suất email. Đây là làm rõ ranh giới tích hợp, không phải chấp thuận các con số BA vừa đề xuất.

## 1. RANH GIỚI

Supabase Auth xử lý xác minh email, khôi phục mật khẩu và rate limit của các endpoint Auth. Tích hợp luồng có sẵn theo ISSUE-048/052; không thêm bộ phát/xác minh token email riêng hay luật 5 email/giờ/địa chỉ/từng loại từ đề xuất chưa duyệt. Ứng dụng vẫn phải hiển thị lỗi, cho gửi lại khi được phép, giữ thông báo khôi phục không tiết lộ tài khoản và kiểm thử luồng email thật.

Nguồn: [Password-based Auth](https://supabase.com/docs/guides/auth/passwords), [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).

## 2. THAM CHIẾU NỀN TẢNG, KHÔNG PHẢI CẤU HÌNH ĐÃ ĐO

| Mục | Tài liệu chính thức tại lần đối chiếu |
|---|---|
| `auth.email.otp_expiry` | CLI config ghi mặc định 3600 giây; phải kiểm giá trị và hiệu lực trên từng luồng confirmation/recovery trong môi trường chạy |
| `auth.email.max_frequency` | CLI config ghi mặc định 1 phút; đây là khoảng chờ, khác hạn OTP |
| Giới hạn gửi theo dự án | Dịch vụ email tích hợp mặc định 2 email/giờ cho dự án; có thể cấu hình giới hạn khi dùng SMTP riêng hoặc Send Email hook |
| Các giới hạn khác | Auth còn giới hạn theo user/IP/endpoint; không quy mọi giới hạn thành một bộ đếm theo địa chỉ email |

Nguồn: [CLI config](https://supabase.com/docs/guides/local-development/cli/config), [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).

Không lấy mặc định tài liệu làm bằng chứng dự án đã cấu hình. Lượt này chưa tìm thấy `supabase/config.toml` trong repository và chưa đọc Dashboard của dự án; các giá trị thực tế vẫn chưa xác minh.

## 3. VIỆC TRIỂN KHAI CẦN GHI NHẬN

Trong bằng chứng ISSUE-048/052, ghi cấu hình hiệu lực của từng môi trường: phiên bản, hạn confirmation/recovery, khoảng chờ, các quota và phạm vi tính, bật xác minh email, loại dịch vụ gửi và URL callback. Không ghi khoá bí mật. Dùng cấu hình thực tế làm đầu vào kiểm thử, giữ lại snapshot để phát hiện lệch cấu hình; không thay đổi cấu hình chỉ để test dễ qua.

Kiểm link hợp lệ/hết hạn/đã dùng, gửi lại quá nhanh, lỗi gửi và callback; giao diện phản ánh kết quả từ Auth. Không dựng countdown giả nếu không xác định được thời điểm được phép thử lại. Khi thiếu thông tin chờ chính xác, báo thử lại sau thay vì khẳng định một số giây không có căn cứ.

Đây là việc tích hợp/cấu hình, không phải yêu cầu PO chọn lại con số cho một cơ chế nền tảng đã có. Nếu phát hiện cấu hình không đáp ứng một yêu cầu sản phẩm đã chốt thì báo chênh lệch cụ thể; không âm thầm đổi yêu cầu đó.

## 4. HỢP ĐỒNG PHIÊN ỨNG DỤNG — DEC-040

Đây là dữ liệu ứng dụng PostgreSQL, không phụ thuộc gói trả phí hay cấu hình session timeout của Supabase. Bảng `app_sessions`: `id`, `user_id`, `auth_session_id` (unique), `mode` (REMEMBERED/TEMPORARY), `created_at`, `last_active_at`, `idle_expires_at`, `absolute_expires_at` nullable, `revoked_at` nullable. Khoá ngoại user; mọi thời gian UTC do server ghi. `auth_session_id` lấy từ JWT đã verify, không từ body; callback/password login mở session đúng một lần với unique này. Thiếu bản ghi ⇒ guard từ chối, không tự tạo khi refresh. Endpoint bootstrap duy nhất gọi `private.get_auth_session_metadata(auth_session_id, user_id)` với định danh lấy từ JWT đã verify; helper SECURITY DEFINER chỉ trả `created_at` của đúng phiên/user còn hợp lệ, không cấp quyền SELECT bảng Auth cho app_server. Lấy `created_at` qua helper này, lấy thời điểm sign-in thật làm gốc deadline; không dùng thời điểm client lần đầu gọi để kéo dài một session Auth cũ. Unique auth_session_id và tombstone ngăn đăng ký lại phiên đã hết hạn/thu hồi. Đăng ký phiên chỉ sau sự kiện sign-in/code exchange hợp lệ; replay đăng ký không thay mode/hạn.

| Chế độ | Khởi tạo | Gia hạn |
|---|---|---|
| REMEMBERED | created = sign_in_at; last_active = sign_in_at; idle = sign_in_at + 30 ngày; absolute = null | hoạt động hợp lệ: idle = max(idle, now + 30 ngày) |
| TEMPORARY | created = sign_in_at; last_active = sign_in_at; idle = sign_in_at + 30 phút; absolute = sign_in_at + 12 giờ | hoạt động hợp lệ: idle = min(absolute, max(idle, now + 30 phút)) |

`sign_in_at` là `auth.sessions.created_at` được helper đặc quyền trả về, không phải timestamp client hoặc lúc bootstrap nhận request. Bootstrap bị trì hoãn tới đúng/sau idle hoặc absolute ban đầu thì từ chối; không tạo phiên mới bằng cách dời gốc hạn. Chỉ request hoạt động hợp lệ sau khi đã kiểm phiên còn hạn mới được gia hạn. Helper, grants và test phân quyền nằm ở ISSUE-043.

`AUTH-TIME-01`: điều kiện hợp lệ là chưa revoke, còn phiên Auth thật, `now < idle_expires_at` và (absolute null hoặc `now < absolute_expires_at`). **Đúng bằng hạn là hết hạn.** Kiểm trước mọi HTTP/lệnh realtime/cấp token media, trước gia hạn. Một transaction khoá phiên kiểm hạn/thu hồi rồi cập nhật đơn điệu; logout và activity cùng phiên được serialize. Không giữ khoá khi gọi nhà cung cấp. Tác vụ hết hạn đóng kết nối, nhưng tác vụ chạy trễ không cho phép lệnh vượt hạn. Lệnh ván vẫn tuân thủ thứ tự khoá phòng → người → ván; kiểm phiên có thẩm quyền tại điểm commit, không dùng snapshot guard cũ để vượt thu hồi.

`AUTH-TIME-02`: các command nghiệp vụ hợp lệ, mở trang/chuyển màn do thao tác người dùng gọi endpoint activity là hoạt động; socket heartbeat, refresh token, polling, nhận sự kiện, auto-reconnect không gọi endpoint này. Không dùng request nền GET bất kỳ làm hoạt động. Đây là phân loại hành vi client hợp tác; server không thể chứng minh một cú click là người thật thay vì script. Client chỉ gửi loại hoạt động, server quyết định thời gian/hạn; invalid request không gia hạn.

`AUTH-STORE-01`: remembered dùng storage lâu dài theo cấu hình SDK; temporary dùng storage adapter `sessionStorage` với namespace riêng và tắt đồng bộ auth qua tab cho mode này. Link mở tab do app dùng `noopener`. Không dùng localStorage/cookie dùng chung để sao chép temp credential. Browser duplicate/restore có thể copy sessionStorage; không hứa tuyệt đối một credential chỉ hiện trong một tab. Tab copy cùng credential là cùng phiên; CURRENT đăng xuất mọi kết nối của phiên đó, không đăng xuất phiên độc lập. Reload còn hạn giữ phiên; không dùng unload/pagehide/beacon làm bằng chứng đóng tab. Không tự khôi phục từ remembered credential khi người dùng đang chọn temporary.

**Sửa rõ DEC-037:** không có API web đáng tin cậy để phân biệt mọi đóng/khôi phục và reload. DEC-040 bỏ cam kết khôi phục luôn phải login, thay bằng hạn ngắn kiểm tại server và nút Đăng xuất. Nhãn login: “Không ghi nhớ: phiên tạm, hết sau 30 phút không sử dụng hoặc tối đa 12 giờ. Trình duyệt có thể khôi phục tab còn đăng nhập. Dùng máy chung, hãy Đăng xuất khi xong.” Kiểm Chromium, Firefox và WebKit trong ma trận browser dự án; ghi phiên bản và kết quả thực, không báo đã chặn restore nếu chỉ test tab trống.

Nguồn: [MDN sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) (reload/restore và copy từ opener), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions). Chưa có kiểm thử ứng dụng.

## 5. GOOGLE VÀ RECOVERY — DEC-040

1. Dùng automatic identity linking của Supabase; không tự merge theo email. Email đã xác minh giữ `user_id`/profile. Trường hợp tài khoản email chưa xác minh, dùng canonical `user_id` do Auth trả về và việc Auth loại identity chưa xác nhận; kiểm thực trên phiên bản chọn rằng mật khẩu/confirmation token cũ không mở được tài khoản. Nếu bất kỳ credential cũ còn truy cập được, **chặn hoàn tất liên kết**, ghi lỗi tích hợp, không tự báo an toàn.
2. App giữ `profile_verified_at` (nullable, server-only): tên/metadata chỉ trở thành chính thức sau bằng chứng sở hữu email hoặc onboarding Google. Khi Google vào hồ sơ chưa từng xác minh, reset tên chưa tin cậy rồi bắt chọn username; giữ cùng canonical account, không copy quyền từ metadata. Giữ tên đã xác minh. ISSUE-035/053 phải đồng bộ cột này, không tin `user_metadata` client sửa được.
3. Google-only dùng recovery có sẵn như tài khoản thường, cho **thêm mật khẩu tự nguyện** bằng `updateUser` sau recovery; không xoá Google identity. Không tiết lộ phương thức đăng nhập qua màn email công khai. Cần email thật kiểm nhánh Google-only; không gắn PASS bằng object giả.
4. Bật Confirm email ⇒ Supabase password login khi email chưa xác minh có thể trả `email_not_confirmed` và **không cấp session**. Màn verify vẫn hiển thị được, resend theo email người dùng nhập hoặc ngữ cảnh đăng ký; không dựng access token giả để test guard. Auth guard chặn bất kỳ credential chưa đủ điều kiện nếu có.

Nguồn: [Supabase Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking) xác nhận thêm password vào tài khoản OAuth; [Recover handler chính thức](https://raw.githubusercontent.com/supabase/auth/master/internal/api/recover.go) tra user bằng email rồi gửi recovery, không yêu cầu đã có password/provider email; [resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) mô tả recovery rồi updateUser. Đây là đối chiếu khả năng, chưa xác minh cấu hình hoặc email thực tế.

## 6. CALLBACK, RECOVERY VÀ THU HỒI

- Một callback route `/auth/callback` dùng PKCE, xác minh state/flow; recovery chuyển `/reset-password`. Chỉ giữ đích nội bộ allowlist `/rooms/:id` hoặc đường mời đã biết, không URL ngoài, protocol-relative hay javascript. Đích lưu theo tab với auth flow, không đưa token vào return URL. Giữ qua verify/onboarding trong cùng flow; mất storage thì về sảnh an toàn.
- Code dùng một lần, xoá khỏi URL bằng replace-history trước điều hướng. Callback replay không đổi code lại; có phiên hợp lệ thì về màn phù hợp, không có thì báo link không còn dùng được. Callback lỗi/mất verifier ⇒ đăng nhập hoặc yêu cầu link mới trong tab hiện tại.
- Session cũ hết hạn không cản **đăng nhập mới thực sự** qua OAuth/password; chỉ code exchange mới hợp lệ tạo session mới. Token refresh, activity hoặc return target không được tạo lại session đã hết hạn/revoke.
- Sau onboarding kiểm lại điều kiện vào phòng theo BR-AUTH-22; auth thành công và join thất bại là hai kết quả riêng. Không tiêu thụ lời mời trước join transaction thành công. Recovery luôn kết thúc về login, không tự join đích cũ.
- Payload thu hồi bất biến: `auth_security_jobs.scope` CURRENT/ALL, `target_auth_session_ids` là tập UUID được server snapshot tại commit, `revocation_cutoff` là thời gian server cùng commit. CURRENT có đúng một ID; PASSWORD_CHANGED bắt buộc ALL. ALL snapshot mọi phiên ứng dụng tại commit (có thể rỗng) và chặn bootstrap mới tới khi barrier hoàn tất; worker dùng snapshot cho socket/media và gọi provider theo scope, không diễn giải lại CURRENT từ phiên người retry. `operation_id` duy nhất và payload bất biến: cùng ID/cùng payload trả trạng thái cũ, ID cũ/payload khác bị CONFLICT; retry chỉ thay trạng thái/lease/attempts, không mở rộng phạm vi. ID phiên là dữ liệu định danh, không chứa token.
- Logout: trước tiên transaction đánh dấu `app_sessions.revoked_at` (CURRENT theo auth_session_id; ALL mọi phiên user) và enqueue thu hồi bền vững; ngay từ commit mọi thao tác mới bị chặn. Sau đó thu hồi Auth và kết nối/media ngoài transaction; chưa có xác nhận thì UI “Đã chặn phiên, đang hoàn tất đăng xuất”, lỗi có Thử lại cùng operation. Không báo media đã dừng chỉ vì Auth signOut thành công. Giữ tombstone tới khi Auth session không thể refresh lại và mọi JWT cũ hết hạn; không mặc định xoá sau 24 giờ khi job Auth chưa hoàn thành.
- Reset password đi qua endpoint server được bảo vệ bằng recovery session đã verify. Server khoá/fence tài khoản để chặn phiên cũ và ghi job bền vững **trước** gọi Auth update password. Không phụ thuộc client cập nhật mật khẩu rồi mới gọi logout. **Đường gọi Auth trực tiếp cũng phải được bao phủ**: migration trigger trên thay đổi `auth.users.encrypted_password` chỉ ghi fence app_sessions + `auth_security_jobs` trong cùng transaction (không gọi mạng, không lưu hash/password vào job); kiểm bằng Supabase thật và pin schema/version. Nhờ đó bỏ qua endpoint ứng dụng vẫn không giữ được phiên app cũ. Nếu không thể triển khai trigger được hỗ trợ ở môi trường chọn, chưa được PASS AC-AUTH-08; không giả định ẩn nút UI chặn API Auth. Lỗi/đứt mạng giữa bước giữ các phiên cũ bị chặn; retry theo operation id, không log mật khẩu. Chỉ cho login mới khi update đã thành công và barrier hoàn tất; recovery session chỉ được retry operation này, không dùng quyền sản phẩm. Server restart tiếp tục job thu hồi, không lưu plaintext mật khẩu để retry.

## 7. BẰNG CHỨNG TRIỂN KHAI CÒN PHẢI CÓ

Chưa chạy email/OAuth/media hoặc browser. Các issue giữ TODO/BLOCKED_EXTERNAL đúng quy trình; đặc tả đã chốt không đồng nghĩa triển khai PASS. ISSUE-046/050/051/052/053 kiểm contract này; ISSUE-099/115 kiểm việc thu hồi nguồn theo [media-control-contract](media-control-contract.md). Không còn câu hỏi PO mở trong phạm vi này.
