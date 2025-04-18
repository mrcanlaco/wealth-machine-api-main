import { Context, Next } from 'hono';
import { machineService } from '../services/machine.service';
import { ForbiddenError } from '../utils/app.error';

export async function machineMiddleware(c: Context, next: Next) {
  try {
    const machineId = c.req.header('x-machine-id');
    if (!machineId) {
      throw new ForbiddenError('Không có quyền truy cập');
    }

    const userId = c.get('userId');

    // Check if user has access to this machine
    await machineService.checkPermission(machineId, userId, ['owner', 'member']);

    // Add machineId to context for use in controllers
    c.set('machineId', machineId);

    await next();
  } catch (error: any) {
    if(error instanceof ForbiddenError) { 
      throw error;
    }
    throw new ForbiddenError('Không có quyền truy cập');
  }
}
