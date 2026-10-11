# Fixed online clocks — XIAN-59

`ClockService` implements the existing match `ClockPort` for300/600/900 seconds per side. It fills both clocks, subtracts only `Position.turn`, clamps at zero, and never adds an increment. `MatchStore` calls beforeAction before checking turn/core legality and afterMove only for accepted moves. The service validates safe nonnegative integer state and trusted server time, returns new objects, and preserves the later anchor if a clock sample moves backwards. Repeated projection at the same time is idempotent.

`ClockWorker` processes up to50 candidates per tick. The exported `dueMatches(client, cursor)` SQL helper samples PostgreSQL time once, orders overdue managed ONLINE/ACTIVE current matches by deadline and ID, and returns at most50. Presence/disconnect state does not filter the query. Legacy unsupported histories and noncurrent/terminal matches are excluded.

Root supplies `ClockWorkerPort.dueMatches(cursor)` and `withMatch`. The due adapter must forward the worker cursor to the SQL helper. A full page advances by `(deadlineEpochMs, matchId)` even when candidates fail; a partial page wraps to the beginning, so fifty persistent failures cannot starve later overdue matches. Deadlines and failed transactions remain unchanged. The latter must acquire sorted actual player actor locks, then room advisory/row lock, on the same transaction/client as match/room/outbox writes. It rereads roster before entering the worker callback and retries roster changes. The worker checks the scoped identities/lock sets, rechecks current room/match, samples PostgreSQL `clock_timestamp()` after locks, reads a replay-validated match and calls actual `MatchStore.finish(TIMEOUT)` only if the current side has expired. MatchStore independently verifies that expiry/opposite winner and persists clamped zero with RESULT and room-end/outbox in one transaction. The worker never persists its projection, so the two calculations cannot double-subtract elapsed time.

A stale/early/terminal candidate is skipped. Transaction errors are collected into AggregateError after the bounded batch; one corrupt match cannot prevent other candidates from being processed. The caller rolls back failures and publishes only committed outbox events. Errors are not transformed into a fabricated successful timeout.

This module owns no Pool, timer, HTTP/Auth provider, Socket.IO or client clock. Root must serialize runtime ticks (planned100ms interval), clean up the scheduler on shutdown, and recover interrupted old-boot games before starting the clock loop. Root also resolves any **earlier** disconnect/grace cause in its transaction adapter before the clock callback; a later observation of zero must not replace an earlier valid DISCONNECT outcome. Neither a direct test tick nor the ClockWorker constructor proves deployed autonomous scheduling.

## Wire projection

For an ACTIVE snapshot, root projects the stored clock using beforeAction at a trusted server sample, and includes red/black milliseconds, current running side and `asOf`. Client timestamps never adjudicate moves. After rejected/stale/duplicate commands, the persisted anchor is unchanged, so future projections still include all elapsed time. For terminal snapshots, projection stops at `endedAt`; runtime/RT/UI integration owns this wire shape and hidden-tab/reconnect synchronization. Actual browser error≤1 second remains a separate acceptance gate.

## Synthetic tests

Use a separate PostgreSQL17 cluster on `127.0.0.1:55448`, database `xiangqi_clock_test`, synthetic admin `clock_test_admin`. The helper refuses other endpoints before recreating schemas. It applies the synthetic Auth prerequisite,19-table baseline and migrations1–7, without any real Auth provider, SMTP or live user data. It does not reset the T20 cluster55447.

```sh
CLOCK_TEST_DATABASE_URL=postgresql://clock_test_admin@127.0.0.1:55448/xiangqi_clock_test \
  pnpm vitest run apps/server/src/clock apps/server/src/match/history.test.ts \
  packages/xiangqi-core/test --no-file-parallelism
```

Without CLOCK_TEST_DATABASE_URL, SQL cases skip. Pure clock/core tests remain available.

The SQL tests use actual ClockService/MatchStore/core and a transaction/room-end fixture adapter. Exact deadline−1/0/+1 ms tests use a controlled trusted server Date to avoid unreliable1ms wall-clock sleeps; they store actual moves/results in PostgreSQL. Autonomous expiry uses real PostgreSQL time and an already elapsed deadline, no move command, no fake clock or fake finish. It verifies RESULT-only, zero clock, opposite winner, WAITING transition and persisted end time. Additional tests cover capture/no increment, illegal/off-turn/stale commands, disconnected clocks, stale candidates after a move, bounded/ordered selection, corrupt-first candidate progression, rollback/retry, worker/resign concurrency and fresh game reset.

Actual Socket.IO duplicate receipts, production timer/publication, causal60-second disconnect service, both-clock UI, hidden-tab/reconnect error≤1 second and browser demos are root integration gates. These fixture tests do not claim those gates passed.
