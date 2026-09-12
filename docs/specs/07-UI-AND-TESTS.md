# UI, test fixtures và bằng chứng

## Design tokens và màn hình

Thiết kế truyền thống, không dùng dashboard SaaS làm hình mẫu. Nền giấy `#F5E8CC`, gỗ sáng `#D8AE72`, gỗ viền `#704525`, mực `#28221C`, đỏ quân `#A51F25`, đen quân `#24201C`, focus `#155E75`. Nền trạng thái có chữ/icon đi kèm màu. Font UI system sans tiếng Việt; quân dùng Noto Serif SC tự host sau kiểm tra license, fallback serif; không tải font động từ CDN cho demo local.

Đỏ: 帥仕相傌俥炮兵; đen: 將士象馬車砲卒. aria-label tiếng Việt đầy đủ “Mã đỏ, cột 2 hàng 10”, tooltip tên Việt; không thêm chế độ đổi loại chữ. Sông 楚河 / 漢界. Quân tại giao điểm, không giữa ô; tọa độ server không đổi khi lật góc nhìn. Click/tap chọn→đích là thao tác chính, drag tùy chọn không bắt buộc. Escape bỏ chọn, arrows + Enter cho keyboard board. Gợi ý legal client chỉ phụ trợ server authority.

Spacing 4/8/12/16/24/32 px. Hit target ≥44 px cho control, board intersection hit regions không chồng; ở 360 px bàn 9 cột cần hit nhỏ hơn 44 nhưng chọn quân có highlight rõ và không dựa drag. Layout desktop: header, board khu trung tâm, panel thông tin/lịch sử/chat bên phải, media hàng riêng không đè board. Mobile: board full width, tab Ván/Chat/Camera, sticky lượt/clock ngắn; keyboard chat không ép bàn gây scroll ngang. Toast không che nút đầu hàng.

Routes: `/login`, `/register`, `/auth/callback`, `/auth/reset-password`, `/onboarding`, `/lobby`, `/friends`, `/rooms/:id`, `/ai/new`, `/matches/:id`, `/history`, `/history/:id`. Settings displayName qua menu hồ sơ, không cần dashboard admin. Deep link token ở `/join#token=...`; đã login đổi grant POST, chưa login giữ token trong sessionStorage của tab và quay lại join sau callback, xóa sau consume/expiry.

Mỗi page có empty/loading/error/retry/unauthorized. Input schema error tiếng Việt. Media permission denied không chặn bàn. Clock display dựa serverNowMs + monotonic local elapsed; đồng bộ lại không tự tính kết quả. Buttons disable theo role/control/status, server vẫn kiểm quyền.

## Fixtures dùng chung

`tests/fixtures/positions.ts` export `makePosition(pieces,turn)` với input `{type,side,x,y}[]`, tự cấp ID ổn định; mặc định không thêm quân ngầm. `initialPosition` lấy module luật. `tests/fixtures/users.ts` user A/B/S1..S6 ở Supabase test, không credentials thật. `createTestRoom` fixture gọi service, không bypass capacity; `testClock` có now/set/advance; `connectUser` tạo socket authenticated.

Fixtures luật tối thiểu:
- Initial 32 pieces, 16 mỗi side, key ban đầu đếm 1.
- Hai tướng `(4,0)` BLACK và `(4,9)` RED, tốt đỏ `(4,5)` chắn. Move tốt sang `(3,5)` mở mặt tướng phải bị từ chối.
- Mã đỏ `(1,9)`, quân đỏ `(1,8)`: đích `(0,7)` và `(2,7)` bị cản; bỏ quân chắn thì đường mã hợp lệ nếu tướng an toàn.
- Pháo đỏ `(0,7)`, mục tiêu đen `(0,2)`; kiểm 0/1/2 ngòi giữa chúng cho capture.
- Tượng đỏ `(2,9)` đến `(4,7)`, mắt `(3,8)` trống/bị chắn; đến hàng phía bắc sông bị cấm.
- Position identity: đổi ID hai quân cùng type/side không đổi key; đổi turn làm khác key.

Mọi thế test phải khai báo tướng và quân chắn nếu cần; không viết fixture “hợp lệ” thiếu tướng khiến test nhầm luật. Mate/stalemate/repetition chuẩn bị các fixture tự kiểm chứng bằng legal generator và review tay; ISSUE-004 phải ghi diagram/tọa độ đầy đủ trong test report, không lấy result engine làm luật tự động.

## Test commands và bằng chứng

Unit target: `pnpm test:unit -- <path>`; integration `pnpm test:integration -- <path>`; e2e `pnpm test:e2e -- <path>`; AI benchmark `pnpm test:ai`; load `pnpm test:load`. ISSUE-001 tạo wrappers forward args đúng. Test stubs thất bại rõ nếu service dependency chưa dựng; CI không skip âm thầm Google/media acceptance.

Mỗi issue ghi evidence vào `docs/test-reports/ISSUE-NNN.md`: commit hoặc diff state, ngày, môi trường, lệnh, exit code, số test pass/fail, artifact paths, manual evidence và limitation. Mã chưa tồn tại nên tài liệu issue chỉ nêu **kỳ vọng**, không phải kết quả đã chạy.

Unit/integration test luật/game clock dùng fake clock, cạnh tranh ghế/commands dùng connection DB riêng và barrier; test không dùng sleep dài để “chắc đã chạy”. E2E dùng 8 contexts: 2 players+5 viewers+viewer thứ 6 từ chối. Credential seeding isolated project, cleanup có prefix run ID; tuyệt đối không reset production database.

## AI experiments

Tập ít nhất 20 thế cờ: 5 bắt quân rõ, 5 thoát chiếu/an toàn tướng, 5 cuối ván/mate, 5 tránh lặp/điểm hòa. Mỗi thế có expected constraints hoặc best move set có giải thích, không lấy chính output AI làm đáp án. Cùng seed và depth thấp so baseline minimax/alpha-beta: score/best-move set tương đương, số nodes alpha-beta ≤ baseline cho cùng ordering; strict giảm tổng nodes trên tập.

Đo iterative deepening với fake deadline unit và wall-clock benchmark riêng. EASY/MEDIUM/HARD cùng tập, báo phân vị thời gian và depth. Đấu mỗi cặp cấp độ 20 ván từ 10 opening prefixes hợp lệ, đổi màu; cap 200 ply chỉ là giới hạn thí nghiệm và ghi adjudication, không thêm luật hòa sản phẩm. Gate tuning: cấp cao đạt >50% điểm đối đầu cấp thấp trong tập thử và không giảm điểm tập thế cờ; báo sample nhỏ, không suy ra Elo. Nếu không đạt phải tune trong budget/test lại, không chỉ đổi nhãn.

## Mốc nghiệm thu

Local full: tất cả R01–R15 được test chạy thật theo phạm vi local; Google external là test provider riêng cần cấu hình. Online smoke: HTTPS, callback Google/email, sockets hai mạng, media relay 2 player+5 viewer. Các mục external pending không làm hỏng trạng thái plan-ready, nhưng ngăn báo dự án hoàn tất toàn bộ.

Thử tải local: 10 room, 70 client, 2 AI workers; đo server command p95, memory và event loop. Media test 7 peers riêng; dữ liệu video không đi Socket.IO. Test restart/packet loss/duplicate/logout/revoke cần bằng chứng. Báo cáo cuối đối chiếu từng R với issue/test path, không dùng phần trăm code coverage thay nghiệm thu hành vi.

## Gate benchmark bổ sung

ISSUE-023 chạy ít nhất5 repeats/position/level; search p95 <= budget + max(50ms,10% budget), báo IPC/network riêng. Mỗi pair20ván, tổng60ván cho3 cấp; cap200ply chỉ trong harness chấm ADJUDICATED_DRAW=0.5 điểm mỗi bên. Illegal move/crash làm run lỗi, không chấm thua như thể đó là sức mạnh AI. Node tăng1 mỗi search position visit, kể root/terminal. Tập thế cờ và ordering giữ giống nhau khi so baseline/pruning.
