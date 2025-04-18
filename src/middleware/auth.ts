import { Context, Next } from 'hono';
import { authService } from '../services/auth.service';
import { AuthError } from '@/types/auth';

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Không có token');
    }

    const token = authHeader.split(' ')[1];
    const user = await authService.verifyToken(token);
    
    // Add user id and token to context
    c.set('userId', user.id);
    c.set('accessToken', token);
    c.set('user', user);
    
    await next();
  } catch (error: any) {
    if(error instanceof AuthError) { 
      throw error;
    }
    throw new AuthError('Không có quyền truy cập');
  }
}