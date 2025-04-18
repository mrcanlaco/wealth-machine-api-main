import { z } from 'zod';

// Schema for creating a new wallet
export const walletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống'),
  icon: z.string().optional(),
  type: z.enum(['cash', 'bank', 'crypto', 'stock', 'other']),
  currency: z.string().min(1, 'Loại tiền tệ không được để trống').default('VND'),
  balance: z.number().min(0, 'Số dư không đượcâm').default(0),
  metadata: z.record(z.any()).optional()
});

// Schema for update balance
export const walletUpdateBalanceSchema = z.object({
  currency: z.string().min(1, 'Loại tiền tệ không được để trống').default('VND'),
  balance: z.number().min(0, 'Số dư không đượcâm').default(0),
});

// Schema for updating an existing wallet
export const walletUpdateSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống').optional(),
  icon: z.string().optional(),
  type: z.enum(['cash', 'bank', 'crypto', 'stock', 'other']).optional(),
  metadata: z.record(z.any()).optional()
});

// Base wallet type
export interface Wallet {
  id: string;
  machine_id: string;
  name: string;
  icon?: string;
  type: 'cash' | 'bank' | 'crypto' | 'stock' | 'other';
  currency: string;
  balance: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Input type for creating a wallet
export type CreateWalletInput = z.infer<typeof walletSchema>;

// Input type for updating a wallet
export type UpdateWalletInput = z.infer<typeof walletUpdateSchema>;

// Input type for updating wallet balance
export type UpdateWalletBalanceInput = z.infer<typeof walletUpdateBalanceSchema>;

// Custom error class for wallet-related errors
export class WalletError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'WalletError';
    this.statusCode = statusCode;
  }
}
