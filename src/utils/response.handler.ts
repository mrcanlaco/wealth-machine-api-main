import { Context } from 'hono';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class ResponseHandler {
  static success<T>(c: Context, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    return c.json(response, statusCode);
  }

  static error(c: Context, message: string, code: string = 'ERROR', statusCode: number = 400): Response {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code,
        message
      }
    };
    return c.json(response, statusCode);
  }
}
