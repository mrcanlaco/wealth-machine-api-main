import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { getNotifications, createNotification, markAsRead, deleteNotification } from '../controllers/notification.controllers';
import { createNotificationSchema } from '../types/notification';

const notificationRoutes = new Hono();

// Lấy danh sách thông báo
notificationRoutes.get('/', authMiddleware, getNotifications);

// Tạo thông báo mới
notificationRoutes.post('/', authMiddleware, zValidator('json', createNotificationSchema), createNotification);

// Đánh dấu đã đọc
notificationRoutes.patch('/:id/read', authMiddleware, markAsRead);

// Xóa thông báo
notificationRoutes.delete('/:id', authMiddleware, deleteNotification);

export default notificationRoutes;
