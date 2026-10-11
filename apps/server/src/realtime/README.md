# T12 — hợp đồng khung realtime và kế hoạch triển khai

> For agentic workers: execute this plan inline with superpowers:executing-plans and test-driven-development. Root owns integration, dependencies, Git, CI and live services.

**Goal:** cung cấp Socket.IO có xác thực, phân quyền phòng, biên lai bền 24 giờ, phiên bản chính thức và tiếp quản tab an toàn để các Task phòng/ván tích hợp.

**Architecture:** PostgreSQL transaction cùng advisory lock theo phòng tuần tự hóa mutation và ghi biên lai. Collaborator nghiệp vụ nhận chính `PoolClient` đang trong transaction; không phát side effect bên ngoài trước commit. Tab/controller được lưu trong schema riêng nên reconnect sau restart không khiến tab cũ lấy quyền.

**Tech stack:** TypeScript strict, Socket.IO, pg, Vitest, socket.io-client chỉ trong test. Contract trong `packages/shared/src/realtime.ts` không dùng `any`.

**Spec:** XIAN-48/T12 Description tại `jira/reports/JIRA-MUC-CHI-TIET.md`; US-00.3; BA1.8/3.3/10.1. Root ACK kiến trúc ngày11/10/2026 trong chat.

## Giới hạn

- Auth resolver được root nối với Supabase/session/account thật; test dùng identity fixture riêng, không tuyên bố GATE-AUTH đạt.
- Room collaborator kiểm membership và quyền từng lệnh, cung cấp snapshot theo người nhận, thực thi state mutation trong cùng SQL transaction. Chưa triển khai phòng, đồng hồ, chat, luật, AI hoặc media.
- Schema mới `xiangqi_realtime`; không đổi schema T04 hoặc bảng legacy room_command_receipts. Tham chiếu auth.users/public.rooms đã tồn tại; không chạy migration live.
- Socket.IO dùng tên sự kiện `room.command`, `room.snapshot`, `session.takeover`, `session.read_only`. Handshake: accessToken, appSession, roomId, tabId. appSession là capability 43 ký tự base64url; thiếu hoặc sai bị từ chối. UUID tabId ổn định qua reconnect và khác ở tab mới; frontend lưu sessionStorage, không dùng localStorage chung giữa tab.
- Identity có userId và kind member/guest; room authorization được kiểm lại trước snapshot/receipt replay/mutation. Collaborator chịu trách nhiệm quyền vai trò và policy phiên chính thức; socket không tin userId/role từ client.
- Receipt key: actorId+roomId+commandId. Request fingerprint bao gồm type/payload/expectedVersion; cùng ID đổi payload trả COMMAND_ID_REUSED, không ghi đè kết quả.
- Tab đã biết chỉ reconnect vào quyền hiện có; tabId mới tiếp quản. `session.takeover` là hành động chủ động. ConnectionId fencing vô hiệu hóa socket cũ ngay cả khi dùng cùng tabId. Control persisted theo actor+room, generation tăng, tab cũ reconnect sau restart vẫn readonly.
- Authorization hiện hành và quyền tab được kiểm trước replay; response không phát riêng tư cho người đã mất quyền phòng. Callback ack trả kết quả cũ khi retry hợp lệ; snapshot đồng bộ hiện tại phát riêng từ collaborator.
- Receipt chứa snapshot/kết quả chính thức, không chứa access token/password/OTP/request chat. Chưa có chat command trong contract. Receipt expires_at=created_at+24h; đọc bỏ receipt đã hết hạn, maintenance DELETE mỗi phút/startup.

## Hợp đồng

`IdentityResolver.resolve(accessToken: string, appSession: string): Promise<RealtimeIdentity>` từ root.

`RoomCollaborator.authorize(client, identity, roomId): Promise<RoomAccess>`; `snapshot(client, identity, roomId): Promise<RoomStateSnapshot>`; `execute(client, identity, command): Promise<RoomStateSnapshot>`. `RoomAccess` có canControl; quyền spectator/command chi tiết được collaborator thực thi. Snapshot có roomId/version, room/match/clocks/role rõ ràng; frontend chỉ vẽ từ trạng thái chính thức.

`RealtimeStore.connect(identity, roomId, tabId, connectionId, takeover=false)` trả snapshot+mode/generation; `command(...)` trả discriminated ack; `snapshot(...)` kiểm membership; `cleanupExpiredReceipts()` dọn thời hạn. `attachRealtime(httpServer, dependencies)` tạo Socket.IO với lifecycle close để root gắn Nest và đóng tài nguyên.

Command examples định nghĩa ý định `room.ready`, `match.move`, `match.resign`, `media.sharing`; T18/T20/T23/T33 cung cấp handlers. `EngineFailureEvent` chỉ hợp đồng thông báo lỗi/busy/retry, không gọi engine. Không gửi payload chat/media stream vào receipts.

## Review focus

1. Người đã bị loại khỏi phòng hoặc token hết quyền không đọc được receipt/snapshot/private room event.
2. Concurrent duplicate và lỗi giữa mutation/receipt không tạo hai effect hoặc mutation không có receipt.
3. Same commandId khác payload không được replay thành thao tác khác; stale version trả snapshot mới mà không mutate.
4. Tab cũ reconnect/restart/cùng tabId hai socket không tự lấy quyền; explicit takeover mới được đổi controller.
5. Receipt expiry24h, rollback sau writes phải từ chối; fixture tải50 kết nối không thay GATE-REALTIME ứng dụng10 ván.

## Kế hoạch TDD

### 1. Store bền và migration

Files: `store.ts`, `contracts.ts`, `store.test.ts`, `test-helper.ts`; migration/rollback `20261011000002_realtime.sql`.

- [x] RED: real SQL concurrent duplicate -> một mutation+receipt, cùng ack; changed payload -> rejected; stale -> fresh snapshot.
- [x] RED: throw sau state write -> transaction rollback; snapshot privacy/unauthorized replay rejected; expires24h removes.
- [x] RED: newtab takes over, oldtab reconnect readonly, newstore instance preserves controller; same-tab previous connection fenced; explicit takeover works.
- [x] GREEN: schema/controller/tab/receipt tables + RLS/grants; transaction advisorylock + role app_server + collaborator. Receipt/mutation atomic.
- [x] Verify: isolated `xiangqi_realtime_test` only. Migration prewrite rollback/reapply; rollback with data refuses.

### 2. Socket boundary và hợp đồng shared

Files: `gateway.ts`, shared `realtime.ts`; Socket.IO tests nằm chung `store.test.ts` để không reset database song song.

- [x] RED: actual socket invalidtoken refuses; denied membership receives no room snapshot; malformed envelope stable error.
- [x] RED: concurrent duplicate through sockets, stale snapshot, oldtab direct command rejected/reconnect readonly; separate user/room cannot get private snapshots.
- [x] GREEN: middleware authenticates; connect uses persistent store; ack/read_only/takeover; publish individualized snapshots after commit; close interval+Socket.IO.
- [x] Verify: real Socket.IO50 simultaneous fixture clients connect, command round-trip samples/p95 printed as preliminary fixture measurement; no game/media pass claim.

### 3. Bàn giao

- [x] Node22 lint/typecheck/test/build với manifest root; full suite chỉ chạy SQL tests trên test URLs biệt lập, không reset T04.
- [x] Document event examples, atomicity/privacy responsibilities, runtime/root wiring and limits. Review diff, secret scan, migration rollback behavior.
- [ ] Root independent review/CI/integration, commit/push/Jira riêng. Agent không thao tác các bước Git/Jira/live này.

## Ví dụ tích hợp

Frontend tạo `tabId=crypto.randomUUID()` một lần trong sessionStorage của tab, mở Socket.IO với `auth: { accessToken, appSession, roomId, tabId }`. Khi token đổi, reconnect với token mới; server xác minh identity qua resolver trước từng lệnh, replay và phát snapshot. Resolver phải dùng xác thực Supabase có kiểm tra token còn hạn, account active và phiên chính thức; không chỉ decode JWT hay tin metadata client. Pool runtime dùng TLS kiểm chứng CA, login NOINHERIT/NOBYPASSRLS và quyền SET ROLE app_server tương tự T04.

```ts
socket.emit(
  "room.command",
  {
    commandId: crypto.randomUUID(),
    roomId,
    expectedVersion: currentSnapshot.version,
    action: { type: "room.ready", payload: { ready: true } },
  },
  onAcknowledgement,
);
```

Nếu timeout, retry **cùng toàn bộ envelope**; server trả biên lai cũ và không mutation lần hai. Nếu `VERSION_STALE`, lấy snapshot chính thức rồi tạo commandId mới cho ý định còn phù hợp. Ack replay có snapshot tại thời điểm lệnh gốc: frontend không được ghi đè snapshot mới hơn bằng snapshot version/generation thấp hơn. `room.snapshot` là đồng bộ trạng thái hiện hành, không dự đoán nước đi client.

Khi reconnect, snapshot chứa room/match/clocks/role và control. `control.reason="superseded"` hoặc `session.read_only` yêu cầu dừng camera/mic và khóa thao tác; spectator `not_allowed` không hiển thị thông báo mở tab khác. `socket.emit("session.takeover", onAcknowledgement)` chỉ dùng sau hành động chủ động của người dùng; không tự gọi khi reconnect. Server thay controller bền và fence connection cũ, nhưng Task media phải thu hồi token/phòng LiveKit khi tích hợp; T12 không tự thu hồi media stream đang chạy.

`media.sharing` là ý định thay đổi policy có phiên bản trong transaction nghiệp vụ, không chứa audio/video hoặc LiveKit secret. Sau commit, Task media cấp/thu hồi quyền theo snapshot chính thức. `engine.failure` là hợp đồng lỗi AI với ENGINE_BUSY/ENGINE_FAILED/ENGINE_TIMEOUT và retryable; Task engine quản lý timeout/retry, không gọi engine trong transaction SQL của receipt.

Root gắn `attachRealtime(app.getHttpServer(), { store, identities, corsOrigins })` sau khi tạo collaborator thật và trước listen. `publishSnapshots(roomId)` dành cho thay đổi chính thức từ service khác; từng người nhận được xác thực và kiểm membership lại. Close gateway trước khi đóng pool; Socket.IO close cũng đóng HTTP server nên lifecycle cần gọi đúng một lần. Khi chưa có room collaborator thật hoặc migration chưa được duyệt, để runtime realtime tắt; không bật bằng fixture trong production.

## Bằng chứng kiểm tra cục bộ

Node 22.23.3 và PostgreSQL 17 tại database riêng `xiangqi_realtime_test`: 32/32 tests PASS (25 SQL/Socket.IO/Nest và 7 protocol). Có mutation/receipt failure rollback, rollback migration trước ghi dữ liệu và từ chối sau ghi dữ liệu, quyền login NOINHERIT/NOBYPASSRLS, expiry 24h, token expiry, membership revocation, controller restart/reconnect và Socket.IO thật. Fixture 50 kết nối/10 phòng đo ack p95 19.54ms ở lần chạy kiểm chứng sau format; không có ván cờ/media thật nên chưa thay GATE-REALTIME 10 ván ứng dụng.

```sh
REALTIME_TEST_DATABASE_URL=postgresql://twot@127.0.0.1:55441/xiangqi_realtime_test pnpm exec vitest run apps/server/src/realtime/store.test.ts
```

Test chỉ chấp nhận database name `xiangqi_realtime_test` trên host local hoặc service postgres CI; reset schema trong database này. Không dùng auth test DB hay URL Supabase live.

Kiểm tra tích hợp từ develop sau PR #95: 179/179 kiểm thử toàn bộ đạt, gồm 27 auth SQL và 25 realtime SQL/Socket.IO/Nest; core 53/53, độ phủ lines 100% và branches 99.41%. Nest createApp nhận dependencies tùy chọn ở đối số thứ tư; khi thiếu collaborator thật, kết nối vẫn bị từ chối. app.close ngắt client và giải phóng cổng HTTP. CI dùng hai dịch vụ PostgreSQL 17.6 riêng để các fixture không sửa role chung của nhau. Chưa áp dụng migration realtime lên Supabase và chưa nghiệm thu danh tính thường/Khách thật.

## Bổ sung phiên XIAN-48

Resolver nhận bearer và capability ở handshake, command, replay, phát snapshot và tiếp quản. Capability chỉ giữ trong bộ nhớ; thu hồi capability phải từ chối dù bearer còn hợp lệ. Test dùng fixture độc lập; adapter SessionService production và danh tính Khách còn cần tích hợp phòng. Kết quả CI nhánh bổ sung cần xác minh sau push.
