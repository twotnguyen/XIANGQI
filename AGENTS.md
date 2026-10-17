# Hướng dẫn agent — XIANGQI

Đọc file này trước khi làm việc trong repo. Chỉ dẫn cụ thể của người dùng trong phiên làm việc được ưu tiên. Trả lời bằng tiếng Việt, nêu thay đổi, kiểm tra đã chạy và giới hạn còn lại.

Monorepo pnpm (`pnpm@10.34.6`, `node >=22.13 <23`, `.node-version` là nguồn cho CI): `apps/web` (React + Vite, 5173) + `apps/server` (NestJS + Socket.IO, cổng `PORT` mặc định 3000, `GET /health`), `packages/xiangqi-core/engine/shared`, `supabase/`, `tests/`. Không thêm dependency/abstraction/cấu hình nếu chưa được giao; xóa hơn thêm.

## Bắt đầu phiên làm việc

1. Đọc yêu cầu, kiểm tra nhánh và `git status`; giữ nguyên thay đổi chưa commit của người dùng. Phân biệt tác vụ chỉ commit/push với triển khai, tài liệu, cấu hình hoặc đồng bộ Jira.
2. Với tác vụ chỉ commit/push, áp dụng quy trình nhanh bên dưới; không mở rộng thành triển khai hoặc kiểm tra dịch vụ.
3. Với công việc triển khai/tài liệu/cấu hình, đọc tài liệu theo phạm vi trong bảng dưới. Xác nhận mã issue thật trước khi đặt tên nhánh/commit theo Jira; không suy ra `T01` là `XIAN-1`.
4. Kiểm tra khả năng kết nối MCP Supabase và Atlassian/Jira theo mục kế tiếp khi công việc cần; chỉ sửa file thì kiểm tra sự sẵn có của connector là đủ. Không coi tên plugin là kết nối thành công.
5. Kiểm thử trong lúc triển khai theo phạm vi bị ảnh hưởng; không chạy lại kết quả còn hiệu lực nếu mã, dependency và cấu hình liên quan không đổi. Khi bàn giao/push, nêu đúng kiểm tra đã chạy.

| Khi làm việc với                    | Đọc trước                                                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Nghiệp vụ và phạm vi                | [BA-SCOPE-DECISIONS.md](docs/product/BA-SCOPE-DECISIONS.md), ưu tiên Phần 0                                                        |
| Tính năng, test, nghiệm thu         | [BACKLOG-P1.md](docs/product/BACKLOG-P1.md), AC/TC của Story và Description của Task                                               |
| Giao diện                           | [DANH-MUC-MAN-HINH-XIANGQI.md](docs/design/DANH-MUC-MAN-HINH-XIANGQI.md), [DESIGN.md](docs/design/DESIGN.md); mockup chỉ tham khảo |
| Jira, lịch và phân công             | [KE-HOACH-JIRA.md](docs/planning/KE-HOACH-JIRA.md), [docs/planning/jira/README.md](docs/planning/jira/README.md)                   |
| Biến môi trường, xác thực, database | [CAU-HINH-MOI-TRUONG.md](docs/setup/CAU-HINH-MOI-TRUONG.md), [.env.example](.env.example)                                          |
| Camera/mic và Docker                | BA 0.16 và [infra/livekit/README.md](infra/livekit/README.md)                                                                      |

Nguồn nghiệp vụ khi mâu thuẫn: BA Phần 0 → phần BA còn lại → BACKLOG-P1 → danh mục màn hình → DESIGN → mockup. Jira live là nguồn tiến độ khi đã truy vấn thành công; snapshot trong repo là dữ liệu có thời điểm, không phải xác nhận trạng thái hiện tại. Báo mâu thuẫn ảnh hưởng công việc, không tự thay quyết định BA.

## Monorepo và mã dùng chung

- `apps/*` phụ thuộc `packages/*` qua `workspace:*`; mã nguồn import bằng đường tương đối. Alias `@server/@web/@core/@engine/@shared` chỉ có hiệu lực trong `tests/` (cấu hình ở `vitest.config.ts`, `tests/tsconfig.json`).
- Ba package dùng chung cho cả hai đầu (`shared`: filter/validation; `xiangqi-core` + `engine`: luật cờ và tìm nước đi, chạy cả ở web worker lẫn server): một thay đổi luật/kiểm tra phải sửa cả hai đầu dùng trong cùng một PR. Không copy logic sang chỗ mới khi package đã có.
- `tests/` phản chiếu đúng cây `apps/` (ví dụ `apps/server/src/game/room/room-store.ts` ↔ `tests/server/game/room/room.test.ts`). Quy ước tên: `x.test.ts`, `x.test-helper.ts`, `x.test-cases.ts`, `fixtures.ts`. Chi tiết xem [tests/README.md](tests/README.md).

## Kiểm tra và kỷ luật chạy test (Test Scoping Rules)

### Chỉ commit/push — trả kết quả ngay

- Kiểm tra nhanh nhánh, phạm vi diff, `git diff --check` và bí mật trong staged; stage rõ từng file rồi commit/push theo yêu cầu.
- Không tự chạy lint/typecheck/test/build, review sâu, kiểm tra MCP, tạo PR, merge hoặc sửa code ngoài phạm vi trong tác vụ chỉ commit/push. Nếu phát hiện rõ secret hay nguy cơ mất dữ liệu, chặn đúng vấn đề đó; không bỏ qua để push nhanh.
- Sau commit/push/merge thành công, trả mã commit và nhánh ngay. CI chạy nền; không dùng `--watch`, polling hoặc chờ CI, kể cả merge `main`, trừ khi người dùng yêu cầu rõ phải đợi kiểm tra.
- Commit/push/merge thành công không đồng nghĩa build/test đạt. Không báo CI thành công khi chưa có kết quả.
- Merge `main` chỉ khi được yêu cầu riêng hoặc được nêu cùng yêu cầu commit/push; thực hiện ngay nếu GitHub cho phép, không chạy lại suite local hay đợi CI. Nếu GitHub chặn bằng kiểm tra bắt buộc/bảo vệ nhánh, báo ngay lý do; không tự chờ, dùng quyền bypass hoặc sửa bảo vệ để vượt chặn.
- Các cấp kiểm thử và bảng bên dưới áp dụng khi **triển khai thay đổi**, không phải điều kiện để lặp lại kiểm tra trong tác vụ chỉ commit/push.

**Ưu tiên vòng lặp code → commit → push nhanh:** Không tự chạy `pnpm test`, `pnpm test:unit`, `pnpm test:core` hoặc toàn bộ `vitest run tests/server` ở local cho mỗi thay đổi. Chỉ chạy file test hoặc smoke trực tiếp chứng minh phần vừa sửa; chỉ mở rộng khi có phụ thuộc bị ảnh hưởng hoặc người dùng yêu cầu. Toàn bộ suite thuộc cổng CI `main`, không phải cổng commit/push.

1. **Cấp 1 — Sửa một phần mã:**
   Chạy file test trực tiếp liên quan hoặc smoke đường chạy vừa thay đổi:
   `pnpm exec vitest run <đường-dẫn-file-test>`
   _Ví dụ:_ `pnpm exec vitest run tests/web/features/auth/LoginPage.test.ts` hoặc `pnpm exec vitest run tests/packages/xiangqi-core/legal.test.ts`.

2. **Cấp 2 — Hoàn thành tính năng UI / Logic dùng chung:**
   Chọn các file test bị ảnh hưởng và smoke thực tế; không mặc định quét cả web/packages. Chạy lint/typecheck khi cần xác minh thay đổi, không lặp lại chỉ để commit/push.

3. **Cấp 3 — Logic Backend / Database:**
   Nếu cần SQL thật, dùng `./tests/server/db.sh test <file-test-liên-quan>`, sau đó `./tests/server/db.sh stop`. Chỉ mở rộng sang thư mục khi thay đổi thật sự ảnh hưởng cả nhóm; các lệnh nhóm dưới đây là tham khảo, không tự chạy tất cả:
   - **Yêu cầu 1 (Tài khoản, Đăng nhập, Session, Google, Guest):**
     `./tests/server/db.sh test tests/server/account`
   - **Yêu cầu 2 & 3 (Tạo phòng, Sảnh chờ, Mã mời, Ghép phòng):**
     `./tests/server/db.sh test tests/server/game/room`
   - **Yêu cầu 4 & 5 (Trận đấu, Luật cờ, Đồng hồ thi đấu):**
     `./tests/server/db.sh test tests/server/game/match tests/server/game/clock`
   - **Yêu cầu 6 (Chế độ phòng, Khán giả, Đồng bộ Realtime):**
     `./tests/server/db.sh test tests/server/game/realtime`
   - **Yêu cầu 7 (Chat 2 kênh & Media WebRTC):**
     `./tests/server/db.sh test tests/server/game/chat tests/server/game/media`
   - **Yêu cầu 8 (Chơi với máy AI):**
     `./tests/server/db.sh test tests/server/game/ai`

4. **Cấp 4 — Khi chuẩn bị Release / Merge PR vào `main`:**
   CI của PR/push `main` tự chạy kiểm tra toàn diện ở nền; đây không phải yêu cầu agent ngồi chờ trước khi merge. Không mặc định chạy lại toàn bộ suite local. Chỉ đợi khi người dùng yêu cầu rõ; nếu GitHub bắt buộc chặn merge thì báo ngay, không bypass.

CI (`.github/workflows/ci.yml`) có hai luồng: push/PR `develop` chỉ lint/typecheck và build ứng dụng bị ảnh hưởng, không chạy các bộ unit/core/database; PR/push `main` chạy đầy đủ, core có coverage và được loại khỏi lượt unit để không trùng. Package dùng chung kích hoạt build cả hai ứng dụng. Không đọc được diff hoặc gặp đường dẫn chưa phân loại thì build cả hai, nhưng không tự bật test nặng trên `develop`. Chi tiết tại [tests/README.md](tests/README.md).

| Thay đổi         | Kiểm tra khi triển khai (không chạy lại chỉ để commit/push)                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Markdown/mẫu env | Liên kết tương đối, tên biến/biến tùy chọn, `git diff --check`, scan bí mật trong staged                                  |
| Kế hoạch Jira    | `python3 docs/planning/jira/tools/build_plan.py --check` và `python3 -m unittest discover -s docs/planning/jira/tests -v` |
| LiveKit Docker   | `docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml config --quiet`                        |
| Mã giao diện Web | File test liên quan và smoke giao diện; lint/typecheck khi cần xác minh                                                 |
| Mã logic chung   | File test trực tiếp bị ảnh hưởng, gồm caller web/server liên quan; không tự chạy cả suite                                |
| Mã Server / DB   | File test/smoke liên quan; nếu cần SQL thật, `./tests/server/db.sh test <file-test>` rồi `./tests/server/db.sh stop`        |

## Kiểm tra MCP và dịch vụ

MCP được cài và cấp quyền trong môi trường agent, không được cấu hình chỉ bằng `.env` của ứng dụng. Không lưu token MCP vào repo. Khám phá công cụ thực sự có sẵn; không giả định tên tool hoặc tự cài connector.

- **Atlassian/Jira:** dùng thao tác chỉ đọc để xác nhận site `xiangqi-web.atlassian.net`, project `XIAN`, board `38`, rồi đọc issue liên quan (ví dụ T01 là `XIAN-37`, T06 là `XIAN-42`). Đối chiếu summary, Description, AC, assignee, Sprint, phụ thuộc và trạng thái trước khi triển khai hoặc đồng bộ. Chỉ báo MCP Jira hoạt động khi có phản hồi thành công từ đúng site/project.
- **Supabase:** xác nhận project ref `snsnkoicxmubuotcdafi` thuộc XIANGQI bằng công cụ đọc thông tin project. Khi Task liên quan database, đọc schema/migration cần thiết; nếu cần kiểm kết nối SQL, dùng truy vấn chỉ đọc như `SELECT 1`. Ghi riêng khả năng truy cập thông tin project và khả năng truy vấn database; thành công ở một phần không chứng minh phần còn lại.
- **Thiếu MCP hoặc hết quyền:** báo chính xác dịch vụ nào không truy cập được. Có thể dùng Computer trên dashboard đã đăng nhập hoặc công cụ/API được người dùng cho phép; ghi rõ đây là phương án thay thế, không gọi là đã kết nối MCP. Không dùng token không rõ nguồn hoặc bỏ qua xác thực.
- **Công việc chỉ sửa file:** kiểm tra sự sẵn có của connector là đủ; không cần đọc dữ liệu người dùng hay truy vấn database không liên quan. Nếu dịch vụ không có, tiếp tục phần độc lập dựa trên tài liệu và nói rõ chưa xác minh live.
- Kiểm tra kết nối chỉ đọc không cấp quyền sửa schema, chạy migration, thay Auth/RLS, cập nhật issue hoặc gửi email. Các thao tác đó phải thuộc yêu cầu hiện hành. Không chạy migration hay ghi dữ liệu để thử kết nối.

## Jira và kế hoạch

- Giữ ranh giới BA/triển khai: Epic/Story Done là đặc tả đã chốt; Task Done cần bằng chứng triển khai và kiểm thử. Không chuyển trạng thái hàng loạt theo trạng thái cha.
- Khi được giao sửa lịch, giữ cơ sở 880 giờ, hạn 04/11/2026, tối đa 7 Task/ngày và 1 Task/người/ngày. Phụ thuộc đầu-cuối phải bắt đầu từ ngày sau khi Task trước kết thúc; thứ tự bắt đầu Epic → Story → Task. Thay đổi cơ sở cần quyết định rõ của người dùng.
- Chỉ cập nhật Jira khi thuộc phạm vi yêu cầu. Không tự bắt đầu/kết thúc Sprint, chuyển issue Done, sửa Resolution hoặc thay ước lượng vì đã sửa tài liệu hay tạo commit. Mặc định giữ Sprint chưa bắt đầu cho đến khi có yêu cầu mới.
- Trước khi cập nhật issue, đọc lại dữ liệu live để tránh ghi đè công việc của người khác. Trường Sprint là nguồn chính, nhãn `sprint-*` phải khớp; liên kết Story–Task có thể là `relates to`, không giả định Task là con trực tiếp của Story.
- Đồng bộ kế hoạch theo [docs/planning/jira/README.md](docs/planning/jira/README.md): cập nhật nguồn phù hợp, sinh lại báo cáo rồi kiểm tra. Script đọc snapshot không tự lấy Jira live. Không nhập lại CSV đối chiếu để tạo backlog trùng.

## Git, commit và pull request

- `main` là nhánh mặc định; `develop` là nhánh tích hợp. Đây là hai nhánh lâu dài. Không bật lại bảo vệ nhánh, bắt buộc Approve/CI hay đổi nhánh mặc định trong công việc thông thường.
- Khi cần nhánh riêng cho Task, tạo nhánh Task ngắn hạn từ `develop` đã cập nhật: `<type>/XIAN-<số>-<mô-tả-ngắn>`, ví dụ `chore/XIAN-42-livekit-local`. Slug dùng chữ thường ASCII và dấu gạch nối. Không tạo nhánh mới nếu người dùng yêu cầu làm trực tiếp hoặc giữ đúng hai nhánh.
- Một nhánh tập trung một Task/phạm vi liên quan. Kiểm tra issue thật trước; với việc không có issue, dùng `docs/<slug>` hoặc `chore/<slug>`, không bịa mã Jira. Chỉ push/xóa nhánh hoặc gộp khi được yêu cầu hay nằm trong phạm vi đã giao.
- **Không tự ý xóa nhánh**, kể cả nhánh đã gộp hoặc có vẻ lỗi thời, ở remote lẫn local. Nhánh remote là bằng chứng truy vết cho Jira (panel Development, key `XIAN-<số>`) và cho review. Chỉ xóa khi người dùng yêu cầu rõ nhánh hoặc nhóm nhánh cụ thể; trước khi xóa, liệt kê tên nhánh, trạng thái đã gộp và issue liên quan để người dùng xác nhận. Đề xuất dọn dẹp chỉ là gợi ý, không phải quyền thực hiện. Từ "ngắn hạn" ở trên chỉ mô tả vòng đời dự kiến của nhánh Task, không cho phép tự xóa.
- Commit theo dạng `<type>(<scope>): XIAN-<số> <mô tả thay đổi>`. Type theo bảng bên dưới; scope chỉ phần thay đổi. Ví dụ: `chore(media): XIAN-42 add local LiveKit configuration`. Việc không gắn issue có thể bỏ mã Jira; mô tả ngắn, rõ và nhất quán ngôn ngữ.
- Key Jira trong tên nhánh, commit và tiêu đề PR giúp truy vết khi tích hợp GitHub–Jira đã được cấu hình; không bảo đảm liên kết Development tự xuất hiện. Không thêm Smart Commit như `#done`, `#time` hoặc `#comment` nếu chưa được giao cập nhật Jira.
- Nếu tạo PR, hướng vào `develop` cho Task; tiêu đề có mã Jira. Mô tả gồm vấn đề, thay đổi, AC liên quan, kiểm tra thực sự đã chạy và giới hạn. PR sang `main` dùng để bàn giao/tích hợp theo yêu cầu. PR là cách review của nhóm, không phải quy tắc bảo vệ bắt buộc trên GitHub.
- Stage rõ từng file, xem diff và rà khóa trước commit. Không force push hoặc ghi đè lịch sử/chỉnh sửa của người khác. Khi được yêu cầu push cả `main` và `develop`, fetch, kiểm tra quan hệ lịch sử, chỉ fast-forward nếu phù hợp và xác minh hai ref remote sau push; không ép hai nhánh bằng reset/force.

### Type của nhánh và commit

Dùng cùng bộ type cho nhánh và commit; chọn theo mục đích chính của thay đổi. Đây là quy ước của nhóm, không dùng tên công cụ/agent làm tiền tố nhánh.

| Type       | Khi sử dụng                                                         |
| ---------- | ------------------------------------------------------------------- |
| `feat`     | Thêm tính năng                                                      |
| `fix`      | Sửa lỗi                                                             |
| `docs`     | Thay đổi tài liệu                                                   |
| `refactor` | Tổ chức lại mã, giữ nguyên hành vi                                  |
| `test`     | Thêm hoặc sửa kiểm thử                                              |
| `perf`     | Cải thiện hiệu năng                                                 |
| `style`    | Định dạng mã, không đổi hành vi; không dùng cho tính năng giao diện |
| `build`    | Hệ thống build, đóng gói hoặc dependency                            |
| `ci`       | Workflow tích hợp/triển khai tự động                                |
| `chore`    | Bảo trì, công cụ hoặc cấu hình không thuộc các nhóm trên            |
| `revert`   | Hoàn tác thay đổi trước đó                                          |

Ví dụ: `feat/XIAN-40-email-signup`, `chore/XIAN-42-livekit-local`.
Commit tương ứng: `feat(auth): XIAN-40 add email signup`.
Không thêm `hotfix` hoặc `release` vào quy trình hiện tại khi chưa có yêu cầu riêng; lỗi dùng `fix`, còn `main`/`develop` giữ vai trò đã chốt.

## Môi trường và bảo mật

- `.env` gốc là bản tổng; đồng bộ vào `apps/web/.env` và `apps/server/.env` sau khi sửa. Đối chiếu thay đổi riêng ở bản sao trước khi ghi đè. Các file thật và `.local/` phải được Git bỏ qua, quyền file bí mật là `600` khi hệ điều hành hỗ trợ. Các cờ `AUTH_*_ENABLED`, `ROOMS/FRIENDS/HISTORY/PROFILE_ENABLED` mặc định `false`, chỉ bật khi Task yêu cầu.
- Chỉ đưa tên biến và giá trị trống/mẫu công khai vào `.env.example`. Rà nội dung staged để tránh khóa xuất hiện trong tài liệu, ảnh, log, fixture hoặc URL. Không in nguyên file `.env` hay trả khóa trong chat.
- Dự án dùng Vite; `NEXT_PUBLIC_*` chỉ là dự phòng cho Next.js. Cả hai nhóm tiền tố đều dành cho dữ liệu công khai; secret Supabase/LiveKit/SMTP và mật khẩu SQL không được đưa vào bundle frontend.
- Giữ Cloud hiện tại trừ khi được yêu cầu chuyển. `infra/livekit/livekit-env.py prepare` chuẩn bị khóa local riêng; `local`/`cloud` đổi ba biến media và đồng bộ file. Không dùng khóa Cloud trong máy chủ Docker local.
- Database query thành công, OTP đến hộp thư hoặc LiveKit HTTP 200 chỉ là kiểm tra hạ tầng. Chưa đủ chứng minh OAuth, RLS, camera nhiều thiết bị và phân quyền nghiệp vụ đã đạt.

## Ponytail, lazy senior dev mode

You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

### Before you write

Read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

### The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)
