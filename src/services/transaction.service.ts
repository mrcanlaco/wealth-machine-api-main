import { supabaseAdmin } from '../providers/supabase';
import {
  TransactionError,
  TransactionWithRelations,
  CreateTransactionInput,
  UpdateTransactionInput,
  AllocationInput,
  TransactionFilters,
  TransactionReport
} from '../types/transaction';

class TransactionService {

  async list(
    machineId: string,
    filters: TransactionFilters = {}
  ): Promise<{ transactions: TransactionWithRelations[]; total: number }> {

    // Build base query
    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        from_wallet:from_wallet_id(*),
        to_wallet:to_wallet_id(*),
        from_fund:from_fund_id(*),
        to_fund:to_fund_id(*)
      `, { count: 'exact' })
      .eq('machine_id', machineId)
      .is('related_transaction_id', null); // Only get parent transactions

    // Get related transactions in a separate query
    let relatedQuery = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        from_wallet:from_wallet_id(*),
        to_wallet:to_wallet_id(*),
        from_fund:from_fund_id(*),
        to_fund:to_fund_id(*)
      `)
      .eq('machine_id', machineId)
      .not('related_transaction_id', 'is', null);

    // Apply date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startDate.toISOString());
      relatedQuery = relatedQuery.gte('created_at', startDate.toISOString());
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
      relatedQuery = relatedQuery.lte('created_at', endDate.toISOString());
    }

    // Apply fund filter
    if (filters.funds?.length) {
      query = query.or(`from_fund_id.in.(${filters.funds.join(',')}),to_fund_id.in.(${filters.funds.join(',')})`)
      relatedQuery = relatedQuery.or(`from_fund_id.in.(${filters.funds.join(',')}),to_fund_id.in.(${filters.funds.join(',')})`)
    }

    // Apply wallet filter
    if (filters.wallets?.length) {
      query = query.or(
        filters.wallets.map(id => `or(from_wallet_id.eq.${id},to_wallet_id.eq.${id})`).join(',')
      );
      relatedQuery = relatedQuery.or(
        filters.wallets.map(id => `or(from_wallet_id.eq.${id},to_wallet_id.eq.${id})`).join(',')
      );
    }

    // Apply tags filter
    if (filters.tags?.length) {
      // PostgreSQL array contains operator
      query = query.contains('tags', filters.tags);
      relatedQuery = relatedQuery.contains('tags', filters.tags);
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false });
    relatedQuery = relatedQuery.order('created_at', { ascending: false });

    // Apply pagination
    if (filters.limit !== undefined) {
      query = query.limit(filters.limit);
    }
    if (filters.offset !== undefined) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data: transactions, error, count } = await query;
    const { data: relatedTransactions, error: relatedError } = await relatedQuery;

    if (error || relatedError) {
      console.error('List error:', error || relatedError);
      throw new TransactionError('Failed to fetch transactions', 500);
    }

    // Group related transactions by their parent transaction ID
    const transactionsWithRelated = transactions?.map(transaction => {
      const related = relatedTransactions?.filter(
        rt => rt.related_transaction_id === transaction.id
      ) || [];
      return {
        ...transaction,
        related_transactions: related
      };
    }) || [];

    return {
      transactions: transactionsWithRelated as TransactionWithRelations[],
      total: count || 0
    };
  }

  async report(
    machineId: string,
    filters: TransactionFilters = {}
  ): Promise<TransactionReport> {
    try {
      // Query for parent transactions
      let query = supabaseAdmin
        .from('transactions')
        .select(`
          *,
          from_wallet:from_wallet_id(*),
          to_wallet:to_wallet_id(*),
          from_fund:from_fund_id(*),
          to_fund:to_fund_id(*)
        `)
        .eq('machine_id', machineId)
        .is('related_transaction_id', null);

      // Query for related transactions
      let relatedQuery = supabaseAdmin
        .from('transactions')
        .select(`
          *,
          from_wallet:from_wallet_id(*),
          to_wallet:to_wallet_id(*),
          from_fund:from_fund_id(*),
          to_fund:to_fund_id(*)
        `)
        .eq('machine_id', machineId)
        .not('related_transaction_id', 'is', null);

      // Apply date filters with proper time handling
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startDate.toISOString());
        relatedQuery = relatedQuery.gte('created_at', startDate.toISOString());
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
        relatedQuery = relatedQuery.lte('created_at', endDate.toISOString());
      }

      // Apply fund filter
      if (filters.funds?.length) {
        query = query.or(`from_fund_id.in.(${filters.funds.join(',')}),to_fund_id.in.(${filters.funds.join(',')})`)
        relatedQuery = relatedQuery.or(`from_fund_id.in.(${filters.funds.join(',')}),to_fund_id.in.(${filters.funds.join(',')})`)
      }

      // Apply wallet filter
      if (filters.wallets?.length) {
        query = query.or(
          filters.wallets.map(id => `or(from_wallet_id.eq.${id},to_wallet_id.eq.${id})`).join(',')
        );
        relatedQuery = relatedQuery.or(
          filters.wallets.map(id => `or(from_wallet_id.eq.${id},to_wallet_id.eq.${id})`).join(',')
        );
      }

      // Apply tags filter
      if (filters.tags?.length) {
        query = query.contains('tags', filters.tags);
        relatedQuery = relatedQuery.contains('tags', filters.tags);
      }

      // Order by date to process transactions chronologically
      query = query.order('created_at', { ascending: true });
      relatedQuery = relatedQuery.order('created_at', { ascending: true });

      const { data: transactions, error } = await query;
      const { data: relatedTransactions, error: relatedError } = await relatedQuery;

      if (error || relatedError) {
        throw new TransactionError('Failed to fetch transactions for report', 500);
      }

      if (!transactions || transactions.length === 0) {
        return {
          startBalance: 0,
          endBalance: 0,
          difference: 0,
          percentageChange: 0
        };
      }

      // Group related transactions with their parents
      const transactionsWithRelated = transactions.map(transaction => {
        const related = relatedTransactions?.filter(
          rt => rt.related_transaction_id === transaction.id
        ) || [];
        return {
          ...transaction,
          related_transactions: related
        };
      });

      // Calculate balances
      let startBalance = 0;
      let endBalance = 0;

      // Process transactions to calculate balances
      transactionsWithRelated.forEach(transaction => {
        const amount = transaction.amount * transaction.exchange_rate;
        // Also process related transactions
        const relatedAmount = transaction.related_transactions?.reduce((sum: number, rt: any) => {
          return sum + (rt.amount * rt.exchange_rate);
        }, 0) || 0;

        const totalAmount = amount + relatedAmount;

        switch (transaction.type) {
          case 'income':
          case 'collect':
          case 'repay':
            endBalance += totalAmount;
            break;
          case 'expense':
          case 'lend':
          case 'borrow':
            endBalance -= totalAmount;
            break;
          case 'transfer_refundable':
          case 'transfer_non_refundable':
          case 'money_transfer':
            // These are internal transfers, they don't affect the total balance
            break;
          case 'allocation':
            // Allocation is just moving money between funds, doesn't affect total
            break;
        }
      });

      const difference = endBalance - startBalance;
      const percentageChange = startBalance !== 0 ? (difference / Math.abs(startBalance)) * 100 : 0;

      return {
        startBalance,
        endBalance,
        difference,
        percentageChange
      };
    } catch (error) {
      if (error instanceof TransactionError) {
        throw error;
      }
      throw new TransactionError(
        'Failed to generate transaction report: ' + (error as Error).message,
        500
      );
    }
  }

  async getById(
    id: string,
    machineId: string
  ): Promise<TransactionWithRelations> {
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        from_wallet:wallets!from_wallet_id(id, name),
        to_wallet:wallets!to_wallet_id(id, name),
        from_fund:funds!from_fund_id(id, name),
        to_fund:funds!to_fund_id(id, name),
        sub_transactions:transactions!related_transaction_id(*)
      `)
      .eq('machine_id', machineId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('GetById query error:', error);
      throw new TransactionError('Không tìm thấy giao dịch', 404);
    }
    if (!transaction) {
      console.error('GetById no transaction found');
      throw new TransactionError('Không tìm thấy giao dịch', 404);
    }

    return transaction;
  }

  async create(
    input: CreateTransactionInput,
    machineId: string,
    userId: string
  ): Promise<TransactionWithRelations> {
    await this.validateTransactionFields(input);
    const { data: transaction, error } = await supabaseAdmin
      .rpc('process_transaction', {
        p_machine_id: machineId,
        p_user_id: userId,
        p_from_wallet_id: input.from_wallet_id || null,
        p_to_wallet_id: input.to_wallet_id || null,
        p_from_fund_id: input.from_fund_id || null,
        p_to_fund_id: input.to_fund_id || null,
        p_type: input.type,
        p_amount: input.amount,
        p_currency: input.currency || 'VND',
        p_exchange_rate: input.exchange_rate || 1,
        p_note: input.note || null,
        p_category: input.category || null,
        p_tags: input.tags || [],
        p_related_transaction_id: input.related_transaction_id || null,
        p_meta: input.meta || {}
      });

    if (error) {
      console.error('RPC error:', error);
      throw new TransactionError(error.message);
    }
    if (!transaction) {
      console.error('No transaction returned from RPC');
      throw new TransactionError('Không thể tạo giao dịch');
    }

    // Map RPC result to TransactionWithRelations
    const result: TransactionWithRelations = {
      ...transaction,
      from_wallet: transaction.from_wallet_id ? {
        id: transaction.from_wallet_id,
        name: transaction.from_wallet_name
      } : null,
      to_wallet: transaction.to_wallet_id ? {
        id: transaction.to_wallet_id,
        name: transaction.to_wallet_name
      } : null,
      from_fund: transaction.from_fund_id ? {
        id: transaction.from_fund_id,
        name: transaction.from_fund_name
      } : null,
      to_fund: transaction.to_fund_id ? {
        id: transaction.to_fund_id,
        name: transaction.to_fund_name
      } : null,
      sub_transactions: transaction.sub_transactions || []
    };
    
    return result;
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
    machineId: string,
    userId: string
  ): Promise<TransactionWithRelations> {
    const transaction = await this.getById(id, machineId);

    // Chỉ cho phép cập nhật các giao dịch chưa hoàn thành
    if (transaction.status === 'completed') {
      throw new TransactionError('Không thể cập nhật giao dịch đã hoàn thành');
    }

    const { data: _, error } = await supabaseAdmin
      .rpc('update_transaction', {
        p_transaction_id: id,
        p_user_id: userId,
        p_status: input.status,
        p_note: input.note,
        p_category: input.category,
        p_tags: input.tags,
        p_meta: input.meta,
      });

    if (error) throw new TransactionError(error.message);
    return this.getById(id, machineId);
  }

  async delete(id: string, machineId: string): Promise<void> {
    const transaction = await this.getById(id, machineId);

    // Chỉ cho phép xóa các giao dịch chưa hoàn thành
    if (transaction.status === 'completed') {
      throw new TransactionError('Không thể xóa giao dịch đã hoàn thành');
    }

    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('machine_id', machineId);

    if (error) throw new TransactionError(error.message);
  }

  async allocate(
    input: AllocationInput,
    machineId: string,
    userId: string
  ): Promise<TransactionWithRelations[]> {
    const { data: allocations, error } = await supabaseAdmin
      .rpc('create_allocation_transaction', {
        p_machine_id: machineId,
        p_user_id: userId,
        p_allocations: input.allocations
      });

    if (error) throw new TransactionError(error.message);
    if (!allocations?.length) throw new TransactionError('Không có kết quả phân bổ');

    return allocations;
  }

  private async validateTransactionFields(
    input: CreateTransactionInput
  ): Promise<void> {
    const errors: string[] = [];

    switch (input.type) {
      case 'income':
      case 'borrow':
      case 'collect':
        if (!input.to_fund_id) errors.push(`Quỹ đích là bắt buộc cho ${input.type}`);
        if (!input.to_wallet_id) errors.push(`Ví đích là bắt buộc cho ${input.type}`);
        break;

      case 'expense':
      case 'lend':
      case 'repay':
        if (!input.from_fund_id) errors.push(`Quỹ nguồn là bắt buộc cho ${input.type}`);
        if (!input.from_wallet_id) errors.push(`Ví nguồn là bắt buộc cho ${input.type}`);
        break;

      case 'transfer_refundable':
      case 'transfer_non_refundable':
        if (!input.from_fund_id) errors.push('Quỹ nguồn là bắt buộc cho chuyển khoản');
        if (!input.to_fund_id) errors.push('Quỹ đích là bắt buộc cho chuyển khoản');
        break;

      case 'money_transfer':
        if (!input.from_wallet_id) errors.push('Ví nguồn là bắt buộc cho chuyển tiền');
        if (!input.to_wallet_id) errors.push('Ví đích là bắt buộc cho chuyển tiền');
        break;

      case 'allocation':
        if (!input.to_fund_id) errors.push('Quỹ đích là bắt buộc cho phân bổ');
        break;
    }

    if (errors.length > 0) {
      throw new TransactionError(errors.join(', '));
    }
  }
}

export const transactionService = new TransactionService();