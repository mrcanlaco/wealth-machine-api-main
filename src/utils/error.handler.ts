import { Context } from 'hono';
import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { AppError } from './app.error';
import { AuthError } from '../types/auth';
import { MachineError } from '@/types/machine';

export const errorHandler = async (err: Error, c: Context) => {
  // Handle Zod validation errors
  if (err instanceof ZodError || err.constructor.name === 'ZodError') {
    const errors = 'errors' in err && Array.isArray(err.errors) ? err.errors : [];
    const message = errors.length > 0 
      ? errors.map(e => `${(e as any).path.join('.')}: ${(e as any).message}`).join(', ')
      : 'Validation failed';
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: message
      }
    }, 400);
  }

  // Handle Auth errors
  if (err instanceof AuthError) {
    return c.json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: err.message
      }
    }, err.statusCode || 401);
  }

    // Handle Auth errors
    if (err instanceof MachineError) {
      return c.json({
        success: false,
        error: {
          code: 'MACHINE_ERROR',
          message: err.message
        }
      }, err.statusCode || 400);
    }

  // Handle application specific errors
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    }, err.statusCode);
  }

  // Handle Hono HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: 'HTTP_ERROR',
        message: err.message
      }
    }, err.status);
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    }
  }, 500);
}
