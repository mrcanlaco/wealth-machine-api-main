import { z } from 'zod';

// Report period type
export const reportPeriodSchema = z.object({
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ')
});

// Report type enum
export const ReportType = {
  OVERVIEW: 'overview',
  CASH_FLOW: 'cashflow',
  BALANCE_SHEET: 'balance',
  INCOME_STATEMENT: 'income',
  CATEGORY_ANALYSIS: 'category',
  TREND_ANALYSIS: 'trend',
  PREDICTION: 'prediction'
} as const;

// Report format enum
export const ReportFormat = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel'
} as const;

// Schema for report generation
export const reportSchema = z.object({
  type: z.nativeEnum(ReportType, {
    errorMap: () => ({ message: 'Loại báo cáo không hợp lệ' })
  }),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ').optional(),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  format: z.nativeEnum(ReportFormat, {
    errorMap: () => ({ message: 'Định dạng báo cáo không hợp lệ' })
  }).optional().default('pdf'),
  filters: z.record(z.any()).optional()
});

// Schema for report queries
export const reportQuerySchema = z.object({
  type: z.nativeEnum(ReportType, {
    errorMap: () => ({ message: 'Loại báo cáo không hợp lệ' })
  }).optional(),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ').optional(),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year'], {
    errorMap: () => ({ message: 'Kỳ báo cáo không hợp lệ' })
  }).optional(),
});

// Schema for report export
export const exportReportSchema = z.object({
  type: z.nativeEnum(ReportType, {
    errorMap: () => ({ message: 'Loại báo cáo không hợp lệ' })
  }),
  format: z.nativeEnum(ReportFormat, {
    errorMap: () => ({ message: 'Định dạng xuất không hợp lệ' })
  }),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ').optional(),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  options: z.object({
    includeCharts: z.boolean().optional(),
    language: z.enum(['vi', 'en']).optional(),
    template: z.string().optional()
  }).optional()
});

// Base report interface
export interface Report {
  id: string;
  machine_id: string;
  type: keyof typeof ReportType;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Overview report type
export interface OverviewReport {
  totalWalletBalance: number;
  totalFundBalance: number;
  totalBalance: number;
  walletCount: number;
  fundCount: number;
  recentTransactions: any[];
}

// Cash flow report type
export interface CashFlowReport {
  dailyCashFlow: Record<string, any>;
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalLending: number;
    totalBorrowing: number;
    netFlow: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

// Balance sheet report type
export interface BalanceSheetReport {
  assets: {
    wallets: any[];
    funds: any[];
    totalAssets: number;
  };
  liabilities: {
    debts: any[];
    totalLiabilities: number;
  };
  netWorth: number;
  date: string;
}

// Income statement report type
export interface IncomeStatementReport {
  income: {
    categories: Record<string, number>;
    total: number;
  };
  expenses: {
    categories: Record<string, number>;
    total: number;
  };
  netIncome: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// Input types
export type ReportInput = z.infer<typeof reportSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type ExportReportQuery = z.infer<typeof exportReportSchema>;

// Custom error class for report-related errors
export class ReportError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ReportError';
    this.statusCode = statusCode;
  }
}
