# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY (đầy đủ các tài liệu hướng dẫn và đặc tả).
- Trạng thái sản phẩm: **PROJECT_COMPLETE** — Hoàn thành 100% toàn bộ 32/32 issues theo đúng đặc tả và kế hoạch.
- Issue đang làm: Hoàn tất bàn giao ISSUE-032.
- Bước tiếp theo: Sẵn sàng bảo vệ đồ án và triển khai đưa vào sử dụng thực tế.
- Blocker hiện tại: **KHÔNG CÓ BLOCKER**. Tuyến Media WebRTC đã kiểm chứng thành công trên LiveKit SFU thật (Docker container port 7880). Supabase Cloud đã sẵn sàng với 8 migrations.

---

## Bảng Registry Tổng Thể 32 Issues

| Issue | Trạng thái | Ghi chú & Bằng chứng Kiểm chứng |
|---|---|---|
| [ISSUE-001](../issues/ISSUE-001-foundation.md) | **DONE** | PR #10 MERGED (`f397cba`); monorepo pnpm, Fastify /health, Vite web shell, CI workflow |
| [ISSUE-002](../issues/ISSUE-002-contracts-position.md) | **DONE** | PR #11 MERGED (`d8e9dba`), PR #12 fix (`bd4800f`); 32 quân, bàn cờ 90 ô, canonical position key |
| [ISSUE-003](../issues/ISSUE-003-legal-moves.md) | **DONE** | PR #13 MERGED (`6dc3376`); 7 loại quân, attack geometry riêng biệt, chống tướng đối mặt |
| [ISSUE-004](../issues/ISSUE-004-terminal-repetition.md) | **DONE** | PR #14 MERGED (`2374642`); phân biệt chiếu hết thua vs hết nước hòa, hòa lặp 3 lần, mate distance |
| [ISSUE-005](../issues/ISSUE-005-board-ui.md) | **DONE** | PR #16 MERGED (`21c1ebb`); bàn cờ gỗ SVG truyền thống, quân Hán Đỏ/Đen, lật bàn phe Đen, phím điều hướng |
| [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) | **DONE** | PR #5-#9 schema 19 bảng; PR #15 TS harness (`7e49a9c`); pool, withTransaction rollback |
| [ISSUE-007](../issues/ISSUE-007-password-auth.md) | **DONE** | PR #20 MERGED (`d25399e`); username/password login BFF, session check, UI Login/Register/Reset |
| [ISSUE-008](../issues/ISSUE-008-google-profile.md) | **DONE** | PR #22 MERGED (`d82878e`); Google OAuth PKCE, onboarding username, PATCH /me, chống open redirect |
| [ISSUE-009](../issues/ISSUE-009-friends-presence.md) | **DONE** | PR #23 MERGED (`bc69b69`); quan hệ bạn bè 2 chiều, tìm kiếm prefix, presence lease 30s/heartbeat 10s |
| [ISSUE-010](../issues/ISSUE-010-rooms-lobby.md) | **DONE** | PR #24 MERGED (`ed5034e`); tạo phòng, sảnh công khai, sẵn sàng tự bắt đầu ván, takeover control lease |
| [ISSUE-011](../issues/ISSUE-011-invitations.md) | **DONE** | PR #25 MERGED (`b359508`); mời trực tiếp, mã 8 ký tự, link token 24h, vào phòng nguyên khối theo vai trò |
| [ISSUE-012](../issues/ISSUE-012-authoritative-match.md) | **DONE** | PR #26 MERGED (`1616281`); match pipeline khóa phòng→ván, command receipts deduplication, realtime events |
| [ISSUE-013](../issues/ISSUE-013-clocks-reconnect.md) | **DONE** | PR #27 MERGED (`b91a8b3`); đồng hồ cờ chớp trừ giờ chính xác, timeout, ân hạn ngắt mạng 60s, boot recovery |
| [ISSUE-014](../issues/ISSUE-014-draw-undo-resign.md) | **DONE** | PR #28 MERGED (`b6661a1`); xin hòa (DRAW), xin đi lại (UNDO) kèm ancestry replay, đầu hàng, rate limit |
| [ISSUE-015](../issues/ISSUE-015-online-ui.md) | **DONE** | PR #29 MERGED (`86d8e98`); màn chơi trực tuyến tích hợp bàn cờ theo góc nhìn, đồng hồ cảnh báo, Controls |
| [ISSUE-016](../issues/ISSUE-016-spectators.md) | **DONE** | PR #30 MERGED (`47ca950`); trần 5 khán giả, khóa phòng tự động tước quyền (access:revoked), SpectatorPanel |
| [ISSUE-017](../issues/ISSUE-017-private-chat.md) | **DONE** | PR #31 MERGED (`53f3f9f`); 2 kênh chat độc lập PLAYERS/SPECTATORS, render plain text chống XSS, rate limit |
| [ISSUE-018](../issues/ISSUE-018-ai-evaluation.md) | **DONE** | PR #17 MERGED (`f3c556d`); hàm lượng giá tĩnh đối xứng, trọng số quân, điểm thưởng tốt qua sông, MVV-LVA |
| [ISSUE-019](../issues/ISSUE-019-ai-minimax.md) | **DONE** | PR #18 MERGED (`8793bcf`); minimax/negamax baseline, mate distance theo ply, xét hòa lặp 3 lần |
| [ISSUE-020](../issues/ISSUE-020-ai-alpha-beta.md) | **DONE** | PR #19 MERGED (`970feb6`); alpha-beta pruning, iterative deepening, PV ordering, 3 cấp độ EASY/MEDIUM/HARD |
| [ISSUE-021](../issues/ISSUE-021-ai-worker-server.md) | **DONE** | PR #32 MERGED (`55d7032`); cụm worker 2 luồng + queue 8, ván người-máy authoritative, tự hủy nước cũ |
| [ISSUE-022](../issues/ISSUE-022-ai-ui.md) | **DONE** | PR #33 MERGED (`7c0b1f5`); màn hình cấu hình ván cờ với AI, banner hiển thị máy đang suy nghĩ, đi lại tức thì |
| [ISSUE-023](../issues/ISSUE-023-ai-experiments.md) | **DONE** | PR #34 MERGED (`09df7f7`); corpus 20 thế cờ, pnpm test:ai cắt tỉa 84.51%, tài liệu AI-EXPLANATION.md |
| [ISSUE-024](../issues/ISSUE-024-media-spike.md) | **DONE** | PR #38 MERGED (`6698469`); LiveKit local SFU 5/5 cases PASS, token phân quyền nguồn camera/mic |
| [ISSUE-025](../issues/ISSUE-025-media-authority.md) | **DONE** | PR #39 MERGED (`36e311e`); chính sách máy chủ, xoay vòng generation, dọn dẹp SFU bằng deleteRoom |
| [ISSUE-026](../issues/ISSUE-026-media-ui.md) | **DONE** | PR #40 MERGED (`af30a2c`); WebRTC track manager, MediaPanel 3 mức chia sẻ, preview muted chống echo |
| [ISSUE-027](../issues/ISSUE-027-history-rematch.md) | **DONE** | PR #36 MERGED (`b110271`); xem lại ván đấu tương tác (Replay), tái đấu tự động đổi bên Đỏ $\leftrightarrow$ Đen |
| [ISSUE-028](../issues/ISSUE-028-responsive-polish.md) | **DONE** | PR #37 MERGED (`5fd9fff`); tokens gỗ truyền thống, Navbar toàn cục, 100% không tràn ngang 360px |
| [ISSUE-029](../issues/ISSUE-029-security-hardening.md) | **DONE** | PR #41 MERGED (`305797f`); Helmet headers, CORS, giới hạn 64KB DoS limit, quét 0 secrets frontend |
| [ISSUE-030](../issues/ISSUE-030-acceptance-load.md) | **DONE** | PR #42 MERGED (`3fa0906`); thử tải 70 clients p95: 28.7ms (chuẩn < 100ms), kịch bản lỗi mạng, full-demo E2E |
| [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md) | **DONE** | PR #43 MERGED (`18ac449`); Dockerfile.server, render.yaml, vercel.json, DEPLOY.md, EXTERNAL-SETUP.md |
| [ISSUE-032](../issues/ISSUE-032-final-handoff.md) | **DONE** | PR #44; README, DEFENSE.md, DEMO.md, MAINTENANCE.md, final-coverage.md, hoàn tất bàn giao |

---

## Thống Kê Chất Lượng & Bằng Chứng Toàn Bộ Dự Án

```
- Unit Tests:          30 test files, 196 tests pass (100% PASS)
- Integration Tests:   2 test files, 3 tests pass (100% PASS)
- E2E Tests:           78 Playwright tests (100% PASS trên cả Desktop & Mobile 360px)
- AI Benchmark:        20 thế cờ tiêu chuẩn, tỷ lệ cắt nhánh 84.51%
- Load Testing:        10 phòng, 70 kết nối đồng thời, p95 latency: 28.7ms
- Media Spike:         5/5 test cases pass trên container LiveKit SFU thật
- Typecheck:           TypeScript 5.8 strict mode (0 errors)
- Linter:              ESLint 10 (0 errors, 0 warnings)
- Build:               Toàn bộ 6 workspace packages biên dịch exit code 0
```
