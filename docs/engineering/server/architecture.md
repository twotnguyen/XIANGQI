# Kiến trúc server và web

Tham khảo khi viết hoặc review mã server, hoặc khi chạm khởi động, giao dịch và khóa, realtime, xác thực, migration. Các quy tắc ngắn áp dụng cho mọi việc nằm ở `AGENTS.md`; tên pattern và trạng thái phân tầng ở [patterns.md](patterns.md); hợp đồng từng miền ở các file cùng thư mục.

## Khởi động theo cờ

`apps/server/src/main.ts` nối các factory `createXRuntime` theo thứ tự registration → google → media → rooms → friends → history → profile. Mỗi factory chỉ gắn khi cờ `*_ENABLED` của nó là `true`, và kiểm tra schema/quyền DB lúc boot (lỗi "... migration is not ready" hoặc "... database unavailable"). Phòng cần đăng nhập và đăng ký. `game/game.runtime.ts` nối cả miền game (room, match, clock, chat, realtime, worker).

Mỗi miền gồm `x.types.ts`, `x.module.ts` (chứa `createXRuntime`), `x.controller.ts`, `x.service.ts`, thêm `*.store.ts`, `*-worker.ts`, `*-port.ts` khi miền lớn.

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

Feed Sảnh (`game/room/public/public-room-feed.ts`) đọc mỗi `PUBLIC_FEED_POLL_MS` = 1000 ms để đáp ứng AC-06.2.3 và AC-06.2.15 (≤ 2 giây). Mỗi tick là một transaction cho mỗi kết nối (đo ngày 26/10/2026: khoảng 7 câu lệnh, chưa tính xác thực). Không nâng chu kỳ khi chưa hỏi PO.

## Xác thực hai lớp

Bearer Supabase (xác minh ngoài transaction) cộng khả năng phiên ứng dụng: chuỗi base64url 43 ký tự, được băm trong `xiangqi_auth.app_sessions`. Khách là loại actor riêng. `DIRECT_URL` phải là direct/session pooler, không phải cổng 6543.

## Cơ sở dữ liệu

`supabase/migrations/` có thứ tự và mỗi migration có bản `rollback/` đối ứng; `baseline/` cho bảng cũ. Schema gồm `xiangqi_{auth,realtime,room,chat,social}` và `public`. Migration xác nhận định nghĩa index/constraint hiện có trước khi đổi. Thêm migration mới kèm rollback thay vì sửa cái đã áp dụng.

## Web

`features/*` theo miền; `shared/` cho bàn cờ, UI, token và điều hướng. `features` chỉ import `shared`; `shared` không import `features` hay `app`; chỉ `app/` import tất cả. Trang là `React.lazy` trong `app/AppRouter.tsx`.

`RoomPage` phục vụ WAITING và PLAYING dưới `/rooms/:id`, giữ chat và media gắn liền khi chuyển trạng thái. Khối trình bày đã tách ra `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown`, `room-labels.ts`; hook kết nối và lệnh (chống race bằng epoch/ref) ở lại trong `RoomPage`. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent`. Khối chỉ vẽ chỉ nhận props, không giữ kết nối, `ref` hay lệnh gọi API. Lỗi camera/mic LiveKit không bao giờ được làm gián đoạn ván.

## Test và CI

`tests/` phản chiếu `apps/`; đặt tên `x.test.ts`, `x.test-helper.ts`, `fixtures.ts`. `.github/workflows/ci.yml`: job lint, typecheck và build chọn theo diff (`.github/scripts/ci-scope.mjs`); trên `main` thêm unit/core và 6 shard `tests/server` chạy tuần tự, gom bởi `Database Integration Gate`. Server triển khai qua `render.yaml` (`autoDeploy: true`), web qua Vercel.
