import { z } from 'zod';
import { Fund } from './fund';

export const STORE_TYPES = ['income', 'expense', 'reserve', 'expansion', 'business'] as const;
export type StoreType = typeof STORE_TYPES[number];

// Zod schemas
export const storeSchema = z.object({
  name: z.string().min(1, 'Tên kho không được để trống'),
  icon: z.string().optional(),
  type: z.enum(STORE_TYPES, {
    errorMap: () => ({ message: 'Loại kho không hợp lệ' })
  }),
  config: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional(),
});

export const storeUpdateSchema = storeSchema.partial();

export const storeQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  name: z.string().optional(),
  type: z.enum(STORE_TYPES).optional(),
  minBalance: z.number().min(0).optional(),
  maxBalance: z.number().optional(),
  minPercentage: z.number().min(0).optional(),
  maxPercentage: z.number().max(100).optional()
});

// Types
export interface Store {
  id: string;
  machine_id: string;
  name: string;
  icon?: string;
  type: StoreType;
  created_at: string;
  updated_at: string;
  config?: Record<string, any>;
  meta?: Record<string, any>;
}

export interface StoreWithFunds extends Store {
  funds: Fund[];
  total_balance: number;
  total_percentage: number;
}

export type CreateStoreInput = z.infer<typeof storeSchema>;
export type UpdateStoreInput = z.infer<typeof storeUpdateSchema>;
export type StoreQuery = z.infer<typeof storeQuerySchema>;

// Error types
export class StoreError extends Error {
  statusCode?: number;
  code?: string;
  
  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'StoreError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
