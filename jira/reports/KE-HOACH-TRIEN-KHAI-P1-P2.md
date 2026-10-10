# Kế hoạch triển khai P1 + P2 — 11/10/2026

> Phạm vi mới do PO giao ngày 11/10: triển khai và nghiệm thu cả P1 + P2, gồm các mục Stretch P2. Đặc tả BA hiện hành giữ nguyên; các câu lịch sử “P2 làm sau” không giới hạn đợt này. Kế hoạch P1 880 giờ, hạn 04/11/2026 và phân công nhân sự vẫn là baseline riêng. Chưa cam kết hạn P2.

**Mục tiêu:** ứng dụng chạy được theo toàn bộ BA, có truy vết, kiểm chứng thật và bản bàn giao trên main/develop. Scaffold hoặc Task Done không thay thế nghiệm thu.

**Kiến trúc:** pnpm workspace với React/Vite, TypeScript strict, NestJS + Socket.IO, Supabase PostgreSQL/Auth, LiveKit và máy cờ TypeScript chạy trong tiến trình riêng. Máy chủ xác thực danh tính/vị trí chơi và phân xử lệnh, thời gian, quyền phòng/chat/media. Lõi luật thuần dùng chung cho trình duyệt, server và engine.

**Nguồn:** [BA](../../BA-SCOPE-DECISIONS.md), [AC P1](../../BACKLOG-P1.md), [truy vết P1](TRUY-VET-AC.md), [danh mục P1/P2](PHAM-VI-P1-P2.md). Kế hoạch này quyết định trình tự kỹ thuật; không đổi luật, lịch Jira hoặc AC đã duyệt.

## Hiện trạng đã xác minh

- Git baseline 319df81 trên origin/main và origin/develop; local develop đã fast-forward an toàn. README-tmp.md là file cá nhân chưa theo dõi, giữ nguyên.
- Chưa có manifest ứng dụng tại baseline. Bảy test kế hoạch Python PASS ngày 11/10/2026.
- MCP Jira đọc thành công đúng XIAN/board 38. Sprint 1 id40 ACTIVE từ 11/10/2026 03:41 GMT+7; Sprint 2–4 FUTURE. Snapshot 10/10 còn future, không được dùng làm trạng thái live.
- Supabase MCP không có trong công cụ hiện tại. Dashboard xác nhận XIANGQI/snsnkoicxmubuotcdafi Healthy; SQL SELECT 1 qua DIRECT_URL thành công. Public schema đã có 19 bảng bật RLS, 11 migration, 3 profiles/11 matches/4 rooms; chưa kiểm chứng RLS theo vai trò. Không được triển khai như database trống hoặc ghi đè dữ liệu cũ.
- Jira chưa có issue P2 riêng tại lần kiểm đủ 107 issue đầu tiên. Issue mới phải tìm trùng, dùng key Jira trả về, giữ backlog, không gán Sprint/ngày/release hoặc thay assignee hiện hữu.

## Ràng buộc và điểm review

- Không đổi nhà cung cấp, không tắt RLS/auth để test qua, không log hay commit mật khẩu/OTP/token/chat hoặc khóa thật.
- Camera/mic mặc định tắt; người xem chỉ nhận; thu hồi quyền media phải tác động tới phiên đang chạy, không chỉ token mới.
- Replay chỉ hai người chơi chính thức của ván, chỉ nhánh nước hiệu lực; Khách không có lịch sử.
- Lệnh trùng chỉ tác động một lần; lệnh version cũ trả snapshot; đồng hồ được xét trước nước đi và không hoàn thời gian khi undo.
- Mất mạng hai người không được coi là server restart; thiết bị khác và tab cùng thiết bị có hành vi khác nhau theo BA 1.8.
- GATE/AC bị chặn vẫn chưa hoàn thành. Test tổng hợp/browser context không thay thế LAN nhiều thiết bị hoặc OTP/OAuth thật.

## Các phần và điều kiện kiểm chứng

| Thứ tự | Phạm vi / issue nền | Đầu ra | Kiểm chứng trước tích hợp |
|---|---|---|---|
| 1 | T01/XIAN-37 | apps/web, apps/server, packages/shared, xiangqi-core, engine; manifest/lockfile, CI, JSON logger, /health và README | Install từ checkout mới; pnpm dev; HTTP health; fake-secret log test; lint/typecheck/unit/build; CI hợp lệ và ba dạng cố ý lỗi trên nhánh kiểm riêng; scan Git và bundle |
| 2 | T02/XIAN-38, T05/XIAN-41, T07/XIAN-43, T10/XIAN-46 | Lõi luật và dữ liệu chuẩn độc lập; cây nước hiệu lực, serialization, kết thúc ván | 44/1920/79666 perft đối chiếu nguồn; bảy loại quân, tự chiếu/tướng đối mặt, chiếu hết/hết nước, lặp ba lần/chu kỳ chiếu, 120 nửa nước và thứ tự ưu tiên; coverage dòng ≥90% |
| 3 | T04/XIAN-40, T09/XIAN-45, T14/XIAN-50, T35/XIAN-71, T56/XIAN-92 | Schema bổ sung an toàn, RLS, tài khoản email/Google/Khách, phiên cố định | Kiểm schema/dữ liệu cũ; migration database test trước live; test RLS đa vai trò; OTP local tự động + thư thật được PO cấp phép; không tự link Google; username lockout tồn tại/không tồn tại; Google cleanup và registration recovery |
| 4 | T12/XIAN-48, T18/XIAN-54, T20/XIAN-56, T23/XIAN-59, T52/XIAN-88 | Realtime có auth, lệnh/receipt, phòng/ghế/ready, ván và đồng hồ bền | Socket integration nhiều client; stale/duplicate/concurrency; disconnect/countdown/restart; giữ khóa khi thiếu ghế; tất cả kết quả/ghế/snapshot theo BA |
| 5 | T03/XIAN-39, T11/XIAN-47, T19/XIAN-55 và các Task FE theo truy vết | Đầy đủ giao diện P1, board click/drag/keyboard, trợ năng, năm trạng thái | E2E luồng thật với backend; 360/390/1366/1920; keyboard/focus, reduced motion, font tự host và mù màu; lỗi/empty/loading/disabled |
| 6 | T06/XIAN-42, T33/XIAN-69, T37/XIAN-73, T31/XIAN-67 và các Task liên quan | Media local/Cloud, hai kênh chat, bạn bè/lời mời, phân quyền người xem | Chặn đọc private/chat cặp cũ; filter/rate limit/text thuần; token + thu hồi media đang chạy; 2 người chơi +5 xem trên LAN thiết bị thật, Cloud và số đo; media lỗi không ảnh hưởng ván |
| 7 | T24/XIAN-60, T59/XIAN-95, T34/XIAN-70, T63/XIAN-99 | AI ba cấp và giữ ván/Thử lại | Negamax alpha-beta tiến trình riêng, tìm sâu dần2/4/6; p95≤300/1000/3000ms, 50 thế giữa ván/cấp; Khó100% mate1/2 dữ liệu độc lập; 20 ván/cặp cấp; lỗi/busy/30 phút/restart |
| 8 | Bảy Epic P2 theo BACKLOG-P1 §4.2; key bổ sung từ Jira | Ranked/Elo/leaderboard, Casual queue, undo/rematch/unlimited, lịch sử/replay/export, DM/challenge/sticker/QR, phục hồi/đổi username, theme/demo/widget/multi-tab | AC/TC bổ sung theo từng dòng BA; regression P1; cặp3ván/24h, last attempt60s±400, K30/31, floor100, riêng tư/read visibility, username cũ30ngày, undo nhánh, demo flag server |
| 9 | T51/XIAN-87, T66/XIAN-102, T70/XIAN-106, T71/XIAN-107 và nghiệm thu P2 | Bản bàn giao, hướng dẫn/migration/CI/fixtures, Jira và bằng chứng | D1–D10 trên máy demo; NFR/GATE đầy đủ; 50 client/10 ván; đóng gói sạch ≤15phút; review diff/secrets; push/PR develop, tích hợp main đủ điều kiện và xác minh remote |

Phụ thuộc kỹ thuật quyết định lúc có thể bắt đầu; Codex được làm sớm so với lịch nhân sự nhưng không sửa hoặc giả lập số giờ thực tế. Task chỉ Done khi điều kiện riêng đạt; Story BA Done không đại diện phần mềm.

## Task 1: T01 — hợp đồng và vòng kiểm chứng

**Files:** root package.json/pnpm-workspace.yaml/lockfile, tsconfig/ESLint/Prettier/Vitest, .github/workflows/ci.yml; apps/web/src; apps/server/src; manifests năm workspace; README.md và mẫu env khi có thay đổi thật.

**Hợp đồng:** GET /health trả JSON trạng thái server cùng database/engine; dịch vụ chưa tích hợp trả not_connected, không giả PASS. Logger nhận event cố định và metadata được phép, phát JSON time/level/event, bỏ dữ liệu nhạy cảm cả khi nằm trong khóa lạ hoặc lỗi. Frontend chỉ sử dụng VITE_* công khai.

- [x] Viết và chạy test thất bại: secret giả ở khóa thông thường/lồng nhau/error/string không được xuất; invalid PORT/CORS/config báo lỗi an toàn; HTTP /health trả200 với database/engine not_connected.
- [x] Dựng tối thiểu workspace và triển khai các hợp đồng; pnpm install sinh lockfile, không đọc hoặc thay bí mật không cần thiết.
- [x] Chạy pnpm lint, pnpm typecheck, pnpm test, pnpm build; kết quả phải PASS toàn suite. Chạy pnpm dev và kiểm web/health thật.
- [x] Kiểm checkout mới frozen-lockfile; scan file Git/bundle với giá trị bí mật hiện có mà không in chúng; diff --check.
- [x] Review độc lập, sửa lỗi bằng test red→green; commit/push nhánh T01 và PR develop.
- [x] CI khai báo cùng pipeline push main/develop và PR; CI thực tế PR/develop PASS, ba job thử lint/typecheck/unit FAIL đúng bước, PR thử đã đóng và không gộp. Sự kiện main chưa chạy vì chưa tới bản bàn giao.

## Tiến độ triển khai ngày 11/10/2026

T01/XIAN-37: PR [89](https://github.com/twotnguyen/XIANGQI/pull/89) đã gộp; CI mã hợp lệ và ba ca lỗi được ghi trong Jira, Task Done. T05/XIAN-41, T07/XIAN-43, T10/XIAN-46: PR [91](https://github.com/twotnguyen/XIANGQI/pull/91) gộp develop1334907, Node22 kiểm61test toàn repo đạt; core53test,100% dòng,99.41% nhánh; ba Task Done. Bàn cờ T11/XIAN-47 và xác thực T04/XIAN-40 đang triển khai, chưa nghiệm thu. `main` vẫn baseline319df81, chưa là bản bàn giao P1/P2.

## Nhật ký và bàn giao

Checkpoint riêng không chứa bí mật ở .local/goal/: issue, commit, test thực sự chạy, blocker và bước tiếp. Báo cáo nghiệm thu phải phân biệt PASS/FAIL/BLOCKED/NOT_RUN, local/mock với dịch vụ thật, và ghi môi trường media active. Không đánh dấu mục tiêu toàn bộ hoàn thành khi còn bất kỳ tiêu chí bắt buộc nào thiếu.
