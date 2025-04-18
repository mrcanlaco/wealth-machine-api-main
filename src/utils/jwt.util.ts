import jwt from 'jsonwebtoken';
import { AuthError } from '@/types/auth';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET environment variable');
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  aud: string;
  iss: string;
}

export const jwtUtil = {
  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new AuthError('Token không hợp lệ', 401);
    }
  },

  decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  },

  isExpired(payload: JWTPayload): boolean {
    return payload.exp * 1000 < Date.now();
  },

  getRemainingTime(payload: JWTPayload): number {
    const now = Date.now();
    const exp = payload.exp * 1000;
    return Math.max(0, Math.floor((exp - now) / 1000));
  }
};
