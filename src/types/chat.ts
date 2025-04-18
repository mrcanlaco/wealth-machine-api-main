import { z } from 'zod';

export const chatSchema = z.object({
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống'),
  type: z.enum(['text', 'image', 'file', 'system']),
  metadata: z.record(z.any()).optional()
});

export const chatQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const chatReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['pdf', 'csv', 'excel']).optional()
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, 'Message content cannot be empty'),
  type: z.enum(['text', 'image', 'file', 'system']),
  metadata: z.record(z.any()).optional()
});

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống')
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống'),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  metadata: z.record(z.any()).optional()
});

export const assistantSchema = z.object({
  question: z.string().min(1, 'Câu hỏi không được để trống'),
  context: z.record(z.any()).optional()
});

export const analyzeSchema = z.object({
  content: z.string().min(1, 'Nội dung phân tích không được để trống'),
  options: z.object({
    detailed: z.boolean().optional(),
    format: z.enum(['simple', 'detailed']).optional()
  }).optional()
});

export type Chat = z.infer<typeof chatSchema>;
export type ChatQuery = z.infer<typeof chatQuerySchema>;
export type ChatReport = z.infer<typeof chatReportSchema>;
export type Message = z.infer<typeof messageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AssistantInput = z.infer<typeof assistantSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;

export class ChatError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ChatError';
    this.statusCode = statusCode;
  }
}
