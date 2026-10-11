# T18 / XIAN-54: phòng tự tạo

RoomStore nhận PoolClient của giao dịch ngoài, không mở pool/giao dịch/provider HTTP riêng. Root owns HTTP/session guards, shared protocol, RealtimeStore actor-first hook, gateway presence callbacks và scheduler. Không dùng trực tiếp trusted RoomScope từ body client.

## Thứ tự khóa bắt buộc

1. Xác thực provider ngoài giao dịch; prefetch code→room ID/roster nội bộ, không trả private state trước proof.
2. BEGIN/SET LOCAL ROLE app_server; khóa advisory `actor:<uuid>` cho caller và toàn bộ PLAYER roster theo UUID sorted. **Không khóa caller trước rồi khóa đối thủ theo thứ tự tùy ý**: hai Ready đối nhau sẽ deadlock.
3. Recheck principal/member session hoặc GuestService.requireActorInTransaction trên cùng client, trước room lock. Guest `status:ended` phải COMMIT cleanup rồi mới trả lỗi.
4. Khóa rooms sorted; RoomScope chứa chính xác lockedActorIds/lockedRoomIds. RoomRosterChanged(actorIds) yêu cầu ROLLBACK rồi retry bounded với union actor IDs sorted, không thêm actor lock sau room lock. room() rechecks roster trước mutation/snapshot.
5. Lệnh T12 trên cùng client dùng receipt T12; create/join trước membership dùng entry_receipts24h. Guest finishActorMutation gọi sau mutation trước COMMIT. Không throw để undo expired-seat cleanup: presence() trả `seat-expired`, commit trước thông báo.

RoomScope.activeActorIds là các proof còn active đã được worker/root kiểm mới cho **cả hai** người chơi; không dùng sự tồn tại profile/presence làm proof. Không cung cấp set này thì countdown bị hủy an toàn. Session provider proof ngoài locks, app session/Guest expiry DB recheck trong transaction. Guest deferred existing-room được tiếp tục Ready/ván cùng phòng; không cấp new-room/join-room.

## API local

- create(scope,{commandId,name,timeMinutes?,viewerLimit?}) → roomId/version/role RED/inviteCode. Defaults10phút/5viewer, CODE_ONLY; Unicode NFC/name filter. Crypto code8, collision retries5. Entry receipt fingerprint rejects changed content.
- resolveCode(client,code) → roomId chỉ cho authenticated admission nội bộ; code không bỏ qua LOCKED/auth/seat/capacity. Root trả link `/rooms/:id`, không dùng host/header không tin cậy để sinh absolute URL.
- join(scope,{commandId,roomId,intent,expectedVersion?}), snapshot, switchSeat, ready.
- create/join initially retain a seat for60s before first controlling socket; verified connection clears disconnected_at. A lost create response cannot reserve an offline seat indefinitely. Connected lone Host vẫn chờ vô hạn.
- presence(scope,id,proof,connected) chỉ được gọi từ trusted **current controller** callback. Root xác nhận connectionId/generation trong T12 controllers; không nhận proof này từ JSON. Callback disconnect có connection+generation+instance fence; tab readonly cũ không làm offline controller mới. WAITING/FINISHED reconnect >=60s mất ghế; PLAYING fail closed chờ T20 lifecycle, không tự release active match.
- startDue requires MatchStartPort.start(client,input) tạo actual match/clock trong cùng transaction, không HTTP/external write. Token+room serialization fences retries. Thiếu port hủy/reset countdown, WAITING giữ nguyên; fixture factory là synthetic SQL, không production game.
- onMatchEnded(scope,{roomId,matchId}) chỉ nhận match cùng phòng đã FINISHED/INTERRUPTED trong DB, trả self-created room về WAITING/reset Ready/clear reservation match_id, giữ ghế/Host/viewer/chat/media; duplicate old-match callback không reset countdown mới. T20 gọi sau actual outcome trên cùng client.
- leave, expireDisconnected, recoverWaiting; no-player CLOSED, Host transfer, room chat DELETE same transaction và durable chat.deleted/media.revoke-room/room.closed IDs-only outbox. Lệnh leave cần terminal response/receipt policy của root; hiện T12 authorize trước replay không thể trả snapshot sau khi membership đã xóa. Root có thể dùng HTTP leave entry response hoặc terminal public notice riêng, không mở quyền đọc private state cho ex-member.
- dueRooms/pendingEvents/markDelivered/markFailed dùng client app_server của root scheduler. dueRooms bounded50; outbox retry exponential1..60s, at-least-once eventid dedupe. Root sink reauth recipients; terminal closed notice dùng recipients IDs và fresh proof, không gửi private snapshot sau revoke membership.

RoomWorker.tick orchestrates caller-provided clients/transactions/sink, không tự chạy timer. Root serialize ticks và startup recoverWaiting **trước** xử lý countdown. Worker transaction may close final expired seat; skip startDue after close, không rollback closure. Stale due-room race/RoomRosterChanged được root retry/ignore theo typed errors, SQL/provider errors vẫn generic outward.

Single backend lifecycle: boot instance UUID mới invalidate old presence, reset Ready/countdown, giữ ghế60s từ boot (disconnected_at có sẵn không kéo dài). Không claim HA đa-node/lease. PLAYING interruption/outcome/clock/resign thuộc T20; absent port giữ seat/history và fail503.

## Guest port

RoomGuestPort.seatedSeat union active_players và PLAYER membership ở open room, cả AI match roomNULL. Không coi AI là no-seat. end mặc định GUEST_UNAVAILABLE cho đến root cung cấp full same-client termination (room/match/chat/media/structured snapshot PII scrub); không giả UPDATE profile là đủ xóa PII. Guest integration test dùng synthetic no-history/no-media fixture cleanup và GuestService thật để chứng minh12h/defer/final-leave đồng giao dịch. Production full cleanup còn gate riêng.

## Migration000006

Requires audited baseline +000001..000005. Legacy invite_code/viewer_limit NULL, PUBLIC/time0/data preserved; future defaults CODE_ONLY/600/5. Managed settings immutable, active_players PK(user_id) reserves WAITING/FINISHED as well. Existing open PLAYER seats must already have matching reservation; any repair/backfill need → abort aggregate error, no history/identity rewrite. Deferred managed-seat consistency prevents moving reservation while old seat remains. New private tables FORCE RLS, browser no schema/table/function rights; active_players thêm UPDATE(room_id,match_id), giữ other ACL.

Rollback only before feature writes; metadata/defaults/ACL/function body/trigger checks refuse unknown changes. Functions body fingerprints deliberately pin exact000006 source; edit migration functions only with reviewed matching rollback/hash/test update. No DROP CASCADE/data repair. Rollback restores original defaults/column privileges/FK metadata and preserves legacy rows. New data requires separate reviewed data-preserving migration, không dùng rollback này.

## Kiểm tra synthetic

Dedicated PostgreSQL17 trên127.0.0.1:55446/xiangqi_room_test. URL guard rejects host/port/db/query/fragment khác trước reset. Full audited baseline replay, fake managed Auth dependency chỉ dùng test; không seed user thật hoặc gửi email. Node22:

```sh
ROOM_TEST_DATABASE_URL=postgresql://room_test_admin@127.0.0.1:55446/xiangqi_room_test pnpm exec vitest run apps/server/src/room/room.test.ts
pnpm exec eslint apps/server/src/room
pnpm --filter @xiangqi/server typecheck
pnpm --filter @xiangqi/server build
```

25 SQL tests: create/settings/code/privacy/idempotency/unique seat; Ready/lone switch/viewerlimit; countdown/factory rollback/retry/one SQL match; oldtab disconnect/restart/60s; Guest12h/AI seat/sameclient release; durable outbox retry; additive legacy/rollback/ACL/function/trigger/reservation guards. Full T18 chưa Done: actual T20 engine/match/REDclock adapter, HTTP/Socket runtime and current-controller proof wiring, frontend countdown sound/navigation, production Guest full PII termination, chat/media actual outbox delivery cần root integration + E2E proof. Jira unchanged/read-only, chưa live DDL.

Worker tiếp tục xử lý các phòng và outbox sau lỗi giao dịch của một mục; lỗi được gom báo sau batch. Lỗi gửi sự kiện giữ backoff/at-least-once, ack thất bại không chặn sự kiện đã commit khác. Hai regression unit tests kiểm tiến độ này; 25 SQL cases kiểm nghiệp vụ riêng.
