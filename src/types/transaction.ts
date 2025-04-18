import { z } from 'zod';

export const TRANSACTION_TYPES = [
  'income',
  'expense',
  'borrow',
  'collect',
  'lend',
  'repay',
  'transfer_refundable',
  'transfer_non_refundable',
  'money_transfer',
  'allocation'
] as const;

export const TRANSACTION_STATUS = [
  'pending',
  'completed',
  'cancelled',
  'failed'
] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];
export type TransactionStatus = typeof TRANSACTION_STATUS[number];

// Zod schemas
export const transactionSchema = z.object({
  from_wallet_id: z.string().uuid('ID ví không hợp lệ').optional(),
  to_wallet_id: z.string().uuid('ID ví không hợp lệ').optional(),
  from_fund_id: z.string().uuid('ID quỹ không hợp lệ').optional(),
  to_fund_id: z.string().uuid('ID quỹ không hợp lệ').optional(),
  type: z.enum(TRANSACTION_TYPES, {
    errorMap: () => ({ message: 'Loại giao dịch không hợp lệ' })
  }),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  currency: z.string().default('VND'),
  exchange_rate: z.number().positive('Tỷ giá phải lớn hơn 0').default(1),
  note: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related_transaction_id: z.string().uuid('ID giao dịch liên quan không hợp lệ').optional(),
  meta: z.record(z.any()).optional(),
}).refine(
  (data) => {
    switch (data.type) {
      case 'income':
      case 'borrow':
      case 'collect':
        return !!data.to_fund_id && !!data.to_wallet_id;

      case 'expense':
      case 'lend':
      case 'repay':
        return !!data.from_fund_id && !!data.from_wallet_id;

      case 'transfer_refundable':
      case 'transfer_non_refundable':
        return !!data.from_fund_id && !!data.to_fund_id;

      case 'money_transfer':
        return !!data.from_wallet_id && !!data.to_wallet_id;

      case 'allocation':
        return !!data.to_fund_id;

      default:
        return false;
    }
  },
  {
    message: 'Thiếu thông tin bắt buộc cho loại giao dịch này',
    path: ['type']
  }
);

export const allocationSchema = z.object({
  allocations: z.array(z.object({
    fund_id: z.string().uuid('ID quỹ không hợp lệ'),
    amount: z.number().positive('Số tiền phải lớn hơn 0')
  })).min(1, 'Cần ít nhất một khoản phân bổ')
});

export const transactionUpdateSchema = z.object({
  status: z.enum(TRANSACTION_STATUS, {
    errorMap: () => ({ message: 'Trạng thái giao dịch không hợp lệ' })
  }),
  note: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  meta: z.record(z.any()).optional(),
});

export const transactionQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu phải có định dạng YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày kết thúc phải có định dạng YYYY-MM-DD').optional(),
  funds: z.string().regex(/^[a-f\d-]+(,[a-f\d-]+)*$/i, 'Danh sách ID quỹ không hợp lệ').optional(),
  wallets: z.string().regex(/^[a-f\d-]+(,[a-f\d-]+)*$/i, 'Danh sách ID ví không hợp lệ').optional(),
  tags: z.string().optional(),
  limit: z.string().regex(/^\d+$/, 'Limit phải là số').transform(Number).optional(),
  offset: z.string().regex(/^\d+$/, 'Offset phải là số').transform(Number).optional()
});

export const transactionReportSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu phải có định dạng YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày kết thúc phải có định dạng YYYY-MM-DD').optional(),
  funds: z.string().regex(/^[a-f\d-]+(,[a-f\d-]+)*$/i, 'Danh sách ID quỹ không hợp lệ').optional(),
  wallets: z.string().regex(/^[a-f\d-]+(,[a-f\d-]+)*$/i, 'Danh sách ID ví không hợp lệ').optional(),
  tags: z.string().optional()
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
    path: ['startDate']
  }
);

// Query parameter types
export interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  funds?: string;  // Comma-separated UUIDs
  wallets?: string;  // Comma-separated UUIDs
  tags?: string;  // Comma-separated strings
  limit?: string;
  offset?: string;
}

// Processed filter types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  funds?: string[];  // Array of UUIDs
  wallets?: string[];  // Array of UUIDs
  tags?: string[];  // Array of strings
  limit?: number;
  offset?: number;
}

// Helper function to convert query params to filters
export const parseTransactionQueryParams = (params: TransactionQueryParams): TransactionFilters => {
  return {
    startDate: params.startDate ? `${params.startDate}T00:00:00Z` : undefined,
    endDate: params.endDate ? `${params.endDate}T23:59:59.999Z` : undefined,
    funds: params.funds?.split(','),
    wallets: params.wallets?.split(','),
    tags: params.tags?.split(','),
    limit: params.limit ? parseInt(params.limit) : 100,
    offset: params.offset ? parseInt(params.offset) : 0
  };
};

// Types
export interface Transaction {
  id: string;
  machine_id: string;
  from_wallet_id?: string;
  to_wallet_id?: string;
  from_fund_id?: string;
  to_fund_id?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  exchange_rate: number;
  note?: string;
  category?: string;
  tags?: string[];
  related_transaction_id?: string;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  from_wallet?: { id: string; name: string };
  to_wallet?: { id: string; name: string };
  from_fund?: { id: string; name: string };
  to_fund?: { id: string; name: string };
  related_transaction?: Transaction;
}

export interface TransactionReport {
  startBalance: number;
  endBalance: number;
  difference: number;
  percentageChange: number;
}

export type CreateTransactionInput = z.infer<typeof transactionSchema>;
export type UpdateTransactionInput = z.infer<typeof transactionUpdateSchema>;
export type AllocationInput = z.infer<typeof allocationSchema>;
export type TransactionFilter = z.infer<typeof transactionQuerySchema>;
export type TransactionReportQuery = z.infer<typeof transactionReportSchema>;

// Error types
export class TransactionError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'TransactionError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
