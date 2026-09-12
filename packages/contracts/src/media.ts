import { z } from 'zod';

export const MediaTrackSchema = z.enum(['camera', 'microphone']);
export type MediaTrack = z.infer<typeof MediaTrackSchema>;

export const MediaScopeSchema = z.enum(['OFF', 'OPPONENT_ONLY', 'PUBLIC']);
export type MediaScope = z.infer<typeof MediaScopeSchema>;

export const MediaTransportDTOSchema = z.object({
  audience: z.enum(['ROOM', 'WATCH']),
  roomName: z.string(),
  token: z.string(),
  canPublishSources: z.array(MediaTrackSchema),
  canSubscribe: z.boolean(),
}).strict();
export type MediaTransportDTO = z.infer<typeof MediaTransportDTOSchema>;

export const MediaSessionDTOSchema = z.object({
  roomId: z.string().uuid(),
  transports: z.array(MediaTransportDTOSchema),
}).strict();
export type MediaSessionDTO = z.infer<typeof MediaSessionDTOSchema>;

export const UpdateMediaPolicyBodySchema = z.object({
  track: MediaTrackSchema,
  scope: MediaScopeSchema,
}).strict();
export type UpdateMediaPolicyBody = z.infer<typeof UpdateMediaPolicyBodySchema>;
