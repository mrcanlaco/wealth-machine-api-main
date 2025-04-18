import { Context } from 'hono';
import { authService } from '@/services/auth.service';
import { ResponseHandler } from '@/utils/response.handler';
import { LoginInput, RegisterInput, RefreshTokenInput } from '@/types/auth';

/**
 * Đăng ký tài khoản mới
 * @param c Context
 * @returns Response
 */
export async function register(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as RegisterInput;
    const response = await authService.register(body);
    return ResponseHandler.success(c, response, 'Đăng ký tài khoản thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Đăng nhập vào hệ thống
 * @param c Context
 * @returns Response
 */
export async function login(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as LoginInput;
    const response = await authService.login(body);
    return ResponseHandler.success(c, response, 'Đăng nhập thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Làm mới token
 * @param c Context
 * @returns Response
 */
export async function refreshToken(c: Context): Promise<Response> {
  try {
    const body = await c.req.json() as RefreshTokenInput;
    const response = await authService.refreshToken(body.refreshToken);
    return ResponseHandler.success(c, response, 'Làm mới token thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Đăng xuất khỏi hệ thống
 * @param c Context
 * @returns Response
 */
export async function logout(c: Context): Promise<Response> {
  try {
    await authService.logout('');
    return ResponseHandler.success(c, null, 'Đăng xuất thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Yêu cầu đặt lại mật khẩu
 * @param c Context
 * @returns Response
 */
export async function requestPasswordReset(c: Context): Promise<Response> {
  try {
    const { email } = await c.req.json() as { email: string };
    await authService.requestPasswordReset(email);
    return ResponseHandler.success(c, null, 'Đã gửi email đặt lại mật khẩu');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Đặt lại mật khẩu
 * @param c Context
 * @returns Response
 */
export async function resetPassword(c: Context): Promise<Response> {
  try {
    const { token, password } = await c.req.json() as { token: string; password: string };
    const user = c.get('user');
    if (!user || !user.email) {
      return ResponseHandler.error(c, 'Không tìm thấy thông tin người dùng', '', 400);
    }
    await authService.resetPassword(token, password, user.email);
    return ResponseHandler.success(c, null, 'Đặt lại mật khẩu thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy thông tin người dùng hiện tại
 * @param c Context
 * @returns Response
 */
export async function getProfile(c: Context): Promise<Response> {
  try {
    const accessToken = c.get('accessToken');
    const response = await authService.verifyToken(accessToken);
    return ResponseHandler.success(c, response, 'Lấy thông tin người dùng thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Cập nhật thông tin người dùng hiện tại (chỉ cho phép sửa tên)
 * @param c Context
 * @returns Response
 */
export async function updateProfile(c: Context): Promise<Response> {
  try {
    const accessToken = c.get('accessToken');
    const user = await authService.verifyToken(accessToken);
    const body = await c.req.json();
    const { full_name } = body;
    const updatedUser = await authService.updateProfile(user.id, { full_name });
    return ResponseHandler.success(c, updatedUser, 'Cập nhật thông tin thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

