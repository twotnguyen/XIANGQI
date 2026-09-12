# Hướng dẫn Triển khai Production (Deployment Runbook)

Tài liệu hướng dẫn chi tiết quy trình đưa hệ thống XIANGQI lên môi trường Internet thực tế.

---

## 1. Kiến trúc Triển khai (Production Architecture)

```
[ Người dùng / Web Browser ]
             │
    ┌────────┴────────┬─────────────────────────┐
    │ (HTTPS / SPA)   │ (HTTPS / WSS API)       │ (WebRTC)
    ▼                 ▼                         ▼
[ Vercel CDN ]  [ Render / Railway ]      [ LiveKit Cloud ]
(apps/web)      (apps/server + ai-worker) (SFU Audio/Video)
                      │
                      ▼
               [ Supabase Cloud ]
               (Postgres + Auth)
```

---

## 2. Các bước triển khai chi tiết

### Bước 1: Supabase Cloud Database & Auth

1. Tạo dự án Supabase mới tại Singapore (`ap-southeast-1`).
2. Đồng bộ các migration files theo thứ tự từ `supabase/migrations/`:
   ```bash
   supabase db push
   # hoặc chạy lần lượt các script 20260912000001_initial_schema.sql đến 20260912000008_*.sql
   ```
3. Cấu hình **Auth Settings**:
   - Site URL: `https://<ten-du-an>.vercel.app`
   - Redirect URLs: `https://<ten-du-an>.vercel.app/auth/callback`
   - Bật Google OAuth Provider theo hướng dẫn tại `docs/handoff/GOOGLE-SETUP.md`.

---

### Bước 2: Fastify Game Server (Render / Railway / Fly.io)

1. Kết nối kho mã nguồn GitHub với Render.
2. Tạo **Web Service** mới:
   - Environment: `Docker`
   - Dockerfile Path: `infra/Dockerfile.server`
   - Region: `Singapore`
   - Instance Type: `Free` hoặc `Starter` (khuyến nghị $\ge 512\text{ MB}$ RAM cho AI worker threads)
3. Cấu hình biến môi trường trên Render:
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgres://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`
   - `SUPABASE_URL`: `https://[ref].supabase.co`
   - `SUPABASE_SECRET_KEY`: `[service_role_key]`
   - `LIVEKIT_URL`: `https://[project].livekit.cloud`
   - `LIVEKIT_API_KEY`: `[livekit_api_key]`
   - `LIVEKIT_API_SECRET`: `[livekit_api_secret]`
4. Đường dẫn kiểm tra sức khỏe (Health Check): `/health`.

---

### Bước 3: Web Frontend (Vercel)

1. Import repository vào Vercel.
2. Cấu hình Build & Output Settings:
   - Framework Preset: `Vite`
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Cấu hình biến môi trường client (`VITE_*`):
   - `VITE_SUPABASE_URL`: `https://[ref].supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `[anon_key]`
   - `VITE_API_URL`: `https://xiangqi-server.onrender.com`
4. Deploy và kiểm tra các deep link: `/lobby`, `/ai/new`, `/history` đảm bảo `vercel.json` rewrite sạch sẽ không bị lỗi 404.

---

### Bước 4: LiveKit Cloud SFU

1. Tạo tài khoản LiveKit Cloud (gói miễn phí 50GB băng thông/tháng).
2. Lấy `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
3. Điền vào biến môi trường của Game Server.

---

## 3. Khôi phục và Xử lý sự cố (Disaster Recovery & Rollback)

- **Khi Game Server bị crash hoặc restart**:
  - Cơ chế `recoverActiveMatchesOnBoot()` trong `deadlines.ts` sẽ tự động quét toàn bộ các ván cờ `ACTIVE` còn dang dở, đánh dấu `INTERRUPTED` với lý do `SERVER_RESTART`, giải phóng `active_players` để người dùng không bị kẹt.
- **Rollback Web Frontend**:
  - Trên Vercel Dashboard, chọn bản deployment trước đó và nhấn **Instant Rollback**.
