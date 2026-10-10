# Hướng dẫn agent — XIANGQI

Đọc file này trước khi làm việc trong repo. Hướng dẫn áp dụng cho toàn dự án; chỉ dẫn cụ thể của người dùng trong phiên làm việc được ưu tiên. Trả lời bằng tiếng Việt, nêu thay đổi, kiểm tra đã chạy và giới hạn còn lại.

## Bắt đầu phiên làm việc

1. Đọc yêu cầu, kiểm tra nhánh và `git status`; giữ nguyên thay đổi chưa commit của người dùng. Xác định công việc là tài liệu, cấu hình, triển khai hay đồng bộ Jira.
2. Đọc tài liệu theo phạm vi trong bảng dưới. Xác nhận mã issue thật trước khi đặt tên nhánh/commit theo Jira; không suy ra `T01` là `XIAN-1`.
3. Kiểm tra khả năng kết nối MCP Supabase và Atlassian/Jira theo mục kế tiếp. Ghi rõ kết nối đã kiểm chứng, chưa kiểm tra hoặc bị chặn; không coi việc có tên plugin là kết nối thành công.
4. Làm thay đổi trong phạm vi được giao, chạy kiểm tra phù hợp, xem diff và rà bí mật trước khi bàn giao hoặc push.

| Khi làm việc với | Đọc trước |
|---|---|
| Nghiệp vụ và phạm vi | [BA-SCOPE-DECISIONS.md](BA-SCOPE-DECISIONS.md), ưu tiên Phần 0 |
| Tính năng, test, nghiệm thu | [BACKLOG-P1.md](BACKLOG-P1.md), AC/TC của Story và Description của Task |
| Giao diện | [DANH-MUC-MAN-HINH-XIANGQI.md](DANH-MUC-MAN-HINH-XIANGQI.md), [DESIGN.md](DESIGN.md); mockup chỉ tham khảo |
| Jira, lịch và phân công | [KE-HOACH-JIRA.md](KE-HOACH-JIRA.md), [jira/README.md](jira/README.md) |
| Biến môi trường, xác thực, database | [CAU-HINH-MOI-TRUONG.md](CAU-HINH-MOI-TRUONG.md), [.env.example](.env.example) |
| Camera/mic và Docker | BA 0.16 và [infra/livekit/README.md](infra/livekit/README.md) |

Nguồn nghiệp vụ khi mâu thuẫn: BA Phần 0 → phần BA còn lại → BACKLOG-P1 → danh mục màn hình → DESIGN → mockup. Jira live là nguồn tiến độ khi đã truy vấn thành công; snapshot trong repo là dữ liệu có thời điểm, không phải xác nhận trạng thái hiện tại. Báo mâu thuẫn ảnh hưởng công việc, không tự thay quyết định BA.

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
- Đồng bộ kế hoạch theo [jira/README.md](jira/README.md): cập nhật nguồn phù hợp, sinh lại báo cáo rồi kiểm tra. Script đọc snapshot không tự lấy Jira live. Không nhập lại CSV đối chiếu để tạo backlog trùng.

## Git, commit và pull request

- `main` là nhánh mặc định; `develop` là nhánh tích hợp. Đây là hai nhánh lâu dài. Không bật lại bảo vệ nhánh, bắt buộc Approve/CI hay đổi nhánh mặc định trong công việc thông thường.
- Khi cần nhánh riêng cho Task, tạo nhánh **tạm thời** từ `develop` đã cập nhật: `<type>/XIAN-<số>-<mô-tả-ngắn>`, ví dụ `chore/XIAN-42-livekit-local`. Slug dùng chữ thường ASCII và dấu gạch nối. Không tạo nhánh mới nếu người dùng yêu cầu làm trực tiếp hoặc giữ đúng hai nhánh.
- Một nhánh tập trung một Task/phạm vi liên quan. Kiểm tra issue thật trước; với việc không có issue, dùng `docs/<slug>` hoặc `chore/<slug>`, không bịa mã Jira. Chỉ push/xóa nhánh hoặc gộp khi được yêu cầu hay nằm trong phạm vi đã giao.
- Commit theo dạng `<type>(<scope>): XIAN-<số> <mô tả thay đổi>`. Type theo bảng bên dưới; scope chỉ phần thay đổi. Ví dụ: `chore(media): XIAN-42 add local LiveKit configuration`. Việc không gắn issue có thể bỏ mã Jira; mô tả ngắn, rõ và nhất quán ngôn ngữ.
- Key Jira trong tên nhánh, commit và tiêu đề PR giúp truy vết khi tích hợp GitHub–Jira đã được cấu hình; không bảo đảm liên kết Development tự xuất hiện. Không thêm Smart Commit như `#done`, `#time` hoặc `#comment` nếu chưa được giao cập nhật Jira.
- Nếu tạo PR, hướng vào `develop` cho Task; tiêu đề có mã Jira. Mô tả gồm vấn đề, thay đổi, AC liên quan, kiểm tra thực sự đã chạy và giới hạn. PR sang `main` dùng để bàn giao/tích hợp theo yêu cầu. PR là cách review của nhóm, không phải quy tắc bảo vệ bắt buộc trên GitHub.
- Stage rõ từng file, xem diff và rà khóa trước commit. Không force push hoặc ghi đè lịch sử/chỉnh sửa của người khác. Khi được yêu cầu push cả `main` và `develop`, fetch, kiểm tra quan hệ lịch sử, chỉ fast-forward nếu phù hợp và xác minh hai ref remote sau push; không ép hai nhánh bằng reset/force.

### Type của nhánh và commit

Dùng cùng bộ type cho nhánh và commit; chọn theo mục đích chính của thay đổi. Đây là quy ước của nhóm, không dùng tên công cụ/agent làm tiền tố nhánh.

| Type | Khi sử dụng |
|---|---|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `docs` | Thay đổi tài liệu |
| `refactor` | Tổ chức lại mã, giữ nguyên hành vi |
| `test` | Thêm hoặc sửa kiểm thử |
| `perf` | Cải thiện hiệu năng |
| `style` | Định dạng mã, không đổi hành vi; không dùng cho tính năng giao diện |
| `build` | Hệ thống build, đóng gói hoặc dependency |
| `ci` | Workflow tích hợp/triển khai tự động |
| `chore` | Bảo trì, công cụ hoặc cấu hình không thuộc các nhóm trên |
| `revert` | Hoàn tác thay đổi trước đó |

Ví dụ: `feat/XIAN-40-email-signup`, `chore/XIAN-42-livekit-local`.
Commit tương ứng: `feat(auth): XIAN-40 add email signup`.
Không thêm `hotfix` hoặc `release` vào quy trình hiện tại khi chưa có yêu cầu riêng; lỗi dùng `fix`, còn `main`/`develop` giữ vai trò đã chốt.

## Môi trường và bảo mật

- `.env` gốc là bản tổng; đồng bộ vào `apps/web/.env` và `apps/server/.env` sau khi sửa. Đối chiếu thay đổi riêng ở bản sao trước khi ghi đè. Các file thật và `.local/` phải được Git bỏ qua, quyền file bí mật là `600` khi hệ điều hành hỗ trợ.
- Chỉ đưa tên biến và giá trị trống/mẫu công khai vào `.env.example`. Rà nội dung staged để tránh khóa xuất hiện trong tài liệu, ảnh, log, fixture hoặc URL. Không in nguyên file `.env` hay trả khóa trong chat.
- Dự án dùng Vite; `NEXT_PUBLIC_*` chỉ là dự phòng cho Next.js. Cả hai nhóm tiền tố đều dành cho dữ liệu công khai; secret Supabase/LiveKit/SMTP và mật khẩu SQL không được đưa vào bundle frontend.
- Giữ Cloud hiện tại trừ khi được yêu cầu chuyển. `scripts/livekit-env.py prepare` chuẩn bị khóa local riêng; `local`/`cloud` đổi ba biến media và đồng bộ file. Không dùng khóa Cloud trong máy chủ Docker local.
- Database query thành công, OTP đến hộp thư hoặc LiveKit HTTP 200 chỉ là kiểm tra hạ tầng. Chưa đủ chứng minh OAuth, RLS, camera nhiều thiết bị và phân quyền nghiệp vụ đã đạt.

## Kiểm tra và bàn giao

Chọn kiểm tra theo thay đổi, không tự chạy các script sinh lại kế hoạch cho việc không liên quan:

| Thay đổi | Kiểm tra |
|---|---|
| Markdown/mẫu env | Liên kết tương đối, tên biến/biến tùy chọn, `git diff --check`, scan bí mật trong staged |
| Kế hoạch Jira | `python3 jira/tools/build_plan.py --check` và `python3 -m unittest discover -s jira/tests -v` |
| LiveKit Docker | `docker compose --env-file .local/livekit/docker.env -f infra/livekit/compose.yaml config --quiet`; thử runtime nếu Docker sẵn có và phù hợp yêu cầu |
| Mã ứng dụng | Đọc manifest/lockfile và chạy lint, typecheck, test/build đã có cho phần thay đổi; không bịa lệnh hoặc kết quả |

Tại thời điểm chuẩn bị, repo chưa có manifest web/server hoặc CI: T01 sẽ thiết lập. Luôn kiểm tra cây hiện tại trước khi kết luận vẫn thiếu. Sau push, kiểm ref remote thay vì chỉ dựa vào commit local. Bàn giao ngắn gọn: file thay đổi, kiểm tra đạt/chưa chạy, việc còn thiếu và có hay không tác động Jira/Sprint.
