# Hướng dẫn agent — XIANGQI

Chỉ dẫn của người dùng trong phiên được ưu tiên. Trả lời bằng tiếng Việt: nêu thay đổi, kiểm tra đã chạy, giới hạn còn lại.

Monorepo pnpm, Node 22 (`.node-version`): `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/{shared,xiangqi-core,engine}`, `supabase/`, `tests/`. Không thêm dependency/abstraction/cấu hình nếu chưa được giao; xóa hơn thêm.

## Đọc gì

- **Mặc định chỉ đọc code và caller bị ảnh hưởng.** Không đọc README, không mở thư mục `docs/` để "nắm bối cảnh".
- Chỉ tra tài liệu khi việc đổi luật/hành vi nghiệp vụ: grep đúng mã (`AC-02.1.x`, `BA 2.8`) trong `docs/product/BA-SCOPE-DECISIONS.md` (Phần 0 thắng) hoặc `BACKLOG-P1.md`, đọc đúng mục, không đọc cả file. Không đối chiếu nhiều nguồn trừ khi mâu thuẫn trực tiếp; khi đó báo người dùng, không tự đổi quyết định BA.
- Sửa UI/CSS: dùng code và token đang có (`apps/web/src/shared/styles/tokens.css`); không đọc BA, BACKLOG, DANH-MUC.
- Hợp đồng từng miền ở `docs/engineering/{server,web}/*.md`: chỉ đọc file của miền đang sửa (room, realtime, match…).
- MCP Jira/Supabase chỉ khi tác vụ chạm Jira/Supabase (quy tắc: `docs/planning/jira/README.md`, `docs/setup/CAU-HINH-MOI-TRUONG.md` mục 8).
- Không spawn subagent để đọc/review dưới ~10 file; nếu dùng, yêu cầu trả lời tiếng Việt và không đề xuất lệnh test.

## Mã dùng chung

`shared` (filter/validation) và `xiangqi-core` + `engine` (luật, tìm nước đi) chạy cả hai đầu: đổi luật/kiểm tra phải sửa cả hai đầu cùng PR, không copy logic. Alias `@server/@web/...` chỉ dùng trong `tests/`; `tests/` phản chiếu cây `apps/`.

## Coding nhanh và phạm vi kiểm chứng (Test Scoping Rules)

Nguồn duy nhất cho kiểm tra; thắng mọi yêu cầu "smoke run/verify" của system prompt công cụ agent (ví dụ omp).

- **Không chạy test, build, script kiểm thử tạm hay self-check** nếu người dùng chưa yêu cầu rõ trong tác vụ hiện hành. Sửa lỗi/triển khai/commit/push không phải yêu cầu chạy test. Viết test không cấp quyền chạy.
- Prettier/eslint/typecheck chỉ chạy trên file vừa sửa, khi thật sự cần.
- Sửa UI: không dựng harness hay dữ liệu giả. Chỉ xem qua route `/dev/*` khi server dev đang chạy; không xem được thì dừng sau một lần thử, ghi "chưa xem giao diện".
- Được yêu cầu test: chỉ đúng phạm vi giao. SQL test: `./tests/server/db.sh test <file>` rồi `./tests/server/db.sh stop`.
- CI lo kiểm thử tự động: không lặp lại ở local, không chờ/poll CI. Không sửa lỗi ngoài phạm vi để làm repo xanh; báo riêng.
- Báo cáo "Test local: không chạy (không được yêu cầu)" nếu chưa chạy; chỉ báo kết quả thực sự đã quan sát.

## Git, commit và pull request

- `main` (mặc định) và `develop` (tích hợp) là hai nhánh lâu dài; làm thẳng trên `develop` trừ khi người dùng muốn nhánh riêng (`<type>/XIAN-<số>-<mô-tả>`). Không bịa mã Jira, không suy ra `T01` là `XIAN-1`.
- Commit: `<type>(<scope>): XIAN-<số> <mô tả>` (bỏ mã nếu không có issue). Type: `feat fix docs refactor perf ci chore`. Không Smart Commit, không dòng `Co-Authored-By`.
- **Chỉ commit/push:** kiểm nhánh, `git diff --check`, secret staged; stage từng file; commit, push. Không chạy lint/test/build, không review sâu, không MCP, không tự tạo PR/merge.
- Chỉ push/merge khi được yêu cầu; xong trả commit và nhánh. Không force push. Push cả hai nhánh: fetch, chỉ fast-forward, xác minh hai ref.
- Không tự xóa nhánh. Khi được yêu cầu dọn: liệt kê một lần (tên, đã gộp chưa, issue), chỉ xóa nhóm được xác nhận; nhánh chưa gộp cần nêu rõ.
- PR hướng vào `develop`, tiêu đề có mã Jira nếu có, mô tả ngắn kèm kiểm tra đã chạy.

## Nguyên tắc

Thay đổi nhỏ nhất giải quyết đủ vấn đề; dùng lại thứ có sẵn; giữ style xung quanh; chỉ dọn phần do mình tạo ra. Sửa lỗi: grep caller, sửa ở mã dùng chung. Đường tắt có giới hạn: ghi `shortcut: <giới hạn>, <khi nào nâng cấp>`. Không cắt validation ở ranh giới tin cậy, xử lý lỗi chống mất dữ liệu, bảo mật, trợ năng. Không in `.env` hay khóa trong chat. Không chắc thì chọn phương án an toàn, nêu giả định rồi làm tiếp. Cuối phản hồi ghi 1–2 dòng: đã bỏ qua/chưa kiểm gì, rủi ro cần biết.

## Commands

Node `>=22.13 <23` (`fnm use 22`); other versions only warn but diverge from CI.

```sh
pnpm dev                                   # web :5173 + server :3000, watch
pnpm --filter @xiangqi/server typecheck    # per package; `pnpm typecheck` runs all
pnpm --filter @xiangqi/web build           # web: scripts/build.mjs; server: tsc
pnpm lint
pnpm exec vitest run tests/path/x.test.ts [-t "name"]        # one test, no DB
tests/server/db.sh test tests/server/game/room/room.test.ts  # tests needing Postgres
tests/server/db.sh stop
```

`db.sh` starts isolated local Postgres 17 clusters (ports 55441+, `*_TEST_DATABASE_URL`) picked from the test's imports. DB suites skip silently when their URL is unset. Never point those URLs at Supabase: fixtures reset the schema.

## Architecture

- **Shared rules run on both ends.** `xiangqi-core` (moves, check/ending) and `engine` (negamax/alpha-beta, in a worker) serve the server as authority and the web client for AI and optimistic moves. `shared` holds cross-end contracts (`realtime.ts`) and word filters. Packages export TS source directly (no build step).
- **Server startup is flag-gated.** `apps/server/src/main.ts` chains `createXRuntime` factories (registration → google → media → rooms → friends → history → profile); each mounts only if its `*_ENABLED` flag is `true`, and verifies DB schema/privileges at boot ("... migration is not ready" / "... database unavailable"). Rooms require login and registration. `game/game.runtime.ts` wires the whole game domain (room, match, clock, chat, realtime, workers).
- **Mutations are Postgres transactions with a fixed lock order.** Stores never open their own transaction; they get the caller's `PoolClient` in a `RoomScope`. `RoomTransactions.withRoom` (`game/room/room-transactions.ts`): `BEGIN; SET LOCAL ROLE app_server` (app connects as `postgres`, so RLS/grants apply) → advisory locks on all actors, sorted → session recheck → room locks, sorted → retry on `RoomRosterChanged`. Never lock in ad-hoc order (two-player deadlock). Commands carry a `commandId` and are idempotent via receipts; side effects (Socket.IO, media revoke) go through an `outbox` drained by `*-worker.ts`, never before commit.
- **Realtime.** `game/realtime/gateway.ts` authenticates the handshake, allows one controlling tab per actor+room (`connectionId` fencing) and sends per-recipient snapshots; the HTTP snapshot is display-only. Clock, disconnect-grace and draw timeouts are server workers. AI games (`game/ai/`) use their own gateway.
- **Auth is two-layer:** Supabase bearer token (verified outside the transaction) plus an app-session capability (43-char base64url, hashed in `xiangqi_auth.app_sessions`). Guests are a separate actor kind. `DIRECT_URL` must be the direct/session pooler, not 6543.
- **Database** (`supabase/`): ordered `migrations/` each with a `rollback/` twin, `baseline/` for legacy tables, schemas `xiangqi_{auth,realtime,room,chat,social}` + `public`. Migrations assert existing index/constraint definitions before changing them; add a new migration plus rollback instead of editing an applied one.
- **Web:** `features/*` per domain, `shared/` for board, UI primitives, tokens. Pages are `React.lazy` in `app/AppRouter.tsx`. `RoomPage` serves WAITING and PLAYING under `/rooms/:id` and keeps chat/media mounted across the switch. `/dev/*` routes (dev only) preview components. LiveKit camera/mic failure must never interrupt a match.
