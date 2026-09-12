# Tiến độ thực thi

- Trạng thái bộ tài liệu: PLAN_READY sau khi kiểm tra docs/READINESS.md.
- Trạng thái sản phẩm: LOCAL_DONE — schema CSDL 19 bảng và hardening toàn diện đã deploy, kiểm chứng hoàn tất.
- Issue đang làm: fix bổ sung ISSUE-006 đợt 4 (nhánh `fix/issue-006-harness-isolation`).
- Bước tiếp theo: Mở PR `fix/issue-006-harness-isolation`, review, squash merge và triển khai ISSUE-001/002.
- Blocker hiện tại của lập trình local: không có.
- External setup: Supabase project `snsnkoicxmubuotcdafi` (XIANGQI) sẵn sàng và đã đồng bộ 8 migration files.

## Registry

| Issue | Trạng thái | Evidence / bước tiếp theo |
|---|---|---|
| [ISSUE-001](../issues/ISSUE-001-foundation.md) | TODO | Chưa thực thi |
| [ISSUE-002](../issues/ISSUE-002-contracts-position.md) | TODO | Chưa thực thi |
| [ISSUE-003](../issues/ISSUE-003-legal-moves.md) | TODO | Chưa thực thi |
| [ISSUE-004](../issues/ISSUE-004-terminal-repetition.md) | TODO | Chưa thực thi |
| [ISSUE-005](../issues/ISSUE-005-board-ui.md) | TODO | Chưa thực thi |
| [ISSUE-006](../issues/ISSUE-006-database-test-harness.md) | LOCAL_DONE | PR #8 đã MERGED (`f24acb4`); nhánh fix `fix/issue-006-harness-isolation` cô lập libpq (`PGHOSTADDR`) và khôi phục regression tests (10 suites, 180+ assertions PASS); báo cáo `docs/test-reports/DATABASE-SETUP.md`; phần TS pool/harness hoàn thiện sau ISSUE-001/002 |
| [ISSUE-007](../issues/ISSUE-007-password-auth.md) | TODO | Chưa thực thi |
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
| [ISSUE-018](../issues/ISSUE-018-ai-evaluation.md) | TODO | Chưa thực thi |
| [ISSUE-019](../issues/ISSUE-019-ai-minimax.md) | TODO | Chưa thực thi |
| [ISSUE-020](../issues/ISSUE-020-ai-alpha-beta.md) | TODO | Chưa thực thi |
| [ISSUE-021](../issues/ISSUE-021-ai-worker-server.md) | TODO | Chưa thực thi |
| [ISSUE-022](../issues/ISSUE-022-ai-ui.md) | TODO | Chưa thực thi |
| [ISSUE-023](../issues/ISSUE-023-ai-experiments.md) | TODO | Chưa thực thi |
| [ISSUE-024](../issues/ISSUE-024-media-spike.md) | TODO | Chưa thực thi |
| [ISSUE-025](../issues/ISSUE-025-media-authority.md) | TODO | Chưa thực thi |
| [ISSUE-026](../issues/ISSUE-026-media-ui.md) | TODO | Chưa thực thi |
| [ISSUE-027](../issues/ISSUE-027-history-rematch.md) | TODO | Schema 2 bảng rematch đã tạo sớm ở ISSUE-006; logic/routes/UI giữ TODO |
| [ISSUE-028](../issues/ISSUE-028-responsive-polish.md) | TODO | Chưa thực thi |
| [ISSUE-029](../issues/ISSUE-029-security-hardening.md) | TODO | Chưa thực thi |
| [ISSUE-030](../issues/ISSUE-030-acceptance-load.md) | TODO | Chưa thực thi |
| [ISSUE-031](../issues/ISSUE-031-deploy-runbook.md) | TODO | Chưa thực thi |
| [ISSUE-032](../issues/ISSUE-032-final-handoff.md) | TODO | Chưa thực thi |

## Checkpoint khi dừng task

Cập nhật đoạn này với thông tin thật, không chỉ ghi “đang làm”.

- Code changes: `tests/integration/database_test.py` (cô lập libpq PGHOSTADDR, khôi phục regression tests same-cell move, hash length, status/outcome matrix, 10 suites, 180+ assertions), `docs/test-reports/DATABASE-SETUP.md`.
- Last command/test: `python3 tests/integration/database_test.py` (exit code 0, 10/10 suites pass, 180+ assertions).
- Next exact action: Mở PR nhánh `fix/issue-006-harness-isolation`, review, squash merge và đồng bộ `main`.
- External blocker: Không có. Project Supabase `snsnkoicxmubuotcdafi` sẵn sàng.

## Mẫu evidence

Mỗi docs/test-reports/ISSUE-NNN.md ghi: trạng thái, commit/diff, môi trường, thay đổi, lệnh/exit/count, acceptance case→test/artifact, limitation, next action. Nếu có manual/provider test chưa chạy phải chỉ rõ và giữ trạng thái phù hợp.

LOCAL_DONE cho phép tiến hành consumer local không phụ thuộc gate external còn thiếu; DONE yêu cầu mọi acceptance của issue, gồm provider/manual được giao. Registry hiện TODO toàn bộ.

## Theo dõi Git/GitHub

Người dùng đã ủy quyền vòng Git tự động theo [GIT-WORKFLOW](GIT-WORKFLOW.md). Registry issue phía trên là trạng thái kỹ thuật; mỗi issue khi bắt đầu thêm branch/PR/evidence vào cột cuối. Consumer chỉ bắt đầu khi PR dependency trên GitHub đã MERGED và gate kỹ thuật phù hợp. Không giả định DONE nghĩa đã merge.

Lịch sử chuẩn bị: [PR #1](https://github.com/twotnguyen/XIANGQI/pull/1) đã MERGED, commit `e211bbae`; bổ sung workflow Git/GitHub. Chưa triển khai issue ứng dụng nào.

Bảo trì repository: nhánh `chore/repository-hygiene`, bổ sung ignore metadata/cache/build/test output/local state và gate review file staged. PR: [#2](https://github.com/twotnguyen/XIANGQI/pull/2); chưa triển khai issue ứng dụng. Kiểm chứng local: 83 path cases đạt, không có file tracked bị ignore, không có historical blob trên5MiB.

Rà soát sẵn sàng bàn giao: nhánh `docs/implementation-readiness`, [PR #3](https://github.com/twotnguyen/XIANGQI/pull/3). Bổ sung ma trận test đủ32 issue, harness/CI ownership, mẫu evidence, prompt và sửa các seam hợp đồng qua review. PR #2 đã MERGED tại `81374ee`. Sản phẩm vẫn NOT_STARTED; agent code bắt đầu001, trạng thái tích hợp PR #3 tra trên GitHub.

Thiết kế CSDL: nhánh `docs/database-design`, [PR #4](https://github.com/twotnguyen/XIANGQI/pull/4), nguồn schema [09-DATABASE-DESIGN](../specs/09-DATABASE-DESIGN.md). Có19bảng, ERD, khóa/index/RLS/retention,19case DB và nghiên cứu nguồn chính thức. Review sửa recovery job RUNNING, tên trường clock và profile grant. Chỉ tài liệu, chưa tạo project/migration hay thay đổi Supabase. PR #3 đã MERGED tại `221fdd8`; trạng thái tích hợp PR #4 tra GitHub. Issue ứng dụng vẫn TODO.
