import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Token không được để trống'),
});

export const requestResetSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không được để trống'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  email: z.string().email('Email không hợp lệ'),
});

// Schema cho cập nhật profile (chỉ cho phép sửa tên)
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export class AuthError extends Error {
  statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}
