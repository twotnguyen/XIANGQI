# Hướng dẫn cấu hình Google OAuth và Supabase Allowlist

Tài liệu hướng dẫn thiết lập Google OAuth Provider cho dự án XIANGQI.

## 1. Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Chọn project hoặc tạo project mới: `XIANGQI`.
3. Vào **APIs & Services** → **OAuth consent screen**:
   - User Type: **External**
   - App name: `Cờ Tướng Online`
   - User support email: email của bạn
   - Developer contact email: email của bạn
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
4. Vào **Credentials** → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - Name: `XIANGQI Web Client`
   - **Authorized JavaScript origins**:
     - Local: `http://localhost:5173`
     - Production: `https://<your-vercel-domain>.vercel.app`
   - **Authorized redirect URIs**:
     - Supabase Callback: `https://snsnkoicxmubuotcdafi.supabase.co/auth/v1/callback`
5. Lưu lại **Client ID** và **Client Secret**.

## 2. Cấu hình Supabase Dashboard

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard/project/snsnkoicxmubuotcdafi).
2. Vào **Authentication** → **Providers** → **Google**:
   - Bật **Enable Google provider**
   - Nhập **Client ID** từ Google Console
   - Nhập **Client Secret** từ Google Console
   - Lưu thay đổi
3. Vào **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:5173` (hoặc domain production)
   - **Redirect URLs (Allowlist)**:
     - `http://localhost:5173/auth/callback`
     - `http://localhost:5173/auth/reset-password`
     - `https://<your-vercel-domain>.vercel.app/auth/callback`
     - `https://<your-vercel-domain>.vercel.app/auth/reset-password`

## 3. Quy tắc bảo mật

- **Không đưa Google Client Secret vào mã nguồn frontend** (chỉ cấu hình trong Supabase Dashboard).
- Frontend chỉ sử dụng `VITE_SUPABASE_PUBLISHABLE_KEY` (public anon key).
- Supabase tự động liên kết tài khoản (automatic identity linking) khi cùng địa chỉ email đã xác minh.
- Tài khoản đăng nhập bằng Google lần đầu sẽ có `profiles.username = NULL` và bắt buộc qua trang `/onboarding` để chọn tên đăng nhập duy nhất trước khi vào sảnh chờ.
