import { supabase } from '@/providers/supabase';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/providers/redis';
import { AuthResponse, AuthTokens, LoginInput, RegisterInput, AuthError } from '@/types/auth';
import { jwtUtil } from '@/utils/jwt.util';
import { tokenBlacklist } from '@/utils/token-blacklist';
import { config } from '@/config';

class AuthService {
  /**
   * Cập nhật thông tin người dùng (chỉ cho phép sửa tên)
   * @param userId string
   * @param input { full_name: string }
   */
  async updateProfile(userId: string, input: { full_name: string }) {
    try {
      const { full_name } = input;
      // Cập nhật metadata của user trong Supabase
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { full_name }
      });
      if (error) throw new AuthError(error.message, 400);
      return {
        id: data.user?.id,
        email: data.user?.email,
        full_name: data.user?.user_metadata.full_name,
        role: data.user?.user_metadata.role,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  private getTokenTTL(token: string): number {
    try {
      const payload = jwtUtil.decode(token);
      if (!payload) return CACHE_TTL.USER_TOKEN;
      return jwtUtil.getRemainingTime(payload);
    } catch {
      return CACHE_TTL.USER_TOKEN;
    }
  }

  async register({ email, password, full_name }: RegisterInput): Promise<AuthResponse> {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role: 'user',
          },
          emailRedirectTo: `${config.appUrl}/verify-email`,
        },
      });

      if (signUpError) throw new AuthError(signUpError.message, 400);
      if (!authData.user) throw new AuthError('Đăng ký thất bại', 400);

      const response = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata.full_name,
          role: authData.user.user_metadata.role,
        },
        tokens: {
          accessToken: authData.session?.access_token || '',
          refreshToken: authData.session?.refresh_token || '',
        },
      };

      if (authData.session?.access_token) {
        const tokenTTL = this.getTokenTTL(authData.session.access_token);
        await Promise.all([
          redis.setex(
            CACHE_KEYS.USER_TOKEN(authData.user.id),
            tokenTTL,
            authData.session.access_token
          ),
          redis.setex(
            CACHE_KEYS.USER_DATA(authData.user.id),
            tokenTTL,
            JSON.stringify(response.user)
          ),
        ]);
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new AuthError(signInError.message, 401);
      if (!authData.user) throw new AuthError('Đăng nhập thất bại', 401);

      // Clear any existing blacklisted tokens
      await tokenBlacklist.removeAll(authData.user.id);

      const response = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata.full_name,
          role: authData.user.user_metadata.role,
        },
        tokens: {
          accessToken: authData.session?.access_token || '',
          refreshToken: authData.session?.refresh_token || '',
        },
      };

      if (authData.session?.access_token) {
        const tokenTTL = this.getTokenTTL(authData.session.access_token);
        await Promise.all([
          redis.setex(
            CACHE_KEYS.USER_TOKEN(authData.user.id),
            tokenTTL,
            authData.session.access_token
          ),
          redis.setex(
            CACHE_KEYS.USER_DATA(authData.user.id),
            tokenTTL,
            JSON.stringify(response.user)
          ),
        ]);
      }

      return response;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw new AuthError(error.message, 401);
      if (!data.session) throw new AuthError('Token không hợp lệ', 401);

      // Add old token to blacklist if it exists
      const oldToken = await redis.get(CACHE_KEYS.USER_TOKEN(data.session.user.id));
      if (oldToken) {
        const ttl = await redis.ttl(CACHE_KEYS.USER_TOKEN(data.session.user.id));
        if (ttl > 0) {
          await tokenBlacklist.add(oldToken, data.session.user.id, ttl);
        }
      }

      if (data.session?.access_token) {
        const tokenTTL = this.getTokenTTL(data.session.access_token);
        await redis.setex(
          CACHE_KEYS.USER_TOKEN(data.session.user.id),
          tokenTTL,
          data.session.access_token
        );
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Token không hợp lệ', 401);
    }
  }

  async verifyToken(token: string): Promise<AuthResponse['user']> {
    try {
      // Verify token locally first
      const payload = jwtUtil.verify(token);

      // Check if token is expired
      if (jwtUtil.isExpired(payload)) {
        throw new AuthError('Token đã hết hạn', 401);
      }

      // Check if token is blacklisted
      if (await tokenBlacklist.isBlacklisted(token, payload.sub)) {
        throw new AuthError('Token không hợp lệ', 401);
      }

      // Check if user data is in cache
      const cachedUser = await redis.get(CACHE_KEYS.USER_DATA(payload.sub));
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // If not in cache, get from Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) throw new AuthError(error.message, 401);
      if (!user) throw new AuthError('Token không hợp lệ', 401);

      const response = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata.full_name,
        role: user.user_metadata.role,
      };

      const tokenTTL = jwtUtil.getRemainingTime(payload);
      await redis.setex(
        CACHE_KEYS.USER_DATA(user.id),
        tokenTTL,
        JSON.stringify(response)
      );

      return response;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Token không hợp lệ', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // Get current token before logout
      const currentToken = await redis.get(CACHE_KEYS.USER_TOKEN(userId));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw new AuthError(error.message, 400);

      // Add current token to blacklist if it exists
      if (currentToken) {
        const ttl = await redis.ttl(CACHE_KEYS.USER_TOKEN(userId));
        if (ttl > 0) {
          await tokenBlacklist.add(currentToken, userId, ttl);
        }
      }

      await Promise.all([
        redis.del(CACHE_KEYS.USER_TOKEN(userId)),
        redis.del(CACHE_KEYS.USER_DATA(userId))
      ]);

      return;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) throw new AuthError(error.message, 400);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async resetPassword(token: string, newPassword: string, email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: 'recovery',
        email,
      });

      if (error) throw new AuthError('Token không hợp lệ hoặc đã hết hạn', 400);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new AuthError(updateError.message, 400);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }
}

export const authService = new AuthService();