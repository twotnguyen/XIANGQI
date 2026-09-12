import { z } from 'zod';

export const ChatChannelSchema = z.enum(['PLAYERS', 'SPECTATORS']);
export type ChatChannel = z.infer<typeof ChatChannelSchema>;

export const ChatMessageDTOSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  channel: ChatChannelSchema,
  senderId: z.string().uuid(),
  senderUsername: z.string(),
  senderDisplayName: z.string().nullable(),
  clientMessageId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  createdAt: z.string(),
}).strict();
export type ChatMessageDTO = z.infer<typeof ChatMessageDTOSchema>;

export const SendMessageBodySchema = z.object({
  clientMessageId: z.string().uuid(),
  content: z.string().min(1).max(1000),
}).strict();
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
