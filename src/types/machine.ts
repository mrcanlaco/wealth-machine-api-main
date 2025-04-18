import { z } from 'zod';

// Base schemas
export const storeSchema = z.object({
  name: z.string().min(1, 'Tên kho không được để trống'),
  type: z.enum(['income', 'expense', 'reserve', 'expansion', 'business']),
  icon: z.string().optional(),
  funds: z.array(z.object({
    name: z.string().min(1, 'Tên quỹ không được để trống'),
    icon: z.string().optional(),
    percent: z.number().min(0).max(100)
  }))
});

export const walletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống'),
  type: z.enum(['cash', 'bank', 'crypto', 'savings']),
  icon: z.string().optional(),
  balance: z.number().nonnegative('Số dư không được âm'),
  currency: z.string().min(1, 'Loại tiền tệ không được để trống').default('VND'),
});

// Schema for machine creation
export const machineSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  icon: z.string().nullable().optional(),
  currency: z.string().min(1, 'Loại tiền tệ không được để trống').default('VND'),
  config: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional(),
  stores: z.array(storeSchema),
  wallets: z.array(walletSchema)
}).refine((data) => {
  // Tổng phần trăm của tất cả các quỹ (ngoại trừ income) nhỏ hơn hoăc bằng 100%
  const totalPercent = data.stores
    .filter(store => store.type !== 'income') // Exclude income stores
    .reduce((sum, store) => {
      return sum + store.funds.reduce((storeSum, fund) => storeSum + fund.percent, 0);
    }, 0);
  return totalPercent <= 100;
}, {
  message: 'Tổng phần trăm tất cả các quỹ phải là 100%',
  path: ['stores']
});

// Schema for machine update
export const machineUpdateSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').optional(),
  icon: z.string().optional(),
  currency: z.string().min(1, 'Loại tiền tệ không được để trống').optional(),
  config: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional()
});

// Tag schema
export const tagSchema = z.object({
  label: z.string(),
  color: z.string(),
  icon: z.string().optional()
});

// Store and Fund management schemas
export const fundActionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tên quỹ không được để trống'),
  icon: z.string().optional(),
  percent: z.number().min(0).max(100),
  action: z.enum(['create', 'update', 'delete'])
});

export const storeActionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tên kho không được để trống'),
  type: z.enum(['income', 'expense', 'reserve', 'expansion', 'business']),
  icon: z.string().optional(),
  action: z.enum(['create', 'update', 'delete']),
  meta: z.object({
    tags: z.array(tagSchema).optional()
  }).optional(),
  funds: z.array(fundActionSchema)
});

export const saveStoresFundsSchema = z.object({
  stores: z.array(storeActionSchema)
}).refine((data) => {
  // Calculate total percentage across all stores excepting income and deleted
  const totalPercent = data.stores
    .filter(store => store.type !== 'income' && store.action !== 'delete') // Exclude stores being income or deleted
    .reduce((sum, store) => {
      return sum + store.funds
        .filter(fund => fund.action !== 'delete') // Exclude funds being deleted
        .reduce((storeSum, fund) => storeSum + fund.percent, 0);
    }, 0);

  return totalPercent <= 100;
}, {
  message: 'Tổng phần trăm tất cả các quỹ không được vượt quá 100%',
  path: ['stores']
});

// Types
export interface Machine {
  id: string;
  name: string;
  icon?: string;
  currency: string;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  un_allocated: number;
  created_at: Date;
  updated_at: Date;
}

export type Store = {
  id: string;
  machine_id: string;
  name: string;
  icon?: string;
  type: 'income' | 'expense' | 'reserve' | 'expansion' | 'business';
  config?: Record<string, any>;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Fund = {
  id: string;
  machine_id: string;
  store_id: string;
  name: string;
  icon?: string;
  percent: number;
  balance: number;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: string;
  machine_id: string;
  name: string;
  icon?: string;
  type: 'cash' | 'bank' | 'crypto' | 'savings';
  balance: number;
  currency: string;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type MachineUser = {
  id: string;
  machine_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  invited_by: string;
  created_at: string;
  updated_at: string;
};

export type MachineInvitation = {
  id: string;
  machine_id: string;
  invited_email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected';
  expires_at: string;
  created_at: string;
};

export type MachineWithUsers = Machine & {
  users: MachineUser[];
};

export type MachineWithDetails = Machine & {
  stores: Store[];
  funds: Fund[];
  wallets: Wallet[];
  users: MachineUser[];
};

export interface MachineMinimal {
  id: string;
  un_allocated: number;
  stores: { id: string }[];
  funds: { id: string; balance: number }[];
  wallets: { id: string; balance: number }[];
}

// Types for store and fund actions
export type FundAction = z.infer<typeof fundActionSchema>;
export type StoreAction = z.infer<typeof storeActionSchema>;
export type SaveStoresFundsInput = z.infer<typeof saveStoresFundsSchema>;

export type SaveStoresFundsResponse = {
  stores: { id: string; action: string }[];
  funds: { id: string; action: string }[];
};

// Input types
export type CreateMachineInput = z.infer<typeof machineSchema>;
export type UpdateMachineInput = z.infer<typeof machineUpdateSchema>;
export type StoreInput = z.infer<typeof storeSchema>;
export type WalletInput = z.infer<typeof walletSchema>;

// Role types
export const MACHINE_ROLES = ['owner', 'member'] as const;
export type MachineRole = typeof MACHINE_ROLES[number];

// Error types
export class MachineError extends Error {
  statusCode?: number;
  code?: string;
  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'MachineError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
