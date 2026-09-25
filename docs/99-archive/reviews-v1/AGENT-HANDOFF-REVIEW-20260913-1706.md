# REVIEW BÀN GIAO — XIANGQI (agent handoff review)

**Ngày review:** 2026-09-13 17:06 (giờ máy)
**Người review:** review agent (read-only, không sửa mã nguồn, không commit/push/merge, không ghi Supabase cloud)
**HEAD được review:** `0f2c49c7ab6dc686c57766b5a60523b85a1e3e44` (main)
**origin/main:** `0f2c49c7ab6dc686c57766b5a60523b85a1e3e44` — ahead/behind = `0 0`
**Working tree:** sạch tại thời điểm bắt đầu và kết thúc review. Có 2 file bị test tự sinh ghi đè trong lúc chạy (`docs/test-reports/ai/benchmark-results.{csv,json}`) và đã được khôi phục về HEAD; xem F-16.

> Toàn bộ kết luận dưới đây được kiểm chứng lại từ mã nguồn tại HEAD, không sao chép kết luận của agent trước. Các finding của lần review trước (nếu có) không tồn tại trong repo này (`docs/reviews/` được tạo mới bởi review này).

---

## A. Phạm vi

### A.1 Trạng thái Git/GitHub

| Mục | Giá trị |
|---|---|
| Branch hiện tại | `main` |
| HEAD | `0f2c49c` — `fix(gameplay): connect AI turn trigger, AI undo command, and room transition [ISSUE-021] (#47)` |
| Remote HEAD | `origin/main` = `0f2c49c` (đã fetch, không pull/rebase/checkout) |
| Ahead/behind | `0 0` |
| Thay đổi chưa commit | không có (sau khi khôi phục artifact do test sinh) |
| PR mở | 0 |
| PR đã merge | #1–#47 (tất cả MERGED) |
| CI workflow | `.github/workflows/ci.yml`: `pnpm install --frozen-lockfile` → `build` → `typecheck` → `lint` → `test:unit` → `playwright install` → `test:e2e` |

Lưu ý quan trọng về lịch sử: `PROGRESS.md` tuyên bố `PROJECT_COMPLETE 32/32` tại PR #44 (`ebdd611`), **sau đó** vẫn có 3 PR fix merge vào main:

- #45 `37a4e38` `fix(auth): support root env loading and profiles id alias [ISSUE-007]`
- #46 `f0e51a1` `fix(matches): support 2-player multiplayer flow and runtime DB constraints [ISSUE-008]`
- #47 `0f2c49c` `fix(gameplay): connect AI turn trigger, AI undo command, and room transition [ISSUE-021]`

Ba PR này là bằng chứng runtime thực tế hỏng sau khi đã tuyên bố hoàn thành (env loading, luồng 2 người, kích hoạt lượt AI). `PROGRESS.md` dòng 46 vẫn ghi ISSUE-032 ở trạng thái "PR #44 … hoàn tất bàn giao" và không ghi nhận #45–#47.

### A.2 Những phần đã review

- Toàn bộ tài liệu điều phối: `AGENTS.md`, `docs/README.md`, `docs/handoff/{START-HERE,PROGRESS,GIT-WORKFLOW,DEFENSE,DEPLOY}.md`, `docs/issues/README.md`, `docs/specs/08-TEST-EXECUTION.md`, `docs/test-reports/*`.
- Mã nguồn: `packages/contracts`, `packages/game-rules`, `packages/ai`, `apps/ai-worker`, `apps/server`, `apps/web`, `supabase/migrations/`, `infra/`, `tests/`.
- Gate đã chạy thật: typecheck, lint, build, unit, integration, E2E, `playwright --list`, smoke runtime bản build, kiểm thử UI bằng browser thật trên dev server.
- Git/GitHub: `git status/fetch/rev-list`, `gh pr list/view` (đọc).

### A.3 Những phần KHÔNG kiểm tra được (NOT_RUN — có lý do)

| Hạng mục | Lý do | Cách xác minh |
|---|---|---|
| Integration DB với Supabase local | Không có stack local: `127.0.0.1:54321` và `:54322` đóng; Docker daemon không chạy (`dial unix ~/.docker/run/docker.sock: no such file`); `.env` trỏ Supabase cloud (`snsnkoicxmubuotcdafi.supabase.co`) nên mọi thao tác ghi bị cấm trong nhiệm vụ review | `supabase start` (cần Docker) rồi `DATABASE_URL=... pnpm test:integration` |
| `tests/media/spike.ts` (LiveKit SFU thật) | Không có SFU local: `127.0.0.1:7880` đóng; ngoài ra file này **không nằm trong include của bất kỳ vitest config nào** (xem F-10) | Dựng `infra/compose.yaml` rồi gọi trực tiếp script |
| WebRTC 2 thiết bị thật, Google OAuth thật, HTTPS/deploy | Gate provider/hardware ngoài phạm vi; không có credentials/thiết bị được cấp trong nhiệm vụ này | Theo `docs/handoff/DEPLOY.md` |
| E2E nhiều tài khoản/session độc lập bằng Orca | App cần Supabase thật để đăng nhập → sẽ ghi dữ liệu cloud. P1-1 và P1-5 dưới đây khiến luồng đăng nhập/undo không thể dùng để nghiệm thu. Đã thay bằng kiểm thử UI trực tiếp trên browser (mục E) | Chạy với Supabase test project riêng |

---

## B. Kết luận

**NOT_READY** để coi là sản phẩm hoàn thành / bảo vệ đồ án với nhãn `PROJECT_COMPLETE`.
**READY_WITH_FIXES** để **tiếp tục phát triển**: nền tảng (monorepo, contracts, rules engine, AI search, build, lint, typecheck, harness test) chạy được thật; nhưng tuyên bố "32/32 DONE, không blocker" trong `PROGRESS.md`, `docs/issues/README.md`, `docs/test-reports/final-coverage.md` **không đúng** so với mã nguồn tại HEAD.

Phân biệt hai mốc:

- **Sẵn sàng tiếp tục phát triển:** có. Code build/biên dịch sạch, 199 unit test + 78 E2E chạy xanh trong môi trường này, kiến trúc module rõ ràng, không có secret trong Git.
- **Hoàn thành sản phẩm:** không. 16 finding mức P1 ảnh hưởng chức năng/ bảo mật/ dữ liệu/ độ tin cậy nghiệm thu (mục D; tổng 30 finding: 16 P1, 8 P2, 6 P3), trong đó 2 lỗi làm hỏng luồng chơi thực tế (đi nước sau undo crash; timeout/grace không bao giờ tự kích hoạt) và 2 hạng mục lớn chưa từng được triển khai (WebSocket realtime; WebRTC client/media UI — không có `livekit-client` trong web).

Bằng chứng mâu thuẫn nằm ngay trong repo: `docs/test-reports/ai/benchmark-results.csv` (tracked) ghi `AlphaBeta Score = -Infinity` và `Scores Match = NO` cho 12/20 thế cờ, trong khi `docs/test-reports/ISSUE-023.md` ghi tất cả `PASS` (và chính báo cáo đó ghi "Score Agreement: 8/20 (40.0%)").

---

## C. Trạng thái thực tế theo issue

Cột "Đề xuất" là trạng thái đúng theo gate của `docs/handoff/START-HERE.md` và `docs/specs/08-TEST-EXECUTION.md`.

| Issue | Tài liệu ghi | Thực tế tìm thấy | Đề xuất |
|---|---|---|---|
| 001 Foundation | DONE | `pnpm build/typecheck/lint` exit 0; server build chạy, `/health` 200; `.nvmrc`, workspace pnpm, CI workflow có | DONE |
| 002 Contracts/position | DONE | 90 ô, 32 quân đúng phe/lượt; `positionKey` bỏ ID, phân biệt phe/loại/lượt; `SquareSchema` strict; fixture chống trùng ô/ID; `TerminalEvent` thiếu (F-29) | LOCAL_DONE (thiếu 1 export contract) |
| 003 Legal moves | DONE | Đủ 7 loại quân, cản chân mã/cản mắt tượng/pháo 0–1–2 ngòi, cấm tự chiếu và mở mặt tướng, `applyMove` thuần | DONE |
| 004 Terminal/repetition | DONE | Terminal đúng (checkmate/stalemate=thua, lặp ≥3 hòa); **không** có test undo nhánh lặp; fixture F-MATE/F-STALEMATE/F-REPEAT của spec 08 không được implement (F-17) | LOCAL_DONE (PARTIAL) |
| 005 Board UI | DONE | Bàn SVG gỗ, 32 quân Hán, lật bàn, aria tiếng Việt — xác minh bằng browser thật (mục E). Thiếu phím mũi tên/Enter, 90 giao điểm không có `tabindex` (F-21) | LOCAL_DONE (PARTIAL) |
| 006 DB harness | DONE | Harness TS theo spec (`createTestApp`, `seedUsers`, `authAs`, `resetTestData`, `runId`) **không tồn tại**; `tests/integration/database.test.ts` luôn bị skip (F-11); test "DB" thay bằng mock (F-12) | NOT_READY (chưa đủ gate) |
| 007 Password auth | DONE | BFF login/register/reset chạy; thu hồi phiên **không hoạt động** (F-05) | LOCAL_DONE (PARTIAL) |
| 008 Google/profile | DONE | Có PKCE + onboarding; PR #46 vá luồng runtime sau khi đã tuyên bố DONE | LOCAL_DONE (chưa smoke provider) |
| 009 Friends/presence | DONE | CRUD bạn bè có; `PresenceTracker` in-memory nhưng không có endpoint/heartbeat nào gọi tới (F-06) | LOCAL_DONE (PARTIAL) |
| 010 Rooms/lobby | DONE | Tạo phòng/ghế/ready có; không có `prepareStart`; ready race trả lỗi DB thay vì 409 (F-19) | LOCAL_DONE (PARTIAL) |
| 011 Invitations | DONE | Code/token/direct invite có; **join theo roomId bỏ qua visibility** (F-03) | NOT_READY (lỗ hổng quyền) |
| 012 Authoritative match | DONE | Có transaction + command receipts; lặp đếm sai sau undo (F-02); `activeMoveIds` luôn `[]` (F-02b) | LOCAL_DONE (PARTIAL) |
| 013 Clocks/reconnect | DONE | Toán đồng hồ thuần đúng; **không có scheduler**, không grace 60s, không both-offline (F-04). Báo cáo PASS chỉ dựa trên 5 unit test toán học | NOT_READY |
| 014 Draw/undo/resign | DONE | Draw/resign có; **đi nước sau undo lỗi UNIQUE → 500** (F-01); không có timer hết hạn proposal 30s (F-20) | NOT_READY |
| 015 Online UI | DONE | Bàn/đồng hồ/controls có; đồng bộ bằng polling 1.5s, không có socket (F-06) | LOCAL_DONE (PARTIAL) |
| 016 Spectators | DONE | Trần 5 khán giả có (invitations/service.ts:370-376); `revokeSpectators`/`admitSpectator` là code chết, không phát `access:revoked` (F-07) | NOT_READY |
| 017 Private chat | DONE | Tách kênh theo `room_members`, render text thuần; không có event realtime, không cursor, không cleanup 30 ngày | LOCAL_DONE (PARTIAL) |
| 018 AI evaluation | DONE | Đối xứng + MVV-LVA + bất biến bàn cờ đúng; positional chỉ có bonus tốt/vượt sông/trung lộ, không có piece-square table cho các quân khác dù spec 08 hàng T018 nhắc tới (drift tài liệu — F-16) | LOCAL_DONE (PARTIAL) |
| 019 AI minimax | DONE | Negamax đúng luật, lặp theo search path, trả `null` an toàn | DONE |
| 020 AI alpha-beta | DONE | Alpha-beta + iterative deepening + 3 cấp độ đúng trên thế cờ hợp lệ | DONE |
| 021 AI worker/server | DONE | **Worker thread bị tắt mặc định, chạy đồng bộ trong event loop; `onWorkerMessage` nuốt RESULT (deadlock nếu bật)** (F-08) | NOT_READY |
| 022 AI UI | DONE | Màn cấu hình + banner AI có; E2E chỉ kiểm tra render form | LOCAL_DONE (PARTIAL) |
| 023 AI experiments | DONE | Corpus sai tên quân → 12/20 điểm không hữu hạn; test benchmark **không có assertion**; PROGRESS vẫn ghi cắt tỉa 84.51% (F-13) | NOT_READY (dữ liệu nghiệm thu sai) |
| 024 Media spike | DONE | `tests/media/spike.ts` chỉ tạo JWT + gọi REST createRoom/deleteRoom, không WebRTC; file không thuộc runner nào (F-10); unit test media chỉ assert object token tự tạo (F-14) | NOT_READY |
| 025 Media authority | DONE | Policy lưu in-memory Map (mất khi restart), 2 phòng thay vì 4, lỗi `deleteRoom` bị bỏ qua và vẫn tăng generation | NOT_READY |
| 026 Media UI | DONE | Không có `livekit-client`; chỉ preview camera local `muted`; không có thẻ video/audio cho đối thủ/khán giả (F-09) | NOT_READY |
| 027 History/rematch | DONE | Replay/rematch có UI; đọc `public.moves` không lọc nhánh sau undo; rematch không reset `finished_at`; không có scheduler đóng phòng 10 phút (F-20) | LOCAL_DONE (PARTIAL) |
| 028 Responsive | DONE | 360/390/1366 không tràn ngang (xác minh 390px bằng browser); thiếu viewport 390 trong test | DONE |
| 029 Security | DONE | Body limit 64KB + helmet có; **CORS `origin: true`, CSP tắt, thu hồi token không hoạt động** (F-05) | NOT_READY |
| 030 Acceptance/load | DONE | "Thử tải" = 70 lần `app.inject('/health')` tuần tự trong 1 process; full-demo E2E = 1 test điều hướng, không có 8 context (F-15) | NOT_READY (bằng chứng sai bản chất) |
| 031 Deploy runbook | DONE | Dockerfile/render.yaml/vercel.json/DEPLOY.md có; chưa có smoke HTTPS/provider thật | LOCAL_DONE (PARTIAL) |
| 032 Final handoff | DONE | README/DEFENSE/DEMO/MAINTENANCE đầy đủ; nhưng nội dung xác nhận `PROJECT_COMPLETE` không khớp thực tế (F-16) | NOT_READY (phải sửa tuyên bố) |

---

## D. Findings

Mức độ: P1 = hỏng chức năng/bảo mật/dữ liệu hoặc nghiệm thu không thể tin; P2 = sai contract/spec, rủi ro cao; P3 = vệ sinh kỹ thuật.
`CONFIRMED` = có bằng chứng đọc code hoặc chạy lệnh; `NEEDS_VERIFICATION` = đúng logic nhưng chưa chạy được do thiếu môi trường (DB/SFU).

Tổng: **30 finding — 16 P1 (F-01..F-15, F-02b; trong đó F-02b và F-12 xếp P1/P2), 8 P2 (F-16..F-22, F-29), 6 P3 (F-23..F-28)**.

Đối chiếu với đầu mối từ vòng khảo sát song song: **bác bỏ một kết luận** — "ready race tạo được hai match ACTIVE" là sai vì đã có partial unique index `matches_active_room_idx` (`20260912000003_...sql:96-98`); hậu quả thật là lỗi 500 thay vì 409 (F-19, hạ xuống P2). Các finding P1 khác đã được xác minh lại độc lập tại HEAD (đọc code trực tiếp, chạy repro cho F-13, chạy gate cho F-10/F-11/F-15). F-01, F-04, F-19 là CONFIRMED bằng phân tích đường đi nhưng **chưa chạy được repro runtime trên PostgreSQL** (không có Supabase local) → phần hành vi DB cụ thể của chúng là NEEDS_VERIFICATION.

### P1

#### F-01 — Đi nước cờ mới sau khi chấp nhận UNDO luôn thất bại (UNIQUE violation)
- **Mức độ:** P1 — CONFIRMED (phân tích đường đi; repro runtime cần DB: NEEDS_VERIFICATION)
- **File/dòng:** `apps/server/src/modules/matches/proposals.ts:310-341` (nhánh accept UNDO), `apps/server/src/modules/matches/service.ts:255-281`, `supabase/migrations/20260912000010_matches_runtime_fixes.sql:35`
- **Spec/acceptance:** `docs/issues/ISSUE-014-draw-undo-resign.md` (undo online), `docs/specs/03-STATE-MACHINES.md`, `docs/specs/09-DATABASE-DESIGN.md` §6.3 (`match_moves` + `parent_move_id`, "Undo không mất lịch sử")
- **Kích hoạt:** 2 người chơi đi 2 nước (ply=2) → xin UNDO và được chấp nhận (`targetPly=0`, `matches.ply=0`) → bên đi nước mới.
- **Expected:** nước mới được ghi, `ply=1`, HTTP 200.
- **Actual:** `proposals.ts` chỉ `UPDATE matches` + `INSERT UNDO_APPLIED`, **không xoá/đánh dấu** các hàng `public.moves` cũ. `service.ts:255` tính `newPly = match.ply + 1 = 1` rồi INSERT vào `public.moves` với `move_number=1` → vi phạm `CONSTRAINT moves_match_move_number_unique UNIQUE (match_id, move_number)` (SQLSTATE 23505) → transaction rollback → HTTP 500 `INTERNAL_ERROR`.
- **Bằng chứng:** grep xác nhận chỉ `apps/server/src/modules/ai/service.ts:265` có `DELETE FROM public.moves WHERE match_id = $1 AND move_number > $2` (đường undo của ván AI), nhánh undo ONLINE không có lệnh tương ứng. Ràng buộc UNIQUE nằm ở `20260912000010_...sql:35`.
- **Ảnh hưởng:** tính năng xin đi lại của ván online không dùng được; ván kẹt sau undo. Lỗi chỉ xuất hiện ở ván ONLINE (ván AI có nhánh xoá riêng).
- **Sửa tối thiểu:** trong nhánh accept UNDO thêm `DELETE FROM public.moves WHERE match_id = $1 AND move_number > $2` (cùng transaction, sau khi tính `targetPly`), hoặc chuyển sang bảng `match_moves` có `parent_move_id` theo spec 09.
- **Test hồi quy:** integration — 2 nước → undo được chấp nhận → đi nước mới → 200, `ply=1`, không có lỗi 23505.

#### F-02 — Đếm lặp 3 lần tính cả nhánh đã bị undo (hòa sai)
- **Mức độ:** P1 — CONFIRMED
- **File/dòng:** `apps/server/src/modules/matches/service.ts:239-254`
- **Spec:** `docs/specs/08-TEST-EXECUTION.md:66` (F-REPEAT: "Sau undo phải rebuild từ effective ancestry rồi so count, không giữ count nhánh bỏ"), `docs/specs/03-STATE-MACHINES.md`
- **Kích hoạt:** ván có nước lặp vị trí, sau đó undo và đi nhánh khác.
- **Expected:** chỉ đếm các vị trí trên nhánh hiệu lực.
- **Actual:** code quét **tất cả** `match_events` của ván và tăng `occurrences` khi `payload.key === nextKey`; các sự kiện MOVE của nhánh bị undo vẫn còn (không có lệnh xoá nào cho `match_events`) → đếm dư → `getTerminalOutcome` có thể kết ván bằng `REPETITION` sai.
- **Bằng chứng:** `service.ts:244-252`; không có tham chiếu `activeMoveIds`/ancestry trong hàm này. `tests/unit/terminal.test.ts` chỉ kiểm tra 2 nước tiến, không có undo (tên test "play and undo returns to same key" nhưng không chứa logic undo).
- **Ảnh hưởng:** ván online có thể bị xử hòa sai sau khi đi lại; ngược lại, nếu bên kia lặp trên nhánh hiệu lực thì count cũng không đáng tin.
- **Sửa tối thiểu:** tính lại counts bằng `rebuildActiveBranch` (đã có ở `undo.ts`) trên `activeMoveIds` hiệu lực thay vì quét toàn bộ event.
- **Test hồi quy:** unit — chuỗi 8 ply theo F-REPEAT, undo 2 ply, đi nhánh mới, assert không hòa; integration — `matches.repetition_counts` khớp nhánh hiệu lực sau undo/restart.

#### F-02b — `activeMoveIds` trong snapshot luôn rỗng
- **Mức độ:** P1/P2 — CONFIRMED
- **File/dòng:** `apps/server/src/modules/matches/service.ts:566`, `apps/server/src/modules/matches/proposals.ts:396`, `apps/server/src/modules/ai/service.ts:112,292`, `apps/server/src/modules/rooms/rematch.ts:158`
- **Spec:** `packages/contracts/src/game.ts:199` (`activeMoveIds: string[]`), `docs/specs/09-DATABASE-DESIGN.md:470,486`
- **Actual:** mọi nơi dựng snapshot đều hardcode `activeMoveIds: []`; giá trị đã rebuild chỉ nằm trong payload event `UNDO_APPLIED`. `matches.active_move_ids` còn bị DROP constraint (`20260912000010_...sql:20`).
- **Ảnh hưởng:** client/resync/replay không thể tái dựng nhánh hiệu lực từ snapshot; đây là gốc rễ chung với F-02 và F-16 (replay sau undo).
- **Sửa tối thiểu:** đọc `matches.active_move_ids` và trả trong snapshot; test integration assert giá trị sau undo/rematch.

#### F-03 — Join theo `roomId` bỏ qua visibility → vào được phòng CODE_ONLY/LOCKED
- **Mức độ:** P1 (bảo mật) — CONFIRMED
- **File/dòng:** `apps/server/src/modules/invitations/service.ts:262-269`
- **Spec:** `docs/issues/ISSUE-011-invitations.md`, `docs/specs/08-TEST-EXECUTION.md` hàng ISSUE-010 ("PUBLIC được liệt kê, CODE_ONLY/LOCKED không lộ"), `docs/specs/09-DATABASE-DESIGN.md` (RLS/quyền)
- **Kích hoạt:** người dùng bất kỳ biết `roomId` gọi `POST /api/v1/rooms/join` với `{roomId, role}`.
- **Expected:** từ chối (403 `INVITE_INVALID`) trừ khi phòng `PUBLIC`.
- **Actual:** câu truy vấn `SELECT id, visibility, status FROM public.rooms WHERE id = $1` **lấy `visibility` nhưng không dùng**; code gán thẳng `targetRoomId = locator.roomId; grantRole = requestedRole;`. Chú thích ngay trên dòng 260 ("only SPECTATOR or public rooms") không được thực thi.
- **Ảnh hưởng:** bất kỳ ai biết/enumerate UUID phòng đều vào được phòng riêng tư với vai trò PLAYER; khán giả đã bị thu hồi có thể vào lại ngay. Kết hợp F-07 (không phát `access:revoked`) thì việc "khoá phòng" gần như vô hiệu.
- **Sửa tối thiểu:** nếu `visibility !== 'PUBLIC'` và request dùng `roomId` → 403; chỉ cho vào qua code/token/direct invite.
- **Test hồi quy:** integration — phòng LOCKED, user B join bằng roomId không có mã → 403; phòng PUBLIC → 200.

#### F-04 — Không có scheduler cho timeout, ân hạn 60s và both-offline
- **Mức độ:** P1 — CONFIRMED (dead code + không có timer)
- **File/dòng:** `apps/server/src/modules/matches/deadlines.ts:16` (`settleMatchDeadlines`), `deadlines.ts:14` (`DISCONNECT_GRACE_MS`), `apps/server/src/main.ts:20-30`
- **Spec:** `docs/issues/ISSUE-013-clocks-reconnect.md`; `docs/specs/08-TEST-EXECUTION.md` hàng ISSUE-013
- **Expected:** hết giờ tự kết ván tại deadline; mất mạng có ân hạn 60s; cả hai offline → `INTERRUPTED`; restart → recovery.
- **Actual:** `grep -rn "settleMatchDeadlines" apps/server/src tests` chỉ trả về **định nghĩa**, không có caller. `setTimeout/setInterval` không tồn tại ở `apps/server/src` và `apps/ai-worker/src`. `main.ts` chỉ gọi `recoverActiveMatchesOnBoot()` (đường restart). Ván hết giờ chỉ được chốt "lười" khi có lệnh move tới (`service.ts:207-224`), nghĩa là nếu bên đang tới lượt hết giờ và không ai gửi lệnh thì ván treo `ACTIVE` vô hạn; grace 60s/both-offline không bao giờ chạy.
- **Bằng chứng:** `docs/test-reports/ISSUE-013.md` ghi 5/5 "PASS" nhưng lệnh duy nhất được chạy là `tests/unit/clocks.test.ts` (5 test thuần toán học `settleClock`/`projectClock`, không chạm scheduler/DB).
- **Sửa tối thiểu:** thêm scheduler (interval/đặt hẹn theo deadline gần nhất) gọi `settleMatchDeadlines`, hook presence để tính grace.
- **Test hồi quy:** integration với clock injectable — quá deadline không cần move → `FINISHED`/`TIMEOUT`; ngắt cả hai → `INTERRUPTED/BOTH_OFFLINE`.

#### F-05 — Thu hồi phiên không hoạt động; CORS mở toàn bộ
- **Mức độ:** P1 (bảo mật) — CONFIRMED
- **File/dòng:** `apps/server/src/auth/authenticate.ts:50-60`, `apps/server/src/auth/session.ts:21,33-45`, `apps/server/src/auth/routes.ts:152`, `apps/server/src/app.ts:22,28`
- **Spec:** `docs/specs/05-AUTH.md`; `docs/specs/08-TEST-EXECUTION.md` hàng ISSUE-007 ("session revoked không dùng lại HTTP/socket") và ISSUE-029 ("logout all/expired JWT/old controller bị chặn")
- **Actual:**
  1. `requireAuth` chỉ gán `request.user = { id, email }` — **không bao giờ gán `sessionId`**, nên `if (request.user?.sessionId)` ở logout luôn false → `recordRevokedSession` không được gọi.
  2. `isSessionActive()` (`session.ts:10-27`) **không có caller nào**; middleware không kiểm tra `private.revoked_sessions`.
  3. Nếu có gọi, `recordRevokedSession` INSERT thiếu cột `expires_at` — cột này `NOT NULL` (`20260912000001_roles_private_profiles.sql:124`) → lỗi.
  4. `cors({ origin: true })` phản hồi mọi Origin (không theo `APP_ORIGIN`); helmet đặt `contentSecurityPolicy: false`.
- **Ảnh hưởng:** JWT sau khi logout vẫn gọi được mọi API có auth đến khi token tự hết hạn; bất kỳ site nào cũng gọi được API cross-origin. Đây là lỗi làm sai trực tiếp acceptance của ISSUE-029/007.
- **Sửa tối thiểu:** gán `sessionId` từ claim JWT; gọi `isSessionActive` trong `requireAuth` (401 nếu revoked); bổ sung `expires_at` khi ghi revoked session; đổi CORS sang allowlist `APP_ORIGIN`.
- **Test hồi quy:** integration — token → logout → gọi lại `/api/v1/me` phải 401; CORS: Origin lạ bị từ chối.

#### F-06 — Không có WebSocket/SSE server; client dùng polling
- **Mức độ:** P1 — CONFIRMED
- **File/dòng:** `apps/server/src/app.ts:14-47` (không đăng ký plugin WS nào), `apps/server/package.json` (không có `@fastify/websocket`/`socket.io`), `apps/web/src/features/match/useMatch.ts`
- **Spec:** `docs/specs/02-ARCHITECTURE.md`, `docs/specs/04-CONTRACTS.md` (sự kiện realtime), `docs/issues/ISSUE-012/013/015/017` ("realtime events", "ack retry", chat live)
- **Actual:** toàn bộ `MatchBroadcaster` chỉ là pub/sub in-process; không có kênh nào ra ngoài HTTP. Web dùng `setInterval` ~1.5s gọi `GET /api/v1/matches/:id`. `PresenceTracker` (lease 30s/heartbeat 10s) không có endpoint nhận heartbeat → không có "presence" thật.
- **Ảnh hưởng:** mọi acceptance nói về socket (resync dưới 5s, revoked member không nhận event mới, ack-retry, takeover vô hiệu controller cũ) không thể đạt; chat/replay mang tính poll.
- **Sửa tối thiểu:** thêm `@fastify/websocket` + kênh subscribe theo `matchId`, phát sự kiện từ `matchBroadcaster` sau commit; client thay polling.
- **Test hồi quy:** integration 2 kết nối WS — A đi nước, B nhận snapshot mới trong <1s; thu hồi quyền thì kết nối cũ không nhận event.

#### F-07 — Thu hồi quyền khán giả là code chết; không phát `access:revoked`
- **Mức độ:** P1 — CONFIRMED
- **File/dòng:** `apps/server/src/modules/rooms/spectators.ts:39 (admitSpectator), :96 (revokeSpectators)`
- **Spec:** `docs/issues/ISSUE-016-spectators.md`, `docs/specs/08-TEST-EXECUTION.md` hàng ISSUE-016 ("đổi LOCKED thu hồi quyền board/read/chat")
- **Actual:** `grep` cho `admitSpectator|revokeSpectators|access:revoked` chỉ trả về chính file định nghĩa — không có caller ở server/web, không nơi nào phát `access:revoked`. Trần 5 khán giả được thực thi ở `invitations/service.ts:370-376` (đúng), nhưng nhánh đổi visibility sang LOCKED không thu hồi ai.
- **Ảnh hưởng:** khán giả đã bị chặn vẫn giữ quyền đọc board/chat; acceptance ISSUE-016 không đạt.
- **Sửa tối thiểu:** gọi `revokeSpectators` trong `patchRoom` khi chuyển sang LOCKED và phát `access:revoked` sau commit (kèm kiểm tra quyền khi đọc history/chat).
- **Test hồi quy:** integration — đổi LOCKED → thành viên cũ nhận `access:revoked`, request đọc board/history trả 403.

#### F-08 — AI: worker pool bị tắt mặc định và đường worker bị hỏng
- **Mức độ:** P1 — CONFIRMED
- **File/dòng:** `apps/ai-worker/src/supervisor.ts:195` (`new AiSupervisor(false)`), `:110-118` (nhánh in-process), `:161-172` (`onWorkerMessage`)
- **Spec:** `docs/issues/ISSUE-021-ai-worker-server.md` ("AI tính ngoài event loop", "Child supervisor owns 2 worker threads", "worker crash/timeout xử lý đúng outcome", T021-01/T021-03)
- **Actual:**
  1. Singleton export dùng `false` → nhánh `if (!this.useWorkerThreads || this.workers.length === 0)` chạy `searchBestMove(...)` **đồng bộ trong event loop của server**. Với HARD/iterative deepening, mọi request HTTP bị chặn trong lúc suy nghĩ.
  2. Nhánh worker: `onWorkerMessage` nhận `msg.type === 'RESULT'` nhưng thân chỉ có comment `// Deliver result`, **không gọi `resolve()`** của Promise trong `activeJobs` → nếu bật worker threads, mọi job treo vĩnh viễn.
  3. Lỗi search bị nuốt bằng `console.info`/`console.error`, không chuyển ván sang `INTERRUPTED/AI_UNAVAILABLE` như acceptance.
- **Bằng chứng:** 4 unit test `tests/unit/ai-worker.test.ts` (theo báo cáo ISSUE-021) đều khởi tạo `new AiSupervisor(false)` → chỉ kiểm tra nhánh in-process, không chạm đường worker.
- **Sửa tối thiểu:** bật worker threads cho môi trường thật, hoàn thiện `onWorkerMessage` (resolve/reject theo `jobId`, kiểm tra `expectedVersion`), và xử lý crash/timeout thành outcome `INTERRUPTED`.
- **Test hồi quy:** integration spawn child thật (theo spec 08 ISSUE-021 harness): child trả nước hợp lệ; crash → `INTERRUPTED`; API vẫn 200 trong lúc AI suy nghĩ.

#### F-09 — Media: client WebRTC chưa tồn tại; backend media lệch spec
- **Mức độ:** P1 — CONFIRMED
- **File/dòng:** `apps/web/package.json` (không có `livekit-client`), `apps/web/src/features/media/useMedia.ts`, `apps/web/src/features/media/MediaPanel.tsx:50-130`, `apps/server/src/modules/media/service.ts:11-20` (Map in-memory), `apps/server/src/modules/media/transport.ts:35-115` (2 phòng), `apps/server/src/modules/media/reconciler.ts:30-45`
- **Spec:** `docs/specs/06-MEDIA.md` (4 phòng `PRIVATE_CAMERA/PRIVATE_MICROPHONE/WATCH_CAMERA/WATCH_MICROPHONE`, trạng thái `APPLYING/APPLIED`, bảng `media_transports`), `docs/issues/ISSUE-026-media-ui.md` (T026: "người xem chỉ nhận source được chia sẻ")
- **Actual:** web chỉ `getUserMedia` và gắn stream vào `<video muted>` của chính mình; **không có đường nhận track từ xa** (không có thẻ video/audio cho đối thủ/khán giả, không có `room.connect`), nên chức năng "xem media" không tồn tại trên UI. Server lưu policy trong `Map` (mất khi restart), chỉ sinh 2 phòng, và `deleteRoom` lỗi chỉ log rồi vẫn tăng generation → báo thành công giả.
- **Ảnh hưởng:** tuyến media (R11) không dùng được end-to-end; đây là lý do không thể tổ chức E2E 2 người xem/nghe theo yêu cầu.
- **Sửa tối thiểu:** cài `livekit-client`, connect theo transport token, render remote tracks theo quyền; đưa policy vào DB và chỉ tăng generation khi `deleteRoom` ACK.
- **Test hồi quy:** E2E 2 context — A bật camera, B (được chia sẻ) thấy `trackSubscribed`; viewer không được chia sẻ → không có track.

#### F-10 — Harness media spike không chạy được bằng bất kỳ lệnh nào
- **Mức độ:** P1 (độ tin cậy nghiệm thu) — CONFIRMED
- **File/dòng:** `vitest.config.ts`, `vitest.integration.config.ts`, `tests/media/spike.ts`
- **Spec:** `docs/specs/08-TEST-EXECUTION.md:9` — "integration config nhận cả `tests/integration/**/*.test.ts` **và `tests/media/spike.ts`**"
- **Actual:** `vitest.config.ts` include `tests/unit|ai|load|integration/**`; `vitest.integration.config.ts` include duy nhất `tests/integration/**`. `tests/media/spike.ts` không khớp pattern nào → không có script nào chạy nó (chỉ tự gọi khi được import trực tiếp). Bằng chứng "5/5 LiveKit SFU PASS" trong `PROGRESS.md`/`docs/test-reports/ISSUE-024.md` không tái lập được bằng lệnh trong repo.
- **Sửa tối thiểu:** thêm `tests/media/**/*.ts` vào integration config (hoặc script riêng) và ghi lệnh vào evidence.
- **Test hồi quy:** chạy lane đó khi có SFU; thiếu SFU phải fail rõ, không skip im lặng.

#### F-11 — Integration DB test luôn bị skip, kể cả trong lane integration
- **Mức độ:** P1 (độ tin cậy nghiệm thu) — CONFIRMED (quan sát trực tiếp)
- **File/dòng:** `tests/integration/database.test.ts:12` (`describe.skipIf(!DB_URL)` đọc `process.env['DATABASE_URL']`), `vitest.integration.config.ts`
- **Actual:** chạy `pnpm test:integration` tại máy này: `↓ tests/integration/database.test.ts (2 tests | 2 skipped)`, `✓ tests/integration/faults.test.ts (2 tests)`. Vitest không nạp `.env` vào `process.env`, nên `DATABASE_URL` undefined → test tự skip. Không có cấu hình `setupFiles`/`loadEnvFile`. Hệ quả: "test integration DB" trong CI (`pnpm test:unit` cũng include `tests/integration/**` → 2 skip) và trong lane integration đều xanh mà **không chạy một assertion DB nào**.
- **Ảnh hưởng:** acceptance ISSUE-006 (migration từ DB sạch, FK/unique, RLS anon/authenticated, rollback, tranh username) chưa từng được kiểm chứng bằng vitest; evidence hiện có không chứng minh được.
- **Sửa tối thiểu:** nạp `.env` (dotenv/`process.loadEnvFile`) trong setup của lane integration, và fail (không skip) khi thiếu `DATABASE_URL` ở lane được chỉ định; thêm lane `test:integration` vào CI khi có DB service.
- **Test hồi quy:** CI job DB chạy đủ case ISSUE-006 với role `app_server` + `anon`/`authenticated`.

#### F-12 — Test "DB" thay bằng mock tự đối chiếu chính nó
- **Mức độ:** P1/P2 (giá trị test) — CONFIRMED
- **File/dòng:** `tests/unit/database.test.ts` (dùng `MockPgPool` ở `tests/fixtures/integration.ts`), `tests/fixtures/integration.ts` (43 dòng, chỉ có MockPgClient/MockPgPool)
- **Spec:** `docs/specs/08-TEST-EXECUTION.md:11` (ISSUE-006 phải cung cấp `createTestApp`, `seedUsers`, `authAs`, `resetTestData`, `runId` + RLS thật)
- **Actual:** test assert `mockPool.client.queries).toEqual(['BEGIN','SELECT 1','COMMIT'])` — tức khẳng định lại chính hành vi của mock, không chứng minh transaction thật rollback/commit. Harness theo spec không tồn tại trong repo; `tests/integration/database_test.py` (Python, có trong Git) là nơi thực hiện kiểm tra DB, không thuộc lane test chuẩn và không được gọi bởi script nào.
- **Ảnh hưởng:** "withTransaction rollback" và RLS được coi là đã kiểm chứng trong khi không có test nào chứng minh trên PostgreSQL thật.
- **Sửa tối thiểu:** thay assert mock bằng integration test chạy trên Supabase local; giữ mock chỉ cho unit thuần.
- **Test hồi quy:** DB-01..DB-n theo spec 09 §Verification (FK/unique/RLS/rollback).

#### F-13 — Corpus AI sai tên quân → 12/20 thế cờ cho điểm không hữu hạn; benchmark không có assertion
- **Mức độ:** P1 (dữ liệu nghiệm thu sai) — CONFIRMED (đã chạy repro)
- **File/dòng:** `tests/fixtures/ai-corpus.json` (dùng `CHARIOT`/`SOLDIER`, 29 lần), `packages/contracts/src/game.ts:8-10` (enum chỉ có `GENERAL, ADVISOR, ELEPHANT, HORSE, ROOK, CANNON, PAWN`), `tests/ai/benchmark.test.ts:5`, `tests/ai/benchmark.ts`
- **Bằng chứng (repro tạm, `/tmp/xiangqi-review/repro-ai-corpus.mjs`, đã dọn):** chạy `searchBestMove` trên 20 thế cờ của corpus:
  ```
  { "total": 20, "nonFiniteScores": 12, "zeroLegal": 0, "illegalChosen": 0 }
  bad ids: corpus-01-initial, corpus-02-mate-in-1, corpus-05-pawn-endgame, corpus-06-chariot-advisor-mate,
           corpus-09-cannon-chariot-battery, corpus-10-pinned-horse, corpus-11-advisor-shield,
           corpus-14-advance-pawn-crossed, corpus-15-chariot-rook-fork, corpus-17-open-file-control,
           corpus-19-pawn-advancement-clash, corpus-20-complex-middlegame
  initial-position (correct types) score = -50 nodes = 174
  ```
  Quân `CHARIOT`/`SOLDIER` không thuộc enum nên không sinh được nước đi và làm hàm lượng giá trả NaN/−Infinity.
- **Bằng chứng thứ hai, ngay trong Git:** `docs/test-reports/ai/benchmark-results.csv` ghi `Scores Match = NO` cho 12/20 dòng, `AlphaBeta Score = -Infinity`; `docs/test-reports/ISSUE-023.md` vừa ghi "Score Agreement: 8/20 (40.0%)" vừa đánh dấu tất cả acceptance `PASS`; `PROGRESS.md:37,56` và `DEFENSE.md:22,50` vẫn công bố "cắt tỉa 84.51%".
- **Bằng chứng thứ ba:** `tests/ai/benchmark.test.ts` chỉ gọi `runBenchmark` + `exportReports` — **không có `expect` nào**, nên `pnpm test:ai` không thể fail dù dữ liệu sai. `tests/unit/ai-corpus.test.ts` chỉ kiểm tra "đúng 20 phần tử" và "có ≥2 quân", không kiểm tra tên quân hợp lệ.
- **Ảnh hưởng:** số liệu bảo vệ đồ án (84.51% pruning, so sánh minimax/alpha-beta) không có giá trị khoa học; so sánh điểm giữa hai thuật toán sai ở 60% thế cờ.
- **Sửa tối thiểu:** sửa tên quân trong corpus sang `ROOK`/`PAWN`; thêm assertion: mọi vị trí corpus hợp lệ theo `PieceTypeSchema`, `Number.isFinite(score)` cho cả hai thuật toán, `scoresMatch` true; tính lại và công bố lại số liệu.
- **Test hồi quy:** `pnpm test:ai` phải fail khi corpus chứa loại quân không hợp lệ hoặc điểm không hữu hạn.

#### F-14 — Test media "T024" chỉ assert object token do chính test tạo
- **Mức độ:** P1 (false positive) — CONFIRMED
- **File/dòng:** `tests/unit/media-spike.test.ts:9-70`
- **Actual:** các case T024-01/02/04/05 tạo `new AccessToken(...)`, gán grants rồi assert lại `token.grants.video?.canPublish === false` — khẳng định lại cấu trúc object vừa tạo, không có SFU, không có kết nối, không có track/RTP. Case T024-04 "generational isolation" chỉ so hai chuỗi tên phòng khác nhau.
- **Ảnh hưởng:** lane media (đang nằm trong `pnpm test:unit`) xanh nhưng không chứng minh quyền publish/subscribe thực tế; đây là nguồn của tuyên bố "5/5 PASS".
- **Sửa tối thiểu:** chuyển các assertion sang test SFU thật (authorized positive control nhận bytes/frame tăng, kèm test deny có bounded window như spec 08 yêu cầu).
- **Test hồi quy:** authorized peer nhận được frame/byte tăng trước khi dùng "zero incoming" làm bằng chứng deny.

#### F-15 — Báo cáo "thử tải 70 clients" không phải thử tải
- **Mức độ:** P1 (bằng chứng sai bản chất) — CONFIRMED
- **File/dòng:** `tests/load/socket-load.ts:28-45`, `tests/load/socket-load.test.ts`, `tests/e2e/full-demo.spec.ts`
- **Actual:** "70 clients" = vòng `for` **tuần tự** 70 lần `app.inject({GET /health})` trong 1 process (chạy lại tại đây: 78 thao tác, p95 51.0ms, "PASS"). Không tạo phòng, không socket, không đo RTT/event-loop. `full-demo.spec.ts` chỉ là 1 test điều hướng 5 bước qua các trang tĩnh, không có 8 context (2 người chơi + 5 khán giả + người thứ 6 bị từ chối) như acceptance ISSUE-030. `tests/integration/faults.test.ts` chỉ assert hash payload và 401 — không có fault/ack/rollback/restart.
- **Ảnh hưởng:** con số "p95 28.7ms, 10 phòng 70 clients" trong `PROGRESS.md:44` và `docs/test-reports/ISSUE-030.md` không đo điều nó tuyên bố.
- **Sửa tối thiểu:** thay bằng load test mở socket thật tới server đang chạy (sau F-06), đo roundtrip + event-loop delay; hoặc hạ tuyên bố xuống "smoke latency in-process".
- **Test hồi quy:** load lane tạo 10 phòng/70 kết nối thật, assert p95 < 100ms và RTT < 500ms.

### P2

#### F-16 — Bằng chứng và tài liệu không thống nhất với implementation
- **Mức độ:** P2 — CONFIRMED
- **Biểu hiện:**
  1. `PROGRESS.md:4,7` khẳng định `PROJECT_COMPLETE`, "KHÔNG CÓ BLOCKER", nhưng cùng lúc có F-01..F-15; `docs/issues/README.md:3` và `docs/test-reports/final-coverage.md` lặp lại tuyên bố đó với "100% PASS" cho R11 (media) và R16.
  2. Số liệu test không nhất quán giữa các báo cáo: `ISSUE-021.md` ghi "32 test files, 199 tests"; `ISSUE-023.md` ghi "26 test files, 180 tests"; thực tế tại máy này: **33 file (1 skip), 199 pass, 2 skip**.
  3. `PROGRESS.md` ghi ISSUE-032 gắn PR #44, không ghi 3 PR fix sau đó (#45–#47) dù chúng sửa lỗi runtime.
  4. `docs/test-reports/ISSUE-004.md` có dòng "mate distance … PASS" — mate distance thuộc ISSUE-019, không thuộc ISSUE-004, và không có test nào trong `terminal.test.ts` kiểm tra nó.
- **Sửa tối thiểu:** cập nhật PROGRESS/issue/final-coverage theo trạng thái thật (LOCAL_DONE cho phần còn gate provider; NOT_READY cho media/socket), ghi rõ PR #45–#47, xoá các dòng acceptance không có test.

#### F-17 — Spec 08 dùng toạ độ đảo trục; fixture terminal của spec không được implement
- **Mức độ:** P2 — CONFIRMED
- **File/dòng:** `docs/specs/08-TEST-EXECUTION.md:62-66`, `docs/issues/ISSUE-003-legal-moves.md:52`
- **Actual:** spec ghi `BLACK GENERAL(4,0); RED GENERAL(4,9)`, `RED HORSE(1,9)→(2,7)`, tức BLACK ở đáy — ngược với domain model đã chốt (`packages/game-rules/src/initial.ts`: RED ở `y=0..4`, BLACK ở `y=5..9`). Vì vậy F-MATE/F-STALEMATE/F-REPEAT của spec không dựng được; repo thay bằng fixture tự chế (`tests/fixtures/terminal-positions.ts`, có comment thừa nhận) và **không có test F-REPEAT 8 ply**. `ISSUE-003-legal-moves.md:52` cũng ghi nước mở màn `(0,6)→(0,5)` (hàng tốt Đen) trong khi initial RED có tốt ở `y=3`.
- **Ảnh hưởng:** "fixture terminal có đáp án độc lập" — gate chống tự-khẳng-định của spec 08 — không còn hiệu lực; test terminal không còn oracle độc lập theo spec.
- **Sửa tối thiểu:** sửa spec 08/ISSUE-003 sang toạ độ canonical (đảo y) và bổ sung fixture F-REPEAT 8 ply + F-MATE/F-STALEMATE đúng canonical.

#### F-18 — DB drift: `public.moves` thay `match_moves`; drop constraint của spec
- **Mức độ:** P2 — CONFIRMED
- **File/dòng:** `supabase/migrations/20260912000010_matches_runtime_fixes.sql:24-38` (bảng `moves`, UNIQUE `(match_id, move_number)`), `:20` (`DROP CONSTRAINT matches_active_move_ids_check`), `:36-45` (nới `command_receipts`)
- **Spec:** `docs/specs/09-DATABASE-DESIGN.md:241-258` (`match_moves` với `parent_move_id`, `UNIQUE(match_id,event_version)`, FK deferrable tới `match_events`), `:470,486` (`active_move_ids`, `repetition_counts` là cache được rebuild)
- **Actual:** bảng theo spec (`match_moves`) tồn tại do migration 3 nhưng **không được server dùng** (`grep match_moves apps/server/src` → 0 hit); runtime dùng bảng mới `public.moves` phẳng, không ancestry. Kèm theo đó `repetition_counts` không được dùng (thay bằng quét `match_events`), và `activeMoveIds` luôn rỗng.
- **Ảnh hưởng:** mất mô hình nhánh/ancestry là nguyên nhân gốc của F-01/F-02/F-02b; spec và runtime lệch nhau ở đúng phần khó nhất (undo/lặp).
- **Sửa tối thiểu:** chọn một hướng và ghi decision log: hoặc quay về `match_moves`+ancestry theo spec 09, hoặc cập nhật spec 09 theo `moves` phẳng và bù logic nhánh ở service.

#### F-19 — Ready race: không kiểm `room.status`, lỗi DB thay vì 409
- **Mức độ:** P2 — CONFIRMED (phân tích tĩnh; repro cần DB)
- **File/dòng:** `apps/server/src/modules/matches/service.ts:40-75` (không kiểm `room.status`/`current_match_id`), `apps/server/src/modules/rooms/routes.ts` (ready gọi `startMatchFromRoom`), `supabase/migrations/20260912000003_matches_audit_controls.sql:96-98` (`CREATE UNIQUE INDEX matches_active_room_idx ON public.matches(room_id) WHERE status='ACTIVE'`)
- **Actual:** hai request ready đồng thời: request 1 tạo match ACTIVE và đặt room `PLAYING`; request 2 (khoá room sau) không quan tâm `room.status` và lại INSERT match ACTIVE cùng `room_id` → vi phạm partial unique index → transaction rollback → lỗi 500 kiểu `INTERNAL_ERROR`, không phải 409 `MATCH_ALREADY_STARTED` và không trả snapshot hiện có.
- **Lưu ý phản biện:** kết luận "tạo được hai match ACTIVE" là **sai** — partial unique index ngăn điều đó; hậu quả thật là lỗi API/sai mã lỗi + UX. (Không sao chép kết luận của scout.)
- **Sửa tối thiểu:** kiểm `room.status === 'WAITING'` (hoặc trả match hiện tại nếu `current_match_id` đã set) trước khi tạo; map lỗi 23505 thành 409 `CONFLICT`.
- **Test hồi quy:** 2 request ready đồng thời → đúng 1 match, request còn lại nhận 200 snapshot hoặc 409 (không bao giờ 500).

#### F-20 — Không có scheduler cho hết hạn proposal 30s, đóng phòng 10 phút, reset `finished_at` khi rematch
- **Mức độ:** P2 — CONFIRMED
- **File/dòng:** `apps/server/src/modules/matches/proposals.ts` (không có timer), `apps/server/src/modules/rooms/rematch.ts:88-95` (`UPDATE rooms ... status='PLAYING'` không reset `finished_at`)
- **Spec:** `docs/issues/ISSUE-014` ("timer proposal expiry 30s"), `docs/issues/ISSUE-027` ("FINISHED → CLOSED sau 10 phút từ finished_at; tái đấu reset finished_at")
- **Actual:** proposal hết hạn chỉ được xử lý thụ động khi có người gọi `/respond`; không có job đóng phòng; `finished_at` cũ còn nguyên khi rematch. Kèm F-04: không có hạ tầng timer nào trong server.
- **Sửa tối thiểu:** mở rộng scheduler chung (xem F-04) xử lý cả 3 loại hạn; reset `finished_at = NULL` khi rematch.

#### F-21 — UI thiếu điều hướng bàn cờ bằng bàn phím
- **Mức độ:** P2 (accessibility/acceptance) — CONFIRMED
- **File/dòng:** `apps/web/src/components/board/Board.tsx:83-88` (`handleKeyDown` chỉ xử lý `Escape`), `Board.tsx:344-348` (giao điểm có `onClick`/`role="button"` nhưng không `tabindex`)
- **Spec:** `docs/specs/07-UI-AND-TESTS.md` ("Escape bỏ chọn, arrows + Enter cho keyboard board"), `docs/issues/ISSUE-005-board-ui.md` bước 3
- **Bằng chứng:** kiểm thử browser: 90 giao điểm, `tabbableIntersections = 0`; nhấn `ArrowLeft`/`Enter` không di chuyển con trỏ chọn ô (không có cursor state trong code). `PROGRESS.md:19` ghi "phím điều hướng" — không đúng.
- **Sửa tối thiểu:** thêm state cursor + xử lý `Arrow*`/`Enter`, `tabindex` cho ô cờ (roving tabindex), test Playwright theo phím.

#### F-22 — `isSessionActive`/`recordRevokedSession` chết ở tầng gọi; `PresenceTracker` không có endpoint
- **Mức độ:** P2 — CONFIRMED (bổ sung cho F-05/F-06)
- **File/dòng:** `apps/server/src/auth/session.ts:10-27` (không caller), `apps/server/src/realtime/presence.ts` (không route/heartbeat nào gọi), `apps/server/src/auth/routes.ts:152` (nhánh không bao giờ chạy)
- **Ảnh hưởng:** các acceptance về hiện diện (online/offline, audience hợp lệ) và thu hồi phiên không có đường thực thi; `docs/issues/ISSUE-009` ghi presence lease 30s/heartbeat 10s nhưng không có kênh nào để client gửi heartbeat.
- **Sửa tối thiểu:** thêm endpoint heartbeat/subscribe (gắn với F-06) và kiểm tra revoked session trong middleware (F-05).

#### F-29 — `TerminalEvent` thiếu trong `@xiangqi/contracts` (spec 04/03 yêu cầu)
- **Mức độ:** P2 — CONFIRMED
- **File/dòng:** `packages/contracts/src/game.ts`, `packages/contracts/src/index.ts` (0 hit cho `TerminalEvent`), so với `docs/specs/04-CONTRACTS.md:21` và `docs/specs/03-STATE-MACHINES.md:85`
- **Actual:** spec định nghĩa `TerminalEvent` là discriminated union (`{type:'MOVE',payload:{moveId,parentMoveId,side,move}}` | `{type:'RESULT',payload:{actorKey}}`) và nói finalizer nhận nó trước khi tăng version; package contracts **không export** type này (`grep TerminalEvent packages/contracts/src` → rỗng).
- **Ảnh hưởng:** finalizer/event log thiếu kiểu dùng chung; consumer phải tự định nghĩa lại shape → dễ lệch với spec (liên quan F-02b vì `parentMoveId` chính là ancestry bị thiếu).
- **Sửa tối thiểu:** định nghĩa + export `TerminalEvent` trong `packages/contracts/src/game.ts` và re-export ở `index.ts`; thêm assert kiểu trong `tests/unit/contract-fixes.test.ts`.
- **Test hồi quy:** type-level test import `TerminalEvent` và dựng cả hai nhánh; consumer (finalizer) dùng type thay vì literal.

### P3

#### F-23 — Route test-only `/dev/board` nằm trong router production
- **File/dòng:** `apps/web/src/app/router.tsx:29,91`
- **Actual:** route `/dev/board` và link "Bàn cờ thử nghiệm" được ship không kèm điều kiện `import.meta.env.DEV`; đây là bề mặt test-only trong sản phẩm (spec 08: harness không mở cổng phụ trong sản phẩm). E2E cũng dựa vào route này (2 test).
- **Sửa tối thiểu:** bọc sau `import.meta.env.DEV` hoặc tách entry riêng cho test.

#### F-24 — Chạy test tự ghi đè artifact tracked (worktree bẩn, số liệu không tất định)
- **File/dòng:** `tests/ai/benchmark.ts:98-140` (`exportReports` ghi `docs/test-reports/ai/benchmark-results.{json,csv}`), `tests/ai/benchmark.test.ts`
- **Bằng chứng:** sau khi chạy `pnpm test:unit` tại đây, `git status` báo M trên đúng 2 file này (chỉ thời gian chạy thay đổi: 168.9 → 208.4 ms…). Đã khôi phục bằng `git checkout --`.
- **Ảnh hưởng:** mỗi lần chạy test làm bẩn worktree với diff không tất định; artifact "bằng chứng" lệch giữa các lần.
- **Sửa tối thiểu:** ghi ra `artifacts/` (đã ignore) và chỉ copy bản đã chọn vào `docs/test-reports/` khi công bố.

#### F-25 — `pruningRatio` có thể âm; tuyên bố "alpha-beta luôn ít node hơn" không đúng
- **File/dòng:** `tests/ai/benchmark.ts:75`, artifact `benchmark-results.csv` (corpus-07 = −31.7%, corpus-13 = −9.1%)
- **Sửa tối thiểu:** nêu rõ ordering/PV ảnh hưởng, không tuyên bố bất biến; test chỉ nên assert trên tổng corpus có ghi điều kiện.

#### F-26 — `isSquareAttackedBy` trả `false` cho ô trống với pháo
- **File/dòng:** `packages/game-rules/src/attacks.ts:133-142`
- **Actual:** nhánh `if (target !== null) return between === 1; return false;` → ô trống không bao giờ được coi là bị pháo khống chế qua ngòi. Không ảnh hưởng `isInCheck` (tướng là quân), nhưng ảnh hưởng bản đồ đe doạ/UI nếu dùng sau này.
- **Sửa tối thiểu:** tách rõ ngữ nghĩa (tham số `assumeOccupied`) hoặc ghi chú contract; test phân biệt ô trống/ô có quân.

#### F-27 — Rate limiter trong bộ nhớ không có TTL
- **File/dòng:** `apps/server/src/modules/matches/proposals.ts:27` (`lastProposalTimes = new Map`)
- **Sửa tối thiểu:** xoá entry khi ván kết thúc hoặc dùng LRU/TTL.

#### F-28 — Hạ tầng LiveKit local: image `:latest`, thiếu map dải cổng RTC UDP
- **File/dòng:** `infra/compose.yaml`, `infra/livekit.yaml`
- **Actual:** `livekit/livekit-server:latest`, chỉ expose `7880/7881/7882-udp`, trong khi `port_range_start/end = 50000/60000` không được publish → WebRTC từ ngoài máy ảo Docker Desktop khó thiết lập ICE.
- **Sửa tối thiểu:** pin version, thu hẹp dải port và map tương ứng (hoặc `network_mode: host` trên Linux).

---

## E. Bảng kiểm chứng

Môi trường: macOS 24.6.0 (arm64), Node `v26.7.0`, pnpm `10.34.5`, vitest 3.2.7, Playwright chromium, KHÔNG có Supabase local/LiveKit/Docker.

| # | Lệnh / thao tác | Exit | Kết quả thật | Assertion chính | Loại |
|---|---|---|---|---|---|
| 1 | `pnpm typecheck` (`tsc -b`) | 0 | không lỗi | build info hợp lệ | automated |
| 2 | `pnpm exec tsc -b --force` | 0 | không lỗi (buộc build lại từ đầu) | strict TS 5.8 | automated |
| 3 | `pnpm lint` | 0 | 0 warning/error | eslint 10 + typescript-eslint | automated |
| 4 | `pnpm build` | 0 | 6 package build; vite cảnh báo chunk `919 kB > 500 kB` | bundle tạo được | automated |
| 5 | `pnpm test:unit` | 0 | **33 file: 32 passed, 1 skipped; 199 passed, 2 skipped** | gồm cả `tests/ai`, `tests/load`, `tests/integration` (không thuần unit) | automated |
| 6 | `pnpm test:integration` | 0 | **1 file pass (2 test), 1 file skipped (2 test)** | `database.test.ts` **luôn skip** (F-11) | automated (DB thật: NOT_RUN) |
| 7 | `pnpm test:e2e` | 0 | **78 passed (15.1s)** | web server Vite khởi động được; **proxy `/api` → `localhost:3001` trả ECONNREFUSED suốt run** (không có backend) | browser thật (Playwright) |
| 8 | `pnpm exec playwright test --list` | 0 | `Total: 78 tests in 14 files` | khớp con số 78 trong PROGRESS | automated |
| 9 | `node /tmp/xiangqi-review/repro-ai-corpus.mjs` (script tạm, đã xoá) | 0 | `nonFiniteScores: 12/20`; initial đúng loại quân cho `score=-50, nodes=174` | F-13 | automated (repro tạm) |
| 10 | `hub start node apps/server/dist/main.js` với env cô lập (`DATABASE_URL=…127.0.0.1:54399`, `SUPABASE_URL=http://127.0.0.1:54399`) | – | log `Server listening`; `GET /health` → **200** `{"status":"ok"}`; `GET /api/v1/me` → **401** `UNAUTHENTICATED`; Bearer rác → **401**; `POST /api/v1/rooms/join` không token → **401** | build chạy thật; auth chặn trước DB | automated (runtime, **không** dùng cloud) |
| 11 | Kiểm thử UI bằng browser thật (Chromium do harness quản lý) trên `http://localhost:5173/dev/board` | – | 32 quân, `aria-label` tiếng Việt ("Xe đỏ, cột 1 hàng 1"…), bàn gỗ + 楚河/漢界; nút "Lật bàn (RED)" tồn tại (hành vi lật được xác nhận gián tiếp qua test Playwright `online-match.spec.ts` T015-E2E-02 pass trong run #7, không phải bằng click thủ công — cell click bị timeout do tab freeze). Chọn Pháo (1,2) → **12 ô hợp lệ** gồm `legal-target-1-6` và `legal-target-1-9` (ăn quân qua ngòi) — đúng luật pháo; `tabbableIntersections = 0`; `ArrowLeft`/`Enter` không tạo cursor | giao diện chạy được, luật hiển thị đúng | browser thật (khác Playwright spec) |
| 12 | Screenshot 390×800 `http://localhost:5173/dev/board` | – | bàn cờ hiển thị đủ, không tràn ngang | R15 ở 390px | browser thật (visual) |

Giới hạn: mục 10–12 chỉ chạy **frontend + server build với env cô lập**; mọi luồng cần DB (auth thật, phòng, ván, undo, media) **chưa được chạy** vì không có Supabase local và không được phép ghi cloud.

Artifact/đường dẫn dùng cho review (đã dọn sau khi xong): `/tmp/xiangqi-review/repro-ai-corpus.mjs`, ảnh `board-mobile390.png`, `board-interaction.png`. Không có file nào được thêm vào repo bởi review này ngoài báo cáo này.

---

## F. Kiểm tra Git/GitHub và tài liệu

### F.1 Đã xác minh

- `git status` sạch; `git fetch origin` OK; `HEAD == origin/main == 0f2c49c`; ahead/behind `0 0`.
- `gh pr list --state all` → #1–#47 đều `MERGED`, không có PR mở; `gh pr view 44/47` xác nhận merge commit `ebdd611` / `0f2c49c` và đường dẫn nhánh `feat/issue-032-final-handoff` / `fix/ai-undo-and-friends-lobby-flow`.
- Nhánh/commit tuân thủ quy ước `feat|fix|docs|test|chore(scope): … [ISSUE-NNN]` trong các commit đã kiểm tra; không thấy `Co-Authored-By` AI trong log.
- `.gitignore` phủ `.env`, `node_modules/`, `dist/`, `test-results/`, `.omx/`, `coverage/`, `artifacts/`; `git ls-files -ci --exclude-standard` rỗng (không có file tracked nào khớp ignore); không có `node_modules`/`dist` trong Git.
- Quét secret trên toàn bộ file tracked (`eyJ…`, `service_role`, `sk-…`): các hit duy nhất là **placeholder/tài liệu** (`[service_role_key]`, tên biến môi trường, mô tả trong RESEARCH); **không tìm thấy secret thật**. `.env` tồn tại ở local nhưng untracked và bị ignore (chỉ ghi nhận loại biến: Supabase URL/keys, DATABASE_URL, LiveKit keys — không chép giá trị).
- CI workflow tồn tại và đúng phạm vi (build/typecheck/lint/unit/E2E). **Chưa xác minh trạng thái các lần chạy CI trên GitHub** (không chạy `gh run list` trong review này) → coi là NOT_RUN.

### F.2 Mâu thuẫn tài liệu ↔ thực tế (có bằng chứng)

1. `PROGRESS.md:4,7,44,53-61` + `docs/issues/README.md:3` + `docs/test-reports/final-coverage.md` khẳng định `PROJECT_COMPLETE 32/32`, `100% PASS`, "KHÔNG CÓ BLOCKER" — không khớp F-01..F-15 (đặc biệt media R11 và load R16).
2. `PROGRESS.md:46` ghi ISSUE-032 gắn PR #44; ba PR fix #45–#47 merge sau đó không được ghi nhận.
3. `tests/media/spike.ts` không thuộc runner nào (spec 08 yêu cầu integration config nhận nó) nhưng bằng chứng "5/5 SFU PASS" được dùng để đóng ISSUE-024.
4. `tests/integration/database.test.ts` luôn skip nhưng `ISSUE-006` được ghi DONE kèm "migration/RLS/rollback" đã kiểm.
5. Số liệu test khác nhau giữa các báo cáo (180/26 vs 199/32 vs thực tế 199 pass/2 skip/33 file).
6. `ISSUE-023.md` tự ghi "Score Agreement 8/20 (40%)" nhưng mọi dòng acceptance đều `PASS`; `PROGRESS.md:37,56` và `DEFENSE.md:22,50` công bố 84.51%.
7. `ISSUE-014.md`/`ISSUE-013.md` ghi undo nhánh lặp và timeout/grace PASS trong khi code không thực thi các đường đó (F-02/F-04).

### F.3 Vi phạm workflow (có bằng chứng)

- **Tuyên bố hoàn thành trước khi nghiệm thu runtime:** PR #44 tuyên bố `PROJECT_COMPLETE`, sau đó #45–#47 sửa lỗi runtime của ISSUE-007/008/021. Workflow yêu cầu "Kiểm PR đã MERGED trước dùng làm dependency" và "không tuyên bố toàn bộ xong khi gate chưa đủ" → vi phạm về mặt quy trình (không phải về thao tác Git).
- **Bằng chứng không tái lập được:** các báo cáo test mô tả lệnh và output, nhưng lệnh đó hiện không chạy đúng phạm vi (media spike không có runner; DB integration luôn skip; load test là in-process). Đây là vi phạm gate "test có test path + quan sát thật" của spec 08 §Gate.
- Không phát hiện vi phạm kỹ thuật Git khác: không force push, không commit trực tiếp lên main, không secret trong history đã kiểm tra (không có secret tracked tại HEAD).

---

## G. Bàn giao triển khai tiếp

### G.1 Phải sửa trước khi tiếp tục tính năng mới

1. **F-01** undo online (crash 500) — chặn mọi luồng chơi có đi lại.
2. **F-05** thu hồi phiên + CORS allowlist — chặn mọi tuyên bố bảo mật.
3. **F-03** join bỏ qua visibility — lỗ hổng quyền riêng tư.
4. **F-04 + F-20** scheduler (timeout/grace/proposal/đóng phòng) — nếu không có, các trạng thái ván không bao giờ tự kết thúc.
5. **F-11 + F-12 + F-13** độ tin cậy nghiệm thu: bật lane DB thật, corpus đúng tên quân + assertion, thay mock bằng test thật. Đây là điều kiện để mọi issue sau được coi là DONE thật.
6. **F-02b/F-18** chốt mô hình ancestry (`match_moves` theo spec 09 hay `moves` phẳng + logic nhánh) — quyết định này chi phối F-01/F-02.

### G.2 Issue tiếp theo đủ dependency

- Muốn tiếp tục theo thứ tự spec: **ISSUE-004 (PARTIAL)** và **ISSUE-006 (harness DB)** là dependency nền đang thiếu; nên làm **ISSUE-006** trước vì nó mở khoá kiểm chứng cho 012/013/014.
- Song song được (khác module, không đụng file nhau):
  - **Lane A — Rules/DB nền:** ISSUE-006 (harness TS + lane CI DB) + ISSUE-004 (F-REPEAT fixture theo F-17).
  - **Lane B — Match pipeline:** ISSUE-014 (F-01) + ISSUE-013 (F-04) — cùng `modules/matches` nhưng khác file; nếu gộp một owner thì tuần tự trong cùng nhánh.
  - **Lane C — Auth/Security:** ISSUE-029 (F-05, F-03) — `auth/*`, `invitations/service.ts`.
  - **Lane D — AI:** ISSUE-021 (F-08) + ISSUE-023 (F-13) — `apps/ai-worker`, `packages/ai`, `tests/ai`.
  - **Lane E — Realtime + Media:** ISSUE-012/015 (F-06) rồi ISSUE-025/026 (F-09) — **phải chốt quyết định kiến trúc trước** (WS transport + 4 phòng) vì ảnh hưởng contract.
- Ownership đề xuất: một coordinator duy nhất sửa `PROGRESS.md` + thao tác Git/PR (theo `GIT-WORKFLOW.md` §Điều phối); các lane chỉ sửa file thuộc module của mình.

### G.3 Blocker thật và đầu vào còn thiếu

- **Supabase test project + Docker** cho lane integration DB (không được dùng cloud hiện tại để ghi). Cần: `supabase start` local hoặc một project test riêng + `DATABASE_URL`/`DIRECT_URL` trong `.env` local.
- **LiveKit SFU local** (Docker) để chạy `tests/media/spike.ts` thật, và quyết định triển khai 4 phòng theo spec 06.
- **Quyết định kiến trúc realtime** (WebSocket vs SSE vs polling có tuyên bố lại) — cần trước khi sửa acceptance ISSUE-012/015/016/017/030.
- **Xác nhận của người dùng** về việc có/không phải cập nhật `PROGRESS.md` và các issue sang trạng thái thật (review này **không sửa** PROGRESS/issue theo yêu cầu).

### G.4 Prompt ngắn cho agent triển khai tiếp

```text
Bạn đang ở XIANGQI, branch main, HEAD 0f2c49c (sạch). Đọc trước
docs/reviews/AGENT-HANDOFF-REVIEW-20260913-1706.md (kết luận NOT_READY cho PROJECT_COMPLETE)
rồi docs/handoff/START-HERE.md, docs/handoff/GIT-WORKFLOW.md, docs/specs/08-TEST-EXECUTION.md,
docs/specs/09-DATABASE-DESIGN.md.

Trạng thái thật KHÔNG phải PROJECT_COMPLETE. Việc đầu tiên: sửa các P1 theo thứ tự
F-01 (undo online UNIQUE violation), F-05 (thu hồi phiên + CORS allowlist), F-03
(join bỏ qua visibility), F-04/F-20 (scheduler deadline/grace/proposal/đóng phòng).

Bắt buộc: mỗi fix kèm test hồi quy thật như mô tả trong finding; đồng thời mở lane
integration DB thật (F-11/F-12: nạp .env trong lane, không skip khi thiếu DB, thay mock)
và sửa corpus AI + thêm assertion cho benchmark (F-13). Khi sửa xong, cập nhật
PROGRESS/issue theo trạng thái LOCAL_DONE đúng nghĩa, ghi rõ phần còn gate provider
(Supabase test project, LiveKit local, WebRTC 2 thiết bị) và KHÔNG tuyên bố
PROJECT_COMPLETE khi các gate đó chưa có evidence.

Theo GIT-WORKFLOW: một issue một nhánh/PR vào main, fetch trước push, không force push,
không tự giải quyết conflict (dừng và báo), không co-author AI. Chạy trước khi PR:
pnpm build && pnpm typecheck && pnpm lint && pnpm test:unit (bắt buộc xanh) và lane
integration khi có DB. Không dùng mock thay cho provider smoke chưa chạy.
```

---

## Xác nhận kết thúc

- Báo cáo chỉ chứa đường dẫn/ký hiệu biến môi trường, **không chứa giá trị secret**.
- Không sửa `PROGRESS.md`, không đánh dấu issue DONE, không sửa mã nguồn/migration/cấu hình, không commit/push/merge, không ghi Supabase cloud.
- Worktree trở về trạng thái sạch của `0f2c49c` sau review; script/ảnh tạm nằm ở `/tmp/xiangqi-review/` (ngoài repo).
