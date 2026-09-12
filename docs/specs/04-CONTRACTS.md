# Hợp đồng dữ liệu và giao tiếp

Các tên dưới đây là chuẩn cho mọi issue. Type TypeScript dùng camelCase, DB snake_case. Cài bằng Zod ở `packages/contracts/src`; export từ `index.ts`. Input reject unknown fields ở mutation để tránh client tự ghi role/result.

## Kiểu lõi

```ts
export type Side = 'RED' | 'BLACK';
export type PieceType = 'GENERAL' | 'ADVISOR' | 'ELEPHANT' | 'HORSE' | 'ROOK' | 'CANNON' | 'PAWN';
export type Square = { x: number; y: number }; // integers x 0..8, y 0..9
export type Piece = { id: string; type: PieceType; side: Side };
export type Board = (Piece | null)[]; // exactly 90, index = y*9+x
export type Move = { from: Square; to: Square };
export type Position = { board: Board; turn: Side };
export type Visibility = 'PUBLIC' | 'CODE_ONLY' | 'LOCKED';
export type MemberRole = 'PLAYER' | 'SPECTATOR';
export type Audience = 'OFF' | 'OPPONENT_ONLY' | 'OPPONENT_AND_SPECTATORS';
export type TimeControl = 0 | 300 | 600 | 900; // seconds each; 0 unlimited
export type AiLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type Outcome = { winner: Side | null; reason: 'CHECKMATE' | 'STALEMATE' | 'REPETITION' | 'RESIGN' | 'AGREED_DRAW' | 'TIMEOUT' | 'DISCONNECT' | 'BOTH_OFFLINE' | 'SERVER_RESTART' | 'AI_UNAVAILABLE' };
export type ClockState = { redMs: number; blackMs: number; runningSinceEpochMs: number } | null;
export type Proposal = { id: string; kind: 'DRAW' | 'UNDO'; requesterId: string; basePly: number; createdVersion: number; expiresAtMs: number };
export type MatchSnapshot = {
  id: string; roomId: string | null; mode: 'ONLINE' | 'AI';
  status: 'ACTIVE' | 'FINISHED' | 'INTERRUPTED';
  position: Position; version: number; ply: number; ruleSetVersion: 'xiangqi-simple-v1';
  redUserId: string | null; blackUserId: string | null;
  aiSide: Side | null; aiLevel: AiLevel | null;
  timeControl: TimeControl; clock: ClockState; outcome: Outcome | null;
  activeMoveIds: string[]; proposal: Proposal | null; serverNowMs: number;
  aiState: {jobId:string|null;jobVersion:number;state:'IDLE'|'QUEUED'|'THINKING'|'FAILED'} | null;
  presence: {userId:string;online:boolean;disconnectDeadlineMs:number|null}[];
};
export type CommandResult = { appliedVersion: number; snapshot: MatchSnapshot };
export type MatchCommand<T> = { commandId: string; expectedVersion: number; payload: T };
export type ErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'EMAIL_UNVERIFIED' | 'ONBOARDING_REQUIRED' | 'ROOM_FULL' | 'ROOM_CLOSED' | 'ALREADY_IN_ROOM' | 'INVITE_INVALID' | 'NOT_YOUR_TURN' | 'INVALID_MOVE' | 'VERSION_CONFLICT' | 'COMMAND_ID_REUSED' | 'MATCH_ENDED' | 'PROPOSAL_EXPIRED' | 'CONTROL_REQUIRED' | 'AI_BUSY' | 'MEDIA_UNAVAILABLE';
export type ApiResult<T> = { ok: true; data: T; requestId: string } | { ok: false; error: { code: ErrorCode; message: string }; requestId: string };
```

`MatchSnapshot` public cho thành viên hợp lệ, không chứa JWT, email, mời bí mật, session, repetition internals hoặc AI evaluation live. Profile DTO `{id,username,displayName}`. Room DTO `{id,name,ownerId,visibility,status,roomVersion,timeControl,members,currentMatchId}`; members chỉ `{userId,role,side,online,ready}`, không có mã/controller secret. Server control lease cấp controllerId riêng cho tab qua authenticated ack, không nằm trong broadcast.

## Module luật / AI

```ts
createInitialPosition(): Position
positionKey(position: Position): string
getLegalMoves(position: Position): Move[] // current side only
isInCheck(position: Position, side: Side): boolean
validateMove(position: Position, move: Move): { valid: true } | { valid: false; reason: string }
applyMove(position: Position, move: Move): Position // pure, asserts validated input
getTerminalOutcome(position: Position, occurrences: number): Outcome | null
```

`getTerminalOutcome`: hết nước → CHECKMATE nếu bị chiếu, ngược lại STALEMATE; nếu vẫn có nước và occurrences≥3 → REPETITION. Không sử dụng hàm sinh legal để suy ra attack bằng recursion vô hạn: attack geometry riêng.

```ts
export type SearchInput = {
  position: Position; repetitionCounts: Record<string, number>;
  maxDepth: number; deadlineMonoMs: number;
  algorithm: 'MINIMAX' | 'ALPHA_BETA'; seed: number;
};
export type SearchResult = {
  move: Move | null; score: number; nodes: number; completedDepth: number;
  elapsedMs: number; pv: Move[]; aborted: boolean;
};
searchBestMove(input: SearchInput, now: () => number, isCancelled: () => boolean): SearchResult
```

Search eval từ side-to-move; terminal thua `-100000 + plyFromRoot`, hòa 0. Negamax là cách triển khai minimax chuẩn hóa, giải thích equivalence trong báo cáo. Root terminal trả null; timeout trước hoàn thành depth 1 chọn nước đầu tiên theo ordering cố định. Kiểm tra clock/cancel ở mỗi node hoặc mỗi 64 node cùng kiểm tra ở root; phụ thuộc test deadline bằng injected clock. Count path tăng/giảm trong try/finally, không chỉ dùng counts vị trí thật mà bỏ các node tìm kiếm.

## HTTP API v1

Prefix `/api/v1`. Public routes chỉ auth và health. Các route còn lại Bearer, user hoàn tất onboarding; exceptions `/me`, `/auth/complete-profile` cho user đang onboarding. Status 400 schema, 401 auth, 403 quyền, 404 absent hoặc private inaccessible, 409 state conflicts, 429 rate limit, 503 capacity/service unavailable. Kiểm tra quyền trước tiết lộ resource có tồn tại.

| Method/path | Input chính | Output data |
|---|---|---|
| POST /auth/login | username,password | Supabase access_token,refresh_token,expires_in,user; no-store |
| POST /auth/complete-profile | username,displayName | Profile DTO |
| POST /auth/logout | scope CURRENT hoặc ALL | `{revoked:true}` |
| GET /me | — | profile, onboardingRequired |
| PATCH /me | displayName | Profile DTO |
| GET /users?prefix=... | 3..24 chars | Profile[] ≤20 |
| GET /friends | — | friends + requests, bounded cursor pagination |
| POST /friends/requests | recipientId | relation DTO |
| POST /friends/requests/:id/respond | accept:boolean | relation DTO |
| DELETE /friends/requests/:id | — | `{removed:true}` sender only |
| DELETE /friends/:userId | — | `{removed:true}` member only |
| GET /rooms?cursor=... | — | public Room DTO summaries ≤20 |
| POST /rooms | name,visibility,timeControl | Room DTO |
| GET /rooms/:id | — | Room DTO, membership required |
| PATCH /rooms/:id | name?,visibility?,timeControl? | Room DTO; timeControl mutable only WAITING |
| POST /rooms/:id/ready | ready:boolean | Room DTO + match snapshot if both ready |
| POST /rooms/:id/invitations | recipientId? | direct invitation DTO or PLAY token/code |
| GET /invitations | cursor? | received pending/recent ≤20 |
| POST /invitations/:id/respond | accept:boolean | Room DTO if accepted |
| POST /rooms/:id/watch-code | rotate:boolean | WATCH code/token, owner only |
| POST /rooms/join | roomId? OR code OR token, role PLAY/WATCH | Room DTO; exactly one locator; role must match grant |
| POST /rooms/:id/leave | confirmResign:boolean | closed/left + optional outcome |
| POST /control/takeover | tabId UUID | controllerId + controlEpoch; user context derived, supports AI |
| GET /matches/:id | — | MatchSnapshot |
| POST /matches/:id/commands/move | MatchCommand<Move> | CommandResult |
| POST /matches/:id/commands/resign | MatchCommand<{}> | CommandResult |
| POST /matches/:id/commands/propose | MatchCommand<{kind:DRAW/UNDO}> | CommandResult |
| POST /matches/:id/commands/respond | MatchCommand<{proposalId,accept:boolean}> | CommandResult |
| POST /matches/:id/commands/undo-ai | MatchCommand<{}> | CommandResult |
| POST /rooms/:id/rematch | commandId UUID,expectedMatchId UUID,accept:boolean | `{room:RoomDTO,newMatchId:string|null}`; snapshot mới lấy qua match subscription |
| GET /history?cursor=... | — | participant match summaries ≤20 |
| GET /matches/:id/replay | — | initialPosition, effectiveMoves, undoCount,outcome |
| GET /rooms/:id/chat?cursor=... | current match inferred | authorized channel messages ≤50 |
| POST /rooms/:id/chat | clientMessageId UUID,content | ChatMessage |
| POST /ai/matches | side,level,timeControl | MatchSnapshot |
| POST /media/session | roomId,matchId,controllerId | media connection grants, see media spec |
| GET /media/policy?matchId=... | membership, read-only | `{policies:PolicyState[]}` theo06 |
| PATCH /media/policy | matchId,kind CAMERA/MICROPHONE,audience,policyVersion | PolicyState desired/applied/status theo06 |
| POST /media/end | matchId | `{stopped:true}` own tracks only |

Google and recovery callback SPA paths `/auth/callback` and `/auth/reset-password`; official Supabase PKCE/exchange/updateUser SDK flow in auth spec. No custom OAuth token exchange protocol. AI create also enforces one active match/user even without room.

Controller lease qua `X-Control-Id` và `X-Control-Epoch` bắt buộc cho HTTP match commands, room rematch, chat send, media session/policy/end. Nếu body media/session có controllerId thì phải khớp header. Socket mutation chat:send và match:move mang controllerId/controlEpoch, server kiểm với lease hiện hành; handshake không đủ thay cho epoch check mỗi write. Read-only snapshot/chat history không yêu cầu controller, vẫn kiểm membership/session. IDs are UUID except codes. No implicit actorId in request. Signup/recovery/resend dùng browser Supabase SDK theo auth spec, không có BFF endpoint tương ứng.

## Socket.IO

One namespace `/`, WebSocket transport for game server deployment (HTTP command fallback remains). Handshake `auth:{accessToken,tabId}`; Origin allowlist and session check. Never accept room name supplied as permission proof. Access token refresh triggers reconnect with fresh token; app sync on every reconnect. Do not enable skip-middlewares recovery.

| Event | Direction | Payload / behavior |
|---|---|---|
| room:subscribe | client→server ack | roomId; return authorized Room DTO, match snapshot and private controller details |
| match:subscribe | client→server ack | matchId; snapshot + controller grant, AI participant or online membership checked |
| ai:status | server→human participant | matchId,jobId,jobVersion,state; independent of match.version |
| match:move | client→server ack | matchId,controllerId,controlEpoch,commandId,expectedVersion,payload Move |
| match:sync | client→server ack | matchId,lastVersion; return snapshot after access/deadline check |
| chat:send | client→server ack | roomId,controllerId,controlEpoch,clientMessageId,content; same service as HTTP |
| presence:heartbeat | client→server ack | tabId; refresh lease for authenticated current control context: online membership or AI human participant |
| room:updated | server→client | Room DTO |
| match:state | server→client | MatchSnapshot |
| chat:message | server→authorized channel | `{id,matchId,channel,sender:Profile,content,createdAtMs,clientMessageId}` |
| invitation:received | server→recipient | id,room summary,expiresAtMs; no token for other accounts |
| friend:updated | server→relation parties | sanitized relation DTO |
| presence:changed | server→friends/room | userId,online |
| access:revoked | server→affected client | roomId,reason,roomVersion |
| control:revoked | server→old controller | roomId:string|null,matchId:string|null,controlEpoch |
| media:policy | server→room | {matchId,policy:PolicyState}; desired/applied/status theo06, no secrets |

Ack envelope `ApiResult<T>`; match mutation T là CommandResult, sync T là MatchSnapshot. Same command receipt trả appliedVersion gốc và snapshot hiện tại theo state spec. Client waits 5 seconds, retries at most twice with same commandId/payload/version; if ambiguous then sync. HTTP and socket adapters call same service functions. Board subscription and chat groups are server-generated; room access is checked on every read/write. Broadcaster never sends PLAYERS chat to generic room topic.

## Database blueprint

All application tables under `public` with RLS enabled, no anon/authenticated grants to read/write; tạo policies TO app_server USING(true) WITH CHECK(true) cho các bảng app cần dùng, cùng SQL grants tối thiểu. app_server là role riêng chỉ backend có credential, không BYPASSRLS, không cấp browser; BFF SQL role with least privilege for app tables. `private` schema for session secrets excluded Data API. Supabase Auth remains owner of `auth.users`; don't alter its internals.

| Table | Required fields / constraints |
|---|---|
| profiles | user_id PK FK auth.users, username UNIQUE nullable until onboarding, display_name, created_at; CHECK(username IS NULL OR username ~ '^[a-z0-9_]{3,24}$') |
| private.revoked_sessions | session_id PK, user_id, expires_at; indexed user |
| friend_relations | id, user_low,user_high UNIQUE pair ordered, requester_id,status PENDING/ACCEPTED, created_at |
| rooms | id,owner_id,name,visibility,status,room_version,current_match_id,time_control,watch_epoch,finished_at,closed_at |
| room_members | room_id,user_id,role,side,ready,admission_epoch,disconnected_at; UNIQUE user_id for current memberships, UNIQUE(room_id,side) for players |
| invitations | id,room_id,sender_id,recipient_id nullable,role PLAY/WATCH,token_hash nullable,code_hash nullable,status,expires_at,epoch; partial unique active code_hash |
| matches | id,room_id nullable,mode,status,red_user_id,black_user_id,ai_side,ai_level,position jsonb,version,ply,time_control,clock jsonb,rule_set_version,outcome jsonb,active_move_ids jsonb,repetition_counts jsonb,proposal jsonb,boot_id,created_at,ended_at |
| client_controls | user_id PK,room_id nullable,match_id nullable,controller_id,control_epoch,lease_until,disconnected_at; works for online/AI/viewer |
| ai_jobs | id,match_id,expected_version,status,job_version,queued_at,started_at,completed_at; one current job per match |
| active_players | user_id PK,match_id FK; one active match including AI; release atomically on result |
| match_events | id,match_id,version,type,payload jsonb,created_at; UNIQUE(match_id,version) |
| match_moves | id,match_id,parent_move_id nullable,side,move jsonb,created_at; immutable, no delete on undo |
| command_receipts | match_id,actor_key,command_id,command_type,payload_hash,applied_version,result jsonb; PK(match_id,actor_key,command_id) |
| chat_messages | id,room_id,match_id,sender_id,channel,client_message_id,content,created_at; UNIQUE(match_id,sender_id,client_message_id) |
| media_transports | match_id,kind,audience,generation,room_name UNIQUE,status; UNIQUE(match_id,kind,audience), server-only |
| media_policy_jobs | id,match_id,desired_version,status,attempts,last_error; server-only |
| room_rematch_votes | room_id,match_id,user_id; PK(room_id,match_id,user_id); vote row means accept=true, FK room/match/profile; added ISSUE-027 |
| room_command_receipts | room_id,actor_id,command_id,command_type,payload_hash,new_match_id nullable; PK(room_id,actor_id,command_id); added ISSUE-027 |
| media_policies | match_id,user_id,camera_audience,microphone_audience,policy_version,applied_camera_audience,applied_microphone_audience,applied_version,status APPLYING/APPLIED,epoch; UNIQUE(match_id,user_id) |

Lock `rooms FOR UPDATE` before membership counting/change and starting match; lock user profiles in user_id order when accepting invitations to avoid cross-room races. Require count WATCH<5 within lock, not count-before-transaction. Across room/member/match changes lock order: room → user rows ordered → match. Mọi ONLINE match command/scheduler/finalizer lấy room lock trước match lock; đọc immutable match.room_id trước transaction để xác định room. AI chỉ match lock. Không có đường match→room lock. finalizer cập nhật room đã khóa trong cùng transaction. Media external calls after authorization snapshot use epoch checks and compensating revocation, not DB lock held across network.

Room creation owner member; start transaction verifies both ready, inserts active_players, match and initial event version 0 and updates room atomically. Match room FK added after matches migration to handle circular room.current_match_id. JSONB game snapshots are validated through contracts; relational role/status columns have CHECK constraints. Store UTC timestamptz, DTO epoch ms. RLS denial tested with anon AND authenticated keys; service role secret is never frontend env.
