import { supabaseAdmin } from '@/providers/supabase';
import { machineService } from '@/services/machine.service';
import { Wallet, CreateWalletInput, UpdateWalletInput, UpdateWalletBalanceInput, WalletError } from '@/types/wallet';
import { Transaction } from '@/types/transaction';
import { NotFoundError } from '@/utils/app.error';

class WalletService {
  private readonly table = 'wallets';

  async list(machineId: string, userId: string): Promise<Wallet[]> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner', 'member']);

      let queryBuilder = supabaseAdmin
        .from(this.table)
        .select('*')
        .eq('machine_id', machineId);

      const { data: wallets, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return wallets;
    } catch (error) {
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async getById(id: string, machineId: string, userId: string): Promise<Wallet> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner', 'member']);

      const { data: wallet, error } = await supabaseAdmin
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('machine_id', machineId)
        .single();

      if (error) throw error;
      if (!wallet) {
        throw new NotFoundError('Không tìm thấy ví');
      }

      return wallet;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async create(machineId: string, data: CreateWalletInput, userId: string): Promise<Wallet> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner']);

      const { name, icon, type, currency = 'VND', balance = 0, metadata } = data;

      const { data: wallet, error } = await supabaseAdmin
        .from(this.table)
        .insert({
          machine_id: machineId,
          name,
          icon,
          type,
          currency,
          balance,
          metadata
        })
        .select('*')
        .single();

      if (error) throw error;
      return wallet;
    } catch (error) {
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }
  
  async update(id: string, machineId: string, data: UpdateWalletInput, userId: string): Promise<Wallet> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner']);

      const { name, icon, type, metadata } = data;

      const { data: wallet, error } = await supabaseAdmin
        .from(this.table)
        .update({
          name,
          icon,
          type,
          metadata,
          updated_at: new Date(),
        })
        .eq('id', id)
        .eq('machine_id', machineId)
        .select('*')
        .single();

      if (error) throw error;
      return wallet;
    } catch (error) {
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async delete(id: string, machineId: string, userId: string): Promise<void> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner']);

      const { error } = await supabaseAdmin
        .from(this.table)
        .delete()
        .eq('id', id)
        .eq('machine_id', machineId);

      if (error) throw error;
    } catch (error) {
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async updateBalance(id: string, machineId: string, payload: UpdateWalletBalanceInput, userId: string): Promise<Wallet> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner']);

      const wallet = await this.getById(id, machineId, userId);

      // If currency is different, we need to handle conversion
      if (payload.currency !== wallet.currency) {
        throw new NotFoundError('Chưa hỗ trợ chuyển đổi tiền tệ');
      }

      const { data: updatedWallet, error } = await supabaseAdmin
        .from(this.table)
        .update({
          balance: payload.balance,
          updated_at: new Date(),
        })
        .eq('id', id)
        .eq('machine_id', machineId)
        .select('*')
        .single();

      if (error) throw error;
      return updatedWallet;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getTransactions(id: string, machineId: string, userId: string): Promise<Transaction[]> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner', 'member']);

      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .or(`from_wallet_id.eq.${id},to_wallet_id.eq.${id}`)
        .eq('machine_id', machineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return transactions;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new WalletError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }
}

export const walletService = new WalletService();