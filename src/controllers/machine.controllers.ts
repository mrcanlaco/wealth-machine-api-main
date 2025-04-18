import { Context } from 'hono';
import { machineService } from '../services/machine.service';
import {
  CreateMachineInput,
  SaveStoresFundsInput,
  UpdateMachineInput,
} from '../types/machine';
import { ResponseHandler } from '../utils/response.handler';
import { NotFoundError } from '../utils/app.error';

export async function listMachines(c: Context) {
  try {
    const userId = c.get('userId');
    const machines = await machineService.list(userId);
    return ResponseHandler.success(c, machines, 'Lấy danh sách cỗ máy thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getMachine(c: Context) {
  try {
    const machineId = c.get('machineId');
    const machine = await machineService.getById(machineId);
    if (!machine) {
      throw new NotFoundError('Không tìm thấy cỗ máy');
    }
    return ResponseHandler.success(c, machine, 'Lấy thông tin cỗ máy thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function getMachineMinimal(c: Context) {
  try {
    const machineId = c.get('machineId');
    const machine = await machineService.getByIdMinimal(machineId);
    if (!machine) {
      throw new NotFoundError('Không tìm thấy cỗ máy');
    }
    return ResponseHandler.success(c, machine, 'Lấy thông tin cỗ máy thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function createMachine(c: Context) {
  try {
    const userId = c.get('userId');
    const input = await c.req.json() as CreateMachineInput;
    const machine = await machineService.create(input, userId);
    return ResponseHandler.success(c, machine, 'Tạo cỗ máy thành công', 201);
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function updateMachine(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const input = await c.req.json() as UpdateMachineInput;
    const machine = await machineService.update(machineId, input, userId);
    return ResponseHandler.success(c, machine, 'Cập nhật cỗ máy thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function deleteMachine(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    await machineService.delete(machineId, userId);
    return ResponseHandler.success(c, null, 'Xóa cỗ máy thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
}

export const saveStoresFunds = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');

    const input = await c.req.json() as SaveStoresFundsInput;
    const result = await machineService.saveStoresFunds(machineId, userId, input.stores);
    return ResponseHandler.success(c, result, 'Cập nhật kho và quỹ thành công');
  } catch (error : any) {
    return ResponseHandler.error(c, error.message);
  }
};
