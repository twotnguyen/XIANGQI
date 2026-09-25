# Danh mục Thiết lập Dịch vụ Ngoại vi (External Setup Checklist)

Bảng kiểm tra các dịch vụ bên thứ ba và cấu hình bắt buộc trước khi đưa hệ thống vào vận hành.

---

## 1. Bảng Biến Môi trường Chi tiết

| Tên biến | Môi trường | Nhạy cảm? | Mục đích |
|---|---|---|---|
| `PORT` | Server | Không | Cổng lắng nghe HTTP của Game Server (mặc định: 3001) |
| `NODE_ENV` | Server / Web | Không | `development` hoặc `production` |
| `DATABASE_URL` | Server | **CÓ (Secret)** | Chuỗi kết nối Postgres pooler của Supabase (port 6543) |
| `SUPABASE_URL` | Server / Web | Không | Đường dẫn API Supabase Cloud (`https://[ref].supabase.co`) |
| `SUPABASE_SECRET_KEY` | Server | **CÓ (Secret)** | Supabase Service Role Key (dùng cho backend bypass RLS) |
| `VITE_SUPABASE_URL` | Web | Không | URL Supabase cho trình duyệt |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Web | Không | Supabase Anon Key cho trình duyệt |
| `LIVEKIT_URL` | Server | Không | Địa chỉ SFU LiveKit (local: `http://127.0.0.1:7880`) |
| `LIVEKIT_API_KEY` | Server | **CÓ (Secret)** | LiveKit API Key sinh token WebRTC |
| `LIVEKIT_API_SECRET` | Server | **CÓ (Secret)** | LiveKit API Secret ký token |

---

## 2. Checklist Bảo mật và An toàn Dữ liệu

- [x] Không bao giờ commit file `.env` thật hoặc private keys vào Git repository.
- [x] Các biến `VITE_*` trên client chỉ chứa thông tin công khai (anon key, public URL), tuyệt đối không để lộ `service_role_key`.
- [x] Supabase Auth redirect URLs chỉ chứa domain chính thức, không cho phép wildcard mở (`*`) để ngăn chặn tấn công Open Redirect.
- [x] Cấu hình CORS trên server giới hạn các origin hợp lệ.
- [x] Đã cấu hình restart recovery: tự động giải phóng bàn cờ khi server khởi động lại.
