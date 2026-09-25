# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY (đầy đủ các tài liệu hướng dẫn và đặc tả).
- Trạng thái sản phẩm: **LOCAL_COMPLETE** — 32/32 issue đạt tiêu chuẩn nghiệm thu local; 30/30 finding của đợt review `docs/reviews/AGENT-HANDOFF-REVIEW-20260913-1706.md` đã xử lý xong (28 `FIXED`, 2 ghi nhận tài liệu/ngữ nghĩa) và merge vào `main` qua **PR #48 (squash `8bfa200`)**, cùng PR #49 (`aa20d4b`, ghi merge SHA), PR #50 (`3d16a8a`, lane tải thủ công + hardening E2E), PR #51 (`d47e73e`, hoàn thiện bàn giao local-complete), PR #52 (`e75f995`, đồng bộ test registries) và PR #54 (`9cb7766`, khắc phục ISSUE-015 realtime sync race và chuẩn hóa nghiệm thu staging).
- Issue đang làm: Bàn giao staging và các external gates (nhánh `main`).
- Bước tiếp theo: chạy các gate ngoài (Google OAuth domain thật, LiveKit 2 thiết bị khác mạng, deploy Render/Vercel) theo `docs/handoff/DEPLOY.md`; lane tải chạy trên máy đủ cấu hình qua workflow `Load lane (manual)`.
- External Gates đang chờ:
  1. Google OAuth Cloud Client ID/Secret trên domain production Vercel (R01).
  2. LiveKit Cloud / TURN Relay trên 2 thiết bị di động vật lý khác mạng (R11).
  3. Deploy thực tế lên Render (Server) và Vercel (Web SPA) theo runbook `docs/handoff/DEPLOY.md` (R16).

---

## Bảng Registry Tổng Thể 32 Issues

| Issue | Trạng thái | Ghi chú & Bằng chứng Kiểm chứng |
|---|---|---|
| [ISSUE-001](../issues/ISSUE-001-foundation.md) | **DONE** | PR #10 MERGED (`f397cba`); monorepo pnpm, Fastify /health, Vite web shell, CI workflow |
| [ISSUE-002](../issues/ISSUE-002-contracts-position.md) | **LOCAL_DONE** | PR #11 MERGED (`d8e9dba`), bổ sung `TerminalEvent` discriminated union theo spec 04/03 (F-29); 32 quân, 90 ô, position key canonical |
| [ISSUE-003](../issues/ISSUE-003-legal-moves.md) | **DONE** | PR #13 MERGED (`6dc3376`); 7 loại quân, attack geometry riêng biệt, chống tướng đối mặt |
| [ISSUE-004](../issues/ISSUE-004-terminal-repetition.md) | **LOCAL_DONE** | PR #14 MERGED (`2374642`); hòa lặp 3 lần chỉ tính trên nhánh hiệu lực sau undo (`tests/integration/match-model.test.ts`), F-REPEAT canonical verified |
| [ISSUE-005](../issues/ISSUE-005-board-ui.md) | **LOCAL_DONE** | PR #16 MERGED (`21c1ebb`); bàn cờ gỗ SVG, quân Hán, lật bàn phe Đen, bổ sung điều hướng phím mũi tên + Enter/Space + roving tabindex (F-21, `tests/e2e/keyboard-board.spec.ts`) |
| [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) | **LOCAL_DONE** | PR #15; bổ sung test harness TypeScript thật (`tests/fixtures/integration.ts`), gate fail-loud không skip (`tests/integration/setup.ts`), 11 tests DB thật + 6 tests factory (`tests/integration/database.test.ts`, `harness.test.ts`) |
| [ISSUE-007](../issues/ISSUE-007-password-auth.md) | **LOCAL_DONE** | PR #20 MERGED (`d25399e`); thu hồi phiên fail-closed (`private.revoked_sessions` kèm `expires_at`, `isSessionActive`), 4 tests thật (`tests/integration/session-revocation.test.ts`) |
| [ISSUE-008](../issues/ISSUE-008-google-profile.md) | **LOCAL_DONE** | PR #22 MERGED (`d82878e`), PR #46; Google PKCE + bổ sung gate `ONBOARDING_REQUIRED` 403 cho profile chưa có username (`apps/server/src/auth/onboarding-gate.ts`, `tests/integration/authz.test.ts`) |
| [ISSUE-009](../issues/ISSUE-009-friends-presence.md) | **LOCAL_DONE** | PR #23 MERGED (`bc69b69`); quan hệ bạn bè 2 chiều, bổ sung heartbeat 10s / lease 30s qua socket `presence:heartbeat`, lưu bền vững trong `client_controls` (`tests/integration/control-lease.test.ts`) |
| [ISSUE-010](../issues/ISSUE-010-rooms-lobby.md) | **LOCAL_DONE** | PR #24 MERGED (`ed5034e`); sảnh công khai, sẵn sàng tự bắt đầu ván, sửa ready race trả 409 khi không ở trạng thái WAITING, kiểm soát lease phiên (`apps/server/src/modules/rooms/service.ts`) |
| [ISSUE-011](../issues/ISSUE-011-invitations.md) | **LOCAL_DONE** | PR #25 MERGED (`b359508`); sửa lỗi lệch schema `public.invitations` (sender_id, bytea HMAC-SHA256, vai trò PLAY/WATCH, trạng thái ACTIVE/CONSUMED), chặn join roomId vào phòng LOCKED/CODE_ONLY (F-03, `tests/integration/invitations.test.ts`) |
| [ISSUE-012](../issues/ISSUE-012-authoritative-match.md) | **LOCAL_DONE** | PR #26 MERGED (`1616281`); khôi phục log nước đi chuẩn `match_moves` + `parent_move_id` (migration 11), sửa lặp 3 lần sau undo, tích hợp Socket.IO gateway đẩy `match:state` thay cho polling (`tests/integration/match-model.test.ts`, `realtime.test.ts`) |
| [ISSUE-013](../issues/ISSUE-013-clocks-reconnect.md) | **LOCAL_DONE** | PR #27 MERGED (`b91a8b3`); bổ sung deadline scheduler (`apps/server/src/modules/matches/deadlines.ts`) xử lý timeout tự động, ân hạn mất mạng 60s, cả hai offline -> INTERRUPTED (`tests/unit/scheduler.test.ts`, `tests/integration/races.test.ts`) |
| [ISSUE-014](../issues/ISSUE-014-draw-undo-resign.md) | **LOCAL_DONE** | PR #28 MERGED (`b6661a1`); sửa triệt để lỗi crash UNIQUE 23505 khi đi nước mới sau khi undo (F-01), bổ sung scheduler hết hạn đề nghị 30s (F-20), `tests/integration/match-model.test.ts` pass 100% |
| [ISSUE-015](../issues/ISSUE-015-online-ui.md) | **LOCAL_DONE** | PR #29 MERGED (`86d8e98`); thay thế toàn bộ polling 1.5s bằng Socket.IO client (`apps/web/src/lib/realtime.ts`), đồng bộ thời gian thực hai bên không cần reload (`tests/e2e/realtime-sync.spec.ts`) |
| [ISSUE-016](../issues/ISSUE-016-spectators.md) | **LOCAL_DONE** | PR #30 MERGED (`47ca950`); trần 5 khán giả, sửa dead code `revokeSpectators` phát sự kiện `access:revoked` khi khóa phòng và tước quyền đọc/chat của khán giả bị thu hồi (`tests/integration/authz.test.ts`) |
| [ISSUE-017](../issues/ISSUE-017-private-chat.md) | **LOCAL_DONE** | PR #31 MERGED (`53f3f9f`); 2 kênh chat độc lập PLAYERS/SPECTATORS, gửi chat qua WebSocket kèm lease phiên, phân trang con trỏ keyset (`apps/server/src/modules/chat/service.ts`) |
| [ISSUE-018](../issues/ISSUE-018-ai-evaluation.md) | **LOCAL_DONE** | PR #17 MERGED (`f3c556d`); hàm lượng giá đối xứng, thưởng tốt qua sông và kiểm soát trung lộ, MVV-LVA move ordering |
| [ISSUE-019](../issues/ISSUE-019-ai-minimax.md) | **DONE** | PR #18 MERGED (`8793bcf`); minimax/negamax baseline, mate distance theo ply, xét hòa lặp 3 lần |
| [ISSUE-020](../issues/ISSUE-020-ai-alpha-beta.md) | **DONE** | PR #19 MERGED (`970feb6`); alpha-beta pruning, iterative deepening, PV ordering, 3 cấp độ EASY/MEDIUM/HARD |
| [ISSUE-021](../issues/ISSUE-021-ai-worker-server.md) | **LOCAL_DONE** | PR #32 MERGED (`55d7032`), PR #47; chuyển supervisor sang worker threads thật mặc định, sửa lỗi nuốt RESULT, chứng minh không nghẽn event loop qua benchmark <500ms lúc HARD search (`tests/unit/ai-worker.test.ts`, `tests/integration/ai-match.test.ts`) |
| [ISSUE-022](../issues/ISSUE-022-ai-ui.md) | **LOCAL_DONE** | PR #33 MERGED (`7c0b1f5`); màn chọn cấp độ và đánh với AI, hiển thị trạng thái AI suy nghĩ, đi lại tức thì |
| [ISSUE-023](../issues/ISSUE-023-ai-experiments.md) | **LOCAL_DONE** | PR #34 MERGED (`09df7f7`); chuẩn hóa toàn bộ 20 thế cờ trong corpus (thay 29 lỗi CHARIOT/SOLDIER bằng ROOK/PAWN), bổ sung 15 assertions thực tế cho benchmark, số liệu cắt tỉa thực nghiệm trung thực: 78.86% node-weighted, 20/20 điểm số trùng khớp (`docs/test-reports/ISSUE-023.md`) |
| [ISSUE-024](../issues/ISSUE-024-media-spike.md) | **LOCAL_DONE** | PR #38 MERGED (`6698469`); tích hợp runner `test:media` vào vitest, 8/8 test cases pass trên SFU LiveKit thật với kiểm chứng RTP bytes/frames nhận thực tế (`tests/media/spike.ts`) |
| [ISSUE-025](../issues/ISSUE-025-media-authority.md) | **LOCAL_DONE** | PR #39 MERGED (`36e311e`); chính sách lưu bền vững trong CSDL (`media_policies`), 4 transports độc lập theo spec 06, xoay vòng thế hệ kèm kiểm tra kết quả `deleteRoom` nghiêm ngặt |
| [ISSUE-026](../issues/ISSUE-026-media-ui.md) | **LOCAL_DONE** | PR #40 MERGED (`af30a2c`); cài đặt `livekit-client`, kết nối SFU qua SfuConnection, render luồng video/audio từ xa độc lập theo 3 mức chia sẻ camera/mic, giải phóng phần cứng khi tắt |
| [ISSUE-027](../issues/ISSUE-027-history-rematch.md) | **LOCAL_DONE** | PR #36 MERGED (`b110271`); xem lại ván đấu (Replay) chỉ đọc nhánh hiệu lực sau undo, tái đấu xóa `finished_at`, scheduler tự đóng phòng sau 10 phút |
| [ISSUE-028](../issues/ISSUE-028-responsive-polish.md) | **DONE** | PR #37 MERGED (`5fd9fff`); tokens gỗ truyền thống, Navbar toàn cục, 100% không tràn ngang 360px |
| [ISSUE-029](../issues/ISSUE-029-security-hardening.md) | **LOCAL_DONE** | PR #41 MERGED (`305797f`); siết chặt CORS allowlist theo `APP_ORIGIN`, CSP nghiêm ngặt, DoS limit 64KB, kiểm chứng deny matrix 21 kịch bản IDOR và đặc quyền khán giả (`tests/integration/authz.test.ts`) |
| [ISSUE-030](../issues/ISSUE-030-acceptance-load.md) | **LOCAL_DONE** | PR #42 MERGED (`3fa0906`); thử tải 10 phòng, 70 kết nối Socket.IO đồng thời, 10 nước đi đồng thời, 2 ván cờ AI: p95 latency đạt **67.64 ms** (< 100ms threshold), 92/92 tests E2E pass |
| [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md) | **LOCAL_DONE** | PR #43 MERGED (`18ac449`), PR #52 MERGED (`e75f995`); Dockerfile.server, render.yaml, vercel.json, báo cáo nghiệm thu staging `docs/test-reports/STAGING-ACCEPTANCE.md` |
| [ISSUE-032](../issues/ISSUE-032-final-handoff.md) | **LOCAL_DONE** | Hoàn thiện tài liệu bảo vệ đồ án (`DEFENSE.md`), báo cáo trạng thái khắc phục 30/30 findings (`REMEDIATION-STATUS.md`), báo cáo nghiệm thu trung thực |

---

## Thống Kê Chất Lượng & Bằng Chứng Toàn Bộ Dự Án (sau remediation, main `9cb7766`)

Bốn lane CI bắt buộc trên PR (đã xanh trên đúng HEAD SHA `9cb7766` qua [CI Run #34777360077](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077)) cùng lane tải thủ công và nghiệm thu UI:

### Bảng Đăng Ký Kiểm Thử Tự Động & Môi Trường

| Bộ kiểm thử | Lệnh thực thi (Command) | Commit SHA | Môi trường kiểm thử | Pass | Fail | Skipped | Link / File Bằng chứng |
|---|---|---|---|:---:|:---:|:---:|---|
| **Lane check (Unit)** | `pnpm run test:unit` | `9cb7766` | Ubuntu Linux (GitHub Actions), Node 24.15.0 | 298 | 0 | 0 | [CI Run #34777360077 (Job 103777808801)](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077) |
| **Lane integration** | `pnpm run test:integration` | `9cb7766` | Ubuntu Linux, PostgreSQL 17 + Supabase Auth local thật | 82 | 0 | 0 | [CI Run #34777360077 (Job 103777808673)](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077) |
| **Lane media** | `pnpm run test:media` | `9cb7766` | Ubuntu Linux, LiveKit SFU local container (RTP bytes/frames > 10KB) | 8 | 0 | 0 | [CI Run #34777360077 (Job 103777808875)](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077) |
| **Lane e2e** | `pnpm run test:e2e` | `9cb7766` | Ubuntu Linux, Playwright Chromium Desktop 1366px & Mobile 360px | 94 | 0 | 0 | [CI Run #34777360077 (Job 103777808805)](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077) |
| **AI Benchmark** | `pnpm run test:ai` | `8bfa200`, `d47e73e`, `e75f995` & `9cb7766` | macOS / Ubuntu, 20 thế cờ chuẩn hóa ROOK/PAWN | 20 | 0 | 0 | `docs/test-reports/ai/benchmark-results.json` (78.86% pruning, 20/20 scores match) |
| **Socket Load Test** | `pnpm run test:load` | `8bfa200`, `3d16a8a`, `e75f995` & `9cb7766` | Máy tham chiếu 8-core, 10 phòng / 70 socket đồng thời / 10 nước đi song song | 1 | 0 | 0 | `docs/test-reports/ISSUE-030.md` (p50 9.47ms, p95 67.64ms < 100ms) |
| **Nghiệm thu Browser UI (Orca)** | Orca CLI 1.3.1 | `aa20d4b` *(chính xác)* | macOS Darwin, 2 profile độc lập (`Default`, `Player 2`), web dev local port 5173, API port 3001 | 8 luồng | 0 | 0 (4 BLOCKED ngoại vi) | `docs/test-reports/ORCA-ACCEPTANCE.md` *(xác thực đúng trên HEAD `aa20d4b`, không ghi đè lên HEAD khác)* |
| **Typecheck** | `pnpm run typecheck` (`tsc -b`) | `9cb7766` | Toàn bộ 6 workspace packages | 0 err | 0 | 0 | Exit 0 |
| **Linter** | `pnpm run lint` (`eslint`) | `9cb7766` | Toàn bộ codebase | 0 err | 0 warn | 0 | Exit 0 |
| **Build** | `pnpm run build` | `9cb7766` | Toàn bộ 6 workspace packages | 6 pkgs | 0 | 0 | Exit 0 |

---

### Giải Thích Minh Bạch Chênh Lệch Số Lượng Test

- **Baseline cũ trước remediation ("196 unit tests / 84.51% pruning / p95 28.7ms / 5-5 SFU PASS"):** Từng được dùng để kết luận vội `PROJECT_COMPLETE`. Các số đó đã bị bác bỏ do F-10, F-12, F-13, F-15 và được thay thế bằng các bộ test thực tế với assertion nghiêm ngặt.
- **Báo cáo PR #48 (`8bfa200`, 491 tests):** gồm 301 unit + 90 integration + 8 media + 92 e2e.
- **Báo cáo PR #50 (`3d16a8a`), PR #51 (`d47e73e`), PR #52 (`e75f995`) & PR #54 (`9cb7766`, 482 CI tests):**
  - Unit: điều chỉnh glob loại trừ các test integration/media/load, còn 298 tests unit thuần túy.
  - Integration: tách socket-load sang manual workflow do runner CI 2-core bị nghẽn đo đạc p95 (còn 81 tests), sau đó bổ sung 1 regression test cho `joinRoom` push trong PR #54 (lên 82 tests).
  - Media: 8 tests SFU độc lập có kiểm chứng RTP bytes/frames.
  - E2E: tăng từ 92 lên 94 tests nhờ bổ sung kiểm chứng timeout và sức chứa khán giả.
  - Tổng số test trong 4 lane CI bắt buộc là **482 tests** (298 + 82 + 8 + 94), 100% PASS trên [CI Run #34777360077](https://github.com/twotnguyen/XIANGQI/actions/runs/34777360077).
- **Bằng chứng Orca:** Nghiệm thu bằng browser thật qua Orca CLI được chạy và xác nhận tại **HEAD `aa20d4b`** (sau PR #48 và PR #49) trong môi trường local stack, được ghi lại chi tiết trong `docs/test-reports/ORCA-ACCEPTANCE.md` và không bị ghi sai thành đã chạy lại trên các commit khác. Trạng thái dự án hiện tại duy trì chuẩn xác là **LOCAL_COMPLETE**.
