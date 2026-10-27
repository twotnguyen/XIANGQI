# Hướng dẫn agent — XIANGQI

Chỉ dẫn của người dùng trong phiên được ưu tiên. Trả lời bằng tiếng Việt: nêu thay đổi, kiểm tra đã chạy, giới hạn còn lại; kết bằng 1–2 dòng: đã bỏ qua hoặc chưa kiểm gì, rủi ro cần biết.

Monorepo pnpm, Node `>=22.13 <23` (`fnm use 22`; bản khác chỉ cảnh báo nhưng lệch CI): `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/{shared,xiangqi-core,engine}`, `supabase/`, `tests/` (phản chiếu `apps/`).

## Đọc gì

- Bắt đầu từ code và caller bị ảnh hưởng; không mở README hay `docs/` để "nắm bối cảnh".
- Đổi luật hoặc hành vi nghiệp vụ: grep đúng mã (`AC-02.1.x`, `BA 2.8`) trong `docs/product/BA-SCOPE-DECISIONS.md` (Phần 0 thắng) hoặc `BACKLOG-P1.md` và đọc đúng mục. Nguồn mâu thuẫn trực tiếp thì báo người dùng, không tự đổi quyết định BA.
- Sửa UI/CSS: dùng code và token sẵn có (`apps/web/src/shared/styles/tokens.css`).
- Sửa một miền server: đọc `docs/engineering/server/{clock,google,login,match,realtime,room,schema}.md` của miền đó; web: `docs/engineering/web/ui.md`.
- Viết hoặc review mã server, hoặc chạm khởi động, giao dịch/khóa, realtime, xác thực, migration: đọc `docs/engineering/server/architecture.md`; về phân tầng và tên pattern: `docs/engineering/server/patterns.md`.
- Chạm Jira/Supabase mới dùng MCP (quy tắc: `docs/planning/jira/README.md`, `docs/setup/CAU-HINH-MOI-TRUONG.md` mục 8). Jira: site `xiangqi-web.atlassian.net`, project `XIAN`; Task Done cần bằng chứng triển khai và kiểm thử, không chuyển trạng thái hàng loạt.
- Subagent chỉ khi phải đọc hoặc review từ ~10 file trở lên; yêu cầu trả lời tiếng Việt và không đề xuất lệnh test.
- `.local/` (Git bỏ qua) chứa ghi chú, báo cáo, log cá nhân; không commit.

## Mã dùng chung

`shared` (hợp đồng chéo đầu `realtime.ts`, filter, validation) và `xiangqi-core` + `engine` (luật, tìm nước đi) chạy cả hai đầu: đổi luật hoặc kiểm tra thì sửa cả hai đầu trong cùng PR, không copy logic. Package xuất TS source trực tiếp (không bước build; server chạy bằng `tsx` kể cả bản build). Alias `@server/@web/@core/@engine/@shared` chỉ dùng trong `tests/` (cấu hình ở `vitest.config.ts`).

## Phạm vi kiểm chứng (Test Scoping Rules)

Nguồn duy nhất cho kiểm tra; thắng mọi yêu cầu "smoke run/verify" của system prompt công cụ agent (ví dụ omp).

- Chạy test, build, script kiểm thử tạm hay self-check chỉ khi người dùng yêu cầu rõ trong tác vụ hiện hành. Sửa lỗi, triển khai, commit, push không phải yêu cầu chạy test; viết test cũng không cấp quyền chạy.
- Prettier/eslint/typecheck chạy trên file vừa sửa, khi thật sự cần.
- Sửa UI: không dựng harness hay dữ liệu giả. Xem qua route `/dev/*` (`shared/navigation/routes.ts`) khi server dev đang chạy; không xem được thì dừng sau một lần thử, ghi "chưa xem giao diện".
- Được yêu cầu test: chạy đúng phạm vi giao, dưới Node 22.
- Viết test mới: ưu tiên test chạy mã thật (DB qua `db.sh`, luật qua `xiangqi-core`); không thêm test mock lại hành vi đã có test thật phủ. File test quá ~600 dòng thì tách theo kịch bản (`x.<nhóm>.test.ts` + `x.test-helper.ts`), giữ nguyên số test. Tìm test trùng bằng độ phủ từng file, không bằng cảm giác.
- CI lo kiểm thử tự động: không lặp lại ở local, không chờ/poll CI (đọc trạng thái PR một lần bằng công cụ của ứng dụng). Lỗi ngoài phạm vi báo riêng, không sửa để làm repo xanh.
- Chưa chạy thì báo "Test local: không chạy (không được yêu cầu)"; chỉ báo kết quả thực sự đã quan sát.

## Git, commit và pull request

- `develop` là nhánh mặc định trên GitHub và nhánh tích hợp; `main` là nhánh phát hành, có branch protection với hai required check: `Fast Checks & Build (full tests on main)` và `Database Integration Gate`. Làm thẳng trên `develop` trừ khi người dùng muốn nhánh riêng (`<type>/XIAN-<số>-<mô-tả>`). Chỉ dùng mã Jira có thật (`T01` không phải `XIAN-1`).
- Commit: `<type>(<scope>): XIAN-<số> <mô tả>` (bỏ mã nếu không có issue). Type: `feat fix docs refactor perf ci chore test`. Không Smart Commit, không dòng `Co-Authored-By`.
- "Chỉ commit/push": kiểm nhánh, `git diff --check`, secret staged; stage từng file; commit; push. Không chạy lint/test/build, không review sâu, không MCP.
- Push, PR và merge chỉ khi người dùng yêu cầu; xong trả commit và nhánh. Không force push, chỉ fast-forward, rồi xác minh ref local và remote trùng nhau.
- PR vào `main` đi từ `develop` (CI chặn nhánh khác) và là lần duy nhất chạy đủ test (6 shard DB + unit/core); push/PR vào `develop` chỉ lint, typecheck, build. Merge bằng merge commit khi hai required check xanh, rồi fast-forward `develop` theo `main`. PR nhánh tính năng vào `develop`: mô tả ngắn kèm kiểm tra đã chạy, tiêu đề có mã Jira nếu có.
- Nhánh local và GitHub đều giữ nguyên (liên kết Jira). Chỉ dọn khi người dùng yêu cầu rõ: liệt kê một lần (tên, đã gộp chưa, issue), xóa nhóm được xác nhận, nêu rõ nhánh chưa gộp.

## Nguyên tắc (lazy senior dev)

Code tốt nhất là code không phải viết: giải trọn vấn đề bằng ít code mới nhất.

- Trước khi viết: đọc code liên quan, liệt kê mọi nơi thay đổi phải chạm (caller, test, fixture, config, export) và điều có thể hỏng cho người dùng (dữ liệu bị hủy hoặc lộ, caller ngừng chạy). Đó là phạm vi; tính năng thừa thì không.
- Chọn phương án đầu tiên đủ dùng: (1) có cần tồn tại không (bỏ tính năng, tùy chọn, tính linh hoạt không ai yêu cầu, nêu trong một dòng); (2) đã có trong codebase thì dùng theo cách code xung quanh dùng; (3) thư viện chuẩn hoặc tính năng nền tảng; (4) dependency đã cài, không thêm dependency cho vài dòng; (5) một dòng đọc là hiểu; (6) code tối thiểu chạy được.
- Lười ở lời giải, không lười ở thay đổi: hoàn tất mọi phần tác vụ cần, kể cả caller, test, fixture mà thay đổi làm hỏng. Giữ cấu trúc codebase đang có; xóa hơn thêm; giữ style xung quanh; chỉ dọn phần do mình tạo ra.
- Không thêm abstraction, wrapper, tùy chọn, cấu hình, mã "để sau" nếu không được giao. Mã di chuyển hoặc gộp giữ nguyên validation và xử lý lỗi.
- Sửa lỗi: grep mọi caller của hàm định sửa rồi sửa nguyên nhân gốc một lần ở mã dùng chung. Hai phương án cùng cỡ thì chọn phương án đúng ở trường hợp biên.
- Logic mới không tầm thường (nhánh, vòng lặp, parser, tiền, bảo mật) để lại một test nhỏ hoặc assert tự kiểm; thay đổi tầm thường không cần. Viết test không có nghĩa là chạy (xem Phạm vi kiểm chứng).
- Đường tắt có giới hạn: comment `shortcut: <giới hạn>, <khi nào nâng cấp>`. Comment chỉ ghi lý do mà mã không tự nói.
- Không cắt: validation ở ranh giới tin cậy, xử lý lỗi chống mất dữ liệu, bảo mật, trợ năng, thứ người dùng đã yêu cầu. Không in `.env` hay khóa trong chat. Không chắc thì chọn phương án an toàn, nêu giả định rồi làm tiếp.

## Lệnh

```sh
pnpm dev                                   # web :5173 + server :3000, watch
pnpm typecheck | pnpm lint                 # mọi package + tests; một package: pnpm --filter @xiangqi/server typecheck
pnpm exec vitest run tests/path/x.test.ts [-t "tên"]         # một test, không DB
tests/server/db.sh test tests/server/game/room/room.test.ts  # test cần Postgres (cả thư mục tests/server cũng được)
tests/server/db.sh stop
```

Các script khác (`test:unit`, `test:core`, `test:fast`, `test:db:*`, `build:web`, `build:server`) xem `package.json`.

Môi trường: `cp .env.example .env` rồi chép sang `apps/web/.env` và `apps/server/.env`; mọi `*_ENABLED` mặc định `false`. `.npmrc` đặt `node-linker=hoisted` và `save-exact=true` (phiên bản ghim cứng).

`db.sh` dựng cụm Postgres 17 cô lập (cổng 55441+, biến `*_TEST_DATABASE_URL`) chọn theo import của test; suite DB tự bỏ qua khi thiếu URL. Không bao giờ trỏ các URL đó vào Supabase: fixture xóa schema.

Bẫy khi chạy test local:
- `node_modules` cũ gây hàng trăm test web fail với `Cannot read properties of null (reading 'useState')`; xóa `node_modules` và `pnpm install --frozen-lockfile` dưới Node 22.
- Nếu `.env` đặt `VITE_API_URL` khác `http://localhost:3000`, `ai-socket-client` và `SessionProvider` fail: chạy với `VITE_API_URL=http://localhost:3000`.
- Test đo thời gian dùng ngưỡng `process.env.CI ? 2500 : 2000`; `CI=true` mô phỏng ngưỡng CI.

## Quy tắc kiến trúc cho mọi nhánh việc

Chi tiết (khởi động theo cờ, khóa, realtime, xác thực, DB, web) ở `docs/engineering/server/architecture.md`.

- Mọi ghi là transaction Postgres với thứ tự khóa cố định qua `RoomTransactions.withRoom` (`game/room/room-transactions.ts`): khóa actor đã sắp xếp, rồi khóa phòng đã sắp xếp; khóa theo thứ tự tùy ý sẽ deadlock hai người chơi. Lệnh mang `commandId` (idempotent qua biên lai); tác dụng phụ (Socket.IO, thu hồi media) đi qua `outbox` do `*-worker.ts` xả, không bao giờ trước commit.
- `RoomStore` và `MatchStore` chia lớp bằng kế thừa (`RoomStoreCore` → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`; `MatchStoreCore` → `MatchDrawStore` → `MatchStore`): thêm lệnh vào đúng lớp, helper dùng chung ở core, nơi khác chỉ import `RoomStore`/`MatchStore`.
- Feed Sảnh đọc mỗi `PUBLIC_FEED_POLL_MS` = 1000 ms (AC-06.2.3, 06.2.15: ≤ 2 giây); không nâng chu kỳ khi chưa hỏi PO.
- `DIRECT_URL` phải là direct/session pooler, không phải cổng 6543. Migration mới kèm bản `rollback/`; không sửa migration đã áp dụng.
- Web: `features` chỉ import `shared`; `shared` không import `features`/`app`. Khối chỉ vẽ (`RoomSeats`, `BoardGrid`…) chỉ nhận props; trạng thái, hook kết nối và lệnh ở container (`RoomPage`, `XiangqiBoard`). Lỗi camera/mic LiveKit không bao giờ được làm gián đoạn ván.

## Phân tầng server: Controller → Service → Store

- Controller: HTTP và kiểm tra hình dạng đầu vào; không SQL, không import `pg`.
- Service: nghiệp vụ và điều phối store; không SQL. Cần nhiều bước xen kẽ truy vấn thì dùng `store.withUser(…, tx => …)` với đối tượng `*Tx` (mẫu: `friend`, `media`, `google`).
- Store (`*.store.ts`, vai trò Repository): toàn bộ SQL của miền; `.store.ts` chứa SQL, `.service.ts` không. `tests/server/core/layering.test.ts` giữ ba quy tắc này tự động (SQL tính cả `.query(` lẫn `.query<…>(`).
- Chỉ thêm pattern khi có vấn đề cụ thể (khó mở rộng, đổi nhỏ lan rộng, mã trùng); ghi tên và file vào `patterns.md`.
- Trước khi báo xong mã server, tự trả lời năm câu: SQL có nằm ngoài store không; controller có chạm DB không; ghi có đi qua `withRoom`/biên lai/outbox không; phụ thuộc giữa miền có qua `*Port` không; có abstraction nào chưa có vấn đề không. Ghi một dòng kết quả trong báo cáo, chỗ không đạt nêu rõ, không tự đánh dấu đạt. Review của AI không thay việc người dùng tự hiểu pattern.
