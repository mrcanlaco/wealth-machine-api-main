import { Context } from 'hono';
import { notificationService } from '@/services/notification.service';
import { ResponseHandler } from '@/utils/response.handler';
import { CreateNotificationInput } from '@/types/notification';

// Lấy danh sách thông báo của user (có phân trang)
export async function getNotifications(c: Context) {
  try {
    const user = c.get('user');
    const page = Number(c.req.query('page') || 1);
    const pageSize = Number(c.req.query('pageSize') || 10);
    const notifications = await notificationService.getNotifications(user.id, page, pageSize);
    return ResponseHandler.success(c, notifications, 'Lấy danh sách thông báo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

// Tạo thông báo mới
export async function createNotification(c: Context) {
  try {
    const body = await c.req.json() as CreateNotificationInput;
    const notification = await notificationService.createNotification(body);
    return ResponseHandler.success(c, notification, 'Tạo thông báo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

// Đánh dấu đã đọc thông báo
export async function markAsRead(c: Context) {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const notification = await notificationService.markAsRead(user.id, id);
    return ResponseHandler.success(c, notification, 'Đã đánh dấu đã đọc');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

// Xóa thông báo
export async function deleteNotification(c: Context) {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    await notificationService.deleteNotification(user.id, id);
    return ResponseHandler.success(c, null, 'Xóa thông báo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
