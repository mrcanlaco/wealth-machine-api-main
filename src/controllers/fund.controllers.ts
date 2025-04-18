import { Context } from 'hono';
import { fundService } from '@/services/fund.service';
import { CreateFundInput, UpdateFundInput, UpdateBalanceInput } from '@/types/fund';
import { ResponseHandler } from '@/utils/response.handler';
import { NotFoundError } from '@/utils/app.error';

export async function createFund(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as CreateFundInput;
    const fund = await fundService.create(machineId, body, userId);
    return ResponseHandler.success(c, fund, 'Tạo quỹ thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getFunds(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const funds = await fundService.list(machineId, userId);
    return ResponseHandler.success(c, funds, 'Lấy danh sách quỹ thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getFundById(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const fund = await fundService.getById(id, machineId, userId);
    if (!fund) {
      throw new NotFoundError('Không tìm thấy quỹ');
    }
    return ResponseHandler.success(c, fund, 'Lấy thông tin quỹ thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function updateFund(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const body = await c.req.json() as UpdateFundInput;
    const fund = await fundService.update(id, machineId, body, userId);
    if (!fund) {
      throw new NotFoundError('Không tìm thấy quỹ');
    }
    return ResponseHandler.success(c, fund, 'Cập nhật quỹ thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function deleteFund(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    await fundService.delete(id, machineId, userId);
    return ResponseHandler.success(c, null, 'Xóa quỹ thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function updateBalance(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const body = await c.req.json() as UpdateBalanceInput;
    const fund = await fundService.updateBalance(id, body.amount, machineId, userId);
    if (!fund) {
      throw new NotFoundError('Không tìm thấy quỹ');
    }
    return ResponseHandler.success(c, fund, 'Cập nhật số dư quỹ thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getFundTransactions(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const transactions = await fundService.getTransactions(id, machineId, userId);
    return ResponseHandler.success(c, transactions, 'Lấy lịch sử giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
