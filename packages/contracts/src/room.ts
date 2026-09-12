import { z } from 'zod';
import {
  VisibilitySchema,
  MemberRoleSchema,
  SideSchema,
  TimeControlSchema,
} from './game.js';

export const RoomStatusSchema = z.enum(['WAITING', 'PLAYING', 'FINISHED', 'CLOSED']);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const RoomMemberDTOSchema = z.object({
  userId: z.string().uuid(),
  role: MemberRoleSchema,
  side: SideSchema.nullable(),
  online: z.boolean(),
  ready: z.boolean(),
}).strict();
export type RoomMemberDTO = z.infer<typeof RoomMemberDTOSchema>;

export const RoomDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(64),
  ownerId: z.string().uuid(),
  visibility: VisibilitySchema,
  status: RoomStatusSchema,
  roomVersion: z.number().int().min(0),
  timeControl: TimeControlSchema,
  members: z.array(RoomMemberDTOSchema),
  currentMatchId: z.string().uuid().nullable(),
}).strict();
export type RoomDTO = z.infer<typeof RoomDTOSchema>;

export const CreateRoomBodySchema = z.object({
  name: z.string().min(1).max(64),
  visibility: VisibilitySchema.default('PUBLIC'),
  timeControl: TimeControlSchema.default(0),
}).strict();
export type CreateRoomBody = z.infer<typeof CreateRoomBodySchema>;

export const PatchRoomBodySchema = z.object({
  name: z.string().min(1).max(64).optional(),
  visibility: VisibilitySchema.optional(),
  timeControl: TimeControlSchema.optional(),
}).strict();
export type PatchRoomBody = z.infer<typeof PatchRoomBodySchema>;

export const ReadyBodySchema = z.object({
  ready: z.boolean(),
}).strict();

export const LeaveRoomBodySchema = z.object({
  confirmResign: z.boolean().default(false),
}).strict();

export const TakeoverBodySchema = z.object({
  tabId: z.string().uuid(),
}).strict();

export const ControllerLeaseSchema = z.object({
  controllerId: z.string().uuid(),
  controlEpoch: z.number().int().min(1),
}).strict();
export type ControllerLease = z.infer<typeof ControllerLeaseSchema>;
