import { Context } from 'hono';
import { walletService } from '../services/wallet.service';
import { CreateWalletInput, UpdateWalletInput, UpdateWalletBalanceInput } from '../types/wallet';
import { ResponseHandler } from '../utils/response.handler';
import { NotFoundError } from '../utils/app.error';

/**
 * Tạo ví mới
 * @param c Context
 * @returns Response
 */
export async function createWallet(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as CreateWalletInput;
    const wallet = await walletService.create(machineId, body, userId);
    return ResponseHandler.success(c, wallet, 'Tạo ví thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy danh sách ví theo máy
 * @param c Context
 * @returns Response
 */
export async function getWallets(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const wallets = await walletService.list(machineId, userId);
    return ResponseHandler.success(c, wallets, 'Lấy danh sách ví thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy thông tin chi tiết ví
 * @param c Context
 * @returns Response
 */
export async function getWalletById(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { walletId } = c.req.param();
    const wallet = await walletService.getById(walletId, machineId, userId);
    if (!wallet) {
      throw new NotFoundError('Không tìm thấy ví');
    }
    return ResponseHandler.success(c, wallet, 'Lấy thông tin ví thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Cập nhật thông tin ví
 * @param c Context
 * @returns Response
 */
export async function updateWallet(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { walletId } = c.req.param();
    const body = await c.req.json() as UpdateWalletInput;
    const wallet = await walletService.update(walletId, machineId, body, userId);
    if (!wallet) {
      throw new NotFoundError('Không tìm thấy ví');
    }
    return ResponseHandler.success(c, wallet, 'Cập nhật ví thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Xóa ví
 * @param c Context
 * @returns Response
 */
export async function deleteWallet(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { walletId } = c.req.param();
    await walletService.delete(walletId, machineId, userId);
    return ResponseHandler.success(c, null, 'Xóa ví thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Cập nhật số dư ví
 * @param c Context
 * @returns Response
 */
export async function updateBalance(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { walletId } = c.req.param();
    const body = await c.req.json() as UpdateWalletBalanceInput;
    const wallet = await walletService.updateBalance(walletId, machineId, body, userId);
    if (!wallet) {
      throw new NotFoundError('Không tìm thấy ví');
    }
    return ResponseHandler.success(c, wallet, 'Cập nhật số dư ví thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy lịch sử giao dịch của ví
 * @param c Context
 * @returns Response
 */
export async function getTransactions(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { walletId } = c.req.param();
    const transactions = await walletService.getTransactions(walletId, machineId, userId);
    return ResponseHandler.success(c, transactions, 'Lấy lịch sử giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
