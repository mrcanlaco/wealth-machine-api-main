import { Context, Next } from 'hono';
import { redis } from '@/providers/redis';

export interface RateLimitConfig {
  windowMs: number;  // Thời gian cửa sổ (ms)
  max: number;       // Số request tối đa trong cửa sổ
}

export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimit(c: Context, next: Next) {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const key = `ratelimit:${ip}:${c.req.path}`;
    
    const current = await redis.incr(key);
    
    // Set expiry for new keys
    if (current === 1) {
      await redis.pexpire(key, config.windowMs);
    }
    
    if (current > config.max) {
      return c.json({ 
        success: false, 
        message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' 
      }, 429);
    }
    
    return await next();
  };
}
