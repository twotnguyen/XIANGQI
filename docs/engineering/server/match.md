# Online match storage — XIAN-56

`MatchStore` uses the existing `public.matches`, `match_moves`, `match_events` and `xiangqi_room.outbox`. It does not write `public.moves`, open a transaction, send Socket.IO messages, authenticate users or implement a clock worker.

The caller acquires sorted actor locks (both players plus acting identity), then the room lock, supplies the same `PoolClient` as the room/realtime transaction, and commits receipts before publication. `MatchScope.canControl` is a trusted controller proof from that caller. The store checks current match identity, actual player seats, supplied lock sets, match version, effective history and rules.

`MatchStoreCore.context` reads the locked room, the eligible match and the caller's player seat in one SQL statement. Materialized CTEs keep room → match row-lock order; a mismatched current match is rejected without locking that match. Membership, both player locks, rules and replay validation still run before an action.

Draw state reads offers, each side's move count and expired-offer cooldown baselines in one statement. Read-only snapshots sample the database clock inside the same statement; actions retain their explicit deadline sample. Expiry comparisons use the same millisecond cutoff as JavaScript `Date`; mutation deadlines and `drawMoveCount` checks remain unchanged.

MOVE event and move rows are inserted in one data-modifying CTE, with the move depending on the event's returned identity/version. Foreign keys and the surrounding transaction still enforce atomic history and receipt commits.

## Ports and results

- `start(client, input)` implements the room `MatchStartPort` and returns `{ matchId }`. The room owns the transition to PLAYING, reservations/countdown cleanup and START notification. The initial position always uses `initialPosition()`. Replay of the same START token returns the existing ID after checking its room, players, time control and initial position.
- `move(scope, {matchId, matchVersion, from, to})` uses core square indices (`y * 9 + x`). A valid nonterminal move increments both match version and room version once. A terminal move emits MOVE at `v+1` and RESULT at `v+2`, then updates the terminal match once.
- `resign` is allowed for either actual player regardless of turn, after checking the clock.
- `snapshot` is internal and requires prior room authorization. Supported managed history is replayed; unsupported legacy history is refused instead of repaired or cast into the new codec.
- `finish` is a server-only port for verified timeout/disconnect/agreement/restart causes. It is not a client outcome API. The owning service verifies causal deadlines and restart boot identity. A terminal match retains its existing result on repeat calls. TIMEOUT additionally runs `ClockPort.beforeAction` itself, requires the current side to be expired with the opposite winner, and persists its clamped zero clock without a MOVE. Restart does not need a clock.
- `ClockPort` is synchronous and pure. It returns the persisted clock shape. Production start/move/resign fail with `MATCH_CLOCK_UNAVAILABLE` without an implementation. The tests use a synthetic port; T23 supplies the actual elapsed-time rules and autonomous worker.
- `MatchRoomEndPort.onMatchEnded` must transition the current matching room to WAITING, clear current match/ready/reservation match IDs, preserve seats/host/viewers/chat/media, and bump room version exactly once in the same transaction. The terminal MATCH_MOVE and MATCH_RESULT outbox rows use that one room version with distinct types. The realtime collaborator must not bump it again. It rereads room version for the response.

`MatchCommandResult` carries an authoritative match and an optional domain error. In particular an expired clock returns `applied: false` with a terminal TIMEOUT result. The caller must **commit that result and its receipt**, not throw an error that rolls it back. Structural input, authorization and corrupt-history errors use `MatchError`; transient SQL errors propagate for rollback.

## History and compatibility

Positions persist as a 90-cell board with uppercase RED/BLACK turn and core counters. START version0 includes encoding, token, room/seat IDs and the initial board. Moves use `{from:{x,y},to:{x,y}}`, linked by parent IDs. `active_move_ids` selects the effective branch after an accepted online undo; the discarded moves remain audit records and do not participate in replay or adjudication. Replay checks unique IDs, parent chain, expected side, corresponding MOVE event, increasing event versions, legal moves, no continuation after a result, and exact board/counters. Terminal RESULT payload/version/time must agree with the immutable match; core outcomes must agree with adjudication.

Online undo offers expire after 30 seconds; sender and receiver actions run under the existing room/match locks and receipt transaction. Accepted offers rewind to before the sender's latest move and count toward that sender's three-use limit. Declined and expired offers impose a three-own-move cooldown; the counts use durable MOVE events, not the rewindable branch. Timed clocks are not refunded; unlimited games start a new inactivity interval without resetting confirmations. Sender moves are blocked while pending; receiver moves decline the offer.

Action, reconnect and worker paths arbitrate the earliest elapsed deadline, with ties ordered TIMEOUT, DISCONNECT, INACTIVITY. Exact equal disconnect timestamps result in `DRAW_SIMULTANEOUS_DISCONNECT`; terminal timestamps are persisted at millisecond precision.

Migration000007 preserves legacy REPETITION/AGREED_DRAW and other prior outcomes. It adds DRAW_REPETITION, DRAW_NO_CAPTURE, DRAW_AGREEMENT and PERPETUAL_CHECK (including null winner for both sides continuously checking), plus a partial unique managed START-token index. It changes no table ACL, owner, RLS, FK or terminal trigger. The existing NOT VALID active-list constraint is not validated against old data. Rollback refuses managed START/new outcome writes or altered migration metadata.

Replay export uses the same effective branch. PGN marks `SERVER_RESTART`, `BOTH_OFFLINE` and `AI_UNAVAILABLE` as `*` (no game result), not `1/2-1/2`; genuine draws still export `1/2-1/2`.

## Synthetic SQL tests

Use only a dedicated PostgreSQL17 cluster on `127.0.0.1:55447`, database `xiangqi_match_test`, synthetic administrator `match_test_admin`. The helper refuses other endpoints before resetting schemas. Run the SQL files sequentially because they reset that one database:

```sh
MATCH_TEST_DATABASE_URL=postgresql://match_test_admin@127.0.0.1:55447/xiangqi_match_test \
  pnpm vitest run tests/server/game/match tests/packages/xiangqi-core --no-file-parallelism
```

Without that variable, SQL cases skip; codec/core tests still run. No Supabase-managed Auth, SMTP, real accounts or live database is involved.

`fixtures.ts` contains a literal 120-ply non-capture game from a reduced five-piece START. Its rook tours have 18/16 squares, so the full position cannot repeat within the first60 full turns; final squares/counters/FEN are independently specified. Other reduced fixtures cover legal mate/stalemate, first-to-third repetition, one-sided continuous check and an eight-ply six-piece dual countercheck cycle. These are actual core moves persisted in SQL; they are not a standard-opening recorded game. Production-start tests separately verify the complete32-piece initial position.

The SQL callback and clock are fixture ports. Actual room/realtime receipt/publication integration, Clock59 expiry worker, restart/disconnect services, two-player+viewer browser demo and latency acceptance remain integration gates.

## AI game recovery and retention

`AiGames` (`apps/server/src/game/ai/ai-games.ts`) runs one engine search per computed turn. The search output is kept in memory as a `Completion` and is never searched again. A transient SQL failure (`AI_UNAVAILABLE`) on a still-current turn schedules a commit retry with the retained completion: the first retry waits 1s, then 2s, 4s, 8s, 16s, and every later retry waits the 30s cap. Each retry re-checks SQL authority before applying the completion. Lost authority (`RoomError`, changed epoch or version, cancelled game) discards the completion without applying or failing it.

Undo, resign, drop and close cancel the pending retry timer and abort any running search. Epoch and version fences keep late callbacks from installing output into a newer game or a replacement reservation.

Retention is bounded: each owner keeps at most one terminal AI game, readable for a 30-minute grace window, and the next game or terminal result supersedes it. ACTIVE and FINALIZING games are never pruned. Each live game holds at most one retained completion and one retry timer.

## YC5: Undo online và đề nghị

`match.undo.offer/withdraw/respond` dùng cùng envelope/receipt với lệnh ván. `MatchUndoStore` giữ đề nghị bền 30 giây, tối đa 3 lần chấp nhận mỗi bên; Từ chối/hết hạn chờ 3 MOVE của người gửi. Bộ đếm dựa trên event bền, không quay lui theo nhánh hiệu lực. Mỗi người chỉ có một đề nghị đang chờ giữa Xin hòa và Xin đi lại.

Người gửi Undo không đi trong lúc chờ; người nhận đi thì đề nghị bị Từ chối. Chấp nhận lùi 1 hoặc 2 ply về trước nước gần nhất của người xin bằng `active_move_ids`, giữ Match ID và lịch sử audit; giờ đã dùng không được hoàn. Không giới hạn mở cửa sổ 3 phút mới, giữ `inactivity_extensions`. Event/version và outbox cập nhật trong cùng transaction; Replay/PGN/lặp thế chỉ dùng nhánh hiệu lực.

`canAbort` trong snapshot kiểm cả MOVE bền: Undo về 0 ply không mở lại Hủy ván. `ABORTED` là kết quả trung tính, không Replay/export. Migration `20261103000006_online_undo` phải được áp trước runtime mới; `20261103000007_match_simultaneous_disconnect` thêm hòa thật và cập nhật guard History. Rollback từ chối khi còn dữ liệu tính năng, không xóa lịch sử để ép quay lui.

Reconnect người chơi gọi `settleDeadlines` dưới khóa actor/phòng trước khi xóa `disconnected_at`; không để socket đến muộn cứu ván quá hạn. Action và worker dùng cùng phân xử deadline; timestamp disconnect so ở độ chính xác microsecond trong SQL, wire `endedAt` vẫn là ISO millisecond.
