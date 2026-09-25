# Evidence — ISSUE-002: Contracts, tọa độ và vị trí khởi đầu

## Trạng thái: LOCAL_DONE
## Nhánh: `feat/issue-002-contracts-position`

## Môi trường
- Node: v24.21.0, pnpm: 10.34.5, TypeScript: 5.8.3, Vitest: 3.2.7, Zod: ^3.x

## Thay đổi

### packages/contracts/src/
- `game.ts`: Side, PieceType, Square, Piece, Board, Move, Position, Outcome, ClockState, Proposal, ErrorCode, ApiResult, MatchSnapshot, CommandResult — Zod schemas + types theo spec 04. SquareSchema strict (x 0..8 int, y 0..9 int, reject unknown). MoveSchema strict.
- `ai.ts`: SearchInput, SearchResult types.
- `api.ts`, `room.ts`, `media.ts`: placeholder stubs (populated later).
- `index.ts`: barrel re-export.

### packages/game-rules/src/
- `initial.ts`: `createInitialPosition()` — 90-slot board, 32 quân (16/side), RED turn. RED bottom (y=0-4), BLACK top (y=5-9). ID ổn định theo pattern `{side}-{type}-{index}`.
- `position-key.ts`: `positionKey()` — canonical key encoding type+side+square+turn. Excludes ID/ply/time.
- `index.ts`: barrel export.

### tests/
- `fixtures/positions.ts`: `makePosition()` — validates duplicate square/ID, requires both generals.
- `unit/initial.test.ts`: 16 tests covering all acceptance cases.

### Infrastructure
- `vitest.config.ts`: workspace package aliases cho test resolution.
- `tsconfig.json` (root): project references for `tsc -b`.
- Root `typecheck` script: `tsc -b` thay `pnpm -r typecheck`.
- Root devDeps: +typescript, +zod (contracts).

## Test Results

```
Test Files  3 passed (3)
     Tests  20 passed (20)
  Duration  350ms
```

| ID | Mô tả | Kết quả |
|---|---|---|
| T002-01 | Board 90 ô, 32 quân, 16/side, RED turn | PASS |
| T002-02 | All piece IDs unique | PASS |
| T002-03 | Correct piece types per side | PASS |
| T002-04 | Same board different turn → different key | PASS |
| T002-05 | Clone board different IDs → same key | PASS |
| T002-06 | Key distinguishes side/type at same position | PASS |
| T002-07 | Rejects x=9 (out of bounds) | PASS |
| T002-08 | Rejects y=-1 (out of bounds) | PASS |
| T002-09 | Rejects x=1.5 (non-integer) | PASS |
| T002-10 | Rejects unknown fields | PASS |
| T002-11 | Accepts valid square | PASS |
| T002-12 | positionKey does not mutate input | PASS |
| Fixture | Rejects duplicate square | PASS |
| Fixture | Rejects duplicate ID | PASS |
| Fixture | Rejects missing general | PASS |
| Fixture | Valid fixture both generals | PASS |

## Acceptance

| Tình huống | Kết quả |
|---|---|
| createInitialPosition: 90 ô, 32 quân, 16/side, RED turn | PASS |
| ID quân thay: clone board đổi IDs → key không đổi | PASS |
| Lượt thay: giữ board, BLACK turn → key khác | PASS |
| Tọa độ lỗi: x=9, y=-1, x=1.5 → schema reject | PASS |

## Gate
- lint: PASS
- typecheck: PASS (tsc -b)
- build: PASS
- test:unit: PASS (20/20)
- CI: chờ push

## Bước tiếp theo
Commit, push, PR, merge. Sau merge: ISSUE-003 hoặc ISSUE-006 TS harness.
