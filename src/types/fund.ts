import { z } from 'zod';

// Zod schemas
export const fundSchema = z.object({
  store_id: z.string().uuid('ID kho không hợp lệ'),
  name: z.string().min(1, 'Tên quỹ không được để trống'),
  description: z.string().optional(),
  percent: z.number().min(0, 'Phần trăm không được âm').max(100, 'Phần trăm không được vượt quá 100'),
  icon: z.string().optional(),
  config: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional()
});

export const fundUpdateSchema = fundSchema.partial();

export const balanceSchema = z.object({
  amount: z.number().min(0, 'Số tiền không được âm'),
  description: z.string().optional()
});

export const fundQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  name: z.string().optional(),
  minPercent: z.number().min(0).optional(),
  maxPercent: z.number().max(100).optional(),
  minBalance: z.number().min(0).optional(),
  maxBalance: z.number().optional()
});

// Types
export interface Fund {
  id: string;
  machine_id: string;
  store_id: string;
  name: string;
  description?: string;
  percent: number;
  balance: number;
  icon?: string;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CreateFundInput = z.infer<typeof fundSchema>;
export type UpdateFundInput = z.infer<typeof fundUpdateSchema>;
export type UpdateBalanceInput = z.infer<typeof balanceSchema>;
export type FundQuery = z.infer<typeof fundQuerySchema>;

// Error types
export class FundError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'FundError';
    this.statusCode = statusCode;
  }
}
