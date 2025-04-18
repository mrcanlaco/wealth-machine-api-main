import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, refreshTokenSchema, registerSchema, requestResetSchema, resetPasswordSchema, updateProfileSchema } from '../types/auth';
import { register, login, refreshToken, logout, requestPasswordReset, resetPassword, getProfile, updateProfile } from '../controllers/auth.controllers';
import { authMiddleware } from '../middleware/auth';
import { createRateLimit } from '../middleware/rate-limit';

const authRoutes = new Hono();

// Rate limits
const loginLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 50 }); // 50 attempts per 15 minutes
const registerLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 30 }); // 30 attempts per hour
const resetLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 30 }); // 30 attempts per hour

// Register new user
authRoutes.post('/register', registerLimit, zValidator('json', registerSchema), register);

// Login user
authRoutes.post('/login', loginLimit, zValidator('json', loginSchema), login);

// Refresh token
authRoutes.post('/refresh-token', zValidator('json', refreshTokenSchema), refreshToken);

// Logout user
authRoutes.post('/logout', authMiddleware, logout);

// Request password reset
authRoutes.post('/request-reset', resetLimit, zValidator('json', requestResetSchema), requestPasswordReset);

// Reset password
authRoutes.post('/reset-password', resetLimit, zValidator('json', resetPasswordSchema), resetPassword);

// Update current user profile (chỉ cho phép sửa tên)
authRoutes.patch('/profile', authMiddleware, zValidator('json', updateProfileSchema), updateProfile);

// Get current user profile
authRoutes.get('/profile', authMiddleware, getProfile);

export default authRoutes;
