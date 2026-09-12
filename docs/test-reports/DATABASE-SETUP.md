# Báo cáo nghiệm thu thiết lập CSDL XIANGQI trên Supabase (Hoàn thiện toàn bộ hardening)

Báo cáo bằng chứng kỹ thuật về việc tạo migrations, áp dụng các migration bổ sung (migration 6 và 7) khắc phục triệt để các phát hiện review, đồng bộ 100% lịch sử migration và hoàn thiện triển khai toàn bộ schema CSDL XIANGQI (19 bảng) lên Supabase project `snsnkoicxmubuotcdafi`.

## Phạm vi và phiên bản

- **Issue liên quan:** [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) (kèm triển khai sớm 2 bảng rematch của [ISSUE-027](../issues/ISSUE-027-history-rematch.md)).
- **Nhánh:** `fix/issue-006-schema-hardening-v2`.
- **Target cloud:** Supabase project `snsnkoicxmubuotcdafi` (Tên: `XIANGQI`, Region: `ap-southeast-1`, PostgreSQL 17.6.1.166).
- **Target local test:** PostgreSQL 18.3 test cluster tự động dựng/hạ bởi harness.
- **Ngày cập nhật:** 12/09/2026.
- **Môi trường:** macOS 15.7.3 (aarch64), Python 3.11.16 / 3.14.2, psql 18.3, Supabase CLI 2.101.0.
- **Tệp migrations & cấu hình:**
  - `supabase/config.toml`: Cấu hình Auth local đầy đủ (port 5173, password tối thiểu 10 ký tự, `enable_confirmations = true`, allowlist callback và reset password)
  - `supabase/migrations/20260912000001_roles_private_profiles.sql`
  - `supabase/migrations/20260912000002_friends_rooms_members_invitations.sql`
  - `supabase/migrations/20260912000003_matches_audit_controls.sql`
  - `supabase/migrations/20260912000004_ai_chat_media.sql`
  - `supabase/migrations/20260912000005_rematch.sql`
  - `supabase/migrations/20260912000006_schema_fixes.sql`
  - `supabase/migrations/20260912000007_schema_hardening.sql` (bổ sung hardening theo review PR #6)
  - `tests/integration/database_test.py` (harness tự động dựng PG, 9 test suites, 75+ assertions)

## Chi tiết các điểm khắc phục

1. **[P1] Ràng buộc đồng hồ (`runningSinceEpochMs`):**
   - Ràng buộc `matches_clock_json_check` bắt buộc khi `clock` tồn tại thì `runningSinceEpochMs` phải là kiểu số nguyên không âm (`>= 0`). Bác bỏ mọi trường hợp thiếu trường, mang giá trị âm, hoặc mang giá trị `null`.
2. **[P2] Bác bỏ SQL NULL bypass trong `match_moves.move` và `matches` chế độ AI:**
   - `match_moves_move_json_check`: bọc `COALESCE(..., false)`, kiểm tra sự tồn tại của `from` và `to` dạng object cùng tọa độ `x` (0..8) và `y` (0..9). Bác bỏ hoàn toàn `move = '{}'`.
   - `matches_mode_invariants`: bọc `COALESCE(..., false)`, kiểm tra rõ `ai_level IS NOT NULL` và `ai_level IN ('EASY', 'MEDIUM', 'HARD')` cho chế độ AI. Bác bỏ ván AI có `ai_level = NULL`.
3. **[P2] Cập nhật allowlist redirect URLs trong cấu hình Auth local:**
   - Bổ sung đầy đủ các đường dẫn callback và reset password vào `supabase/config.toml`:
     - `http://127.0.0.1:5173`
     - `http://localhost:5173`
     - `http://127.0.0.1:5173/auth/callback`
     - `http://localhost:5173/auth/callback`
     - `http://127.0.0.1:5173/auth/reset-password`
     - `http://localhost:5173/auth/reset-password`
4. **[P2] Trigger đăng ký phân biệt rõ email signup và Google onboarding:**
   - Trong `public.handle_new_user()`: với email signup (`provider = 'email'` hoặc khi metadata có `signup_username`), nếu `signup_username` bị thiếu, rỗng `""` hoặc toàn khoảng trắng `"   "`, trigger ném `RAISE EXCEPTION` từ chối dứt khoát. Chỉ cho phép `username = NULL` đối với đăng ký qua OAuth Google chưa hoàn thành onboarding.
5. **[P2] Kiểm tra quyền ghi (INSERT) và đọc (SELECT) toàn diện trên 19 bảng:**
   - Test harness kiểm tra cả `SELECT` và `INSERT` đối với cả hai role `anon` và `authenticated` trên toàn bộ 19/19 bảng ứng dụng, xác nhận đều bị `permission denied`.
6. **[Tính tái lập] Test harness tự động hóa từ checkout sạch:**
   - File `tests/integration/database_test.py` tự động tìm binary `psql`, `initdb`, `pg_ctl` qua `shutil.which` và PATH.
   - Nếu chưa có PostgreSQL chạy trên port chỉ định, harness tự động khởi tạo cluster tạm thời trong `/tmp`, nạp mock auth, áp dụng 7 migrations theo thứ tự, chạy toàn bộ test và tự động dọn sạch khi kết thúc.
   - Chạy độc lập bằng một lệnh duy nhất: `python3 tests/integration/database_test.py`.

## Ma trận bằng chứng

| Case ID / Nội dung kiểm tra | Test path / Phương thức | Kết quả | Evidence / Giới hạn |
|---|---|---|---|
| **DB-01** / Migration fresh local | `tests/integration/database_test.py` | PASS | 7 migrations chạy tuần tự từ 0 thành công, 19 bảng tạo đủ |
| **DB-02** / Auth signup trigger & strict reject | `database_test.py::test_signup_profile_trigger` | PASS | Email signup thiếu hoặc rỗng username bị `RAISE EXCEPTION`; username sai format bị reject; Google signup username NULL; username immutable |
| **DB-03** / RLS anon/authenticated SELECT & INSERT denied | `database_test.py::test_comprehensive_rls_denial` | PASS | Cả `anon` và `authenticated` bị từ chối cả `SELECT` và `INSERT` trên toàn bộ 19/19 bảng app và schema private |
| **DB-04** / CHECK JSON, NULL, bounds, empty object, clock epoch | `database_test.py::test_matches_and_circular_fk` | PASS | `position = '{}'` bị reject; clock thiếu `runningSinceEpochMs` hoặc nhận `null` bị reject; clock âm bị reject; AI mode `ai_level = NULL` bị reject; DISCONNECT winner RED thành công |
| **DB-05** / Circular FK & cross-room | `database_test.py::test_matches_and_circular_fk` | PASS | `rooms.current_match_id` trỏ sai room_id bị FK reject; trỏ đúng room commit thành công |
| **DB-06** / Deferrable side uniqueness swap | `database_test.py::test_rooms_and_members_deferrable_swap` | PASS | 2 người chơi cùng side bị chặn; swap RED/BLACK qua transaction với `SET CONSTRAINTS DEFERRED` thành công |
| **DB-07** / Active player single slot | `database_test.py::test_matches_and_circular_fk` | PASS | 1 user không thể claim 2 slot `active_players` đồng thời (PK violation) |
| **DB-08** / Match moves & audit coordinates & empty move | `database_test.py::test_events_moves_receipts` | PASS | `move = '{}'` bị reject; tọa độ x 0..8, y 0..9; from == to bị reject; payload_hash 32 bytes |
| **DB-09** / Rollback transaction atomicity thật | `database_test.py::test_real_transaction_rollback` | PASS | PL/pgSQL DO block insert rồi raise exception; verify row không tồn tại và tổng số room không đổi |
| **DB-13** / Session revocation check | `database_test.py::test_revoked_sessions` | PASS | `private.is_auth_session_active` trả `true` cho session hợp lệ, `false` ngay khi vào `revoked_sessions`, không swallow exception |
| **DB-18** / app_server audit immutability & revoked triggers | `database_test.py::test_app_server_grants_and_trigger_security` | PASS | `app_server` bị từ chối UPDATE/DELETE trên audit tables; anon/authenticated bị từ chối gọi trigger functions |
| **Cloud Catalog** / 19 bảng ứng dụng | Remote query `information_schema.tables` | PASS | Đủ 18 bảng `public`, 1 bảng `private.revoked_sessions` trên `snsnkoicxmubuotcdafi` |
| **Cloud RLS** / 19 bảng enabled & forced | Remote query `pg_class` | PASS | Cả 19 bảng đều có `relrowsecurity = true` và `relforcerowsecurity = true` |
| **Cloud Constraints** / Khóa và kiểm tra | Remote query `information_schema.table_constraints` | PASS | 19 PRIMARY KEY, 43 FOREIGN KEY, 12 UNIQUE, 217 CHECK constraints |
| **Cloud Migration History** / Đồng bộ version 100% | Remote query `supabase_migrations.schema_migrations` | PASS | Đủ 7 migrations (`20260912000001` .. `20260912000007`) khớp hoàn toàn tên file Git |
| **Cloud Smoke** / Read-only smoke query | Remote SQL execution | PASS | Query count(*) trên cả 19 bảng trả 0 rows không lỗi; test gọi `is_auth_session_active` trả `false` |
| **Backend Integration** / HTTP/Fastify/pool | Server backend tests | NOT_RUN | Cần hoàn thành ISSUE-001/002 trước khi có app runtime; owner: ISSUE-006 consumer |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `python3 tests/integration/database_test.py` | 0 | 9/9 suites pass | 75+ assertions, tự động dựng cluster tạm, nạp 7 migrations, chạy test và dọn sạch |
| `mcp__supabase__apply_migration (20260912000007_schema_hardening)` | 0 | OK | Apply migration 7 lên Supabase `snsnkoicxmubuotcdafi` |
| `UPDATE supabase_migrations.schema_migrations ...` | 0 | OK | Đồng bộ lịch sử migration cloud khớp 7 file Git |
| `SELECT private.is_auth_session_active(...)` | 0 | OK (false) | Smoke test cloud sau khi áp dụng migration 7 |

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 7 files đã được đánh version và đồng bộ 100% với cloud.
- **Cấu hình Auth local:** `supabase/config.toml` đã điều chỉnh theo spec (port 5173, min length 10, email confirmations on, callback URLs).
- **Harness kiểm thử local:** `tests/integration/database_test.py` tự chạy độc lập từ checkout sạch bằng một lệnh duy nhất.
- **Trạng thái:** LOCAL_DONE.
