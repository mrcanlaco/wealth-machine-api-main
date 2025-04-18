import { supabase } from '@/providers/supabase';
import {
  ReportError,
  OverviewReport,
  CashFlowReport,
  BalanceSheetReport,
  IncomeStatementReport,
  ReportQuery,
  ExportReportQuery
} from '@/types/report';

class ReportService {
  async getOverview(machineId: string): Promise<OverviewReport> {
    try {
      const { data, error } = await supabase
        .rpc('get_machine_overview', {
          p_machine_id: machineId,
          p_page_size: 5,
          p_page: 1
        });

      if (error) throw new ReportError('Lỗi khi lấy báo cáo tổng quan', 400);

      return {
        totalWalletBalance: data.total_balance || 0,
        totalFundBalance: data.fund_summary?.reduce((sum: number, fund: any) => sum + fund.balance, 0) || 0,
        totalBalance: data.total_balance || 0,
        walletCount: data.wallet_summary?.length || 0,
        fundCount: data.fund_summary?.length || 0,
        recentTransactions: data.recent_transactions || []
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getCashFlow(machineId: string, query: ReportQuery): Promise<CashFlowReport> {
    try {
      const { data, error } = await supabase
        .rpc('get_cash_flow_report', {
          p_machine_id: machineId,
          p_start_date: query.startDate,
          p_end_date: query.endDate,
          p_currency: 'VND',
          p_period_type: 'month'
        });

      if (error) throw new ReportError('Lỗi khi lấy báo cáo dòng tiền', 400);

      return {
        dailyCashFlow: data.map((item: any) => ({
          period: item.period,
          income: item.income,
          expense: item.expense,
          lending: item.lending,
          borrowing: item.borrowing,
          netFlow: item.net_flow,
          transactions: item.transactions
        })),
        summary: {
          totalIncome: data.reduce((sum: number, item: any) => sum + item.income, 0),
          totalExpense: data.reduce((sum: number, item: any) => sum + item.expense, 0),
          totalLending: data.reduce((sum: number, item: any) => sum + item.lending, 0),
          totalBorrowing: data.reduce((sum: number, item: any) => sum + item.borrowing, 0),
          netFlow: data.reduce((sum: number, item: any) => sum + item.net_flow, 0)
        },
        period: {
          startDate: query.startDate || '',
          endDate: query.endDate || '',
        }
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getBalanceSheet(machineId: string, query: ReportQuery): Promise<BalanceSheetReport> {
    try {
      const { data, error } = await supabase
        .rpc('get_balance_sheet', {
          p_machine_id: machineId,
          p_currency: 'VND'
        });

      if (error) throw new ReportError('Lỗi khi lấy báo cáo cân đối', 400);

      return {
        assets: {
          wallets: data.assets || [],
          funds: data.equity || [],
          totalAssets: data.total_assets || 0
        },
        liabilities: {
          debts: data.liabilities || [],
          totalLiabilities: data.total_liabilities || 0
        },
        netWorth: data.net_worth || 0,
        date: query.startDate || ''
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getIncomeStatement(machineId: string, query: ReportQuery): Promise<IncomeStatementReport> {
    try {
      // Lấy giao dịch thu chi trong khoảng thời gian
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          exchange_rate,
          category,
          note,
          created_at,
          from_fund:from_fund_id (
            id, 
            name,
            store:stores (type)
          ),
          to_fund:to_fund_id (
            id,
            name,
            store:stores (type)
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'completed')
        .in('type', ['income', 'expense'])
        .gte('created_at', query.startDate)
        .lte('created_at', query.endDate);

      if (error) throw new ReportError('Lỗi khi lấy thông tin giao dịch', 400);

      // Phân tích thu chi theo danh mục
      const { income, expenses } = this.groupTransactionsByCategory(transactions || []);

      // Tính tổng thu chi
      const totalIncome = Object.values(income.categories).reduce((sum: number, amount: any) => sum + amount, 0);
      const totalExpenses = Object.values(expenses.categories).reduce((sum: number, amount: any) => sum + amount, 0);

      return {
        income: {
          categories: income.categories,
          total: totalIncome
        },
        expenses: {
          categories: expenses.categories,
          total: totalExpenses
        },
        netIncome: totalIncome - totalExpenses,
        period: {
          startDate: query.startDate || '',
          endDate: query.endDate || ''
        }
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getSummary(machineId: string) {
    try {
      // Lấy thống kê tháng hiện tại
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          exchange_rate,
          status,
          category,
          created_at,
          from_fund:from_fund_id (
            id,
            name,
            store:stores (type)
          ),
          to_fund:to_fund_id (
            id,
            name,
            store:stores (type)
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw new ReportError('Lỗi khi lấy thông tin giao dịch', 400);

      // Phân tích theo danh mục
      const { income, expenses } = this.groupTransactionsByCategory(transactions || []);

      // Tính toán tổng thu chi
      const totalIncome = Object.values(income.categories).reduce((sum: number, amount: any) => sum + amount, 0);
      const totalExpenses = Object.values(expenses.categories).reduce((sum: number, amount: any) => sum + amount, 0);

      return {
        monthly: {
          income,
          expenses,
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses
        },
        startDate: startOfMonth.toISOString(),
        endDate: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getTrends(machineId: string, query: ReportQuery) {
    const period = query.period || 'month';
    try {
      const { startDate, endDate } = this.calculateDateRange(period);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          exchange_rate,
          status,
          category,
          created_at,
          from_fund:from_fund_id (
            id,
            name,
            store:stores (type)
          ),
          to_fund:to_fund_id (
            id,
            name,
            store:stores (type)
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw new ReportError('Lỗi khi lấy thông tin giao dịch', 400);

      // Phân tích xu hướng theo thời gian
      const trends = this.analyzeTrends(transactions || [], period);

      return {
        trends,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getCategoryAnalysis(machineId: string, query: ReportQuery) {
    const period = query.period || 'month';
    const { startDate, endDate } = this.calculateDateRange(period);
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          exchange_rate,
          status,
          category,
          tags,
          created_at,
          from_fund:from_fund_id (
            id,
            name,
            store:stores (type)
          ),
          to_fund:to_fund_id (
            id,
            name,
            store:stores (type)
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw new ReportError('Lỗi khi lấy thông tin giao dịch', 400);

      // Phân tích chi tiết theo danh mục và tags
      const analysis = this.analyzeCategoriesAndTags(transactions || []);

      return {
        analysis,
        period: { startDate, endDate }
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getPredictions(machineId: string) {
    try {
      // Lấy dữ liệu 3 tháng gần nhất để dự đoán
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          exchange_rate,
          status,
          category,
          created_at,
          from_fund:from_fund_id (
            id,
            name,
            store:stores (type)
          ),
          to_fund:to_fund_id (
            id,
            name,
            store:stores (type)
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      if (error) throw new ReportError('Lỗi khi lấy thông tin giao dịch', 400);

      // Phân tích và dự đoán
      const predictions = this.generatePredictions(transactions || []);

      return {
        predictions,
        basedOn: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      };
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async exportReport(machineId: string, query: ExportReportQuery) {
    const { type, format } = query;
    try {
      let reportData;

      // Lấy dữ liệu báo cáo theo loại
      switch (type) {
        case 'overview':
          reportData = await this.getOverview(machineId);
          break;
        case 'cashflow':
          reportData = await this.getCashFlow(machineId, query);
          break;
        case 'balance':
          reportData = await this.getBalanceSheet(machineId, query);
          break;
        case 'income':
          reportData = await this.getIncomeStatement(machineId, query);
          break;
        default:
          throw new ReportError('Loại báo cáo không hợp lệ', 400);
      }

      // Xuất báo cáo theo định dạng
      return this.formatReport(reportData, format);
    } catch (error) {
      if (error instanceof ReportError) throw error;
      throw new ReportError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  private groupTransactionsByDate(transactions: any[]): Record<string, any> {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = {
          income: 0,
          expense: 0,
          transactions: []
        };
      }

      const amount = transaction.amount * (transaction.exchange_rate || 1);

      if (transaction.type === 'income' ||
        (transaction.to_fund?.store?.type === 'income')) {
        groups[date].income += amount;
      } else if (transaction.type === 'expense' ||
        (transaction.from_fund?.store?.type === 'expense')) {
        groups[date].expense += amount;
      }

      groups[date].transactions.push(transaction);
      return groups;
    }, {});
  }

  private groupTransactionsByCategory(transactions: any[]) {
    return transactions.reduce((groups, transaction) => {
      const amount = transaction.amount * (transaction.exchange_rate || 1);
      const category = transaction.category || 'other';

      let type: 'income' | 'expenses';
      if (transaction.type === 'income' ||
        (transaction.to_fund?.store?.type === 'income')) {
        type = 'income';
      } else {
        type = 'expenses';
      }

      if (!groups[type].categories[category]) {
        groups[type].categories[category] = 0;
      }

      groups[type].categories[category] += amount;
      return groups;
    }, {
      income: { categories: {} },
      expenses: { categories: {} }
    });
  }

  private calculateDateRange(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        throw new ReportError('Kỳ báo cáo không hợp lệ', 400);
    }

    return { startDate, endDate };
  }

  private analyzeTrends(transactions: any[], period: string) {
    const dailyTrends = this.groupTransactionsByDate(transactions);
    const trends = Object.entries(dailyTrends).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      netAmount: data.income - data.expense,
      transactionCount: data.transactions.length
    }));

    // Sắp xếp theo ngày
    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private analyzeCategoriesAndTags(transactions: any[]) {
    const categories: Record<string, any> = {};
    const tags: Record<string, any> = {};

    transactions.forEach(transaction => {
      const amount = transaction.amount * (transaction.exchange_rate || 1);

      // Phân tích theo danh mục
      const category = transaction.category || 'other';
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      categories[category].total += amount;
      categories[category].count += 1;
      categories[category].transactions.push(transaction);

      // Phân tích theo tags
      (transaction.tags || []).forEach((tag: string) => {
        if (!tags[tag]) {
          tags[tag] = {
            total: 0,
            count: 0,
            transactions: []
          };
        }
        tags[tag].total += amount;
        tags[tag].count += 1;
        tags[tag].transactions.push(transaction);
      });
    });

    return { categories, tags };
  }

  private generatePredictions(transactions: any[]) {
    // Phân tích theo tháng
    const monthlyStats = transactions.reduce((stats: any, transaction) => {
      const month = new Date(transaction.created_at).toISOString().slice(0, 7);
      if (!stats[month]) {
        stats[month] = { income: 0, expense: 0, transactions: [] };
      }

      const amount = transaction.amount * (transaction.exchange_rate || 1);
      if (transaction.type === 'income' ||
        (transaction.to_fund?.store?.type === 'income')) {
        stats[month].income += amount;
      } else if (transaction.type === 'expense' ||
        (transaction.from_fund?.store?.type === 'expense')) {
        stats[month].expense += amount;
      }

      stats[month].transactions.push(transaction);
      return stats;
    }, {});

    // Tính trung bình và xu hướng
    const months = Object.keys(monthlyStats).sort();
    const avgIncome = months.reduce((sum, month) => sum + monthlyStats[month].income, 0) / months.length;
    const avgExpense = months.reduce((sum, month) => sum + monthlyStats[month].expense, 0) / months.length;

    // Dự đoán tháng tiếp theo
    return {
      nextMonth: {
        expectedIncome: avgIncome,
        expectedExpense: avgExpense,
        expectedNet: avgIncome - avgExpense
      },
      trends: {
        income: this.calculateTrend(months.map(m => monthlyStats[m].income)),
        expense: this.calculateTrend(months.map(m => monthlyStats[m].expense))
      },
      confidence: this.calculateConfidence(months.length)
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% threshold

    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }

  private calculateConfidence(monthCount: number): number {
    // Độ tin cậy tăng theo số lượng tháng có dữ liệu
    // Tối thiểu 50% với 1 tháng, tối đa 90% với 3 tháng
    return Math.min(0.9, 0.5 + (monthCount - 1) * 0.2);
  }

  private formatReport(data: any, format: string) {
    switch (format) {
      case 'json':
        return data;
      case 'csv':
        throw new ReportError('Định dạng CSV chưa được hỗ trợ', 400);
      case 'pdf':
        throw new ReportError('Định dạng PDF chưa được hỗ trợ', 400);
      default:
        throw new ReportError('Định dạng không hợp lệ', 400);
    }
  }
}

export const reportService = new ReportService();