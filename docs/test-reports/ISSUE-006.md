# Báo cáo Kiểm chứng Kỹ thuật: ISSUE-006 — Supabase migrations và test integration thật

**Ngày thực hiện:** 2026-09-13 (cập nhật đợt khắc phục review: đóng F-10/F-11/F-12)
**Môi trường:** macOS Darwin 24.6.0, Node.js v24.15.0, Apple Silicon (arm64), pnpm 10.34.5,
Supabase CLI 2.101.0 (stack local), LiveKit 1.13.6
**Tiêu chuẩn kiểm chứng:** [09-DATABASE-DESIGN.md](../specs/09-DATABASE-DESIGN.md), [08-TEST-EXECUTION.md](../specs/08-TEST-EXECUTION.md) & [ISSUE-006-database-test-harness](../issues/ISSUE-006-database-test-harness.md)

> **Thay đổi so với bản trước:** lệnh "kiểm chứng" trước đây là unit test với mock
> (`vitest.config.ts tests/unit/database.test.ts`, 6 test) và toàn bộ test DB trong
> lane integration luôn bị `describe.skipIf(!DATABASE_URL)` bỏ qua — đúng như finding
> F-11/F-12. Nay ISSUE-006 được kiểm chứng bằng test thật trên Supabase local: harness
> TS `tests/fixtures/integration.ts` (seed Auth thật, `authAs`, `resetTestData`, `dispose`),
> cổng bảo vệ loopback `tests/integration/setup.ts`, và config `vitest.integration.config.ts`.
> Quy trình chạy local đầy đủ: [DATABASE-SETUP.md](./DATABASE-SETUP.md).

---

## 1. Kết quả lệnh kiểm chứng bắt buộc

### Lệnh thực thi (đường dẫn lane theo issue):

```bash
pnpm test:integration
# = pnpm exec vitest run --config vitest.integration.config.ts
```

Lane gồm `tests/integration/**/*.test.ts` + `tests/media/**/*.ts`; hai file thuộc ISSUE-006:

```bash
pnpm exec vitest run --config vitest.integration.config.ts \
  tests/integration/database.test.ts tests/integration/harness.test.ts
```

### Kết quả đầu ra (exit code 0):

```
 RUN  v3.2.7 /Users/twot/Documents/CODE/XIANGQI

stdout | tests/integration/harness.test.ts
[integration harness] LOCAL stack only — db 127.0.0.1:54322, auth http://127.0.0.1:54321

 ✓ tests/integration/harness.test.ts (6 tests) 4202ms
   ✓ T006: integration harness factory > T006-H4: resetTestData deletes exactly this run and leaves other runs intact  1311ms
   ✓ T006: integration harness factory > T006-H5: withTestContext disposes even when the body throws  1129ms
 ✓ tests/integration/database.test.ts (11 tests) 1866ms

 Test Files  2 passed (2)
      Tests  17 passed (17)
   Duration  6.42s
```

### Cổng chống trỏ nhầm cloud (exit code 1, đã chạy thật):

```bash
DATABASE_URL=postgresql://postgres:postgres@db.cloud.example.com:5432/postgres pnpm test:integration
```

```
Error: [integration harness] REFUSING to run: DATABASE_URL points at host "db.cloud.example.com",
which is not loopback (127.0.0.1 / localhost / ::1). Integration tests must never touch the
Supabase cloud project. Point it at the local stack
(postgresql://postgres:postgres@127.0.0.1:54322/postgres, http://127.0.0.1:54321).
❯ assertLoopbackTarget tests/fixtures/integration.ts:109
❯ resolveTestEnv tests/fixtures/integration.ts:152
❯ tests/integration/setup.ts:28

 Test Files  6 failed (6)
      Tests  no tests
ELIFECYCLE  Command failed with exit code 1.
```

---

## 2. Bảng đối chiếu tình huống nghiệm thu (Acceptance Criteria)

| Tình huống | Hành động / đầu vào | Kết quả bắt buộc | Thực tế | Trạng thái |
|---|---|---|---|---|
| **Kết nối pool** | Pool `app_server` (RLS-scoped) kết nối TCP sau `ALTER ROLE app_server PASSWORD` | `SELECT 1` chạy được, role không phải superuser | `T006-01`: `current_user = app_server`, `is_superuser = off`, `SELECT 1` = 1 | **PASS** |
| **Rollback giao dịch** | `withTransaction` insert `public.moves` thật rồi throw | Không lưu dữ liệu nửa chừng | `T006-02`: bảng `moves` còn 0 dòng cho match đó | **PASS** |
| **Commit giao dịch** | `withTransaction` insert thật không throw | Dữ liệu tồn tại sau commit | `T006-03`: đọc lại đúng `move_number=1, side=RED` | **PASS** |
| **Ràng buộc UNIQUE** | Hai lần insert cùng khoá duy nhất | Chỉ một thành công, lỗi `23505` | `T006-04` (`friend_relations_user_pair_unique`) + `T006-05` (2 writer tranh `profiles_username_unique`, đúng 1 thắng) | **PASS** |
| **Ràng buộc FK** | Insert row trỏ `match_id` không tồn tại | Lỗi `23503` | `T006-06`: `23503` / `moves_match_id_fkey` | **PASS** |
| **Ràng buộc CHECK** | Insert match với `time_control = 123` | Lỗi `23514` | `T006-07`: `23514` / `matches_time_control_check` | **PASS** |
| **RLS — anon** | `SET LOCAL ROLE anon` rồi SELECT/INSERT bảng app | Bị từ chối | `T006-08`: `42501` cho cả `SELECT` và `INSERT public.rooms` | **PASS** |
| **RLS — authenticated** | `SET LOCAL ROLE authenticated` + `set_config('request.jwt.claims', '{"sub":…,"role":"authenticated"}')` | Bị từ chối | `T006-09`: `42501` cho `SELECT` và `UPDATE public.rooms` | **PASS** |
| **Private function** | anon/authenticated gọi `private.is_auth_session_active` | Bị từ chối | `T006-10`: `42501` cho cả hai role | **PASS** |
| **Positive control** | `app_server` đọc cùng bảng bị từ chối ở trên | Đọc được dữ liệu thật | `T006-11`: thấy đúng `rooms` vừa tạo, `owner_id` = user A | **PASS** |
| **Harness seed** | `createTestContext()` / `seedUsers()` | 8 user thật A/B/S1..S6, gắn `runId`, có profile | `T006-H1`: 8 id khác nhau, email+username chứa `runId`, JWT 3 phần, 8 profile thấy được qua cả hai pool | **PASS** |
| **Auth session thật** | `authAs('A')` gọi `GET /api/v1/me` trên app thật | 200 + profile đã seed | `T006-H2`: 200, `profile.id/username/displayName` khớp, `onboardingRequired=false` | **PASS** |
| **Thiếu token** | Gọi `GET /api/v1/me` không có Authorization | 401 | `T006-H3`: 401, `error.code = UNAUTHENTICATED` | **PASS** |
| **Dọn dữ liệu theo runId** | `resetTestData(runId, adminPool)` | Chỉ xoá dòng của run, không `TRUNCATE`, không đụng run khác | `T006-H4`: rooms/profiles/auth user của run victim = 0; run khác giữ nguyên (8 auth user, room + profile còn); gọi lại lần 2 là no-op | **PASS** |
| **Dispose kể cả khi fail** | `withTestContext` throw trong thân hàm | Vẫn đóng app/pool | `T006-H5`: `pool`/`adminPool` sau đó từ chối truy vấn (`after calling end`) | **PASS** |
| **Dispose idempotent** | Gọi `dispose()` hai lần + kiểm tra handle | Không rò rỉ kết nối/app | `T006-H6`: `app.inject` báo `FST_ERR_REOPENED_CLOSE_SERVER`, `totalCount/idleCount = 0`, gọi lần 2 resolve | **PASS** |
| **Migration từ DB sạch / constraints** | Xem DB-01..DB-18 (harness Python, độc lập) | Đủ bảng + ràng buộc | Giữ nguyên kết quả ở [DATABASE-SETUP.md](./DATABASE-SETUP.md) | **PASS** |

**Số assertion thật chạm Postgres/Auth:** 17 test / ~45 assertion; mỗi test đều mở kết nối
thật (`app_server`, `service_role` hoặc owner), seed 8 Auth user thật qua Admin API + password
grant cho mỗi context (T006-H1..H6 tạo 4 context) và không có mock nào trong hai file này.

**Ghi chú kỹ thuật (khác biệt có lý do so với spec):**

1. `moves_match_move_number_unique` đã bị **drop** bởi migration
   `20260912000011_match_ancestry.sql` (khắc phục F-01: `public.match_moves` +
   `parent_move_id` là runtime log, `public.moves` chỉ còn là audit). Vì vậy case UNIQUE
   `23505` dùng `friend_relations_user_pair_unique` (T006-04) và `profiles_username_unique`
   (T006-05) thay cho ràng buộc đã bị bỏ.
2. `adminPool` chạy session `service_role` (BYPASSRLS) chứ không phải `postgres`: mọi bảng
   app là `FORCE ROW LEVEL SECURITY` với policy chỉ cấp cho `app_server`, nên chính role
   owner `postgres` cũng không seed/delete được. Assertion RLS vẫn chạy bằng
   `SET LOCAL ROLE anon|authenticated` trên session này (không dùng quyền cao để che lỗi).
3. `private.revoked_sessions` do kết nối owner xoá (schema `private` không cấp cho
   `service_role`), trước khi xoá `profiles` vì FK `RESTRICT`.

## 3. Phạm vi bằng chứng của report này

Các số liệu tổng hợp toàn dự án (unit/E2E/benchmark/load, trạng thái 32 issue) nằm ở
[PROGRESS.md](../handoff/PROGRESS.md) và [final-coverage.md](./final-coverage.md) — hai
tài liệu này do lane tổng hợp trạng thái cập nhật, không lặp lại ở đây để tránh lệch số.

Trong phạm vi lane ISSUE-006, bằng chứng đã chạy trong môi trường này:

```
- Integration DB/Auth (ISSUE-006): 17/17 test pass (database.test.ts 11, harness.test.ts 6)
- Lane-wide `pnpm test:integration`: xem mục 4 (các suite do lane ISSUE-012/021/024 sở hữu)
- Cổng loopback: exit 1 + thông báo từ chối (mục 1)
- Lint (eslint) trên các file của lane: 0 error
```

## 4. Trạng thái lane toàn cục (cập nhật khi chạy `pnpm test:integration`)

| Lần chạy | Kết quả | Ghi chú |
|---|---|---|
| 17:42 | `Test Files 6 passed (6)`, `Tests 36 passed (36)`, exit 0, 27.98s | Lane đầy đủ (chạy lại sau thay đổi cuối cùng của harness): `database.test.ts` (11), `harness.test.ts` (6), `ai-match.test.ts` (6), `match-model.test.ts` (3), `faults.test.ts` (2), `media/spike.ts` (8). Không file nào bị skip |
| 17:36 | `Test Files 2 failed \| 4 passed (6)`, `Tests 3 failed \| 33 passed (36)` | Trạng thái giữa chừng khi hai lane khác đang sửa: `ai-match.test.ts` (lane ISSUE-021) và `media/spike.ts` (lane ISSUE-024/025) — cả hai đã xanh ở lần chạy 17:40; `database.test.ts` + `harness.test.ts` pass ở mọi lần chạy |
