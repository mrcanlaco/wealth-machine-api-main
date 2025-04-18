import { Context } from 'hono';
import { memberService } from '@/services/member.service';
import { invitationService } from '@/services/invation.service';
import { CreateInvitationInput } from '@/types/member';
import { ResponseHandler } from '@/utils/response.handler';

/**
 * Lấy danh sách thành viên trong máy
 * @param c Context
 * @returns Response
 */
export async function listMachineMembers(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const members = await memberService.listMachineMembers(machineId, userId);
    return ResponseHandler.success(c, members, 'Lấy danh sách thành viên thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Xóa thành viên khỏi máy
 * @param c Context
 * @returns Response
 */
export async function removeMachineMember(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const { memberId } = c.req.param();
    await memberService.removeMachineMember(machineId, memberId, userId);
    return ResponseHandler.success(c, null, 'Xóa thành viên thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy danh sách lời mời trong máy
 * @param c Context
 * @returns Response
 */
export async function listMachineInvitations(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const invitations = await invitationService.list(machineId, userId);
    return ResponseHandler.success(c, invitations, 'Lấy danh sách lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Tạo lời mời mới
 * @param c Context
 * @returns Response
 */
export async function createInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as CreateInvitationInput;
    const invitation = await invitationService.create(machineId, body, userId);
    return ResponseHandler.success(c, invitation, 'Tạo lời mời thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Chấp nhận lời mời
 * @param c Context
 * @returns Response
 */
export async function acceptInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const { invitationId } = c.req.param();
    const result = await invitationService.accept(invitationId, userId);
    return ResponseHandler.success(c, result, 'Chấp nhận lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Từ chối lời mời
 * @param c Context
 * @returns Response
 */
export async function rejectInvitation(c: Context) {
  try {
    const userId = c.get('userId');
    const { invitationId } = c.req.param();
    await invitationService.reject(invitationId, userId);
    return ResponseHandler.success(c, null, 'Từ chối lời mời thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
