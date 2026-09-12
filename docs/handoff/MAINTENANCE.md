# Hướng dẫn Vận hành & Bảo trì Hệ thống (Maintenance Runbook)

Tài liệu dành cho kỹ sư phụ trách duy trì, sao lưu và nâng cấp hệ thống sau khi bàn giao.

---

## 1. Sao lưu và Khôi phục Cơ sở Dữ liệu (Backup & Restore)

### Sao lưu định kỳ qua Supabase CLI:
```bash
# Xuất toàn bộ schema và dữ liệu
supabase db dump -f backup_$(date +%Y%m%d).sql

# Xuất riêng dữ liệu các bảng nghiệp vụ (không bao gồm bảng auth)
supabase db dump --data-only -f data_backup_$(date +%Y%m%d).sql
```

### Khôi phục khi gặp sự cố:
```bash
psql "$DATABASE_URL" -f backup_20260913.sql
```

---

## 2. Giám sát & Quản lý Tài nguyên (Monitoring & Observability)

- **Fastify Health Check**: Đường dẫn `GET /health` trả về `{ status: 'ok' }` với mã HTTP 200 dùng cho các công cụ giám sát Uptime (như BetterUptime, UptimeRobot, Render Health Check).
- **Log máy chủ**: Game Server ghi log chuẩn ra stdout/stderr, có thể theo dõi qua Render Dashboard hoặc lệnh `docker logs`.
- **Giám sát LiveKit SFU**:
  - LiveKit cung cấp dashboard thống kê số lượng phòng hoạt động, số người tham gia và băng thông WebRTC tại giao diện LiveKit Cloud hoặc metrics endpoint port 7880.

---

## 3. Quy trình Cập nhật Phiên bản (Upgrade Procedure)

1. **Cập nhật gói thư viện (Dependencies)**:
   ```bash
   pnpm update
   pnpm build
   pnpm test:unit
   pnpm test:e2e
   ```
2. **Thêm Migration CSDL mới**:
   - Luôn tạo migration dạng bổ sung (`ALTER TABLE ADD COLUMN`, `CREATE TABLE`), không xóa hoặc đổi tên cột đang dùng trực tiếp.
   - Đặt tên file theo định dạng timestamp: `supabase/migrations/<timestamp>_<ten_migration>.sql`.

---

## 4. Xử lý các Sự cố Thường gặp

| Triệu chứng | Nguyên nhân có thể | Cách xử lý |
|---|---|---|
| Người dùng báo không thể tạo phòng | Bị kẹt bản ghi trong `active_players` do rớt mạng bất thường | Chạy `DELETE FROM public.active_players WHERE user_id = '...';` hoặc đợi server restart để boot recovery tự dọn dẹp |
| AI báo lỗi `AI_BUSY` liên tục | Cụm worker đạt ngưỡng dung lượng 10 tác vụ | Tăng `MAX_CONCURRENT_WORKERS` hoặc `MAX_QUEUE_SIZE` trong `apps/ai-worker/src/supervisor.ts` |
| Video WebRTC không kết nối được | Docker container LiveKit chưa chạy hoặc sai API key | Kiểm tra `docker ps`, xác nhận port 7880 mở và biến `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` khớp |
