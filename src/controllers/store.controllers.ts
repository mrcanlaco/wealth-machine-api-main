import { Context } from 'hono';
import { storeService } from '@/services/store.service';
import { fundService } from '@/services/fund.service';
import { CreateStoreInput, UpdateStoreInput } from '@/types/store';
import { CreateFundInput } from '@/types/fund';
import { ResponseHandler } from '@/utils/response.handler';
import { NotFoundError } from '@/utils/app.error';

/**
 * Tạo kho mới
 * @param c Context
 * @returns Response
 */
export async function createStore(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as CreateStoreInput;
    const store = await storeService.create(machineId, body, userId);
    return ResponseHandler.success(c, store, 'Tạo kho thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy thông tin kho
 * @param c Context
 * @returns Response
 */
export async function getStore(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const store = await storeService.getById(id, machineId, userId);
    if (!store) {
      throw new NotFoundError('Không tìm thấy kho');
    }
    return ResponseHandler.success(c, store, 'Lấy thông tin kho thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy danh sách kho theo máy
 * @param c Context
 * @returns Response
 */
export async function listStores(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const stores = await storeService.list(machineId, userId);
    return ResponseHandler.success(c, stores, 'Lấy danh sách kho thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Cập nhật kho
 * @param c Context
 * @returns Response
 */
export async function updateStore(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    const body = await c.req.json() as UpdateStoreInput;
    const store = await storeService.update(id, machineId, body, userId);
    if (!store) {
      throw new NotFoundError('Không tìm thấy kho');
    }
    return ResponseHandler.success(c, store, 'Cập nhật kho thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Xóa kho
 * @param c Context
 * @returns Response
 */
export async function deleteStore(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { id } = c.req.param();
    await storeService.delete(id, machineId, userId);
    return ResponseHandler.success(c, null, 'Xóa kho thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Tạo quỹ trong kho
 * @param c Context
 * @returns Response
 */
export async function createFund(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { storeId } = c.req.param();
    const body = await c.req.json() as CreateFundInput;
    const fund = await fundService.create(machineId, { ...body, store_id: storeId }, userId);
    return ResponseHandler.success(c, fund, 'Tạo quỹ thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
