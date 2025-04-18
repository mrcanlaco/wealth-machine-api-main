import { Context } from 'hono';
import { invitationService } from '@/services/invation.service';
import { ResponseHandler } from '@/utils/response.handler';
import { CreateInvitationInput } from '@/types/invitation';

export async function createInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const input = await c.req.json() as CreateInvitationInput;
    const invitation = await invitationService.create(machineId, input, userId);
    return ResponseHandler.success(c, invitation, 'Gửi lời mời thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function deleteInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const invitationId = c.get('invitationId');
    await invitationService.delete(invitationId, machineId, userId);
    return ResponseHandler.success(c, null, 'Xóa lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function acceptInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const invitationId = c.get('invitationId');
    await invitationService.accept(invitationId, userId);
    return ResponseHandler.success(c, null, 'Chấp nhận lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function rejectInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const invitationId = c.get('invitationId');
    await invitationService.reject(invitationId, userId);
    return ResponseHandler.success(c, null, 'Từ chối lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

export async function listInvitations(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const invitations = await invitationService.list(machineId, userId);
    return ResponseHandler.success(c, invitations, 'Lấy danh sách lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
