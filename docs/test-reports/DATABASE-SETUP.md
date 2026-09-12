# Báo cáo nghiệm thu thiết lập CSDL XIANGQI trên Supabase (Hoàn thiện triệt để đợt 3)

Báo cáo bằng chứng kỹ thuật về việc tạo migrations, áp dụng migration 8 (làm chặt toàn diện hợp đồng JSONB), cô lập 100% test harness không phụ thuộc DB ngoài, kiểm thử đầy đủ 4 quyền (SELECT, INSERT, UPDATE, DELETE) trên toàn bộ 19 bảng và đồng bộ lịch sử migration trên Supabase project `snsnkoicxmubuotcdafi`.

## Phạm vi và phiên bản

- **Issue liên quan:** [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) (kèm triển khai sớm 2 bảng rematch của [ISSUE-027](../issues/ISSUE-027-history-rematch.md)).
- **Nhánh:** `fix/issue-006-json-contract-hardening`.
- **Target cloud:** Supabase project `snsnkoicxmubuotcdafi` (Tên: `XIANGQI`, Region: `ap-southeast-1`, PostgreSQL 17.6.1.166).
- **Target local test:** PostgreSQL 18.3 test cluster tự động khởi tạo cô lập hoàn toàn (cổng ngẫu nhiên động, không kế thừa DB môi trường).
- **Ngày cập nhật:** 12/09/2026.
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
  - `tests/integration/database_test.py` (harness tự cô lập hoàn toàn, 9 suites, 170+ assertions)

## Khắc phục các phát hiện review đợt 3

1. **[P1] Cô lập tuyệt đối test harness:**
   - Sửa hàm `setup_isolated_test_cluster()`: mặc định **luôn luôn** tạo một cluster PostgreSQL tạm thời riêng biệt trên một cổng tự do ngẫu nhiên (`find_free_port()`), với socket và data dir trong `/tmp/xiangqi-test-pg-<pid>-<hash>`.
   - Tuyệt đối không kế thừa cấu hình môi trường bên ngoài (`PGPORT`, `PGHOST`, `PGDATABASE`) trừ khi cờ `--use-existing` được truyền rõ ràng. Loại bỏ hoàn toàn nguy cơ chạy nhầm vào database đang tồn tại hoặc cloud.
2. **[P2] Làm chặt toàn diện các ràng buộc JSON theo hợp đồng:**
   - **Tọa độ nước đi bắt buộc là số:** `match_moves_move_json_check` kiểm tra `jsonb_typeof` của các trường `x` và `y` trong `from` và `to` bắt buộc phải là `'number'`, đồng thời nằm trong dải số nguyên hợp lệ (x: 0..8, y: 0..9). Bác bỏ trường hợp truyền chuỗi `"1"`.
   - **Bác bỏ `proposal = {}`:** `matches_proposal_check` kiểm tra bắt buộc các trường `id` (UUID regex), `kind` ('DRAW'|'UNDO'), `requester` ('RED'|'BLACK'), `basePly` (number >= 0), `createdVersion` (number >= 0), `expiresAtMs` (number >= 0). Bác bỏ đối tượng rỗng hoặc thiếu trường.
   - **Receipt bắt buộc có khóa `errorCode`:** `command_receipts_result_json_check` bắt buộc JSON object phải có cả 2 khóa `kind` và `errorCode`. Khi `kind = 'APPLIED'`, `errorCode` bắt buộc phải có giá trị JSON `null` (`jsonb_typeof = 'null'`). Bác bỏ `{"kind":"APPLIED"}` thiếu khóa `errorCode`.
   - **Outcome hòa/interrupted bắt buộc có khóa `winner`:** `matches_status_and_outcome_invariants` bắt buộc JSON object phải có cả 2 khóa `reason` và `winner`. Khi hòa hoặc interrupted, `winner` bắt buộc phải có giá trị JSON `null` (`jsonb_typeof = 'null'`). Bác bỏ `{"reason":"REPETITION"}` thiếu khóa `winner`.
3. **[P2] Kiểm thử đầy đủ tiêu chí DB-03 cho 4 quyền trên 19 bảng:**
   - Mở rộng suite `test_comprehensive_rls_denial()`: kiểm tra đầy đủ cả 4 quyền `SELECT`, `INSERT`, `UPDATE` và `DELETE` đối với cả 2 role `anon` và `authenticated` trên toàn bộ 19/19 bảng ứng dụng (tổng cộng 152 phép thử quyền). Xác nhận toàn bộ đều bị từ chối `permission denied`.

## Ma trận bằng chứng

| Case ID / Nội dung kiểm tra | Test path / Phương thức | Kết quả | Evidence / Giới hạn |
|---|---|---|---|
| **DB-01** / Migration fresh local | `tests/integration/database_test.py` | PASS | 8 migrations chạy tuần tự từ 0 thành công, 19 bảng tạo đủ |
| **DB-02** / Auth signup trigger & strict reject | `database_test.py::test_signup_profile_trigger` | PASS | Email signup thiếu hoặc rỗng username bị `RAISE EXCEPTION`; username sai format bị reject; Google signup username NULL; username immutable |
| **DB-03** / RLS 4 quyền (SELECT, INSERT, UPDATE, DELETE) | `database_test.py::test_comprehensive_rls_denial` | PASS | 152 phép thử: Cả `anon` và `authenticated` bị từ chối cả 4 thao tác trên toàn bộ 19/19 bảng app và schema private |
| **DB-04** / CHECK JSON, coordinates number, proposal, receipt, outcome winner | `database_test.py::test_matches_and_circular_fk`, `test_events_moves_receipts` | PASS | Tọa độ dạng chuỗi `"1"` bị reject; `proposal = '{}'` bị reject; receipt thiếu `errorCode` bị reject; outcome thiếu `winner` bị reject; DISCONNECT winner RED thành công |
| **DB-05** / Circular FK & cross-room | `database_test.py::test_matches_and_circular_fk` | PASS | `rooms.current_match_id` trỏ sai room_id bị FK reject; trỏ đúng room commit thành công |
| **DB-06** / Deferrable side uniqueness swap | `database_test.py::test_rooms_and_members_deferrable_swap` | PASS | 2 người chơi cùng side bị chặn; swap RED/BLACK qua transaction với `SET CONSTRAINTS DEFERRED` thành công |
| **DB-07** / Active player single slot | `database_test.py::test_matches_and_circular_fk` | PASS | 1 user không thể claim 2 slot `active_players` đồng thời (PK violation) |
| **DB-08** / Match moves & audit coordinates & empty move | `database_test.py::test_events_moves_receipts` | PASS | `move = '{}'` bị reject; tọa độ x 0..8, y 0..9 dạng số; from == to bị reject; payload_hash 32 bytes |
| **DB-09** / Rollback transaction atomicity thật | `database_test.py::test_real_transaction_rollback` | PASS | PL/pgSQL DO block insert rồi raise exception; verify row không tồn tại và tổng số room không đổi |
| **DB-13** / Session revocation check | `database_test.py::test_revoked_sessions` | PASS | `private.is_auth_session_active` trả `true` cho session hợp lệ, `false` ngay khi vào `revoked_sessions`, không swallow exception |
| **DB-18** / app_server audit immutability & revoked triggers | `database_test.py::test_app_server_grants_and_trigger_security` | PASS | `app_server` bị từ chối UPDATE/DELETE trên audit tables; anon/authenticated bị từ chối gọi trigger functions |
| **Cloud Catalog** / 19 bảng ứng dụng | Remote query `information_schema.tables` | PASS | Đủ 18 bảng `public`, 1 bảng `private.revoked_sessions` trên `snsnkoicxmubuotcdafi` |
| **Cloud RLS** / 19 bảng enabled & forced | Remote query `pg_class` | PASS | Cả 19 bảng đều có `relrowsecurity = true` và `relforcerowsecurity = true` |
| **Cloud Constraints** / Khóa và kiểm tra | Remote query `information_schema.table_constraints` | PASS | 19 PRIMARY KEY, 43 FOREIGN KEY, 12 UNIQUE, 217 CHECK constraints (sau hardening đợt 3) |
| **Cloud Migration History** / Đồng bộ version 100% | Remote query `supabase_migrations.schema_migrations` | PASS | Đủ 8 migrations (`20260912000001` .. `20260912000008`) khớp 100% tên file Git |
| **Cloud Smoke** / Read-only smoke query | Remote SQL execution | PASS | Query count(*) trên cả 19 bảng trả 0 rows không lỗi; test gọi `is_auth_session_active` trả `false` |
| **Backend Integration** / HTTP/Fastify/pool | Server backend tests | NOT_RUN | Cần hoàn thành ISSUE-001/002 trước khi có app runtime; owner: ISSUE-006 consumer |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `python3 tests/integration/database_test.py` | 0 | 9/9 suites pass | 170+ assertions, tự động tạo cluster độc lập trên port ngẫu nhiên, nạp 8 migrations, test và dọn sạch |
| `mcp__supabase__apply_migration (20260912000008_json_contract_hardening)` | 0 | OK | Apply migration 8 lên Supabase `snsnkoicxmubuotcdafi` |
| `UPDATE supabase_migrations.schema_migrations ...` | 0 | OK | Đồng bộ lịch sử migration cloud khớp 8 file Git |
| `SELECT private.is_auth_session_active(...)` | 0 | OK (false) | Smoke test cloud sau khi áp dụng migration 8 |

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 8 files đã được đánh version và đồng bộ 100% với cloud.
- **Cấu hình Auth local:** `supabase/config.toml` đã điều chỉnh theo spec (port 5173, min length 10, email confirmations on, callback & reset-password allowlist đầy đủ).
- **Harness kiểm thử local:** `tests/integration/database_test.py` tự chạy cô lập hoàn toàn từ checkout sạch bằng một lệnh duy nhất: `python3 tests/integration/database_test.py`.
- **Trạng thái:** LOCAL_DONE.
