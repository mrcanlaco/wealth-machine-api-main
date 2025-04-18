import { z } from 'zod';

export const MemberRole = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

export type MemberRole = typeof MemberRole[keyof typeof MemberRole];

export const InvitationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

export const memberSchema = z.object({
  id: z.string().uuid('ID không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  full_name: z.string().min(1, 'Tên không được để trống'),
  avatar_url: z.string().url('URL avatar không hợp lệ').optional(),
  created_at: z.string().datetime('Thời gian tạo không hợp lệ'),
  updated_at: z.string().datetime('Thời gian cập nhật không hợp lệ'),
});

export const machineMemberSchema = z.object({
  machine_id: z.string().uuid('ID máy không hợp lệ'),
  member_id: z.string().uuid('ID thành viên không hợp lệ'),
  role: z.enum([MemberRole.OWNER, MemberRole.MEMBER], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' })
  }),
  created_at: z.string().datetime('Thời gian tạo không hợp lệ'),
  updated_at: z.string().datetime('Thời gian cập nhật không hợp lệ'),
});

export const createInvitationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum([MemberRole.OWNER, MemberRole.MEMBER], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' })
  }),
  expiresIn: z.number().min(1, 'Thời gian hết hạn phải lớn hơn 0').optional(),
  message: z.string().optional()
});

export const invitationSchema = z.object({
  id: z.string().uuid('ID không hợp lệ'),
  machine_id: z.string().uuid('ID máy không hợp lệ'),
  invited_by: z.string().uuid('ID người mời không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum([MemberRole.OWNER, MemberRole.MEMBER], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' })
  }),
  status: z.enum([
    InvitationStatus.PENDING,
    InvitationStatus.ACCEPTED,
    InvitationStatus.REJECTED,
    InvitationStatus.EXPIRED,
  ], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  }),
  expires_at: z.string().datetime('Thời gian hết hạn không hợp lệ'),
  created_at: z.string().datetime('Thời gian tạo không hợp lệ'),
  updated_at: z.string().datetime('Thời gian cập nhật không hợp lệ'),
});

export const memberQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  full_name: z.string().optional(),
  role: z.enum([MemberRole.OWNER, MemberRole.MEMBER]).optional()
});

// Types
export type Member = z.infer<typeof memberSchema>;
export type MachineMember = z.infer<typeof machineMemberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type MemberQuery = z.infer<typeof memberQuerySchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type CreateInvitation = z.infer<typeof createInvitationSchema>;

// Error classes
export class MemberError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'MemberError';
  }
}

export class InvitationError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'InvitationError';
    this.statusCode = statusCode;
  }
}
