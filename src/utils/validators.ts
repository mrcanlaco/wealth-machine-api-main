import { ZodSchema } from 'zod';

export function validate<T>(data: unknown, schema: ZodSchema<T>): T {
  return schema.parse(data);
}
