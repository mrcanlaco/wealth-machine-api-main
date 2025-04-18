import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('Missing Redis environment variables');
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
});

// Constants for cache keys and TTL
export const CACHE_KEYS = {
  USER_TOKEN: (userId: string) => `auth:token:${userId}`,
  USER_DATA: (userId: string) => `auth:user:${userId}`,
};

export const CACHE_TTL = {
  USER_TOKEN: 3600, // 1 hour
  USER_DATA: 3600 * 24, // 24 hours
};
