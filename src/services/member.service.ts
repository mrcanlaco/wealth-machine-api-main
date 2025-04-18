import { supabaseAdmin } from '@/providers/supabase';
import { MemberRole, MemberError, MachineMember } from '@/types/member';
import { emailService } from './email.service';

class MemberService {
  async listMachineMembers(machineId: string, userId: string): Promise<{ members: MachineMember[]; total: number }> {
    // Check if current member has permission
    const hasPermission = await this.checkMemberPermission(
      userId,
      machineId,
      MemberRole.MEMBER
    );
    if (!hasPermission) {
      throw new MemberError('Only members can view machine members');
    }

    const { data: machineMembers, error: muError } = await supabaseAdmin
      .from('machine_users')
      .select('user_id, role')
      .eq('machine_id', machineId);

    if (muError) throw new MemberError('Failed to fetch machine members');
    if (!machineMembers.length) return { members: [], total: 0 };

    const memberIds = machineMembers.map((mu) => mu.user_id);

    const { data: members, error: uError } = await supabaseAdmin
      .from('members')
      .select('*')
      .in('id', memberIds);

    if (uError) throw new MemberError('Failed to fetch members');

    const membersWithRoles = members.map((member) => ({
      ...member,
      role: machineMembers.find((mu) => mu.user_id === member.id)?.role as MemberRole,
    }));

    return {
      members: membersWithRoles,
      total: membersWithRoles.length,
    };
  }

  async removeMachineMember(
    machineId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    // Check if current member has permission
    const hasPermission = await this.checkMemberPermission(
      userId,
      machineId,
      MemberRole.OWNER
    );
    if (!hasPermission) {
      throw new MemberError('Only owners can remove members');
    }

    // Check if target member exists in machine
    const { data: targetMember } = await supabaseAdmin
      .from('machine_users')
      .select('role')
      .eq('machine_id', machineId)
      .eq('user_id', memberId)
      .single();

    if (!targetMember) {
      throw new MemberError('Member not found in machine');
    }

    // Cannot remove the last owner
    if (targetMember.role === MemberRole.OWNER) {
      const { data: owners } = await supabaseAdmin
        .from('machine_users')
        .select('user_id')
        .eq('machine_id', machineId)
        .eq('role', MemberRole.OWNER);

      if (owners && owners.length <= 1) {
        throw new MemberError('Cannot remove the last owner');
      }
    }

    // Get member email for notification
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('email')
      .eq('id', memberId)
      .single();

    if (!member) {
      throw new MemberError('Member not found');
    }

    // Get machine name for notification
    const { data: machine } = await supabaseAdmin
      .from('machines')
      .select('name')
      .eq('id', machineId)
      .single();

    if (!machine) {
      throw new MemberError('Machine not found');
    }

    // Remove member from machine
    const { error } = await supabaseAdmin
      .from('machine_users')
      .delete()
      .eq('machine_id', machineId)
      .eq('user_id', memberId);

    if (error) {
      throw new MemberError('Failed to remove member from machine');
    }

    // Get current member details for notification
    const { data: currentMember } = await supabaseAdmin
      .from('members')
      .select('full_name')
      .eq('id', userId)
      .single();

    // Send notification email
    await emailService.sendUserRemoved(
      member.email,
      currentMember?.full_name || 'An owner',
      machine.name
    );
  }

  async addMemberToMachine(
    machineId: string,
    memberId: string,
    role: MemberRole,
    userId: string
  ): Promise<void> {
    // Check if current member has permission
    const hasPermission = await this.checkMemberPermission(
      userId,
      machineId,
      MemberRole.OWNER
    );
    if (!hasPermission) {
      throw new MemberError('Only owners can add members');
    }

    const { error } = await supabaseAdmin.from('machine_users').insert({
      machine_id: machineId,
      user_id: memberId,
      role,
    });

    if (error) {
      if (error.code === '23505') {
        throw new MemberError('Member is already a member of this machine');
      }
      throw new MemberError('Failed to add member to machine');
    }
  }

  async checkMemberPermission(
    userId: string,
    machineId: string,
    requiredRole?: MemberRole
  ): Promise<boolean> {
    const { data: machineMember } = await supabaseAdmin
      .from('machine_users')
      .select('role')
      .eq('machine_id', machineId)
      .eq('user_id', userId)
      .single();

    if (!machineMember) return false;

    if (requiredRole) {
      if (requiredRole === MemberRole.OWNER) {
        return machineMember.role === MemberRole.OWNER;
      }
      // Members can do member actions, owners can do everything
      return true;
    }

    return true;
  }
}

export const memberService = new MemberService();