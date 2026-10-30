# Hướng dẫn agent — XIANGQI

Chỉ dẫn của người dùng trong phiên được ưu tiên. Trả lời bằng tiếng Việt.

Monorepo pnpm, Node `>=22.13 <23` (`fnm use 22`; bản khác chỉ cảnh báo nhưng lệch CI): `apps/web` (React + Vite), `apps/server` (NestJS + Socket.IO), `packages/{shared,xiangqi-core,engine}`, `supabase/`, `tests/` (phản chiếu `apps/`). Lệnh: xem `package.json`. `.local/` (Git bỏ qua) chứa ghi chú cá nhân; không commit.

## Báo cáo

Nêu thay đổi, kiểm tra đã chạy, giới hạn còn lại; kết bằng 1–2 dòng: đã bỏ qua hoặc chưa kiểm gì, rủi ro cần biết. Chưa chạy test thì ghi "Test local: không chạy (không được yêu cầu)"; chỉ báo kết quả đã quan sát.

## Đọc theo tác vụ

Bắt đầu từ code và caller bị ảnh hưởng. Chỉ mở tài liệu khi tác vụ khớp một dòng dưới đây, và chỉ mở mục liên quan.

- **Luật hoặc nghiệp vụ**: grep đúng mã (`AC-02.1.x`, `BA 2.8`) trong `docs/product/BA-SCOPE-DECISIONS.md` (Phần 0 thắng) hoặc `BACKLOG-P1.md`, đọc đúng mục. Nguồn mâu thuẫn trực tiếp thì báo người dùng, không tự đổi quyết định BA.
- **UI/CSS**: dùng code và token sẵn có (`apps/web/src/shared/styles/tokens.css`). Đổi bố cục hoặc luồng: `docs/engineering/web/ui.md`.
- **Server, sửa cục bộ theo mẫu có sẵn** (thông báo lỗi, một truy vấn, một trường): code store/service và caller là đủ.
- **Server, đổi hành vi miền** (lệnh, luồng, trạng thái): `docs/engineering/server/{clock,google,login,match,realtime,room,schema}.md` của miền đó.
- **Server, chạm khởi động, giao dịch/khóa, realtime, xác thực, migration hoặc ranh giới tầng**: thêm `docs/engineering/server/architecture.md`. `patterns.md` chỉ khi thêm hoặc đổi pattern.
- **Không đọc** (baseline cũ, dễ gây nhầm): `docs/archive/`, `docs/planning/KE-HOACH-JIRA.md`, `docs/planning/jira/{data,exports,reports}/` trừ `reports/P2-TRANG-THAI-TRIEN-KHAI.md` (số liệu ảnh chụp Jira 10/10, chưa theo phạm vi `docs/product`; `docs/product` thắng). Chọn mã commit chỉ cần `docs/planning/jira/TRA-CUU-TASK-COMMIT.md` (mở `reports/JIRA-MUC-CHI-TIET.md` đúng mục `#tNN` khi nó yêu cầu đối chiếu Description/AC).
- **`docs/engineering/`** mô tả mã hiện tại. Quyết định BA 0.27–0.36 chưa triển khai nằm ở mục "Tác động triển khai" của YC; khi khác nhau, `docs/product` thắng và mã cần sửa theo.
- **Jira**: `docs/planning/jira/README.md`. **Supabase**: `docs/setup/CAU-HINH-MOI-TRUONG.md` mục 8. Chỉ dùng MCP của dịch vụ mà tác vụ thật sự chạm.
- **Subagent**: chỉ khi phải đọc hoặc review từ ~10 file trở lên; yêu cầu trả lời tiếng Việt, không đề xuất lệnh test.

## Mã dùng chung

`shared` (hợp đồng chéo đầu `realtime.ts`, filter, validation) và `xiangqi-core` + `engine` (luật, tìm nước đi) chạy cả hai đầu: đổi luật hoặc kiểm tra thì sửa cả hai đầu trong cùng PR, không copy logic. Package xuất TS source trực tiếp (không bước build; server chạy bằng `tsx` kể cả bản build). Alias `@server/@web/@core/@engine/@shared` chỉ dùng trong `tests/`.

## Kiểm chứng

- Mặc định không chạy test, build hay script kiểm thử tạm. Sửa lỗi, triển khai, commit, push và viết test đều không kéo theo việc chạy. Ngoại lệ: người dùng yêu cầu rõ trong tác vụ hiện hành (kể cả chạy lại test CI lỗi) thì chạy đúng phạm vi giao, dưới Node 22.
- Prettier/eslint/typecheck chạy trên file vừa sửa, khi thật sự cần.
- CI lo kiểm thử tự động: đọc trạng thái PR một lần bằng công cụ của ứng dụng, không poll. Lỗi ngoài phạm vi báo riêng, không sửa để làm repo xanh.
- UI: xem qua route `/dev/*` (`shared/navigation/routes.ts`) khi server dev đang chạy; không xem được thì dừng sau một lần thử, ghi "chưa xem giao diện".
- Test mới ưu tiên chạy mã thật (DB qua `tests/server/db.sh`, luật qua `xiangqi-core`); không mock lại hành vi đã có test thật phủ. File test quá ~600 dòng thì tách theo kịch bản (`x.<nhóm>.test.ts` + `x.test-helper.ts`), giữ nguyên số test.
- Môi trường test: `db.sh` dựng Postgres 17 cô lập (biến `*_TEST_DATABASE_URL`); trỏ các URL đó vào Supabase sẽ làm fixture xóa schema. `node_modules` cũ gây hàng trăm test web fail `Cannot read properties of null (reading 'useState')`: cài lại dưới Node 22. Test đo thời gian dùng ngưỡng theo `CI=true`.

## Git và pull request

- `develop` là nhánh mặc định và tích hợp; `main` là nhánh phát hành, có branch protection (`Fast Checks & Build (full tests on main)`, `Database Integration Gate`). Làm thẳng trên `develop` trừ khi người dùng muốn nhánh riêng (`<type>/XIAN-<số>-<mô-tả>`).
- Commit: `<type>(<scope>): XIAN-<số> <mô tả>` (bỏ mã nếu không có issue). Type: `feat fix docs refactor perf ci chore test`. Không Smart Commit, không `Co-Authored-By`.
- Mã Jira: dùng `XIAN-…` thật (`T01` không phải `XIAN-1`), không suy bằng phép cộng hay gán gần đúng. Task đã chốt trong phiên và phạm vi không đổi thì dùng lại. Chưa xác định thì tra `docs/planning/jira/TRA-CUU-TASK-COMMIT.md` (grep theo mục đích công việc, không đọc cả bảng), rồi nêu mã và lý do ngắn. Vẫn chưa xác định thì hỏi. Việc độc lập thuộc nhiều Task thì tách commit; test hồi quy đi cùng Task triển khai.
- "Chỉ commit/push": kiểm nhánh, `git diff --check`, secret staged; stage từng file; commit; push. Không lint/test/build, không review sâu, không MCP.
- Push, PR, merge chỉ khi người dùng yêu cầu. Không force push, chỉ fast-forward, rồi xác minh ref local và remote trùng nhau.
- PR vào `main` đi từ `develop` và là lần duy nhất chạy đủ test; push/PR vào `develop` chỉ lint, typecheck, build. Merge bằng merge commit khi hai required check xanh, rồi fast-forward `develop` theo `main`. PR nhánh tính năng vào `develop`: mô tả ngắn kèm kiểm tra đã chạy, tiêu đề có mã Jira nếu có.
- Giữ nguyên nhánh local và GitHub (liên kết Jira); chỉ dọn khi người dùng yêu cầu rõ, liệt kê một lần rồi xóa nhóm được xác nhận.
- Không báo Jira đã ghi nhận khi chưa quan sát được trên issue; Task Done cần bằng chứng triển khai và kiểm thử. Mã commit không tự chuyển Task Done.

## Ràng buộc server (hàng rào an toàn)

- Ghi trạng thái phòng/ván là transaction Postgres qua `RoomTransactions.withRoom` (`game/room/room-transactions.ts`): khóa actor đã sắp xếp, rồi khóa phòng đã sắp xếp; thứ tự tùy ý sẽ deadlock hai người chơi. Lệnh mang `commandId` (idempotent qua biên lai). Tác dụng phụ (Socket.IO, thu hồi media) đi qua `outbox` do `*-worker.ts` xả, sau commit.
- Miền khác nhiều bước xen kẽ truy vấn: `store.withUser(…, tx => …)` với đối tượng `*Tx` (mẫu: `friend`, `media`, `google`).
- `RoomStore`/`MatchStore` chia lớp bằng kế thừa (`RoomStoreCore` → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`; `MatchStoreCore` → `MatchDrawStore` → `MatchStore`): thêm lệnh vào đúng lớp, helper dùng chung ở core, nơi khác chỉ import `RoomStore`/`MatchStore`.
- Controller → Service → Store: SQL chỉ nằm trong `*.store.ts`; controller không chạm DB; phụ thuộc giữa miền qua `*Port`. `tests/server/core/layering.test.ts` giữ tự động.
- Feed Sảnh đọc mỗi `PUBLIC_FEED_POLL_MS` = 1000 ms (AC-06.2.3, 06.2.15: ≤ 2 giây); không nâng chu kỳ khi chưa hỏi PO.
- `DIRECT_URL` là direct/session pooler, không phải cổng 6543. Migration mới kèm bản `rollback/`; không sửa migration đã áp dụng.
- Web: `features` chỉ import `shared`; `shared` không import `features`/`app`. Khối chỉ vẽ (`RoomSeats`, `BoardGrid`…) chỉ nhận props; trạng thái, hook kết nối và lệnh ở container (`RoomPage`, `XiangqiBoard`). Lỗi camera/mic LiveKit không làm gián đoạn ván.
- Báo xong mã server kèm một dòng tự kiểm: SQL ngoài store? controller chạm DB? ghi qua `withRoom`/biên lai/outbox? abstraction nào chưa có vấn đề? Chỗ không đạt nêu rõ.

## Nguyên tắc

- Phạm vi = mọi nơi thay đổi phải chạm (caller, test, fixture, config, export) cộng điều có thể hỏng cho người dùng (dữ liệu bị hủy hoặc lộ). Hoàn tất mọi phần đó; không thêm tính năng, abstraction, tùy chọn hay mã "để sau" nếu không được giao.
- Ưu tiên theo thứ tự: bỏ bớt, dùng cái có sẵn trong codebase, thư viện chuẩn, dependency đã cài, rồi mới viết mới. Giữ cấu trúc và style xung quanh; chỉ dọn phần do mình tạo ra.
- Sửa lỗi: grep mọi caller, sửa nguyên nhân gốc một lần ở mã dùng chung. Mã di chuyển giữ nguyên validation và xử lý lỗi.
- Logic mới không tầm thường (nhánh, vòng lặp, parser, tiền, bảo mật) để lại một test nhỏ. Đường tắt có giới hạn: comment `shortcut: <giới hạn>, <khi nào nâng cấp>`.
- Giữ: validation ở ranh giới tin cậy, chống mất dữ liệu, bảo mật, trợ năng. Không in `.env` hay khóa. Không chắc thì chọn phương án an toàn, nêu giả định rồi làm tiếp.
