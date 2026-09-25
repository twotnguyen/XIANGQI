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

## Lane kiểm thử TypeScript trên Supabase local (khắc phục F-10/F-11/F-12)

Bổ sung harness TS thật (`tests/fixtures/integration.ts`, `tests/integration/setup.ts`,
`tests/integration/database.test.ts`, `tests/integration/harness.test.ts`) và lane
`vitest.integration.config.ts` để acceptance ISSUE-006 được chạy bằng lệnh trong repo
thay vì script Python ngoài lane. F-11 (test DB luôn bị skip) và F-12 (test "DB" chỉ
assert mock) được đóng bằng các case thật dưới đây.

### 1. Quy trình local (một lần cho mỗi máy)

```bash
# Runtime: Node 24 (.nvmrc), pnpm 10.34.5 — process.loadEnvFile cần Node >= 21.7
eval "$(fnm env)"; fnm use 24

supabase start                     # Postgres 54322, API/Auth 54321
supabase status                    # lấy Publishable / Secret key của stack local

cp .env.test.example .env.test     # .env.test KHÔNG được commit (.gitignore: .env.*)
#   -> điền SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY từ `supabase status`
#   -> DATABASE_URL giữ nguyên mặc định local: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

`.env.test.example` (được commit) chỉ chứa default local; `.env.test` bị gitignore và
là nơi duy nhất giữ key của stack local. Không đặt URL `https://*.supabase.co` vào đây.

### 2. app_server lấy mật khẩu local

`app_server` có `LOGIN` nhưng không có password (migration `20260912000001`). Trước khi
tạo app, `createTestContext()` chạy idempotent trên kết nối owner:

```sql
ALTER ROLE app_server PASSWORD 'xiangqi-local-app-server';  -- override: TEST_APP_SERVER_PASSWORD
```

rồi pool của app kết nối `postgresql://app_server:...@127.0.0.1:54322/postgres`
(RLS-scoped, đúng role sản phẩm). Vì mọi bảng app là `FORCE ROW LEVEL SECURITY` với
policy chỉ cấp cho `app_server`, kể cả `postgres` (owner) cũng không seed/delete được;
harness dùng session `service_role` (BYPASSRLS) cho seed + `resetTestData`, và
`SET LOCAL ROLE anon|authenticated` cho assertion RLS (`adminPool`).

### 3. Cổng bảo vệ loopback (fail loud, không skip)

`tests/integration/setup.ts` là `setupFiles` của lane: nạp `.env.test` (fallback `.env`)
bằng `process.loadEnvFile`, liệt kê tên biến còn thiếu, và **từ chối chạy** nếu
`DATABASE_URL`/`SUPABASE_URL` không trỏ `127.0.0.1` / `localhost` / `::1`. Biến môi
trường shell thắng `.env.test` (Node không ghi đè biến đã có), nên có thể demo guard:

```
$ DATABASE_URL=postgresql://postgres:postgres@db.cloud.example.com:5432/postgres pnpm test:integration
Error: [integration harness] REFUSING to run: DATABASE_URL points at host "db.cloud.example.com",
which is not loopback (127.0.0.1 / localhost / ::1). Integration tests must never touch the
Supabase cloud project. Point it at the local stack (...)
→ exit code 1, toàn bộ lane dừng trước khi chạy test
```

Lane cũng từ chối chạy khi thiếu marker `XIANGQI_INTEGRATION_LANE` (đặt bởi config) để
không thể "xanh nhờ skip".

### 4. Lệnh chạy lane

```bash
pnpm test:integration   # tests/integration/**/*.test.ts + tests/media/**/*.ts (fileParallelism: false, testTimeout 30s)
pnpm test:media         # chỉ tests/media/** (SFU LiveKit local 127.0.0.1:7880, devkey/secret)
```

- Harness API (`tests/fixtures/integration.ts`): `createTestContext({seed})`,
  `withTestContext(fn)` (dispose trong `try/finally`), `seedUsers(runId, adminPool)`,
  `resetTestData(runId, adminPool)`, `findAuthUserIds(runId)`, `createAuthUser(...)`,
  `authAs(key)`; `dispose()` idempotent, đóng `app` + `pool` + `adminPool`.
- `seedUsers` tạo 8 user Auth thật (A, B, S1..S6) qua Admin API với email/username gắn
  `runId`, để trigger `on_auth_user_created` tạo `public.profiles`, rồi đăng nhập
  password grant để lấy `access_token` thật cho `authAs`.
- `resetTestData` chỉ xoá dòng thuộc `runId` (user id + phòng/trận tạo bởi các id đó),
  theo thứ tự FK con → cha, rồi xoá auth user qua Admin API; không `TRUNCATE`, không
  đụng dữ liệu run khác. `private.revoked_sessions` do kết nối owner xoá (schema
  `private` không cấp cho `service_role`).
- CI: job `integration` (`supabase/setup-cli@v1` + `supabase start` + `pnpm test:integration`)
  và job `media` (`supabase start` + `livekit/livekit-server --dev` + `pnpm test:media`);
  cả hai FAIL khi thiếu service/env, không skip.

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
| **Backend Integration** / HTTP/Fastify/pool/Auth thật | `tests/integration/database.test.ts` (T006-01..11), `tests/integration/harness.test.ts` (T006-H1..H6) | PASS (scoped) | 17/17 test pass trên Supabase local: app_server `SELECT 1`, rollback/commit thật, 23505/23503/23514, anon+authenticated bị 42501 trên bảng app và `private.is_auth_session_active`, `authAs('A')` → `GET /api/v1/me` 200, `resetTestData` chỉ xoá run của mình, `dispose()` idempotent. Xem mục lệnh đã chạy |
| **Media lane** / LiveKit SFU thật | `pnpm test:media` → `tests/media/spike.ts` | PASS | Lane đã collect + chạy test thật (trước đây file không nằm trong runner nào — F-10): 8/8 test pass; T024-06 subscriber được cấp quyền nhận `bytes=10271 frames=13`, viewer stale generation nhận `bytes=0 frames=0` trong cửa sổ 6000ms |

## Lệnh đã chạy

| Lệnh nguyên văn | Exit code | Kết quả | Ghi chú |
|---|---|---|---|
| `python3 tests/integration/database_test.py` | 0 | 10/10 suites pass | 180+ assertions, tự động tạo cluster độc lập trên port ngẫu nhiên, cô lập libpq, nạp 8 migrations, test và dọn sạch |
| `mcp__supabase__apply_migration (20260912000008_json_contract_hardening)` | 0 | OK | Apply migration 8 lên Supabase `snsnkoicxmubuotcdafi` |
| `UPDATE supabase_migrations.schema_migrations ...` | 0 | OK | Đồng bộ lịch sử migration cloud khớp 8 file Git |
| `SELECT private.is_auth_session_active(...)` | 0 | OK (false) | Smoke test cloud sau khi áp dụng migration 8 |
| `pnpm test:integration` | 0 | 6 files / 36 tests pass (27.98s) | Lane thật trên Supabase local: database 11, harness 6, ai-match 6, match-model 3, faults 2, media spike 8 — không file nào skip |
| `pnpm exec vitest run --config vitest.integration.config.ts tests/integration/database.test.ts tests/integration/harness.test.ts` | 0 | 2 files / 17 tests pass (6.42s) | Phạm vi ISSUE-006 (T006-01..11, T006-H1..H6), seed Auth thật + pool `app_server`/`service_role` thật |
| `DATABASE_URL=postgresql://postgres:postgres@db.cloud.example.com:5432/postgres pnpm test:integration` | 1 | `[integration harness] REFUSING to run: DATABASE_URL points at host "db.cloud.example.com" …` | Cổng loopback: 6/6 file dừng trước khi chạy test, `Test Files 6 failed`, `Tests no tests` |
| `pnpm test:media` | 0 | 1 file / 8 tests pass (13.23s) | Spike chạy SFU LiveKit thật (loopback candidate) + policy DB thật |
| `pnpm exec eslint tests/fixtures/integration.ts tests/integration/setup.ts tests/integration/database.test.ts tests/integration/harness.test.ts vitest.integration.config.ts` | 0 | 0 error | Scoped lint cho các file của lane |

## Bàn giao

- **Supabase Project:** `XIANGQI` (`snsnkoicxmubuotcdafi`).
- **Migrations:** Nằm trong thư mục `supabase/migrations/` gồm 8 files đã được đánh version và đồng bộ 100% với cloud.
- **Cấu hình Auth local:** `supabase/config.toml` đã điều chỉnh theo spec (port 5173, min length 10, email confirmations on, callback & reset-password allowlist đầy đủ).
- **Harness kiểm thử local (Python, độc lập):** `tests/integration/database_test.py` tự chạy cô lập hoàn toàn từ checkout sạch bằng một lệnh duy nhất: `python3 tests/integration/database_test.py`.
- **Lane kiểm thử TypeScript (mới):** `pnpm test:integration` / `pnpm test:media` trên Supabase + LiveKit local; harness `tests/fixtures/integration.ts` (`createTestContext`, `withTestContext`, `seedUsers`, `authAs`, `resetTestData`), cổng chặn cloud `tests/integration/setup.ts`. Chi tiết quy trình: mục "Lane kiểm thử TypeScript trên Supabase local".
- **Trạng thái:** LOCAL_DONE (schema + Python harness + lane TypeScript DB/Auth đều chạy thật local; các gate provider/hardware và đồng bộ cloud vẫn ngoài phạm vi lane này).
