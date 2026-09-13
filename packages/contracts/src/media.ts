import { z } from 'zod';
import { AudienceSchema } from './game.js';

/** Track kind as persisted in `media_transports.kind` / `media_policies`. */
export const MediaKindSchema = z.enum(['CAMERA', 'MICROPHONE']);
export type MediaKind = z.infer<typeof MediaKindSchema>;

/** Transport room audience. Distinct from the UI `Audience` enum (spec 06). */
export const TransportAudienceSchema = z.enum(['PRIVATE', 'WATCH']);
export type TransportAudience = z.infer<typeof TransportAudienceSchema>;

/** Public status of one player's desired/applied policy. */
export const MediaPolicyStatusSchema = z.enum(['APPLYING', 'APPLIED']);
export type MediaPolicyStatus = z.infer<typeof MediaPolicyStatusSchema>;

/** Desired/applied audience per source. A viewer has no own policy. */
export const SourcePolicySchema = z
  .object({
    camera: AudienceSchema,
    microphone: AudienceSchema,
  })
  .strict();
export type SourcePolicy = z.infer<typeof SourcePolicySchema>;

/** `media_policies` row projected for members (no secrets). */
export const PolicyStateSchema = z
  .object({
    userId: z.string().uuid(),
    policyVersion: z.number().int().min(0),
    appliedVersion: z.number().int().min(0),
    desired: SourcePolicySchema,
    applied: SourcePolicySchema,
    status: MediaPolicyStatusSchema,
  })
  .strict();
export type PolicyState = z.infer<typeof PolicyStateSchema>;

export const MediaPolicyListSchema = z
  .object({
    policies: z.array(PolicyStateSchema),
  })
  .strict();
export type MediaPolicyList = z.infer<typeof MediaPolicyListSchema>;

/** One room-specific, short-lived LiveKit connection grant. */
export const TransportGrantSchema = z
  .object({
    kind: MediaKindSchema,
    audience: TransportAudienceSchema,
    roomName: z.string(),
    url: z.string(),
    token: z.string(),
    generation: z.number().int().min(1),
    status: z.literal('READY'),
    expiresAtMs: z.number().int(),
    canPublish: z.boolean(),
    canSubscribe: z.boolean(),
    publishSource: MediaKindSchema.nullable(),
  })
  .strict();
export type TransportGrant = z.infer<typeof TransportGrantSchema>;

export const MediaSessionSchema = z
  .object({
    ownPolicy: PolicyStateSchema.nullable(),
    policies: z.array(PolicyStateSchema),
    transports: z.array(TransportGrantSchema),
  })
  .strict();
export type MediaSession = z.infer<typeof MediaSessionSchema>;

/** Body of `POST /media/session` (spec 04). */
export const CreateMediaSessionBodySchema = z
  .object({
    roomId: z.string().uuid(),
    matchId: z.string().uuid(),
    controllerId: z.string().uuid(),
  })
  .strict();
export type CreateMediaSessionBody = z.infer<typeof CreateMediaSessionBodySchema>;

/** Body of `PATCH /media/policy` (spec 04). */
export const UpdateMediaPolicyBodySchema = z
  .object({
    matchId: z.string().uuid(),
    kind: MediaKindSchema,
    audience: AudienceSchema,
    policyVersion: z.number().int().min(0),
  })
  .strict();
export type UpdateMediaPolicyBody = z.infer<typeof UpdateMediaPolicyBodySchema>;

/** Body of `POST /media/end` (spec 04). */
export const EndMediaBodySchema = z
  .object({
    matchId: z.string().uuid(),
  })
  .strict();
export type EndMediaBody = z.infer<typeof EndMediaBodySchema>;
