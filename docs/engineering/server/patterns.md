# Design pattern trong server

Bản đồ tên pattern ↔ mã thật của `apps/server/src`. Mục đích là gọi đúng tên những gì dự án đã có để cả nhóm (và người chấm) nhận ra; không phải danh sách pattern phải thêm. Chỉ thêm pattern khi thấy vấn đề thật (xem cuối tài liệu).

## Phân tầng: Controller → Service → Store

Đây là Service Layer: tầng trình bày không biết database, tầng nghiệp vụ không biết HTTP.

| Tầng | Việc | Quy ước tên | Ví dụ |
|---|---|---|---|
| Controller | Nhận HTTP, kiểm tra hình dạng đầu vào, trả mã lỗi | `x.controller.ts` | `game/room/room.controller.ts` |
| Service | Nghiệp vụ, điều phối nhiều store, không viết SQL | `x.service.ts` | `game/room/room-http.service.ts` |
| Store (Repository) | Toàn bộ SQL của miền | `x.store.ts` | `game/room/room-store.ts` |

Dự án gọi Repository là *store* và không dùng interface cho store (class cụ thể); chỗ cần đảo phụ thuộc dùng *Port* (bên dưới). Đo ngày 26/10/2026: 11 controller đều không có SQL và không import `pg`; 17 file store (tính cả các lớp tách của `RoomStore`, `MatchStore`) đều chứa SQL.

## Các pattern khác đang dùng

| Pattern | Vấn đề giải quyết | Nơi trong code |
|---|---|---|
| **Unit of Work** | Mọi thay đổi của một lệnh nằm trong một transaction, khóa theo thứ tự cố định để không deadlock | `game/room/room-transactions.ts` (`RoomTransactions.withRoom`) và `RoomScope` trong `room.types.ts`; store nhận client của người gọi, không tự mở transaction |
| **Dependency Inversion (Port)** | Miền này gọi miền kia qua interface nhỏ thay vì class cụ thể | `MatchStartPort`, `MatchRoomEndPort`, `ClockPort`, `RoomWorkerPort`, `DrawWorkerPort`, `ClockWorkerPort`, `GuestRoomPort`, `GameDrawPort` |
| **Composition Root / Factory** | Một chỗ duy nhất nối các thành phần, bật/tắt theo cờ môi trường | `main.ts`, các hàm `createXRuntime` trong `*.module.ts`, `game/game.runtime.ts` |
| **Transactional Outbox** | Tác dụng phụ (Socket.IO, thu hồi media) chỉ chạy sau khi commit | bảng `xiangqi_room.outbox`, ghi qua `outbox()` trong store, xả bởi `*-worker.ts` |
| **Idempotent Receiver** | Gửi lại cùng lệnh không làm hai lần | `commandId` và bảng biên lai `xiangqi_room.entry_receipts` |
| **Container / Presentational** (web) | Tách phần giữ trạng thái khỏi phần chỉ vẽ | `RoomPage` giữ kết nối và lệnh; `RoomSeats`, `RoomInvite`, `RoomDetails`, `RoomCountdown` chỉ nhận props. `XiangqiBoard` ghép `BoardGrid`, `BoardDefs`, `PieceContent` |

Store lớn được chia theo nhóm lệnh bằng kế thừa (`RoomStoreCore` → `RoomSwapStore` → `RoomViewerStore` → `RoomStore`, `MatchStoreCore` → `MatchDrawStore` → `MatchStore`). Đây là cách tổ chức file, không phải pattern GoF; nơi khác chỉ import `RoomStore` và `MatchStore`.

## Chỗ chưa đúng phân tầng (đã biết)

| Miền | Hiện trạng | Quy mô (đo bằng đếm `.query(`) |
|---|---|---|
| `account/profile`, `account/friend` | Controller gọi store trực tiếp, không có Service; nghiệp vụ (kiểm tra tên hiển thị, quy tắc kết bạn) nằm trong store. Hai file đã đổi tên `.service.ts` → `.store.ts` để tên khớp vai trò | profile 109 dòng / 3 lệnh SQL; friend 452 dòng / 37 lệnh |
| `account/google` (`GoogleService`) | Service chứa SQL | 580 dòng / 31 lệnh |
| `account/guest` (`GuestService`) | Service chứa SQL | 303 dòng / 10 lệnh |
| `game/media` (`MediaAccess`) | Lớp truy cập chứa SQL | 307 dòng / 5 lệnh |

Quy tắc xử lý: khi phải chạm vào các file này thì tách SQL sang `*.store.ts` và để nghiệp vụ ở service; không viết thêm SQL vào service, không refactor hàng loạt riêng một PR.

## Khi nào thêm pattern

Pattern là từ vựng và là cách ghi lại đánh đổi, không phải thước đo chất lượng. Chỉ đưa vào khi đã thấy vấn đề cụ thể (khó mở rộng, đổi nhỏ lan rộng, mã trùng lặp), rồi refactor về pattern; không thêm trước. Nguồn: Erich Gamma, *How to Use Design Patterns* (Artima, 2005).
