# Báo cáo nghiệm thu thiết lập CSDL XIANGQI trên Supabase (Đã bổ sung sửa đổi & hardening)

Báo cáo bằng chứng kỹ thuật về việc tạo migrations, áp dụng migration bổ sung khắc phục các phát hiện review, đồng bộ lịch sử migration và hoàn thiện triển khai toàn bộ schema CSDL XIANGQI (19 bảng) lên Supabase project `snsnkoicxmubuotcdafi`.

## Phạm vi và phiên bản

- **Issue liên quan:** [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) (kèm triển khai sớm 2 bảng rematch của [ISSUE-027](../issues/ISSUE-027-history-rematch.md)).
- **Nhánh:** `fix/issue-006-schema-hardening`.
- **Target cloud:** Supabase project `snsnkoicxmubuotcdafi` (Tên: `XIANGQI`, Region: `ap-southeast-1`, PostgreSQL 17.6.1.166).
- **Target local test:** PostgreSQL 18.3 local instance (port 54399) dùng cho test harness cô lập trước khi apply.
- **Ngày cập nhật:** 12/09/2026.
- **Môi trường:** macOS 15.7.3 (aarch64), Python 3.11.16 / 3.14.2, psql 18.3, Supabase CLI 2.101.0.
- **Tệp migrations & cấu hình:**
  - `supabase/config.toml` (port 5173, minimum_password_length = 10, enable_confirmations = true)
  - `supabase/migrations/20260912000001_roles_private_profiles.sql`
  - `supabase/migrations/20260912000002_friends_rooms_members_invitations.sql`
  - `supabase/migrations/20260912000003_matches_audit_controls.sql`
  - `supabase/migrations/20260912000004_ai_chat_media.sql`
  - `supabase/migrations/20260912000005_rematch.sql`
  - `supabase/migrations/20260912000006_schema_fixes.sql` (migration bổ sung khắc phục toàn bộ 5 phát hiện review)
  - `tests/integration/database_test.py` (harness 9 test suites, 50+ assertions)

## Khắc phục các phát hiện review

1. **[P1] Bổ sung lý do DISCONNECT và ràng buộc chặt status ↔ outcome:**
   - Đã bổ sung `DISCONNECT` vào tập kết thúc `FINISHED` (yêu cầu winner là RED hoặc BLACK).
   - Ràng buộc chặt: `status = 'FINISHED'` không còn chấp nhận `SERVER_RESTART`, `BOTH_OFFLINE`, `AI_UNAVAILABLE`. Ngược lại, `status = 'INTERRUPTED'` bắt buộc chỉ nhận các lý do trên và winner phải là null.
2. **[P2] Làm chặt ràng buộc JSONB (position, clock) chống bypass SQL NULL:**
   - `matches_position_json_check`: bọc `COALESCE(..., false)` và kiểm tra rõ `position ? 'board'` và `position ? 'turn'`. Bác bỏ `position = '{}'`.
   - `matches_clock_json_check`: bọc `COALESCE(..., false)`, kiểm tra `redMs` và `blackMs` là kiểu số nguyên không âm (`>= 0`), kiểm tra `runningSinceEpochMs` nếu có phải là số không âm. Bác bỏ các giá trị âm hoặc chuỗi như `{"redMs": -1, "blackMs": "oops"}`.
3. **[P2] Điều chỉnh cấu hình Auth local đúng đặc tả:**
   - Cập nhật `supabase/config.toml`: `site_url = "http://127.0.0.1:5173"`, `additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173"]`, `minimum_password_length = 10`, `enable_confirmations = true`.
4. **[P2] Trigger đăng ký từ chối dứt khoát username sai:**
   - `public.handle_new_user()` kiểm tra nếu `signup_username` được cấp mà không khớp regex `^[a-z0-9_]{3,24}$` thì `RAISE EXCEPTION`, chặn đứng việc âm thầm chuyển thành `NULL`. Chỉ cho phép `NULL` khi không có `signup_username` (OAuth Google).
5. **[P2] Loại bỏ nuốt lỗi trong hàm kiểm tra phiên:**
   - Bỏ block `EXCEPTION WHEN OTHERS THEN RETURN false` trong `private.is_auth_session_active()`. Trả kết quả boolean tự nhiên dựa trên sự tồn tại của session trong `auth.sessions` và không bị thu hồi trong `private.revoked_sessions`. Lỗi hạ tầng/quyền sẽ được nổi lên thay vì che giấu.
6. **[Quyền tối thiểu] Thu hồi quyền EXECUTE trên các SECURITY DEFINER triggers:**
   - Chạy `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated` cho `guard_profile_updates()`, `handle_new_user()`, `guard_match_updates()`.
7. **Đồng bộ lịch sử migration cloud khớp Git:**
   - Đã cập nhật bảng `supabase_migrations.schema_migrations` trên cloud khớp chính xác version và slug: `20260912000001` .. `20260912000006`.
8. **Kiểm thử hồi quy & Rollback thật:**
   - Viết lại test rollback dùng khối `DO $$ ... RAISE EXCEPTION ... $$` thật của PL/pgSQL, chứng minh INSERT đã diễn ra và bị rollback hoàn toàn không để lại row.
   - Thêm suite kiểm tra RLS denial toàn diện trên toàn bộ 19 bảng cho cả hai role `anon` và `authenticated`.

## Ma trận bằng chứng

| Case ID / Nội dung kiểm tra | Test path / Phương thức | Kết quả | Evidence / Giới hạn |
|---|---|---|---|
| **DB-01** / Migration fresh local | `tests/integration/database_test.py` | PASS | 6 migrations chạy tuần tự từ 0 thành công trên PG local 18.3, 19 bảng tạo đủ |
| **DB-02** / Auth signup trigger & strict reject | `database_test.py::test_signup_profile_trigger` | PASS | Trigger `handle_new_user` tạo profile tự động; username sai định dạng bị `RAISE EXCEPTION` từ chối; Google signup username NULL; trùng username bị chặn; username immutable |
| **DB-03** / RLS anon/authenticated denied toàn bộ | `database_test.py::test_comprehensive_rls_denial` | PASS | Role `anon` & `authenticated` bị từ chối SELECT/INSERT trên toàn bộ 19/19 bảng app và schema private; `app_server` đọc được |
| **DB-04** / CHECK JSON, NULL, bounds, empty object | `database_test.py::test_matches_and_circular_fk` | PASS | `position = '{}'` bị reject; clock âm/string bị reject; outcome sai cặp status bị reject; DISCONNECT winner RED thành công |
| **DB-05** / Circular FK & cross-room | `database_test.py::test_matches_and_circular_fk` | PASS | `rooms.current_match_id` trỏ sai room_id bị FK reject; trỏ đúng room commit thành công |
| **DB-06** / Deferrable side uniqueness swap | `database_test.py::test_rooms_and_members_deferrable_swap` | PASS | 2 người chơi cùng side bị chặn; swap RED/BLACK qua transaction với `SET CONSTRAINTS DEFERRED` thành công |
| **DB-07** / Active player single slot | `database_test.py::test_matches_and_circular_fk` | PASS | 1 user không thể claim 2 slot `active_players` đồng thời (PK violation) |
| **DB-08** / Match moves & audit coordinates | `database_test.py::test_events_moves_receipts` | PASS | Tọa độ x 0..8, y 0..9; from == to bị reject; payload_hash 32 bytes |
| **DB-09** / Rollback transaction atomicity thật | `database_test.py::test_real_transaction_rollback` | PASS | PL/pgSQL DO block insert rồi raise exception; verify row không tồn tại và tổng số room không đổi |
| **DB-13** / Session revocation check | `database_test.py::test_revoked_sessions` | PASS | `private.is_auth_session_active` trả `true` cho session hợp lệ, `false` ngay khi vào `revoked_sessions`, không swallow exception |
| **DB-18** / app_server audit immutability & revoked triggers | `database_test.py::test_app_server_grants_and_trigger_security` | PASS | `app_server` bị từ chối UPDATE/DELETE trên audit tables; anon/authenticated bị từ chối gọi trigger functions |
| **Cloud Catalog** / 19 bảng ứng dụng | Remote query `information_schema.tables` | PASS | Đủ 18 bảng `public`, 1 bảng `private.revoked_sessions` trên `snsnkoicxmubuotcdafi` |
| **Cloud RLS** / 19 bảng enabled & forced | Remote query `pg_class` | PASS | Cả 19 bảng đều có `relrowsecurity = true` và `relforcerowsecurity = true` |
| **Cloud Constraints** / Khóa và kiểm tra | Remote query `information_schema.table_constraints` | PASS | 19 PRIMARY KEY, 43 FOREIGN KEY, 12 UNIQUE, 217 CHECK constraints (sau hardening) |
| **Cloud Migration History** / Đồng bộ version | Remote query `supabase_migrations.schema_migrations` | PASS | Đủ 6 migrations (`20260912000001` .. `20260912000006`) khớp hoàn toàn tên file Git |
| **Cloud Smoke** / Read-only smoke query | Remote SQL execution | PASS | Query count(*) trên cả 19 bảng trả 0 rows không lỗi; test gọi `is_auth_session_active` trả `false` |
| **Backend Integration** / HTTP/Fastify/pool | Server backend tests | NOT_RUN | Cần hoàn thành ISSUE-001/002 trước khi có app runtime; owner: ISSUE-006 consumer |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `LC_ALL=en_US.UTF-8 initdb ... && pg_ctl start ...` | 0 | OK | Khởi động PostgreSQL 18.3 test local port 54399 |
| `for f in supabase/migrations/*.sql; do psql ... -f $f; done` | 0 | OK | Apply 6 migrations local tuần tự |
| `python3 tests/integration/database_test.py` | 0 | 9/9 suites pass | 50+ invariant assertions verified |
| `pg_ctl stop ...` | 0 | OK | Dọn sạch PostgreSQL test local |
| `mcp__supabase__apply_migration (20260912000006_schema_fixes)` | 0 | OK | Apply migration 6 lên Supabase `snsnkoicxmubuotcdafi` |
| `UPDATE supabase_migrations.schema_migrations ...` | 0 | OK | Đồng bộ lịch sử migration cloud khớp Git |
| `SELECT private.is_auth_session_active(...)` | 0 | OK (false) | Smoke test cloud sau khi áp dụng migration 6 |

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 6 files đã được đánh version và đồng bộ với cloud.
- **Cấu hình Auth local:** `supabase/config.toml` đã điều chỉnh theo spec (port 5173, min length 10, email confirmations on).
- **Harness kiểm thử local:** `tests/integration/database_test.py` bao gồm 9 test suites kiểm tra đầy đủ các ca lỗi, RLS 19 bảng và rollback thật.
- **Trạng thái:** LOCAL_DONE.
