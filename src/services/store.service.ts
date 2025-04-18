import { supabaseAdmin } from '@/providers/supabase';
import { machineService } from './machine.service';
import { Store, StoreError, StoreWithFunds, CreateStoreInput, UpdateStoreInput } from '@/types/store';

export class StoreService {
  private readonly table = 'stores';

  async list(machineId: string, userId: string): Promise<StoreWithFunds[]> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner', 'member']);

    const { data: stores, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        funds:funds(*)
      `)
      .eq('machine_id', machineId)
      .order('created_at', { ascending: false });

    if (error) throw new StoreError(error.message);

    return (stores || []).map((store: any) => {
      const funds = store.funds || [];
      return {
        ...store,
        funds,
        totalBalance: funds.reduce((sum: number, fund: any) => sum + fund.balance, 0),
      };
    });
  }

  async getById(id: string, machineId: string, userId: string): Promise<StoreWithFunds> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner', 'member']);

    const { data: store, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        funds:funds(*)
      `)
      .eq('id', id)
      .eq('machine_id', machineId)
      .single();

    if (error || !store) {
      throw new StoreError('Không tìm thấy kho', 404);
    }

    const funds = store.funds || [];
    return {
      ...store,
      funds,
      totalBalance: funds.reduce((sum: number, fund: any) => sum + fund.balance, 0),
    };
  }

  async create(machineId: string, input: CreateStoreInput, userId: string): Promise<Store> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const { data: store, error } = await supabaseAdmin
      .from(this.table)
      .insert({
        ...input,
        machine_id: machineId,
      })
      .select()
      .single();

    if (error) throw new StoreError(error.message);
    return store;
  }

  async update(id: string, machineId: string, input: UpdateStoreInput, userId: string): Promise<Store> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const { data: store, error } = await supabaseAdmin
      .from(this.table)
      .update(input)
      .eq('id', id)
      .eq('machine_id', machineId)
      .select()
      .single();

    if (error) throw new StoreError(error.message);
    return store;
  }

  async delete(id: string, machineId: string, userId: string): Promise<void> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('machine_id', machineId);

    if (error) throw new StoreError(error.message);
  }

  async createFund(storeId: string, machineId: string, input: any, userId: string): Promise<any> {
    // Check if user has permission
    await machineService.checkPermission(machineId, userId, ['owner']);

    const { data: fund, error } = await supabaseAdmin
      .from('funds')
      .insert({
        ...input,
        store_id: storeId,
        machine_id: machineId,
      })
      .select()
      .single();

    if (error) throw new StoreError(error.message);
    return fund;
  }

  async validateType(type: string): Promise<boolean> {
    const validTypes = ['income', 'expense', 'reserve', 'expansion', 'business'];
    return validTypes.includes(type);
  }
}

export const storeService = new StoreService();