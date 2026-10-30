# T18 / XIAN-54: phòng tự tạo

> Cấu trúc thư mục: `public/` chứa danh sách phòng công khai (feed, service, store, controller, module). Phần nối kết cả miền game nằm ở `apps/server/src/game/game.runtime.ts`.

RoomStore nhận PoolClient của giao dịch ngoài, không mở pool/giao dịch/provider HTTP riêng. Root owns HTTP/session guards, shared protocol, RealtimeStore actor-first hook, gateway presence callbacks và scheduler. Không dùng trực tiếp trusted RoomScope từ body client.

## Thứ tự khóa bắt buộc

1. Xác thực provider ngoài giao dịch; prefetch code→room ID/roster nội bộ, không trả private state trước proof.
2. BEGIN/SET LOCAL ROLE app_server; khóa advisory `actor:<uuid>` cho caller và toàn bộ PLAYER roster theo UUID sorted. **Không khóa caller trước rồi khóa đối thủ theo thứ tự tùy ý**: hai Ready đối nhau sẽ deadlock.
3. Recheck principal/member session hoặc GuestService.requireActorInTransaction trên cùng client, trước room lock. Guest `status:ended` phải COMMIT cleanup rồi mới trả lỗi.
4. Khóa rooms sorted; RoomScope chứa chính xác lockedActorIds/lockedRoomIds. RoomRosterChanged(actorIds) yêu cầu ROLLBACK rồi retry bounded với union actor IDs sorted, không thêm actor lock sau room lock. room() rechecks roster trước mutation/snapshot.
5. Lệnh T12 trên cùng client dùng receipt T12; create/join trước membership dùng entry_receipts24h. Guest finishActorMutation gọi sau mutation trước COMMIT. Không throw để undo expired-seat cleanup: presence() trả `seat-expired`, commit trước thông báo.

RoomScope.activeActorIds là các proof còn active đã được worker/root kiểm mới cho **cả hai** người chơi; không dùng sự tồn tại profile/presence làm proof. Không cung cấp set này thì countdown bị hủy an toàn. Session provider proof ngoài locks, app session/Guest expiry DB recheck trong transaction. Guest deferred existing-room được tiếp tục Ready/ván cùng phòng; không cấp new-room/join-room.

## API local

- create(scope,{commandId,timeMinutes?,viewerLimit?,visibility?}) → roomId/version/role RED/inviteCode. Mặc định 10 phút/5 người xem, `CODE_ONLY`; chỉ nhận `CODE_ONLY` hoặc `PUBLIC`, từ chối `LOCKED` khi tạo. Ghi quyền truy cập đã chọn ngay trong giao dịch tạo phòng; `PUBLIC` ghi `public_opened_at` và được catalog Sảnh đọc sau commit, không gọi lệnh đổi quyền riêng. Máy chủ tự sinh UUID và mã 8 chữ số bằng crypto, thử lại tối đa 5 lần khi trùng mã; lưu tên hiển thị `Phòng <mã>`, không nhận tên từ client. Entry receipt fingerprint phân biệt quyền truy cập cùng mức giờ/số người xem; `CODE_ONLY` giữ fingerprint cũ và tương đương bỏ trống `visibility`. ID/mã tự sinh không thuộc fingerprint; gửi lại cùng lệnh trả phòng đã tạo, đổi quyền truy cập với cùng commandId bị từ chối. Không đổi phòng cũ, không cần migration.
- resolveCode(client,code) → roomId chỉ cho authenticated admission nội bộ; code không bỏ qua LOCKED/auth/seat/capacity. Root trả link `/rooms/:id`, không dùng host/header không tin cậy để sinh absolute URL.
- join(scope,{commandId,roomId,intent,expectedVersion?}), snapshot, switchSeat, ready.
- create/join initially retain a seat for60s before first controlling socket; verified connection clears disconnected_at. A lost create response cannot reserve an offline seat indefinitely. Connected lone Host vẫn chờ vô hạn.
- presence(scope,id,proof,connected) chỉ được gọi từ trusted **current controller** callback. Root xác nhận connectionId/generation trong T12 controllers; không nhận proof này từ JSON. Callback disconnect có connection+generation+instance fence; tab readonly cũ không làm offline controller mới. WAITING/FINISHED reconnect >=60s mất ghế; PLAYING fail closed chờ T20 lifecycle, không tự release active match.
- startDue requires MatchStartPort.start(client,input) tạo actual match/clock trong cùng transaction, không HTTP/external write. Token+room serialization fences retries. Thiếu port hủy/reset countdown, WAITING giữ nguyên; fixture factory là synthetic SQL, không production game.
- onMatchEnded(scope,{roomId,matchId}) chỉ nhận match cùng phòng đã FINISHED/INTERRUPTED trong DB, trả self-created room về WAITING/reset Ready/clear reservation match_id, giữ ghế/Host/viewer/chat/media; duplicate old-match callback không reset countdown mới. T20 gọi sau actual outcome trên cùng client.
- leave, expireDisconnected, recoverWaiting; no-player CLOSED, Host transfer, room chat DELETE same transaction và durable chat.deleted/media.revoke-room/room.closed IDs-only outbox. Lệnh leave cần terminal response/receipt policy của root; hiện T12 authorize trước replay không thể trả snapshot sau khi membership đã xóa. Root có thể dùng HTTP leave entry response hoặc terminal public notice riêng, không mở quyền đọc private state cho ex-member.
- dueRooms/pendingEvents/markDelivered/markFailed dùng client app_server của root scheduler. dueRooms bounded50; outbox retry exponential1..60s, at-least-once eventid dedupe. Root sink reauth recipients; terminal closed notice dùng recipients IDs và fresh proof, không gửi private snapshot sau revoke membership. `pendingEvents` loại trừ `media.revoke-room` và `media.revoke-user`; hai loại này do vòng media riêng xử lý.

RoomWorker.tick orchestrates caller-provided clients/transactions/sink, không tự chạy timer. Root serialize ticks và startup recoverWaiting **trước** xử lý countdown. Worker transaction may close final expired seat; skip startDue after close, không rollback closure. Stale due-room race/RoomRosterChanged được root retry/ignore theo typed errors, SQL/provider errors vẫn generic outward.

Single backend lifecycle: boot instance UUID mới invalidate old presence, reset Ready/countdown, giữ ghế60s từ boot (disconnected_at có sẵn không kéo dài). Không claim HA đa-node/lease. PLAYING interruption/outcome/clock/resign thuộc T20; absent port giữ seat/history và fail503.

## Đường tạo phòng và kết nối ban đầu

Projection room/actor dùng một truy vấn CTE nhưng vẫn đọc lại sau khi khóa,
giữ đủ roster, thứ tự advisory lock và retry hiện có. `BEGIN`/`SET LOCAL ROLE`
đi chung một lượt gửi. Session/profile được khóa trong CTE `MATERIALIZED`;
`clock_timestamp()` kiểm hạn ở SELECT ngoài, sau khi CTE đã chờ đủ các khóa,
không cần lượt SQL riêng. Vẫn kiểm lại quyền sau khi khóa phòng.
Kiểm giới hạn ghế và phòng Khách được gộp, giữ ưu tiên lỗi `ALREADY_SEATED`.

Realtime kiểm quyền qua `RoomStore.authorize`: đọc cùng membership đã khóa (một SELECT, không thêm truy vấn), trả `canControl` và `version` của phòng từ cùng dòng đó, đồng thời kiểm hạn người xem. Không dựng countdown/offers/presence/spectators để lấy quyền.
Snapshot đầy đủ vẫn được đọc từ server khi gửi giao diện; không
bỏ kiểm quyền hoặc cấp quyền điều khiển từ dữ liệu frontend.

Snapshot đọc phòng, roster, countdown, người xem, presence và offer trong MỘT SELECT: phòng LEFT JOIN roster, CROSS JOIN một dòng nguồn snapshot. Khi cache kiểm tra bảng offer đã sẵn sàng, snapshot chỉ còn một truy vấn. Các bảng offer tùy chọn vẫn được dò khi dùng lần đầu; không cache dữ liệu phòng và không đổi contract.
Đề nghị đổi bên: `room.swapCooldownUntil` (ISO tuyệt đối, server tính `resolved_at + 60s`) chỉ có cho người gửi có đề nghị DECLINED/EXPIRED trong 60 giây; các người khác và đề nghị WITHDRAWN luôn `null`. Đọc từ cùng SELECT snapshot, không thêm truy vấn hay migration; cùng điều kiện `swapCooldownOpen` với `proposeSwap`.
Thành phần ghế đổi phải đi qua `cancel` (hủy countdown, reset Sẵn sàng cả phòng)
và đóng đề nghị đổi ghế đang chờ. Cả `toSpectator` và `moveToSpectator` dùng cùng
cleanup này; không chỉ reset cờ của người vừa rời ghế.
Nếu bảng biến mất sau khi đã dò, lỗi SQL được trả lên, không retry trong giao dịch
đã lỗi. Gateway gửi snapshot đã commit từ admission, không đọc lại toàn bộ phòng.

Contract `RoomEntry`, receipt chống trùng, mã mời và outbox không thay đổi;
không cần migration cho các tối ưu này.

Tạo phòng ghi `active_players`, ghế Host và outbox `room.created` bằng một CTE
trong cùng giao dịch; insert `public.rooms` vẫn riêng để retry khi trùng mã.
Receipt, khóa actor/phòng và thứ tự khóa không đổi.

## Guest port

RoomGuestPort.seatedSeat: ghế là ván AI (`active_players.ai_game_id`) hoặc PLAYER membership trong phòng chưa đóng, kể cả WAITING sau ván. Theo BA 0.3/1.3, Khách quá 12 giờ được tiếp tục đúng phòng đang giữ ghế, không tạo/vào ghế phòng khác; rời ghế/ván mới kết thúc phiên và dọn PII. SPECTATOR không được gia hạn như người giữ ghế. `end(reason='logout')` chỉ đòi `confirmedResign` khi thực sự PLAYING hoặc có AI; WAITING rời phòng không xử thua. Root cung cấp full same-client termination (room/match/chat/media/structured snapshot PII scrub), không giả UPDATE profile là đủ xóa PII.

## Migration000006

Requires audited baseline +000001..000005. Legacy invite_code/viewer_limit NULL, PUBLIC/time0/data preserved; future defaults CODE_ONLY/600/5. Managed settings immutable, active_players PK(user_id) reserves WAITING/FINISHED as well. Existing open PLAYER seats must already have matching reservation; any repair/backfill need → abort aggregate error, no history/identity rewrite. Deferred managed-seat consistency prevents moving reservation while old seat remains. New private tables FORCE RLS, browser no schema/table/function rights; active_players thêm UPDATE(room_id,match_id), giữ other ACL.

Rollback only before feature writes; metadata/defaults/ACL/function body/trigger checks refuse unknown changes. Functions body fingerprints deliberately pin exact000006 source; edit migration functions only with reviewed matching rollback/hash/test update. No DROP CASCADE/data repair. Rollback restores original defaults/column privileges/FK metadata and preserves legacy rows. New data requires separate reviewed data-preserving migration, không dùng rollback này.

## Kiểm tra synthetic

Dedicated PostgreSQL17 trên127.0.0.1:55446/xiangqi_room_test. URL guard rejects host/port/db/query/fragment khác trước reset. Full audited baseline replay, fake managed Auth dependency chỉ dùng test; không seed user thật hoặc gửi email. Node22:

```sh
ROOM_TEST_DATABASE_URL=postgresql://room_test_admin@127.0.0.1:55446/xiangqi_room_test pnpm exec vitest run tests/server/game/room/room.test.ts
pnpm exec eslint apps/server/src/game/room tests/server/game/room
pnpm --filter @xiangqi/server typecheck
pnpm --filter @xiangqi/server build
```

25 SQL tests: create/settings/code/privacy/idempotency/unique seat; Ready/lone switch/viewerlimit; countdown/factory rollback/retry/one SQL match; oldtab disconnect/restart/60s; Guest12h/AI seat/sameclient release; durable outbox retry; additive legacy/rollback/ACL/function/trigger/reservation guards. Full T18 chưa Done: actual T20 engine/match/REDclock adapter, HTTP/Socket runtime and current-controller proof wiring, frontend countdown sound/navigation, production Guest full PII termination, chat/media actual outbox delivery cần root integration + E2E proof. Jira unchanged/read-only, chưa live DDL.

Worker tiếp tục xử lý các phòng và outbox sau lỗi giao dịch của một mục; lỗi được gom báo sau batch. Lỗi gửi sự kiện giữ backoff/at-least-once, ack thất bại không chặn sự kiện đã commit khác. Hai regression unit tests kiểm tiến độ này; 25 SQL cases kiểm nghiệp vụ riêng.

## Bảo trì receipts và thu hồi media

Runtime dọn `xiangqi_room.entry_receipts` hết hạn ngay ở tick đầu và mỗi phút:
tối đa 500 hàng/giao dịch, dùng index expiry và `FOR UPDATE SKIP LOCKED`.
Còn đủ batch thì tiếp tục sau một giây; lock timeout 250 ms tránh giữ vòng
bảo trì khi có giao dịch khác. Biên lai chưa hết hạn không bị xóa.
Realtime receipts vẫn do gateway dọn mỗi phút, nay giới hạn 500 hàng/lượt.

`media.revoke-room` có vòng xử lý riêng, single-flight và được drain lúc đóng
runtime; HTTP LiveKit không chặn đồng hồ, chuyển trạng thái phòng hoặc chat.
Chỉ đánh dấu outbox đã giao sau khi xóa cả phòng media riêng và stage, hoặc
LiveKit trả HTTP 404 với mã `not_found`. Lỗi khác giữ sự kiện và backoff.

`media.revoke-user` được ghi trong cùng giao dịch với việc xóa membership khi kick người xem hoặc rời phòng còn mở. Khi đóng phòng không ghi sự kiện theo người dùng, vì `media.revoke-room` đã thu hồi cả phòng. Vòng media kiểm tra payload `userId` là UUID trước khi gọi provider; payload lỗi giữ sự kiện ở trạng thái thất bại có backoff. `MediaAccess.revoke(roomId, userId, eventId)` xử lý đúng một event: trong khóa advisory `media:<roomId>:<userId>` (ID đã chuẩn hóa chữ thường), nếu event đã được ack thì trả về ngay, không gọi provider. Nếu còn chờ, service snapshot mọi event `media.revoke-user` chưa ack của cặp đó, gọi `RemoveParticipant` đúng một lần cho mỗi batch trên phòng riêng và phòng stage (404 `not_found` coi như đã gỡ), rồi mới ack đúng các ID đã snapshot. Event tạo thêm trong lúc gọi HTTP không nằm trong batch và không bị ack nhầm. Nếu một phòng lỗi, không ack event nào trong batch và worker thử lại sau backoff. Không có bỏ qua theo thành viên: người đã rời rồi vào lại vẫn bị gỡ khỏi phiên LiveKit cũ trước khi nhận token mới.

Cấp token (`tokenFor`) cũng giữ cùng khóa `media:<roomId>:<userId>`. Trước khi đọc vai trò, nó snapshot và gỡ mọi `media.revoke-user` đang chờ của cặp đó rồi ack, sau đó mới đọc lại membership hiện tại và cấp token theo vai trò. Vì vậy event cũ do worker lấy trước đó không thể gỡ token mới cấp; một người từ PLAYER xuống SPECTATOR chỉ nhận token stage chỉ-nghe sau khi quyền phát cũ đã bị gỡ. Thất bại của provider làm `tokenFor` lỗi và không cấp token. Khóa này không dùng khóa actor hay khóa phòng của ván/đồng hồ/chat, và không được giữ khi gọi LiveKit để khóa các thao tác đó. Đánh đổi: khóa giữ một kết nối DB trong lúc gọi HTTP LiveKit, nên chỉ làm chậm cấp token của đúng cặp người dùng–phòng đó. Hết hạn token chỉ ngăn token cũ được dùng để vào phòng; token hết hạn không tự cắt kết nối LiveKit đang mở.

Media là phụ trợ: outage hoặc chậm của LiveKit không chặn đồng hồ, chuyển trạng thái ván, chat hay worker phòng. Runtime gọi revoke với `event.id` và vẫn gọi `markDelivered` sau khi thành công (idempotent); việc ack theo từng người dùng do service đảm nhiệm.
API server dùng HTTPS tương ứng URL WSS; `DeleteRoom` cần grant `roomCreate`,
`RemoveParticipant` dùng `roomAdmin` kèm đúng tên phòng. Không log token/khóa.

## Public feed: catalog dùng chung theo tick

- `PublicRoomCatalog` (`public/public-room-catalog.ts`) đọc danh sách phòng PUBLIC một lần cho mỗi tick (cache `WeakMap` theo định danh tick). Truy vấn catalog không nhận actor, giữ `visibility='PUBLIC'` và `LIMIT 50` trong SQL.
- Mỗi người đọc vẫn xác thực riêng trong `withRoom` (prepare, lock, reauthorize) trước khi nhận dữ liệu. Phiên bị thu hồi hoặc hết hạn không nhận dòng nào; lỗi auth chỉ ảnh hưởng người đọc đó.
- Single-flight theo tick: người đọc cùng tick nhận cùng một promise (kể cả khi đã xong hoặc lỗi). Tick mới không dùng lại lần tải đang chạy: nó xếp hàng sau lần tải đó và tự truy vấn mới, nên tối đa một truy vấn catalog chạy tại một thời điểm. Người đọc tick cũ đến muộn vẫn nhận kết quả của tick cũ, không sinh truy vấn mới. Lỗi chỉ được chia sẻ trong đúng tick đó; tick sau tải lại.
- Tham số: `PUBLIC_FEED_POLL_MS = 1000` (không đổi), `LIMIT 50`.
- Người đọc có xác thực kết thúc sau khi tick kế tiếp bắt đầu vẫn nhận kết quả của tick mình; không kích hoạt truy vấn catalog mới. Xác thực vẫn được kiểm tra riêng trong transaction của người đó.
- Số đo trước/sau (số truy vấn catalog, số transaction và tổng số câu lệnh mỗi tick với 50 người đọc) lấy từ probe `tests/load/public-feed-query-probe.ts` chạy trên DB test cục bộ (`PUBLIC_FEED_PROBE_SERVER_SRC` trỏ về baseline HEAD để so sánh). Không có số liệu trong tài liệu này.
