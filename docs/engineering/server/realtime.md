# T12 — hợp đồng khung realtime và kế hoạch triển khai

> For agentic workers: execute this plan inline with superpowers:executing-plans and test-driven-development. Root owns integration, dependencies, Git, CI and live services.

**Goal:** cung cấp Socket.IO có xác thực, phân quyền phòng, biên lai bền 24 giờ, phiên bản chính thức và tiếp quản tab an toàn để các Task phòng/ván tích hợp.

**Architecture:** PostgreSQL transaction cùng advisory lock theo phòng tuần tự hóa mutation và ghi biên lai. Collaborator nghiệp vụ nhận chính `PoolClient` đang trong transaction; không phát side effect bên ngoài trước commit. Tab/controller được lưu trong schema riêng nên reconnect sau restart không khiến tab cũ lấy quyền.

**Tech stack:** TypeScript strict, Socket.IO, pg, Vitest, socket.io-client chỉ trong test. Contract trong `packages/shared/src/realtime.ts` không dùng `any`.

**Spec:** XIAN-48/T12 Description tại `docs/planning/jira/reports/JIRA-MUC-CHI-TIET.md`; US-00.3; BA1.8/3.3/10.1. Root ACK kiến trúc ngày11/10/2026 trong chat.

## Giới hạn

- Auth resolver được root nối với Supabase/session/account thật; test dùng identity fixture riêng, không tuyên bố GATE-AUTH đạt.
- Room collaborator kiểm membership và quyền từng lệnh, cung cấp snapshot theo người nhận, thực thi state mutation trong cùng SQL transaction. Chưa triển khai phòng, đồng hồ, chat, luật, AI hoặc media.
- Schema mới `xiangqi_realtime`; không đổi schema T04 hoặc bảng legacy room_command_receipts. Tham chiếu auth.users/public.rooms đã tồn tại; không chạy migration live.
- Socket.IO dùng tên sự kiện `room.command`, `room.snapshot`, `session.takeover`, `session.read_only`. Handshake thành viên: `{accessToken, appSession, roomId, tabId}`; Khách: `{guestCapability, roomId, tabId}`. Khóa phải đúng bộ, không trộn hai loại; appSession và guestCapability là capability 43 ký tự base64url, thiếu, thừa hoặc sai bị từ chối. UUID tabId ổn định qua reconnect và khác ở tab mới; frontend lưu sessionStorage, không dùng localStorage chung giữa tab.
- Identity có userId và kind member/guest; room authorization được kiểm lại trước snapshot/receipt replay/mutation. Collaborator chịu trách nhiệm quyền vai trò và policy phiên chính thức; socket không tin userId/role từ client.
- Receipt key: actorId+roomId+commandId. Request fingerprint bao gồm type/payload/expectedVersion; cùng ID đổi payload trả COMMAND_ID_REUSED, không ghi đè kết quả.
- Tab đã biết chỉ reconnect vào quyền hiện có; tabId mới tiếp quản. `session.takeover` là hành động chủ động. ConnectionId fencing vô hiệu hóa socket cũ ngay cả khi dùng cùng tabId. Control persisted theo actor+room, generation tăng, tab cũ reconnect sau restart vẫn readonly.
- Authorization hiện hành và quyền tab được kiểm trước replay; response không phát riêng tư cho người đã mất quyền phòng. Callback ack trả kết quả cũ khi retry hợp lệ; snapshot đồng bộ hiện tại phát riêng từ collaborator.
- Receipt chứa snapshot/kết quả chính thức, không chứa access token/password/OTP/request chat. Chưa có chat command trong contract. Receipt expires_at=created_at+24h; đọc bỏ receipt đã hết hạn, maintenance DELETE mỗi phút/startup.

## Hợp đồng

`IdentityResolver.resolve(proof: RoomRequestProof): Promise<RealtimeIdentity>` từ root; `RoomRequestProof` là proof duy nhất (member hoặc Khách), không tách bearer/capability rời rạc.

`RoomCollaborator.authorize(client, identity, roomId): Promise<RoomAccess>`; `snapshot(client, identity, roomId): Promise<RoomStateSnapshot>`; `execute(client, identity, command): Promise<RoomExecutionResult>`. `RoomAccess` gồm `canControl` và `version` (room version đọc trong cùng lần đọc member đã khóa để xác thực); quyền spectator/command chi tiết được collaborator thực thi. Snapshot có roomId/version, room/match/clocks/role rõ ràng; frontend chỉ vẽ từ trạng thái chính thức.

`snapshot` tự kiểm membership trong transaction và trả đúng role của người nhận;
`RealtimeStore` dùng role đó để đọc control, không gọi `authorize` lần nữa trước
cùng một snapshot. `authorize` riêng vẫn dùng trước command/admission.

`command(...)` theo thứ tự: xác thực membership (`authorize`) → một câu SQL đọc đồng thời dòng controller và receipt theo khóa (user, room, command) → từ chối `TAB_READ_ONLY` nếu thẻ không ghi được → replay receipt (kiểm fingerprint) hoặc dọn receipt hết hạn → so `access.version` với `expectedVersion`. Không dựng snapshot đầy đủ trước khi kiểm; snapshot đầy đủ chỉ được dựng khi trả `VERSION_STALE` hoặc sau khi `execute` trả kết quả. Nước đi không kết thúc ván ghi event+move, match và tăng `room_version` cùng outbox trong một câu lệnh CTE; ván kết thúc giữ thứ tự cũ (event+move, `end`, outbox).

`RealtimeStore.connect(identity, roomId, tabId, connectionId, takeover=false)` trả snapshot+mode/generation; `command(...)` trả discriminated ack; `snapshot(...)` kiểm membership; `cleanupExpiredReceipts()` dọn thời hạn. `attachRealtime(httpServer, dependencies)` tạo Socket.IO với lifecycle close để root gắn Nest và đóng tài nguyên.

Snapshot đầu tiên được phát ngay từ kết quả đã commit của `connect`, trong cùng
lượt admission; không xác thực provider và mở thêm giao dịch để đọc lại phòng.
Kết quả này được bỏ ngay sau lần phát đầu, không cache cho request sau.
Quyền tại thời điểm commit quyết định snapshot admission; các lệnh, sync, tiếp quản
và publication sau đó vẫn xác thực lại. Trạng thái có thể đổi sau commit như với
mọi phản hồi snapshot; version/generation và các kiểm quyền tiếp theo vẫn áp dụng.

Ack của `room.command` được gửi ngay sau khi lệnh commit; phát snapshot cho các
tab chạy độc lập. Mỗi snapshot cần phát vẫn xác thực chữ ký/hạn JWT, phiên DB và membership
mới cho chính người nhận, không dùng snapshot gốc hay `control` đã cache.
Publication được gộp theo từng phòng: tối đa một pass đang chạy và một pass chờ
(dirty rerun). Một trigger chỉ được gộp vào pass chưa bắt đầu đọc; pass đó khởi động sau khi trigger được gọi, còn promise trả về chỉ resolve khi pass kết thúc, nên ack outbox chỉ diễn ra sau một pass đã bắt đầu sau lời gọi. Lỗi của pass
đang chạy trả về cho các caller của nó; pass chờ chạy độc lập và lần gọi sau
được thử lại. Khi đóng service, pass chờ không được khởi động.
Admission dựng snapshot bằng quyền/control vừa xác định trong cùng giao dịch, không đọc lại hai lần.
Sàn phiên bản (`publishSnapshots(roomId, minimumVersion)`, do outbox truyền `event.version`): recipient đã có version ≥ sàn không xác thực, đọc hay emit lại vì không có dữ liệu mới được giao. Recipient còn thiếu phiên bản vẫn xác thực mới và đọc snapshot trong transaction; kiểm lại sàn sau bước xác thực để tránh race với ack. Pass gộp lấy sàn lớn nhất; lời gọi không có sàn vẫn kiểm mọi recipient. Ack `room.command` ghi nhận version đã giao cho origin (monotonic, chỉ khi socket còn kết nối).

Command examples định nghĩa ý định `room.ready`, `match.move`, `match.resign`, `media.sharing`; T18/T20/T23/T33 cung cấp handlers. `EngineFailureEvent` chỉ hợp đồng thông báo lỗi/busy/retry, không gọi engine. Không gửi payload chat/media stream vào receipts.

## Review focus

1. Người đã bị loại khỏi phòng hoặc token hết quyền không đọc được receipt/snapshot/private room event.
2. Concurrent duplicate và lỗi giữa mutation/receipt không tạo hai effect hoặc mutation không có receipt.
3. Same commandId khác payload không được replay thành thao tác khác; stale version trả snapshot mới mà không mutate.
4. Tab cũ reconnect/restart/cùng tabId hai socket không tự lấy quyền; explicit takeover mới được đổi controller.
5. Receipt expiry24h, rollback sau writes phải từ chối; fixture tải50 kết nối không thay GATE-REALTIME ứng dụng10 ván.

## Kế hoạch TDD

### 1. Store bền và migration

Files: `store.ts`, `realtime.types.ts`, `store.test.ts`, `test-helper.ts`; migration/rollback `20261011000002_realtime.sql`.

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

Frontend tạo `tabId=crypto.randomUUID()` một lần trong sessionStorage của tab, mở Socket.IO với `auth: { accessToken, appSession, roomId, tabId }` (thành viên) hoặc `auth: { guestCapability, roomId, tabId }` (Khách). Khi token đổi, reconnect với token mới; server xác minh identity qua resolver trước từng lệnh, replay và phát snapshot. Resolver phải dùng xác thực Supabase có kiểm tra token còn hạn, account active và phiên chính thức; không chỉ decode JWT hay tin metadata client. Pool runtime dùng TLS kiểm chứng CA, login NOINHERIT/NOBYPASSRLS và quyền SET ROLE app_server tương tự T04.

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

Token media cho người chơi có quyền phát (`camera` hoặc `mic`) chỉ cấp khi tab gửi `tabId` đang là bản ghi `xiangqi_realtime.controllers` của người dùng trong phòng; tab khác nhận `MEDIA_TAB_READ_ONLY` (409). Token chỉ nghe và token người xem không bị ảnh hưởng. Khi `connect` đổi controller sang tab khác, cùng transaction ghi một outbox `media.revoke-user` cho người dùng; worker gỡ phiên LiveKit cũ rồi ack. Kết nối lại không ghi thêm sự kiện.

`media.sharing` là ý định thay đổi policy có phiên bản trong transaction nghiệp vụ, không chứa audio/video hoặc LiveKit secret. Sau commit, Task media cấp/thu hồi quyền theo snapshot chính thức. `engine.failure` là hợp đồng lỗi AI với ENGINE_BUSY/ENGINE_FAILED/ENGINE_TIMEOUT và retryable; Task engine quản lý timeout/retry, không gọi engine trong transaction SQL của receipt.

AI (`apps/server/src/game/ai`, factory `createAiRuntime({env, registration})` trả `{module, attach, start, ready, close}`; `registration.sessions` có thể null, khi đó runtime từ chối khởi động) dùng namespace Socket.IO `/ai` tại `/ai/socket.io`, các sự kiện `ai.control`, `ai.snapshot`, `ai.sessionExpired`, và các lệnh `ai.refresh`, `ai.takeover`, `ai.watch` đều có ack; mọi lệnh xác thực lại accessToken/appSession và tab vật lý qua SQL. Ván AI nằm trong `active_players` với `ai_game_id/ai_boot_id`; lease boot 60 giây được gia hạn mỗi 20 giây, sweeper 5 giây thu hồi boot hết hạn bằng origin `sweep` (chỉ khóa owner, không yêu cầu owner còn active; SQL vẫn kiểm điều kiện hết hạn). Lease cục bộ quá hạn thì fence vĩnh viễn: sweep bỏ mọi ván RAM và gia hạn sau đó không khôi phục. Lỗi từng dòng của sweep được giữ và làm `/ready` thất bại. Boot kiểm tra schema theo migration `20261011000011` và `20261011000012` (bảng, RLS FORCE, policy, quyền `app_server`, cột `active_players`); thiếu bất kỳ mục nào thì báo "AI migration is not ready" và đóng engine. `start()` warm games trước khi bật timer; `close()` chờ heartbeat/sweep đang chạy rồi mới đóng gateway, games, engine. Undo tối đa 3 lần mỗi ván, mỗi lần lùi 2 nửa nước hoặc 1 nửa nước khi máy đang nghĩ. Mất kết nối quá 30 phút: P1 bỏ trạng thái RAM và giải phóng reservation/presence trong transaction actor-first, không ghi lịch sử; máy quá 10 giây giữ ván và báo "Máy cờ gặp sự cố", Retry tính lại trên cùng thế cờ. `/ready` báo lỗi khi heartbeat hoặc sweep thất bại, hoặc lease đã quá hạn/fence.

Root gắn `attachRealtime(app.getHttpServer(), { store, identities, corsOrigins })` sau khi tạo collaborator thật và trước listen. `publishSnapshots(roomId)` dành cho thay đổi chính thức từ service khác; từng người nhận được xác thực và kiểm membership lại. Các trigger cùng phòng được gộp theo mô tả ở phần publication (tối đa một pass đang chạy và một pass chờ); close không khởi động pass chờ mới. Close gateway trước khi đóng pool; Socket.IO close cũng đóng HTTP server nên lifecycle cần gọi đúng một lần. Khi chưa có room collaborator thật hoặc migration chưa được duyệt, để runtime realtime tắt; không bật bằng fixture trong production.

## Bằng chứng kiểm tra cục bộ

Node 22.23.3 và PostgreSQL 17 tại database riêng `xiangqi_realtime_test`: 32/32 tests PASS (25 SQL/Socket.IO/Nest và 7 protocol). Có mutation/receipt failure rollback, rollback migration trước ghi dữ liệu và từ chối sau ghi dữ liệu, quyền login NOINHERIT/NOBYPASSRLS, expiry 24h, token expiry, membership revocation, controller restart/reconnect và Socket.IO thật. Fixture 50 kết nối/10 phòng đo ack p95 19.54ms ở lần chạy kiểm chứng sau format; không có ván cờ/media thật nên chưa thay GATE-REALTIME 10 ván ứng dụng.

```sh
REALTIME_TEST_DATABASE_URL=postgresql://twot@127.0.0.1:55441/xiangqi_realtime_test pnpm exec vitest run tests/server/game/realtime/store.test.ts
```

Test chỉ chấp nhận database name `xiangqi_realtime_test` trên host local hoặc service postgres CI; reset schema trong database này. Không dùng auth test DB hay URL Supabase live.

Kiểm tra tích hợp từ develop sau PR #95: 179/179 kiểm thử toàn bộ đạt, gồm 27 auth SQL và 25 realtime SQL/Socket.IO/Nest; core 53/53, độ phủ lines 100% và branches 99.41%. Nest createApp nhận dependencies tùy chọn ở đối số thứ tư; khi thiếu collaborator thật, kết nối vẫn bị từ chối. app.close ngắt client và giải phóng cổng HTTP. CI dùng hai dịch vụ PostgreSQL 17.6 riêng để các fixture không sửa role chung của nhau. Chưa áp dụng migration realtime lên Supabase và chưa nghiệm thu danh tính thường/Khách thật.

## Đo độ trễ qua Chrome MCP

Hai tài khoản thật, hai tab Chrome trên cùng Mac, frontend Vite qua HTTPS
Tailscale và PostgreSQL/provider xác thực từ xa ở mẫu ban đầu. Hai mẫu đầu gồm 12 nước đi hợp lệ;
đo từ click thật vào ô đích đến lúc DOM tab đối thủ có cùng chữ ký các quân cờ.
Không tính thời gian chờ giữa các lệnh MCP. Frontend được reload sạch trước mẫu
cuối để loại callback cũ còn giữ bởi hot reload.

| Độ trễ tab đối thủ |    Trước |      Sau |
| ------------------ | -------: | -------: |
| Trung vị           | 5.525 ms | 2.419 ms |
| Nhỏ nhất           | 2.682 ms | 2.210 ms |
| Lớn nhất           | 7.081 ms | 3.003 ms |

Hai bàn cờ khớp ở cả 12 nước cuối, có bắt quân; tin nhắn riêng giữ nguyên trong
toàn bộ mẫu cuối. `room.ready` khi WAITING sau ván kết thúc giảm 44 → 31 câu SQL;
snapshot WAITING tương ứng giảm 22 → 20 câu SQL. Active move đo được 28 câu SQL,
snapshot ACTIVE 19 câu; đây không phải số đo tải nhiều phòng.

Mẫu trước/sau thuộc các giai đoạn ván khác nhau và frontend dev trên một máy;
không thay kiểm chứng hai thiết bị hoặc nghiệm thu tải. Độ trễ còn 2,2–3,0 giây,
chưa đạt realtime dưới 200 ms. SQL từ xa mất khoảng 28–35 ms mỗi lượt.

Lượt tối ưu tiếp theo giữ backend trên Mac theo quyết định người dùng và chuyển
bearer sang JWT ES256 cục bộ + phiên DB hiện hành (xem chính sách/cache khóa ở
`login.md`). Sáu nước đi thật mới có trung vị 1.926 ms, nhỏ nhất 1.676 ms, lớn
nhất 2.119 ms; cả sáu lần hai bàn cờ khớp. Mẫu nhỏ hơn và khác giai đoạn ván nên
không phải benchmark tải hay cam kết SLO. Chữ ký JWT khi khóa đã tải mất khoảng
0,4–3,3 ms; phiên DB thêm một SELECT. Active command còn 26 câu SQL, snapshot
ACTIVE 17 câu, thay vì 28/19 ở lượt trước. MOVE event + move cùng một INSERT CTE,
snapshot không đọc membership hai lần và đọc draw clock ngay trong projection.
Publication phiên bản đã giao không xác thực/đọc/emit lại; mọi dữ liệu mới vẫn
kiểm JWT, phiên và quyền hiện hành. Không cache token/phiên/quyền.

Đường đọc snapshot ván hiện tại dùng một truy vấn khóa `MatchStore.current` (phòng khóa trước, ván sau, ghế người xem trong cùng CTE) thay cho ba câu SQL riêng (current_match_id, khóa ván, roomMatch trong context cầu hòa). Chiếu cầu hòa `MatchDrawStore.drawOf` dùng lại dữ liệu đã khóa và chạy cùng kiểm tra quyền/khóa/ghế qua `assertScope` và `assertSeated`; lệnh ván vẫn đi qua `context` và `drawSnapshot` không đổi. Không thêm cache quyền hay đường tắt client; đồng hồ lấy sau khi khóa.

Kiểm chứng sau cutover: 1.421 test đạt trên 111 file server/account/game/ops,
PostgreSQL cô lập, Node 22; gồm chữ ký thật, claim sai/hết hạn, khóa không tin
cậy, JWKS lỗi/cached-key, thu hồi phiên, khóa, biên lai, publication và runtime.
Typecheck server và lint file sửa đạt. Vẫn chưa kiểm hai thiết bị độc lập,
tải đồng thời nhiều phòng hoặc mục tiêu dưới 200 ms. Muốn giảm tiếp cần cắt
chuỗi SQL từ xa hoặc đặt backend gần DB; không phát dự đoán như dữ liệu chính thức.

## Bổ sung phiên XIAN-48

Resolver nhận `RoomRequestProof` ở handshake, command, replay, phát snapshot và tiếp quản. Proof không bao giờ được chiếu vào receipt hoặc snapshot. Thu hồi capability phải từ chối ngay, kể cả khi bearer còn hợp lệ. Lớp `RoomRealtimeIdentities`/`RoomRealtimeTransactions`/`RoomRealtimePresence` (tên cũ `Member*` đã bỏ) dùng `RoomSessionAuthorizer` để định tuyến thành viên/Khách; disconnect chỉ hạ cấp presence, không tăng quyền.

Web phòng và feed Sảnh kết nối Socket.IO bằng WebSocket trực tiếp, giữ kiểm Origin hiện có; không dùng GET polling thiếu Origin ở trình duyệt cùng nguồn. Không nới CORS/Origin để khắc phục handshake.

## YC5: demo mạng chỉ môi trường demo

`NETWORK_DEMO=true` chỉ có hiệu lực khi `NODE_ENV` khác `production`. Gateway xác thực lại phiên, snapshot và quyền điều khiển trước `demo.capability`/`demo.disconnect`; chỉ người chơi đang điều khiển ván ACTIVE được dùng. Production luôn từ chối lệnh trực tiếp dù cờ bật.

`demo.disconnect` ngắt socket gửi lệnh thật bằng server disconnect; không tự reconnect. Web chỉ hiện công cụ sau capability của server, hỏi lại khi trạng thái ván/quyền thay đổi; nút Nối lại trong lớp reconnect nối cùng tab và đợi snapshot/quyền chính thức. Công cụ không ngắt đối thủ hay tab khác; còn kết nối hợp lệ khác thì không giả toàn người chơi đã offline.
