# Báo cáo nghiệm thu thiết lập CSDL XIANGQI trên Supabase (Hoàn thiện triệt để đợt 4: Cô lập libpq và khôi phục regression)

Báo cáo bằng chứng kỹ thuật về việc tạo migrations, áp dụng migration 8 (làm chặt toàn diện hợp đồng JSONB), cô lập 100% test harness không phụ thuộc DB ngoài và chặn triệt để biến môi trường libpq (`PGHOSTADDR`, `PGPORT`, ...), kiểm thử đầy đủ 4 quyền (SELECT, INSERT, UPDATE, DELETE) trên toàn bộ 19 bảng, khôi phục toàn bộ các ca kiểm thử hồi quy và đồng bộ lịch sử migration trên Supabase project `snsnkoicxmubuotcdafi`.

## Phạm vi và phiên bản

- **Issue liên quan:** [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) (kèm triển khai sớm 2 bảng rematch của [ISSUE-027](../issues/ISSUE-027-history-rematch.md)).
- **Nhánh:** `fix/issue-006-harness-isolation`.
- **Target cloud:** Supabase project `snsnkoicxmubuotcdafi` (Tên: `XIANGQI`, Region: `ap-southeast-1`, PostgreSQL 17.6.1.166).
- **Target local test:** PostgreSQL 18.3 test cluster tự động khởi tạo cô lập hoàn toàn (cổng ngẫu nhiên động, không kế thừa DB môi trường).
- **Ngày cập nhật:** 13/09/2026.
- **Môi trường:** macOS 15.7.3 (aarch64), Python 3.11.16 / 3.14.2, psql 18.3, Supabase CLI 2.101.0.
- **Tệp migrations & cấu hình:**
  - `supabase/config.toml` (port 5173, password tối thiểu 10 ký tự, `enable_confirmations = true`, allowlist callback và reset password đầy đủ)
  - `supabase/migrations/20260912000001_roles_private_profiles.sql`
  - `supabase/migrations/20260912000002_friends_rooms_members_invitations.sql`
  - `supabase/migrations/20260912000003_matches_audit_controls.sql`
  - `supabase/migrations/20260912000004_ai_chat_media.sql`
  - `supabase/migrations/20260912000005_rematch.sql`
  - `supabase/migrations/20260912000006_schema_fixes.sql`
  - `supabase/migrations/20260912000007_schema_hardening.sql`
  - `supabase/migrations/20260912000008_json_contract_hardening.sql` (bổ sung làm chặt hợp đồng JSON)
  - `tests/integration/database_test.py` (harness tự cô lập hoàn toàn, 10 suites, 180+ assertions)

## Khắc phục các phát hiện review sau PR #8

1. **[P1] Cô lập môi trường libpq trong harness, gồm `PGHOSTADDR`:**
   - Hàm `get_isolated_env()` tự động lọc sạch toàn bộ các biến môi trường libpq (`PG*`, đặc biệt là `PGHOSTADDR`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSERVICE`).
   - Mọi lệnh gọi `psql`, `pg_ctl`, `initdb` trong harness đều chạy qua `get_isolated_env()`, đảm bảo môi trường ngoài không thể làm đổi đích kết nối của harness.
   - Thêm suite kiểm thử `test_libpq_environment_isolation()` chứng minh khi set `PGHOSTADDR=192.0.2.1` ngoài shell, harness vẫn kết nối chính xác vào cluster local `127.0.0.1:{PG_PORT}`, đồng thời chứng minh lệnh không cô lập sẽ thất bại do bị trỏ sang `192.0.2.1`.
2. **[P2] Sửa test outcome thiếu winner:**
   - Trong `test_matches_and_circular_fk()`, khi cập nhật trận đấu sang trạng thái `FINISHED` với outcome thiếu trường `winner`, đặt rõ ràng `proposal = NULL` để đảm bảo test thất bại chính xác và duy nhất do vi phạm ràng buộc outcome `matches_status_and_outcome_invariants`, không bị nhiễu bởi ràng buộc proposal.
3. **[P2] Khôi phục toàn bộ các test hồi quy bị bỏ sót:**
   - Khôi phục kiểm tra nước đi cùng ô (`from == to`) bị từ chối bởi `match_moves_move_json_check`.
   - Khôi phục kiểm tra `payload_hash` sai độ dài (khác 32 bytes) bị từ chối bởi `command_receipts_payload_hash_length_check`.
   - Khôi phục ma trận kiểm tra các tổ hợp `status`/`outcome` không hợp lệ: `FINISHED` với `SERVER_RESTART`, `FINISHED` với `AGREED_DRAW` có winner, `FINISHED` với `DISCONNECT` thiếu winner, `INTERRUPTED` với `CHECKMATE`.
   - Bổ sung kiểm chứng các tổ hợp hợp lệ: `INTERRUPTED` với `SERVER_RESTART` (winner: null), `FINISHED` hòa `REPETITION` (winner: null), và `FINISHED` với `DISCONNECT` (winner: 'RED').
4. **[P2] Làm chặt và kiểm thử 4 quyền RLS trên 19 bảng:**
   - 152 phép thử quyền: Cả 2 role `anon` và `authenticated` bị từ chối cả 4 thao tác `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên toàn bộ 19/19 bảng app và schema `private`.

## Ma trận bằng chứng

| Case ID / Nội dung kiểm tra | Test path / Phương thức | Kết quả | Evidence / Giới hạn |
|---|---|---|---|
| **DB-01** / Migration fresh local | `tests/integration/database_test.py` | PASS | 8 migrations chạy tuần tự từ 0 thành công, 19 bảng tạo đủ |
| **DB-02** / Auth signup trigger & strict reject | `database_test.py::test_signup_profile_trigger` | PASS | Email signup thiếu hoặc rỗng username bị `RAISE EXCEPTION`; username sai format bị reject; Google signup username NULL; username immutable |
| **DB-03** / RLS 4 quyền (SELECT, INSERT, UPDATE, DELETE) | `database_test.py::test_comprehensive_rls_denial` | PASS | 152 phép thử: Cả `anon` và `authenticated` bị từ chối cả 4 thao tác trên toàn bộ 19/19 bảng app và schema private |
| **DB-04** / CHECK JSON, coordinates number, proposal, receipt, outcome winner | `database_test.py::test_matches_and_circular_fk`, `test_events_moves_receipts` | PASS | Tọa độ dạng chuỗi `"1"` bị reject; `proposal = '{}'` bị reject; receipt thiếu `errorCode` bị reject; outcome thiếu `winner` bị reject; DISCONNECT winner RED thành công; tổ hợp status/outcome hợp lệ và không hợp lệ |
| **DB-05** / Circular FK & cross-room | `database_test.py::test_matches_and_circular_fk` | PASS | `rooms.current_match_id` trỏ sai room_id bị FK reject; trỏ đúng room commit thành công |
| **DB-06** / Deferrable side uniqueness swap | `database_test.py::test_rooms_and_members_deferrable_swap` | PASS | 2 người chơi cùng side bị chặn; swap RED/BLACK qua transaction với `SET CONSTRAINTS DEFERRED` thành công |
| **DB-07** / Active player single slot | `database_test.py::test_matches_and_circular_fk` | PASS | 1 user không thể claim 2 slot `active_players` đồng thời (PK violation) |
| **DB-08** / Match moves & audit coordinates & same cell & hash length | `database_test.py::test_events_moves_receipts` | PASS | `move = '{}'` bị reject; tọa độ x 0..8, y 0..9 dạng số; from == to bị reject; payload_hash khác 32 bytes bị reject |
| **DB-09** / Rollback transaction atomicity thật | `database_test.py::test_real_transaction_rollback` | PASS | PL/pgSQL DO block insert rồi raise exception; verify row không tồn tại và tổng số room không đổi |
| **DB-13** / Session revocation check | `database_test.py::test_revoked_sessions` | PASS | `private.is_auth_session_active` trả `true` cho session hợp lệ, `false` ngay khi vào `revoked_sessions`, không swallow exception |
| **DB-18** / app_server audit immutability & revoked triggers | `database_test.py::test_app_server_grants_and_trigger_security` | PASS | `app_server` bị từ chối UPDATE/DELETE trên audit tables; anon/authenticated bị từ chối gọi trigger functions |
| **DB-Isolation** / Libpq env variable isolation | `database_test.py::test_libpq_environment_isolation` | PASS | Kiểm chứng `PGHOSTADDR`, `PGPORT`, `PGDATABASE` từ môi trường ngoài không làm lệch kết nối của test harness |
| **Cloud Catalog** / 19 bảng ứng dụng | Remote query `information_schema.tables` | PASS | Đủ 18 bảng `public`, 1 bảng `private.revoked_sessions` trên `snsnkoicxmubuotcdafi` |
| **Cloud RLS** / 19 bảng enabled & forced | Remote query `pg_class` | PASS | Cả 19 bảng đều có `relrowsecurity = true` và `relforcerowsecurity = true` |
| **Cloud Constraints** / Khóa và kiểm tra | Remote query `information_schema.table_constraints` | PASS | 19 PRIMARY KEY, 43 FOREIGN KEY, 12 UNIQUE, 217 CHECK constraints (sau hardening đợt 3) |
| **Cloud Migration History** / Đồng bộ version 100% | Remote query `supabase_migrations.schema_migrations` | PASS | Đủ 8 migrations (`20260912000001` .. `20260912000008`) khớp 100% tên file Git |
| **Cloud Smoke** / Read-only smoke query | Remote SQL execution | PASS | Query count(*) trên cả 19 bảng trả 0 rows không lỗi; test gọi `is_auth_session_active` trả `false` |
| **Backend Integration** / HTTP/Fastify/pool | Server backend tests | NOT_RUN | Cần hoàn thành ISSUE-001/002 trước khi có app runtime; owner: ISSUE-006 consumer |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `python3 tests/integration/database_test.py` | 0 | 10/10 suites pass | 180+ assertions, tự động tạo cluster độc lập trên port ngẫu nhiên, cô lập libpq, nạp 8 migrations, test và dọn sạch |
| `mcp__supabase__apply_migration (20260912000008_json_contract_hardening)` | 0 | OK | Apply migration 8 lên Supabase `snsnkoicxmubuotcdafi` |
| `UPDATE supabase_migrations.schema_migrations ...` | 0 | OK | Đồng bộ lịch sử migration cloud khớp 8 file Git |
| `SELECT private.is_auth_session_active(...)` | 0 | OK (false) | Smoke test cloud sau khi áp dụng migration 8 |

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 8 files đã được đánh version và đồng bộ 100% với cloud.
- **Cấu hình Auth local:** `supabase/config.toml` đã điều chỉnh theo spec (port 5173, min length 10, email confirmations on, callback & reset-password allowlist đầy đủ).
- **Harness kiểm thử local:** `tests/integration/database_test.py` tự chạy cô lập hoàn toàn từ checkout sạch bằng một lệnh duy nhất: `python3 tests/integration/database_test.py`.
- **Trạng thái:** LOCAL_DONE (Schema và Python harness local hoàn tất; phần TypeScript app pool/transaction và Auth E2E sẽ kết nối khi hoàn thành ISSUE-001/002).
