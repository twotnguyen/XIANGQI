# Trạng thái, transaction và deadline

Nguồn chuẩn cho match lifecycle; đọc cùng [contracts](04-CONTRACTS.md). Dùng hàm thuần nhận `nowMs` trong test, không test bằng sleep thật.

## Trạng thái

Room: WAITING → PLAYING → FINISHED → CLOSED; FINISHED → PLAYING chỉ qua tái đấu được hai player chấp nhận trước hạn10phút, tạo match mới và xóa finished_at atomic. Match: ACTIVE → FINISHED hoặc INTERRUPTED. Sau INTERRUPTED room FINISHED để tạo ván mới; không có winner. Match kết thúc không trở lại ACTIVE. Presence, media và proposal là trạng thái riêng.

`version` tăng mỗi lần mutation match được chấp nhận, gồm move, undo, proposal, result; `ply` là độ dài nhánh nước đi hiệu lực, có thể giảm. `roomVersion` tăng ở thay đổi membership/settings/ready; không dùng version match cho quyền xem.

## Pipeline command

```text
authenticate request + control lease
read immutable match.roomId for routing
BEGIN; if ONLINE: SELECT room FOR UPDATE; then SELECT match FOR UPDATE
verify roomId still matches (immutable); if AI: lock match only
lookup receipt(match, actor, commandId)
  same canonical command => return fresh current snapshot + original appliedVersion, without applying again
  different payload => COMMAND_ID_REUSED
check match ACTIVE, expectedVersion
settleClock(nowMs); if expired => finalize TIMEOUT, reject requested action
validate role, turn, schema and rule
apply mutation; if terminal: finalizeMatch owns version/event/snapshot
otherwise: version++; append immutable event; update snapshot
insert command_receipt with command type + expectedVersion + canonical payload hash + appliedVersion/result metadata
COMMIT
ack; broadcast sanitized snapshot
```

Refused validation không ghi receipt trừ kết quả timeout đã commit. Socket identity lấy từ auth, actor máy là `AI`, không giả user ID. Timeout scheduler dùng cùng lock/pipeline. Read snapshot settle/check overdue qua service, không trả match ACTIVE hết giờ mãi mãi.

Clock ACTIVE lưu redMs/blackMs và runningSinceEpochMs. Remaining là số dư tại lần settle cuối. `elapsed=max(0, now-runningSince)`; trừ bên đến lượt, clamp 0. Sau move chuyển sang đối phương; sau undo lấy lượt từ vị trí được khôi phục (không toggle lần nữa); runningSince=now. Null ở no-limit. Deadline tại `runningSince+remaining(side)`, timestamp server. Tại deadline chính xác nước đi muộn bị từ chối. Proposal vẫn settle và duy trì đúng running side, không tạm dừng đồng hồ.

Không giữ transaction khi tính AI, gửi mail hoặc gọi media API. Giao dịch match chỉ chứa SQL và logic luật hữu hạn. Broadcast sau commit có thể thất bại: sync snapshot + version là đường khôi phục, không rollback nước đã commit.

## Mất mạng/restart

Socket heartbeat ứng dụng 10 giây, lease 30 giây; disconnect được biết thì đánh dấu ngay, nếu không thì đánh dấu khi lease hết. Khoảng 60 giây tính từ thời điểm server phát hiện offline, UI nêu countdown server. Còn tab observer của player không được tính đang sẵn sàng chơi; tab controller nối lại/tiếp quản được tính online. Presence/deadline được lưu trong client_controls cho cả player online lẫn human AI, không phụ thuộc room_members.

Một người offline: lưu disconnectedAt/deadline trong DB; timer clock và grace đều có thể kết thúc. Lý do có deadline sớm hơn thắng; bằng nhau ưu tiên TIMEOUT. Khi xử lý quá hạn, quyết định theo timestamp sự kiện, không theo thứ tự callback chạy. Nếu một deadline đã xảy ra khi đối thủ còn online, một disconnect phát hiện sau deadline đó không xóa kết quả đã đến hạn.

Cả hai offline trước bất kỳ deadline kết thúc nào: chuyển INTERRUPTED ngay sau khi server đã xác định cả hai lease mất; không có winner. Server restart: trước nhận command, đánh dấu các ACTIVE do bootId cũ sở hữu thành INTERRUPTED/SERVER_RESTART trong transaction, giữ lịch sử. Không giả phục hồi thắng/thua bằng thời gian downtime. Chỉ một instance game server trong bản này; horizontal scale chưa hỗ trợ.

Client resync khi connect, sau lỗi VERSION_CONFLICT, khi thấy version nhảy, và 15 giây/lần đang ở ván. Snapshot version thấp hơn hiện tại bỏ qua; cùng version vẫn nhận clock/presence nếu serverNowMs mới hơn theo mục retry bên dưới; khác matchId reset state. Server revalidate admission epoch trước mọi subscribe/sync. Không replay cache packet riêng tư vào membership đã bị thu hồi.

## Undo và sự kiện

`events` là log append-only, mỗi version một event type; mỗi move có `moveId`, `parentMoveId`. Snapshot chứa `activeMoveIds`, không xóa move bị undo khỏi audit. Khi undo: dựng lại bàn từ initial + active prefix, dựng lại repetitionCounts từ cùng nhánh, giữ số dư thời gian sau settle, tăng version. Event UNDO ghi removedMoveIds, targetPly, requester, approver. Replay mặc định nhánh hiệu lực cuối; UI nhãn “có đi lại”, không cần trình biên tập cây biến thể.

DRAW/UNDO proposal gắn `basePly`, `createdVersion`, expiry 30 giây, requester. Tạo proposal tăng version; approve gửi expectedVersion mới nhất từ snapshot. Một proposal pending chung; tự approve FORBIDDEN; move/undo/result mới hết hiệu lực proposal. Proposal timeout chuyển expired trong transaction, version tăng và phát snapshot. Lặp request approve chỉ có một receipt/kết quả.

## Control lease và rời phòng

Mọi user có một controllerId trong client_controls, dùng được cả room online và match AI không có roomId. Tab thứ hai được snapshot chỉ đọc, không phát media/command. Tiếp quản có command riêng, xác nhận chủ tài khoản; đổi controllerId/epoch, thu hồi socket/media cũ trước cấp mới. Mọi move/AI undo/media write kiểm tra epoch hiện hành; observer của chính player vẫn đọc PLAYERS chat nhưng không gửi. WATCH tab phụ chỉ đọc, một controller cho gửi chat/media subscribe để tránh duplicate sessions.

WAITING chủ rời đóng room; đối thủ rời giải phóng ghế/reset ready, lời mời cũ đã consume không sống lại. ACTIVE rời chủ động là RESIGN. FINISHED chủ rời đóng room; khách rời không đổi match. Viewer offline giữ slot 15 giây, hết hạn remove membership/epoch. Close room thu hồi mọi mời/chat subscriptions/media token grants.

## AI

Job gồm matchId, expectedVersion, activeMoveIds hoặc repetitionCounts, deadlineEpochMs. Cập nhật proposal không có ở AI nên version không đổi do proposal. Undo/end/restart hủy job, kết quả stale bị bỏ. Khi quá tải trả AI_BUSY trước tạo ván mới; job của ván tồn tại queue đầy chuyển INTERRUPTED/AI_UNAVAILABLE sau retry giới hạn, không coi người chơi thua vì lỗi worker. Một retry khi worker crash, nếu còn thời gian và capacity. Khi clock hết giờ hợp lệ thì TIMEOUT có ưu tiên trước AI fault.

AI human offline: giữ 60 giây, sau đó INTERRUPTED nếu chưa có timeout hợp lệ; không tạo ván thua do AI “vẫn online”. Human reconnect media không liên quan vì ván AI không có media. Đây là quy tắc thiết kế cho chế độ một người, R09 online không bị đổi.

## Finalizer chung và đồng hồ khi retry

ISSUE-012 cung cấp `finalizeMatch(tx, match, outcome, nowMs, terminalEvent): MatchSnapshot`, caller đã giữ room→match lock (AI chỉ match). Hàm đặt status FINISHED/INTERRUPTED, ended_at, outcome, clear proposal, settle/stop clock, tăng version một lần cho mutation terminal, append event, giải phóng active_players, cập nhật room FINISHED/finished_at nếu có. Move kết thúc ván dùng một version/event MOVE chứa outcome, không tăng hai lần. Timeout/resign là một event terminal. Sau commit mới broadcast và phát hook media cleanup. Mọi consumer013/014/021 dùng hàm này, không tự viết finalizer riêng.

Canonical receipt hash gồm `{type,expectedVersion,payload}` với object keys sorted; matchId/actor/commandId nằm trong unique key. `{}` của RESIGN không trùng `{}` của UNDO_AI. Duplicate trả `{appliedVersion,snapshot}` với snapshot hiện tại đọc từ DB; không trả timestamp/clock snapshot đã lưu từ lần đầu. Command thành công mới cũng dùng cùng envelope. Nếu ván đã tiến triển, snapshot có version cao hơn appliedVersion là bình thường.

Snapshot DTO chiếu số dư clock tới `serverNowMs` tại lúc trả (không ghi mutation chỉ vì đọc), đặt DTO runningSinceEpochMs=serverNowMs; persisted clock vẫn theo lần settle cuối. Client dùng số dư DTO trừ monotonic elapsed từ khi nhận. Snapshot cùng version vẫn cập nhật clock/presence nếu serverNowMs mới hơn; bỏ snapshot version cũ hơn, không bỏ nhầm clock mới cùng version. Terminal DTO giữ số dư cuối, không chạy timer.

## AI job và control lifecycle

`client_controls` tồn tại cho mỗi user đang có ngữ cảnh room/match, unique user_id. Waiting/finished room dùng roomId; ACTIVE online có cả roomId/matchId; AI chỉ matchId. Start/finish cập nhật context trong transaction. `POST /control/takeover` lấy context từ user, tab mới không được tự chọn context người khác. `match:subscribe` phục vụ cả ONLINE/AI, trả snapshot và controller grant riêng; ONLINE còn kiểm room admission. AI chỉ human participant được subscribe.

`ai_jobs` một row/match (PK match_id), id là search token thay đổi, job_version tăng xuyên lượt theo09; lưu expectedVersion,status QUEUED/THINKING/IDLE/FAILED,queuedAt,startedAt; trạng thái worker không tăng match.version. `ai:status` event có matchId,jobId,jobVersion,state; client bỏ jobVersion cũ. Snapshot chứa aiState cùng jobVersion, hỗ trợ refresh. Presence event/snapshot có userId,online,disconnectDeadlineMs; không lộ controller secret.

## Cleanup sau ván

ISSUE-027 sở hữu scheduler room FINISHED sau10 phút từ finished_at → CLOSED, dùng room lock, kiểm currentMatchId/status để không đóng room đã tái đấu. Thu hồi invitations/memberships/chat subscriptions và media hooks; giữ matches/events/history. Tái đấu xóa finished_at. Fake-clock test expiry và rematch đồng thời là bắt buộc.

## Hợp đồng kết thúc và tái đấu bổ sung

Finalizer là chủ sở hữu duy nhất việc tăng version/append event khi terminal; caller truyền terminalEvent trước khi tăng version, không append thêm event. TerminalEvent là discriminated union trong contracts: `{type:'MOVE',payload:{moveId,parentMoveId,side,move}}` hoặc `{type:'RESULT',payload:{actorKey:string|null}}`. Finalizer thêm outcome vào payload lưu DB. Mọi terminal không phải move (resign, draw accept, timeout, disconnect/restart/AI fault) dùng RESULT; reason nằm trong outcome. Nonterminal events gồm START(version0), MOVE, UNDO, PROPOSAL_CREATED và PROPOSAL_RESOLVED; resolved payload có proposalId và resolution REJECTED/EXPIRED, accepted DRAW dùng RESULT, accepted UNDO dùng UNDO. Move vô hiệu proposal thể hiện trong snapshot cùng MOVE, không ghi thêm event cùng version. Proposal creation payload là Proposal; UNDO theo mục Undo ở trên; START chứa initial position và ruleSetVersion.

Mapping bắt buộc: BOTH_OFFLINE, SERVER_RESTART, AI_UNAVAILABLE → INTERRUPTED/winner=null; AGREED_DRAW và REPETITION → FINISHED/winner=null; CHECKMATE, STALEMATE, RESIGN, TIMEOUT, DISCONNECT → FINISHED/winner side thắng. AI chỉ có human offline hết grace dùng BOTH_OFFLINE/winner=null (tên reason dùng chung cho mất toàn bộ human participants); timeout đã tới hạn vẫn ưu tiên như trên.

Rematch nhận `{commandId,expectedMatchId,accept}` dưới current controller lease. ISSUE-027 thêm migrations `room_rematch_votes` và `room_command_receipts` theo04. Lock room rồi user rows theo thứ tự rồi old match; xác minh hai player hiện tại vẫn là participant của expectedMatchId. Receipt key(roomId,actorId,commandId), canonical hash gồm type REMATCH + expectedMatchId + accept. Exact retry trả newMatchId đã ghi (nullable nếu mới vote), kèm Room DTO hiện tại sau access check; payload khác COMMAND_ID_REUSED. Không dùng DTO retry để tự phát động rematch tiếp theo.

Request mới chỉ hợp lệ nếu room FINISHED, currentMatchId=expectedMatchId và now < finished_at+10phút; stale round trả CONFLICT, closed/expired trả ROOM_CLOSED (đóng room dưới cùng lock nếu đã tới hạn). accept=true upsert vote của actor; accept=false xóa cả hai votes vòng này, không ảnh hưởng match cũ. Hai vote true tạo đúng một match mới, đổi sides/giữ timeControl, claim active_players, cập nhật currentMatchId/status/roomVersion, clear finished_at và votes trong cùng transaction. Receipt của command tạo ván ghi newMatchId; các receipt vote cũ không sửa. Sau khi currentMatchId đổi, commandId mới cho vòng cũ phải reject, kể cả hai click đến sát nhau. Tại đúng hạn10phút close thắng rematch. Close xóa votes, giữ receipt audit; read retry vẫn kiểm quyền hiện tại. Client nhận room:updated để thấy đối thủ vote đã tạo ván mới; không cần bổ sung tính năng thông báo ngoài room.

Chi tiết persisted schema, session/tab controller, membership presence và transaction DB: [09-DATABASE-DESIGN](09-DATABASE-DESIGN.md).
