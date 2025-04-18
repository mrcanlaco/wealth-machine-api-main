import { supabaseAdmin } from '@/providers/supabase';
import { machineService } from '@/services/machine.service';
import { Fund, FundError, CreateFundInput, UpdateFundInput } from '@/types/fund';

class FundService {
  private readonly fundTable = 'funds';
  async list(machineId: string, userId: string): Promise<Fund[]> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner', 'member']);

    const { data, error } = await supabaseAdmin
      .from(this.fundTable)
      .select('*')
      .eq('machine_id', machineId)
      .order('created_at', { ascending: false });

    if (error) throw new FundError('Failed to fetch funds');
    return data;
  }

  async getById(
    fundId: string,
    machineId: string,
    userId: string
  ): Promise<Fund> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner', 'member']);

    const { data: fund, error } = await supabaseAdmin
      .from(this.fundTable)
      .select('*, machines!inner(*)')
      .eq('id', fundId)
      .eq('machine_id', machineId)
      .single();

    if (error || !fund) {
      throw new FundError('Fund not found', 404);
    }

    return fund;
  }

  async create(machineId: string, input: CreateFundInput, userId: string): Promise<Fund> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    // Check total percentage doesn't exceed 100%
    const { data: funds, error: fundsError } = await supabaseAdmin
      .from(this.fundTable)
      .select('percent')
      .eq('machine_id', machineId);

    if (fundsError) throw new FundError('Failed to check funds');

    const totalPercent = funds.reduce((sum, fund) => sum + fund.percent, 0);
    if (totalPercent + input.percent > 100) {
      throw new FundError('Total fund percentage cannot exceed 100%');
    }

    const { data, error } = await supabaseAdmin
      .from(this.fundTable)
      .insert({
        ...input,
        machine_id: machineId,
        balance: 0,
      })
      .select()
      .single();

    if (error) throw new FundError(error.message);
    return data;
  }

  async update(
    fundId: string,
    machineId: string,
    input: UpdateFundInput,
    userId: string
  ): Promise<Fund> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const fund = await this.getById(fundId, machineId, userId);

    if (input.percent !== undefined) {
      const { data: funds, error: fundsError } = await supabaseAdmin
        .from(this.fundTable)
        .select('percent')
        .eq('machine_id', fund.machine_id)
        .neq('id', fundId);

      if (fundsError) throw new FundError('Failed to check funds');

      const totalPercent = funds.reduce((sum, f) => sum + f.percent, 0);
      if (totalPercent + input.percent > 100) {
        throw new FundError('Total fund percentage cannot exceed 100%');
      }
    }

    const { data, error } = await supabaseAdmin
      .from(this.fundTable)
      .update(input)
      .eq('id', fundId)
      .select()
      .single();

    if (error) throw new FundError(error.message);
    return data;
  }

  async delete(
    fundId: string,
    machineId: string,
    userId: string
  ): Promise<void> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const { error } = await supabaseAdmin
      .from(this.fundTable)
      .delete()
      .eq('id', fundId)
      .eq('machine_id', machineId);

    if (error) throw new FundError('Failed to delete fund');
  }

  async updateBalance(
    fundId: string,
    amount: number,
    machineId: string,
    userId: string
  ): Promise<Fund> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const fund = await this.getById(fundId, machineId, userId);

    const { data, error } = await supabaseAdmin
      .from(this.fundTable)
      .update({
        balance: fund.balance + amount,
      })
      .eq('id', fundId)
      .eq('machine_id', machineId)
      .select()
      .single();

    if (error) throw new FundError(error.message);
    return data;
  }

  async getTransactions(
    fundId: string,
    machineId: string,
    userId: string
  ): Promise<any[]> {
    await this.getById(fundId, machineId, userId);

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('fund_id', fundId)
      .order('created_at', { ascending: false });

    if (error) throw new FundError('Failed to fetch transactions');
    return data;
  }
}

export const fundService = new FundService();