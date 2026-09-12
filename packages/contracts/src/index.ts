// Contracts — shared types and schemas for xiangqi game.
export {
  // Enums
  SideSchema,
  PieceTypeSchema,
  VisibilitySchema,
  MemberRoleSchema,
  AudienceSchema,
  TimeControlSchema,
  AiLevelSchema,
  OutcomeReasonSchema,
  OutcomeSchema,
  ErrorCodeSchema,
  ProposalKindSchema,
  ProposalSchema,
  ClockStateSchema,

  // Command schemas
  MatchCommandBaseSchema,
  MoveCommandSchema,
  ResignCommandSchema,
  ProposeCommandSchema,
  RespondCommandSchema,
  UndoAiCommandSchema,

  // Schemas
  SquareSchema,
  PieceSchema,
  MoveSchema,

  // Geometry helpers
  BOARD_SIZE,
  squareToIndex,
  indexToSquare,

  // Types
  type Side,
  type PieceType,
  type Piece,
  type Board,
  type Square,
  type Move,
  type Position,
  type Visibility,
  type MemberRole,
  type Audience,
  type TimeControl,
  type AiLevel,
  type Outcome,
  type ClockState,
  type Proposal,
  type ErrorCode,
  type ApiResult,
  type MatchCommand,
  type MatchMode,
  type MatchStatus,
  type MatchSnapshot,
  type CommandResult,
} from './game.js';

export type { SearchInput, SearchResult } from './ai.js';
