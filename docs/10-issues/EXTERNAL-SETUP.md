# TÀI NGUYÊN NGOÀI — LOCAL VÀ INTERNET

**Cập nhật:** 2026-09-22 · **Căn cứ:** DEC-046/047, DEP-01/11/12. Đây là kế hoạch cấu hình, không xác nhận giá/gói hay tài khoản đã có. Không tự mua dịch vụ.

## 0. Không chặn local bằng tài nguyên Internet

| Tài nguyên | Local dùng thật | Nghiệm thu cần tài nguyên ngoài |
|---|---|---|
| PostgreSQL/Auth | Supabase local từ034, DB test riêng | Supabase cloud ở137 |
| Xác minh/khôi phục email | Auth thật gửi email vào hộp thư SMTP local;048/052 có thể DONE | SMTP tới hộp thư Internet thật ở T137-04 |
| Google OAuth | Không giả lập Google để báo PASS; email login local độc lập | ISSUE-053/T137-05 cần OAuth thật |
| Camera/mic | LiveKit local thật, đo RTP và frame;112–117 không cần Cloud | Hai thiết bị thật/hai mạng và relay ở T137-08 |
| Hosting | Các tiến trình local | Tài khoản Render/Vercel do người dùng cấp ở137 |

Khi thiếu tài nguyên: ghi `BLOCKED_EXTERNAL` ở issue thực sự cần nó (053/137), chỉ rõ test chưa chạy và điều kiện chạy lại. Không ghi “ĐẠT (giả lập)”, không thêm `.skip`, không chuyển BLOCKED_EXTERNAL thành DONE. Chọn issue TODO khác có mọi dependency đã DONE. ISSUE-054 phụ thuộc049,055 phụ thuộc050/052/054; vì vậy Google không nằm trên đường găng local. ISSUE-136 nghiệm thu AC local, ISSUE-137 nghiệm thu Internet gồm053. ISSUE-138 có thể bàn giao local từ136 và công khai phần external CHỜ; không tuyên bố hoàn tất toàn bộ sản phẩm.

## §1 — GOOGLE OAUTH

Cần Google Cloud project/OAuth client thật và các tài khoản thử hợp lệ. Đăng ký callback chính xác của Supabase local/cloud, scopes chỉ `openid`, `email`, `profile`; Site URL/redirect allowlist về ứng dụng đúng môi trường. Cấu hình secret phía server/provider, không dùng `VITE_*`.

ISSUE-053 chỉ DONE khi các test Google thực chạy, kể cả liên kết email và callback; dựng user thử qua Auth local cho onboarding054 chỉ kiểm onboarding, không thay bằng chứng Google. Thiếu Google không khóa login email/profile/phòng/ván local. Cấu hình auth/TTL và boundary theo [auth-provider-config](../09-technical/auth-provider-config.md), không suy từ SDK mặc định.

## §2 — SMTP

Local: Supabase Auth gửi email thật tới hộp thư local (không tự auto-confirm).048/052 kiểm verify/reset, token hết hạn/dùng lại, mật khẩu cũ/mới bằng provider và PostgreSQL thật. Đây là nghiệm thu local có thật, không chứng minh khả năng giao thư Internet.

Internet: người dùng cấp SMTP được phép sử dụng; cấu hình sender, SPF/DKIM nếu có miền, URL ứng dụng và mẫu thư. T137-04 phải nhận thư ở hộp thư ngoài, xác minh và khôi phục bằng link đúng miền. Ghi delivery/spam thực tế; thiếu tài nguyên giữ137 BLOCKED_EXTERNAL. Không tự chọn gói có phí hay hứa quota chưa kiểm.

## §3 — MEDIA

ISSUE-112 là cổng **local**: máy chuyển tiếp LiveKit thật, byte RTP>0 và frame>0; không có gói tin thì không PASS.113–117 tiếp tục local theo dependency; token, quyền và generation phải kiểm bằng dịch vụ thật.

Internet cần endpoint LiveKit/TURN hoạt động qua hai mạng. URL có thể công khai; API secret chỉ ở server. Cấu hình token/thu hồi theo [media-control-contract](../09-technical/media-control-contract.md) và REQ-MEDIA; không coi token hết hạn là đã dừng participant đang kết nối. Không cần mua Cloud để vượt gate112. Nếu dịch vụ đã chọn không hỗ trợ bảo đảm thu hồi theo thiết kế thì giữ137 BLOCKED_EXTERNAL, không nới quyền.

## §4 — RENDER / BACKEND

**Hồ sơ đã chọn: `DEMO_SLEEP_ALLOWED`**, không yêu cầu always-on. Người dùng cấp tài khoản/gói phù hợp ngân sách hiện có; trước triển khai kiểm lại giới hạn và điều khoản nhà cung cấp, không xem tài liệu này là xác nhận gói miễn phí luôn tồn tại.

Tạo **một Web Service** cho NestJS/Socket.IO. Backend spawn AI child qua IPC cùng container/host; child có supervisor và tối đa hai search worker. Hai PID khác nhau, không phải hai Render service; không mở cổng mạng AI. Build bao gồm artifact child, đường dẫn khởi chạy được kiểm trên máy chủ thật. `/healthz` kiểm DB+IPC heartbeat, shutdown dọn child.

Dịch vụ có thể ngủ hoặc restart; trước nhận lệnh mới, finalize ván cũ `INTERRUPTED` theo ARCH-10, giữ lịch sử, không tính thời gian ngừng thành thua. UI có reconnect và kết quả gián đoạn. Không dùng ping giả chống ngủ. T137-11 kiểm đúng hồ sơ này qua quan sát idle20phút và ép stop/start nếu không tự ngủ, **không** bắt kết nối luôn sống. Hiệu năng AI khi thức vẫn giữ nguyên ngưỡng T137-07.

## §5 — VERCEL / FRONTEND

Triển khai build tĩnh `apps/web`; cấu hình fallback các route SPA về index. Chỉ cấu hình biến công khai: URL API/Supabase và publishable key theo `.env.example`/ISSUE-034. Không đưa DB URL, service key, OAuth secret hay LiveKit secret vào bundle. CORS/origin allowlist phải khớp URL frontend thật; callback auth phải về miền thật.

## §6 — SUPABASE CLOUD

Không cần tài khoản cloud cho034–136.137 cần project cloud do người dùng cấp, backup/migration theo runbook. SQL migrations qua Supabase CLI; Prisma chỉ db pull. Không reset cloud bằng test harness. Biến môi trường phải dùng một bộ tên canonical ở ISSUE-034, không pha tên key cũ/mới. Bằng chứng ghi môi trường và phiên bản thực dùng, không in secrets.

## §7 — HAI THIẾT BỊ, HAI MẠNG

Dùng hai điện thoại thật, một mạng Wi-Fi và một mạng di động (tắt Wi-Fi trên máy thứ hai). Kiểm camera/mic, từ chối quyền, đổi mạng, xuống nền, thu hồi và generation; thu thập RTP/frame/ICE relay bằng chứng. Hai tab cùng máy không thay được nghiệm thu hai mạng. Tài nguyên này chặn T137-08, **không** chặn112 local. Chưa xác nhận thiết bị sẵn có trong đợt triển khai thì ghi CHỜ, không tick sẵn.

## §8 — CHECKLIST INTERNET

- [ ] OAuth thật và mọi test053 đạt.
- [ ] SMTP giao verify/reset tới hộp thư thật.
- [ ] Supabase cloud, migration và secrets được cấu hình.
- [ ] Media/TURN qua hai thiết bị/hai mạng có số đo thật.
- [ ] Một backend service có AI child IPC và health check thật.
- [ ] Hồ sơ DEMO_SLEEP_ALLOWED công bố trong runbook/UI; thử interrupt/restart đạt.
- [ ] Frontend SPA routes/origin/callback chính xác; bundle không có bí mật.
- [ ] T137-01..11 có bằng chứng, gồm đo AI lại trên phần cứng thật.

## §9 — KHÔI PHỤC VÀ THEO DÕI

Lộ secret: thu hồi/rotate ngay, cập nhật cấu hình mọi môi trường, xoá khỏi code/log và ghi sự cố trong runbook; xoá file không làm secret đã lộ an toàn. Khi có tài nguyên: chạy lại đúng test CHỜ, bổ sung bằng chứng và merge trước cập nhật DONE. Không dùng known-limitations để biến test chưa chạy thành PASS. Bàn giao local có thể hoàn thành đúng scope; nghiệm thu Internet/toàn sản phẩm vẫn chưa đạt nếu053/137 còn chờ.
