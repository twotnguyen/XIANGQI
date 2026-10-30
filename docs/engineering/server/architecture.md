# Kiến trúc server và web

Tham khảo khi viết hoặc review mã server, hoặc khi chạm khởi động, giao dịch và khóa, realtime, xác thực, migration. Các quy tắc ngắn áp dụng cho mọi việc nằm ở `AGENTS.md`; tên pattern và trạng thái phân tầng ở [patterns.md](patterns.md); hợp đồng từng miền ở các file cùng thư mục.

## Khởi động theo cờ

`apps/server/src/main.ts` nối các factory `createXRuntime` theo thứ tự registration → google → media → rooms → AI → friends → history → profile. Mỗi miền kiểm tra schema/quyền DB lúc boot; phòng và AI cần đăng nhập, đăng ký và `ROOMS_ENABLED=true`. `game/game.runtime.ts` nối room, match, clock, chat, realtime và worker; `game/ai/ai-runtime.ts` nối AI HTTP/socket với engine worker.

Mỗi miền gồm `x.types.ts`, `x.module.ts` (chứa `createXRuntime`), `x.controller.ts`, `x.service.ts`, thêm `*.store.ts`, `*-worker.ts`, `*-port.ts` khi miền lớn.

Backend game chỉ có một instance hoạt động trên mỗi database. `core/runtime-lock.ts` giữ advisory lock cấp phiên trước recovery; instance thứ hai bị từ chối, không ngắt ván của instance đang chạy. Barrier bảo vệ các kết nối đang xử lý khi chủ khóa mất kết nối; AI (`game/ai/`) dùng cùng `rooms.ownershipPool` đã fence nên cũng nằm sau barrier và cổng đóng (không dùng pool thô của registration). Không coi đây là HA hoặc rolling deployment. Restart hợp lệ vẫn kết thúc ván online bằng `SERVER_RESTART`/`INTERRUPTED`, phòng tự tạo về `WAITING` theo BA 0.17.

Mỗi kết nối phòng lấy shared barrier và kiểm PID chủ singleton trong một câu SQL với CTE materialized. Chỉ nhận kết nối khi cả hai điều kiện đúng; không cache kết quả giữa các lượt checkout và vẫn giữ barrier đến khi trả kết nối.

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

Bearer Supabase được xác minh chữ ký ES256, issuer/audience/role và hạn bằng `jose` + JWKS công khai ngoài transaction; không gọi Auth userinfo từng lệnh. Chỉ cache khóa công khai, không cache token/phiên/quyền. Sau xác minh, tra capability base64url 43 ký tự (băm trong `xiangqi_auth.app_sessions`) và tài khoản hiện hành; transaction game kiểm lại phiên dưới khóa trước khi đọc/ghi. Refresh vẫn qua Auth và kiểm DB trước/sau. JWT còn hạn + khóa đã cache có thể dùng khi Auth API lỗi; thu hồi trực tiếp bearer/key phụ thuộc hạn/cache (xem [login.md](login.md)), còn thu hồi appSession vẫn qua DB. Khách là loại actor riêng. `DIRECT_URL` phải là direct/session pooler, không phải cổng 6543.

## Khách, quyền phòng và media

`GuestModule`/`GuestService` (`account/guest/`) cấp khách qua `POST /account/guest` (HTTP 200, cookie `xiangqi_guest`). `GuestService.expireDue()` chạy trong tick bảo trì mỗi 60 giây; dọn dẹp commit qua `GuestRoomCoordinator` trước khi trả `GUEST_EXPIRED`. `game/game.runtime.ts` ghép `RoomSessionAuthorizer` từ `PostgresMemberRoomAuthorizer` và `GuestRoomAuthorizer`; REST phòng, phòng công khai, realtime và media đều dùng bộ ghép này. Khách đang có ghế AI bị từ chối (503) cho đến khi cổng kết thúc AI được gắn ở giai đoạn AI.

Khách được mở cùng runtime phòng; `/auth/providers` trả `guest: true` khi runtime
này tồn tại. Tạo phiên Khách thành công phải xóa cookie
`xiangqi_session` và `xiangqi_refresh` trước khi append `xiangqi_guest`. Refresh
thành viên trả 401 cũng xóa cookie thành viên hết hiệu lực, để khôi phục Khách
không trộn hai loại proof; 503 giữ cookie để thử lại. GET khôi phục Khách không
xóa cookie thành viên còn hiệu lực. Kiểm tra từ chối proof trộn vẫn giữ nguyên.

Media dùng pool riêng (`MEDIA_POOL_MAX = 3`), tách khỏi pool phòng. Thu hồi media đi qua outbox và chỉ xả sau commit.

## Cơ sở dữ liệu

`supabase/migrations/` có thứ tự và mỗi migration có bản `rollback/` đối ứng; `baseline/` cho bảng cũ. Schema gồm `xiangqi_{auth,realtime,room,chat,social}` và `public`. Migration xác nhận định nghĩa index/constraint hiện có trước khi đổi. Thêm migration mới kèm rollback thay vì sửa cái đã áp dụng.

## Web

`features/*` theo miền; `shared/` cho bàn cờ, UI, token và điều hướng. `features` chỉ import `shared`; `shared` không import `features` hay `app`; chỉ `app/` import tất cả. Trang là `React.lazy` trong `app/AppRouter.tsx`.

`RoomPage` phục vụ WAITING và PLAYING dưới `/rooms/:id`, giữ chat và media gắn liền khi chuyển trạng thái. `useRoomConnection` giữ vòng đời socket, fallback hiển thị HTTP và fencing epoch/version; lệnh và điều phối UI ở container. `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown`, `room-labels.ts` là phần trình bày. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent`; khối chỉ vẽ nhận props, không giữ kết nối hay gọi API. Lỗi camera/mic LiveKit không được làm gián đoạn ván.

## Build và khởi động

`apps/server` không phát ra `dist` cho chính server: `tsconfig.json` không có `outDir`, `build` là `tsc --noEmit` (kiểm tra kiểu toàn bộ `src` và các package TS-source qua path alias). `start` là `tsx src/main.ts`, cùng runtime với `dev`, vì `@xiangqi/shared` và `@xiangqi/xiangqi-core` export mã nguồn TS. Lý do không chọn emit: output lồng sâu (`dist/apps/server/src/...`) vẫn cần tsx để chạy package TS, và đổi vị trí module làm sai đường dẫn tương đối `supabase/certs/prod-ca-2021.crt` trong `account/auth/registration.module.ts` (dựa vào `import.meta.url`). `@xiangqi/engine/compiled` là ngoại lệ: worker AI dùng `packages/engine/dist`, được tạo bởi `pnpm --filter @xiangqi/server... build`.

## Test và CI

`tests/` phản chiếu `apps/`; đặt tên `x.test.ts`, `x.test-helper.ts`, `fixtures.ts`. Push `develop` và PR vào `develop` có thay đổi mã chạy unit/core, lint/typecheck toàn workspace và build chọn theo `.github/scripts/ci-scope.mjs`. PR phát hành chỉ nhận `develop` từ chính repository vào `main`, chạy đủ build/test và sáu shard `tests/server` trước merge; không chạy lại CI khi push `main`. PR chỉ sửa tài liệu vẫn có required checks nhưng bỏ qua job nặng. Protection `main` bắt buộc PR, cập nhật theo base mới nhất và hai required checks, áp dụng cả admin; giữ tên check cũ. Chi tiết: `tests/README.md`, mục "Commit/push nhanh và CI theo phạm vi". Render (`render.yaml`) đặt `autoDeployTrigger: 'off'`: commit mới không tự deploy, và rollout zero-downtime trên gói free không tương thích với `acquireRuntimeLock` (instance mới bị từ chối khi instance cũ còn giữ khóa), nên đường đưa commit lên Render gói free chưa được hỗ trợ. Triển khai production local theo tuần tự dừng trước, khởi động sau: xem `docs/setup/CAU-HINH-MOI-TRUONG.md` mục "Chạy server production local". Web triển khai qua Vercel.
