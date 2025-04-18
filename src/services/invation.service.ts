import { supabaseAdmin } from '@/providers/supabase';
import { machineService } from '@/services/machine.service';
import { emailService } from '@/services/email.service';
import { CreateInvitationInput, Invitation, InvitationError } from '@/types/invitation';
import { NotFoundError } from '@/utils/app.error';

export class InvitationService {
  private readonly table = 'invitations';

  async list(machineId: string, userId: string): Promise<Invitation[]> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner', 'member']);

      const { data: invitations, error } = await supabaseAdmin
        .from(this.table)
        .select('*, machine:machines(*), inviter:profiles(*)')
        .eq('machine_id', machineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return invitations;
    } catch (error) {
      throw new InvitationError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async create(machineId: string, input: CreateInvitationInput, userId: string): Promise<Invitation> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner']);

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', input.email)
        .single();

      if (!existingUser) {
        throw new NotFoundError('Không tìm thấy người dùng với email này');
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabaseAdmin
        .from(this.table)
        .select('*')
        .eq('machine_id', machineId)
        .eq('invitee_id', existingUser.id)
        .single();

      if (existingInvitation) {
        throw new InvitationError('Đã gửi lời mời cho người dùng này');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabaseAdmin
        .from('machine_users')
        .select('*')
        .eq('machine_id', machineId)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        throw new InvitationError('Người dùng đã là thành viên của cỗ máy');
      }

      const { data: invitation, error } = await supabaseAdmin
        .from(this.table)
        .insert({
          machine_id: machineId,
          inviter_id: userId,
          invitee_id: existingUser.id,
          role: input.role,
          status: 'pending',
        })
        .select('*, machine:machines(*), inviter:profiles(*)')
        .single();

      if (error) throw error;

      // Get machine name for email
      const { data: machine } = await supabaseAdmin
        .from('machines')
        .select('name')
        .eq('id', machineId)
        .single();

      // Send invitation email
      await emailService.sendInvitation(
        input.email,
        invitation.inviter?.full_name || '',
        machine?.name || '',
        `http://localhost:3000/invitations/${invitation.id}`,
      );

      return invitation;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      if (error instanceof InvitationError) throw error;
      throw new InvitationError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async accept(id: string, userId: string): Promise<void> {
    try {
      // Get invitation
      const { data: invitation } = await supabaseAdmin
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .single();

      if (!invitation) {
        throw new NotFoundError('Không tìm thấy lời mời');
      }

      // Add user to machine
      const { error: memberError } = await supabaseAdmin
        .from('machine_users')
        .insert({
          machine_id: invitation.machine_id,
          user_id: userId,
          role: invitation.role,
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: invitationError } = await supabaseAdmin
        .from(this.table)
        .update({ status: 'accepted' })
        .eq('id', id);

      if (invitationError) throw invitationError;

      // Get inviter and machine details for email
      const { data: details } = await supabaseAdmin
        .from('machines')
        .select(`
          name,
          inviter:profiles!invitations(full_name, email)
        `)
        .eq('id', invitation.machine_id)
        .single();

      // Send acceptance email to inviter
      if (details?.inviter) {
        await emailService.sendInvitationAccepted(
          details.inviter.email,
          details.inviter.full_name || '',
          details.name || ''
        );
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InvitationError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }

  async reject(id: string, userId: string): Promise<void> {
    try {
      // Get invitation
      const { data: invitation } = await supabaseAdmin
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .single();

      if (!invitation) {
        throw new NotFoundError('Không tìm thấy lời mời');
      }

      // Update invitation status
      const { error } = await supabaseAdmin
        .from(this.table)
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      // Get inviter and machine details for email
      const { data: details } = await supabaseAdmin
        .from('machines')
        .select(`
          name,
          inviter:profiles!invitations(full_name, email)
        `)
        .eq('id', invitation.machine_id)
        .single();

      // Send rejection email to inviter
      if (details?.inviter) {
        await emailService.sendInvitationRejectedEmail(
          details.inviter.email,
          details.name || ''
        );
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InvitationError('Lỗi hệ thống, vui lòng thử lại sau');
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
      throw new InvitationError('Lỗi hệ thống, vui lòng thử lại sau');
    }
  }
}

export const invitationService = new InvitationService();