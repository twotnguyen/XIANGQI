import { z } from 'zod';
import { MemberRoleSchema } from './game.js';

export const InvitationStatusSchema = z.enum([
  'PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED',
]);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const InvitationDTOSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  inviterId: z.string().uuid(),
  recipientId: z.string().uuid().nullable(),
  role: MemberRoleSchema,
  code: z.string().nullable(),
  status: InvitationStatusSchema,
  expiresAt: z.string(),
  createdAt: z.string(),
}).strict();
export type InvitationDTO = z.infer<typeof InvitationDTOSchema>;

export const CreateInvitationBodySchema = z.object({
  recipientId: z.string().uuid().optional(),
  role: MemberRoleSchema.default('PLAYER'),
}).strict();
export type CreateInvitationBody = z.infer<typeof CreateInvitationBodySchema>;

export const RespondInvitationBodySchema = z.object({
  accept: z.boolean(),
}).strict();
export type RespondInvitationBody = z.infer<typeof RespondInvitationBodySchema>;

export const WatchCodeBodySchema = z.object({
  rotate: z.boolean().default(false),
}).strict();
export type WatchCodeBody = z.infer<typeof WatchCodeBodySchema>;

export const JoinRoomBodySchema = z.object({
  roomId: z.string().uuid().optional(),
  code: z.string().min(1).max(16).optional(),
  token: z.string().min(1).max(128).optional(),
  role: MemberRoleSchema,
}).strict().refine(
  (data) => {
    // Exactly one locator must be provided
    const locators = [data.roomId, data.code, data.token].filter(Boolean);
    return locators.length === 1;
  },
  { message: 'Cần cung cấp chính xác 1 trong: roomId, code hoặc token' },
);
export type JoinRoomBody = z.infer<typeof JoinRoomBodySchema>;
