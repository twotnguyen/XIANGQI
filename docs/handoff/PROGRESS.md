# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY sau khi kiểm tra docs/READINESS.md.
- Trạng thái sản phẩm: IN_PROGRESS — 16 issues cốt lõi hoàn tất (001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023). 180 unit tests, 54 E2E tests, 20 benchmark tests pass.
- Issue đang làm: Chuẩn bị ISSUE-027 (Lịch sử ván đấu & đấu lại) hoặc ISSUE-028 (Hoàn thiện giao diện responsive).
- Bước tiếp theo: Triển khai ISSUE-027 (History & Rematch) hoặc xử lý Media khi Docker khả dụng.
- Blocker hiện tại của lập trình local: ISSUE-024 (Media spike) BLOCKED_EXTERNAL do Docker daemon chưa chạy trên máy; các issue độc lập khác tiếp tục bình thường.
- External setup: Supabase project `snsnkoicxmubuotcdafi` (XIANGQI) sẵn sàng và đã đồng bộ 8 migration files.

## Registry

| Issue | Trạng thái | Evidence / bước tiếp theo |
|---|---|---|
| [ISSUE-001](../issues/ISSUE-001-foundation.md) | DONE | PR [#10](https://github.com/twotnguyen/XIANGQI/pull/10) MERGED (`f397cba`); evidence `docs/test-reports/ISSUE-001.md`; 4 tests, build/lint/typecheck/CI pass |
| [ISSUE-002](../issues/ISSUE-002-contracts-position.md) | DONE | PR [#11](https://github.com/twotnguyen/XIANGQI/pull/11) MERGED (`d8e9dba`), fix PR [#12](https://github.com/twotnguyen/XIANGQI/pull/12) MERGED (`bd4800f`); evidence `docs/test-reports/ISSUE-002.md`; 32 tests, lint/typecheck/build/CI pass |
| [ISSUE-003](../issues/ISSUE-003-legal-moves.md) | DONE | PR [#13](https://github.com/twotnguyen/XIANGQI/pull/13) MERGED (`6dc3376`); 27 tests cho 7 loại quân, attack geometry, an toàn tướng, đối mặt |
| [ISSUE-004](../issues/ISSUE-004-terminal-repetition.md) | DONE | PR [#14](https://github.com/twotnguyen/XIANGQI/pull/14) MERGED (`2374642`); 12 tests chiếu hết, hết nước thua, lặp 3 lần hòa, mate distance |
| [ISSUE-005](../issues/ISSUE-005-board-ui.md) | DONE | PR [#16](https://github.com/twotnguyen/XIANGQI/pull/16) MERGED (`21c1ebb`); bàn gỗ SVG, quân Hán, tọa độ view↔canonical, 9 unit + 12 E2E tests (desktop + mobile 360px) |
| [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) | DONE | Schema: PR [#5](https://github.com/twotnguyen/XIANGQI/pull/5)-[#9](https://github.com/twotnguyen/XIANGQI/pull/9) MERGED (19 bảng, 8 migrations, 10 suites 180+ assertions PASS); TS harness: PR [#15](https://github.com/twotnguyen/XIANGQI/pull/15) MERGED (`7e49a9c`, pool, withTransaction, 6 unit tests) |
| [ISSUE-007](../issues/ISSUE-007-password-auth.md) | DONE | PR [#20](https://github.com/twotnguyen/XIANGQI/pull/20) MERGED (`d25399e`); username login BFF, session check, complete-profile, UI Login/Register/Callback/Reset, 5 unit + 8 E2E tests |
| [ISSUE-008](../issues/ISSUE-008-google-profile.md) | DONE | PR [#22](https://github.com/twotnguyen/XIANGQI/pull/22) MERGED (`d82878e`); Google OAuth PKCE, onboarding chọn username, PATCH /me, chống open redirect, runbook GOOGLE-SETUP.md |
| [ISSUE-009](../issues/ISSUE-009-friends-presence.md) | DONE | PR [#23](https://github.com/twotnguyen/XIANGQI/pull/23) MERGED (`bc69b69`); quan hệ bạn bè 2 chiều, tìm kiếm prefix, presence lease 30s / heartbeat 10s, UI Friends |
| [ISSUE-010](../issues/ISSUE-010-rooms-lobby.md) | DONE | PR [#24](https://github.com/twotnguyen/XIANGQI/pull/24) MERGED (`ed5034e`); tạo phòng, sảnh công khai, sẵn sàng tự bắt đầu ván, takeover lease, UI Lobby và RoomWaiting |
| [ISSUE-011](../issues/ISSUE-011-invitations.md) | DONE | PR [#25](https://github.com/twotnguyen/XIANGQI/pull/25) MERGED (`b359508`); mời trực tiếp (10m), mã 8 ký tự, link token (24h), vào phòng nguyên khối theo vai trò, InvitePanel UI |
| [ISSUE-012](../issues/ISSUE-012-authoritative-match.md) | DONE | PR [#26](https://github.com/twotnguyen/XIANGQI/pull/26) MERGED (`1616281`); match pipeline: khóa phòng→ván, lọc trùng command receipts, moves history, realtime event broadcaster |
| [ISSUE-013](../issues/ISSUE-013-clocks-reconnect.md) | DONE | PR [#27](https://github.com/twotnguyen/XIANGQI/pull/27) MERGED (`b91a8b3`); đồng hồ thi đấu trừ giờ theo lượt, phát hiện TIMEOUT, ân hạn ngắt mạng 60s, phục hồi boot recovery SERVER_RESTART |
| [ISSUE-014](../issues/ISSUE-014-draw-undo-resign.md) | DONE | PR [#28](https://github.com/twotnguyen/XIANGQI/pull/28) MERGED (`b6661a1`); xin hòa (DRAW), xin đi lại (UNDO) kèm ancestry replay, đầu hàng (RESIGN), hạn chế tần suất đề nghị |
| [ISSUE-015](../issues/ISSUE-015-online-ui.md) | DONE | PR [#29](https://github.com/twotnguyen/XIANGQI/pull/29) MERGED (`86d8e98`); màn chơi trực tuyến tích hợp bàn cờ theo góc nhìn người chơi, đồng hồ đếm ngược, Controls, hook useMatch sync |
| [ISSUE-016](../issues/ISSUE-016-spectators.md) | DONE | PR [#30](https://github.com/twotnguyen/XIANGQI/pull/30) MERGED (`47ca950`); giới hạn 5 người xem mỗi phòng, khóa phòng tự động tước quyền người xem (access:revoked), SpectatorPanel UI |
| [ISSUE-017](../issues/ISSUE-017-private-chat.md) | DONE | PR [#31](https://github.com/twotnguyen/XIANGQI/pull/31) MERGED (`53f3f9f`); 2 kênh chat độc lập PLAYERS và SPECTATORS suy ra từ vai trò, render plain text chống XSS, rate limit 5 tin/10s |
| [ISSUE-018](../issues/ISSUE-018-ai-evaluation.md) | DONE | PR [#17](https://github.com/twotnguyen/XIANGQI/pull/17) MERGED (`f3c556d`); hàm lượng giá tĩnh đối xứng, trọng số quân, điểm thưởng tốt qua sông, MVV-LVA move ordering, 12 tests |
| [ISSUE-019](../issues/ISSUE-019-ai-minimax.md) | DONE | PR [#18](https://github.com/twotnguyen/XIANGQI/pull/18) MERGED (`8793bcf`); minimax/negamax baseline, mate distance theo ply, xét hòa lặp 3 lần, 9 tests |
| [ISSUE-020](../issues/ISSUE-020-ai-alpha-beta.md) | DONE | PR [#19](https://github.com/twotnguyen/XIANGQI/pull/19) MERGED (`970feb6`); alpha-beta pruning, iterative deepening, PV ordering, 3 cấp độ EASY/MEDIUM/HARD, 9 tests |
| [ISSUE-021](../issues/ISSUE-021-ai-worker-server.md) | DONE | PR [#32](https://github.com/twotnguyen/XIANGQI/pull/32) MERGED (`55d7032`); supervisor 2 workers + 8 queue slots, đặt chỗ dung lượng, ván người-máy authoritative, tự hủy nước cũ (stale discard) |
| [ISSUE-022](../issues/ISSUE-022-ai-ui.md) | DONE | PR [#33](https://github.com/twotnguyen/XIANGQI/pull/33) MERGED (`7c0b1f5`); màn hình cấu hình ván cờ với máy, banner hiển thị trạng thái AI đang tính toán, nút đi lại tức thì không cần duyệt |
| [ISSUE-023](../issues/ISSUE-023-ai-experiments.md) | DONE | PR [#34](https://github.com/twotnguyen/XIANGQI/pull/34) MERGED (`09df7f7`); corpus 20 thế cờ, đo lường benchmark cắt tỉa 84.51%, tài liệu kiến trúc AI-EXPLANATION.md, script pnpm test:ai |
| [ISSUE-024](../issues/ISSUE-024-media-spike.md) | BLOCKED_EXTERNAL | Docker daemon chưa chạy trên host macOS; cần Docker để chạy LiveKit SFU local; không chặn các issue độc lập |
| [ISSUE-025](../issues/ISSUE-025-media-authority.md) | TODO | Phụ thuộc 008, 016, 024 |
| [ISSUE-026](../issues/ISSUE-026-media-ui.md) | TODO | Phụ thuộc 015, 017, 025 |
| [ISSUE-027](../issues/ISSUE-027-history-rematch.md) | TODO | Schema 2 bảng rematch đã tạo sớm ở ISSUE-006; logic/routes/UI giữ TODO |
| [ISSUE-028](../issues/ISSUE-028-responsive-polish.md) | TODO | Chưa thực thi |
| [ISSUE-029](../issues/ISSUE-029-security-hardening.md) | TODO | Chưa thực thi |
| [ISSUE-030](../issues/ISSUE-030-acceptance-load.md) | TODO | Chưa thực thi |
| [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md) | TODO | Chưa thực thi |
| [ISSUE-032](../issues/ISSUE-032-final-handoff.md) | TODO | Chưa thực thi |

## Checkpoint khi dừng task

- Code changes: Hoàn tất 22 issues (001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023).
- Last command/test: `pnpm test:ai` (20 positions tested, 84.51% pruning reduction), `pnpm test:unit` (26 files, 180 tests pass), `pnpm test:e2e` (54 tests pass), `pnpm build` (exit 0), `pnpm typecheck` (exit 0), `pnpm lint` (exit 0).
- Next exact action: Triển khai ISSUE-027 (History & Rematch) hoặc hoàn thiện Responsive Polish (ISSUE-028).
- External blocker: ISSUE-024 cần Docker daemon chạy trên máy để chạy container LiveKit SFU. Supabase project `snsnkoicxmubuotcdafi` sẵn sàng.
