import { Context } from 'hono';
import { transactionService } from '../services/transaction.service';
import { 
  CreateTransactionInput, 
  UpdateTransactionInput, 
  AllocationInput,
  TransactionQueryParams,
  parseTransactionQueryParams
} from '../types/transaction';
import { ResponseHandler } from '../utils/response.handler';
import { NotFoundError } from '../utils/app.error';

export async function getTransactions(c: Context): Promise<Response> {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as TransactionQueryParams;
    
    // Convert to filters
    const filters = parseTransactionQueryParams(query);
    
    const result = await transactionService.list(machineId, filters);
    return ResponseHandler.success(c, result, 'Lấy danh sách giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getTransactionReport(c: Context): Promise<Response> {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as TransactionQueryParams;
    
    // Convert to filters
    const filters = parseTransactionQueryParams(query);
    
    const report = await transactionService.report(machineId, filters);
    return ResponseHandler.success(c, report, 'Lấy báo cáo giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function createTransaction(c: Context): Promise<Response> {
  try {
    const machineId = c.get('machineId');
    const userId = c.get('userId');
    const body = await c.req.json() as CreateTransactionInput;
    const transaction = await transactionService.create(body, machineId, userId);
    return ResponseHandler.success(c, transaction, 'Tạo giao dịch thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getTransactionById(c: Context): Promise<Response> {
  try {
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const transaction = await transactionService.getById(id, machineId);
    if (!transaction) {
      throw new NotFoundError('Không tìm thấy giao dịch');
    }
    return ResponseHandler.success(c, transaction, 'Lấy thông tin giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function updateTransaction(c: Context): Promise<Response> {
  try {
    const machineId = c.get('machineId');
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json() as UpdateTransactionInput;
    const transaction = await transactionService.update(id, body, machineId, userId);
    if (!transaction) {
      throw new NotFoundError('Không tìm thấy giao dịch');
    }
    return ResponseHandler.success(c, transaction, 'Cập nhật giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function deleteTransaction(c: Context) {
  try {
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    await transactionService.delete(id, machineId);
    return ResponseHandler.success(c, null, 'Xóa giao dịch thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function allocateBalance(c: Context) {
  try {
    const machineId = c.get('machineId');
    const userId = c.get('userId');
    const body = await c.req.json() as AllocationInput;
    const transactions = await transactionService.allocate(body, machineId, userId);
    return ResponseHandler.success(c, transactions, 'Phân bổ số dư thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
