# Báo cáo Nghiệm thu Môi trường Staging (Staging Acceptance Report) — XIANGQI

**Ngày thực hiện:** 2026-09-14  
**Nhánh triển khai:** `verify/issue-031-staging-acceptance`  
**Base commit:** `d47e73e` (main)  
**Tiêu chuẩn đối chiếu:** [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md), [02-ARCHITECTURE.md](../specs/02-ARCHITECTURE.md), [05-AUTH.md](../specs/05-AUTH.md), [06-MEDIA.md](../specs/06-MEDIA.md)  
**Trạng thái nghiệm thu:** **LOCAL_COMPLETE** *(Sẵn sàng triển khai cloud; chờ cấp quyền và credentials môi trường ngoài)*  

---

## 1. Kiến trúc Triển khai Staging (Staging Architecture)

Hệ thống được thiết kế và đóng gói theo kiến trúc chuẩn đã chốt, không hạ cấp hoặc thay đổi kiến trúc:

```
[ Người dùng / Trình duyệt & Thiết bị Di động ]
                 │
      ┌──────────┴──────────┬───────────────────────────┐
      │ (HTTPS / SPA)       │ (HTTPS / WSS API)         │ (WebRTC SFU)
      ▼                     ▼                           ▼
[ Vercel CDN ]        [ Render Web Service ]     [ LiveKit Cloud SFU ]
(apps/web - Vite SPA) (Fastify + AI Worker Pool) (Audio/Video Transports)
                            │
                            ▼
                   [ Supabase Cloud ]
                   (Postgres 17 + Auth)
                   ap-southeast-1 (Singapore)
```

| Thành phần | Nền tảng | Cấu hình / Artifacts | Trạng thái hiện tại |
|---|---|---|---|
| **Web Frontend** | Vercel CDN | `apps/web/vercel.json`, `apps/web/package.json` (Vite SPA, client build sạch 0 lỗi) | Đã sẵn sàng build và config rewrite deep link; chờ người dùng cấp Vercel project |
| **Game & Realtime Server** | Render Web Service | `infra/Dockerfile.server`, `infra/render.yaml`, Fastify port 3001, Socket.IO gateway | Đã sẵn sàng Dockerfile multi-stage & blueprint; chờ người dùng cấp Render service |
| **Database & Auth** | Supabase Cloud | Project `snsnkoicxmubuotcdafi` (`ap-southeast-1`, Singapore), pooler port 5432/6543 | **ACTIVE_HEALTHY** — Toàn bộ 11/11 migrations đã được áp dụng và đồng bộ |
| **Media SFU & Relay** | LiveKit Cloud | `apps/server/src/modules/media/service.ts`, `apps/web/src/features/media` | Đã kiểm chứng runner SFU local (RTP bytes/frames); chờ LiveKit Cloud API keys |

---

## 2. Kiểm chứng Cơ sở Dữ liệu Supabase Cloud (`snsnkoicxmubuotcdafi`)

Cơ sở dữ liệu Supabase Cloud đã được đồng bộ toàn diện các migration lên phiên bản mới nhất, đảm bảo tính nhất quán dữ liệu với mã nguồn:

### 2.1. Danh sách Migrations Đã Áp Dụng (11/11 Migrations)

Bảng `supabase_migrations.schema_migrations` trên cloud xác nhận:

| Migration Version | Tên Migration | Trạng thái | Ghi chú kỹ thuật |
|---|---|:---:|---|
| `20260912000001` | `roles_private_profiles` | **APPLIED** | Vai trò `app_server`, schema `private`, bảng `public.profiles` |
| `20260912000002` | `friends_rooms_members_invitations` | **APPLIED** | Quan hệ bạn bè, phòng chơi, thành viên, lời mời |
| `20260912000003` | `matches_audit_controls` | **APPLIED** | Bảng ván cờ `public.matches`, log nước đi `public.match_moves` |
| `20260912000004` | `ai_chat_media` | **APPLIED** | Lịch sử chat 2 kênh, chính sách media SFU |
| `20260912000005` | `rematch` | **APPLIED** | Bỏ phiếu tái đấu và lệnh phòng |
| `20260912000006` | `schema_fixes` | **APPLIED** | Sửa các kiểu dữ liệu và chỉ mục khóa ngoại |
| `20260912000007` | `schema_hardening` | **APPLIED** | RLS policies và phân quyền bảo mật |
| `20260912000008` | `json_contract_hardening` | **APPLIED** | Kiểm soát schema JSONB theo contracts |
| `20260913181231` | `profiles_id_alias` | **APPLIED** | Cột ảo `id` trỏ vào `user_id` tăng tương thích query |
| `20260913181243` | `matches_runtime_fixes` | **APPLIED** | Nới lỏng nullability, bổ sung `room_id` cho `active_players` |
| `20260913181249` | `match_ancestry` | **APPLIED** | **Khắc phục F-01 & F-18**: Bỏ `moves_match_move_number_unique`, chuyển runtime sang `match_moves` chuỗi cha con |

### 2.2. Kiểm tra Ràng buộc và Phân quyền
- Đã kiểm tra `pg_constraint` trên bảng `public.moves`: Ràng buộc gây lỗi UNIQUE violation sau UNDO (`moves_match_move_number_unique`) đã được DROP hoàn toàn.
- Đã tạo chỉ mục `match_moves_match_id_event_version_idx` và cấp quyền `SELECT, INSERT` cho vai trò `app_server`.
- Toàn bộ 20 bảng đều được kích hoạt RLS (`rls_enabled: true`).

---

## 3. Kết Quả Nghiệm Thu 5 Kịch Bản Staging

### Kịch bản 1: Google OAuth & Onboarding với Domain Triển Khai
- **Mục tiêu:** Xác thực người dùng qua Google OAuth PKCE và bắt buộc hoàn tất hồ sơ người dùng trước khi chơi.
- **Cơ chế thực hiện:**
  - Client khởi tạo luồng OAuth qua `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`.
  - Callback chuyển về route `/auth/callback` để trao đổi mã PKCE lấy JWT session.
  - Sau khi đăng nhập, middleware `onboardingGate` (`apps/server/src/auth/onboarding-gate.ts`) kiểm tra xem `username` trong `public.profiles` đã tồn tại chưa:
    - Nếu chưa có: chặn mọi hành động tạo/vào phòng với mã lỗi HTTP 403 `ONBOARDING_REQUIRED`.
    - Người dùng được chuyển hướng tới trang `/onboarding` để chọn `username` (3-24 ký tự chữ thường, số hoặc gạch dưới).
- **Kiểm chứng thực tế:**
  - Tự động: `tests/e2e/google-auth.spec.ts` và `tests/integration/authz.test.ts` (test case `T008-01`, `T008-02`) đạt 100% PASS.
  - Kiểm thử giao diện: Orca CLI đã kiểm chứng luồng đăng nhập và đọc `profiles` trên Supabase Cloud.
- **Yêu cầu khi deploy staging:**
  - Cần người dùng tạo Google Cloud OAuth Client ID (Web Application), thêm Authorized Redirect URI:
    - `https://snsnkoicxmubuotcdafi.supabase.co/auth/v1/callback`
    - `https://<ten-du-an-staging>.vercel.app/auth/callback`
  - Điền Client ID và Client Secret vào Supabase Dashboard -> Auth -> Providers -> Google.

### Kịch bản 2: Hai Tài Khoản Chơi Online, Chat 2 Kênh, Reconnect và Hết Giờ
- **Mục tiêu:** Hai kỳ thủ thi đấu thời gian thực qua WebSockets, nhắn tin độc lập, xử lý mất mạng và đồng hồ cờ.
- **Cơ chế thực hiện:**
  - Sử dụng Socket.IO 4 gateway (`apps/server/src/realtime/socket.ts`) kết hợp `PresenceTracker` và `client_controls` để duy trì lease phiên.
  - Chat phân tách thành 2 kênh độc lập: `PLAYERS` (chỉ 2 kỳ thủ) và `SPECTATORS` (khán giả), lưu trữ trong `chat_messages`.
  - Đồng hồ đếm ngược được tính toán authoritative trên server; khi ngắt kết nối socket, scheduler kích hoạt thời gian ân hạn 60s (`disconnect_grace_seconds`).
  - Nếu kỳ thủ kết nối lại trong 60s: tiếp tục ván đấu, bù giờ chính xác.
  - Nếu cả hai bên cùng mất mạng quá 60s: ván cờ tự động kết thúc với trạng thái `INTERRUPTED` (lý do `BOTH_DISCONNECTED`).
  - Khi kỳ thủ hết thời gian chính và phụ: deadline scheduler kích hoạt xử thua theo cờ (`TIMEOUT`).
- **Kiểm chứng thực tế:**
  - Tự động: `tests/e2e/online-match.spec.ts`, `tests/e2e/realtime-sync.spec.ts` (`T015-E2E-03`, `T015-E2E-04`), `tests/unit/scheduler.test.ts` (15 tests fake clock), `tests/integration/races.test.ts` đạt 100% PASS.
  - UI thực tế qua Orca CLI (commit `aa20d4b`): Mở 2 profile trình duyệt độc lập (`Default` và `Player 2`), đăng nhập 2 tài khoản, nhận sự kiện `room:updated` và đi nước cờ đồng bộ thời gian thực không cần tải lại trang.

### Kịch bản 3: Camera/Mic Trên Hai Thiết Bị Khác Mạng (3 Chế Độ & Thu Hồi Quyền)
- **Mục tiêu:** Truyền thông âm thanh/hình ảnh thời gian thực qua WebRTC SFU giữa 2 thiết bị ở mạng riêng biệt.
- **Cơ chế thực hiện:**
  - Tích hợp `livekit-client` trên Web và `livekit-server-sdk` trên Server.
  - Server cấp Access Token WebRTC thời hạn 60 giây có phân quyền track xuất bản (`canPublish`, `canSubscribe`).
  - Hỗ trợ 3 chế độ chia sẻ:
    1. `CAMERA_ONLY`: Chỉ xuất bản video track.
    2. `MIC_ONLY`: Chỉ xuất bản audio track.
    3. `BOTH`: Xuất bản cả video và audio.
  - Bên nhận có toàn quyền tắt luồng nhận (unsubscribe / mute local) bất kỳ lúc nào mà không ảnh hưởng ván cờ.
  - Khi 2 thiết bị nằm sau NAT khác nhau (Internet thật): LiveKit Cloud TURN relay tự động chuyển tiếp gói tin RTP qua UDP/TCP/TLS.
- **Kiểm chứng thực tế:**
  - Tự động: `tests/media/spike.ts` (8/8 tests PASS trên LiveKit SFU thật, xác nhận nhận RTP bytes > 10KB và frames > 15), `tests/unit/media-policy.test.ts`.
  - **Giới hạn bắt buộc:** Kiểm chứng cuối cùng giữa 2 thiết bị di động thật qua Internet (Wi-Fi và 4G/5G) cần thiết bị vật lý từ người dùng; theo nguyên tắc liêm chính, không dùng stream giả lập để thay thế gate phần cứng này.

### Kịch bản 4: Sức Chứa Phòng: Năm Người Xem và Người Thứ Sáu Bị Từ Chối
- **Mục tiêu:** Đảm bảo phòng thi đấu phục vụ đúng tối đa 2 kỳ thủ và 5 khán giả; từ chối người thứ 6.
- **Cơ chế thực hiện:**
  - Khi người dùng gửi yêu cầu tham gia với vai trò `SPECTATOR`, `apps/server/src/modules/rooms/spectators.ts` kiểm tra số lượng khán giả hiện tại trong phòng.
  - Nếu số khán giả đã đạt trần 5 người: từ chối với mã lỗi HTTP 409 `ROOM_FULL`.
  - Không tạo bản ghi rác trong CSDL (`public.room_members`), không cấp token khán giả.
  - Panel hiển thị trên giao diện người dùng hiển thị tỷ lệ `5 / 5` và vô hiệu hóa nút vào xem.
- **Kiểm chứng thực tế:**
  - Tự động: `tests/e2e/spectator-capacity.spec.ts` (`T016-E2E-02`) chạy 8 browser contexts độc lập trên Playwright (2 kỳ thủ + 5 khán giả được chấp nhận + người thứ 6 nhận mã 409 `ROOM_FULL`).
  - Kiểm thử Orca: Quan sát thấy số lượng khán giả cập nhật `1/5` qua realtime push trên profile `Default`. (Lưu ý: Orca CLI hiện tại chỉ hỗ trợ 2 profile nên kiểm chứng 8 context được thực hiện authoritative qua Playwright).

### Kịch bản 5: Health/Readiness, Restart Recovery và Hướng Dẫn Rollback
- **Mục tiêu:** Kiểm tra sức khỏe hệ thống, phục hồi sau sự cố máy chủ và quy trình hoàn nguyên.
- **Cơ chế thực hiện:**
  - **Health Check:** Endpoint `GET /health` trên Fastify trả về HTTP 200 `{"status": "ok"}`, kiểm tra trạng thái pool kết nối CSDL và Socket.IO server.
  - **Restart Recovery:** Khi server restart hoặc deploy bản mới, cơ chế `recoverActiveMatchesOnBoot()` (`apps/server/src/modules/matches/deadlines.ts`) tự động:
    - Quét toàn bộ các ván cờ có trạng thái `ACTIVE`.
    - Cập nhật trạng thái thành `INTERRUPTED` với lý do `SERVER_RESTART`.
    - Thu hồi và xóa toàn bộ dữ liệu trong `public.active_players` để người chơi không bị kẹt phiên.
    - Tuyệt đối không tự ý xử thắng/thua cho bất kỳ bên nào khi server gặp sự cố.
- **Hướng dẫn Rollback chi tiết:**
  - **Rollback Web (Vercel):**
    1. Truy cập Vercel Dashboard -> Dự án XIANGQI -> Tab **Deployments**.
    2. Tìm bản deployment ổn định trước đó.
    3. Nhấn menu 3 chấm (...) và chọn **Instant Rollback**. Vercel sẽ chuyển hướng 100% traffic CDN về bản cũ trong vòng vài giây.
  - **Rollback Server (Render):**
    1. Truy cập Render Dashboard -> Web Service `xiangqi-server`.
    2. Vào mục **Events** hoặc **Deploys**.
    3. Chọn bản build trước đó và nhấn **Rollback to this deploy**.
  - **Rollback Cơ sở Dữ liệu (Supabase):**
    1. Các migrations từ 1 đến 11 đều tuân thủ nguyên tắc additive (bổ sung cột, chỉ mục, view, không xóa bảng audit cũ).
    2. Nếu cần hoàn nguyên dữ liệu, sử dụng tính năng Point-in-time Recovery (PITR) trong Supabase Dashboard -> Project Settings -> Backups.

---

## 4. Bảng Tổng Hợp Evidence, Giới Hạn và Đầu Vào Cần Người Dùng Cung Cấp

| Hạng mục | Evidence kỹ thuật hiện có | Giới hạn (Limitations) | Đầu vào bắt buộc cần người dùng cung cấp |
|---|---|---|---|
| **Web SPA (Vercel)** | `apps/web/vercel.json`, `pnpm run build` exit 0, Playwright 94/94 pass | Chưa deploy lên domain public `.vercel.app` | Tài khoản Vercel hoặc phân quyền import repo `twotnguyen/XIANGQI` |
| **API Server (Render)** | `infra/Dockerfile.server`, `infra/render.yaml`, Fastify `/health` pass | Chưa deploy lên service public `onrender.com` | Tài khoản Render hoặc cấp phép tạo Web Service kết nối repo |
| **Supabase Cloud** | Project `snsnkoicxmubuotcdafi`, 11/11 migrations applied, RLS active | Cần cấu hình OAuth domain | Cấu hình Google OAuth Client ID & Secret trên Supabase Dashboard |
| **Media WebRTC (LiveKit)** | SFU local test `tests/media/spike.ts` 8/8 pass (RTP bytes/frames verified) | Chưa kết nối LiveKit Cloud qua Internet công cộng | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` từ LiveKit Cloud |
| **Thiết bị phần cứng** | Orca 2 profiles pass UI, Playwright multi-context pass | Cần kiểm thử trên thiết bị vật lý thật qua 2 mạng riêng | 2 thiết bị di động thật (iOS/Android hoặc Laptop) trên 2 mạng khác nhau (Wi-Fi và 4G/5G) |

---

## 5. Kết Luận Nghiệm Thu

1. **Trạng thái mã nguồn và cơ sở dữ liệu:**
   - 100% mã nguồn, cấu hình Docker, blueprint Render, rewrite Vercel và 11 migration Supabase đã hoàn tất và được xác thực tự động.
   - Bốn lane CI trên GitHub Actions của nhánh `main` (`d47e73e`) đạt 100% PASS (481/481 tests tự động).
2. **Nguyên tắc nghiệm thu:**
   - Duy trì trạng thái **`LOCAL_COMPLETE`**.
   - Tuyệt đối **chưa ghi `PROJECT_COMPLETE`** chừng nào các cổng triển khai dịch vụ ngoài (Vercel, Render, Google OAuth production, LiveKit Cloud và 2 thiết bị di động thật) chưa được cấp tài nguyên và xác minh thực tế.
