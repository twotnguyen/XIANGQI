# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY (đầy đủ các tài liệu hướng dẫn và đặc tả).
- Trạng thái sản phẩm: **LOCAL_COMPLETE** — 32/32 issue đạt tiêu chuẩn nghiệm thu local; 30/30 finding của đợt review `docs/reviews/AGENT-HANDOFF-REVIEW-20260913-1706.md` đã xử lý xong (28 `FIXED`, 2 ghi nhận tài liệu/ngữ nghĩa) và merge vào `main` qua **PR #48 (squash `8bfa200`)**, cùng PR #49 (`aa20d4b`, ghi merge SHA) và PR #50 (`3d16a8a`, lane tải thủ công + hardening E2E).
- Issue đang làm: Hoàn tất bàn giao; sẵn sàng kiểm chứng gate provider/thiết bị ngoài.
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
| [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md) | **LOCAL_DONE** | PR #43 MERGED (`18ac449`); Dockerfile.server, render.yaml, vercel.json, bổ sung CI workflow kiểm tra cả integration DB và live SFU media |
| [ISSUE-032](../issues/ISSUE-032-final-handoff.md) | **LOCAL_DONE** | Hoàn thiện tài liệu bảo vệ đồ án (`DEFENSE.md`), báo cáo trạng thái khắc phục 30/30 findings (`REMEDIATION-STATUS.md`), báo cáo nghiệm thu trung thực |

---

## Thống Kê Chất Lượng & Bằng Chứng Toàn Bộ Dự Án (sau remediation, main `3d16a8a`)

Bốn lane CI bắt buộc trên PR (đã xanh trên đúng HEAD SHA đã merge) cùng một lane tải thủ công:

```
- Lane check (build + typecheck + lint + unit):  32 file, 298 test pass (0 fail)
- Lane integration (Postgres + Supabase Auth local thật): 11 file, 81 test pass (0 fail, 0 skip)
- Lane media (LiveKit SFU thật, có positive control RTP bytes/frames): 8 test pass
- Lane e2e (Playwright, Chromium 1366px + Mobile 360px, stack thật): 94 test pass (0 fail)
- Lane load (workflow thủ công, ISSUE-030): máy tham chiếu 10 phòng / 70 socket đồng thời /
  10 nước đi song song → p50 9.47ms, p95 67.64ms (ngưỡng < 100ms), PASS.
  Runner GitHub 2 core đo p95 405ms — không phải tham chiếu năng lực, nên lane này
  tách khỏi PR gate và chạy bằng `workflow_dispatch`.
- AI Benchmark (pnpm test:ai): 20 thế cờ, cắt tỉa node-weighted 78.86%, 20/20 điểm trùng khớp
- Nghiệm thu UI bằng browser Orca (thật, 2 profile độc lập): docs/test-reports/ORCA-ACCEPTANCE.md
- Typecheck: TypeScript 5.8 strict, exit 0 (toàn workspace)
- Linter: ESLint 10, 0 error / 0 warning
- Build: 6 workspace package, exit 0
```

Ghi chú trung thực: baseline trước remediation ghi "196 unit tests / 84.51% pruning / p95 28.7ms / 5-5 SFU PASS" từng được dùng để kết luận `PROJECT_COMPLETE`; các số đó đã bị bác bỏ (F-13/F-15/F-10) và được thay bằng số đo ở trên. Số test tăng/giảm giữa các lane là do cách chia lane (unit không còn glob integration/media/load), không phải tiêu chí hoàn thành.
