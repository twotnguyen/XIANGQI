# Design pattern trong server

Bản đồ tên pattern ↔ mã thật của `apps/server/src`. Mục đích là gọi đúng tên những gì dự án đã có để cả nhóm (và người chấm) nhận ra; không phải danh sách pattern phải thêm. Chỉ thêm pattern khi thấy vấn đề thật (xem cuối tài liệu).

## Phân tầng: Controller → Service → Store

Đây là Service Layer: tầng trình bày không biết database, tầng nghiệp vụ không biết HTTP.

| Tầng | Việc | Quy ước tên | Ví dụ |
|---|---|---|---|
| Controller | Nhận HTTP, kiểm tra hình dạng đầu vào, trả mã lỗi | `x.controller.ts` | `game/room/room.controller.ts` |
| Service | Nghiệp vụ, điều phối nhiều store, không viết SQL | `x.service.ts` | `game/room/room-http.service.ts`; miền account: `account/profile/profile.service.ts`, `account/friend/friend.service.ts` |
| Store (Repository) | Toàn bộ SQL của miền | `x.store.ts` | `game/room/room-store.ts` |

Dự án gọi Repository là *store* và không dùng interface cho store (class cụ thể); chỗ cần đảo phụ thuộc dùng *Port* (bên dưới). Đo ngày 26/10/2026 sau khi đồng nhất phân tầng: 11 controller không có SQL và không import `pg`; mọi file store đều chứa SQL; **không file `*service*.ts` nào còn chứa SQL**.

## Các pattern khác đang dùng

| Pattern | Vấn đề giải quyết | Nơi trong code |
|---|---|---|
| **Unit of Work** | Mọi thay đổi của một lệnh nằm trong một transaction, khóa theo thứ tự cố định để không deadlock | `game/room/room-transactions.ts` (`RoomTransactions.withRoom`) và `RoomScope` trong `room.types.ts`; store nhận client của người gọi, không tự mở transaction |
| **Unit of Work (dạng `*Tx` trong miền account/media)** | Service cần nhiều bước kiểm tra xen kẽ truy vấn trong cùng một transaction, nhưng không được viết SQL | `FriendStore.withUser(userId, tx => …)` mở transaction (có khóa actor) rồi đưa `FriendTx` cho `FriendService`; tương tự `MediaStore`/`MediaTx` và `GoogleStore.locked`/`GoogleTx`. `FriendTx` chỉ có phương thức đọc/ghi dữ liệu, mọi quyết định (giới hạn 200 bạn, chặn sau hai lần từ chối…) ở service |
| **Dependency Inversion (Port)** | Miền này gọi miền kia qua interface nhỏ thay vì class cụ thể | `MatchStartPort`, `MatchRoomEndPort`, `ClockPort`, `RoomWorkerPort`, `DrawWorkerPort`, `ClockWorkerPort`, `GuestRoomPort`, `GameDrawPort` |
| **Composition Root / Factory** | Một chỗ duy nhất nối các thành phần, bật/tắt theo cờ môi trường | `main.ts`, các hàm `createXRuntime` trong `*.module.ts`, `game/game.runtime.ts` |
| **Transactional Outbox** | Tác dụng phụ (Socket.IO, thu hồi media) chỉ chạy sau khi commit | bảng `xiangqi_room.outbox`, ghi qua `outbox()` trong store, xả bởi `*-worker.ts` |
| **Idempotent Receiver** | Gửi lại cùng lệnh không làm hai lần | `commandId` và bảng biên lai `xiangqi_room.entry_receipts` |
| **Container / Presentational** (web) | Tách phần giữ trạng thái khỏi phần chỉ vẽ | `RoomPage` giữ kết nối và lệnh; `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown` chỉ nhận props. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent` |

Store lớn được chia theo nhóm lệnh bằng kế thừa (`RoomStoreCore` → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`, `MatchStoreCore` → `MatchDrawStore` → `MatchStore`). Đây là cách tổ chức file, không phải pattern GoF; nơi khác chỉ import `RoomStore` và `MatchStore`.

## Trạng thái phân tầng

Tất cả miền server hiện đi theo Controller → Service → Store; không còn mục lệch đã biết và `layering.test.ts` chặn việc quay lại.

| Miền | Service | Store | Ghi chú |
|---|---|---|---|
| `game/*` (room, match, history, ai, clock, chat) | `*-http.service.ts`, `*.service.ts` | `*-store.ts` | Store nhận `RoomScope` từ `RoomTransactions.withRoom` |
| `account/profile` | `ProfileService` (kiểm tra tên, quy đổi dữ liệu) | `ProfileStore` | |
| `account/friend` | `FriendService` (quy tắc kết bạn, giới hạn, mời phòng) | `FriendStore` + `FriendTx` | thứ tự kiểm tra và truy vấn giữ nguyên bản cũ |
| `account/guest` | `GuestService` (hạn phiên, mục đích truy cập) | `GuestStore` | API công khai không đổi; constructor nhận `GuestStore` |
| `account/google` | `GoogleService` (luật token, nháp đăng ký, gọi Auth) | `GoogleStore` + `GoogleTx` | khóa advisory cấp phiên nằm trong `GoogleStore.locked` |
| `game/media` | `MediaAccess` (cấp token LiveKit, thu hồi) | `MediaStore` + `MediaTx` | lớp vẫn tên `MediaAccess` trong `media.service.ts` |
| `account/auth`, `account/login` | `registration.service.ts`, `login.service.ts`, `session.service.ts` | `registration.store.ts`, `postgres-login-store.ts` | đã đúng từ trước |

Helper `transaction`/`actorLock` dùng chung nằm ở `core/postgres.ts` (trước đây ở `account/google/`).

Giới hạn còn lại, cố ý giữ: store là class cụ thể, không có interface (đảo phụ thuộc chỉ dùng `*Port` giữa các miền game); `createFriendRuntime`/`createProfileRuntime` còn trả `store` mà `main.ts` không dùng.

Quy tắc khi sửa: không viết SQL vào service hay controller; thêm truy vấn mới vào store (hoặc `*Tx`) rồi để service quyết định.

## Giữ phân tầng bằng test

`tests/server/core/layering.test.ts` quét `apps/server/src` (không cần DB) và fail khi:
- một `*.controller.ts` chứa SQL hoặc import `pg`;
- một `*service*.ts` chứa SQL (tính cả `.query(` lẫn `.query<…>(`, bỏ qua comment);
- một `*.store.ts` không chứa SQL (tên không khớp vai trò).

Test này từng bắt `game/ai/ai-http.service.ts` có một truy vấn `SELECT … FROM public.active_players` mà lần đo bằng `grep ".query("` bỏ sót; truy vấn đã chuyển sang `AiReservations.held`.

## Khi nào thêm pattern

Pattern là từ vựng và là cách ghi lại đánh đổi, không phải thước đo chất lượng. Chỉ đưa vào khi đã thấy vấn đề cụ thể (khó mở rộng, đổi nhỏ lan rộng, mã trùng lặp), rồi refactor về pattern; không thêm trước. Nguồn: Erich Gamma, *How to Use Design Patterns* (Artima, 2005).
