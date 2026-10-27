# Kiến trúc server và web

Tham khảo khi viết hoặc review mã server, hoặc khi chạm khởi động, giao dịch và khóa, realtime, xác thực, migration. Các quy tắc ngắn áp dụng cho mọi việc nằm ở `AGENTS.md`; tên pattern và trạng thái phân tầng ở [patterns.md](patterns.md); hợp đồng từng miền ở các file cùng thư mục.

## Khởi động theo cờ

`apps/server/src/main.ts` nối các factory `createXRuntime` theo thứ tự registration → google → media → rooms → AI → friends → history → profile. Mỗi miền kiểm tra schema/quyền DB lúc boot; phòng và AI cần đăng nhập, đăng ký và `ROOMS_ENABLED=true`. `game/game.runtime.ts` nối room, match, clock, chat, realtime và worker; `game/ai/ai-runtime.ts` nối AI HTTP/socket với engine worker.

Mỗi miền gồm `x.types.ts`, `x.module.ts` (chứa `createXRuntime`), `x.controller.ts`, `x.service.ts`, thêm `*.store.ts`, `*-worker.ts`, `*-port.ts` khi miền lớn.

Backend game chỉ có một instance hoạt động trên mỗi database. `core/runtime-lock.ts` giữ advisory lock cấp phiên trước recovery; instance thứ hai bị từ chối, không ngắt ván của instance đang chạy. Barrier bảo vệ các kết nối đang xử lý khi chủ khóa mất kết nối; AI (`game/ai/`) dùng cùng `rooms.ownershipPool` đã fence nên cũng nằm sau barrier và cổng đóng (không dùng pool thô của registration). Không coi đây là HA hoặc rolling deployment. Restart hợp lệ vẫn kết thúc ván online bằng `SERVER_RESTART`/`INTERRUPTED`, phòng tự tạo về `WAITING` theo BA 0.17.

`/health` là liveness; `/ready` trả 503 khi probe DB hoặc runtime chưa sẵn sàng. Render kiểm `/ready`. Khi tắt, runtime ngừng nhận và drain thao tác/socket trước khi nhả khóa và đóng pool. Log lỗi thu hồi media giữ mã `media_revocation_failed`, không ghi token hoặc phản hồi riêng tư của provider.

## Ghi dữ liệu: transaction, khóa, biên lai, outbox

Mọi ghi là transaction Postgres với thứ tự khóa cố định. Store của miền game không tự mở transaction; nó nhận `PoolClient` của người gọi trong `RoomScope`. Store miền account (`ProfileStore`, `FriendStore`, `GuestStore`, `GoogleStore`, `MediaStore`) nhận `Pool` và tự mở transaction.

`RoomTransactions.withRoom` (`game/room/room-transactions.ts`) làm lần lượt:

1. `BEGIN; SET LOCAL ROLE app_server` (app nối bằng `postgres` nên RLS và grant có hiệu lực);
2. khóa advisory theo actor đã sắp xếp;
3. kiểm lại phiên;
4. khóa phòng đã sắp xếp;
5. thử lại khi gặp `RoomRosterChanged`.

Không khóa theo thứ tự tùy ý: hai người chơi sẽ deadlock. Lệnh mang `commandId` và idempotent qua biên lai. Tác dụng phụ (Socket.IO, thu hồi media) đi qua bảng `outbox` do `*-worker.ts` xả, không bao giờ trước commit. Chi tiết thứ tự khóa của miền phòng ở [room.md](room.md).

## Store chia lớp bằng kế thừa

`RoomStore` = `RoomStoreCore` (helper, `snapshot`) → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`. `MatchStore` = `MatchStoreCore` → `MatchDrawStore` → `MatchStore`.

Nơi khác chỉ import `RoomStore` và `MatchStore`. Thêm lệnh vào lớp theo nhóm lệnh; helper dùng chung ở core (`protected`). Lớp con không được gọi ngược lên lớp con khác.

## Realtime

`game/realtime/gateway.ts` xác thực handshake, cho một tab điều khiển mỗi actor và phòng (chặn bằng `connectionId`) và gửi snapshot riêng cho từng người nhận. Snapshot HTTP chỉ để hiển thị. Đồng hồ, ân hạn mất kết nối và hết hạn xin hòa là worker phía server. Ván với máy (`game/ai/`) có gateway riêng.

Feed Sảnh (`game/room/public/public-room-feed.ts`) giữ `PUBLIC_FEED_POLL_MS = 1000` ms cho AC-06.2.3/06.2.15 (≤ 2 giây). Mỗi người đọc vẫn kiểm quyền trong giao dịch riêng; catalog PUBLIC dùng chung theo tick qua `PublicRoomCatalog`, không chia sẻ quyền hoặc phiên. Probe PostgreSQL test cô lập với 50 người đọc, 50 phòng PUBLIC và 5 phòng CODE_ONLY đo được 50 → 1 truy vấn catalog/tick, 350 → 301 câu SQL/tick, không có dòng riêng tư lọt ra. Đây là số đo query cục bộ, không phải nghiệm thu độ trễ mạng production.

## Xác thực hai lớp

Bearer Supabase (xác minh ngoài transaction) cộng khả năng phiên ứng dụng: chuỗi base64url 43 ký tự, được băm trong `xiangqi_auth.app_sessions`. Khách là loại actor riêng. `DIRECT_URL` phải là direct/session pooler, không phải cổng 6543.

## Cơ sở dữ liệu

`supabase/migrations/` có thứ tự và mỗi migration có bản `rollback/` đối ứng; `baseline/` cho bảng cũ. Schema gồm `xiangqi_{auth,realtime,room,chat,social}` và `public`. Migration xác nhận định nghĩa index/constraint hiện có trước khi đổi. Thêm migration mới kèm rollback thay vì sửa cái đã áp dụng.

## Web

`features/*` theo miền; `shared/` cho bàn cờ, UI, token và điều hướng. `features` chỉ import `shared`; `shared` không import `features` hay `app`; chỉ `app/` import tất cả. Trang là `React.lazy` trong `app/AppRouter.tsx`.

`RoomPage` phục vụ WAITING và PLAYING dưới `/rooms/:id`, giữ chat và media gắn liền khi chuyển trạng thái. `useRoomConnection` giữ vòng đời socket, fallback hiển thị HTTP và fencing epoch/version; lệnh và điều phối UI ở container. `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown`, `room-labels.ts` là phần trình bày. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent`; khối chỉ vẽ nhận props, không giữ kết nối hay gọi API. Lỗi camera/mic LiveKit không được làm gián đoạn ván.

## Test và CI

`tests/` phản chiếu `apps/`; đặt tên `x.test.ts`, `x.test-helper.ts`, `fixtures.ts`. CI chạy unit/core trên cả `develop` và `main`; lint/typecheck toàn workspace, build chọn theo `.github/scripts/ci-scope.mjs`. Sáu shard `tests/server` và `Database Integration Gate` chỉ chạy ở cửa phát hành `develop` → `main` và push `main`. Core chỉ chạy một lần trong job unit; các tên required check không đổi. Server triển khai qua `render.yaml` (`autoDeploy: true`), web qua Vercel.
