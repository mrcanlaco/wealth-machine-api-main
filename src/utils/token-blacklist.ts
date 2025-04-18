import { redis } from '@/providers/redis';

const BLACKLIST_PREFIX = 'token:blacklist:';

export const tokenBlacklist = {
  async add(token: string, userId: string, ttl: number): Promise<void> {
    const key = `${BLACKLIST_PREFIX}${userId}:${token}`;
    await redis.setex(key, ttl, '1');
  },

  async isBlacklisted(token: string, userId: string): Promise<boolean> {
    const key = `${BLACKLIST_PREFIX}${userId}:${token}`;
    return (await redis.exists(key)) === 1;
  },

  async removeAll(userId: string): Promise<void> {
    const pattern = `${BLACKLIST_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};
