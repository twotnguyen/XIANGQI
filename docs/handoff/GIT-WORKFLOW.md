# Quy trình Git/GitHub tự động

**Ủy quyền của người dùng:** agent được tự tạo nhánh → commit → push → tạo PR → review → squash merge khi kiểm tra đạt. Áp dụng cho các issue và sửa lỗi/tài liệu thuộc dự án; không cần xin phép lại mỗi PR. Không bao gồm mua dịch vụ, đổi visibility repository, tắt branch protection hoặc bỏ qua kiểm tra bắt buộc.

Repository: `twotnguyen/XIANGQI`, nhánh tích hợp `main`. Đọc [START-HERE](START-HERE.md) và [PROGRESS](PROGRESS.md). Các issue hiện là file Markdown; số `ISSUE-007` không mặc định là GitHub issue `#7`.

## Nhánh và phạm vi

Mỗi issue một nhánh, một PR vào main. Tạo từ origin/main đã đồng bộ và chứa dependency đã merge. Không triển khai trực tiếp trên main. Không tạo nhánh tầng trên nhánh chưa merge trong workflow mặc định.

| Loại | Mẫu / ví dụ |
|---|---|
| Feature theo issue | `feat/issue-007-password-auth` |
| Sửa lỗi | `fix/issue-013-clock-expiry` |
| Tài liệu | `docs/git-workflow` hoặc `docs/issue-032-defense` |
| Công cụ/CI | `chore/issue-001-foundation` |
| Test bổ sung | `test/issue-030-reconnect` |

Tên lowercase ASCII, gạch nối, có ID issue nếu thuộc issue. Nhánh đã có thì đọc diff/PR và tiếp tục đúng công việc; không ghi đè hoặc tái sử dụng nhánh đã merge cho việc mới. Nhánh hotfix sau merge dùng slug mới, ví dụ `fix/issue-007-reset-expiry`.

## Bắt đầu

1. Kiểm tra status, branch, remote, gh auth và PR đang mở. Giữ nguyên thay đổi của người khác; worktree bẩn thì tiếp tục đúng issue đang dở hoặc dùng worktree riêng, không reset/clean/stash tự động.
2. `git fetch origin`; kiểm tra main và origin/main. Main chỉ dùng để fast-forward, không chứa commit triển khai riêng.
3. Nếu main chỉ behind và sạch, `git switch main` rồi `git merge --ff-only origin/main`; nếu main diverged, điều tra commit trước, không reset hay force push.
4. Tạo nhánh theo bảng; đánh dấu IN_PROGRESS và ghi tên nhánh vào PROGRESS. Dependency cần đủ gate kỹ thuật **và PR đã MERGED trên GitHub**; DONE trên nhánh chưa merge chưa đủ.

## Commit

Commit nhỏ theo mục tiêu, sau kiểm tra liên quan. Tên tiếng Anh ngắn theo:

```text
type(scope): imperative summary [ISSUE-NNN]
feat(auth): add username password login [ISSUE-007]
fix(match): preserve elapsed time after undo [ISSUE-014]
docs(workflow): define autonomous GitHub delivery
```

Types: feat, fix, docs, test, chore, refactor. Scope theo module, không dùng tên model. Không cần một commit cho mỗi file hoặc mỗi bước nhỏ; mỗi commit phải có ý nghĩa và không chứa thay đổi không liên quan. Stage đường dẫn rõ ràng, xem staged diff trước commit. Không commit secret, .env, node_modules, runtime state hoặc log chứa token. Không thêm `Co-Authored-By: Codex` hay co-author AI; giữ Git author người dùng đang cấu hình, không giả tác giả khác.

Nếu cần checkpoint dở dang, push nhánh/draft PR được phép nhưng ghi rõ chưa qua nghiệm thu; không merge. Sửa review bằng commit mới trên nhánh đã push, tránh rewrite/force push. Không dùng `--no-verify` để né hook lỗi.

## Trước mỗi push

Bắt buộc `git fetch origin`, kể cả push lần đầu. Kiểm tra origin/nhánh hiện tại có commit remote mà local thiếu hay không:

- Remote branch chưa tồn tại: push mới `git push -u origin TEN_NHANH`.
- Remote đã có: so `git rev-list --left-right --count HEAD...origin/TEN_NHANH`. Nếu remote có commit mới, tích hợp bằng merge; chạy lại kiểm tra phần bị ảnh hưởng rồi push bình thường.
- Nếu origin/main đã tiến: merge origin/main vào nhánh hiện tại trước final review/merge PR. Không rebase nhánh đã chia sẻ để tránh cần force push.
- Nếu merge báo conflict: **dừng ngay**, giữ trạng thái để người dùng quyết định, báo file xung đột và SHA/subject commit hai phía. Không tự sửa, chọn ours/theirs, abort/reset hoặc force push để vượt conflict.

Nếu push bị non-fast-forward do remote đổi sau fetch, fetch và kiểm tra lại theo cùng quy trình. Không force push lên main hay nhánh issue.

## Tạo PR

Push rồi tìm PR cho head branch; cập nhật PR hiện có thay vì tạo trùng. Base main, title cùng quy ước commit và issue ID. Body tiếng Việt hoặc Anh nhất quán, gồm:

1. Vấn đề và hành vi sau thay đổi.
2. Phạm vi/tệp chính, link tương đối tới file issue và spec/evidence có liên quan.
3. Lệnh kiểm thử, kết quả thật, môi trường; external/manual chưa chạy ghi riêng.
4. Kết quả review, rủi ro còn lại và mức hoàn thành kỹ thuật (DONE/LOCAL_DONE).

Viết body vào file UTF-8 tạm rồi dùng `gh pr create --body-file` / `gh pr edit --body-file`; giữ newline thật, không shell-interpolate nội dung. Không dùng `Closes #NNN` trừ khi đã xác minh đó là GitHub issue thật tương ứng. File issue và PROGRESS ghi branch + URL PR ngay khi có, cùng commit hoàn thiện trên chính nhánh đó.

## Review và gate merge

Review toàn diff so với base, đối chiếu yêu cầu/acceptance, contracts, migration, quyền, lỗi mạng và test liên quan. Có thể nhờ agent review độc lập; nếu không có thì tự review một lượt riêng sau implementation và ghi đúng là self-review. Không giả một GitHub approval: tác giả PR có thể không tự approve PR của mình.

Chỉ merge khi tất cả điều kiện sau đúng:

- Diff chỉ chứa phạm vi đã ủy quyền, không còn blocker correctness/security/data loss hoặc acceptance chưa đáp ứng của phần đang bàn giao.
- Test/lint/typecheck/build thích hợp đã pass cho head hiện tại. Thay đổi tài liệu thuần dùng `python3 docs/planning/validate_docs.py` và `git diff --check`; chưa có app thì không bịa kết quả pnpm/CI.
- Các GitHub checks liên quan và mọi required check đã thành công; pending thì chờ, failed/cancelled/skipped-required thì điều tra. Không có checks phải ghi “chưa cấu hình CI”, không gọi là CI pass. Sau ISSUE-001 phải kiểm CI workflow đã được tạo theo kế hoạch.
- Review không còn yêu cầu sửa chưa giải quyết; nếu repository yêu cầu approval ngoài và chưa có thì chờ reviewer, không dùng admin bypass hoặc tự tắt protection.
- Nhánh đã cập nhật origin/main, không conflict. Lấy lại PR head SHA, base SHA và trạng thái ngay trước merge; nếu đổi sau review thì cập nhật/review/test phần thay đổi.

LOCAL_DONE có thể merge khi implementation/local tests đủ và chỉ còn provider/manual gate đã liệt kê rõ; không được merge mã stub hoặc lỗi cần sửa dưới nhãn LOCAL_DONE. Các dependency consumer local được phép tiếp tục sau merge theo START-HERE; PROJECT_COMPLETE vẫn đợi các external gate.

Dùng squash merge, title chuẩn, body do agent viết rõ để không tự sinh co-author AI. Dùng `gh pr merge --squash --match-head-commit SHA` với subject/body-file đã kiểm tra. Không dùng `--admin`. Nếu có merge queue/auto-merge, trạng thái queued chưa phải MERGED; chờ và xác minh. Nếu main đổi đồng thời mà không có protection bắt outdated checks, kiểm tra merge commit và chạy lại kiểm tra phần tích hợp sau merge; báo/sửa bằng PR mới nếu phát hiện lỗi.

## Sau merge và tiến độ

Xác minh PR state MERGED, merge commit SHA và remote main. Fetch; main sạch thì fast-forward. Chạy kiểm tra thích hợp ở main đã đồng bộ. Xóa remote/local branch chỉ khi chắc nhánh thuộc agent, PR đã merge và không còn commit chưa bàn giao; khi worktree/worker khác còn dùng thì giữ lại.

**Trạng thái kỹ thuật** (TODO/IN_PROGRESS/LOCAL_DONE/DONE/BLOCKED_EXTERNAL) và **trạng thái tích hợp** là hai thứ khác nhau. Trước merge, file issue có thể DONE theo acceptance; PROGRESS ghi branch/PR và `Xem trạng thái PR trên GitHub`. Không ghi trước MERGED hoặc tự đoán SHA merge.

GitHub là nguồn trạng thái PR/merge chính thức. Task tiếp theo tra PR URL để biết đã tích hợp; khi có PR nghiệp vụ tiếp theo có thể cập nhật lại dòng tiến độ cũ thành MERGED + SHA đã xác minh. Không cần tạo vô hạn PR chỉ để ghi việc PR cập nhật trạng thái trước đó đã merge. PR cuối đã chứa evidence/URL; xác nhận final merge bằng GitHub và phản hồi bàn giao là đủ.

Nếu bị chặn, ghi bước tiếp theo, branch/PR/commit đã push và lý do. Tiếp tục issue độc lập không đụng file đang conflict nếu có thể; không tuyên bố toàn bộ xong khi PR bắt buộc chưa merge.
