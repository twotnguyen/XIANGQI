# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY sau khi kiểm tra docs/READINESS.md.
- Trạng thái sản phẩm: IN_PROGRESS — 9 issues hoàn tất (001, 002, 003, 004, 005, 006, 007, 018, 019, 020). 121 unit tests, 20 E2E tests pass.
- Issue đang làm: Chuẩn bị ISSUE-008 (Google OAuth & onboarding) hoặc ISSUE-009 (Friends & presence).
- Bước tiếp theo: Triển khai ISSUE-008 hoặc ISSUE-009.
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
| [ISSUE-008](../issues/ISSUE-008-google-profile.md) | TODO | Chưa thực thi |
| [ISSUE-009](../issues/ISSUE-009-friends-presence.md) | TODO | Chưa thực thi |
| [ISSUE-010](../issues/ISSUE-010-rooms-lobby.md) | TODO | Chưa thực thi |
| [ISSUE-011](../issues/ISSUE-011-invitations.md) | TODO | Chưa thực thi |
| [ISSUE-012](../issues/ISSUE-012-authoritative-match.md) | TODO | Chưa thực thi |
| [ISSUE-013](../issues/ISSUE-013-clocks-reconnect.md) | TODO | Chưa thực thi |
| [ISSUE-014](../issues/ISSUE-014-draw-undo-resign.md) | TODO | Chưa thực thi |
| [ISSUE-015](../issues/ISSUE-015-online-ui.md) | TODO | Chưa thực thi |
| [ISSUE-016](../issues/ISSUE-016-spectators.md) | TODO | Chưa thực thi |
| [ISSUE-017](../issues/ISSUE-017-private-chat.md) | TODO | Chưa thực thi |
| [ISSUE-018](../issues/ISSUE-018-ai-evaluation.md) | DONE | PR [#17](https://github.com/twotnguyen/XIANGQI/pull/17) MERGED (`f3c556d`); hàm lượng giá tĩnh, trọng số vật chất, tốt qua sông, MVV-LVA move ordering, 12 tests |
| [ISSUE-019](../issues/ISSUE-019-ai-minimax.md) | DONE | PR [#18](https://github.com/twotnguyen/XIANGQI/pull/18) MERGED (`8793bcf`); minimax/negamax baseline, mate distance theo ply, xét hòa lặp 3 lần, 9 tests |
| [ISSUE-020](../issues/ISSUE-020-ai-alpha-beta.md) | DONE | PR [#19](https://github.com/twotnguyen/XIANGQI/pull/19) MERGED (`970feb6`); alpha-beta pruning, iterative deepening, PV ordering, 3 cấp độ EASY/MEDIUM/HARD, 9 tests |
| [ISSUE-021](../issues/ISSUE-021-ai-worker-server.md) | TODO | Phụ thuộc 013, 014, 020 |
| [ISSUE-022](../issues/ISSUE-022-ai-ui.md) | TODO | Phụ thuộc 015, 021 |
| [ISSUE-023](../issues/ISSUE-023-ai-experiments.md) | TODO | Phụ thuộc 020, 021, 022 |
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

- Code changes: Hoàn tất 9 issues (001, 002, 003, 004, 005, 006, 007, 018, 019, 020).
- Last command/test: `pnpm test:unit` (13 files, 121 tests pass), `pnpm test:e2e` (20 tests pass), `pnpm build` (exit 0), `pnpm typecheck` (exit 0), `pnpm lint` (exit 0).
- Next exact action: Triển khai ISSUE-008 (Google PKCE & Onboarding) hoặc ISSUE-009 (Friends & Presence).
- External blocker: ISSUE-024 cần Docker daemon chạy trên máy. Supabase project `snsnkoicxmubuotcdafi` sẵn sàng.
