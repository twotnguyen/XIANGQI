# Chuẩn bị môi trường XIANGQI

Bộ mẫu chuẩn bị dịch vụ, đối chiếu tài liệu nhà cung cấp ngày 10/10/2026. Chưa có mã ứng dụng, lệnh chạy hay bộ nạp cấu hình; điền biến không đồng nghĩa kết nối thành công. T01 sẽ nối cấu hình vào web/server và kiểm tra biến bắt buộc. Việc chuẩn bị này không bắt đầu Sprint, không đóng Task và không thay đổi kế hoạch 880 giờ, hạn 04/11.

Quyết định nghiệp vụ vẫn theo [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md), đặc biệt mục 0.4 (SMTP), 0.16 (LiveKit), đăng ký/Google và các cổng kiểm chứng trong [BACKLOG-P1.md](BACKLOG-P1.md). Không dùng hướng dẫn hạ tầng này để thay luật nghiệp vụ.

## 1. Các file và cách điền

Chỉ có một mẫu chung: [.env.example](.env.example). File `.env` ở gốc là bản tổng hợp để bạn điền toàn bộ thông tin. `apps/web/.env` và `apps/server/.env` là bản sao đầy đủ của file gốc, đều được Git bỏ qua.

Nhập hoặc cập nhật khóa ở `.env` gốc trước. Với thành viên mới:

```sh
umask 077
[ -e .env ] || cp .env.example .env
mkdir -p apps/web apps/server
```

Sau khi điền xong, sao chép bản gốc vào hai thư mục (lệnh này thay thế các bản sao; nếu từng sửa riêng thì đối chiếu và đưa giá trị cần giữ về bản gốc trước):

```sh
cp .env apps/web/.env
cp .env apps/server/.env
chmod 600 .env apps/web/.env apps/server/.env
```

Ba file không tự đồng bộ sau mỗi lần sửa: lặp lại bước sao chép khi cập nhật bản gốc. Không tạo thêm mẫu riêng cho web/server.

Dù file trong thư mục web có đủ biến, trình duyệt chỉ được nhận các biến `VITE_*`. Không import file `.env` vào mã web, không mở rộng `envPrefix`, không đưa toàn bộ `process.env` vào `define` hay thư mục public. Khi triển khai frontend trên hosting chỉ cấp nhóm biến `VITE_*`; bộ đầy đủ chỉ giữ trong môi trường riêng được kiểm soát. Google/SMTP/CLI vẫn là thông tin nhập dashboard hoặc dùng công cụ, không tự có tác dụng vì nằm trong file.

Giá trị trống nghĩa là chưa chuẩn bị, không phải giá trị hợp lệ để chạy. Nếu giá trị chứa khoảng trắng hoặc `#`, dùng chuỗi có dấu nháy phù hợp với bộ nạp dotenv; không chạy `source .env`. Khi đưa lên hosting, nhập biến server vào phần Environment/Secrets và biến Vite vào môi trường build. Không tải file `.env` tổng hợp lên dịch vụ lưu trữ tĩnh. Sau khi thay biến Vite phải khởi động lại dev server hoặc build lại.

## 2. Danh mục biến

| Biến | Nguồn / cách dùng |
|---|---|
| `VITE_API_URL` | URL NestJS; dự kiến dùng cả HTTP API và Socket.IO |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase URL và khóa công khai nếu giao diện dùng SDK Auth |
| `NODE_ENV`, `PORT`, `LOG_LEVEL` | Cấu hình chạy server; mẫu dùng development, 3000, info |
| `CORS_ORIGINS` | Danh sách origin web cho phép, quy ước phân cách bằng dấu phẩy khi triển khai loader; không dùng wildcard với phiên đăng nhập |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Cùng project với web; truy cập thông thường cần token người dùng và chính sách RLS |
| `SUPABASE_SECRET_KEY` | Khóa đặc quyền chỉ ở server, dành cho các luồng quản trị đã kiểm quyền |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Một bộ cùng project Cloud hoặc cùng máy chủ LiveKit tự chạy |
| `SUPABASE_PROJECT_REF` | Mã project; dùng để đối chiếu dashboard/CLI |
| `SUPABASE_ACCESS_TOKEN` | Tùy chọn cho CLI/API quản trị; không dùng thay API key của ứng dụng |
| `SUPABASE_DB_PASSWORD`, `DATABASE_URL` | Tùy chọn khi liên kết CLI, migration hoặc kết nối Postgres trực tiếp; không cần chỉ để gọi Supabase SDK |
| `AUTH_SITE_URL`, `AUTH_REDIRECT_URLS` | Phiếu ghi cấu hình nhập thủ công ở Supabase Auth; route callback phải được nhóm triển khai |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_AUTH_REDIRECT_URI` | Phiếu Google OAuth; nhập Client ID/Secret vào Supabase, callback vào Google |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Thông tin nhà cung cấp SMTP; nhập ở Supabase Auth |
| `SMTP_SENDER_EMAIL`, `SMTP_SENDER_NAME`, `SMTP_SECURITY` | Người gửi đã được xác minh và chế độ TLS/STARTTLS theo nhà cung cấp |

Không cần API trả phí cho máy cờ TypeScript tự viết, Socket.IO, React, NestJS, Vitest hoặc Playwright. Chưa có yêu cầu Redis, khóa OpenAI hay khóa JWT tự phát; chỉ bổ sung nếu thiết kế triển khai thực sự cần. Chứng chỉ HTTPS thuộc máy chủ/proxy, không phải một API key. Cấu hình nghiệp vụ như thời hạn phòng và giới hạn chat phải theo BA, không thêm biến tùy chỉnh làm thay đổi luật một cách ngầm định.

## 3. Supabase

1. Mở project XIANGQI trong Supabase; đợi database hoạt động và mục Connect/API Keys khả dụng. Lấy URL thực từ dashboard, không suy đoán project đã hoạt động từ tên hoặc mã project.
2. Sao chép Project URL vào web và server. Lấy publishable key cho các trường tương ứng. Lấy secret key vào **server** (chỉ máy chủ).
3. Nếu project còn dùng khóa cũ `anon`/`service_role`, thống nhất với người làm T01 về tên biến và SDK trước khi dùng. Bộ mẫu này chọn publishable/secret; không điền cả hai hệ khóa hoặc đổi tên tùy ý mà không sửa code.
4. Trong Authentication → URL Configuration, đặt Site URL là địa chỉ web. Cho phép redirect chính xác, ví dụ `http://localhost:5173/auth/callback`; thêm URL HTTPS của môi trường demo khi có. Đây là route dự kiến, chưa có trong repo.
5. Bật luồng Email theo đặc tả và cấu hình SMTP ngoài ở mục 5. Không tắt xác nhận email để né bước OTP.
6. Khi tạo schema, bật và kiểm RLS cho bảng được truy cập qua API. Server phải xác thực người dùng trước khi dùng khóa đặc quyền; không dùng khóa này để thay thế kiểm quyền dữ liệu.
7. Nếu cần kết nối SQL/migration, lấy connection string trong Connect; chọn kiểu direct/pooler theo công cụ và mạng. Lưu ở phiếu riêng, URL-encode ký tự đặc biệt trong mật khẩu. Không đưa mật khẩu database vào web.

Publishable key công khai được; secret key có thể bỏ qua RLS nên phải giữ ở máy chủ. Xem [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

## 4. Google OAuth

1. Tạo/chọn project ở [Google Cloud](https://console.cloud.google.com/), mở Google Auth Platform.
2. Điền Branding, email hỗ trợ và Audience; nếu ở chế độ thử nghiệm, thêm tài khoản nhóm/giảng viên cần thử vào Test users. Chỉ xin thông tin đăng nhập cơ bản: openid, email, profile.
3. Tạo OAuth client loại **Web application**. Authorized JavaScript origins là origin web, ví dụ `http://localhost:5173`; không thêm đường dẫn callback vào ô origin.
4. Mở Google provider của Supabase và sao chép callback được hiển thị vào **Authorized redirect URIs** của Google. Với Supabase hosted thường là `https://PROJECT_REF.supabase.co/auth/v1/callback`, kể cả web chạy local.
5. Ghi Client ID/Secret vào phiếu `.env` riêng và nhập vào Google provider của Supabase; bật provider.
6. Luồng quay về ứng dụng dùng `redirectTo` trùng allowlist Supabase ở mục 3. Callback Google → Supabase và callback Supabase → web là hai địa chỉ khác nhau.

Tham khảo [hướng dẫn Google của Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google).

**Điểm phải kiểm chứng khi triển khai:** Supabase mặc định tự liên kết danh tính cùng email. Tắt manual linking không đồng nghĩa tắt automatic linking. Dự án yêu cầu từ chối Google khi email đã thuộc tài khoản mật khẩu; nhóm phải kiểm chứng giải pháp phía máy chủ/hệ thống Auth trong GATE-GOOGLE trước khi nghiệm thu, không chỉ chặn nút trên giao diện và không tự đổi đặc tả. Xem [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

Đăng ký Google còn cần bước đặt Username + Password theo BA; bật provider chưa triển khai bước này. Tương tự, khóa thử sai và cấm đổi email cần kiểm chứng riêng, không được coi là đã có nhờ điền `.env`.

## 5. SMTP và OTP email

1. Chọn nhà cung cấp SMTP ngoài có thể gửi đến Gmail ngoài nhóm, đáp ứng yêu cầu không bắt buộc tên miền riêng và hạn mức dev/demo đã chốt. Kiểm tra điều kiện thực tế lúc đăng ký; nếu nhà cung cấp chỉ gửi sandbox hoặc bắt buộc tên miền thì chưa đáp ứng yêu cầu này.
2. Tạo tài khoản và xác minh địa chỉ gửi theo nhà cung cấp. Lấy host, port, username, password SMTP riêng và chế độ TLS/STARTTLS; không mặc định mật khẩu SMTP là mật khẩu đăng nhập tài khoản.
3. Điền các trường `SMTP_*` vào phiếu `.env`, rồi nhập vào Authentication → Custom SMTP của Supabase. Phiếu này không tự cấu hình dịch vụ. NestJS không cần giữ một bản SMTP thứ hai nếu Supabase gửi OTP.
4. Chọn template email tương ứng luồng đăng ký mà nhóm triển khai; nếu dùng OTP dạng mã, hiển thị token trong template thay vì chỉ có link. Cấu hình thời hạn, độ dài mã và giới hạn gửi khớp BA/AC hiện hành; kiểm tra cả hạn mức Supabase lẫn nhà cung cấp.
5. Khi ứng dụng đã có, thử OTP thật đến ba Gmail ngoài nhóm, ghi thời gian nhận/spam và thử năm thư trong một giờ theo kế hoạch kiểm chứng. Kiểm tra mã sai, hết hạn, gửi lại và trường hợp vượt hạn mức; không đánh dấu đạt chỉ vì gửi được email thử từ dashboard.

Supabase SMTP mặc định giới hạn người nhận, nên không thay thế SMTP ngoài cho demo này. Hướng dẫn chính thức: [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates).

## 6. LiveKit cho camera/mic

### Cloud — demo Internet / dự phòng

1. Đăng ký tại [LiveKit Cloud](https://cloud.livekit.io/), tạo project XIANGQI. Bắt đầu với gói miễn phí nếu còn đáp ứng nhu cầu; xem hạn mức connection minutes, truyền dữ liệu và kết nối đồng thời trong dashboard/[bảng giá](https://livekit.com/pricing), không chỉ nhìn số phút đã ghi trong kế hoạch cũ.
2. Lấy Project URL `wss://...`, API Key và API Secret từ cài đặt project; điền vào `apps/server/.env`.
3. Khi triển khai, NestJS cấp token ngắn hạn theo danh tính và phòng sau khi xác thực quyền. Gửi URL và token người tham gia cho web; không gửi API Secret. Không dùng token mẫu cố định cho cả nhóm.
4. Người chơi được phát theo quyền chia sẻ đã chốt; người xem phải có `canPublish: false`, `canPublishData: false`. Quyền nhận phải khớp ba mức chia sẻ, không cấp nghe/xem mọi luồng mặc định cho mọi người. Camera/mic mặc định tắt; không ghi hình.
5. Việc đuổi người xem/đổi quyền phải thu hồi phiên media đang hoạt động và chặn cấp lại token trái phép; chỉ đợi token hết hạn không đủ. Kiểm thử hai người chơi + tối đa năm người xem và các quyền theo BA.

Xem [kết nối phòng](https://docs.livekit.io/intro/basics/connect/). Đây là yêu cầu tích hợp chưa được thực hiện trong bộ mẫu.

### Tự chạy — phát triển và demo LAN

Theo BA, nhóm chuẩn bị LiveKit mã nguồn mở bằng Docker ở công việc media. Không cần đăng ký Cloud cho riêng môi trường này. Chọn phiên bản/image và cấu hình mạng khi triển khai theo [hướng dẫn tự chạy](https://docs.livekit.io/transport/self-hosting/local/).

- Thay bộ ba biến LiveKit bằng địa chỉ và khóa của máy chủ tự chạy. `ws://localhost:7880` chỉ phù hợp thử cùng máy; mọi thiết bị phải truy cập được địa chỉ media thực.
- LAN nhiều thiết bị cần HTTPS tin cậy cho web và WSS phù hợp cho media; thiết bị nhận phải tin chứng chỉ. HTTP qua IP LAN không tương đương ngoại lệ localhost cho camera/mic.
- Cấu hình firewall, UDP/TCP và địa chỉ máy chủ quảng bá theo hướng dẫn triển khai. Chứng chỉ và khóa riêng giữ cục bộ, không commit.
- Không triển khai máy chủ LiveKit trên Render theo phương án đã chốt. Khi dùng Render cho web/NestJS, dùng LiveKit Cloud cho media.

## 7. Bàn giao và kiểm tra

- [ ] Điền các URL/khóa vào đúng file riêng; `.env.example` vẫn chỉ có giá trị trống hoặc mẫu công khai.
- [ ] T01 triển khai loader, kiểm biến bắt buộc và lỗi cấu hình không in bí mật. Chỉ công khai nhóm `VITE_*`; không mở rộng tiền tố Vite cho secret.
- [ ] Supabase Auth, Google, SMTP và LiveKit được thử thật bằng các luồng trong BA/AC; hiện **chưa kiểm kết nối thực tế** bằng bộ mẫu này.
- [ ] Kiểm URL local/LAN/Internet, CORS, callback, TLS và quyền camera/mic trên thiết bị demo.
- [ ] Bằng chứng kiểm thử chỉ ghi kết quả và định danh môi trường; không đính kèm secret, token hoặc file `.env`.

Kiểm tra trước commit:

```sh
git check-ignore .env apps/web/.env apps/server/.env
git diff --cached --name-only
```

Danh sách staged chỉ được có file mẫu và tài liệu, không có ba file `.env` thật. Không dùng `git add -f` cho bí mật. Chỉ chia sẻ khóa qua kênh riêng được nhóm kiểm soát; không dán lên Jira, PR hay ảnh chụp. Nếu đã lộ khóa thì thu hồi/đổi khóa ở dịch vụ, xóa file khỏi commit sau không làm khóa cũ an toàn trở lại.
