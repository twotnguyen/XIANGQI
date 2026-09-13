import { z } from 'zod';

// ── Core enums ──────────────────────────────────────────────

export const SideSchema = z.enum(['RED', 'BLACK']);
export type Side = z.infer<typeof SideSchema>;

export const PieceTypeSchema = z.enum([
  'GENERAL', 'ADVISOR', 'ELEPHANT', 'HORSE', 'ROOK', 'CANNON', 'PAWN',
]);
export type PieceType = z.infer<typeof PieceTypeSchema>;

export const VisibilitySchema = z.enum(['PUBLIC', 'CODE_ONLY', 'LOCKED']);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const MemberRoleSchema = z.enum(['PLAYER', 'SPECTATOR']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const AudienceSchema = z.enum(['OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS']);
export type Audience = z.infer<typeof AudienceSchema>;

export const TimeControlSchema = z.union([
  z.literal(0), z.literal(300), z.literal(600), z.literal(900),
]);
export type TimeControl = z.infer<typeof TimeControlSchema>;

export const AiLevelSchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type AiLevel = z.infer<typeof AiLevelSchema>;

// ── Board geometry ──────────────────────────────────────────

/** Integer coordinate on 9×10 board. x: 0..8 (columns), y: 0..9 (rows) */
export const SquareSchema = z.object({
  x: z.number().int().min(0).max(8),
  y: z.number().int().min(0).max(9),
}).strict();
export type Square = z.infer<typeof SquareSchema>;

export const BOARD_SIZE = 90; // 9 columns × 10 rows

/** Convert square to flat board index */
export function squareToIndex(sq: Square): number {
  return sq.y * 9 + sq.x;
}

/** Convert flat board index to square */
export function indexToSquare(index: number): Square {
  return { x: index % 9, y: Math.floor(index / 9) };
}

// ── Pieces ──────────────────────────────────────────────────

export const PieceSchema = z.object({
  id: z.string().min(1),
  type: PieceTypeSchema,
  side: SideSchema,
}).strict();
export type Piece = z.infer<typeof PieceSchema>;

/** Board is exactly 90 slots, null means empty */
export type Board = (Piece | null)[];

// ── Move ────────────────────────────────────────────────────

export const MoveSchema = z.object({
  from: SquareSchema,
  to: SquareSchema,
}).strict();
export type Move = z.infer<typeof MoveSchema>;

// ── Position ────────────────────────────────────────────────

export type Position = {
  board: Board;
  turn: Side;
};

// ── Outcome ─────────────────────────────────────────────────

export const OutcomeReasonSchema = z.enum([
  'CHECKMATE', 'STALEMATE', 'REPETITION', 'RESIGN',
  'AGREED_DRAW', 'TIMEOUT', 'DISCONNECT', 'BOTH_OFFLINE',
  'SERVER_RESTART', 'AI_UNAVAILABLE',
]);

export const OutcomeSchema = z.object({
  winner: SideSchema.nullable(),
  reason: OutcomeReasonSchema,
}).strict();
export type Outcome = z.infer<typeof OutcomeSchema>;

// ── Terminal event (spec 03/04) ─────────────────────────────
/**
 * Immutable event descriptor handed to the finalizer before it bumps the version.
 * - `MOVE`: the move that ended the match; `parentMoveId` is the branch tip it extends.
 * - `RESULT`: every terminal that is not a move (resign, draw accepted, timeout,
 *   disconnect/restart/AI fault); the finalizer adds `outcome` before persistence.
 */
export type TerminalEvent =
  | { type: 'MOVE'; payload: { moveId: string; parentMoveId: string | null; side: Side; move: Move } }
  | { type: 'RESULT'; payload: { actorKey: string | null } };

// ── Clock ───────────────────────────────────────────────────

export const ClockStateSchema = z.object({
  redMs: z.number().int().min(0),
  blackMs: z.number().int().min(0),
  runningSinceEpochMs: z.number().int().min(0),
}).strict().nullable();
export type ClockState = z.infer<typeof ClockStateSchema>;

// ── Proposal ────────────────────────────────────────────────
/**
 * Proposal DTO exposed to clients.
 * - `requesterId` is the user UUID of the requesting player.
 * - DB stores `requester` as Side ('RED'|'BLACK') in matches.proposal JSONB.
 * - Repository layer maps between Side and userId using match participant IDs.
 */
export const ProposalKindSchema = z.enum(['DRAW', 'UNDO']);

export const ProposalSchema = z.object({
  id: z.string().uuid(),
  kind: ProposalKindSchema,
  requesterId: z.string().uuid(),
  basePly: z.number().int().min(0),
  createdVersion: z.number().int().min(0),
  expiresAtMs: z.number().int().min(0),
}).strict();
export type Proposal = z.infer<typeof ProposalSchema>;

// ── Error codes ─────────────────────────────────────────────

export const ErrorCodeSchema = z.enum([
  'UNAUTHENTICATED', 'FORBIDDEN', 'VALIDATION_ERROR', 'NOT_FOUND',
  'CONFLICT', 'RATE_LIMITED', 'EMAIL_UNVERIFIED', 'ONBOARDING_REQUIRED',
  'ROOM_FULL', 'ROOM_CLOSED', 'ALREADY_IN_ROOM', 'INVITE_INVALID',
  'NOT_YOUR_TURN', 'INVALID_MOVE', 'VERSION_CONFLICT', 'COMMAND_ID_REUSED',
  'MATCH_ENDED', 'PROPOSAL_EXPIRED', 'CONTROL_REQUIRED', 'AI_BUSY',
  'MEDIA_UNAVAILABLE',
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

// ── API result ──────────────────────────────────────────────

export type ApiResult<T> =
  | { ok: true; data: T; requestId: string }
  | { ok: false; error: { code: ErrorCode; message: string }; requestId: string };

// ── Match command ───────────────────────────────────────────

/** Base command envelope — individual commands extend with typed payload */
export const MatchCommandBaseSchema = z.object({
  commandId: z.string().uuid(),
  expectedVersion: z.number().int().min(0),
}).strict();

export const MoveCommandSchema = MatchCommandBaseSchema.extend({
  payload: MoveSchema,
}).strict();

export const ResignCommandSchema = MatchCommandBaseSchema.extend({
  payload: z.object({}).strict(),
}).strict();

export const ProposeCommandSchema = MatchCommandBaseSchema.extend({
  payload: z.object({
    kind: ProposalKindSchema,
  }).strict(),
}).strict();

export const RespondCommandSchema = MatchCommandBaseSchema.extend({
  payload: z.object({
    proposalId: z.string().uuid(),
    accept: z.boolean(),
  }).strict(),
}).strict();

export const UndoAiCommandSchema = MatchCommandBaseSchema.extend({
  payload: z.object({}).strict(),
}).strict();

/** Generic command type for TypeScript consumers */
export type MatchCommand<T> = {
  commandId: string;
  expectedVersion: number;
  payload: T;
};

// ── Match snapshot (type only, Zod for runtime validation where needed) ─

export type MatchMode = 'ONLINE' | 'AI';
export type MatchStatus = 'ACTIVE' | 'FINISHED' | 'INTERRUPTED';

export type MatchSnapshot = {
  id: string;
  roomId: string | null;
  mode: MatchMode;
  status: MatchStatus;
  position: Position;
  version: number;
  ply: number;
  ruleSetVersion: 'xiangqi-simple-v1';
  redUserId: string | null;
  blackUserId: string | null;
  aiSide: Side | null;
  aiLevel: AiLevel | null;
  timeControl: TimeControl;
  clock: ClockState;
  outcome: Outcome | null;
  activeMoveIds: string[];
  proposal: Proposal | null;
  serverNowMs: number;
  aiState: {
    jobId: string | null;
    jobVersion: number;
    state: 'IDLE' | 'QUEUED' | 'THINKING' | 'FAILED';
  } | null;
  presence: {
    userId: string;
    online: boolean;
    disconnectDeadlineMs: number | null;
  }[];
};

export type CommandResult = {
  appliedVersion: number;
  snapshot: MatchSnapshot;
};
