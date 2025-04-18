import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
  type: z.string().default('info'),
  is_read: z.boolean().default(false),
  created_at: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  is_read: true,
  created_at: true,
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
