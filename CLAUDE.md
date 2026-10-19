# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Working rules (reading scope, no local test runs, Git) are in `AGENTS.md`. Below: commands and architecture only.

## Commands

Node `>=22.13 <23` (`fnm use 22`); other versions only warn but diverge from CI.

```sh
pnpm dev                                   # web :5173 + server :3000, watch
pnpm --filter @xiangqi/server typecheck    # per package; `pnpm typecheck` runs all
pnpm --filter @xiangqi/web build           # web: scripts/build.mjs; server: tsc
pnpm lint
pnpm exec vitest run tests/path/x.test.ts [-t "name"]        # one test, no DB
tests/server/db.sh test tests/server/game/room/room.test.ts  # tests needing Postgres
tests/server/db.sh stop
```

`db.sh` starts isolated local Postgres 17 clusters (ports 55441+, `*_TEST_DATABASE_URL`) picked from the test's imports. DB suites skip silently when their URL is unset. Never point those URLs at Supabase: fixtures reset the schema.

## Architecture

- **Shared rules run on both ends.** `xiangqi-core` (moves, check/ending) and `engine` (negamax/alpha-beta, in a worker) serve the server as authority and the web client for AI and optimistic moves. `shared` holds cross-end contracts (`realtime.ts`) and word filters. Packages export TS source directly (no build step).
- **Server startup is flag-gated.** `apps/server/src/main.ts` chains `createXRuntime` factories (registration → google → media → rooms → friends → history → profile); each mounts only if its `*_ENABLED` flag is `true`, and verifies DB schema/privileges at boot ("... migration is not ready" / "... database unavailable"). Rooms require login and registration. `game/game.runtime.ts` wires the whole game domain (room, match, clock, chat, realtime, workers).
- **Mutations are Postgres transactions with a fixed lock order.** Stores never open their own transaction; they get the caller's `PoolClient` in a `RoomScope`. `RoomTransactions.withRoom` (`game/room/room-transactions.ts`): `BEGIN; SET LOCAL ROLE app_server` (app connects as `postgres`, so RLS/grants apply) → advisory locks on all actors, sorted → session recheck → room locks, sorted → retry on `RoomRosterChanged`. Never lock in ad-hoc order (two-player deadlock). Commands carry a `commandId` and are idempotent via receipts; side effects (Socket.IO, media revoke) go through an `outbox` drained by `*-worker.ts`, never before commit.
- **Realtime.** `game/realtime/gateway.ts` authenticates the handshake, allows one controlling tab per actor+room (`connectionId` fencing) and sends per-recipient snapshots; the HTTP snapshot is display-only. Clock, disconnect-grace and draw timeouts are server workers. AI games (`game/ai/`) use their own gateway.
- **Auth is two-layer:** Supabase bearer token (verified outside the transaction) plus an app-session capability (43-char base64url, hashed in `xiangqi_auth.app_sessions`). Guests are a separate actor kind. `DIRECT_URL` must be the direct/session pooler, not 6543.
- **Database** (`supabase/`): ordered `migrations/` each with a `rollback/` twin, `baseline/` for legacy tables, schemas `xiangqi_{auth,realtime,room,chat,social}` + `public`. Migrations assert existing index/constraint definitions before changing them; add a new migration plus rollback instead of editing an applied one.
- **Web:** `features/*` per domain, `shared/` for board, UI primitives, tokens. Pages are `React.lazy` in `app/AppRouter.tsx`. `RoomPage` serves WAITING and PLAYING under `/rooms/:id` and keeps chat/media mounted across the switch. `/dev/*` routes (dev only) preview components. LiveKit camera/mic failure must never interrupt a match.
