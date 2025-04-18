import { supabaseAdmin } from '../providers/supabase';
import {
  Machine,
  MachineError,
  MachineRole,
  MachineWithUsers,
  MachineWithDetails,
  MachineMinimal,
  CreateMachineInput,
  UpdateMachineInput,
  SaveStoresFundsInput,
  SaveStoresFundsResponse,
} from '../types/machine';

class MachineService {
  private readonly table = 'machines';

  async list(userId: string): Promise<MachineWithUsers[]> {
    const { data: machines, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        machine_users!inner(*)
      `)
      .eq('machine_users.user_id', userId);

    if (error) throw new MachineError(error.message);
    return machines || [];
  }

  async getById(id: string): Promise<MachineWithDetails> {
    const { data: machine, error: machineError } = await supabaseAdmin
      .from(this.table)
      .select('*, machine_users(*), stores(*), funds(*), wallets(*)')
      .eq('id', id)
      .single();

    if (machineError) throw new MachineError(machineError.message);
    return machine;
  }

  async getByIdMinimal(id: string): Promise<MachineMinimal> {
    const { data: machine, error: machineError } = await supabaseAdmin
      .from(this.table)
      .select('id, un_allocated, stores(id), funds(id, balance), wallets(id, balance)')
      .eq('id', id)
      .single();

    if (machineError) throw new MachineError(machineError.message);
    return machine;
  }

  async create(input: CreateMachineInput, userId: string): Promise<Machine> {
    const { data: machine, error: machineError } = await supabaseAdmin
      .rpc('create_machine', {
        p_user_id: userId,
        p_name: input.name,
        p_icon: input.icon || null,
        p_currency: input.currency || 'VND',
        p_config: input.config || {},
        p_meta: input.meta || {},
        p_stores: input.stores,
        p_wallets: input.wallets
      });

    if (machineError) throw new MachineError(machineError.message);
    return machine;
  }

  async update(
    id: string,
    input: UpdateMachineInput,
    userId: string
  ): Promise<Machine> {
    // Check machine access with owner permission
    await this.checkPermission(id, userId, ['owner']);

    const { data: machine, error } = await supabaseAdmin
      .from(this.table)
      .update({
        name: input.name,
        icon: input.icon,
        config: input.config,
        meta: input.meta
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new MachineError(error.message);
    return machine;
  }

  async delete(id: string, userId: string): Promise<void> {
    // Check machine access with owner permission
    await this.checkPermission(id, userId, ['owner']);

    const { error } = await supabaseAdmin
      .rpc('delete_machine', {
        p_machine_id: id,
        p_user_id: userId
      });

    if (error) throw new MachineError(error.message);
  }

  async checkPermission(machineId: string, userId: string, roles: MachineRole[]): Promise<void> {
    const { data: machineUser, error } = await supabaseAdmin
      .from('machine_users')
      .select('role')
      .eq('machine_id', machineId)
      .eq('user_id', userId)
      .single();

    if (error || !machineUser) {
      throw new MachineError('Machine not found or access denied');
    }

    if (!roles.includes(machineUser.role)) {
      throw new MachineError('Insufficient permissions');
    }
  }

  async saveStoresFunds(machineId: string, userId: string, stores: SaveStoresFundsInput['stores']): Promise<SaveStoresFundsResponse> {
    // Check machine access with owner permission
    await this.checkPermission(machineId, userId, ['owner']);

    const { data, error } = await supabaseAdmin
      .rpc('save_stores_funds', {
        p_user_id: userId,
        p_machine_id: machineId,
        p_stores: stores
      });

    if (error) throw new MachineError(error.message);
    return data;
  }
}

export const machineService = new MachineService();