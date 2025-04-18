export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Authentication related errors
export class AuthError extends AppError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

// Resource not found errors
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Permission related errors
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Validation errors (besides Zod validation)
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Business logic errors
export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BUSINESS_ERROR');
    this.name = 'BusinessError';
  }
}
