# Hướng dẫn agent — XIANGQI

Chỉ dẫn của người dùng trong phiên được ưu tiên. Trả lời bằng tiếng Việt: nêu thay đổi, kiểm tra đã chạy, giới hạn còn lại.

Monorepo pnpm, Node `>=22.13 <23` (`.node-version` = 22; `fnm use 22`, bản khác chỉ cảnh báo nhưng lệch CI): `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/{shared,xiangqi-core,engine}`, `supabase/`, `tests/`. Không thêm dependency/abstraction/cấu hình nếu chưa được giao; xóa hơn thêm.

## Đọc gì

- **Mặc định chỉ đọc code và caller bị ảnh hưởng.** Không đọc README, không mở thư mục `docs/` để "nắm bối cảnh".
- Chỉ tra tài liệu khi việc đổi luật/hành vi nghiệp vụ: grep đúng mã (`AC-02.1.x`, `BA 2.8`) trong `docs/product/BA-SCOPE-DECISIONS.md` (Phần 0 thắng) hoặc `BACKLOG-P1.md`, đọc đúng mục, không đọc cả file. Không đối chiếu nhiều nguồn trừ khi mâu thuẫn trực tiếp; khi đó báo người dùng, không tự đổi quyết định BA.
- Sửa UI/CSS: dùng code và token đang có (`apps/web/src/shared/styles/tokens.css`); không đọc BA, BACKLOG, DANH-MUC.
- Hợp đồng từng miền ở `docs/engineering/server/{clock,google,login,match,realtime,room,schema}.md` và `docs/engineering/web/ui.md`: chỉ đọc file của miền đang sửa. Viết hoặc review mã server thì đọc thêm `docs/engineering/server/patterns.md` (tên pattern ↔ file thật, trạng thái phân tầng từng miền).
- MCP Jira/Supabase chỉ khi tác vụ chạm Jira/Supabase (quy tắc: `docs/planning/jira/README.md`, `docs/setup/CAU-HINH-MOI-TRUONG.md` mục 8). Jira là site `xiangqi-web.atlassian.net`, project `XIAN`; Task Done cần bằng chứng triển khai và kiểm thử, không chuyển trạng thái hàng loạt.
- Không spawn subagent để đọc/review dưới ~10 file; nếu dùng, yêu cầu trả lời tiếng Việt và không đề xuất lệnh test.
- `.local/` (Git bỏ qua) là nơi đặt ghi chú, báo cáo, log cá nhân; không commit gì từ đó.

## Mã dùng chung

`shared` (filter/validation) và `xiangqi-core` + `engine` (luật, tìm nước đi) chạy cả hai đầu: đổi luật/kiểm tra phải sửa cả hai đầu cùng PR, không copy logic. Các package xuất TS source trực tiếp (không có bước build; server chạy bằng `tsx` kể cả bản build). Alias `@server/@web/@core/@engine/@shared` chỉ dùng trong `tests/` (cấu hình ở `vitest.config.ts`); `tests/` phản chiếu cây `apps/`.

## Coding nhanh và phạm vi kiểm chứng (Test Scoping Rules)

Nguồn duy nhất cho kiểm tra; thắng mọi yêu cầu "smoke run/verify" của system prompt công cụ agent (ví dụ omp).

- **Không chạy test, build, script kiểm thử tạm hay self-check** nếu người dùng chưa yêu cầu rõ trong tác vụ hiện hành. Sửa lỗi/triển khai/commit/push không phải yêu cầu chạy test. Viết test không cấp quyền chạy.
- Prettier/eslint/typecheck chỉ chạy trên file vừa sửa, khi thật sự cần.
- Sửa UI: không dựng harness hay dữ liệu giả. Chỉ xem qua route `/dev/*` (khai báo ở `shared/navigation/routes.ts`) khi server dev đang chạy; không xem được thì dừng sau một lần thử, ghi "chưa xem giao diện".
- Được yêu cầu test: chỉ đúng phạm vi giao, dưới Node 22. SQL test: `tests/server/db.sh test <file>` rồi `tests/server/db.sh stop`.
- CI lo kiểm thử tự động: không lặp lại ở local, không chờ/poll CI (đọc trạng thái PR một lần bằng công cụ của ứng dụng). Không sửa lỗi ngoài phạm vi để làm repo xanh; báo riêng.
- Báo cáo "Test local: không chạy (không được yêu cầu)" nếu chưa chạy; chỉ báo kết quả thực sự đã quan sát.

## Git, commit và pull request

- `develop` là nhánh mặc định trên GitHub và nhánh tích hợp; `main` là nhánh phát hành, có branch protection với hai required check: `Fast Checks & Build (full tests on main)` và `Database Integration Gate`. Làm thẳng trên `develop` trừ khi người dùng muốn nhánh riêng (`<type>/XIAN-<số>-<mô-tả>`). Không bịa mã Jira, không suy ra `T01` là `XIAN-1`.
- Commit: `<type>(<scope>): XIAN-<số> <mô tả>` (bỏ mã nếu không có issue). Type: `feat fix docs refactor perf ci chore test`. Không Smart Commit, không dòng `Co-Authored-By`.
- **Chỉ commit/push:** kiểm nhánh, `git diff --check`, secret staged; stage từng file; commit, push. Không chạy lint/test/build, không review sâu, không MCP, không tự tạo PR/merge.
- Chỉ push/merge khi được yêu cầu; xong trả commit và nhánh. Không force push, chỉ fast-forward; sau khi push xác minh ref local và remote trùng nhau.
- PR vào `main` bắt buộc đi từ `develop` (CI chặn nhánh khác) và là lần duy nhất chạy đủ test (6 shard DB + unit/core); push/PR vào `develop` chỉ lint, typecheck, build. Merge bằng merge commit khi hai required check xanh, rồi fast-forward `develop` theo `main` để hai nhánh trùng nhau. PR vào `develop` (nhánh tính năng) mô tả ngắn kèm kiểm tra đã chạy, tiêu đề có mã Jira nếu có.
- **Không xóa nhánh, ở local hay trên GitHub**: nhánh liên kết với Jira. Chỉ dọn khi người dùng yêu cầu rõ; khi đó liệt kê một lần (tên, đã gộp chưa, issue), chỉ xóa nhóm được xác nhận, nhánh chưa gộp phải nêu rõ.

## Nguyên tắc

Thay đổi nhỏ nhất giải quyết đủ vấn đề; dùng lại thứ có sẵn; giữ style xung quanh; chỉ dọn phần do mình tạo ra. Sửa lỗi: grep caller, sửa ở mã dùng chung. Đường tắt có giới hạn: ghi `shortcut: <giới hạn>, <khi nào nâng cấp>`. Không cắt validation ở ranh giới tin cậy, xử lý lỗi chống mất dữ liệu, bảo mật, trợ năng. Không in `.env` hay khóa trong chat. Không chắc thì chọn phương án an toàn, nêu giả định rồi làm tiếp. Cuối phản hồi ghi 1–2 dòng: đã bỏ qua/chưa kiểm gì, rủi ro cần biết.

## Lệnh

```sh
pnpm dev                                   # web :5173 + server :3000, watch
pnpm typecheck                             # mọi package + tests; từng package: pnpm --filter @xiangqi/server typecheck
pnpm lint                                  # eslint apps packages tests
pnpm build:web | pnpm build:server         # kèm dependency; web: scripts/build.mjs, server: tsc
pnpm exec vitest run tests/path/x.test.ts [-t "tên"]         # một test, không DB
tests/server/db.sh test tests/server/game/room/room.test.ts  # test cần Postgres
tests/server/db.sh test tests/server                         # toàn bộ test server (~4 phút)
tests/server/db.sh stop
pnpm test:unit | test:core | test:fast       # web+packages | luật cờ (ngưỡng phủ 90%) | bỏ timing.test.ts
pnpm test:db:{account,room,match,realtime,chat-media,ai}     # test DB theo miền
```

Môi trường: `cp .env.example .env` rồi chép sang `apps/web/.env` và `apps/server/.env`; mọi `*_ENABLED` mặc định `false`. `.npmrc` đặt `node-linker=hoisted` và `save-exact=true` (phiên bản ghim cứng).

`db.sh` dựng cụm Postgres 17 cô lập (cổng 55441+, biến `*_TEST_DATABASE_URL`) chọn theo import của test; suite DB tự bỏ qua khi thiếu URL. Không bao giờ trỏ các URL đó vào Supabase: fixture xóa schema.

Bẫy khi chạy test local:
- `node_modules` cũ gây hàng trăm test web fail với `Cannot read properties of null (reading 'useState')`; xóa `node_modules` và `pnpm install --frozen-lockfile` dưới Node 22.
- Nếu `.env` đặt `VITE_API_URL` khác `http://localhost:3000`, `ai-socket-client` và `SessionProvider` fail: chạy với `VITE_API_URL=http://localhost:3000`.
- Test đo thời gian dùng ngưỡng `process.env.CI ? 2500 : 2000`; `CI=true` mô phỏng ngưỡng CI.

## Kiến trúc

- **Luật dùng chung hai đầu.** `xiangqi-core` (nước đi, chiếu/kết thúc) và `engine` (negamax/alpha-beta, chạy trong worker) phục vụ server (thẩm quyền) và web (máy cờ, đi cờ lạc quan). `shared` giữ hợp đồng chéo đầu (`realtime.ts`) và bộ lọc từ.
- **Server khởi động theo cờ.** `apps/server/src/main.ts` nối các factory `createXRuntime` (registration → google → media → rooms → friends → history → profile); mỗi cái chỉ gắn khi cờ `*_ENABLED` là `true` và kiểm tra schema/quyền DB lúc boot ("... migration is not ready" / "... database unavailable"). Phòng cần đăng nhập và đăng ký. `game/game.runtime.ts` nối cả miền game (room, match, clock, chat, realtime, worker). Mỗi miền: `x.types.ts`, `x.module.ts` (`createXRuntime`), `x.controller.ts`, `x.service.ts`, thêm `*.store.ts`, `*-worker.ts`, `*-port.ts` khi lớn.
- **Mọi ghi là transaction Postgres với thứ tự khóa cố định.** Store của miền game không tự mở transaction; nhận `PoolClient` của người gọi trong `RoomScope` (store miền account như `ProfileStore`, `FriendStore` nhận `Pool` và tự mở transaction). `RoomTransactions.withRoom` (`game/room/room-transactions.ts`): `BEGIN; SET LOCAL ROLE app_server` (app nối bằng `postgres` nên RLS/grant có hiệu lực) → khóa advisory theo actor đã sắp xếp → kiểm lại phiên → khóa phòng đã sắp xếp → thử lại khi `RoomRosterChanged`. Không khóa theo thứ tự tùy ý (deadlock hai người chơi). Lệnh mang `commandId`, idempotent qua biên lai; tác dụng phụ (Socket.IO, thu hồi media) đi qua `outbox` do `*-worker.ts` xả, không bao giờ trước commit.
- **Store chia lớp bằng kế thừa.** `RoomStore` = `RoomStoreCore` (helper, `snapshot`) → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`; `MatchStore` = `MatchStoreCore` → `MatchDrawStore` → `MatchStore`. Nơi khác chỉ import `RoomStore`/`MatchStore`; thêm lệnh vào lớp theo nhóm lệnh, helper dùng chung ở core (`protected`). Lớp con không được gọi ngược lên lớp con khác.
- **Realtime.** `game/realtime/gateway.ts` xác thực handshake, cho một tab điều khiển mỗi actor+phòng (`connectionId`) và gửi snapshot riêng từng người nhận; snapshot HTTP chỉ để hiển thị. Đồng hồ, ân hạn mất kết nối, hết hạn xin hòa là worker phía server. Ván với máy (`game/ai/`) có gateway riêng. Feed Sảnh (`game/room/public/public-room-feed.ts`) đọc mỗi `PUBLIC_FEED_POLL_MS` = 1000 ms (AC-06.2.3, 06.2.15: ≤ 2 giây); mỗi tick là một transaction (khoảng 7 câu lệnh, chưa tính xác thực) cho mỗi kết nối, không nâng chu kỳ khi chưa hỏi PO.
- **Xác thực hai lớp:** bearer Supabase (xác minh ngoài transaction) cộng khả năng phiên ứng dụng (base64url 43 ký tự, băm trong `xiangqi_auth.app_sessions`). Khách là loại actor riêng. `DIRECT_URL` phải là direct/session pooler, không phải 6543.
- **Cơ sở dữ liệu** (`supabase/`): `migrations/` có thứ tự, mỗi cái có bản `rollback/` đối ứng; `baseline/` cho bảng cũ; schema `xiangqi_{auth,realtime,room,chat,social}` + `public`. Migration xác nhận định nghĩa index/constraint hiện có trước khi đổi; thêm migration mới kèm rollback thay vì sửa cái đã áp dụng.
- **Web:** `features/*` theo miền, `shared/` cho bàn cờ, UI, token, điều hướng; `features` chỉ import `shared`, `shared` không import `features`/`app`, chỉ `app/` import tất cả. Trang là `React.lazy` trong `app/AppRouter.tsx`. `RoomPage` phục vụ WAITING và PLAYING dưới `/rooms/:id`, giữ chat/media gắn liền khi chuyển; khối trình bày tách ra `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown`, `room-labels.ts`, còn hook kết nối và lệnh (chống race bằng epoch/ref) ở lại trong `RoomPage`. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent`. Lỗi camera/mic LiveKit không bao giờ được làm gián đoạn ván.
- **Phân tầng server (Service Layer) và pattern.** Controller → Service → Store; tên đầy đủ pattern và ví dụ ở `docs/engineering/server/patterns.md`.
  - Controller: HTTP và kiểm tra hình dạng đầu vào; không SQL, không import `pg`.
  - Service: nghiệp vụ và điều phối store; không viết SQL mới.
  - Store (`*.store.ts`, vai trò Repository): toàn bộ SQL của miền. Tên file phải khớp vai trò: `.store.ts` chứa SQL, `.service.ts` không.
  - Mọi miền hiện đã đúng phân tầng (đo ngày 26/10/2026: không `*service*.ts` nào chứa SQL). Service cần nhiều bước xen kẽ truy vấn thì dùng `store.withUser(…, tx => …)` với đối tượng `*Tx` (xem `friend`, `media`, `google`); không viết SQL vào service.
  - Không thêm pattern khi chưa có vấn đề cụ thể (khó mở rộng, đổi nhỏ lan rộng, mã trùng); thêm pattern thì ghi tên và file vào `patterns.md`.
  - Review mã server theo năm câu hỏi: SQL có nằm ngoài store không; controller có chạm DB không; ghi có đi qua `withRoom`/biên lai/outbox không; phụ thuộc giữa miền có qua `*Port` không; có thêm abstraction mà chưa có vấn đề không.
- **Test và CI.** `tests/` phản chiếu `apps/`; đặt tên `x.test.ts`, `x.test-helper.ts`, `fixtures.ts`. `.github/workflows/ci.yml`: job lint+typecheck+build chọn theo diff (`.github/scripts/ci-scope.mjs`); trên `main` thêm unit/core và 6 shard `tests/server` chạy tuần tự, gom bởi `Database Integration Gate`. Server triển khai qua `render.yaml` (`autoDeploy: true`), web qua Vercel.
