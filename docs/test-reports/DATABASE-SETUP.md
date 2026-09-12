# Báo cáo nghiệm thu thiết lập CSDL XIANGQI trên Supabase

Báo cáo bằng chứng kỹ thuật về việc tạo migrations và triển khai toàn bộ schema CSDL XIANGQI (19 bảng) lên Supabase project `snsnkoicxmubuotcdafi`.

## Phạm vi và phiên bản

- **Issue liên quan:** [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) (kèm triển khai sớm 2 bảng rematch của [ISSUE-027](../issues/ISSUE-027-history-rematch.md)).
- **Nhánh:** `feat/issue-006-supabase-schema`.
- **Target cloud:** Supabase project `snsnkoicxmubuotcdafi` (Tên: `XIANGQI`, Region: `ap-southeast-1`, PostgreSQL 17.6.1.166).
- **Target local test:** PostgreSQL 18.3 local instance (port 54399) dùng cho test harness cô lập trước khi apply.
- **Ngày thực hiện:** 12/09/2026.
- **Môi trường:** macOS 15.7.3 (aarch64), Python 3.11.16 / 3.14.2, psql 18.3, Supabase CLI 2.101.0.
- **Tệp đã tạo:**
  - `supabase/config.toml`
  - `supabase/migrations/20260912000001_roles_private_profiles.sql`
  - `supabase/migrations/20260912000002_friends_rooms_members_invitations.sql`
  - `supabase/migrations/20260912000003_matches_audit_controls.sql`
  - `supabase/migrations/20260912000004_ai_chat_media.sql`
  - `supabase/migrations/20260912000005_rematch.sql`
  - `tests/integration/database_test.py`

## Ma trận bằng chứng

| Case ID / Nội dung kiểm tra | Test path / Phương thức | Kết quả | Evidence / Giới hạn |
|---|---|---|---|
| **DB-01** / Migration fresh local | `tests/integration/database_test.py` | PASS | 5 migrations chạy tuần tự từ 0 thành công trên PG local 18.3, 19 bảng tạo đủ |
| **DB-02** / Auth signup trigger & unique | `database_test.py::test_signup_profile_trigger` | PASS | Trigger `handle_new_user` tạo profile tự động; Google signup username NULL; trùng username bị chặn; username immutable |
| **DB-03** / RLS anon/authenticated denied | `database_test.py::test_rls_and_role_security` | PASS | Role `anon` & `authenticated` bị từ chối SELECT/INSERT mọi bảng app và private schema; `app_server` đọc được |
| **DB-04** / CHECK JSON, NULL, bounds | `database_test.py::test_matches_and_circular_fk` | PASS | 90 ô board, turn RED/BLACK, clock JSON format, outcome reason/winner mapping chống SQL NULL bypass |
| **DB-05** / Circular FK & cross-room | `database_test.py::test_matches_and_circular_fk` | PASS | `rooms.current_match_id` trỏ sai room_id bị FK reject; trỏ đúng room commit thành công |
| **DB-06** / Deferrable side uniqueness swap | `database_test.py::test_rooms_and_members_deferrable_swap` | PASS | 2 người chơi cùng side bị chặn; swap RED/BLACK qua transaction với `SET CONSTRAINTS DEFERRED` thành công |
| **DB-07** / Active player single slot | `database_test.py::test_matches_and_circular_fk` | PASS | 1 user không thể claim 2 slot `active_players` đồng thời (PK violation) |
| **DB-08** / Match moves & audit coordinates | `database_test.py::test_events_moves_receipts` | PASS | Tọa độ x 0..8, y 0..9; from == to bị reject; payload_hash 32 bytes |
| **DB-09** / Rollback transaction atomicity | `database_test.py::test_transaction_rollback` | PASS | Lỗi trong transaction rollback toàn bộ, không rò rỉ room hoặc match |
| **DB-13** / Session revocation check | `database_test.py::test_revoked_sessions` | PASS | `private.is_auth_session_active` trả `true` cho session hợp lệ, `false` ngay khi vào `revoked_sessions` |
| **DB-18** / app_server audit immutability | `database_test.py::test_rls_and_role_security` | PASS | `app_server` bị từ chối UPDATE/DELETE trên `match_moves` và `match_events` (SELECT/INSERT only) |
| **Cloud Catalog** / 19 bảng ứng dụng | Remote query `information_schema.tables` | PASS | Đủ 18 bảng `public`, 1 bảng `private.revoked_sessions` trên `snsnkoicxmubuotcdafi` |
| **Cloud RLS** / 19 bảng enabled & forced | Remote query `pg_class` | PASS | Cả 19 bảng đều có `relrowsecurity = true` và `relforcerowsecurity = true` |
| **Cloud Constraints** / Khóa và kiểm tra | Remote query `information_schema.table_constraints` | PASS | 19 PRIMARY KEY, 43 FOREIGN KEY, 12 UNIQUE, 217 CHECK constraints |
| **Cloud Indexes** / Chỉ mục hiệu năng | Remote query `pg_indexes` | PASS | 64 indexes trên public và private schemas |
| **Cloud Triggers** / Trigger toàn vẹn | Remote query `information_schema.triggers` | PASS | `on_auth_user_created` (auth.users), `trg_guard_profile_updates` (profiles), `trg_guard_match_updates` (matches) |
| **Cloud Functions** / Hàm bảo mật | Remote query `information_schema.routines` | PASS | `private.is_auth_session_active` (SECURITY DEFINER, search_path empty) |
| **Cloud Smoke** / Read-only smoke query | Remote SQL execution | PASS | Query count(*) trên cả 19 bảng trả 0 rows không lỗi; test gọi `is_auth_session_active` trả `false` |
| **Backend Integration** / HTTP/Fastify/pool | Server backend tests | NOT_RUN | Cần hoàn thành ISSUE-001/002 trước khi có app runtime; owner: ISSUE-006 consumer |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `supabase init` | 0 | OK | Khởi tạo `supabase/config.toml` |
| `LC_ALL=en_US.UTF-8 /opt/homebrew/bin/initdb -D /tmp/xiangqi-test-pg -U postgres -E UTF8 --auth=trust` | 0 | OK | Khởi tạo cluster PostgreSQL 18.3 test local |
| `LC_ALL=C /opt/homebrew/bin/pg_ctl -D /tmp/xiangqi-test-pg -o "-p 54399 -k /tmp" -l /tmp/xiangqi-test-pg.log start` | 0 | OK | Chạy PostgreSQL test trên port 54399 |
| `psql -p 54399 -U postgres -d postgres -f supabase/migrations/20260912000001_roles_private_profiles.sql` | 0 | OK | Apply migration 1 local |
| `psql -p 54399 -U postgres -d postgres -f supabase/migrations/20260912000002_friends_rooms_members_invitations.sql` | 0 | OK | Apply migration 2 local |
| `psql -p 54399 -U postgres -d postgres -f supabase/migrations/20260912000003_matches_audit_controls.sql` | 0 | OK | Apply migration 3 local |
| `psql -p 54399 -U postgres -d postgres -f supabase/migrations/20260912000004_ai_chat_media.sql` | 0 | OK | Apply migration 4 local |
| `psql -p 54399 -U postgres -d postgres -f supabase/migrations/20260912000005_rematch.sql` | 0 | OK | Apply migration 5 local |
| `python3 tests/integration/database_test.py` | 0 | 8/8 suites pass | 32+ invariant assertions verified |
| `pg_ctl -D /tmp/xiangqi-test-pg stop` | 0 | OK | Dừng và dọn sạch PostgreSQL test local |
| `mcp__supabase__apply_migration` (x5 migrations) | 0 | 5/5 applied | Áp dụng 5 migrations lên Supabase ref `snsnkoicxmubuotcdafi` |
| `mcp__supabase__list_migrations` | 0 | 5 migrations | Xác nhận 5 migrations đã được ghi vào Supabase migration history |

## Review và giới hạn

- **Đánh giá SQL:** Toàn bộ 19 bảng đều tuân thủ chặt chẽ đặc tả trong `docs/specs/09-DATABASE-DESIGN.md`:
  - Có đầy đủ các ràng buộc quan hệ, composite foreign keys (`matches(id, room_id)`), circular foreign keys (`rooms.current_match_id`).
  - Toàn bộ 19 bảng đều được kích hoạt RLS (`ENABLE ROW LEVEL SECURITY`) và ép buộc RLS (`FORCE ROW LEVEL SECURITY`).
  - Mọi bảng đều REVOKE ALL từ `anon`, `authenticated`, `PUBLIC`.
  - Quyền hạn của `app_server` được cấp theo đúng nguyên tắc đặc quyền tối thiểu (Least Privilege); các bảng audit như `match_moves`, `match_events`, `command_receipts`, `room_command_receipts` chỉ được cấp `SELECT, INSERT`, tuyệt đối không cấp `UPDATE` hoặc `DELETE`.
  - Function `private.is_auth_session_active` cấu hình `SECURITY DEFINER`, `SET search_path = ''`, revoke PUBLIC/anon/authenticated và chỉ grant EXECUTE cho `app_server`.
- **Phạm vi hoàn thành:**
  - Đã triển khai xong cấu trúc CSDL và migrations lên Supabase project `snsnkoicxmubuotcdafi`.
  - Đã tạo sớm 2 bảng rematch (`room_rematch_votes`, `room_command_receipts`) từ ISSUE-027. **Lưu ý:** Chỉ mới tạo schema CSDL, chưa triển khai nghiệp vụ rematch hoặc đánh dấu hoàn thành ISSUE-027.
  - ISSUE-006 được cập nhật tiến độ phần schema; các phần về backend pool/transaction TypeScript (`apps/server/src/db/`) và test suite Vitest sẽ được tiếp tục khi backend workspace sẵn sàng (theo ISSUE-001/002).

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 5 files đã được đánh version.
- **Harness kiểm thử local:** Nằm tại `tests/integration/database_test.py` cho phép kiểm thử nhanh tính toàn vẹn CSDL độc lập.
- **Bước tiếp theo:**
  - Tiếp tục hoàn thiện các issue nền tảng theo kế hoạch (ISSUE-001, ISSUE-002), sau đó kết nối backend Fastify pool vào database Supabase đã sẵn sàng này.
