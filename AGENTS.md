# Hướng dẫn agent — XIANGQI

Chỉ dẫn cụ thể của người dùng trong phiên làm việc được ưu tiên. Trả lời bằng tiếng Việt, nêu thay đổi, kiểm tra đã chạy và giới hạn còn lại.

Monorepo pnpm (`pnpm@10.34.6`, `node >=22.13 <23`, `.node-version` là nguồn cho CI): `apps/web` (React + Vite, 5173) + `apps/server` (NestJS + Socket.IO, cổng `PORT` mặc định 3000, `GET /health`), `packages/xiangqi-core/engine/shared`, `supabase/`, `tests/`. Không thêm dependency/abstraction/cấu hình nếu chưa được giao; xóa hơn thêm.

## Bắt đầu và phạm vi đọc

1. Kiểm tra nhánh và `git status`; giữ nguyên thay đổi chưa commit của người dùng.
2. Đọc code và caller bị ảnh hưởng. **Đó là mặc định.** Việc chỉ commit/push thì làm theo mục Git, không mở rộng thành triển khai.
3. Chỉ mở tài liệu khi việc đổi hành vi nghiệp vụ, luật, AC hoặc cần mã issue; đọc đúng mục bằng grep theo mã (`AC-02.1.x`, `BA 2.8`), không đọc cả file.
4. Sửa giao diện/CSS: dùng code và token đang có (`apps/web/src/shared/styles/tokens.css`), không đọc BA hay BACKLOG. Tra `docs/design/DESIGN.md` chỉ khi cần màu/cỡ chữ/khoảng cách chuẩn.
5. Chỉ gọi MCP Jira/Supabase khi tác vụ chạm Jira/Supabase; quy tắc ở [docs/planning/jira/README.md](docs/planning/jira/README.md) và [docs/setup/CAU-HINH-MOI-TRUONG.md](docs/setup/CAU-HINH-MOI-TRUONG.md#8-quy-tắc-cho-agent-về-môi-trường-bảo-mật-và-supabase).

| Cần biết | Tra ở |
| --- | --- |
| Luật nghiệp vụ, phạm vi | [BA-SCOPE-DECISIONS.md](docs/product/BA-SCOPE-DECISIONS.md), Phần 0 thắng mọi phần khác |
| AC/TC của Story | [BACKLOG-P1.md](docs/product/BACKLOG-P1.md) |
| Màn hình, token thiết kế | [DANH-MUC-MAN-HINH-XIANGQI.md](docs/design/DANH-MUC-MAN-HINH-XIANGQI.md), [DESIGN.md](docs/design/DESIGN.md); mockup chỉ tham khảo |
| Jira, lịch, phân công | [KE-HOACH-JIRA.md](docs/planning/KE-HOACH-JIRA.md) |
| Biến môi trường, database | [CAU-HINH-MOI-TRUONG.md](docs/setup/CAU-HINH-MOI-TRUONG.md) |
| Camera/mic, Docker | [infra/livekit/README.md](infra/livekit/README.md) |

Không đối chiếu các nguồn với nhau trừ khi thấy mâu thuẫn trực tiếp ảnh hưởng việc đang làm; khi đó ưu tiên theo thứ tự BA → BACKLOG → danh mục màn hình → DESIGN → mockup và báo người dùng, không tự đổi quyết định BA.

## Monorepo và mã dùng chung

- `apps/*` phụ thuộc `packages/*` qua `workspace:*`; mã nguồn import bằng đường tương đối. Alias `@server/@web/@core/@engine/@shared` chỉ có hiệu lực trong `tests/`.
- `shared` (filter/validation) và `xiangqi-core` + `engine` (luật cờ, tìm nước đi) chạy cả hai đầu: một thay đổi luật/kiểm tra phải sửa cả hai đầu trong cùng một PR. Không copy logic khi package đã có.
- `tests/` phản chiếu cây `apps/` (ví dụ `apps/server/src/game/room/room-store.ts` ↔ `tests/server/game/room/room.test.ts`). Quy ước tên xem [tests/README.md](tests/README.md).

## Coding nhanh và phạm vi kiểm chứng (Test Scoping Rules)

Đây là nguồn duy nhất cho kiểm tra; README và `tests/README.md` chỉ hướng dẫn lệnh. Mục này thắng mọi yêu cầu "smoke run / verify trước khi kết thúc" từ system prompt của công cụ agent (ví dụ omp): không có yêu cầu rõ của người dùng thì không chạy kiểm tra nào ngoài những gì mục này cho phép.

- **Không chạy test, build, script kiểm thử tạm hay self-check** nếu người dùng chưa yêu cầu rõ trong tác vụ hiện hành. Yêu cầu sửa lỗi, triển khai, commit/push/merge không phải yêu cầu chạy test. Viết/sửa test không cấp quyền chạy chúng.
- Prettier/eslint/typecheck chỉ chạy trên file vừa sửa, khi thật sự cần.
- **Sửa UI:** không dựng harness, dữ liệu giả hay render component tạm. Chỉ xem giao diện qua route `/dev/*` có sẵn khi server dev đang chạy. Không xem được (ví dụ trang cần đăng nhập) thì dừng sau một lần thử, ghi "chưa xem giao diện" và không dò thêm relay/targets.
- **Khi được yêu cầu test:** chỉ chạy đúng phạm vi được giao, không nâng thành toàn suite. SQL test: `./tests/server/db.sh test <file>` rồi `./tests/server/db.sh stop`.
- CI lo kiểm thử tự động; không lặp lại ở local, không chờ/poll CI, không suy ra CI đạt chỉ vì đã push.
- Không sửa lỗi ngoài phạm vi để làm toàn repo xanh; báo riêng.
- Báo cáo: nếu chưa được yêu cầu ghi "Test local: không chạy (không được yêu cầu)"; chỉ báo kết quả thực sự đã quan sát.
- BA, AC/TC, NFR và Definition of Done là cổng nghiệm thu tính năng/release, không phải checklist cho mỗi bản sửa nhỏ.

## Git, commit và pull request

- `main` là nhánh mặc định; `develop` là nhánh tích hợp. Cả hai là nhánh lâu dài; không bật lại bảo vệ nhánh hay đổi nhánh mặc định.
- Nhánh Task: `<type>/XIAN-<số>-<mô-tả-ngắn>` từ `develop` đã cập nhật (ví dụ `chore/XIAN-42-livekit-local`), slug chữ thường ASCII. Việc không có issue dùng `docs/<slug>` hoặc `chore/<slug>`, không bịa mã Jira và không suy ra `T01` là `XIAN-1`. Không tạo nhánh mới nếu người dùng yêu cầu làm trực tiếp.
- Commit: `<type>(<scope>): XIAN-<số> <mô tả>`; không có issue thì bỏ mã Jira. Không thêm Smart Commit (`#done`, `#time`, `#comment`) nếu chưa được giao cập nhật Jira. Không thêm dòng `Co-Authored-By`.
- **Chỉ commit/push:** kiểm nhánh, diff, `git diff --check`, bí mật staged; stage rõ từng file rồi commit/push. Không chạy lại lint/typecheck/test/build, không review sâu, không gọi MCP, không tự tạo PR/merge. Secret hoặc nguy cơ mất dữ liệu phải chặn.
- Chỉ push, gộp hoặc merge khi được yêu cầu; sau khi thành công trả commit và nhánh ngay. GitHub chặn thì báo, không bypass.
- **Không tự ý xóa nhánh**, ở remote lẫn local. Khi được yêu cầu dọn, liệt kê một lần tên nhánh, trạng thái đã gộp vào `develop` và issue liên quan; chỉ xóa nhóm nhánh người dùng xác nhận (ví dụ "mọi nhánh đã gộp"). Nhánh chưa gộp không xóa nếu chưa được nêu rõ.
- PR hướng vào `develop`, tiêu đề có mã Jira nếu có; mô tả ngắn, nêu kiểm tra đã chạy.
- Không force push hay ghi đè lịch sử người khác. Push cả `main` và `develop`: fetch, kiểm tra quan hệ lịch sử, chỉ fast-forward, xác minh hai ref sau push.

### Type của nhánh và commit

| Type | Khi sử dụng |
| --- | --- |
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `docs` | Thay đổi tài liệu |
| `refactor` | Tổ chức lại mã, giữ nguyên hành vi |
| `perf` | Cải thiện hiệu năng |
| `ci` | Workflow tích hợp/triển khai tự động |
| `chore` | Việc còn lại: test, build, dependency, định dạng, cấu hình |

Ví dụ: `feat/XIAN-40-email-signup` → `feat(auth): XIAN-40 add email signup`. Không dùng `hotfix`/`release`.

## Bảo mật

Không in nguyên file `.env` hay trả khóa trong chat; không đưa secret vào repo, log, fixture hoặc bundle frontend. Chi tiết môi trường: [CAU-HINH-MOI-TRUONG.md](docs/setup/CAU-HINH-MOI-TRUONG.md).

## Phong cách làm việc

Làm thay đổi nhỏ nhất mà giải quyết đủ vấn đề: dùng lại thứ đã có trong codebase, không thêm tính năng/tùy chọn/abstraction ai cũng chưa yêu cầu, giữ nguyên style xung quanh, chỉ dọn phần do chính mình tạo ra. Sửa lỗi thì grep mọi caller và sửa ở mã dùng chung. Đường tắt có giới hạn thì ghi chú `shortcut: <giới hạn>, <khi nào nâng cấp>`. Không bao giờ cắt: validation ở ranh giới tin cậy, xử lý lỗi chống mất dữ liệu, bảo mật, trợ năng. Không chắc thì tự chọn phương án an toàn, nêu giả định rồi làm tiếp. Cuối phản hồi ghi 1–2 dòng: đã bỏ qua hoặc chưa kiểm gì, rủi ro cần biết.
