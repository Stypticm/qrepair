import { z } from 'zod';

export const agentContextQuerySchema = z.object({
  telegramId: z.string().min(1, 'telegramId is required'),
});

export const requestStatusQuerySchema = z.object({
  id: z.string().min(1, 'requestId is required'),
});

export const updateRequestStatusSchema = z.object({
  id: z.string().min(1, 'requestId is required'),
  status: z.string().min(1, 'status is required'),
  agentName: z.string().min(1, 'agentName is required'),
  comment: z.string().optional(),
});

export const escalationSchema = z.object({
  telegramId: z.string().min(1, 'telegramId is required'),
  reason: z.string().min(1, 'reason is required'),
  agentName: z.string().min(1, 'agentName is required'),
  context: z.any().optional(),
});
